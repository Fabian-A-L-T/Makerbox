import CRUDHeader from '@components/CRUDHeader';
import CRUDModal from '@components/CRUDModal';
import { type ColumnDef } from '@components/ui/Table';
import { type UseCRUDReturn } from '../../hooks/useCRUD';
import Pagination from '../ui/Pagination';
import Table from '../ui/Table';
import { paginationParams } from '@utils/Utils';
import { useNavigate } from '@tanstack/react-router';
import { useFetch } from '../../hooks/useFetch';

interface CRUDLayoutProps<T extends { id: number }> {
    /** Page heading and "create" button label source */
    title: string;
    /** Page subtitle */
    subtitle?: string;

    currentPage: number;
    /** Column definitions forwarded to PaginatedTable */
    columns: ColumnDef<T>[];
    /** Everything returned by useCRUD<T>() */
    crud: UseCRUDReturn<T>;
    /** Form rendered when modal is in "post" (create) mode */
    createForm: React.ReactNode;
    /** Form rendered when modal is in "put" (edit) mode */
    editForm: React.ReactNode;
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
    currentPage,
    columns,
    crud,
    createForm,
    editForm,
    formDataTransform
}: CRUDLayoutProps<T>) {
    const { apiRoute, resourceLabel, modalMode, isModalOpen, setIsModalOpen, isSubmitting, modalProps, openModal, submitMutation } = crud;
    const { maxPages } = paginationParams;
    const navigate = useNavigate();

    const { chunks, chunkIndex, chunkCursor, dataLinks, status, error } = useFetch<T>({
        page: currentPage, 
        apiRoute,
    });

    const activeForm: React.ReactNode =
        modalMode === 'post'   ? createForm :
        modalMode === 'put'    ? editForm   :
        <></>;
    
    return (
        <div className="p-5 w-full flex flex-col gap-6">
            <CRUDHeader title={title} subtitle={subtitle} buttonText={`Crear ${resourceLabel}`} action={() => openModal({mode:'post'})}/>
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
            <CRUDModal {...modalProps} 
                action={(formData) => {
                    if(formDataTransform) formDataTransform(formData);
                    submitMutation.mutate({formData, queryKey: [apiRoute, chunkCursor.toString()]});
                    navigate({to:'.'}); //To navigate to page 1 after a CRUD action
                }}
                isOpen={isModalOpen} 
                setOpen={setIsModalOpen} 
                isPending={isSubmitting}
            >
                {activeForm}
            </CRUDModal>
        </div>
    )
}
