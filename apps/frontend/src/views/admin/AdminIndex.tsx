import { RiCpuLine, RiFileListLine, RiFunctionLine, RiGroupLine, RiMapPinLine, RiNodeTree, RiPencilRulerLine, RiSwap2Line, RiWrenchLine } from "@remixicon/react"
import { Link } from "@tanstack/react-router"
import '@styles/card.scss'
import InfoCard from "@components/ui/InfoCard"

export default function AdminIndex({compTotal, toolTotal, projTotal}: {compTotal?: number, toolTotal?: number, projTotal?: number}) {
    const adminPages = [
        {
            title: 'Categorías', 
            description: 'Gestión de las categorías de componentes electrónicos y herramientas', 
            icon: RiNodeTree,
            link: '/manager/admin/categories/components'
        },
        {
            title: 'Componentes', 
            description: 'Gestión de componentes electrónicos', 
            icon: RiCpuLine,
            link: '/manager/admin/components'
        },
        {
            title: 'Herramientas', 
            description: 'Gestión de las distintas herramientas del taller', 
            icon: RiWrenchLine,
            link: '/manager/admin/tools'
        },
        {
            title: 'Fabricantes', 
            description: 'Gestión de los registros de fabricantes de componentes y herramientas', 
            icon: RiCpuLine,
            link: '/manager/admin/manufacturers'
        },
        {
            title: 'Ubicaciones', 
            description: 'Gestión de las ubicaciones de componentes y herramientas', 
            icon: RiMapPinLine,
            link: '/manager/admin/locations'
        },
        {
            title: 'Usuarios', 
            description: 'Gestión de los usuarios del sistema', 
            icon: RiGroupLine,
            link: '/manager/admin/users'
        },
        {
            title: 'Movimientos', 
            description: 'Gestión de los movimientos de inventario', 
            icon: RiSwap2Line,
            link: '/manager/admin/movements'
        },
        {
            title: 'Proyectos', 
            description: 'Gestión de los proyectos publicados por usuarios', 
            icon: RiPencilRulerLine,
            link: '/manager/admin/projects'
        }
    ];

    return (
        <div className="flex md:flex-col lg:flex-row gap-5">
            <div className="makerbox-box lg:w-max md:w-full flex flex-col gap-5 !pb-1">
                <div className="makerbox-box-title flex items-center gap-2 w-max">
                    <RiFileListLine size={24}/>
                    <span>Resumen</span>
                </div>
                <div className="flex md:overflow-x-auto md:flex-row lg:flex-col gap-5 pb-4">
                    <InfoCard title={'Componentes'} value={compTotal} Icon={RiCpuLine} className="!border-[var(--color-text-muted)]" color="var(--color-text-muted)"/>
                    <InfoCard title={'Herramientas'} value={toolTotal} Icon={RiWrenchLine} className="!border-[var(--color-text-muted)]" color="var(--color-text-muted)"/>
                    <InfoCard title={'Proyectos'} value={projTotal} Icon={RiPencilRulerLine} className="!border-[var(--color-text-muted)]" color="var(--color-text-muted)"/>
                </div>
            </div>
            <div className="makerbox-box w-full flex flex-col gap-4">
                <div className="makerbox-box-title flex items-center gap-2">
                    <RiFunctionLine size={24}/>
                    <span>Administrar</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
                    {adminPages.map((page) => (
                        <Link key={page.link} to={page.link} className='card w-full flex items-center gap-2'>
                            <page.icon size={24}/>
                            <span className="font-medium">{page.title}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}