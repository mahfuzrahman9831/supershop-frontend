import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

// Time ago (Bangla)
const timeAgo = (str) => {
  if (!str) return '—'
  const mins = Math.floor((Date.now() - new Date(str)) / 60000)
  if (mins < 1)  return 'এখনই'
  if (mins < 60) return `${mins} মি আগে`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs} ঘণ্টা আগে`
  return `${Math.floor(hrs / 24)} দিন আগে`
}

const statusClass = (status) => ({
  completed: 'badge-success',
  paid:      'badge-success',
  partial:   'badge-warning',
  due:       'badge-danger',
  pending:   'badge-warning',
  draft:     'badge-gray',
}[status] ?? 'badge-gray')

const RecentSalesTable = ({ sales = [], loading }) => (
  <div className="card">
    <div className="card-header flex items-center justify-between">
      <span>Recent Sales</span>
      <Link to="/sales" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
        সব দেখুন <ArrowRight size={11} />
      </Link>
    </div>

    <div className="table-wrapper rounded-none border-x-0 border-b-0">
      <table className="table">
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Customer</th>
            <th className="text-right">Amount</th>
            <th>Status</th>
            <th className="text-right">Time</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} className="text-center py-10">
                <div className="animate-spin w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full mx-auto" />
              </td>
            </tr>
          ) : !sales.length ? (
            <tr>
              <td colSpan={5} className="text-center py-10 text-gray-400 text-sm">
                আজকে কোন sale নেই
              </td>
            </tr>
          ) : sales.map((s) => (
            <tr key={s.id}>
              <td>
                <Link to={`/sales/${s.id}`} className="text-brand-600 hover:underline font-mono text-xs font-medium">
                  {s.invoice_number ?? `#${s.id}`}
                </Link>
              </td>
              <td className="text-gray-700 text-sm">{s.customer?.name ?? 'Walk-in'}</td>
              <td className="text-right font-semibold text-gray-900">
                ৳ {Number(s.total_amount ?? 0).toLocaleString()}
              </td>
              <td>
                <span className={`badge ${statusClass(s.status)}`}>{s.status}</span>
              </td>
              <td className="text-right text-xs text-gray-400">{timeAgo(s.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

export default RecentSalesTable