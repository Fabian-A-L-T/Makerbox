import LoadingCircle from "@components/LoadingCircle";
import Card from "@components/ui/Card";
import CardContainer from "@components/ui/CardContainer";
import { Await, CatchBoundary, getRouteApi } from "@tanstack/react-router";
import type { Component, Tool } from "@utils/schemas";
import { AxiosError, type AxiosResponse } from "axios";
import AdminIndex from "./admin/AdminIndex";

export default function Home(){
    const route = getRouteApi('/_auth/manager/');
    const {auth: {checkAuth, user}} = route.useRouteContext();
    const { toolData, componentData } = route.useLoaderData() as {toolData: Promise<AxiosResponse<Tool[]>>, componentData: Promise<AxiosResponse<Component[]>>, test: Promise<string>};
    return (
        <>
            <div className="text-[var(--color-text)]">
                <h1 className="text-3xl">Inicio</h1>
                <p>Bienvenido a makerbox</p>
            </div>
            { user.role === 'admin' && (
                <AdminIndex/>
            )}
            <CardContainer title="Componentes" subtitle="Subidos recientemente" link={{href: '/manager/components', text:'Ver más'}}>
                <CatchBoundary 
                    getResetKey={() => 'reset'} 
                    onCatch={(error) => {
                        if(error instanceof AxiosError) checkAuth();
                        throw error;
                    }}
                >
                    <Await promise={componentData} fallback={<div className='col-span-4 my-20'><LoadingCircle/></div>}>
                        {(response) => { return response.data.length
                            ? response.data.map((component) => (
                                <Card
                                    key={component.id} 
                                    title={component.name} 
                                    {... component.stock > component.stock_min 
                                        ? {status:{text:'Stock disponible', color:'var(--color-success)'}} 
                                        : (component.stock != 0) 
                                            ? {status:{text:'Quedan pocos', color:'var(--color-warning)'}}  
                                            : {status:{text:'Sin stock', color:'var(--color-danger)'}}}
                                    description={component.description} 
                                    subtitle={component.manufacturer} 
                                    {... component.image_url ? {image:'/' + component.image_url} : {}}
                                    link={{pathname: '/manager/components/$id', id: component.id}}
                                />
                            )) 
                            :(
                                <div className="col-span-4 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-400 text-sm">
                                    <strong>No se han encontrado resultados</strong>
                                </div>
                            )
                        }}
                    </Await>
                </CatchBoundary>
            </CardContainer>
            <CardContainer title="Herramientas" subtitle="Subidos recientemente" link={{href: '/manager/tools', text:'Ver más'}}>
                <CatchBoundary 
                        getResetKey={() => 'reset'} 
                        onCatch={(error) => {
                            if(error instanceof AxiosError) checkAuth();
                            throw error;
                        }}
                    >
                        <Await promise={toolData} fallback={<div className='col-span-4 my-20'><LoadingCircle/></div>}>
                            {(response) => { return response.data.length 
                                ? response.data.map((tool) => (
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
                                        description={tool.location}
                                        subtitle={tool.manufacturer}
                                        {... tool.image_url ? {image:'/' + tool.image_url} : {}}
                                        link={{pathname: '/manager/tools/$id', id: tool.id}}
                                    />
                                )) 
                                :(
                                    <div className="col-span-4 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-400 text-sm">
                                        <strong>No se han encontrado resultados</strong>
                                    </div>
                                )
                            }}
                    </Await>
                </CatchBoundary>
            </CardContainer>
        </>
    );
}