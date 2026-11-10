import InfoLayout from '@components/layouts/InfoLayout';
import InfoTooltip from '@components/ui/InfoTooltip';
import { parseAbsoluteToLocal } from '@internationalized/date';
import { RiFileDownloadLine } from '@remixicon/react';
import { getRouteApi } from '@tanstack/react-router';
import { quillGetHTML } from '@utils/Utils';
import { Delta } from 'quill/core';

export default function ToolInfo() {
    
    const route = getRouteApi('/_auth/manager/tools/$id');
    const { data: tool } = route.useRouteContext()
    const parseDate = parseAbsoluteToLocal(tool.created_at);
    const publishedDate = parseDate.day.toString() + '/' + parseDate.month.toString() + '/' + parseDate.year.toString();

    const categoryRoute = tool.category.replaceAll('_', ' ').split('.');
    const category = categoryRoute.at(-1) || '';

    let deltaData: Delta;
    let descHTML: string = '';

    try {
        deltaData = tool.description ? JSON.parse(tool.description) : new Delta();
    } 
    catch (error) {
        console.error('Error parsing defaultValue:', error);
        deltaData = new Delta();
    }
    if(deltaData.ops && deltaData.ops.length > 0 && deltaData.ops[0].insert !== '\n') { 
        descHTML = quillGetHTML(deltaData);
    }

    let statusColor;
    
    switch (tool.state) {
        case 'available':
            statusColor = {color: 'var(--color-success)', name: 'Disponible'};
            break;
        case 'in_use':
            statusColor = {color: 'var(--color-warning)', name: 'En uso'};
            break;
        case 'lent':
            statusColor = {color: 'var(--color-warning)', name: 'Prestado'};
            break;
        case 'maintenance':
            statusColor = {color: 'var(--color-primary)', name: 'En mantenimiento'};
            break;
        case 'disposed':
            statusColor = {color: 'var(--color-danger)', name: 'Desechado'};
            break;
        default:
            statusColor = {color: 'var(--color-danger)', name: 'Error'};
            break;
    }

    const breadcrumbData = [
        {href: '/manager/', name: 'Dashboard'}, 
        {href: '/manager/tools/', name: 'Herramientas'}, 
        {name: tool.name},
    ];
    const tabs = [
        {id: 'desc', name: 'Descripción', content: descHTML ? <div className='w-full' dangerouslySetInnerHTML={{ __html: descHTML }} /> : <p>No hay descripción disponible.</p>},
        {id: 'notes', name: 'Notas', content: tool.notes ? <p>{tool.notes}</p> : <p>No hay notas disponibles.</p>}
    ];
    const infoData = [
        {title: 'Modelo', value: tool.model},
        {title: 'Número de serie', value: tool.serial_number},
        {title: 'Fabricante', value: tool.manufacturer},
        {title: 'Categoría', value: category}
    ];

    return (
        <InfoLayout title={tool.name} subtitle={tool.sku}
            locationData={
                <div className='flex flex-col w-full p-4'>
                    <div className='flex gap-1'>
                        <span>{tool.location_name}</span>
                        {tool.location_description && <InfoTooltip><span className='text-sm'>{tool.location_description}</span></InfoTooltip> }
                    </div>
                    <span className='text-xs text-[var(--color-text-muted)]'>{tool.location_route.replaceAll('_', ' ').replaceAll('.', ' > ')}</span>
                </div>
            }
            status={statusColor}
            buttonUrl={tool.manual_url && '/' + tool.manual_url}
            buttonText={<><RiFileDownloadLine size={20}/> Descargar manual</>}
            imgUrl={tool.image_url}
            publishedDate={publishedDate}
            breadcrumbData={breadcrumbData}
            tabData={tabs}
            infoData={infoData}
        />
    );
}