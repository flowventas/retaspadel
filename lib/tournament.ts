import {
  Match,
  MatchScore,
  Player,
  PlayerStats,
  RankingRow,
  Round,
  Tournament,
  TournamentFormat,
} from "@/lib/types";

type GeneratorState = {
  partnerCounts: Record<string, Record<string, number>>;
  opponentCounts: Record<string, Record<string, number>>;
  playedCounts: Record<string, number>;
};

type Pair = [string, string];
type Matchup = [Pair, Pair];

const POINTS_PER_WIN = 3;
const POINTS_PER_DRAW = 1;
const DEFAULT_ROUNDS: Record<TournamentFormat, number> = {
  8: 7,
  12: 9,
  16: 10,
  20: 10,
};

function initMatrix(players: Player[]) {
  return Object.fromEntries(
    players.map((player) => [
      player.id,
      Object.fromEntries(
        players
          .filter((candidate) => candidate.id !== player.id)
          .map((candidate) => [candidate.id, 0]),
      ),
    ]),
  );
}

function initGeneratorState(players: Player[]): GeneratorState {
  return {
    partnerCounts: initMatrix(players),
    opponentCounts: initMatrix(players),
    playedCounts: Object.fromEntries(players.map((player) => [player.id, 0])),
  };
}

function uniqueKey(a: string, b: string) {
  return [a, b].sort().join(":");
}

function rotate<T>(items: T[], shift: number) {
  if (!items.length) {
    return items;
  }

  const offset = ((shift % items.length) + items.length) % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

function orderPlayersForAttempt(players: Player[], state: GeneratorState, roundNumber: number, attempt: number) {
  const sorted = [...players].sort((left, right) => {
    const playedGap = state.playedCounts[left.id] - state.playedCounts[right.id];
    if (playedGap !== 0) {
      return playedGap;
    }

    return left.seed - right.seed;
  });

  const rotated = rotate(sorted, roundNumber + attempt);
  if (attempt % 2 === 1) {
    rotated.reverse();
  }

  return rotated;
}

function partnerCost(anchorId: string, candidateId: string, state: GeneratorState, roundNumber: number) {
  return (
    state.partnerCounts[anchorId][candidateId] * 1000 +
    state.playedCounts[anchorId] * 10 +
    state.playedCounts[candidateId] * 10 +
    Math.abs(Number(anchorId.split("-").at(-1)) - Number(candidateId.split("-").at(-1))) +
    roundNumber
  );
}

function matchupCost(anchor: Pair, candidate: Pair, state: GeneratorState) {
  let cost = 0;

  for (const anchorPlayer of anchor) {
    for (const candidatePlayer of candidate) {
      cost += state.opponentCounts[anchorPlayer][candidatePlayer] * 150;
    }
  }

  return cost;
}

function scoreRoundMatches(matches: Matchup[], state: GeneratorState) {
  let cost = 0;

  for (const [teamA, teamB] of matches) {
    cost += state.partnerCounts[teamA[0]][teamA[1]] * 1000;
    cost += state.partnerCounts[teamB[0]][teamB[1]] * 1000;
    cost += matchupCost(teamA, teamB, state);
  }

  return cost;
}

function createGreedyPairs(players: Player[], state: GeneratorState, roundNumber: number) {
  const remaining = [...players];
  const pairs: Pair[] = [];

  while (remaining.length) {
    const anchor = remaining.shift();
    if (!anchor) {
      break;
    }

    let bestIndex = 0;
    let bestCost = Number.POSITIVE_INFINITY;

    for (let index = 0; index < remaining.length; index += 1) {
      const candidate = remaining[index];
      const cost = partnerCost(anchor.id, candidate.id, state, roundNumber);

      if (cost < bestCost) {
        bestCost = cost;
        bestIndex = index;
      }
    }

    const [partner] = remaining.splice(bestIndex, 1);
    pairs.push([anchor.id, partner.id]);
  }

  return pairs;
}

function createGreedyMatchups(pairs: Pair[], state: GeneratorState) {
  const remaining = [...pairs];
  const matches: Matchup[] = [];

  while (remaining.length) {
    const anchor = remaining.shift();
    if (!anchor) {
      break;
    }

    let bestIndex = 0;
    let bestCost = Number.POSITIVE_INFINITY;

    for (let index = 0; index < remaining.length; index += 1) {
      const candidate = remaining[index];
      const cost = matchupCost(anchor, candidate, state);

      if (cost < bestCost) {
        bestCost = cost;
        bestIndex = index;
      }
    }

    const [opponent] = remaining.splice(bestIndex, 1);
    matches.push([anchor, opponent]);
  }

  return matches;
}

function generateRoundMatches(players: Player[], state: GeneratorState, roundNumber: number) {
  let best: Matchup[] = [];
  let bestCost = Number.POSITIVE_INFINITY;

  for (let attempt = 0; attempt < 18; attempt += 1) {
    const ordered = orderPlayersForAttempt(players, state, roundNumber, attempt);
    const pairs = createGreedyPairs(ordered, state, roundNumber);
    const matches = createGreedyMatchups(pairs, state);
    const cost = scoreRoundMatches(matches, state);

    if (cost < bestCost) {
      best = matches;
      bestCost = cost;
    }
  }

  return best;
}

function applyGeneratedRound(round: Round, state: GeneratorState) {
  for (const match of round.matches) {
    const activePlayers = [...match.teamA, ...match.teamB];

    for (const playerId of activePlayers) {
      state.playedCounts[playerId] += 1;
    }

    state.partnerCounts[match.teamA[0]][match.teamA[1]] += 1;
    state.partnerCounts[match.teamA[1]][match.teamA[0]] += 1;
    state.partnerCounts[match.teamB[0]][match.teamB[1]] += 1;
    state.partnerCounts[match.teamB[1]][match.teamB[0]] += 1;

    for (const teamAPlayer of match.teamA) {
      for (const teamBPlayer of match.teamB) {
        state.opponentCounts[teamAPlayer][teamBPlayer] += 1;
        state.opponentCounts[teamBPlayer][teamAPlayer] += 1;
      }
    }
  }
}

export function generateRounds(players: Player[], format: TournamentFormat) {
  const rounds: Round[] = [];
  const state = initGeneratorState(players);
  const roundCount = DEFAULT_ROUNDS[format];

  for (let roundNumber = 1; roundNumber <= roundCount; roundNumber += 1) {
    const matchups = generateRoundMatches(players, state, roundNumber);

    const round: Round = {
      id: `round-${roundNumber}`,
      number: roundNumber,
      restingPlayerIds: [],
      status: "pending",
      updatedAt: null,
      matches: matchups.map(([teamA, teamB], index) => ({
        id: `round-${roundNumber}-match-${index + 1}`,
        court: index + 1,
        teamA,
        teamB,
        score: null,
      })),
    };

    applyGeneratedRound(round, state);
    rounds.push(round);
  }

  return rounds;
}

export function createTournament(name: string, players: Player[], format: TournamentFormat): Tournament {
  return {
    id: crypto.randomUUID(),
    name,
    format,
    createdAt: new Date().toISOString(),
    players,
    rounds: generateRounds(players, format),
    currentRoundIndex: 0,
    completed: false,
  };
}

export function validateRoundScores(round: Round) {
  const missing = round.matches.some((match) => !match.score);
  if (missing) {
    return "Completa todos los scores antes de guardar la ronda.";
  }

  const invalid = round.matches.some((match) => {
    if (!match.score) {
      return true;
    }

    return (
      Number.isNaN(match.score.teamA) ||
      Number.isNaN(match.score.teamB) ||
      match.score.teamA < 0 ||
      match.score.teamB < 0
    );
  });

  if (invalid) {
    return "Los scores deben ser numeros iguales o mayores a cero.";
  }

  return null;
}

export function updateMatchScore(
  tournament: Tournament,
  roundId: string,
  matchId: string,
  score: MatchScore | null,
) {
  return {
    ...tournament,
    rounds: tournament.rounds.map((round) =>
      round.id !== roundId
        ? round
        : {
            ...round,
            matches: round.matches.map((match) =>
              match.id !== matchId
                ? match
                : {
                    ...match,
                    score,
                  },
            ),
          },
    ),
  };
}

export function saveRound(tournament: Tournament, roundId: string) {
  const rounds = tournament.rounds.map((round) =>
    round.id !== roundId
      ? round
      : {
          ...round,
          status: "completed" as const,
          updatedAt: new Date().toISOString(),
        },
  );

  const currentRoundIndex = rounds.findIndex((round) => round.status === "pending");

  return {
    ...tournament,
    rounds,
    currentRoundIndex: currentRoundIndex === -1 ? tournament.rounds.length - 1 : currentRoundIndex,
    completed: rounds.every((round) => round.status === "completed"),
  };
}

export function reopenRound(tournament: Tournament, roundId: string) {
  const roundIndex = tournament.rounds.findIndex((round) => round.id === roundId);
  const rounds = tournament.rounds.map((round, index) =>
    index < roundIndex
      ? round
      : {
          ...round,
          status: "pending" as const,
          updatedAt: null,
          matches: round.matches.map((match) => ({
            ...match,
            score: index === roundIndex ? match.score : null,
          })),
        },
  );

  return {
    ...tournament,
    rounds,
    currentRoundIndex: roundIndex,
    completed: false,
  };
}

function createRankingMap(players: Player[]) {
  return Object.fromEntries(
    players.map((player) => [
      player.id,
      {
        playerId: player.id,
        name: player.name,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        gamesFor: 0,
        gamesAgainst: 0,
        gameDiff: 0,
        points: 0,
        rests: 0,
      } satisfies RankingRow,
    ]),
  );
}

export function calculateRanking(tournament: Tournament): RankingRow[] {
  const rankingMap = createRankingMap(tournament.players);

  for (const round of tournament.rounds) {
    for (const playerId of round.restingPlayerIds) {
      rankingMap[playerId].rests += 1;
    }

    for (const match of round.matches) {
      if (!match.score) {
        continue;
      }

      const teamAScore = match.score.teamA;
      const teamBScore = match.score.teamB;
      const winner = teamAScore === teamBScore ? null : teamAScore > teamBScore ? "A" : "B";

      for (const playerId of match.teamA) {
        rankingMap[playerId].played += 1;
        rankingMap[playerId].gamesFor += teamAScore;
        rankingMap[playerId].gamesAgainst += teamBScore;
        if (winner === "A") {
          rankingMap[playerId].wins += 1;
          rankingMap[playerId].points += POINTS_PER_WIN;
        } else if (winner === null) {
          rankingMap[playerId].draws += 1;
          rankingMap[playerId].points += POINTS_PER_DRAW;
        } else {
          rankingMap[playerId].losses += 1;
        }
      }

      for (const playerId of match.teamB) {
        rankingMap[playerId].played += 1;
        rankingMap[playerId].gamesFor += teamBScore;
        rankingMap[playerId].gamesAgainst += teamAScore;
        if (winner === "B") {
          rankingMap[playerId].wins += 1;
          rankingMap[playerId].points += POINTS_PER_WIN;
        } else if (winner === null) {
          rankingMap[playerId].draws += 1;
          rankingMap[playerId].points += POINTS_PER_DRAW;
        } else {
          rankingMap[playerId].losses += 1;
        }
      }
    }
  }

  return Object.values(rankingMap)
    .map((row) => ({
      ...row,
      gameDiff: row.gamesFor - row.gamesAgainst,
    }))
    .sort(
      (left, right) =>
        right.points - left.points ||
        right.gameDiff - left.gameDiff ||
        right.gamesFor - left.gamesFor ||
        left.name.localeCompare(right.name, "es"),
    );
}

export function getPlayerStats(tournament: Tournament): PlayerStats[] {
  const rankingMap = Object.fromEntries(
    calculateRanking(tournament).map((row) => [
      row.playerId,
      {
        ...row,
        winRate: row.played ? row.wins / row.played : 0,
        averageGamesFor: row.played ? row.gamesFor / row.played : 0,
        averageGamesAgainst: row.played ? row.gamesAgainst / row.played : 0,
        partners: new Set<string>(),
        opponents: new Set<string>(),
      },
    ]),
  );

  for (const round of tournament.rounds) {
    for (const match of round.matches) {
      const [a1, a2] = match.teamA;
      const [b1, b2] = match.teamB;

      rankingMap[a1].partners.add(a2);
      rankingMap[a2].partners.add(a1);
      rankingMap[b1].partners.add(b2);
      rankingMap[b2].partners.add(b1);

      for (const playerA of match.teamA) {
        for (const playerB of match.teamB) {
          rankingMap[playerA].opponents.add(playerB);
          rankingMap[playerB].opponents.add(playerA);
        }
      }
    }
  }

  return Object.values(rankingMap).map((row) => ({
    ...row,
    partners: Array.from(row.partners)
      .map((id) => tournament.players.find((player) => player.id === id)?.name ?? id)
      .sort((left, right) => left.localeCompare(right, "es")),
    opponents: Array.from(row.opponents)
      .map((id) => tournament.players.find((player) => player.id === id)?.name ?? id)
      .sort((left, right) => left.localeCompare(right, "es")),
  }));
}

export function getCurrentRound(tournament: Tournament) {
  return tournament.rounds[tournament.currentRoundIndex] ?? tournament.rounds.at(-1) ?? null;
}

export function isRoundReady(round: Round) {
  return validateRoundScores(round) === null;
}

export function exportTournamentCsv(tournament: Tournament) {
  const ranking = calculateRanking(tournament);
  const lines = [
    ["Pos", "Jugador", "Puntos", "PJ", "PG", "PE", "PP", "GF", "GC", "Diff"].join(","),
    ...ranking.map((row, index) =>
      [
        index + 1,
        `"${row.name}"`,
        row.points,
        row.played,
        row.wins,
        row.draws,
        row.losses,
        row.gamesFor,
        row.gamesAgainst,
        row.gameDiff,
      ].join(","),
    ),
    "",
    ["Ronda", "Cancha", "Pareja A", "Score A", "Score B", "Pareja B"].join(","),
  ];

  for (const round of tournament.rounds) {
    for (const match of round.matches) {
      lines.push(
        [
          round.number,
          match.court,
          `"${match.teamA.join(" / ")}"`,
          match.score?.teamA ?? "",
          match.score?.teamB ?? "",
          `"${match.teamB.join(" / ")}"`,
        ].join(","),
      );
    }
  }

  return lines.join("\n");
}

export function createPlayers(names: string[]) {
  return names.map((name, index) => ({
    id: `player-${index + 1}`,
    name: name.trim(),
    seed: index + 1,
  }));
}

export function playerNameMap(players: Player[]) {
  return Object.fromEntries(players.map((player) => [player.id, player.name]));
}

export function formatTeam(match: Match, side: "A" | "B", names: Record<string, string>) {
  const team = side === "A" ? match.teamA : match.teamB;
  return team.map((playerId) => names[playerId]).join(" + ");
}

export function formatPlayerList(playerIds: string[], names: Record<string, string>) {
  return playerIds.map((playerId) => names[playerId]).join(", ");
}

export function roundHasScores(round: Round) {
  return round.matches.some((match) => match.score !== null);
}

export function tournamentProgress(tournament: Tournament) {
  const completed = tournament.rounds.filter((round) => round.status === "completed").length;
  return {
    completed,
    total: tournament.rounds.length,
    percentage: Math.round((completed / tournament.rounds.length) * 100),
  };
}

export function duplicateTournament(tournament: Tournament) {
  return createTournament(
    `${tournament.name} (nuevo)`,
    tournament.players.map((player) => ({ ...player })),
    tournament.format,
  );
}

export function roundLabel(round: Round) {
  return `Ronda ${round.number}`;
}

export function matchWinner(score: MatchScore | null) {
  if (!score) {
    return null;
  }

  return score.teamA === score.teamB ? "draw" : score.teamA > score.teamB ? "A" : "B";
}

export function pairSignature(pair: Pair) {
  return uniqueKey(pair[0], pair[1]);
}
