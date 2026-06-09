import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Search, ChevronDown, LogOut, User, Settings } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import api from '../../lib/axios'

const Header = () => {
  const { user, logout }           = useAuthStore()
  const navigate                   = useNavigate()
  const [dropdownOpen, setDropdown] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await api.post('/auth/logout')
    } catch (_) { /* ignore */ } finally {
      logout()
      navigate('/login', { replace: true })
      toast.success('Logout সফল হয়েছে!')
    }
  }

  const initials = user?.name?.slice(0, 2)?.toUpperCase() ?? 'AD'
  const role     = user?.roles?.[0] ?? 'admin'

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-5 gap-4 flex-shrink-0">

      {/* Search */}
      <div className="flex-1 max-w-xs">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-gray-100 rounded-lg border-0
                       focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white
                       placeholder:text-gray-400 transition-all"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">

        {/* Notification bell */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <Bell size={18} />
          {/* Badge — Phase 13 এ dynamic হবে */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </button>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdown((o) => !o)}
            className="flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="hidden sm:block text-left leading-none">
              <p className="text-sm font-semibold text-gray-800">{user?.name ?? 'Admin'}</p>
              <p className="text-xs text-gray-400 capitalize">{role}</p>
            </div>
            <ChevronDown size={13} className="text-gray-400" />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-10" onClick={() => setDropdown(false)} />
              <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg
                              border border-gray-200 py-1 z-20">
                <button
                  onClick={() => { setDropdown(false); navigate('/profile') }}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User size={14} /> Profile
                </button>
                <button
                  onClick={() => { setDropdown(false); navigate('/settings') }}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings size={14} /> Settings
                </button>
                <div className="my-1 border-t border-gray-100" />
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={14} />
                  {loggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header