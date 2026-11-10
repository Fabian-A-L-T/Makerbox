import { Breadcrumb } from "@components/ui/Breadcrumbs";
import type { User } from "../interfaces/auth";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@components/ui/Tabs";
import { Form } from "@components/form/Form";
import TextField from "@components/form/TextField";
import { Button } from "@components/form/Button";
import { makerboxApi, setAccessToken } from "../api/makerbox.api";
import { queue, StatusToast } from "@components/ReactAria/Toast";
import { router } from "@utils/router";
import { useState } from "react";
import { RiIdCardLine, RiLockLine } from "@remixicon/react";
import { Modal } from "@components/ReactAria/Modal";
import { Dialog } from "@components/ReactAria/Dialog";
import PageHeader from "@components/ui/PageHeader";
import ModalHeader from "@components/ui/ModalHeader";
import { AxiosError } from "axios";

function ProfileSettings({ userData }: { userData: User | null }) {

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDisabled, setIsDisabled] = useState(true);

    return (
        <>
        <div className="flex flex-col">
            <PageHeader title="Configuración del perfil" headerSize="h2"/>
            <div className="flex justify-center items-center w-full gap-4 m-4">
                <div className="bg-[var(--color-primary)] text-white font-bold rounded-full w-20 h-20 flex items-center justify-center">
                    {userData?.name.substring(0, 2).toUpperCase() || 'U'}
                </div>
                <div className='flex flex-col overflow-hidden'>
                    <span className="text-sm">{userData?.name || 'Usuario'}</span>
                    <span className="text-xs text-[var(--color-text-muted)]">{userData?.role || 'Rol'}</span>
                </div>
            </div>
            <Form className="flex flex-col gap-4 m-4" action={(formData) => {
                const name = formData.get('name')?.toString() || '';
                setIsSubmitting(true);
                makerboxApi.put('/api/users/profile', {name})
                    .then((res) => {
                        if(res.status === 200) {
                            makerboxApi.post('/api/auth/refresh', null, { withCredentials: true })
                            .then((refresh) => {
                                if(refresh.status === 200) {
                                    queue.add({
                                        title: 'Perfil actualizado',
                                        description: 'Tu perfil ha sido actualizado correctamente.',
                                        color: 'success',
                                    }, { timeout: 2000 });
                                    const { accessToken } = refresh.data;
                                    setAccessToken(accessToken);
                                    router.navigate({ to: '/manager/account', reloadDocument: true });
                                    setIsSubmitting(false);
                                }
                            });
                        }
                    })
                    .catch((error) => {
                        setIsSubmitting(false);
                        const message = error instanceof AxiosError ? error.response?.data.message : error.message;
                        queue.add({
                            title: 'Ha ocurrido un error',
                            description: error.message,
                            color: 'error',
                        }, { timeout: 2000 });
                    });
            }}>
                <TextField label="Rol de usuario"
                    defaultValue={userData?.role || ''}
                    isDisabled
                />
                <TextField label="Nombre de usuario"
                    isRequired 
                    name="name" 
                    defaultValue={userData?.name || ''} 
                    maxLength={100} 
                    minLength={3}
                    onChange={(value) => {
                        if(value !== userData?.name) setIsDisabled(false);
                        else setIsDisabled(true);
                    }}
                    isDisabled={isSubmitting}
                />
                <Button type="submit" className="w-max" isDisabled={isSubmitting || isDisabled}>
                    {isSubmitting ? 'Guardando cambios...' : 'Guardar cambios'}
                </Button>
            </Form>
        </div>
        <StatusToast/>
        </>
    );
}

function SecuritySettings({ userData }: { userData: User | null }) {

    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isPasswdModalOpen, setIsPasswdModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDisabled, setIsDisabled] = useState(true);

    const [newPasswd, setNewPasswd] = useState('');

    return (
        <>
        <div className="flex flex-col">
            <PageHeader title="Seguridad de la cuenta" headerSize="h2"/>
            <div className="flex justify-between items-end gap-4 m-4">
                <TextField label="Correo electrónico"
                    className="w-1/2"
                    isDisabled 
                    type="email" 
                    defaultValue={userData?.email || ''}
                />
                <Button type="button" className="h-[40px] items-center" onPress={() => {
                    setIsEmailModalOpen(true);
                }}>
                    Cambiar correo electrónico
                </Button>
            </div>
            <div className="flex justify-between items-end gap-4 m-4">
                <TextField label="Contraseña"
                    className="w-1/2"
                    isDisabled
                    type="password" 
                    defaultValue={'**********'}
                />
                <Button type="button" className="h-[40px] items-center" onPress={() => {
                    setIsPasswdModalOpen(true);
                }}>
                    Cambiar contraseña
                </Button>
            </div>
        </div>
        <StatusToast/>
        <Modal className="w-full max-w-xl" isOpen={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
            <Dialog className="flex flex-col ">
                
                <Form className="flex flex-col max-h-[80dvh]" action={(formData) => {
                    setIsSubmitting(true);
                    const email = formData.get('email')?.toString().toLowerCase().normalize('NFKC') || '';
                    const passwd = formData.get('password')?.toString() || '';

                    makerboxApi.patch('/api/users/profile/email', {email, passwd})
                        .then((res) => {
                            console.log('Response:', res);
                            if(res.status === 200) {
                                queue.add({
                                    title: 'Correo actualizado',
                                    description: 'El correo ha sido actualizado correctamente.',
                                    color: 'success',
                                }, { timeout: 2000 });
                            }
                        })
                        .catch((error) => {
                            queue.add({
                                title: 'Error al actualizar el correo',
                                description: error.response?.data?.message || error.message,
                                color: 'error',
                            }, { timeout: 2000 });
                        })
                        .finally(() => {
                            setIsEmailModalOpen(false);
                            setIsSubmitting(false);
                        });
                }}>
                    <ModalHeader title="Cambiar correo electrónico"/>
                    <div className="flex flex-col gap-5 flex-initial mb-5 px-5 overflow-y-auto">
                        <TextField label="Correo electrónico"
                            name="email"
                            type="email" 
                            defaultValue={userData?.email || ''}
                            onChange={(value) => {
                                const normalizedValue = value.toLowerCase().normalize('NFKC');
                                if(normalizedValue !== userData?.email) setIsDisabled(false);
                                else setIsDisabled(true);
                            }}
                            isRequired
                        />
                        <TextField label="Contraseña actual"
                            name="password"
                            type="password"
                            minLength={8}
                            maxLength={64}
                            description="Para cambiar tu correo electrónico, por favor ingresa tu contraseña actual."
                            isRequired
                        />
                    </div>
                    <div className="flex justify-center m-5 gap-2">
                        <Button slot="close" variant="secondary" isDisabled={isSubmitting}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" isDisabled={isSubmitting || isDisabled}>
                            Guardar cambios
                        </Button>
                    </div>
                </Form>
            </Dialog>
        </Modal>
        <Modal className="w-full max-w-xl" isOpen={isPasswdModalOpen} onOpenChange={setIsPasswdModalOpen}>
            <Dialog>
                <Form className="flex flex-col max-h-[80dvh]" action={(formData) => {
                    setIsSubmitting(true);
                    const passwd = formData.get('password')?.toString() || '';
                    const new_passwd = formData.get('new_passwd')?.toString() || '';

                    makerboxApi.patch('/api/users/profile/password', {new_passwd, passwd})
                        .then((res) => {
                            console.log('Response:', res);
                            if(res.status === 200) {
                                queue.add({
                                    title: 'Contraseña actualizada',
                                    description: 'La contraseña ha sido actualizada correctamente.',
                                    color: 'success',
                                }, { timeout: 2000 });
                            }
                        })
                        .catch((error) => {
                            queue.add({
                                title: 'Error al actualizar la contraseña',
                                description: error.response?.data?.message || error.message,
                                color: 'error',
                            }, { timeout: 2000 });
                        })
                        .finally(() => {
                            setIsPasswdModalOpen(false);
                            setIsSubmitting(false);
                        });
                }}>
                    <ModalHeader title="Cambiar contraseña"/>
                    <div className="flex flex-col gap-5 flex-initial mb-5 px-5 overflow-y-auto">
                        <TextField label="Contraseña actual"
                            name="password"
                            type="password"
                            minLength={8}
                            maxLength={64}
                            description="Para cambiar tu contraseña, por favor ingresa tu contraseña actual."
                            isRequired
                        />
                        <TextField label="Contraseña nueva"
                            onChange={(value) => setNewPasswd(value)}
                            type="password"
                            minLength={8}
                            maxLength={64}
                            isRequired
                        />
                        <TextField label="Confirmar contraseña"
                            name="new_passwd"
                            type="password"
                            minLength={8}
                            maxLength={64}
                            validate={(value: string) => {
                                if(value !== newPasswd) return 'Las contraseñas no coinciden';
                                return null;
                            }}
                            isRequired
                        />
                    </div>
                    <div className="flex justify-center m-5 gap-2">
                        <Button slot="close" variant="secondary" isDisabled={isSubmitting}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" isDisabled={isSubmitting}>
                            Guardar cambios
                        </Button>
                    </div>
                </Form>
            </Dialog>
        </Modal>
        </>
    );
}

export default function AccountConfig({ userData }: { userData: User | null }) {
    return (
        <div className="flex flex-col h-full">
            <PageHeader title="Configuración de la cuenta" description="Aquí puedes gestionar la configuración y preferencias de tu cuenta.">
                <Breadcrumb href='/manager/'>Dashboard</Breadcrumb>
                <Breadcrumb>Configuración de la cuenta</Breadcrumb>
            </PageHeader>
            <Tabs orientation="vertical" className="m-5 flex-auto">
                <TabList aria-label="Categorías de configuración">
                    <Tab id="profile"><RiIdCardLine size={20}/>Perfil</Tab>
                    <Tab id="security"><RiLockLine size={20}/>Seguridad</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel id="profile">
                        <ProfileSettings userData={userData} />
                    </TabPanel>
                    <TabPanel id="security">
                        <SecuritySettings userData={userData} />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </div>
    );
}