import { RiCpuLine, RiGroupLine, RiMapPinLine, RiNodeTree, RiWrenchLine } from "@remixicon/react"
import { Link } from "@tanstack/react-router"
import '@styles/card.scss'

export default function AdminIndex() {
    const features = [
        {
            title: 'Categorias de componentes', 
            description: 'Gestión de las categorías de componentes electrónicos', 
            icon: RiNodeTree,
            link: '/manager/admin/categories/components'
        },
        {
            title: 'Categorias de herramientas', 
            description: 'Gestión de las categorías de herramientas', 
            icon: RiNodeTree,
            link: '/manager/admin/categories/tools'
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
        }
    ]

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="">
                <h1>Panel de control para administradores</h1>
                <p>Aquí podrás gestionar los distintos componentes del sistema</p>
            </div>
            <div className="grid grid-cols-4 gap-10">
                {features.map((feature) => (
                    <Link key={feature.link} to={feature.link} className='card flex flex-col'>
                        <div className="p-10 flex items-center justify-center">
                            <feature.icon size={64} color="var(--color-text)"/>
                        </div>
                        <div className='card-content'>
                            <h2 className="card-title" >{feature.title}</h2>
                            <p className="card-description" >{feature.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}