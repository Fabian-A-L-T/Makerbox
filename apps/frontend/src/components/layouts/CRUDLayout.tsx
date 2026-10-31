import CRUDModal from '@components/CRUDModal';
import { type ColumnDef } from '@components/ui/Table';
import { type UseCRUDReturn } from '../../hooks/useCRUD';
import Pagination from '../ui/Pagination';
import Table from '../ui/Table';
import { paginationParams } from '@utils/Utils';
import { useNavigate } from '@tanstack/react-router';
import { useFetch } from '../../hooks/useFetch';
import PageHeader from '@components/ui/PageHeader';
import { RiAddLine } from '@remixicon/react';
import CRUDAction from '@components/CRUDAction';

interface CRUDLayoutProps<T extends { id: number }> {
    /** Page title */
    title?: string;
    /** Page subtitle */
    subtitle?: string;
    /**Breadcrumbs */
    breadcrumbs?: React.ReactNode;
    /** Current page number */
    currentPage: number;
    /** Column definitions forwarded to PaginatedTable */
    columns: ColumnDef<T>[];
    /** Everything returned by useCRUD<T>() */
    crud: UseCRUDReturn<T>;
    /** Form rendered when modal is in "post" (create) mode */
    createForm?: React.ReactNode;
    /** Form rendered when modal is in "put" (edit) mode */
    editForm?: React.ReactNode;
    /** Text for the create action button */
    actionText?: string;
    /** Function to transform form data before submission */
    formDataTransform?: (formData: FormData) => void;
}

/**
 * CRUD layout that includes the following components:
 *  - Header
 *  - Paginated table
 *  - CRUD Modal with form and actions
 *  - Status Toast
 */
export default function CRUDLayout<T extends { id: number }>({
    title,
    subtitle,
    actionText,
    breadcrumbs,
    currentPage,
    columns,
    crud,
    createForm,
    editForm,
    formDataTransform
}: CRUDLayoutProps<T>) {
    const { apiRoute, resourceLabel, modalMode, isModalOpen, setIsModalOpen, isSubmitting, openModal, modalProps, submitMutation } = crud;
    const { maxPages } = paginationParams;
    const navigate = useNavigate();

    const { chunks, chunkIndex, chunkCursor, dataLinks, status, error } = useFetch<T>({
        page: currentPage, 
        apiRoute,
    });

    const activeForm: React.ReactNode =
        modalMode === 'post' && createForm ? createForm :
        modalMode === 'put' && editForm    ? editForm   :
        undefined;
    
    return (
        <>
        { title &&
            <PageHeader title={title} description={subtitle}>
                {breadcrumbs}
            </PageHeader>
        }
        {actionText && <CRUDAction action={() => openModal({mode:'post'})} icon={<RiAddLine/>} text={actionText} />}
        <div className="m-5 flex flex-col">
            <Table 
                dataStatus={status} 
                errorMsg={error?.message} 
                aria-label={`Tabla de ${resourceLabel}s`} 
                columns={columns} 
                rows={chunks[chunkIndex]} 
                rowHeader='id'
            />
            <Pagination 
                dataStatus={status}
                pagination={{page: currentPage, maxPages, totalPages: chunks.length}}
                hasPrev={dataLinks?.prev !== undefined}
                hasNext={dataLinks?.next !== undefined}
            />
            {(activeForm || modalMode === 'delete') && 
                <CRUDModal {...modalProps} 
                    action={async (formData) => {
                        if(formDataTransform) await formDataTransform(formData);
                        submitMutation.mutate({formData, queryKey: [apiRoute, chunkCursor.toString()]});
                        navigate({to:'.'}); //To navigate to page 1 after a CRUD action
                    }}
                    isOpen={isModalOpen} 
                    setOpen={setIsModalOpen} 
                    isPending={isSubmitting}
                >
                    {modalMode === 'delete' ? 
                        <div className='w-lg'>
                            <span>¿Estás seguro(a) de que deseas eliminar este recurso?</span>
                        </div> 
                    : activeForm}
                </CRUDModal>}
        </div>
        </>
    )
}
