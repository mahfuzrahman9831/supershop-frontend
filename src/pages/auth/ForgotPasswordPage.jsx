import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Store, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const ForgotPasswordPage = () => {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!email) { toast.error('Email দিন'); return }
    setLoading(true)
    // TODO: Backend forgot password endpoint তৈরি হলে connect করুন
    // await api.post('/auth/forgot-password', { email })
    await new Promise((r) => setTimeout(r, 1000)) // simulate
    setSent(true)
    setLoading(false)
    toast.success('Password reset link পাঠানো হয়েছে!')
  }

  return (
    <div className="min-h-screen bg-sidebar-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-600 rounded-2xl mb-4 shadow-xl shadow-brand-600/30">
            <Store size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Password Reset</h1>
          <p className="text-gray-500 text-sm mt-1">Email এ reset link পাঠানো হবে</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {sent ? (
            <div className="text-center py-4">
              <p className="text-4xl mb-3">📧</p>
              <h2 className="font-bold text-gray-800 mb-2">Email পাঠানো হয়েছে!</h2>
              <p className="text-sm text-gray-500 mb-6">
                <span className="font-medium">{email}</span> এ reset link পাঠানো হয়েছে।
                Email check করুন।
              </p>
              <Link to="/login" className="btn-primary">
                Login এ ফিরুন
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@supershop.com"
                    className="input pl-9"
                    autoFocus
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                {loading
                  ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> পাঠানো হচ্ছে...</>
                  : 'Reset Link পাঠান'
                }
              </button>
            </form>
          )}

          <div className="mt-5 text-center">
            <Link to="/login" className="text-sm text-brand-600 hover:underline flex items-center justify-center gap-1">
              <ArrowLeft size={13} />
              Login এ ফিরুন
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage