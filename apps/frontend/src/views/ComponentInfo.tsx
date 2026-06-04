import { Breadcrumb, Breadcrumbs } from '@components/ui/Breadcrumbs';
import { getRouteApi } from '@tanstack/react-router';

export default function ComponentInfo() {
    
    const route = getRouteApi('/_auth/manager/components/$id');
    const component = route.useLoaderData();
    return (
        <>
            <Breadcrumbs className={'text-[var(--color-text)] mb-8'}>
                <Breadcrumb href='/manager/'>Inicio</Breadcrumb>
                <Breadcrumb href='/manager/components/'>Componentes</Breadcrumb>
                <Breadcrumb>{component.name}</Breadcrumb>
            </Breadcrumbs>
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                    <img src={component.image_url ? '/' + component.image_url : '/uploads/images/placeholder.png'} alt={component.name} className="aspect-square w-full object-cover rounded-lg"/>
                </div>
                <div className="col-span-2">
                    <div className="flex flex-col gap-2 mb-4">
                        <h1 className="text-[var(--color-text)] text-2xl">{component.name}</h1>
                        <span className="text-sm text-[var(--color-text-muted)]">SKU: {component.sku}</span>
                    </div>
                    <p className="text-[var(--color-text)] mb-2">{component.description}</p>
                    <p className="text-[var(--color-text-muted)] mb-2">Fabricante: {component.manufacturer}</p>
                    <p className="text-[var(--color-text-muted)] mb-2">Categoría: {component.category}</p>
                    <p className="text-[var(--color-text-muted)] mb-2">Stock: {component.stock}</p>
                </div>
            </div>
            
        </>
    );
}