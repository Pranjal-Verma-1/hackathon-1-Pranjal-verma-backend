export const LISTEN_HOST = '0.0.0.0';
export const DEFAULT_PORT = 3001;
export const LOCAL_FRONTEND_ORIGIN = 'http://localhost:3000';

export function resolveListenPort(portValue: string | undefined): number {
  const trimmed = portValue?.trim() ?? '';
  if (!/^[0-9]+$/.test(trimmed)) {
    return DEFAULT_PORT;
  }
  const port = Number(trimmed);
  if (port < 1 || port > 65535) {
    return DEFAULT_PORT;
  }
  return port;
}

export function resolveAllowedOrigins(
  originValue: string | undefined,
): string[] {
  const origins: string[] = [];
  const seen = new Set<string>();
  const add = (origin: string) => {
    if (origin.length === 0 || origin === '*' || seen.has(origin)) {
      return;
    }
    seen.add(origin);
    origins.push(origin);
  };

  for (const part of (originValue ?? '').split(',')) {
    add(part.trim());
  }

  if (origins.length === 0) {
    return [LOCAL_FRONTEND_ORIGIN];
  }

  add(LOCAL_FRONTEND_ORIGIN);
  return origins;
}
