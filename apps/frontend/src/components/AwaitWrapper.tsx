import LoadingCircle from "@components/LoadingCircle";
import { Await, CatchBoundary } from "@tanstack/react-router";
import type { ErrorInfo } from "react";

interface StatusWrapperProps<T> {
    asyncData: Promise<any>
    onCatch?: ((error: Error, errorInfo: ErrorInfo) => void) | undefined
    children: (result: T) => React.ReactNode   
}

export default function AwaitWrapper<T>({asyncData, onCatch, children}: StatusWrapperProps<T>){
    return (
        <CatchBoundary 
            getResetKey={() => 'reset'} 
            onCatch={onCatch}
        >
            <Await promise={asyncData} fallback={<div className='my-20'><LoadingCircle/></div>}>
                {children}
            </Await>
        </CatchBoundary>
    );
}