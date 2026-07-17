import CRUDHeader from '@components/CRUDHeader';
import { Breadcrumb, Breadcrumbs } from '@components/ui/Breadcrumbs';
import { useEffect } from 'react';
import { createFileRoute, Link, Outlet, useNavigate, useLocation } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/manager/admin/categories')({
    component: CategoryView,
})

function CategoryView(){
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Only redirect when the exact categories path is visited
        if (/\/categories\/?$/.test(location.pathname)) {
            navigate({ to: '/manager/admin/categories/components' });
        }
    }, [location.pathname, navigate]);

    return (
        <div>
            <Breadcrumbs className={'m-5'}>
                <Breadcrumb href='/manager/'>Inicio</Breadcrumb>
                <Breadcrumb href='/manager/admin/categories'>Categorias</Breadcrumb>
            </Breadcrumbs>
            <div className='m-5'>
                <CRUDHeader title={'Categorias'} subtitle={''}/>
            </div>
            <div className='m-5 flex gap-4 text-[var(--color-border)] font-medium border-b-2 border-b-[var(--color-border)]'>
                <Link 
                    className='p-2 border-b-4 border-b-transparent' 
                    activeProps={{
                        className:'!border-b-[var(--color-primary)] text-[var(--color-primary)]'
                    }} 
                    to={'/manager/admin/categories/components'}
                >
                    Componentes
                </Link>
                <Link 
                    className='p-2 border-b-4 border-b-transparent' 
                    activeProps={{
                        className:'!border-b-[var(--color-primary)] text-[var(--color-primary)]'
                    }} 
                    to={'/manager/admin/categories/tools'}
                >
                    Herramientas
                </Link>
            </div>
            <div className='m-5'>
                <Outlet/>
            </div>
        </div>
    )
}
