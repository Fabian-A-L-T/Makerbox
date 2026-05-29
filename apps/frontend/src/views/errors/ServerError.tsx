import { AxiosError } from "axios";

export default function ServerError(error: any) {
    let status, message;

    if(error instanceof AxiosError) {
        status = error.status;
        message = error.message;
    }

    return (
        <div className="flex flex-col gap-4 justify-center align-center h-full text-[var(--color-text)]">
            <h1 className="text-3xl ">{`Error ${status ?? null}`}</h1>
            <span>Error al cargar los datos</span>
            <p>{message ?? error.message}</p>
        </div>
    );
}