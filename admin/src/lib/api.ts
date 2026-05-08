export function getApiBase(): string {
  const base = import.meta.env.VITE_API_BASE_URL;
  if (!base || base.trim() === '') {
    return 'http://localhost:3000/api';
  }
  return base.replace(/\/$/, '');
}

/** Resolve stored project image paths (e.g. `/uploads/...`) or absolute URLs for `<img src>`. */
export function apiAssetUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }
  const base = getApiBase();
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${path}`;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiJson<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, ...init } = options;
  const url = `${getApiBase()}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = new Headers(init.headers);
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  if (init.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (typeof body.message === 'string') {
        message = body.message;
      } else if (Array.isArray(body.message)) {
        message = body.message.join(', ');
      }
    } catch {
      // ignore
    }
    throw new ApiError(message, res.status);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

export async function apiFormData<T>(
  path: string,
  options: RequestInit & { token?: string | null; body: FormData },
): Promise<T> {
  const { token, body, ...init } = options;
  const url = `${getApiBase()}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = new Headers(init.headers);
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const res = await fetch(url, {
    ...init,
    method: init.method ?? 'POST',
    body,
    headers,
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const parsed = (await res.json()) as { message?: string | string[] };
      if (typeof parsed.message === 'string') {
        message = parsed.message;
      } else if (Array.isArray(parsed.message)) {
        message = parsed.message.join(', ');
      }
    } catch {
      // ignore
    }
    throw new ApiError(message, res.status);
  }
  return (await res.json()) as T;
}
