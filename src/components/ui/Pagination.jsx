import { ChevronLeft, ChevronRight } from 'lucide-react'

const Btn = ({ p, cur, onClick }) => (
  <button
    onClick={() => onClick(p)}
    className={`w-8 h-8 text-sm rounded-lg transition-colors ${
      p === cur ? 'bg-brand-600 text-white' : 'hover:bg-gray-100 text-gray-600'
    }`}
  >{p}</button>
)

const Pagination = ({ meta, onPageChange }) => {
  if (!meta?.last_page || meta.last_page <= 1) return null

  const { current_page: cur, last_page: last, from, to, total } = meta
  const range = []
  for (let p = Math.max(1, cur - 2); p <= Math.min(last, cur + 2); p++) range.push(p)

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <span className="text-sm text-gray-500">{from}–{to} of {total}</span>
      <div className="flex items-center gap-0.5">
        <button onClick={() => onPageChange(cur - 1)} disabled={cur === 1}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 transition-colors">
          <ChevronLeft size={15} />
        </button>

        {range[0] > 1 && (
          <><Btn p={1} cur={cur} onClick={onPageChange} />
          {range[0] > 2 && <span className="px-1 text-gray-400 text-sm">…</span>}</>
        )}

        {range.map(p => <Btn key={p} p={p} cur={cur} onClick={onPageChange} />)}

        {range[range.length - 1] < last && (
          <>{range[range.length - 1] < last - 1 && <span className="px-1 text-gray-400 text-sm">…</span>}
          <Btn p={last} cur={cur} onClick={onPageChange} /></>
        )}

        <button onClick={() => onPageChange(cur + 1)} disabled={cur === last}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 transition-colors">
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}

export default Pagination