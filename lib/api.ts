export function getApiBaseUrl() {
  const value = process.env.NEXT_PUBLIC_API_URL
  if (!value) {
    return ""
  }

  return value.endsWith("/") ? value.slice(0, -1) : value
}

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const base = getApiBaseUrl()
  return `${base}${normalizedPath}`
}
