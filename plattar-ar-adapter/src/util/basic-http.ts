/**
 * Simple HTTP interaction module
 */
export default class BasicHTTP {
    public static get(protocol: string, path: string): Promise<any> {
        return new Promise<any>((accept, reject) => {
            const http: XMLHttpRequest = new XMLHttpRequest();
            http.open(protocol, path, true);

            http.onload = (e) => {
                if (http.status === 200) {
                    if (http.response) {
                        try {
                            const resp: any = JSON.parse(http.response);
                            return accept(resp);
                        }
                        catch (_err) { /* silent */ }
                    }

                    return accept({});
                }
                else {
                    return reject(e);
                }
            };

            http.onerror = (e) => {
                return reject(e);
            };

            http.send(null);
        });
    }
}