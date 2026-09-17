export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

export class ApiError extends Error {
  status: number
  detail: unknown

  constructor(status: number, message: string, detail?: unknown) {
    super(message)
    this.status = status
    this.detail = detail
  }
}

type Query = Record<string, string | number | boolean | undefined | null>

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  query?: Query
}

const buildUrl = (path: string, query?: Query) => {
  const url = new URL(path, API_URL)
  Object.entries(query ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v))
  })
  return url.toString()
}

async function send(path: string, { method = 'GET', body, query }: RequestOptions) {
  return fetch(buildUrl(path, query), {
    method,
    credentials: 'include', // JWT lives in an httpOnly cookie
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let res = await send(path, options)

  // Access token expired: try one silent refresh, then replay the request.
  if (res.status === 401 && !path.startsWith('/auth/')) {
    const refreshed = await send('/auth/refresh', { method: 'POST' })
    if (refreshed.ok) res = await send(path, options)
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    const message = typeof data?.detail === 'string' ? data.detail : `Request failed (${res.status})`
    throw new ApiError(res.status, message, data?.detail)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const get = <T>(path: string, query?: Query) => request<T>(path, { query })
export const post = <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body })
export const patch = <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body })
export const del = (path: string) => request<void>(path, { method: 'DELETE' })

export const absoluteUrl = (path: string, query?: Query) => buildUrl(path, query)
