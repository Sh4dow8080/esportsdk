import { load } from "cheerio";
import type FlareSolverrClient from "./FlareSolverrClient.ts";

export default class CSStatsClient {
    private readonly BASE_URL = "https://csstats.gg";
    private readonly STATS_KEYWORD = "var stats = ";
    private readonly NO_DATA_KEYWORD = "No matches have been added for this player";

    constructor(private flareSolverrClient: FlareSolverrClient) { }

    public async getPlayer(steamId: string) {
        const htmlBody = await this.flareSolverrClient.get<string>(this.BASE_URL + "/player/" + steamId);
        if (!htmlBody) return null;

        if (htmlBody.includes(this.NO_DATA_KEYWORD)) return null;

        const $ = load(htmlBody);
        const scripts = $("script").toArray();

        const statsObject = $(scripts.find(script => $(script).text().includes(this.STATS_KEYWORD))).text().split(this.STATS_KEYWORD)[1].split(";")[0];
        const parsed = JSON.parse(statsObject) as PlayerStat;

        return parsed;
    }
}

export interface PlayerStat {
    overall: Overall
    totals: Totals
    rank: number
    comp_wins: number
    last: string
    weapons: Weapons
    maps: Maps
    past10: Past10[]
    best: Best
    matches: number[]
}

interface Overall {
    wr: number
    adr: number
    hs: number
    kpd: number
    rating: number
    "1v1": number
    "1v2": number
    "1v3": number
    "1v4": number
    "1v5": number
    "1vX": number
    delta: Delta
}

interface Delta {
    wr: number
    adr: number
    hs: number
    kpd: number
    rating: number
    "1v1": number
    "1v2": number
    "1v3": number
    "1v4": number
    "1v5": number
    "1vX": number
}

interface Totals {
    overall: {
        ct_rounds: number
        t_rounds: number
        adr: number
        games: number
        wins: number
        losses: number
        draws: number
        rounds: number
        HS: number
        K: number
        D: number
        A: number
        dmg: number
        rating: number
        FK: number
        FD: number
        FK_T_SPR: number
        FD_T_SPR: number
        FK_CT_SPR: number
        FD_CT_SPR: number
        FK_T: number
        FD_T: number
        FD_T_NOKILL: number
        FK_CT: number
        FD_CT: number
        FD_CT_NOKILL: number
        "1v1": number
        "1v1_lost": number
        "1v2": number
        "1v2_lost": number
        "1v3": number
        "1v3_lost": number
        "1v4": number
        "1v4_lost": number
        "1v5": number
        "1v5_lost": number
        rank: number
        last: number
        delta: unknown[]
    }
}

interface Weapons {
    overall: {
        elite: WeaponStat
        glock: WeaponStat
        smokegrenade: WeaponStat
        hegrenade: WeaponStat
        sg556: WeaponStat
        ak47: WeaponStat
        flashbang: WeaponStat
        molotov: WeaponStat
        knife: WeaponStat
        aug: WeaponStat
        incgrenade: WeaponStat
        mp7: WeaponStat
        tec9: WeaponStat
        famas: WeaponStat
        galilar: WeaponStat
        m4a1_silencer: WeaponStat
        usp_silencer: WeaponStat
        p90: WeaponStat
        inferno: WeaponStat
        mac10: WeaponStat
        xm1014: WeaponStat
        mp9: WeaponStat
        m4a1: WeaponStat
        mp5sd: WeaponStat
        decoy: WeaponStat
        fiveseven: WeaponStat
        awp: WeaponStat
        p250: WeaponStat
        g3sg1: WeaponStat
        deagle: WeaponStat
        taser: WeaponStat
        scar20: WeaponStat
        mag7: WeaponStat
        ump45: WeaponStat
        hkp2000: WeaponStat
    }
}

interface WeaponStat {
    kills: number
    headshot: number
    shots: number
    hits: number
    dmg: number
    overkill: number
    hitgroups: Record<string, number>
}


interface Maps {
    overall: {
        de_inferno: MapStat
        de_nuke: MapStat
        de_overpass: MapStat
        de_ancient: MapStat
        de_anubis: MapStat
        de_vertigo: MapStat
        de_mills: MapStat
        de_mirage: MapStat
        de_dust2: MapStat
        de_thera: MapStat
        cs_office: MapStat
    }
}

interface MapStat {
    played: number
    won: number
    rounds_for: number
    rounds_against: number
    ct_rounds_for: number
    ct_rounds_against: number
    t_rounds_for: number
    t_rounds_against: number
}

interface Past10 {
    result: string
    map: string
    map_crc: number
    score: string
    rank: number
    rank_up: number
    adr: number
    hs: number
    rating: number
    kd: number
    kpd: number
}

interface Best {
    rank: number
    kpd: number
    rating: number
    adr: number
    hs: number
    clutches_won: number
}
