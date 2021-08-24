import Util from "../util/util";
import { Server } from "@plattar/plattar-api";

export default class Analytics {

    private readonly _map: Map<string, any>;

    constructor() {
        this._map = new Map<string, any>();

        this.push("source", "embed");
        this.push("pageTitle", document.title);
        this.push("pageURL", location.href);
        this.push("referrer", document.referrer);
        this.push("user_id", this.getUserID());
    }

    public track(dataSet: any | undefined | null = null) {
        const url: string = Server.location().analytics;
        const data = dataSet || {};

        const dims: any = Object.fromEntries(this._map);
        const cData: any = Object.assign(data, dims);

        const analytic: any = {
            event: "track",
            origin: Server.location().type,
            application_id: data.applicationId,
            data: cData
        };

        // NOTE - Consider switching this to navigator.sendBeacon which is designed
        // for sending analytics data even when page is unloaded
        // see https://stackoverflow.com/questions/40523469/navigator-sendbeacon-to-pass-header-information
        // see https://developer.mozilla.org/en-US/docs/Web/API/Beacon_API
        try {
            const xmlhttp: XMLHttpRequest = new XMLHttpRequest();
            xmlhttp.open("POST", url);
            xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xmlhttp.send(JSON.stringify(analytic));
        }
        catch (err) {
            console.error("Analytics.track() - Error during POST - " + err);
        }
    }

    public push(key: string, value: any): void {
        this._map.set(key, value);
    }

    public getUserID(): string {
        const key: string = "plattar_user_id";
        let userID: string | null = null;

        try {
            userID = localStorage.getItem(key);
        }
        catch (err) {
            userID = Util.generateUUID();

            // try storing if just generated
            try {
                localStorage.setItem(key, userID);
            }
            catch (_err) {/* silent */ }
        }

        if (!userID) {
            userID = Util.generateUUID();

            // try storing if just generated
            try {
                localStorage.setItem(key, userID);
            }
            catch (_err) { /*silent */ }
        }

        return userID;
    }

    public startRecordEngagement(): void {
        let time: Date;

        const handlePageHide = () => {
            if (document.visibilityState === "hidden") {
                time = new Date();
            }
            else {
                const time2 = new Date();
                const diff = time2.getTime() - time.getTime();

                this.track({
                    eventAction: "View Time",
                    viewTime: diff,
                    eventLabel: diff
                });

                document.removeEventListener("visibilitychange", handlePageHide, false);
            }
        };

        document.addEventListener("visibilitychange", handlePageHide, false);
    }
}