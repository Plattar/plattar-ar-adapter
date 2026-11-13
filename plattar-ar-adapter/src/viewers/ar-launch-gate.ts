/**
 * iOS only opens AR Quick Look from an <a rel="ar"> click while the shopper's tap is still
 * fresh. When the AR file has to be fetched or generated first (scene API, xrutils, converter),
 * the tap can expire before the click; Safari then opens the .usdz as a normal page with a
 * 3D preview instead of launching AR.
 *
 * ARLaunchGate tracks the last user interaction and, when a launch is no longer close enough
 * to it, shows a small prompt so AR is opened from a fresh tap instead.
 */

// how long after a tap we still launch AR directly. Safari's real limit is not documented
// (about 1s in WebKit discussions), so stay under it - a needless prompt costs one tap,
// a late click lands the user on the .usdz file page instead of AR
const MAX_GESTURE_AGE_MS: number = 800;

let lastGestureTime: number = -1;

if (typeof window !== "undefined" && window.addEventListener) {
    const record = () => {
        lastGestureTime = performance.now();
    };

    ["pointerdown", "touchend", "mousedown", "click", "keydown"].forEach((type: string) => {
        window.addEventListener(type, record, { capture: true, passive: true });
    });
}

export interface ARLaunchPromptText {
    readonly title: string;
    readonly button: string;
}

export class ARLaunchGate {

    /**
     * true if an AR launch right now would still count as part of the user's last tap
     */
    public static hasFreshGesture(): boolean {
        const activation: any = (<any>navigator).userActivation;

        if (activation && activation.isActive === false) {
            return false;
        }

        if (lastGestureTime < 0) {
            return false;
        }

        return (performance.now() - lastGestureTime) <= MAX_GESTURE_AGE_MS;
    }

    /**
     * Runs the launch straight away when the user's tap is still fresh, otherwise shows a
     * prompt and runs the launch from the prompt's button tap
     */
    public static launch(launch: () => void, text: ARLaunchPromptText): void {
        if (ARLaunchGate.hasFreshGesture()) {
            launch();
            return;
        }

        ARLaunchGate.showPrompt(launch, text);
    }

    private static showPrompt(launch: () => void, text: ARLaunchPromptText): void {
        const existing: HTMLElement | null = document.getElementById("plattar-ar-launch-prompt");

        if (existing) {
            existing.remove();
        }

        const host: HTMLDivElement = document.createElement("div");
        host.id = "plattar-ar-launch-prompt";
        host.style.cssText = "position:fixed;inset:0;z-index:2147483647;";

        const root: ShadowRoot | HTMLDivElement = host.attachShadow ? host.attachShadow({ mode: "open" }) : host;

        root.innerHTML = `
<style>
    .backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.45); display: flex; align-items: center; justify-content: center; padding: 16px; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif; }
    .card { position: relative; background: #ffffff; color: #111111; border-radius: 16px; padding: 28px 24px 22px; width: 100%; max-width: 320px; box-sizing: border-box; text-align: center; box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25); }
    .title { margin: 0 0 18px; font-size: 17px; line-height: 1.35; font-weight: 600; }
    .launch { display: block; width: 100%; border: 0; border-radius: 999px; background: #111111; color: #ffffff; font: inherit; font-size: 16px; font-weight: 600; padding: 14px 20px; cursor: pointer; -webkit-appearance: none; appearance: none; }
    .close { position: absolute; top: 6px; right: 6px; width: 36px; height: 36px; border: 0; background: transparent; color: #666666; font-size: 22px; line-height: 36px; cursor: pointer; -webkit-appearance: none; appearance: none; }
</style>
<div class="backdrop" part="backdrop">
    <div class="card" role="dialog" aria-modal="true" aria-labelledby="plattar-ar-title">
        <button class="close" type="button" aria-label="Close">&times;</button>
        <p class="title" id="plattar-ar-title"></p>
        <button class="launch" type="button"></button>
    </div>
</div>`;

        const title: HTMLElement | null = root.querySelector(".title");
        const button: HTMLButtonElement | null = root.querySelector(".launch");
        const close: HTMLButtonElement | null = root.querySelector(".close");
        const backdrop: HTMLElement | null = root.querySelector(".backdrop");

        if (title) {
            title.textContent = text.title;
        }

        if (button) {
            button.textContent = text.button;
            button.addEventListener("click", (event: Event) => {
                event.stopPropagation();
                host.remove();
                // runs inside this tap, so iOS opens AR Quick Look directly
                launch();
            });
        }

        const dismiss = (event: Event) => {
            event.stopPropagation();
            host.remove();
        };

        if (close) {
            close.addEventListener("click", dismiss);
        }

        if (backdrop) {
            backdrop.addEventListener("click", (event: Event) => {
                if (event.target === backdrop) {
                    dismiss(event);
                }
            });
        }

        document.body.appendChild(host);

        if (button) {
            button.focus();
        }
    }
}
