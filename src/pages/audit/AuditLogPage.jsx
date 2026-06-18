import { useState, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'
import api from '../../lib/axios'
import Pagination from '../../components/ui/Pagination'

const fmtDT = d => d ? new Date(d).toLocaleString('en-BD',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—'

const AuditLogPage = () => {
  const [items,setItems]=useState([]); const [meta,setMeta]=useState(null)
  const [loading,setLoading]=useState(true); const [search,setSearch]=useState(''); const [page,setPage]=useState(1)

  const load = useCallback(async()=>{
    setLoading(true)
    try {
      const {data} = await api.get('/audit-logs',{params:{page,per_page:20,search:search||undefined}})
      const d=data?.data; setItems(Array.isArray(d)?d:d?.data??[]); setMeta(d?.meta??(d?.last_page?d:null))
    } catch { setItems([]) } finally { setLoading(false) }
  },[page,search])

  useEffect(()=>{load()},[load])
  useEffect(()=>{const t=setTimeout(()=>setPage(1),400);return()=>clearTimeout(t)},[search])

  const eventColor = (event) => ({
    created:'badge-success', updated:'badge-info', deleted:'badge-danger',
    login:'badge-gray', logout:'badge-gray',
  }[event?.toLowerCase()]??'badge-gray')

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Audit Logs</h1><p className="page-subtitle">System activity logs — read only</p></div>
      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search activities..." className="input pl-9"/>
          </div>
        </div>
        <div className="table-wrapper rounded-none border-x-0 border-b-0">
          <table className="table">
            <thead><tr><th className="w-10">#</th><th>User</th><th>Event</th><th>Model</th><th>Description</th><th>Date & Time</th></tr></thead>
            <tbody>
              {loading?(<tr><td colSpan={6} className="py-14 text-center"><div className="spinner border-brand-600 mx-auto"/></td></tr>)
              :!items.length?(<tr><td colSpan={6} className="py-10 text-center text-gray-400 text-sm">কোন log নেই</td></tr>)
              :items.map((log,i)=>(
                <tr key={log.id}>
                  <td className="text-gray-400 text-xs">{(page-1)*20+i+1}</td>
                  <td className="text-sm font-medium text-gray-800">{log.user?.name??log.causer?.name??'System'}</td>
                  <td><span className={`badge ${eventColor(log.event??log.action)}`}>{log.event??log.action??'—'}</span></td>
                  <td className="text-xs text-gray-500 font-mono">{log.auditable_type?.split('\\').pop()??log.model??'—'}</td>
                  <td className="text-sm text-gray-600 max-w-xs truncate">{log.description??log.message??`${log.auditable_type?.split('\\').pop()??''} #${log.auditable_id??''}`}</td>
                  <td className="text-xs text-gray-400 whitespace-nowrap">{fmtDT(log.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={meta} onPageChange={setPage}/>
      </div>
    </div>
  )
}
export default AuditLogPage