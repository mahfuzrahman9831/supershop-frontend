import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Eye, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/axios'
import Pagination from '../../components/ui/Pagination'
import Modal      from '../../components/ui/Modal'

const STATUS = { paid:'badge-success', partial:'badge-warning', due:'badge-danger', completed:'badge-success', draft:'badge-gray' }
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-BD',{day:'2-digit',month:'short',year:'numeric'}) : '—'

const SalesListPage = () => {
  const navigate = useNavigate()
  const [items,setItems]=useState([]); const [meta,setMeta]=useState(null)
  const [loading,setLoading]=useState(true); const [search,setSearch]=useState('')
  const [page,setPage]=useState(1); const [from,setFrom]=useState(''); const [to,setTo]=useState('')
  const [payModal,setPayModal]=useState(false); const [payTarget,setPayTarget]=useState(null)
  const [payMethods,setPayMethods]=useState([]); const [payForm,setPayForm]=useState({payment_method_id:'',amount:''})
  const [paying,setPaying]=useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const {data} = await api.get('/sales',{params:{page,per_page:15,search:search||undefined,from:from||undefined,to:to||undefined}})
      const d = data?.data
      setItems(Array.isArray(d)?d:d?.data??[])
      setMeta(d?.meta??(d?.last_page?d:null))
    } catch { toast.error('Sales লোড হয়নি') } finally { setLoading(false) }
  },[page,search,from,to])

  useEffect(()=>{load()},[load])
  useEffect(()=>{const t=setTimeout(()=>setPage(1),400);return()=>clearTimeout(t)},[search,from,to])

  const openPay = async (sale) => {
    setPayTarget(sale); setPayForm({payment_method_id:'',amount:String(sale.due_amount??0)})
    if(!payMethods.length){const{data}=await api.get('/payment-methods?per_page=100');const d=data?.data;setPayMethods(Array.isArray(d)?d:d?.data??[])}
    setPayModal(true)
  }
  const doPay = async () => {
    if(!payForm.payment_method_id){toast.error('Method select করুন');return}
    setPaying(true)
    try { await api.post(`/sales/${payTarget.id}/payment`,{payment_method_id:payForm.payment_method_id,amount:Number(payForm.amount)}); toast.success('Payment সফল ✓'); setPayModal(false); load() }
    catch(err){ toast.error(err.response?.data?.message??'Payment হয়নি') } finally{setPaying(false)}
  }

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Sales List</h1><p className="page-subtitle">সব sales এর record</p></div>

      <div className="card">
        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Invoice বা customer..." className="input pl-9"/>
          </div>
          <input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="input py-2 text-sm max-w-36"/>
          <span className="text-gray-400">—</span>
          <input type="date" value={to} onChange={e=>setTo(e.target.value)} className="input py-2 text-sm max-w-36"/>
          {(from||to)&&<button onClick={()=>{setFrom('');setTo('')}} className="text-xs text-red-500 hover:underline">Clear</button>}
        </div>

        <div className="table-wrapper rounded-none border-x-0 border-b-0">
          <table className="table">
            <thead><tr><th className="w-10">#</th><th>Invoice</th><th>Customer</th><th>Date</th><th className="text-right">Total</th><th className="text-right">Paid</th><th className="text-right">Due</th><th className="w-24">Status</th><th className="w-20 text-right">Actions</th></tr></thead>
            <tbody>
              {loading?(<tr><td colSpan={9} className="py-14 text-center"><div className="spinner border-brand-600 mx-auto"/></td></tr>)
              :!items.length?(<tr><td colSpan={9} className="py-14 text-center text-gray-400 text-sm">কোন sale নেই</td></tr>)
              :items.map((s,i)=>{
                const due=Number(s.due_amount??0)
                return(<tr key={s.id}>
                  <td className="text-gray-400 text-xs">{(page-1)*15+i+1}</td>
                  <td><button onClick={()=>navigate(`/sales/${s.id}`)} className="font-mono text-sm font-semibold text-brand-600 hover:underline">{s.invoice_no??`#${s.id}`}</button></td>
                  <td className="text-sm text-gray-700">{s.customer?.name??'Walk-in'}</td>
                  <td className="text-sm text-gray-500">{fmtDate(s.sale_date??s.created_at)}</td>
                  <td className="text-right font-semibold text-gray-900">৳ {Number(s.total_amount??0).toLocaleString()}</td>
                  <td className="text-right text-emerald-600 font-medium text-sm">৳ {Number(s.paid_amount??0).toLocaleString()}</td>
                  <td className="text-right">{due>0?<span className="text-red-600 font-bold text-sm">৳ {due.toLocaleString()}</span>:<span className="text-emerald-600 text-sm">Clear</span>}</td>
                  <td><span className={`badge ${STATUS[s.status]??'badge-gray'}`}>{s.status}</span></td>
                  <td className="text-right"><div className="flex justify-end gap-1">
                    <button onClick={()=>navigate(`/sales/${s.id}`)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><Eye size={14}/></button>
                    {due>0&&<button onClick={()=>openPay(s)} className="p-1.5 rounded-lg hover:bg-green-50 text-emerald-600"><CreditCard size={14}/></button>}
                  </div></td>
                </tr>)
              })}
            </tbody>
          </table>
        </div>
        <Pagination meta={meta} onPageChange={setPage}/>
      </div>

      <Modal open={payModal} onClose={()=>setPayModal(false)} title={`Payment — ${payTarget?.invoice_no??''}`} size="sm"></Modal><Modal open={payModal} onClose={()=>setPayModal(false)} title={`Payment — ${payTarget?.invoice_number??''}`} size="sm">
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-bold">৳ {Number(payTarget?.total_amount??0).toLocaleString()}</span></div>
            <div className="flex justify-between border-t pt-1"><span className="font-medium">Due</span><span className="text-red-600 font-bold">৳ {Number(payTarget?.due_amount??0).toLocaleString()}</span></div>
          </div>
          <div><label className="label">Payment Method *</label>
            <select value={payForm.payment_method_id} onChange={e=>setPayForm(p=>({...p,payment_method_id:e.target.value}))} className="input">
              <option value="">— Select —</option>{payMethods.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
            </select></div>
          <div><label className="label">Amount *</label>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">৳</span>
              <input type="number" min="0" step="0.01" value={payForm.amount} onChange={e=>setPayForm(p=>({...p,amount:e.target.value}))} className="input pl-7"/></div></div>
          <div className="flex justify-end gap-3"><button onClick={()=>setPayModal(false)} className="btn-secondary">বাতিল</button>
            <button onClick={doPay} disabled={paying} className="btn-success">{paying?<><span className="spinner"/> Processing...</>:'✓ Payment করুন'}</button></div>
        </div>
      </Modal>
    </div>
  )
}
export default SalesListPage