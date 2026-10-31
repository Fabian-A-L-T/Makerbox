import '@styles/login.css'
import { useState } from 'react';
import { Route } from '@routes/login';
import { RiLoader4Line } from '@remixicon/react';
import Circuit from '@components/svg/Circuit';
import Logo from '@components/svg/Logo';
import { Form } from '@components/form/Form';
import TextField from '@components/form/TextField';
import { Button } from '@components/form/Button';
import { getInitialTheme } from '@utils/Utils';
import { Checkbox } from '@components/form/Checkbox';

export default function Login() {
  const { auth } = Route.useRouteContext();

  const [error, setError] = useState<Record<string,string>>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const root = document.documentElement;
  root.dataset.theme = getInitialTheme();
  root.style.colorScheme = getInitialTheme();
  window.localStorage.setItem('theme', getInitialTheme());

  return (
    <main className="flex w-full bg-[#0A3A00]">
      <div className="w-1/2 h-full flex justify-between bg-[var(--color-background)]">
        <div className='w-1/8 mb-auto mt-8'><Circuit/></div>
        <div className='w-1/2 flex flex-col gap-4'>
          <div className='mx-auto my-10 w-1/2'><Logo withText/></div>
          <Form
            className='flex flex-col gap-8 mb-4'
            aria-label='Formulario de inicio de sesión'
            validationErrors={error}
            action={(formData)=>{
              setIsSubmitting(true);
              const email = formData.get('email')?.toString() || '';
              const password = formData.get('password')?.toString() || '';
              const remember = formData.get('remember')?.toString() || '';
              setTimeout(() => {
                auth.login(email, password, remember)
                  .catch(() => setError({email: "Correo o contraseña incorrecta"}))
                  .finally(() => setIsSubmitting(false));
              }, 200);
            }}
          >
            <div className='flex flex-col'>
              <span className='text-lg font-semibold'>Bienvenid@ a Makerbox</span>
              <span className='text-[var(--color-text-muted)]'>Iniciar sesión con correo</span>
            </div>
            {isSubmitting ? (
              <div className='flex flex-col p-6 rounded-xl items-center gap-4'>
                <RiLoader4Line size={64} color="var(--color-border)" className='animate-spin' />
                <span>Iniciando sesión</span>
              </div>
            ):(
              <>
              <div className='flex flex-col gap-4'>
                <TextField
                  label="Correo electrónico"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  name="email"
                  maxLength={64}
                  isRequired
                />
                <TextField
                  label="Contraseña"
                  type="password"
                  name="password"
                  minLength={8}
                  maxLength={100}
                  isRequired
                />
                <Checkbox name='remember' value='true'>Recordarme</Checkbox>
              </div>
              <div className='flex flex-col gap-1 text-end'>
                <Button className='justify-center w-full' type="submit">Iniciar sesión</Button>
              </div>
              </>
            )}
          </Form>
        </div>
        <div className='w-1/8 mb-8 mt-auto'><Circuit rotate/></div>
      </div>
    </main>
  )
}
