import { API_BASE_URL } from './config';
import { getIdToken, isFirebaseConfigured } from '@/lib/firebase';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function getAuthToken(): Promise<string | null> {
  if (isFirebaseConfigured) {
    const token = await getIdToken()
    if (token) return token
  }
  return localStorage.getItem('authToken')
}

export async function fetchApi<T = any>(
  method: string,
  endpoint: string,
  body?: any
): Promise<T> {
  const token = await getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
    throw new ApiError(401, 'Unauthorized');
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new ApiError(response.status, errorBody || response.statusText);
  }

  return response.json();
}

export async function fetchApiFormData<T = any>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const token = await getAuthToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (response.status === 401) {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
    throw new ApiError(401, 'Unauthorized');
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new ApiError(response.status, errorBody || response.statusText);
  }

  return response.json();
}

export async function fetchApiBlob(
  method: string,
  endpoint: string
): Promise<Blob> {
  const token = await getAuthToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
    throw new ApiError(401, 'Unauthorized');
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new ApiError(response.status, errorBody || response.statusText);
  }

  return response.blob();
}
