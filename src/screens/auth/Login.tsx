import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import React, { useState } from 'react'
import { FiPhone } from 'react-icons/fi'
import { baseApi } from '../../api/baseApi'

const loginSchema = z.object({
  phone: z.string()
    .min(10, 'Phone number must be 10 digits')
    .max(10, 'Phone number must be 10 digits')
    .regex(/^\d+$/, 'Phone number must contain only digits'),
})

type LoginFormValues = z.infer<typeof loginSchema>

interface LoginProps {
  onLogin: (phone: string) => void
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })
  const [phone, setPhone] = React.useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const onSubmit = async (values: LoginFormValues) => {
    setApiError('')
    setIsLoading(true)
    try {
      await baseApi('/auth/send-otp', {
        method: 'POST',
        data: { mobileNumber: values.phone },
      })
      setPhone(values.phone)
      setOtpSent(true)
      reset({ phone: values.phone })
    } catch (err: any) {
      setApiError(err.message || 'Failed to send OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setOtpError('')
    setOtpLoading(true)
    try {
      const res = await baseApi('/auth/verify-otp', {
        method: 'POST',
        data: { mobileNumber: phone, otp },
      })
      onLogin(phone)
    } catch (err: any) {
      setOtpError(err.message || 'OTP verification failed')
    } finally {
      setOtpLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#6C4BC1] bg-cover bg-center"
      style={{
        backgroundImage: `url('assets/asthetic.jpg')`,
      }}>
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm relative">
        <h2 className="mb-2 text-2xl font-bold">Welcome back,</h2>
        {!otpSent ? (
          <form onSubmit={handleSubmit(onSubmit)} className="w-full mt-4">
            <label className="block text-sm font-medium mb-1" htmlFor="phone">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative mb-2">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <FiPhone />
              </span>
              <Input
                id="phone"
                type="text"
                placeholder="Enter your phone number"
                maxLength={10}
                {...register('phone')}
                onInput={(e) => {
                  const input = e.currentTarget
                  input.value = input.value.replace(/\D/g, '').slice(0, 10)
                }}
                className="pl-10"
              />
            </div>
            {errors.phone && <p className="text-red-500 text-sm mb-2">{errors.phone.message}</p>}
            <div className="flex justify-end mb-4">
              {/* <a href="#" className="text-xs text-[#6C4BC1] hover:underl  ine">Forgot password?</a> */}
            </div>
            <Button type="submit" className="w-full bg-[#6C4BC1] hover:bg-[#5a3ea6] text-white mb-3" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Send OTP'}
            </Button>
            {apiError && <p className="text-red-500 mt-2">{apiError}</p>}
            <button
              type="button"
              className="w-full border border-[#6C4BC1] text-[#6C4BC1] rounded-md py-2 mt-1 hover:bg-[#f3f0fa] transition"
              onClick={() => {
                // Optionally handle signup navigation here
              }}
            >
              Not registered? Signup
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="w-full mt-4">
            <label className="block text-sm font-medium mb-1" htmlFor="otp">
              Enter OTP <span className="text-red-500">*</span>
            </label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="mb-2"
            />
            {otpError && <p className="text-red-500 text-sm mb-2">{otpError}</p>}
            <Button type="submit" className="w-full bg-[#6C4BC1] hover:bg-[#5a3ea6] text-white mb-3" disabled={otpLoading}>
              {otpLoading ? 'Verifying...' : 'Verify OTP'}
            </Button>
            <button
              type="button"
              className="w-full border border-[#6C4BC1] text-[#6C4BC1] rounded-md py-2 mt-1 hover:bg-[#f3f0fa] transition"
              onClick={() => { setOtpSent(false); setOtp(''); setOtpError(''); reset(); }}
            >
              Change Phone Number
            </button>
          </form>
        )}
      </div>
      <div className="absolute rounded-xl w-[370px] h-[370px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[-1]" style={{ filter: 'blur(2px)' }} />
    </div>
  )
}

export default Login 