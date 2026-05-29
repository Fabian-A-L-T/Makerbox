import '@styles/login.css'
import { useState } from 'react';
import logo from "@assets/logo.png"
import bg from "@assets/login-bg.webp"
import { string, minLength, pipe, email, maxLength } from 'valibot';
import { useForm } from '@tanstack/react-form';
import InputField from '@components/InputField/InputField';
import { Route } from '@routes/login';
import { RiLoader4Line } from '@remixicon/react';

function Login() {
  const emailSchema = pipe(string(), email("Email inválido"), maxLength(32, "El email debe tener menos de 32 caracteres"));
  const passwordSchema = pipe(string(), minLength(8, "La contraseña debe tener al menos 8 caracteres"), maxLength(100, "La contraseña debe tener menos de 100 caracteres"));

  const { auth } = Route.useRouteContext();

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      setTimeout(() => {
        auth.login(value.email, value.password)
        .catch(() => {
          setError("Correo o contraseña incorrecta");
          form.resetField("password");
        })
        .finally(() => {
          setIsSubmitting(false);
        });
      }, 200);
    },
  });

  return (
    <main className="flex">
      {isSubmitting && (
          <div className="login-container flex items-center justify-center fixed bg-[#000]/40">
            <div className='flex flex-col bg-[#fff] p-6 rounded-xl items-center gap-4'>
              <RiLoader4Line size={64} color="#222" className='animate-spin' />
              <span className='font-semibold ml-2 text-lg text-[#222]'>Iniciando sesión</span>
            </div>
          </div>
        )}
      <div className="login-container flex flex-col gap-8 bg-[#EBEBEB]">
        <div className='logo_container p-10 flex flex-col items-center gap-4'>
          <img src={logo} alt="logo" className='mb-10' />
          <h1>Login</h1>
        </div>
        <div>
          <form 
            className='flex flex-col gap-4' 
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <form.Field
              name="email"
              validators={{
                onBlur: emailSchema
              }}
            >
              {(field) => (
                <InputField
                  label="Correo electrónico"
                  type="email"
                  placeholder="Ingrese su correo electrónico"
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.pop()?.message}
                />
              )}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onBlur: passwordSchema
              }}
            >
              {(field) => (
                <InputField
                  label="Contraseña"
                  type="password"
                  placeholder="Ingrese su contraseña"
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.pop()?.message}
                />
              )}
            </form.Field>
            {error && <p className='text-red-500'>{error}</p>}

            <button 
              type='submit' 
              style={{cursor: 'pointer'}} 
              className={`bg-[#DB0202] text-white p-3 text-center ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>
          <div className='flex items-center justify-between mt-2'>
            <div>
              <input type="checkbox" />
              <label htmlFor="remember">Recordarme</label>
            </div>
            <a href="#">¿Olvidaste tu contraseña?</a>
          </div>
        </div>
        <hr />
        <p >¿No tienes una cuenta? <a href="#">Regístrate</a></p>
      </div>
      <div className='bg-container'>
        <img src={bg} alt="bg" className='w-full h-full object-cover' />
      </div>
    </main>
  )
}
export default Login