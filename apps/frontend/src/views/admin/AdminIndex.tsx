import { RiCpuLine, RiFileListLine, RiFunctionLine, RiGroupLine, RiMapPinLine, RiNodeTree, RiPencilRulerLine, RiWrenchLine } from "@remixicon/react"
import { Link } from "@tanstack/react-router"
import '@styles/card.scss'
import InfoCard from "@components/ui/InfoCard"

export default function AdminIndex() {
    const features = [
        {
            title: 'Categorias', 
            description: 'Gestión de las categorías de componentes electrónicos y herramientas', 
            icon: RiNodeTree,
            link: '/manager/admin/categories/'
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
            icon: RiGroupLine,
            link: '/manager/admin/movements'
        },
        {
            title: 'Proyectos', 
            description: 'Gestión de los proyectos publicados por usuarios', 
            icon: RiPencilRulerLine,
            link: '/manager/admin/projects'
        }
    ]

    return (
        <div className="flex gap-5">
            <div className="makerbox-box w-max flex flex-col gap-5">
                <div className="makerbox-box-title flex items-center gap-2 w-max">
                    <RiFileListLine size={24}/>
                    <span>Resumen</span>
                </div>
                <div className="flex flex-col gap-5">
                    <InfoCard title={'Componentes'} value={1234567} Icon={RiCpuLine}/>
                    <InfoCard title={'Herramientas'} value={1234567} Icon={RiWrenchLine}/>
                    <InfoCard title={'Proyectos'} value={1234567} Icon={RiPencilRulerLine}/>
                </div>
            </div>
            <div className="makerbox-box w-full flex flex-col gap-4">
                <div className="makerbox-box-title flex items-center gap-2">
                    <RiFunctionLine size={24}/>
                    <span>Administrar</span>
                </div>
                <div className="grid grid-cols-5 gap-10">
                    {features.map((feature) => (
                        <Link key={feature.link} to={feature.link} className='card flex items-center gap-2'>
                            <feature.icon size={24}/>
                            <span className="font-medium">{feature.title}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}