import { Breadcrumb, Breadcrumbs } from '@components/ui/Breadcrumbs';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@components/ui/Tabs';
import { parseAbsoluteToLocal } from '@internationalized/date';
import { RiArrowRightSLine, RiCircleFill, RiFileDownloadLine } from '@remixicon/react';
import { getRouteApi } from '@tanstack/react-router';
import type { Component, ComponentLocation } from '../interfaces/schemas';
import { AsyncImg, quillInlineStyles } from '@utils/Utils';
import DOMPurify from 'dompurify';
import { Delta } from 'quill/core';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
import 'quill/dist/quill.core.css';

function quillGetHTML(inputDelta: Delta): string {
    const converter = new QuillDeltaToHtmlConverter(inputDelta.ops ?? [], {
        paragraphTag: 'p',
        encodeHtml: true,
        inlineStyles: quillInlineStyles,
        urlSanitizer: (url: string) => {
            const sanitizedUrl = DOMPurify.sanitize(url);
            return sanitizedUrl;
        }
    });

    return converter.convert();
}

export default function ComponentInfo() {
    
    const route = getRouteApi('/_auth/manager/components/$id');
    const { components, locations } = route.useLoaderData() as {components: Component, locations: ComponentLocation[]};

    let deltaData: Delta;
    let descHTML: string = '';

    try {
        deltaData = components.description ? JSON.parse(components.description) : new Delta();
    } 
    catch (error) {
        console.error('Error parsing defaultValue:', error);
        deltaData = new Delta();
    }
    if(deltaData.ops.length > 0) { 
        descHTML = quillGetHTML(deltaData);
    }

    const parseDate = parseAbsoluteToLocal(components.created_at);
    const publishedDate = parseDate.day.toString() + '/' + parseDate.month.toString() + '/' + parseDate.year.toString();
    
    const categoryRoute = components.category.replaceAll('_', ' ').split('.');
    const category = categoryRoute.at(-1);
    
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
            <Breadcrumbs className={'p-4'}>
                <Breadcrumb href='/manager/'>Inicio</Breadcrumb>
                <Breadcrumb href='/manager/components/'>Componentes</Breadcrumb>
                <Breadcrumb>{components.name}</Breadcrumb>
            </Breadcrumbs>
            <div className="p-4 flex lg:flex-row md:flex-col gap-8">
                <div className="xl:w-2/5 lg:w-1/2">
                    <AsyncImg className="aspect-square w-full object-cover rounded-[var(--border-radius-ui)]" src={'/' + components.image_url} alt={components.name}/>
                </div>
                <div className="flex flex-col justify-between xl:w-3/5 lg:w-1/2">
                    <div className='flex flex-col'>
                        <div className="flex justify-between mb-4">
                            <div className='flex items-center'>
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
                                <h1 className="text-3xl font-bold ">{components.name}</h1>
                                <span className="text-sm text-[var(--color-text-muted)]">SKU: {components.sku}</span>
                            </div>
                            <div className=' border-2 border-[var(--color-border)] rounded-[var(--border-radius-ui)] overflow-hidden'>
                                <div className='w-full px-3 py-2 flex justify-between align-center items-center bg-[var(--color-border)]'>
                                    <div className='flex gap-2 items-center'>
                                        <RiCircleFill size={16} color={statusColor.color}/> 
                                        <span className='text-sm'>{statusColor.status}</span>
                                    </div>
                                    <span className='text-sm'>{'Stock: ' + components.stock.toString()}</span>
                                </div>
                                {locations.length > 0 &&
                                    <div className='p-2 divide-y-2 divide-[var(--color-border)]'>
                                        {locations.map((value) => 
                                            <div key={value.location_id} className='flex justify-between items-center w-full p-2'>
                                                <div className='flex flex-col'>
                                                    <span>{value.location_name}</span>
                                                    <span className='text-xs text-[var(--color-text-muted)]'>{value.location_route.replaceAll('_', ' ').replaceAll('.', ' > ')}</span>
                                                </div>
                                                <span>{value.amount}</span>
                                            </div>
                                        )}
                                    </div>
                                }
                            </div>
                        </div>
                        <div className='divide-y-2 divide-[var(--color-border)]'>
                            <p className="text-[var(--color-text-muted)] py-2">Fabricante: {components.manufacturer}</p>
                            <p className="text-[var(--color-text-muted)] py-2">Categoría: {category}</p>
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
                        {descHTML ? (
                            <div className='w-full p-5' dangerouslySetInnerHTML={{ __html: descHTML }} />
                        ) : (
                            <p>No hay descripción disponible.</p>
                        )}
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