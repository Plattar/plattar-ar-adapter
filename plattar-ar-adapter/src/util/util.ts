/**
 * Static Utility Functions
 */
export class Util {
    private static readonly _cache: Map<string, any> = new Map();

    public static isValidServerLocation(server: string | null | undefined): boolean {
        if (!server) {
            return false;
        }

        switch (server.toLowerCase()) {
            case "staging.plattar.space":
            case "cdn-staging.plattar.space":
            case "staging":
            case "app.plattar.com":
            case "cdn.plattar.com":
            case "prod":
            case "production":
            case "review.plattar.com":
            case "review":
            case "qa":
            case "dev":
            case "developer":
            case "development":
            case "local":
            case "localhost":
                return true;
        }

        return false;
    }

    public static canAugment(): boolean {
        if (Util._cache.has('canAugment')) return Util._cache.get('canAugment');
        const result = Util.canQuicklook() || Util.canSceneViewer();
        Util._cache.set('canAugment', result);
        return result;
    }

    public static canQuicklook(): boolean {
        if (Util._cache.has('canQuicklook')) return Util._cache.get('canQuicklook');
        let result = false;
        if (Util.isIOS()) {
            const isWKWebView: boolean = Boolean((window && <any>window).webkit && (<any>window).webkit.messageHandlers);
            if (isWKWebView) {
                result = Boolean(/CriOS\/|EdgiOS\/|FxiOS\/|GSA\/|DuckDuckGo\//.test(navigator.userAgent));
            } else {
                const tempAnchor: HTMLAnchorElement = document.createElement("a");
                result = Boolean(tempAnchor.relList && tempAnchor.relList.supports && tempAnchor.relList.supports("ar"));
            }
        }
        Util._cache.set('canQuicklook', result);
        return result;
    }

    public static canSceneViewer(): boolean {
        if (Util._cache.has('canSceneViewer')) return Util._cache.get('canSceneViewer');
        const result = Util.isAndroid() && !Util.isFirefox() && !Util.isOculus();
        Util._cache.set('canSceneViewer', result);
        return result;
    }

    public static canRealityViewer(): boolean {
        if (Util._cache.has('canRealityViewer')) return Util._cache.get('canRealityViewer');
        const result = Util.isIOS() && Util.getIOSVersion()[0] >= 13;
        Util._cache.set('canRealityViewer', result);
        return result;
    }

    public static isSafariOnIOS(): boolean {
        if (Util._cache.has('isSafariOnIOS')) return Util._cache.get('isSafariOnIOS');
        const result = Util.isIOS() && Util.isSafari();
        Util._cache.set('isSafariOnIOS', result);
        return result;
    }

    public static isChromeOnIOS(): boolean {
        if (Util._cache.has('isChromeOnIOS')) return Util._cache.get('isChromeOnIOS');
        const result = Util.isIOS() && /CriOS\//.test(navigator.userAgent);
        Util._cache.set('isChromeOnIOS', result);
        return result;
    }

    public static isIOS(): boolean {
        if (Util._cache.has('isIOS')) return Util._cache.get('isIOS');
        const result = (/iPad|iPhone|iPod/.test(navigator.userAgent) && !(self as any).MSStream) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
        Util._cache.set('isIOS', result);
        return result;
    }

    public static isAndroid(): boolean {
        if (Util._cache.has('isAndroid')) return Util._cache.get('isAndroid');
        const result = /android/i.test(navigator.userAgent);
        Util._cache.set('isAndroid', result);
        return result;
    }

    public static isFirefox(): boolean {
        if (Util._cache.has('isFirefox')) return Util._cache.get('isFirefox');
        const result = /firefox/i.test(navigator.userAgent);
        Util._cache.set('isFirefox', result);
        return result;
    }

    public static isOculus(): boolean {
        if (Util._cache.has('isOculus')) return Util._cache.get('isOculus');
        const result = /OculusBrowser/.test(navigator.userAgent);
        Util._cache.set('isOculus', result);
        return result;
    }

    public static isSafari(): boolean {
        if (Util._cache.has('isSafari')) return Util._cache.get('isSafari');
        const result = Util.isIOS() && /Safari\//.test(navigator.userAgent);
        Util._cache.set('isSafari', result);
        return result;
    }

    public static getIOSVersion(): number[] {
        if (Util._cache.has('getIOSVersion')) return Util._cache.get('getIOSVersion');
        let result: number[] = [-1, -1, -1];
        if (/iP(hone|od|ad)/.test(navigator.platform)) {
            const v: RegExpMatchArray | null = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
            if (v !== null) {
                result = [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3], 10)];
            }
        } else if (/Mac/.test(navigator.platform)) {
            const v: RegExpMatchArray | null = (navigator.appVersion).match(/Version\/(\d+)\.(\d+)\.?(\d+)?/);
            if (v !== null) {
                result = [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3], 10)];
            }
        }
        Util._cache.set('getIOSVersion', result);
        return result;
    }

    public static getChromeVersion(): number {
        if (Util._cache.has('getChromeVersion')) return Util._cache.get('getChromeVersion');
        const raw: RegExpMatchArray | null = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
        const result = raw !== null ? parseInt(raw[2], 10) : 1;
        Util._cache.set('getChromeVersion', result);
        return result;
    }
}