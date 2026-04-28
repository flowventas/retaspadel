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

const PLAYER_LINE = /^\s*(\d+)\s*[-.)]?\s*(.+?)\s*$/;

function normalizeName(value: string) {
  return value
    .replace(/^[^\p{L}\p{N}(]+/gu, "")
    .replace(/[^\p{L}\p{N})]+$/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseWhatsAppPlayers(message: string): ParsedWhatsAppPlayers {
  const seen = new Set<string>();
  const detected: string[] = [];

  for (const rawLine of message.split(/\r?\n/)) {
    const line = rawLine.replace(/\u00A0/g, " ").trim();
    if (!line) {
      continue;
    }

    if (STOP_PATTERNS.some((pattern) => pattern.test(line))) {
      break;
    }

    const match = line.match(PLAYER_LINE);
    if (!match) {
      continue;
    }

    const name = normalizeName(match[2]);
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
