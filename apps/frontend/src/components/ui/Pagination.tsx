import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import { Link } from '@tanstack/react-router';
import { paginationMaxPages } from "@utils/Utils";
import { useMemo } from "react";

interface PaginationProps {
    dataStatus: "success" | "error" | "pending";
    pagination: { page: number, maxPages: number, totalPages: number }
    filters?: Record<string, string | number | boolean | undefined>,
    mask?: Record<string, string | number | boolean | undefined>,
    hasPrev: boolean,
    hasNext: boolean,
    prev?: () => void,
    next?: () => void,
}

const linkStyle = 'p-2 h-10 inline-flex justify-center items-center bg-[var(--color-card)] text-semibold hover:bg-[var(--color-secondary)]/25 rounded-[var(--border-radius-ui)] border border-[var(--color-border)]';

export default function Pagination({dataStatus, pagination, filters, mask, hasPrev, hasNext, prev, next}: PaginationProps){
    const { page, maxPages, totalPages } = pagination;
    
    const chunk = useMemo(() =>   ~~((page - 1)/maxPages),[page]);
    const chunkIndex = useMemo(() => (page - 1)%maxPages, [page]);

    if(dataStatus === 'success' && totalPages > 0) return (
        <div className='w-full flex justify-center my-10 gap-2'>
            <Link 
                to={'.'}
                search={{...filters, page: page - 1}}
                mask={{to: '.', search: {...filters, page: page - 1, ...mask}}}
                aria-label={`Página anterior`}
                className={`${linkStyle} ${chunkIndex !== 0 || (chunkIndex === 0 && hasPrev) ? '' : 'invisible'}`}
                {... chunkIndex === 0 && hasPrev && {onClick: prev}}
            >
                <RiArrowLeftSLine size={20}/>
                <span className="px-2">Anterior</span>
            </Link>
            {
                Array.from({ length: totalPages }).map((_, index) => {
                    const currPage = chunk*maxPages + index + 1;
                    return (
                    <Link
                        disabled={page === currPage}
                        to={`.`}
                        search={{...filters, page: currPage}}
                        mask={{to: '.', search: {...filters, page: currPage, ...mask}}}
                        key={index}
                        aria-label={`Página ${currPage}`} 
                        className={`w-10 ${linkStyle} ${page === currPage ? '!bg-[var(--color-primary)] text-white font-bold !border-none' : ''}`}
                    >
                        {currPage}
                    </Link>
                )})
            }
            <Link 
                to={'.'} 
                search={{...filters, page: page + 1}}
                mask={{to: '.', search: {...filters, page: page + 1, ...mask}}}
                aria-label={`Página siguiente`} 
                className={`${linkStyle} ${(chunkIndex !== totalPages - 1) || (chunkIndex === maxPages - 1 && hasNext) ? '' : 'invisible'}`}
                {... chunkIndex === maxPages - 1 && hasNext && {onClick: next}}
            >
                <span className="px-2">Siguiente</span>
                <RiArrowRightSLine size={20}/>
            </Link>
        </div>
    )
    else if(dataStatus === 'pending') return (
        <div className='w-full flex justify-center my-10 gap-2'>
            <div className="w-28 h-10 rounded-[var(--border-radius-ui)] animate-pulse bg-[var(--color-table-header)]"/>
            {[...Array(paginationMaxPages)].map((_, i) => 
                <div key={i} className="w-10 h-10 rounded-[var(--border-radius-ui)] animate-pulse bg-[var(--color-table-header)]"/>
            )}
            <div className="w-28 h-10 rounded-[var(--border-radius-ui)] animate-pulse bg-[var(--color-table-header)]"/>
        </div>
    )
}
