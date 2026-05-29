import LoadingCircle from "@components/LoadingCircle";

interface StatusWrapperProps {
    status: { state: 'loading'|'success'|'error', msg?: string };
    children: React.ReactNode;
    loadingMsg: string;
}

export default function StatusWrapper({ status, children, loadingMsg }: StatusWrapperProps){
    if(status.state === 'loading'){
        return (
            <div className="flex items-center justify-center py-20 text-slate-500 gap-3">
                <LoadingCircle message={loadingMsg} />
            </div>
        )
    }
    if(status.state === 'error'){
        return (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-400 text-sm">
                <strong>Error:</strong> {status.msg}
            </div>
        )
    }
    if(status.state === 'success'){
        return children;
    }
    return null;
}