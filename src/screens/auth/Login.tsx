import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUserQuery } from './useUserQuery'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import React from 'react'

const loginSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
})

type LoginFormValues = z.infer<typeof loginSchema>

interface LoginProps {
  onLogin: (phone: string) => void
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [submitted, setSubmitted] = React.useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })
  const [phone, setPhone] = React.useState('')
  const { data, isLoading, isError, error } = useUserQuery(submitted ? phone : null)
  const typedError = error as Error | undefined

  React.useEffect(() => {
    if (data && submitted) {
      onLogin(phone)
    }
  }, [data, submitted, onLogin, phone])

  const onSubmit = (values: LoginFormValues) => {
    setPhone(values.phone)
    setSubmitted(true)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="mb-4 text-2xl font-bold">Login</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-xs">
        <Input
          type="text"
          placeholder="Phone Number"
          {...register('phone')}
          className="mb-2"
        />
        {errors.phone && <p className="text-red-500 text-sm mb-2">{errors.phone.message}</p>}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Login'}
        </Button>
        {isError && <p className="text-red-500 mt-2">{typedError?.message}</p>}
      </form>
    </div>
  )
}

export default Login 