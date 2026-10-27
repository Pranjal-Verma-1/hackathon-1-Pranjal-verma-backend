import {
  DEFAULT_PORT,
  LISTEN_HOST,
  LOCAL_FRONTEND_ORIGIN,
  resolveAllowedOrigins,
  resolveListenPort,
} from './http-config';

describe('resolveListenPort', () => {
  it('uses the platform port and keeps the local fallback', () => {
    expect(resolveListenPort(undefined)).toBe(DEFAULT_PORT);
    expect(resolveListenPort('')).toBe(DEFAULT_PORT);
    expect(resolveListenPort(' 8080 ')).toBe(8080);
    expect(resolveListenPort('0')).toBe(DEFAULT_PORT);
    expect(resolveListenPort('not-a-port')).toBe(DEFAULT_PORT);
  });

  it('binds on all interfaces', () => {
    expect(LISTEN_HOST).toBe('0.0.0.0');
  });
});

describe('resolveAllowedOrigins', () => {
  it('defaults to the local frontend', () => {
    expect(resolveAllowedOrigins(undefined)).toEqual([LOCAL_FRONTEND_ORIGIN]);
    expect(resolveAllowedOrigins(' * , , ')).toEqual([LOCAL_FRONTEND_ORIGIN]);
  });

  it('accepts a comma-separated allowlist and keeps localhost', () => {
    expect(
      resolveAllowedOrigins(
        ' https://your-frontend.vercel.app , http://localhost:3000 ',
      ),
    ).toEqual(['https://your-frontend.vercel.app', LOCAL_FRONTEND_ORIGIN]);

    expect(resolveAllowedOrigins('https://your-frontend.vercel.app')).toEqual([
      'https://your-frontend.vercel.app',
      LOCAL_FRONTEND_ORIGIN,
    ]);
  });

  it('does not allow every origin', () => {
    expect(resolveAllowedOrigins('*')).not.toContain('*');
  });
});
