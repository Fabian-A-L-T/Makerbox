interface LoadingCircleProps {
    size?: number;
    message?: string;
}

export default function LoadingCircle({size=24, message='Procesando…'}: LoadingCircleProps) {
    return (
        <div className='flex flex-col justify-center gap-2 items-center' aria-label={message} role="status" aria-busy="true">
            <span className="animate-spin rounded-full border-[3px] border-white/20 border-t-blue-400"
                style={{ width: size, height: size, display: 'inline-block' }} />
            <span className="text-[var(--color-text)]" >
                {message}
            </span>
        </div>
    );
}