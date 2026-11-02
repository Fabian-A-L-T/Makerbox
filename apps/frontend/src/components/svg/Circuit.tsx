export default function Circuit({rotate}:{rotate?: boolean}){
    return (
        <svg className={`text-[var(--color-border)] ${rotate ? 'rotate-180' : ''}`} viewBox="0 0 119 141" fill="none">
            <path d="M37 118L0 118" stroke="var(--color-border)" strokeWidth="8"/>
            <path d="M78.5 77L44.5 77L22.5 99H0" stroke="var(--color-border)"strokeWidth="8"/>
            <path d="M99.5 55L36.5 55L14.5 77H0" stroke="var(--color-border)" strokeWidth="8"/>
            <path d="M79.5 34L27.5 34L5.49999 56H0" stroke="var(--color-border)" strokeWidth="8"/>
            <path d="M58.5 12.9999L17.5 12.9999L3 27.5H0" stroke="var(--color-border)" strokeWidth="8"/>
            <circle cx="10.5" cy="10.5" r="6.5" transform="matrix(1 0 0 -1 77 45)" stroke="var(--color-border)" strokeWidth="8"/>
            <circle cx="10.5" cy="10.5" r="6.5" transform="matrix(1 0 0 -1 56 24)" stroke="var(--color-border)" strokeWidth="8"/>
            <circle cx="10.5" cy="10.5" r="6.5" transform="matrix(1 0 0 -1 77 87)" stroke="var(--color-border)" strokeWidth="8"/>
            <circle cx="10.5" cy="10.5" r="6.5" transform="matrix(1 0 0 -1 35 129)" stroke="var(--color-border)" strokeWidth="8"/>
            <circle cx="10.5" cy="10.5" r="6.5" transform="matrix(1 0 0 -1 98 66)" stroke="var(--color-border)" strokeWidth="8"/>
        </svg>
    )
}