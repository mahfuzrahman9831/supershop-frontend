import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Store, Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/axios'
import useAuthStore from '../../store/authStore'

const LoginPage = () => {
  const navigate       = useNavigate()
  const location       = useLocation()
  const { setAuth, token } = useAuthStore()
  const from           = location.state?.from?.pathname ?? '/'

  // ইতিমধ্যে login করা থাকলে redirect
  if (token) return <Navigate to={from} replace />

  const [form,     setForm]     = useState({ email: 'admin@supershop.com', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [errors,   setErrors]   = useState({})

  const onChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    setErrors((p) => ({ ...p, [e.target.name]: '' }))
  }

  const validate = () => {
    const err = {}
    if (!form.email)    err.email    = 'Email দিন'
    if (!form.password) err.password = 'Password দিন'
    setErrors(err)
    return !Object.keys(err).length
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      setAuth(data.data.user, data.data.token)
      toast.success(`স্বাগতম, ${data.data.user.name}! 👋`)
      navigate(from, { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Login ব্যর্থ হয়েছে'
      toast.error(msg)
      if (err.response?.data?.errors) setErrors(err.response.data.errors)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-sidebar-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo block */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-600
                          rounded-2xl mb-4 shadow-xl shadow-brand-600/30">
            <Store size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">SuperShop ERP</h1>
          <p className="text-gray-500 text-sm mt-1">আপনার account এ login করুন</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={onSubmit} className="space-y-5" noValidate>

            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email" name="email" value={form.email}
                  onChange={onChange} placeholder="admin@supershop.com"
                  className={`input pl-9 ${errors.email ? 'input-error' : ''}`}
                  autoFocus
                />
              </div>
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password" value={form.password}
                  onChange={onChange} placeholder="••••••••"
                  className={`input pl-9 pr-10 ${errors.password ? 'input-error' : ''}`}
                />
                <button
                  type="button" onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            {/* Submit button */}
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? (
                <><span className="spinner" /> Login হচ্ছে...</>
              ) : (
                'Login করুন'
              )}
            </button>
          </form>

          {/* Default credentials hint */}
          <div className="mt-5 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p className="text-[11px] text-gray-500 font-semibold mb-1.5">🔐 Default Admin Credentials:</p>
            <p className="text-xs text-gray-600 font-mono">admin@supershop.com</p>
            <p className="text-xs text-gray-600 font-mono">Admin@123</p>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          SuperShop ERP System © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}

export default LoginPage