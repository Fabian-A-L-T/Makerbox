import { RiCircleFill, RiArrowRightLine } from '@remixicon/react';
import '@styles/card.scss'
import {Link} from '@tanstack/react-router';
import { AsyncImg } from '@utils/Utils';

const cardStyle = 'h-[440px] w-[260px] bg-[var(--color-card-bg)] hover:bg-[var(--color-background)] border-1 border-[var(--color-border)] hover:border-[var(--color-primary)] rounded-[var(--border-radius-ui)] flex flex-col hover:-translate-y-[5px] transition-transform';

interface cardProps {
    title?: string, 
    description?: string, 
    subtitle?: string, 
    status?:{
        text: string,
        color: string
    },
    image?: string, 
    link?: {
        pathname: string,
        id?: string | number
    }
}

export default function Card({ title, description, status, subtitle, image, link }: cardProps) {

    //Skeleton mode
    if(!title) return (
        <div className={cardStyle}>
            <div className='p-2 card-image'>
                <div className='w-[242px] h-[200px] rounded-[var(--border-radius-ui)]  animate-[pulse_1s_ease-in-out_infinite] bg-[var(--color-border)]'/>
            </div>
            <div className='px-4 py-2 flex flex-col gap-2'>
                <div className='w-1/2 h-6 px-2 py-1 flex gap-1 align-center items-center rounded-full bg-[var(--color-border)] animate-[pulse_1s_ease-in-out_infinite]'/>
                <div className='mb-2'>
                    <div className='w-full mb-2 h-7 rounded-full animate-[pulse_1s_ease-in-out_infinite] bg-[var(--color-border)]'/>
                    <div className='w-1/2 h-5 rounded-full animate-[pulse_1s_ease-in-out_infinite] bg-[var(--color-border)]'/>
                </div>
                <div className='w-3/4 h-4 rounded-full animate-[pulse_1s_ease-in-out_infinite] bg-[var(--color-border)]'/>
                <div className='w-1/2 h-4 rounded-full animate-[pulse_1s_ease-in-out_infinite] bg-[var(--color-border)]'/>
            </div>
            <div className='p-3 h-12 flex gap-1 mt-auto rounded-b-[var(--border-radius-ui)] flex items-center justify-center bg-[var(--color-border)] animate-[pulse_1s_ease-in-out_infinite]'/>
        </div>
    )

    return (
        <Link 
            to={link?.pathname || '.'} 
            params={link?.id !== undefined ? { id: link?.id.toString() } : undefined}
            className={cardStyle}
        >
            <div className='p-2 card-image'>
                <AsyncImg className='w-[242px] h-[200px] rounded-[var(--border-radius-ui)]' src={image} alt={title} notFoundSubtitle="Imagen no disponible"/>
            </div>
            <div className='px-4 py-2 flex flex-col gap-2'>
                {status &&
                <div className='px-2 py-1 flex gap-1 align-center items-center rounded-full bg-[var(--color-border)] w-max'>
                     <RiCircleFill size={14} color={status?.color}/> 
                     <span className='text-xs'>{status?.text}</span>
                </div>
                }
                <div>
                    <h2 className="card-title" >{title}</h2>
                    <p className="card-subtitle mb-4 text-sm">{subtitle}</p>
                </div>
                <p className="card-description" >{description}</p>
            </div>
            <div className='p-3 flex gap-1 mt-auto rounded-b-[var(--border-radius-ui)] flex items-center justify-center bg-[var(--color-border)]'>
                <p className="text-md font-semibold text-[var(--color-text-muted)]">Más información</p>
                <RiArrowRightLine size={18} color='var(--color-text)'/>
            </div>
        </Link>
    )
}
