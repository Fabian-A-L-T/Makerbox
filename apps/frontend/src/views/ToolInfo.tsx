import { Breadcrumb, Breadcrumbs } from '@components/ui/Breadcrumbs';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@components/ui/Tabs';
import { parseAbsoluteToLocal } from '@internationalized/date';
import { RiArrowRightSLine, RiCircleFill, RiFileDownloadLine } from '@remixicon/react';
import { getRouteApi } from '@tanstack/react-router';
import { AsyncImg } from '@utils/Utils';

export default function ToolInfo() {
    
    const route = getRouteApi('/_auth/manager/tools/$id');
    const { data: tool } = route.useRouteContext()
    const parseDate = parseAbsoluteToLocal(tool.created_at);
    const publishedDate = parseDate.day.toString() + '/' + parseDate.month.toString() + '/' + parseDate.year.toString();

    const categoryRoute = tool.category.replaceAll('_', ' ').split('.');
    const category = categoryRoute.at(-1);

    let statusColor;
    
    switch (tool.state) {
        case 'available':
            statusColor = {color: 'var(--color-success)', status: 'Disponible'};
            break;
        case 'in_use':
            statusColor = {color: 'var(--color-warning)', status: 'En uso'};
            break;
        case 'lent':
            statusColor = {color: 'var(--color-warning)', status: 'Prestado'};
            break;
        case 'maintenance':
            statusColor = {color: 'var(--color-primary)', status: 'En mantenimiento'};
            break;
        case 'disposed':
            statusColor = {color: 'var(--color-danger)', status: 'Desechado'};
            break;
        default:
            statusColor = {color: 'var(--color-danger)', status: 'Error'};
            break;
    }

    return (
        <>
            <Breadcrumbs className={'p-4'}>
                <Breadcrumb href='/manager/'>Inicio</Breadcrumb>
                <Breadcrumb href='/manager/tools/'>Herramientas</Breadcrumb>
                <Breadcrumb>{tool.name}</Breadcrumb>
            </Breadcrumbs>
            <div className="p-4 flex lg:flex-row md:flex-col gap-8">
                <div className="xl:w-2/5 lg:w-1/2">
                    <AsyncImg className="aspect-square w-full object-cover rounded-[var(--border-radius-ui)]" src={'/' + tool.image_url} alt={tool.name}/>
                </div>
                <div className="flex flex-col justify-between xl:w-3/5 lg:w-1/2">
                    <div className='flex flex-col'>
                        <div className="flex justify-between mb-4">
                            <div className='flex items-center'>
                                <p className="text-sm text-[var(--color-text-muted)] mr-2">Categoría:</p>
                                {categoryRoute.map((cat, index) => (
                                    <div key={index} className='flex w-max'>
                                        <p className="text-sm text-[var(--color-text-muted)]">{cat}</p>
                                        {index !== categoryRoute.length - 1 && (<RiArrowRightSLine color='var(--color-text-muted)' size={20}/>)}
                                    </div>
                                ))}
                            </div>
                            <span className="text-sm text-[var(--color-text-muted)]">Publicado el: {publishedDate}</span>
                        </div>
                        <div className="flex flex-col gap-4 mb-4">
                            <div className='flex flex-col gap-1 py-2'>
                                <h1 className="text-3xl font-bold ">{tool.name}</h1>
                                <span className="text-sm text-[var(--color-text-muted)]">SKU: {tool.sku}</span>
                            </div>
                            <div className=' border-2 border-[var(--color-border)] rounded-[var(--border-radius-ui)] overflow-hidden'>
                                <div className='w-full px-3 py-2 flex justify-between align-center items-center bg-[var(--color-border)]'>
                                    <div className='flex gap-2 items-center'>
                                        <RiCircleFill size={16} color={statusColor.color}/> 
                                        <span className='text-sm'>{statusColor.status}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='divide-y-2 divide-[var(--color-border)]'>
                            <p className="text-[var(--color-text-muted)] py-2">Modelo: {tool.model}</p>
                            <p className="text-[var(--color-text-muted)] py-2">Número de serie: {tool.serial_number}</p>
                            <p className="text-[var(--color-text-muted)] py-2">Fabricante: {tool.manufacturer}</p>
                            <p className="text-[var(--color-text-muted)] py-2">Categoría: {category}</p>
                            <p className="text-[var(--color-text-muted)] py-2">Ubicación: {tool.location}</p>
                        </div>
                    </div>
                    {tool.manual_url && 
                        <a href={'/' + tool.manual_url} 
                            target='_blank' 
                            className='p-4 flex gap-4 items-center justify-center rounded-[var(--border-radius-ui)] bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/60 border-[var(--color-primary)]/20 hover:border-[var(--color-primary)]/40 text-white'
                        >
                            <RiFileDownloadLine size={20}/>
                            Descargar manual
                        </a>
                    }
                </div>
            </div>
            <Tabs>
                <TabList>
                    {tool.notes && <Tab id='notes'>Notas</Tab>}
                    <Tab id='usedin'>Usado en</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel id="notes" className="flex">
                        <p>{tool.notes}</p>
                    </TabPanel>
                    <TabPanel id="usedin" className="flex">
                        <p>En construcción</p>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </>
    );
}