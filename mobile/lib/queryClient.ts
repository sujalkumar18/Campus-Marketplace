import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      gcTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export { queryClient };

// API helper function - update BASE_URL based on your backend
// For local development: http://localhost:5000
// For Render deployment: https://your-app-name.onrender.com
const BASE_URL = 'https://YOUR_RENDER_URL.onrender.com';

export async function apiRequest(
  path: string,
  options?: RequestInit
): Promise<any> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}
