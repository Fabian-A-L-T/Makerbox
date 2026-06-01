import { AxiosError } from "axios";
import { SearchParamError } from "@tanstack/react-router";

export default function ServerError(error: any) {
    let status, message, code;

    if(error instanceof AxiosError) {
        status = error.code;
        code = error.status;
        message = error.message;
    }
    else if(error instanceof SearchParamError) {
        let cause = error.cause as Record<string,Record<number,any>>
        code = 400;
        status = 'Parametro incorrecto';
        message = cause.issues[0].message;
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className='font-semibold text-8xl text-[#AAA]'>{code ?? 500}</h1>
            <span className='font-medium ml-2 text-lg text-[#AAA]'>{`${status ?? 'Ha ocurrido un error'}: ${message ?? error.message}`}</span>
        </div>
    );
}