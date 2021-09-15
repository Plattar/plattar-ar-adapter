const _lut: string[] = [];

for (let i = 0; i < 256; i++) {
    _lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
}

/**
 * Static Utility Functions
 */
export class Util {

    public static canAugment(): boolean {
        if (/Macintosh|iPad|iPhone|iPod/.test(navigator.userAgent) && !(<any>window).MSStream) {
            // inside facebook browser
            if (/\bFB[\w_]+\//.test(navigator.userAgent)) {
                return false;
            }

            // inside instagram browser
            if (/\bInstagram/i.test(navigator.userAgent)) {
                return false;
            }

            return Util.canQuicklook();
        }
        else if (/android/i.test(navigator.userAgent)) {
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

    public static generateUUID(): string {
        const d0: number = Math.random() * 0xffffffff | 0;
        const d1: number = Math.random() * 0xffffffff | 0;
        const d2: number = Math.random() * 0xffffffff | 0;
        const d3: number = Math.random() * 0xffffffff | 0;

        const uuid: string = _lut[d0 & 0xff] + _lut[d0 >> 8 & 0xff] + _lut[d0 >> 16 & 0xff] + _lut[d0 >> 24 & 0xff] + '-' +
            _lut[d1 & 0xff] + _lut[d1 >> 8 & 0xff] + '-' + _lut[d1 >> 16 & 0x0f | 0x40] + _lut[d1 >> 24 & 0xff] + '-' +
            _lut[d2 & 0x3f | 0x80] + _lut[d2 >> 8 & 0xff] + '-' + _lut[d2 >> 16 & 0xff] + _lut[d2 >> 24 & 0xff] +
            _lut[d3 & 0xff] + _lut[d3 >> 8 & 0xff] + _lut[d3 >> 16 & 0xff] + _lut[d3 >> 24 & 0xff];

        return uuid.toLowerCase();
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