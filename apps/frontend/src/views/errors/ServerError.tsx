import { AxiosError } from "axios";
import { SearchParamError } from "@tanstack/react-router";

export default function ServerError(error: any) {
    let status, message;

    if(error instanceof AxiosError) {
        status = error.status;
        message = error.response?.data.message;
    }
    else if(error instanceof SearchParamError) {
        let cause = error.cause as Record<string,Record<number,any>>
        status = 400;
        message = cause.issues[0].message;
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className='font-semibold text-8xl text-[#AAA]'>{status ?? 500}</h1>
            <span className='font-medium ml-2 text-lg text-[#AAA]'>
                {`${'Ha ocurrido un error'}: ${message ?? error.message}`}
            </span>
        </div>
    );
}