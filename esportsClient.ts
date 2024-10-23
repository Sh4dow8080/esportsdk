import { load } from 'npm:cheerio';

export type Team = {
    name: string;
    shortName: string;
    profiles: PartialProfile[];
}

export type PartialProfile = Omit<Profile, "gameIds" | "profilePicture">;

export type Profile = {
    profileId: string;
    profilePicture: string;
    gameIds: { name: string, id: string }[];
    name: string;
    nickname: string;
    firstName: string;
    lastName: string;
}

export default class EsportsClient {
    private readonly BASE_URL = "https://esport.dk";

    public async getTeam(teamId: string): Promise<Team | null> {
        const request = await fetch(this.BASE_URL + "/team/" + teamId);
        if (!request.ok) return null;

        const bodyHtml = await request.text();
        const $ = load(bodyHtml);

        const profileElements = $("a[href*='/profile/']");
        const profiles = profileElements.map((_, profileEl) => {
            const url = profileEl.attribs.href;
            const profileId = url.split("/").pop()!;
            const nameContainer = $(profileEl).find("div").first().find("div").first().text();
            const cleanedName = cleanText(nameContainer);

            const { nickname,
                firstName,
                lastName,
                fullName } = formatProfileName(cleanedName);

            return { url, profileId, name: fullName, nickname, firstName, lastName };
        }).get();

        const teamElement = $(".rounded.border.overflow-hidden.bg-white.shadow-md > .divide-y")
        const teamShortName = cleanText(teamElement.find("div").eq(12).text());
        const teamName = cleanText(teamElement.find("div").eq(10).text());

        return { profiles, name: teamName, shortName: teamShortName };
    }

    public async getProfile(profileId: string): Promise<Profile | null> {
        const request = await fetch(this.BASE_URL + "/profile/" + profileId);
        if (!request.ok) return null;

        const bodyHtml = await request.text();
        const $ = load(bodyHtml);

        const userContainerElement = $(".grid.grid-cols-2.gap-4 > :nth-child(1)");
        const profilePicture = userContainerElement.find("div[style*='background-image']").attr("style")?.split("url(")[1].split(")")[0].replaceAll("'", "")!;
        const name = cleanText(userContainerElement.find("div").eq(3).text());
        const { nickname,
            firstName,
            lastName,
            fullName } = formatProfileName(name);

        const gameIdElements = $(".grid.grid-cols-2.gap-4 > :nth-child(2) > .divide-y");
        const gameIds = gameIdElements.map((_, el) => {
            const name = cleanText($(el).find("div").eq(1).text()).replace(/ :$/, "").toLocaleLowerCase().replaceAll(" ", "_")
            const id = cleanText($(el).find("div").eq(2).text());

            return { name, id };
        }).get();

        return { gameIds, profilePicture, name: fullName, nickname, firstName, lastName, profileId };
    }
}

function cleanText(text: string) {
    return text.replace(/\s{2,}/g, ' ').replaceAll("\n", "").trim();
}

function formatProfileName(name: string) {
    const nickname = name.split("\"")[1];
    const firstName = name.split("\"")[0].trim();
    const lastName = name.split("\"").slice(2).map(m => m.trim()).join("\"");
    const fullName = firstName + " " + lastName;

    return { fullName, nickname, firstName, lastName };
}