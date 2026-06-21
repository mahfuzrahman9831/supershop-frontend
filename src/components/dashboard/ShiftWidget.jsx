import { Clock, User } from 'lucide-react'

const fmt = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' })
}

const ShiftWidget = ({ shift, loading }) => {
  if (loading) return (
    <div className="card card-body h-32 flex items-center justify-center">
      <div className="animate-spin w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full" />
    </div>
  )

  const isOpen = shift && !shift.closed_at

  return (
    <div className="card card-body">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock size={15} className="text-gray-400" />
          <h3 className="font-semibold text-gray-800 text-sm">Current Shift</h3>
        </div>
        <span className={`badge ${isOpen ? 'badge-success' : 'badge-danger'}`}>
          {shift ? (isOpen ? '🟢 Open' : '🔴 Closed') : 'No Shift'}
        </span>
      </div>

      {shift ? (
        <div className="space-y-2">
          {[
            { label: 'Cashier',         value: shift.user?.name ?? '—', icon: <User size={12} /> },
            { label: 'Opening Balance', value: `৳ ${Number(shift.opening_cash ?? 0).toLocaleString()}` },
            { label: 'Started',         value: fmt(shift.opened_at) },
          ].map(({ label, value, icon }) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-1">{icon}{label}</span>
              <span className="font-medium text-gray-800">{value}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-3">কোন active shift নেই</p>
      )}
    </div>
  )
}

export default ShiftWidget