import CSStatsClient, { type PlayerStat } from "./csstatsClient.ts";
import EsportsClient from "./esportsClient.ts";
import FlareSolverrClient from "./FlareSolverrClient.ts";

const client = new EsportsClient();
const flareSolverrClient = new FlareSolverrClient("http://192.168.0.232:8191/v1");
const statsClient = new CSStatsClient(flareSolverrClient);

const team = await client.getTeam("620");

const players = await Promise.all(team?.profiles.map(profile => client.getProfile(profile.profileId)) ?? []);
const steamIds = players.map(player => ({ nickname: player?.nickname, steamId: player?.gameIds.find(game => game.name === "steam")?.id })).filter(player => player.steamId) as { nickname: string; steamId: string }[];

const result: Record<string, PlayerStat | null> = {};
for await (const player of steamIds) {
    try {
        console.log(`Getting stats for ${player.nickname}`);

        const playerStats = await statsClient.getPlayer(player.steamId);
        result[player.steamId] = playerStats;
    } catch {
        console.error(`Failed to get stats for ${player.nickname}`);
        result[player.steamId] = null;
    }
}

console.log(result);

Deno.writeTextFile("stats.json", JSON.stringify(result, null, 2));