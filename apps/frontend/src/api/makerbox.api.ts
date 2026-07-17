import axios, { AxiosError } from "axios";
import { router } from "@utils/router";

export const makerboxApi =  axios.create({
    baseURL: '/api'
});

makerboxApi.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            router.navigate({to:'/login', reloadDocument:true});
        }
        return Promise.reject(error);
    }
)