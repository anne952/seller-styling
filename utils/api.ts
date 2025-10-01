import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

let authToken: string | null = null;

export const ApiConfig = {
  baseUrl: (() => {
    // 1) Si la variable d'env est fournie, on l'utilise telle quelle,
    //    sauf cas particulier Android émulateur.
    const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
    console.log('🔧 API Config - Environment URL:', envUrl);
    console.log('🔧 API Config - Platform:', Platform.OS);
    
    if (envUrl) {
      try {
        const url = new URL(envUrl);
        if (
          Platform.OS === 'android' &&
          (url.hostname === 'localhost' || url.hostname === '127.0.0.1')
        ) {
          url.hostname = '10.0.2.2';
        }
        const finalUrl = url.toString().replace(/\/$/, "");
        console.log('🔧 API Config - Final URL:', finalUrl);
        return finalUrl;
      } catch {
        console.log('🔧 API Config - Using env URL as string:', envUrl);
        return envUrl;
      }
    }

    // 2) Sinon, déduire en fonction de la plateforme
    if (Platform.OS === 'android') {
      // Force l'IP locale pour tous les appareils Android
      console.log('🔧 API Config - Using Android with local IP');
      return 'http://192.168.1.91:4000';
    }
    if (Platform.OS === 'web') {
      // Utiliser l'hôte de la page web courante
      const host = (typeof window !== 'undefined' && window.location?.hostname) || 'localhost';
      console.log('🔧 API Config - Using web fallback');
      return `http://${host}:4000`;
    }
    // iOS simulateur / fallback
    console.log('🔧 API Config - Using iOS fallback');
    return 'http://localhost:4000';
  })(),
};

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    SecureStore.setItemAsync('auth_token', token).catch(() => {});
  } else {
    SecureStore.deleteItemAsync('auth_token').catch(() => {});
  }
}

export function getAuthToken() {
  return authToken;
}

export async function restoreAuthToken() {
  try {
    const token = await SecureStore.getItemAsync('auth_token');
    authToken = token || null;
    return authToken;
  } catch {
    return null;
  }
}

type RequestOptions = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  auth?: boolean;
  timeoutMs?: number;
};

export async function apiFetch<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${ApiConfig.baseUrl}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (options.auth && authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  console.log('🔍 API Request:', {
    url,
    method: options.method || 'GET',
    hasAuth: options.auth,
    authToken: authToken ? `${authToken.substring(0, 20)}...` : null
  });
  let res: Response;
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 15000; // 15s par défaut
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    res = await fetch(url, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
  } catch (e: any) {
    const reason = e?.name === "AbortError" ? `Timeout après ${timeoutMs}ms` : "Network request failed";
    throw new Error(`${reason}. Vérifiez l'URL de l'API et la connectivité (${url}).`);
  } finally {
    clearTimeout(timeoutId);
  }
  console.log('⬆️ API Response:', {
    status: res.status,
    ok: res.ok,
    contentType: res.headers.get("content-type")
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      console.log('❌ API Error Response:', err);
      message = err?.message || message;
    } catch {}
    throw new Error(message);
  }
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const jsonData = await res.json();
    console.log('✅ API Success Response:', jsonData);
    return jsonData as T;
  }
  // @ts-ignore - allow non-JSON
  const textData = await res.text();
  console.log('✅ API Text Response:', textData);
  return textData as T;
}
