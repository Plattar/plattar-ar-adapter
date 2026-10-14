/**
 * Connects a host page to a Plattar configurator embedded in an iframe
 * (configurator.plattar.com) and exposes what the configurator reports:
 * configuration changes, on-demand reports and quote form submissions.
 *
 * The configurator talks to its host page with window.postMessage. This
 * helper does the handshake (retrying until the configurator has loaded and
 * again whenever the iframe reloads), only accepts messages from that iframe
 * and its origin, and confirms quote submissions back to the configurator so
 * the shopper only sees "sent" once the host's own handler has finished.
 */

/** One selection in the configurator, as shown in its options panel. */
export interface ConfiguratorSelection {
    productName: string;
    variationName: string;
    variationSku?: string;
    sceneProductId: string;
    variationId: string;
}

/** The configuration report: sent on every change and on request. */
export interface ConfiguratorReport {
    sceneId: string | null;
    selections: ConfiguratorSelection[];
    /** Restorable configuration state (a scene graph id or encoded state). */
    configurationState: string | null;
    /** Link back to this exact configuration. */
    shareUrl: string | null;
}

/** One line of the configurator summary. */
export interface ConfiguratorSummaryItem {
    product: string;
    selected: string;
    productSku?: string;
    variationSku?: string;
    price?: number;
    productId: string;
    sceneProductId: string;
    variationId: string;
    /** Swatch or thumbnail image URL. */
    image?: string;
}

/** Everything the summary shows when the quote form is submitted. */
export interface ConfiguratorSummary {
    title: string;
    items: ConfiguratorSummaryItem[];
    roomPlannerItems: Array<{
        product: string;
        selected?: string;
        productId: string;
        variationId?: string;
        dimensions?: { width: number; height: number; length: number };
    }>;
    customTextures: Array<{ product: string; texture: string }>;
    /** Present when the scene shows a combined SKU in its summary. */
    combinedSku?: string;
    /** Present when the scene shows prices. */
    priceTotal?: number;
    shareUrl: string;
    /** Summary preview image (a data URL). */
    previewImage?: string;
}

/** A quote form submission from the configurator summary. */
export interface QuoteSubmission {
    submissionId: string;
    submittedAt: string;
    form: { name: string; email: string; company: string };
    summary: ConfiguratorSummary;
    configuration: ConfiguratorReport;
}

/**
 * Return value of a quote handler: nothing (or true / { ok: true }) means the
 * enquiry was handled; { ok: false, message } shows that message to the
 * shopper instead of "sent". Throwing shows a generic error.
 */
export type QuoteHandlerResult = void | boolean | { ok: boolean; message?: string };

export type QuoteHandler = (submission: QuoteSubmission) => QuoteHandlerResult | Promise<QuoteHandlerResult>;

export interface ConfiguratorConnectionOptions {
    /** Configurator origin; defaults to the iframe's src origin. */
    origin?: string;
}

type EventMap = {
    connected: void;
    configurationchanged: ConfiguratorReport;
    report: ConfiguratorReport;
    quotesubmitted: QuoteSubmission;
};

const SETUP_RETRY_MS = 500;
const SETUP_MAX_TRIES = 60;
const REPORT_TIMEOUT_MS = 10000;

export class ConfiguratorConnection {
    private readonly _iframe: HTMLIFrameElement;
    private readonly _origin: string;
    private readonly _listeners: { [K in keyof EventMap]?: Array<(data: EventMap[K]) => void> } = {};
    private readonly _pendingReports: Array<(report: ConfiguratorReport) => void> = [];
    private _quoteHandler: QuoteHandler | null = null;
    private _connected = false;
    private _setupTimer: ReturnType<typeof setInterval> | null = null;
    private _readyResolve: (() => void) | null = null;
    private _ready: Promise<void>;

    private readonly _onMessage = (event: MessageEvent) => this._handleMessage(event);
    private readonly _onLoad = () => this._startHandshake();

    /**
     * Connects to the configurator in the given iframe (an element or its id).
     */
    public static connect(iframe: HTMLIFrameElement | string, options: ConfiguratorConnectionOptions = {}): ConfiguratorConnection {
        const element = typeof iframe === "string" ? document.getElementById(iframe) : iframe;

        if (!element || element.tagName !== "IFRAME") {
            throw new Error("ConfiguratorConnection.connect() - expected the configurator <iframe> element or its id");
        }

        return new ConfiguratorConnection(element as HTMLIFrameElement, options);
    }

    private constructor(iframe: HTMLIFrameElement, options: ConfiguratorConnectionOptions) {
        this._iframe = iframe;
        this._origin = options.origin || new URL(iframe.src, window.location.href).origin;
        this._ready = new Promise<void>((resolve) => { this._readyResolve = resolve; });

        window.addEventListener("message", this._onMessage);
        iframe.addEventListener("load", this._onLoad);

        this._startHandshake();
    }

    /** True once the configurator has confirmed the connection. */
    public get connected(): boolean {
        return this._connected;
    }

    /** Resolves once the configurator has confirmed the connection. */
    public ready(): Promise<void> {
        return this._ready;
    }

    /** Listens for a configurator event. Returns a function that removes the listener. */
    public on<K extends keyof EventMap>(eventName: K, listener: (data: EventMap[K]) => void): () => void {
        const list = (this._listeners[eventName] = this._listeners[eventName] || []) as Array<(data: EventMap[K]) => void>;
        list.push(listener);

        return () => {
            const index = list.indexOf(listener);

            if (index >= 0) {
                list.splice(index, 1);
            }
        };
    }

    /**
     * Handles quote form submissions. While a handler is set, the configurator
     * waits for it instead of opening an email: when it finishes the shopper sees
     * "sent", and if it throws (or returns { ok: false, message }) they see an error.
     * Pass null to go back to the configurator's own email behaviour.
     */
    public onQuoteSubmitted(handler: QuoteHandler | null): void {
        this._quoteHandler = handler;
        // tell the configurator whether this page now handles quotes
        this._startHandshake();
    }

    /** Asks the configurator for its current configuration. */
    public async getReport(): Promise<ConfiguratorReport> {
        await this._ready;

        return new Promise<ConfiguratorReport>((resolve, reject) => {
            const timer = setTimeout(() => {
                const index = this._pendingReports.indexOf(done);

                if (index >= 0) {
                    this._pendingReports.splice(index, 1);
                }

                reject(new Error("ConfiguratorConnection.getReport() - the configurator did not respond"));
            }, REPORT_TIMEOUT_MS);

            const done = (report: ConfiguratorReport) => {
                clearTimeout(timer);
                resolve(report);
            };

            this._pendingReports.push(done);
            this._post("getreport");
        });
    }

    /** Stops listening to the configurator. */
    public disconnect(): void {
        window.removeEventListener("message", this._onMessage);
        this._iframe.removeEventListener("load", this._onLoad);
        this._stopHandshake();
        this._connected = false;
    }

    private _startHandshake(): void {
        this._stopHandshake();

        let tries = 0;
        const send = () => {
            if (tries++ >= SETUP_MAX_TRIES) {
                this._stopHandshake();
                console.warn("ConfiguratorConnection - the configurator did not respond to the connection request");
                return;
            }

            this._post("setup", { handlesQuote: this._quoteHandler !== null });
        };

        send();
        this._setupTimer = setInterval(send, SETUP_RETRY_MS);
    }

    private _stopHandshake(): void {
        if (this._setupTimer) {
            clearInterval(this._setupTimer);
            this._setupTimer = null;
        }
    }

    private _post(eventName: string, data: any = {}): void {
        const target = this._iframe.contentWindow;

        if (target) {
            target.postMessage({ eventName: eventName, data: data }, this._origin);
        }
    }

    private _emit<K extends keyof EventMap>(eventName: K, data: EventMap[K]): void {
        (this._listeners[eventName] || []).slice().forEach((listener) => {
            try {
                (listener as (data: EventMap[K]) => void)(data);
            }
            catch (err) {
                console.error(err);
            }
        });
    }

    private _handleMessage(event: MessageEvent): void {
        if (event.origin !== this._origin || event.source !== this._iframe.contentWindow) {
            return;
        }

        const message = event.data;

        if (!message || typeof message !== "object" || typeof message.eventName !== "string") {
            return;
        }

        switch (message.eventName) {
            case "setupconfirm":
                this._stopHandshake();

                if (!this._connected) {
                    this._connected = true;

                    if (this._readyResolve) {
                        this._readyResolve();
                    }

                    this._emit("connected", undefined);
                }
                break;
            case "configurationchanged":
                this._emit("configurationchanged", message.data as ConfiguratorReport);
                break;
            case "report": {
                const report = message.data as ConfiguratorReport;
                const pending = this._pendingReports.splice(0, this._pendingReports.length);

                pending.forEach((resolve) => resolve(report));
                this._emit("report", report);
                break;
            }
            case "quotesubmitted":
                this._handleQuote(message.data as QuoteSubmission);
                break;
        }
    }

    private async _handleQuote(submission: QuoteSubmission): Promise<void> {
        this._emit("quotesubmitted", submission);

        const handler = this._quoteHandler;

        if (!handler) {
            return;
        }

        let ok = true;
        let message: string | undefined = undefined;

        try {
            const result = await handler(submission);

            if (result === false) {
                ok = false;
            }
            else if (result && typeof result === "object") {
                ok = result.ok !== false;
                message = result.message;
            }
        }
        catch (err) {
            console.error(err);
            ok = false;
        }

        this._post("quotereceived", { submissionId: submission.submissionId, ok: ok, message: message });
    }
}
