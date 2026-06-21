import { Platform } from "react-native";

const DEPLOYED_BACKEND_URL = "https://printflow-backend-ru3u.onrender.com";

// Expo statically injects EXPO_PUBLIC_* values at build time.
const env = {
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_WEB_API_URL: process.env.EXPO_PUBLIC_WEB_API_URL,
  EXPO_PUBLIC_SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL,
  EXPO_PUBLIC_WEB_SOCKET_URL: process.env.EXPO_PUBLIC_WEB_SOCKET_URL,
};

const apiUrl =
  Platform.OS === "web" && env.EXPO_PUBLIC_WEB_API_URL
    ? env.EXPO_PUBLIC_WEB_API_URL
    : env.EXPO_PUBLIC_API_URL;

const socketUrl =
  Platform.OS === "web" && env.EXPO_PUBLIC_WEB_SOCKET_URL
    ? env.EXPO_PUBLIC_WEB_SOCKET_URL
    : env.EXPO_PUBLIC_SOCKET_URL;

export const API_BASE_URL: string =
  apiUrl || `${DEPLOYED_BACKEND_URL}/api`;

// socket.io attaches to the HTTP server root (no /api)
export const SOCKET_BASE_URL: string =
  socketUrl || DEPLOYED_BACKEND_URL;

if ((globalThis as any)?.__DEV__) {
  console.info("[PrintFlow] API_BASE_URL:", API_BASE_URL);
  console.info("[PrintFlow] SOCKET_BASE_URL:", SOCKET_BASE_URL);
}
