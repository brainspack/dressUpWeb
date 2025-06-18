export interface BaseApiOptions {
  method?: string;
  data?: unknown;
  headers?: Record<string, string>;
  onError?: (error: string) => void;
  onStart?: () => void;
  onFinish?: () => void;
  [key: string]: any;
}

const BASE_URL = import.meta.env.VITE_BASE_API_URL;

export const baseApi = async (
  endpoint: string,
  {
    method = 'POST',
    data,
    headers = {},
    onError,
    onStart,
    onFinish,
    ...options
  }: BaseApiOptions = {}
): Promise<any> => {
  const token = localStorage.getItem('accessToken');

  const authHeaders = {
    'Content-Type': 'application/json',
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const config: RequestInit = {
    method,
    headers: authHeaders,
    ...options,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    onStart?.();

    const response = await fetch(BASE_URL + endpoint, config);

    const contentType = response.headers.get('Content-Type');
    const isJson = contentType?.includes('application/json');
    const responseData = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMessage =
        typeof responseData === 'string'
          ? responseData
          : responseData?.message || 'Unknown API error';

      console.error('🚨 API Error Response:', responseData);
      onError?.(errorMessage);
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error: any) {
    console.error('🚫 Fetch Error:', error);
    onError?.(error.message || 'Fetch failed');
    throw error;
  } finally {
    onFinish?.();
  }
};
