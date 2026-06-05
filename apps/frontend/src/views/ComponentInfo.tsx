import { Breadcrumb, Breadcrumbs } from '@components/ui/Breadcrumbs';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@components/ui/Tabs';
import { parseAbsoluteToLocal } from '@internationalized/date';
import { RiCircleFill, RiFileDownloadLine } from '@remixicon/react';
import { getRouteApi } from '@tanstack/react-router';
import type { Component, ComponentLocation } from '@utils/schemas';

export default function ComponentInfo() {
    
    const route = getRouteApi('/_auth/manager/components/$id');
    const { components, locations } = route.useLoaderData() as {components: Component, locations: ComponentLocation[]};

    const parseDate = parseAbsoluteToLocal(components.created_at);
    const publishedDate = parseDate.day.toString() + '/' + parseDate.month.toString() + '/' + parseDate.year.toString();

    let statusColor = {color: 'var(--color-success)', status: 'Disponible'};
    
    if (components.stock == 0) {
        statusColor.color = 'var(--color-danger)';
        statusColor.status = 'Sin stock';
    }
    else if (components.stock < components.stock_min) {
        statusColor.color = 'var(--color-warning)';
        statusColor.status = 'Quedan pocos';
    }

    return (
        <>
            <Breadcrumbs className={'text-[var(--color-text)] p-4'}>
                <Breadcrumb href='/manager/'>Inicio</Breadcrumb>
                <Breadcrumb href='/manager/components/'>Componentes</Breadcrumb>
                <Breadcrumb>{components.name}</Breadcrumb>
            </Breadcrumbs>
            <div className="p-4 flex lg:flex-row md:flex-col gap-8">
                <div className="xl:w-2/5 lg:w-1/2">
                    <img src={components.image_url ? '/' + components.image_url : '/uploads/images/placeholder.png'} alt={components.name} className="aspect-square w-full object-cover rounded-lg"/>
                </div>
                <div className="flex flex-col justify-between xl:w-3/5 lg:w-1/2">
                    <div className='flex flex-col'>
                        <div className="flex justify-between mb-4">
                            <span className="text-xs text-[var(--color-text-muted)]">SKU: {components.sku}</span>
                            <span className="text-xs text-[var(--color-text-muted)]">Publicado el: {publishedDate}</span>
                        </div>
                        <div className="flex flex-col gap-4 mb-4 text-[var(--color-text)]">
                            <h1 className="text-3xl font-bold ">{components.name}</h1>
                            <div className=' border-2 border-[var(--color-border)] rounded-[var(--border-radius-ui)] overflow-hidden'>
                                <div className='w-full px-3 py-2 flex justify-between align-center items-center bg-[var(--color-border)]'>
                                    <div className='flex gap-2 items-center'>
                                        <RiCircleFill size={16} color={statusColor.color}/> 
                                        <span className='text-sm'>{statusColor.status}</span>
                                    </div>
                                    <span className='text-sm'>{'Stock: ' + components.stock.toString()}</span>
                                </div>
                                {locations.length > 0 &&
                                    <div className='p-4 divide-y-2 divide-[var(--color-border)]'>
                                        {locations.map((value) => 
                                            <div className='flex justify-between w-full'>
                                                <span>{value.location_name}</span>
                                                <span>{value.amount}</span>
                                            </div>
                                        )}
                                    </div>
                                }
                            </div>
                        </div>
                        <div className='divide-y-2 divide-[var(--color-border)]'>
                            <p className="text-[var(--color-text-muted)] py-2">Fabricante: {components.manufacturer}</p>
                            <p className="text-[var(--color-text-muted)] py-2">Categoría: {components.category}</p>
                            {components.metric && <p className="text-[var(--color-text-muted)] py-2">Valor: {components.metric}</p>}
                        </div>
                    </div>
                    {components.datasheet_url && 
                        <a href={'/' + components.datasheet_url} 
                            target='_blank' 
                            className='p-4 flex gap-4 items-center justify-center rounded-[var(--border-radius-ui)] bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/60 border-[var(--color-primary)]/20 hover:border-[var(--color-primary)]/40 text-white'
                        >
                            <RiFileDownloadLine size={20}/>
                            Descargar datasheet
                        </a>
                    }
                </div>
            </div>
            <Tabs>
                <TabList>
                    <Tab id='desc'>Descripción</Tab>
                    {components.notes && <Tab id='notes'>Notas</Tab>}
                    <Tab id='usedin'>Usado en</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel id="desc" className="flex">
                        <p>{components.description}</p>
                    </TabPanel>
                    <TabPanel id="notes" className="flex">
                        <p>{components.notes}</p>
                    </TabPanel>
                    <TabPanel id="usedin" className="flex">
                        <p>En construcción</p>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </>
    );
}