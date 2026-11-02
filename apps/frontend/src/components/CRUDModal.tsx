import {Modal} from '@components/ReactAria/Modal';
import {Dialog} from '@components/ReactAria/Dialog';
import {Form} from '@components/form/Form';
import {Button} from '@components/form/Button';
import ModalHeader from './ui/ModalHeader';

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
                <Form className='flex flex-col max-h-[80dvh]'
                    onSubmit={(e) => {
                        e.preventDefault();
                        if(!isPending) action(new FormData(e.currentTarget));
                    }}
                >
                    <ModalHeader title={title} description={description} className='flex-none'/>
                    <div className='flex-initial mb-5 px-5 overflow-y-auto'>
                        {children}
                    </div>
                    <div className='flex justify-center m-5 gap-2'>
                        <Button slot="close" variant="secondary" isDisabled={isPending}>Cancelar</Button>
                        <Button type="submit" isDisabled={isPending}>{submitText}</Button>
                    </div>
                </Form>
            </Dialog>
        </Modal>
    );
}
