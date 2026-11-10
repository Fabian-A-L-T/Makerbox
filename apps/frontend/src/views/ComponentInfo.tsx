import { parseAbsoluteToLocal } from '@internationalized/date';
import { RiFileDownloadLine } from '@remixicon/react';
import { getRouteApi } from '@tanstack/react-router';
import type { Component, ComponentLocation } from '../interfaces/schemas';
import { Delta } from 'quill/core';
import 'quill/dist/quill.core.css';
import InfoTooltip from '@components/ui/InfoTooltip';
import InfoLayout from '@components/layouts/InfoLayout';
import { quillGetHTML } from '@utils/Utils';

export default function ComponentInfo() {
    
    const route = getRouteApi('/_auth/manager/components/$id');
    const { components, locations } = route.useLoaderData() as {components: Component, locations: ComponentLocation[]};

    let deltaData: Delta;
    let descHTML: string = '';

    try {
        deltaData = components.description ? JSON.parse(components.description) : new Delta();
    } 
    catch (error) {
        deltaData = new Delta();
    }
    if(deltaData.ops && deltaData.ops.length > 0 && deltaData.ops[0].insert !== '\n') { 
        descHTML = quillGetHTML(deltaData);
    }

    const parseDate = parseAbsoluteToLocal(components.created_at);
    const publishedDate = parseDate.day.toString() + '/' + parseDate.month.toString() + '/' + parseDate.year.toString();
    
    const categoryRoute = components.category.replaceAll('_', ' ').split('.');
    const category = categoryRoute.at(-1) || '';
    
    let statusColor = {color: 'var(--color-success)', name: 'Disponible'};
    
    if (components.stock == 0) {
        statusColor.color = 'var(--color-danger)';
        statusColor.name = 'Sin stock';
    }
    else if (components.stock < components.stock_min) {
        statusColor.color = 'var(--color-warning)';
        statusColor.name = 'Quedan pocos';
    }
    const breadcrumbData = [
        {href: '/manager/', name: 'Dashboard'}, 
        {href: '/manager/components/', name: 'Componentes'}, 
        {name: components.name},
    ];
    const tabs = [
        {id: 'desc', name: 'Descripción', content: descHTML ? <div className='w-full' dangerouslySetInnerHTML={{ __html: descHTML }} /> : <p>No hay descripción disponible.</p>},
        {id: 'notes', name: 'Notas', content: components.notes ? <p>{components.notes}</p> : <p>No hay notas disponibles.</p>}
    ];
    const infoData = [
        {title: 'Fabricante', value: components.manufacturer, additionalInfo: components.manufacturer_website && <InfoTooltip size={18}><a className='text-sm' href={components.manufacturer_website} target='_blank'>Sitio web del fabricante</a></InfoTooltip>},
        {title: 'Categoría', value: category, additionalInfo: <InfoTooltip size={18}><span className='text-sm'>{components.category.replaceAll('_', ' ').replaceAll('.', ' > ')}</span></InfoTooltip>},
        {title: 'Costo unitario', value: '$' + components.unit_cost.toLocaleString()}
    ];

    return (
        <InfoLayout title={components.name} subtitle={components.sku} stock={components.stock} 
            locationData={
                (<>{locations.length > 0 &&
                    <div className='px-2 divide-y-2 divide-[var(--color-border)] overflow-y-auto'>
                        {locations.map((value) => 
                            <div key={value.location_id} className='flex justify-between items-center w-full p-2'>
                                <div className='flex flex-col'>
                                    <div className='flex gap-1'>
                                        <span>{value.location_name}</span>
                                        {value.location_description && <InfoTooltip><span className='text-sm'>{value.location_description}</span></InfoTooltip> }
                                    </div>
                                    <span className='text-xs text-[var(--color-text-muted)]'>{value.location_route.replaceAll('_', ' ').replaceAll('.', ' > ')}</span>
                                </div>
                                <span>{value.amount}</span>
                            </div>
                        )}
                    </div>
                }</>)
            }
            status={statusColor}
            buttonUrl={components.datasheet_url && '/' + components.datasheet_url}
            buttonText={<><RiFileDownloadLine size={20}/> Descargar datasheet</>}
            imgUrl={components.image_url}
            publishedDate={publishedDate}
            breadcrumbData={breadcrumbData}
            tabData={tabs}
            infoData={infoData}
        />
    );
}