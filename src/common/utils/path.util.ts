export type PathToken = string | number;

const PATH_TOKEN_REGEX = /([^[.\]]+)|\[(\d+)\]/g;

export function parsePath(path: string): PathToken[] {
  if (!path) {
    return [];
  }

  return Array.from(path.matchAll(PATH_TOKEN_REGEX)).map((match) => {
    if (match[2] !== undefined) {
      return Number(match[2]);
    }

    return match[1];
  });
}

export function getValueByPath(source: unknown, path: string): any {
  if (!path) {
    return source;
  }

  return parsePath(path).reduce<any>((current, token) => {
    if (current === null || current === undefined) {
      return undefined;
    }

    return current[token as keyof typeof current];
  }, source);
}

export function setValueByPath(target: Record<string, any>, path: string, value: any): void {
  const tokens = parsePath(path);
  if (tokens.length === 0) {
    return;
  }

  let current: any = target;

  tokens.forEach((token, index) => {
    const isLastToken = index === tokens.length - 1;
    const nextToken = tokens[index + 1];

    if (isLastToken) {
      current[token] = value;
      return;
    }

    if (current[token] === undefined) {
      current[token] = typeof nextToken === 'number' ? [] : {};
    }

    current = current[token];
  });
}
