export function getApiBaseUrl(): string {
  // If running in browser on Render
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('onrender.com')) {
    return 'https://drishyam-api.onrender.com';
  }

  let url = process.env.NEXT_PUBLIC_API_URL;
  if (!url || url.includes('localhost') || url.includes('127.0.0.1')) {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      return 'https://drishyam-api.onrender.com';
    }
    return 'http://localhost:4000';
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  return url;
}

export function getWsBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('onrender.com')) {
    return 'https://drishyam-api.onrender.com';
  }

  let url = process.env.NEXT_PUBLIC_WS_URL;
  if (!url || url.includes('localhost') || url.includes('127.0.0.1')) {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      return 'https://drishyam-api.onrender.com';
    }
    return 'http://localhost:4000';
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  return url;
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('drishyam_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const baseUrl = getApiBaseUrl();

  const response = await fetch(`${baseUrl}/api/v1${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'API request failed');
  }

  return data;
}
