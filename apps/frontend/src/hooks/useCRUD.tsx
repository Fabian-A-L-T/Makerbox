import { useState } from 'react';
import { queue } from '@components/ReactAria/Toast';
import { makerboxApi } from '../api/makerbox.api';
import { AxiosError, type AxiosResponse } from 'axios';
import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

type CRUDMode = 'post' | 'put' | 'delete';

interface QueueMsgData {
    title: string,
    description: string,
    color: "success" | "error" | "info"
}

interface ModalConfig {
    title: string;
    description?: string;
    submitText: string;
}

interface OpenModalOptions<T> {
    mode: CRUDMode;
    target?: T;
}

interface UseCRUDOptions {
    /** Base API route, e.g. '/api/component-categories' */
    apiRoute: string;
    /** Human-readable singular label used in toasts and modal titles, e.g. 'categoría' */
    resourceLabel: string;
}

export interface UseCRUDReturn<T> {
    modalMode: CRUDMode;
    modalProps: ModalConfig;
    resourceLabel: string;
    apiRoute: string;
    targetData: T | null;

    isSubmitting: boolean;
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;

    openModal: (options: OpenModalOptions<T>) => void;
    submitMutation: UseMutationResult<AxiosResponse<any, any, {}>, Error, {formData: FormData, queryKey?: string[], queueMsg?: QueueMsgData},  unknown>
}

export function useCRUD<T extends { id: number }>({apiRoute, resourceLabel}: UseCRUDOptions): UseCRUDReturn<T> {

    const [modalMode, setModalMode] = useState<CRUDMode>('post');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [targetData, setTargetData] = useState<T | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalProps, setModalProps] = useState<ModalConfig>({ title: '', submitText: '' });

    const queryClient = useQueryClient()

    /**
     * Opens the modal for CRUD operations
     * 
     * @param {CRUDMode} mode - CRUD mode: 'post', 'put' or 'delete'
     * @param {T} target - Optional target data for 'put' and 'delete' modes
     */
    function openModal({ mode, target }: OpenModalOptions<T>) {

        if (target) {
            setTargetData(target);
        }
        if (mode === 'post') {
            setModalProps({
                title: `Agregar ${resourceLabel}`,
                submitText: 'Agregar',
            });
        }
        else if (mode === 'put') {
            setModalProps({
                title: `Editar ${resourceLabel}`,
                submitText: 'Guardar',
            });
        }
        else {
            setModalProps({
                title: `Eliminar ${resourceLabel}`,
                submitText: 'Eliminar',
            });
        }
        setModalMode(mode);
        setIsModalOpen(true);
    }

    function formatRoute(template: string, params: Record<string, any>) {
        return template.replace(/:(\w+)/g, (_, key) => {
            if (!(key in params)) throw new Error(`Missing param: ${key}`);
            return params[key];
        });
    }

    /**
     * Sends data to backend via API
     *
     * @param {FormData} formData - Form data from the modal form
     */
    async function handleSubmit(formData?: FormData) {
        if(modalMode !== 'delete' && formData ){
            if(modalMode === 'put' && !targetData) throw new Error('Datos del elemento a editar no encontrados.');

            const data: Record<string,FormDataEntryValue> = {};
            formData.forEach((value, key) => {
                if(value && value !== '') data[key] = value;
            });
            const formattedApiRoute = formatRoute(apiRoute, data);
            const route = modalMode === 'post' ? formattedApiRoute : `${formattedApiRoute}/${targetData!.id}`;

            return makerboxApi[modalMode](route, data, {withCredentials: true});
        }
        else if (modalMode === 'delete' && targetData) {
            return makerboxApi.delete(`${apiRoute}/${targetData.id}`, {withCredentials: true});
        }
        return Promise.reject('Datos faltantes');
    }

    /**
     * Tanstack Query Mutation to handle the submission of the resource to the backend.
     */
    const submitMutation = useMutation({
        mutationFn: (variables: {formData: FormData, queryKey?: string[]}) => {
            setIsSubmitting(true);
            return handleSubmit(variables.formData);
        },
        onError: (error) => {
            const message = error instanceof AxiosError ? error.response?.data.message : error.message;
            queue.add({ title: 'Operación fallida', description: message, color: 'error' }, { timeout: 2000 });
        },
        onSuccess: (_data, variables) => {
            setIsModalOpen(false);
            setTargetData(null);
            queue.add({
                title: 'Operación exitosa',
                description: `${resourceLabel} ${modalMode === 'post' ? 'creado' : modalMode === 'put' ? 'actualizado' : 'eliminado'} exitosamente.`,
                color: 'success',
            }, { timeout: 2000 });
            if(variables.queryKey) queryClient.invalidateQueries({ queryKey: variables.queryKey });
        },
        onSettled: (_data, _error) => {
            setIsSubmitting(false);
        },
    });

    return {
        resourceLabel,
        modalMode,
        apiRoute,
        isModalOpen,
        setIsModalOpen,
        targetData,
        isSubmitting,
        modalProps,
        openModal,
        submitMutation
    };
}
