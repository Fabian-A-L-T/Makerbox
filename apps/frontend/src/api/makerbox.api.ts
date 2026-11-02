import axios, { AxiosError } from "axios";
import { router } from "@utils/router";

let accessToken: string | null = null;
export const setAccessToken = (t: string | null) => { accessToken = t; };
const baseURL = import.meta.env.VITE_BACKEND_URL;

export const makerboxApi =  axios.create({
    baseURL: baseURL,
    withCredentials: true,
});

makerboxApi.interceptors.request.use((config) => {
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
});

let refreshing = null;
makerboxApi.interceptors.response.use(
    (response) => {
        return Promise.resolve(response);
    },
    async (error: AxiosError) => {
        const original = error.config;
        if ( error.response?.status === 401 && original && original.url && !original.url.includes('/auth/') && !original.url.includes('/users/profile')) {
            refreshing ??= axios
                .post(`${baseURL}/api/auth/refresh`, null, { withCredentials: true })
                .finally(() => { refreshing = null; });
            try {
                const { data } = await refreshing;
                setAccessToken(data.accessToken);
                original.headers.Authorization = `Bearer ${data.accessToken}`;
                return makerboxApi(original);
            } catch {
                setAccessToken(null);
                router.navigate({to:'/login', reloadDocument:true});
            }
        }
        return Promise.reject(error);
    }
)