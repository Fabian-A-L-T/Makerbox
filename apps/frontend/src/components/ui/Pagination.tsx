import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import { Link } from '@tanstack/react-router';

interface PaginationProps {
    maxPages: number,
    totalPages: number,
    currentPage: number,
    cursor: number,
    prev: (page: number) => void,
    next: (page: number) => void;

}

function PaginationLink({ children, ...props}: {children: React.ReactNode, className?: string, to:string, onClick?: (() => void) | undefined, search: Record<string, any>} ){
    return (
        <Link 
            to={props.to} 
            onClick={props.onClick} 
            search={props.search}
            preload={false}
            activeProps={{
                className: '!bg-[var(--color-primary)] text-white font-bold !border-none',
            }}
            className= {`p-2 h-10 inline-flex justify-center items-center bg-[var(--color-card)] text-[var(--color-text)] text-semibold hover:bg-[var(--color-secondary)]/25 rounded-[var(--border-radius-ui)] border border-[var(--color-border)] ${props.className}`}
        >
            {children}
        </Link>
    )
}

export default function Pagination({maxPages, totalPages, currentPage, cursor, prev ,next}: PaginationProps){
    const nPages = totalPages >= maxPages 
        ? maxPages 
        : totalPages;
    
    return (
        <div className='w-full flex justify-center my-10'>
            <div className='flex gap-2'>
                <PaginationLink 
                        className={currentPage >= maxPages ? '' : 'invisible'}
                        to={'.'}
                        onClick={() => currentPage%maxPages == 1 ? prev(currentPage - 1) : undefined} 
                        key={'anterior'} 
                        aria-label={`Página anterior`}
                        search={{page: currentPage - 1}}
                    >
                        <RiArrowLeftSLine size={20}/>
                        <span className="px-2">Anterior</span>
                </PaginationLink>
                {
                    Array.from({ length: nPages }).map((_, index) => (
                        <PaginationLink
                            className="w-10"
                            key={index}
                            aria-label={`Página ${cursor*maxPages + index + 1}`} 
                            to={`.`}
                            search={{page: cursor*maxPages + index + 1}}
                        >
                            {cursor*maxPages + index + 1}
                        </PaginationLink>
                    ))
                }
                <PaginationLink 
                    className={!(totalPages <= maxPages && currentPage%totalPages == 0) ? '' : 'invisible'}
                    onClick={() => currentPage%maxPages == 0 ? next(currentPage + 1) : undefined} 
                    key={'siguiente'} 
                    aria-label={`Página siguiente`} 
                    to={`.`} 
                    search={{page: currentPage + 1}}
                >
                    <span className="px-2">Siguiente</span>
                    <RiArrowRightSLine size={20}/>
                </PaginationLink>
            </div>
        </div>
    )
}