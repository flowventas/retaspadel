type ParsedWhatsAppPlayers = {
  names: string[];
  totalDetected: number;
  pairingMode: "rotating" | "fixed";
};

const STOP_PATTERNS = [
  /^lista\s+de\s+espera/i,
  /^espera$/i,
  /^suplentes?$/i,
  /^waiting\s+list/i,
];

const COURT_PATTERNS = [
  /^\*?\s*cancha\s*\d+\s*\*?$/i,
  /^\*?\s*court\s*\d+\s*\*?$/i,
];

const PLAYER_LINE_STANDARD = /^\s*(\d+)\s*[-.)]\s*(.+?)\s*$/u;
const PLAYER_LINE_WITH_SYMBOL = /^\s*(\d+)\s*[^\p{L}\p{N}\s]+\s*(.+?)\s*$/u;
const PLAYER_LINE_COURT_BULLET = /^\s*[^\p{L}\p{N}\s]+\s*(.+?)\s*$/u;
const FIXED_PAIR_HINT = /parejas?\s+fijas?/iu;
const PAIR_SEPARATOR = /\s*\/\s*/u;

function normalizeName(value: string) {
  return value
    .replace(/[\u200B-\u200D\uFEFF\u2060]/g, "")
    .replace(/^[^\p{L}\p{N}(]+/gu, "")
    .replace(/[^\p{L}\p{N})]+$/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isLikelyPairLine(value: string) {
  return value.split(PAIR_SEPARATOR).filter(Boolean).length === 2;
}

export function parseWhatsAppPlayers(message: string): ParsedWhatsAppPlayers {
  const seen = new Set<string>();
  const detected: string[] = [];
  let insideCourtList = false;
  let pairingMode: "rotating" | "fixed" = FIXED_PAIR_HINT.test(message) ? "fixed" : "rotating";

  for (const rawLine of message.split(/\r?\n/)) {
    const line = rawLine.replace(/\u00A0/g, " ").trim();
    if (!line) {
      continue;
    }

    if (STOP_PATTERNS.some((pattern) => pattern.test(line))) {
      break;
    }

    if (COURT_PATTERNS.some((pattern) => pattern.test(line))) {
      insideCourtList = true;
      continue;
    }

    const match = line.match(PLAYER_LINE_STANDARD) ?? line.match(PLAYER_LINE_WITH_SYMBOL);
    const courtMatch = insideCourtList ? line.match(PLAYER_LINE_COURT_BULLET) : null;
    if (!match && !courtMatch) {
      continue;
    }

    const rawName = normalizeName(match?.[2] ?? courtMatch?.[1] ?? "");
    if (!rawName) {
      continue;
    }

    const namesToInsert = isLikelyPairLine(rawName)
      ? rawName
          .split(PAIR_SEPARATOR)
          .map((item) => normalizeName(item))
          .filter(Boolean)
      : [rawName];

    if (namesToInsert.length === 2) {
      pairingMode = "fixed";
    }

    for (const candidate of namesToInsert) {
      const key = candidate.toLocaleLowerCase();
      if (!candidate || seen.has(key)) {
        continue;
      }

      seen.add(key);
      detected.push(candidate);
    }
  }

  return {
    names: detected,
    totalDetected: detected.length,
    pairingMode,
  };
}
