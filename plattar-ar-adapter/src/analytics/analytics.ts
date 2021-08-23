import { Util } from "../util/util";
import { Server } from "@plattar/plattar-api";

export class Analytics {

    private readonly _map: Map<string, any>;

    constructor() {
        this._map = new Map<string, any>();

        this.push("event", "track");
        this.push("source", "embed");
        this.push("pageTitle", document.title);
        this.push("pageURL", location.href);
        this.push("referrer", document.referrer);
        this.push("user_id", this.getUserID());
        this.push("origin", Server.location().type);
    }

    public track(dataSet: any) {
        const url: string = Server.location().analytics;
        const data = dataSet || {};

        this.push("data", data);

        const xmlhttp: XMLHttpRequest = new XMLHttpRequest();
        xmlhttp.open("POST", url);
        xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xmlhttp.send(JSON.stringify(Object.fromEntries(this._map)));
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
        }

        if (!userID) {
            userID = Util.generateUUID();
            localStorage.setItem(key, userID);
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