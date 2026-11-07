import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import { getErrorMessage } from '../utils/errorHandler'

const schema = z.object({
  username: z.string().min(1, 'El usuario es obligatorio'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})
type FormValues = z.infer<typeof schema>

function LoginPage() {
  const field = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-brand-600'
  const [serverError, setServerError] = useState<string | null>(null)
  const navigate = useNavigate()
  const accessToken = useAuthStore((s) => s.accessToken)
  const setSession = useAuthStore((s) => s.setSession)

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
  useForm<FormValues>({ resolver: zodResolver(schema) })

  if (accessToken) return <Navigate to="/productos" replace />
  
  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    try {
      const login = await authService.login(values.username, values.password)
      setSession(login)
      navigate('/productos', { replace: true })
    } catch (err) {
      setServerError(getErrorMessage(err))
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center p-6">
      <h1 className="text-2xl font-bold text-slate-900">Iniciar sesión</h1>
      <form className="mt-4 space-y-3" noValidate onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="username" className="text-sm font-medium">Usuario</label>
          <input id="username" autoComplete="username" className={field} {...register('username')} />
          {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>}
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-medium">Contraseña</label>
          <input id="password" type="password" autoComplete="current-password" className={field} {...register('password')} />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>
        {serverError && (
          <Alert variant="destructive"><AlertDescription>{serverError}</AlertDescription></Alert>
        )}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Ingresando…' : 'Ingresar'}
        </Button>
      </form>
    </main>
  )
}
export default LoginPage