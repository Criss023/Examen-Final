import axios from 'axios'

export function getErrorMessage(error: unknown): string {
  if (!error) return 'Ocurrió un error'
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'Sin conexión. Verifique su conexión a internet.'
    const status = error.response.status
    const msg: string | undefined = error.response.data?.message
    if (status === 400) return msg ?? 'Solicitud incorrecta. Verifique los datos.'
    if (status === 401) return 'Credenciales incorrectas o sesión expirada.'
    if (status === 403) return 'No tiene permiso para realizar esta acción.'
    if (status === 404) return msg ?? 'El recurso solicitado no existe.'
    if (status >= 500) return 'Error en el servidor. Intente de nuevo más tarde.'
    return msg ?? `Error inesperado (${status}).`
  }
  if (error instanceof Error) return error.message
  return 'Ocurrió un error inesperado.'
}