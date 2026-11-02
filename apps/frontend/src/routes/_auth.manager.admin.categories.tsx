import { Breadcrumb } from '@components/ui/Breadcrumbs';
import { useEffect } from 'react';
import { createFileRoute, Link, Outlet, useNavigate, useLocation } from '@tanstack/react-router';
import PageHeader from '@components/ui/PageHeader';

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
            <PageHeader className='!border-none mb-2' title="Categorías" description="Aquí podrás administrar todas las categorías de herramientas y componentes registradas en el sistema">
                <Breadcrumb href='/manager/'>Dashboard</Breadcrumb>
                <Breadcrumb href='/manager/admin/categories'>Categorias</Breadcrumb>
            </PageHeader>
            <div className='m-5 mt-2 flex gap-4 text-[var(--color-text-muted)] font-medium border-b-2 border-b-[var(--color-border)]'>
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
