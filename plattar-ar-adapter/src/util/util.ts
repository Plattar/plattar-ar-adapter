/**
 * Static Utility Functions
 */
export class Util {
    public static canAugment(): boolean {
        return Util.canQuicklook() || Util.canSceneViewer();
    }

    public static canQuicklook(): boolean {
        if (Util.isIOS()) {
            const isWKWebView: boolean = Boolean((window && <any>window).webkit && (<any>window).webkit.messageHandlers);

            if (isWKWebView) {
                return Boolean(/CriOS\/|EdgiOS\/|FxiOS\/|GSA\/|DuckDuckGo\//.test(navigator.userAgent));
            }

            const tempAnchor: HTMLAnchorElement = document.createElement("a");

            return tempAnchor.relList && tempAnchor.relList.supports && tempAnchor.relList.supports("ar");
        }

        return false;
    }

    public static canSceneViewer(): boolean {
        return Util.isAndroid() && !Util.isFirefox() && !Util.isOculus();
    }

    public static canRealityViewer(): boolean {
        return Util.isIOS() && Util.getIOSVersion()[0] >= 13;
    }

    public static isSafariOnIOS(): boolean {
        return Util.isIOS() && Util.isSafari();
    }

    public static isChromeOnIOS(): boolean {
        return Util.isIOS() && /CriOS\//.test(navigator.userAgent);
    }

    public static isIOS(): boolean {
        return (/iPad|iPhone|iPod/.test(navigator.userAgent) && !(self as any).MSStream) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    }

    public static isAndroid(): boolean {
        return /android/i.test(navigator.userAgent);
    }

    public static isFirefox(): boolean {
        return /firefox/i.test(navigator.userAgent);
    }

    public static isOculus(): boolean {
        return /OculusBrowser/.test(navigator.userAgent);
    }

    public static isSafari(): boolean {
        return Util.isIOS() && /Safari\//.test(navigator.userAgent);
    }

    public static getIOSVersion(): number[] {
        if (/iP(hone|od|ad)/.test(navigator.platform)) {
            const v: RegExpMatchArray | null = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);

            if (v !== null) {
                return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3], 10)];
            }
        }

        if (/Mac/.test(navigator.platform)) {
            const v: RegExpMatchArray | null = (navigator.appVersion).match(/Version\/(\d+)\.(\d+)\.?(\d+)?/);

            if (v !== null) {
                return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3], 10)];
            }
        }

        return [-1, -1, -1];
    }

    public static getChromeVersion(): number {
        const raw: RegExpMatchArray | null = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);

        if (raw !== null) {
            return parseInt(raw[2], 10);
        }

        return 1;
    }
}