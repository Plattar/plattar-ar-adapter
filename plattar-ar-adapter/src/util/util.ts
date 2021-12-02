/**
 * Static Utility Functions
 */
export class Util {

    public static canAugment(): boolean {
        const userAgent: string = navigator.userAgent;

        // test google chrome on IOS and standard IOS test
        if ((/CriOS/i.test(userAgent) || /Macintosh|iPad|iPhone|iPod/.test(userAgent)) && !(<any>window).MSStream) {
            // inside facebook browser
            if (/\bFB[\w_]+\//.test(userAgent)) {
                return false;
            }

            // inside instagram browser
            if (/\bInstagram/i.test(userAgent)) {
                return false;
            }

            return Util.canQuicklook();
        }
        else if (/android/i.test(userAgent)) {
            return true;
        }

        return false;
    }

    public static canQuicklook(): boolean {
        const tempAnchor: HTMLAnchorElement = document.createElement("a");

        return tempAnchor.relList &&
            tempAnchor.relList.supports &&
            tempAnchor.relList.supports("ar");
    }

    public static canSceneViewer(): boolean {
        return Util.canAugment() && /android/i.test(navigator.userAgent);
    }

    public static canRealityViewer(): boolean {
        if (!Util.canAugment()) {
            return false;
        }

        if (/Macintosh|iPad|iPhone|iPod/.test(navigator.userAgent) && !(<any>window).MSStream) {
            if (Util.isSafari() && Util.getIOSVersion()[0] >= 13) {
                return true;
            }
        }

        return false;
    }

    public static isSafari(): boolean {
        if (navigator.vendor && navigator.userAgent) {
            return navigator.vendor.indexOf("Apple") > -1 &&
                navigator.userAgent.indexOf("CriOS") === -1 &&
                navigator.userAgent.indexOf("FxiOS") === -1;
        }

        return false;
    }

    public static isChromeOnIOS(): boolean {
        const userAgent: string = navigator.userAgent;

        if (userAgent) {
            return Util.canAugment() && /CriOS/i.test(userAgent);
        }

        return false;
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