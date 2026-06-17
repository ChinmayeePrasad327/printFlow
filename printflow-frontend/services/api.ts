import axios from "axios";

export const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://10.1.48.225:5000/api',
});

let tokenFetcher: (() => Promise<string | null>) | null = null;

export const setTokenFetcher = (fetcher: () => Promise<string | null>) => {
    tokenFetcher = fetcher;
};

api.interceptors.request.use(
    async (config) => {
        if (tokenFetcher) {
            try {
                const token = await tokenFetcher();
                if (token) {
                    config.headers = config.headers || {};
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (error) {
                console.error("Axios interceptor: failed to get token", error);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
