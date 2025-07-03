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

let refreshPromise: Promise<void> | null = null;

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

  let token = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

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

    let response = await fetch(BASE_URL + endpoint, config);

    if (response.status === 401 && endpoint !== '/auth/refresh-token') {
      if (!refreshPromise) {
        refreshPromise = (async () => {
          let currentRefreshToken = localStorage.getItem('refreshToken');
         
          const refreshRes = await fetch(BASE_URL + '/auth/refresh-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: currentRefreshToken }),
          });
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            localStorage.setItem('accessToken', refreshData.accessToken);
            localStorage.setItem('refreshToken', refreshData.refreshToken);
           
          } else {
           
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/';
            throw new Error('Session expired. Please login again.');
          }
        })().finally(() => {
          refreshPromise = null;
        });
      }
      await refreshPromise;
      // After refresh, retry the original request with the new token
      const newToken = localStorage.getItem('accessToken');
      config.headers = {
        ...authHeaders,
        Authorization: `Bearer ${newToken}`,
      };
      response = await fetch(BASE_URL + endpoint, config);
    }

   

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
