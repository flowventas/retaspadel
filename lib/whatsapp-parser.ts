type ParsedWhatsAppPlayers = {
  names: string[];
  totalDetected: number;
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
const PLAYER_LINE_COURT_BULLET = /^\s*🎾+\s*(.+?)\s*$/u;

function normalizeName(value: string) {
  return value
    .replace(/[\u200B-\u200D\uFEFF\u2060]/g, "")
    .replace(/^[^\p{L}\p{N}(]+/gu, "")
    .replace(/[^\p{L}\p{N})]+$/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseWhatsAppPlayers(message: string): ParsedWhatsAppPlayers {
  const seen = new Set<string>();
  const detected: string[] = [];
  let insideCourtList = false;

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

    const name = normalizeName(match?.[2] ?? courtMatch?.[1] ?? "");
    const key = name.toLocaleLowerCase();
    if (!name || seen.has(key)) {
      continue;
    }

    seen.add(key);
    detected.push(name);
  }

  return {
    names: detected,
    totalDetected: detected.length,
  };
}
