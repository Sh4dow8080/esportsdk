export default class FlareSolverrClient {
    constructor(private flaresolverrUrl: string = "http://192.168.0.232:8191/v1") { }

    public async get<TResponse>(url: string): Promise<TResponse | null> {
        const command = {
            cmd: "request.get",
            url,
            maxTimeout: 60000
        };
        const response = await fetch(this.flaresolverrUrl, {
            body: JSON.stringify(command),
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) return null;
        if (response.status !== 200) return null;

        const responseJson = await response.json() as { solution: { status: number; url: string; response: TResponse } }
        if (responseJson.solution.status !== 200) return null;

        return responseJson.solution.response;
    }
}
