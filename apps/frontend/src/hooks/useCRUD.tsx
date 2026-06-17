import { useEffect, useState } from 'react';
import axios from 'axios';
import { queue } from '@components/ReactAria/Toast';
import { useNavigate } from '@tanstack/react-router';

export type CRUDMode = 'post' | 'put' | 'delete';

export interface ModalConfig {
    title: string;
    description?: string;
    submitText: string;
}

export interface OpenModalOptions<T> {
    mode: CRUDMode;
    target?: T;
}

export interface UseCRUDOptions<T> {
    /** Base API route, e.g. '/api/component-categories' */
    apiRoute: string;
    /** Human-readable singular label used in toasts and modal titles, e.g. 'categoría' */
    resourceLabel: string;

    checkAuth: () => void;
    /**
     * Optional extra async work that runs whenever the modal mode changes
     * (and is NOT a delete). Useful for loading dependent data such as
     * parent-category selects.
     */
    extraFetch?: (target: T | null, setTarget: React.Dispatch<React.SetStateAction<T | null>>) => Promise<void>;
}

export interface UseCRUDReturn<T> {
    modalMode: CRUDMode;
    modalProps: ModalConfig;
    resourceLabel: string;

    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;

    targetData: T | null;
    setTargetData: React.Dispatch<React.SetStateAction<T | null>>;

    isSubmitting: boolean;
    setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
    
    openModal: (options: OpenModalOptions<T>) => void;
    handleSubmit: (formData?: FormData) => Promise<void>;
}

export function useCRUD<T extends { id: number }>({apiRoute, resourceLabel, extraFetch, checkAuth}: UseCRUDOptions<T>): UseCRUDReturn<T> {

    const [modalMode, setModalMode] = useState<CRUDMode>('post');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [targetData, setTargetData] = useState<T | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(true);
    const [modalProps, setModalProps] = useState<ModalConfig>({ title: '', submitText: '' });

    const navigate = useNavigate();
    
    // Optional extra fetch effect that loads extra data needed for CRUD forms
    // Triggered only when modal mode changes and is not delete
    useEffect(() => {
        (async () => {
            try {
                if (modalMode === 'delete' || !extraFetch || !isModalOpen) return;
                setIsSubmitting(true);
                await extraFetch(targetData, setTargetData);
            } 
            catch (err: any) {
                checkAuth();
                throw new Error(`An error has ocurred while fetching the aditional data: ${err}`);
            } 
            finally {
                setTimeout(() => setIsSubmitting(false), 500);
            }
        })();
    }, [isModalOpen]);

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
     * Handles the submission of the resource to the API
     *
     * @param {FormData} formData - Form data from the modal
     */
    async function handleSubmit(formData?: FormData) {

        setIsSubmitting(true);
        let queueMsg  = {
            title: '',
            description: '',
            color: 'info' as 'success' | 'error' | 'info',
        };

        try {
            if(modalMode !== 'delete' && formData ){
                if(modalMode === 'put' && !targetData) {
                    throw new Error('Datos del elemento a editar no encontrados.');
                }
                const data: Record<string,FormDataEntryValue> = {};
                formData.forEach(function(value, key){
                    if(value && value !== '') data[key] = value;
                });
                const formattedApiRoute = formatRoute(apiRoute, data);
                const route = modalMode === 'post' ? formattedApiRoute : `${formattedApiRoute}/${targetData!.id}`;
                await axios[modalMode](route, data, {withCredentials: true});

                queueMsg = {
                    title: 'Operación exitosa',
                    description: `${resourceLabel} ${modalMode === 'post' ? 'creado' : 'actualizado'} exitosamente.`,
                    color: 'success',
                };
            }
            else if (modalMode === 'delete' && targetData) {
                await axios.delete(`${apiRoute}/${targetData.id}`, {withCredentials: true});

                queueMsg = {
                    title: 'Operación exitosa',
                    description: `${resourceLabel} eliminado exitosamente.`,
                    color: 'success',
                };
            }
            else {
                throw new Error('Modo de petición o parámetros inválidos.');
            }
        } 
        catch (err: any) {
            const msg = err.response?.data?.error ?? err.message;
            queueMsg = { title: 'Operación fallida', description: msg, color: 'error' };
            throw new Error(msg);
        } 
        finally {
            setTimeout(() => {
                setIsModalOpen(false);
                setTargetData(null);
                setIsSubmitting(false);
                queue.add(queueMsg, { timeout: 2000 });
                navigate({
                    to:'.',
                    search:{}
                });
            }, 500);
        }
    }

    return {
        resourceLabel,
        modalMode,
        isModalOpen,
        setIsModalOpen,
        targetData,
        setTargetData,
        isSubmitting,
        modalProps,
        openModal,
        setIsSubmitting,
        handleSubmit,
    };
}
