import CRUDHeader from '@components/CRUDHeader';
import CRUDModal from '@components/CRUDModal';
import { StatusToast } from '@components/ReactAria/Toast';
import { type ColumnDef } from '@components/ui/Table';
import { type UseCRUDReturn } from '@utils/useCRUD';
import Pagination from './ui/Pagination';
import Table from './ui/Table';
import { Await, CatchBoundary } from '@tanstack/react-router';
import LoadingCircle from './LoadingCircle';
import { chunk } from 'lodash';
import { AxiosError, type AxiosResponse } from 'axios';

interface CRUDViewProps<T extends { id: number; name: string }> {
    /** Page heading and "create" button label source */
    title: string;
    /** Page subtitle source */
    subtitle?: string;
    data: Promise<AxiosResponse<T[]>>
    checkAuth: () => void;
    paginationData: {
        currentPage: number,
        limit: number,
        maxPages: number
    }
    /** Column definitions forwarded to PaginatedTable */
    columns: ColumnDef<T>[];
    /** Everything returned by useCRUD<T>() */
    crud: UseCRUDReturn<T>;
    /** Form rendered when modal is in "post" (create) mode */
    createForm: React.ReactNode;
    /** Form rendered when modal is in "put" (edit) mode */
    editForm: React.ReactNode;
}

/**
 * CRUD layout that includes the following components:
 *  - Header
 *  - Paginated table
 *  - CRUD Modal with form and actions
 *  - Status Toast
 */
export default function CRUDView<T extends { id: number; name: string }>({
    title,
    subtitle,
    data,
    checkAuth,
    paginationData,
    columns,
    crud,
    createForm,
    editForm,
}: CRUDViewProps<T>) {
    const {
        resourceLabel, modalMode, isModalOpen, setIsModalOpen, isSubmitting, modalProps, openModal, handleSubmit,
    } = crud;

    const { currentPage, limit, maxPages } = paginationData;
    
    const activeForm: React.ReactNode =
        modalMode === 'post'   ? createForm :
        modalMode === 'put'    ? editForm   :
        <></>;
    
    return (
        <div className="w-full flex flex-col gap-6">
            <CRUDHeader title={title} subtitle={subtitle} buttonText={`Crear ${resourceLabel}`} action={() => openModal({mode:'post'})}/>
            <CatchBoundary 
                getResetKey={() => 'reset'} 
                onCatch={(error) => {
                    if(error instanceof AxiosError) checkAuth();
                    throw error;
                }}
            >
                <Await promise={data} fallback={<div className='my-20'><LoadingCircle/></div>}>
                    {(response) => {
                        let parsed = chunk(response.data, Math.floor(limit/maxPages));
                        return parsed.length ? (
                            <>
                                <Table aria-label={`Tabla de ${resourceLabel}s`} columns={columns} rows={parsed[(currentPage-1)%maxPages] || []}/>
                                <Pagination
                                    maxPages={maxPages}
                                    totalPages={parsed.length}
                                    currentPage={currentPage}
                                    cursor={Math.floor((currentPage-1)/maxPages)}
                                    prev={() => null}
                                    next={() => null}
                                />
                            </>
                        ):
                        (
                            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-400 text-sm">
                                <strong>No se han encontrado resultados</strong>
                            </div>
                        )}
                    }
                </Await>
            </CatchBoundary>
            <CRUDModal {...modalProps} action={handleSubmit} isOpen={isModalOpen} setOpen={setIsModalOpen} isPending={isSubmitting}>
                {activeForm}
            </CRUDModal>
            <StatusToast/>
        </div>
    );
}
