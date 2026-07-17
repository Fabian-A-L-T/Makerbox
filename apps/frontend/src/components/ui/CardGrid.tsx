import { elementsPerPage } from "@utils/Utils";
import type { Component, Project, Tool } from "../../interfaces/schemas";
import Card from "./Card";

function SkeletonCardGrid(){
    return (
        <div className='m-5 grid [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))] gap-y-10'>
            {[...Array(elementsPerPage)].map((_, i) => (
                <Card key={i*-1}/>
            ))}
        </div>
    )
}

function EmptyDataMsg(){
    return (
    <div className="flex justify-center items-center m-5">
        <span className="my-30 text-lg text-[var(--color-text-muted)]">Sin datos</span>
    </div>
)
}


export function ComponentCardGrid<T extends Component>({data, status}:{data: Array<T>, status: "error" | "success" | "pending"}){
    if(status === 'pending') {
        return <SkeletonCardGrid/>
    }
    else if(status === 'success') {
        if(data.length > 0) {
            return  (
                <div className='m-5 grid [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))] gap-y-10'>
                    {data.map((component) => (
                        <Card
                            key={component.id} 
                            title={component.name} 
                            {... component.stock >= component.stock_min 
                                ? {status:{text:'Stock disponible', color:'var(--color-success)'}} 
                                : (component.stock != 0) 
                                    ? {status:{text:'Quedan pocos', color:'var(--color-warning)'}}  
                                    : {status:{text:'Sin stock', color:'var(--color-danger)'}}}
                            description={''} 
                            subtitle={component.manufacturer} 
                            {... component.image_url ? {image:'/' + component.image_url} : {}}
                            link={{pathname: '/manager/components/$id', id: component.id}}
                        />
                    ))}
                </div>
            )
        }
        else {
            return <EmptyDataMsg/>
        }
    }
}

export function ToolCardGrid<T extends Tool>({data, status}:{data: Array<T>, status: "error" | "success" | "pending"}){
    if(status === 'pending') {
        return <SkeletonCardGrid/>
    }
    else if(status === 'success') {
        if(data.length > 0) {
            return (
                <div className='m-5 grid [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))] gap-y-10'>
                    {data.map((tool) => (
                        <Card
                            key={tool.id}
                            title={tool.name}
                                {...(() => {
                                switch (tool.state) {
                                case 'available': return {status:{text:'Disponible', color:'var(--color-success)'}};
                                case 'in_use': return {status:{text:'En uso', color:'var(--color-warning)'}};
                                case 'maintenance':   return {status:{text:'En mantenimiento', color:'var(--color-primary)'}};
                                case 'disposed':   return {status:{text:'Desechado', color:'var(--color-danger)'}};
                                case 'lent':   return {status:{text:'Prestado', color:'var(--color-warning)'}};
                                default:        return null;
                                }
                            })()}
                            description={''}
                            subtitle={tool.manufacturer}
                            {... tool.image_url ? {image:'/' + tool.image_url} : {}}
                            link={{pathname: '/manager/tools/$id', id: tool.id}}
                        />
                    ))}
                </div>
            )}
        else {
            return <EmptyDataMsg/>
        }
    }
}

export function ProjectCardGrid<T extends Project>({data, status}:{data: Array<T>, status: "error" | "success" | "pending"}){
    if(status === 'pending') {
        return <SkeletonCardGrid/>
    }
    else if(status === 'success') {
        if(data.length > 0) {
            return (
                <div className='m-5 grid [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))] gap-y-10'>
                    {data.map((project) => (
                        <Card
                            key={project.id} 
                            title={project.name}
                            {...(() => {
                                switch (project.state) {
                                    case 'active': return {status:{text:'Activo', color:'var(--color-success)'}};
                                    case 'planning': return {status:{text:'En planificación', color:'var(--color-primary)'}};
                                    case 'paused':   return {status:{text:'Pausado', color:'var(--color-warning)'}};
                                    case 'completed':   return {status:{text:'Terminado', color:'var(--color-success)'}};
                                    case 'cancelled':   return {status:{text:'Cancelado', color:'var(--color-danger)'}};
                                    default:        return null;
                                }
                            })()}
                            description={''} 
                            subtitle={project.user_name} 
                            {... project.image_url ? {image:'/' + project.image_url} : {}}
                            link={{pathname: '/manager/projects/$id', id: project.id}}
                        />
                    ))}
                </div>
            )}
        else {
            return <EmptyDataMsg/>
        }
    }
}