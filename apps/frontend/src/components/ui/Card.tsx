import LoadingCircle from '@components/LoadingCircle';
import { RiCircleFill, RiArrowRightLine } from '@remixicon/react';
import '@styles/card.scss'
import { useEffect, useState, type DetailedHTMLProps, type ImgHTMLAttributes } from 'react';

const cardStyle = 'h-[440px] w-[260px] bg-[var(--color-card)] hover:bg-[var(--color-background)] border-1 border-[var(--color-border)] hover:border-[var(--color-primary)] rounded-[var(--border-radius-ui)] flex flex-col hover:-translate-y-[5px] transition-all';

interface cardProps {
    title: string, 
    description: string, 
    subtitle?: string, 
    status?:{
        text: string,
        color: string
    },
    image?: string, 
    link?: string 
}

function AsyncImg(props: DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>,HTMLImageElement>): React.ReactNode{
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if(props.src){
            const img = new Image();
            img.src = props.src;
            img.onload = () => setTimeout( () => setLoaded(true),200);
        }
    }, [props.src]);

    if(loaded) return <img {...props}/>;
    else return <div className={`w-[242px] h-[200px] animate-[pulse_1s_ease-in-out_infinite] bg-[var(--color-border)] ${props.className ?? ''}`}/>;
}

function Card({ title, description, status, subtitle, image, link }: cardProps) {
    return (
        <a href={link} className={cardStyle} target='_blank' rel='noopener noreferrer'>
            <div className='p-2 card-image'>
                <AsyncImg className='rounded-[var(--border-radius-ui)]' src={image ?? 'uploads/images/placeholder.png'} alt={title}/>
            </div>
            <div className='px-4 py-2 flex flex-col gap-2'>
                {status &&
                <div className='px-2 py-1 flex gap-1 align-center items-center rounded-full bg-[#4F4F4F] w-max'>
                     <RiCircleFill size={14} color={status?.color}/> 
                     <span className=' text-[var(--color-text)] text-xs'>{status?.text}</span>
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
        </a>
    )
}
export default Card;