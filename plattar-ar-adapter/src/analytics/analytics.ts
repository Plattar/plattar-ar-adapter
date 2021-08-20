import { Util } from "../util/util";
import { Server } from "@plattar/plattar-api";

interface AnalyticsDimensions {
    source: string;
    pageTitle: string;
    pageURL: string;
    referrer: string;
    user_id: string;
}

export class Analytics {
    private static readonly _DIMS = {
        source: "embed",
        pageTitle: document.title,
        pageURL: location.href,
        referrer: document.referrer,
        user_id: Analytics.getUserID()
    };

    public static track(dataSet: any) {
        const dimensions: AnalyticsDimensions = Analytics.getDimensions();

        const url: string = Server.location().analytics;
        const data = dataSet || {};

        Object.assign(data, dimensions);

        const analytic = {
            event: "track",
            application_id: data.applicationId,
            origin: Server.location().type,
            data: data
        };

        const xmlhttp: XMLHttpRequest = new XMLHttpRequest();
        xmlhttp.open("POST", url);
        xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xmlhttp.send(JSON.stringify(analytic));
    }

    public static getUserID(): string {
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

    public static getDimensions(): AnalyticsDimensions {
        return Analytics._DIMS;
    }

    public static startRecordEngagement(): void {
        let time: Date;

        const handlePageHide = () => {
            if (document.visibilityState === "hidden") {
                time = new Date();
            }
            else {
                const time2 = new Date();
                const diff = time2.getTime() - time.getTime();

                Analytics.track({
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