import {Modal} from '@components/ReactAria/Modal';
import {Dialog, Heading} from '@components/ReactAria/Dialog';
import {Form} from '@components/form/Form';
import {Button} from '@components/form/Button';
import LoadingCircle from '@components/LoadingCircle';

interface CRUDModalProps {
    children?: React.ReactNode;
    title: string;
    description?: string;
    submitText: string;
    props?: any;
    isOpen: boolean;
    isPending: boolean;
    setOpen: (open: boolean) => void;
    action: (formData: FormData) => void;
}

export default function CRUDModal({children, title, description, submitText, props, isOpen, isPending, setOpen, action }: CRUDModalProps) {
    return (
        <Modal {...props} isOpen={isOpen} onOpenChange={setOpen}>
            <Dialog>
                <>
                <div className='flex flex-col gap-2 mb-8'>
                    <Heading className='text-2xl font-bold text-[var(--color-text)]' slot="title">{title}</Heading>
                    {description && <p className='text-md text-[var(--color-text-muted)]'>{description}</p>}
                </div>
                <Form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        await action(new FormData(e.currentTarget));
                    }}
                    className='flex flex-col gap-8'
                >
                    {isPending ?
                        (
                            <div className='flex flex-col w-full my-20 items-center justify-center gap-2 bg-[var(--color-card)]'>
                                <LoadingCircle message="Cargando..."/>
                            </div>
                        ):
                        (
                            <>
                                {children}
                                <div className='flex flex-row justify-center gap-2 mt-8'>
                                    <Button slot="close" variant="secondary">Cancelar</Button>
                                    <Button type="submit">{submitText}</Button>
                                </div>
                            </>
                        )}
                </Form>
                </>
            </Dialog>
        </Modal>
    );
}
