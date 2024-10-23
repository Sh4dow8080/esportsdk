import type { PlayerStat } from "./csstatsClient.ts";
import _stats from './stats.json' with { type: "json" };

// deno-lint-ignore no-explicit-any
const stats: Record<string, PlayerStat> = _stats as any;

const mostWonMap: Map<string, number> = new Map();
let averageKd: number = 0;
let maxKd = 0;
let maxKdPlayer = "";

for (const player in stats) {
    const playerStats = stats[player];
    if (playerStats.maps?.overall) {
        for (const map in playerStats.maps.overall) {
            const mapValue = playerStats.maps.overall[map as keyof typeof playerStats.maps.overall];
            if (!mostWonMap.has(map)) {
                mostWonMap.set(map, 0);
            }

            mostWonMap.set(map, mostWonMap.get(map)! + mapValue.won);
        }
    } else {
        console.log(`No map data for ${player}`, playerStats)
    }

    averageKd += playerStats.overall.kpd;

    if (playerStats.overall.kpd > maxKd) {
        maxKd = playerStats.overall.kpd;
        maxKdPlayer = player;
    }
}

const sortedMostWonMap = new Map(
    [...mostWonMap.entries()].sort((a, b) => b[1] - a[1])
);

console.log(sortedMostWonMap);
console.log(averageKd / Object.keys(stats).length);
console.log(maxKdPlayer, maxKd);