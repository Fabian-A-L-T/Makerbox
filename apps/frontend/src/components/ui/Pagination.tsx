import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import { Link } from '@tanstack/react-router';

interface PaginationProps {
    maxPages: number,
    totalPages: number,
    currentPage: number,
    cursor: number,
    filters?: Record<string, string | number | boolean>,
    mask?: Record<string, string | number | boolean | undefined>
}

export default function Pagination({maxPages, totalPages, currentPage, cursor, filters, mask}: PaginationProps){
    const nPages = totalPages >= maxPages 
        ? maxPages 
        : totalPages;
    const linkStyle = 'p-2 h-10 inline-flex justify-center items-center bg-[var(--color-card)] text-[var(--color-text)] text-semibold hover:bg-[var(--color-secondary)]/25 rounded-[var(--border-radius-ui)] border border-[var(--color-border)]'
    
    return (
        <div className='w-full flex justify-center my-10'>
            <div className='flex gap-2'>
                <Link 
                    to={'.'}
                    search={{...filters, page: currentPage - 1}}
                    mask={{to: '.', search: {...filters, page: currentPage - 1, ...mask}}}
                    key={'anterior'} 
                    aria-label={`Página anterior`}
                    className={`${linkStyle} ${currentPage >= maxPages ? '' : 'invisible'}`}
                >
                    <RiArrowLeftSLine size={20}/>
                    <span className="px-2">Anterior</span>
                </Link>
                {
                    Array.from({ length: nPages }).map((_, index) => (
                        <Link
                            disabled={cursor*maxPages + index + 1 === currentPage}
                            to={`.`}
                            search={{...filters, page: cursor*maxPages + index + 1}}
                            mask={{to: '.', search: {...filters, page: cursor*maxPages + index + 1, ...mask}}}
                            key={index}
                            aria-label={`Página ${cursor*maxPages + index + 1}`} 
                            className={`w-10 ${linkStyle} ${cursor*maxPages + index + 1 === currentPage ? '!bg-[var(--color-primary)] text-white font-bold !border-none' : ''}`}
                        >
                            {cursor*maxPages + index + 1}
                        </Link>
                    ))
                }
                <Link 
                    to={'.'} 
                    search={{...filters, page: currentPage + 1}}
                    mask={{to: '.', search: {...filters, page: currentPage + 1, ...mask}}}
                    key={'siguiente'} 
                    aria-label={`Página siguiente`} 
                    className={`${linkStyle} ${!(totalPages <= maxPages && currentPage%totalPages == 0) ? '' : 'invisible'}`}
                    
                >
                    <span className="px-2">Siguiente</span>
                    <RiArrowRightSLine size={20}/>
                </Link>
            </div>
        </div>
    )
}
