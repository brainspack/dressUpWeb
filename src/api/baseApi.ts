export interface BaseApiOptions {
  method?: string
  data?: unknown
  headers?: Record<string, string>
  [key: string]: any
}

export const baseApi = async (
  endpoint: string,
  { method = 'GET', data, headers = {}, ...options }: BaseApiOptions = {}
): Promise<any> => {
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...options,
  }
  if (data) {
    config.body = JSON.stringify(data)
  }
  const response = await fetch(endpoint, config)
  if (!response.ok) {
    throw new Error(await response.text() || 'API error')
  }
  return response.json()
}
