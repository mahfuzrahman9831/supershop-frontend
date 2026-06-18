import { useState, useEffect, useCallback } from 'react'
import { Clock, PlayCircle, StopCircle, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/axios'
import Modal from '../../components/ui/Modal'
import Pagination from '../../components/ui/Pagination'

const fmtDT = d => d ? new Date(d).toLocaleString('en-BD',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—'

const ShiftsPage = () => {
  const [current, setCurrent] = useState(null)
  const [shifts,  setShifts]  = useState([])
  const [meta,    setMeta]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [page,    setPage]    = useState(1)
  const [payMethods,setPayMethods] = useState([])

  // Open modal
  const [openModal, setOpenModal]   = useState(false)
  const [openForm,  setOpenForm]    = useState({ opening_balance:'', opening_payment_method_id:'' })
  const [opening,   setOpening]     = useState(false)

  // Close modal
  const [closeModal,setCloseModal]  = useState(false)
  const [closeForm, setCloseForm]   = useState({ closing_balance:'', notes:'' })
  const [closing,   setClosing]     = useState(false)

  const loadCurrent = async () => {
    try { const {data}=await api.get('/shifts/current'); setCurrent(data?.data??null) } catch { setCurrent(null) }
  }

  const loadHistory = useCallback(async () => {
    try {
      const {data}=await api.get('/shifts',{params:{page,per_page:10}})
      const d=data?.data; setShifts(Array.isArray(d)?d:d?.data??[]); setMeta(d?.meta??(d?.last_page?d:null))
    } catch { setShifts([]) } finally { setLoading(false) }
  },[page])

  const loadPayMethods = async () => {
    if(payMethods.length) return
    const {data}=await api.get('/payment-methods?per_page=100')
    const d=data?.data; setPayMethods(Array.isArray(d)?d:d?.data??[])
  }

  useEffect(()=>{ loadCurrent(); loadHistory() },[loadHistory])

  const openShift = async () => {
    setOpening(true)
    try {
      await api.post('/shifts/open',{
        opening_balance: Number(openForm.opening_balance)||0,
        payment_method_id: openForm.opening_payment_method_id||undefined,
      })
      toast.success('Shift open হয়েছে ✓')
      setOpenModal(false); loadCurrent(); loadHistory()
    } catch(err){ toast.error(err.response?.data?.message??'Error') } finally{setOpening(false)}
  }

  const closeShift = async () => {
    setClosing(true)
    try {
      await api.post('/shifts/close',{
        closing_balance: Number(closeForm.closing_balance)||0,
        notes: closeForm.notes||undefined,
      })
      toast.success('Shift close হয়েছে ✓')
      setCloseModal(false); loadCurrent(); loadHistory()
    } catch(err){ toast.error(err.response?.data?.message??'Error') } finally{setClosing(false)}
  }

  const isOpen = current && !current.closed_at

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div><h1 className="page-title">Shift Management</h1><p className="page-subtitle">Cash shift open/close করুন</p></div>
        <button onClick={()=>{loadCurrent();loadHistory()}} className="btn-ghost btn-sm">
          <RefreshCw size={14}/> Refresh
        </button>
      </div>

      {/* Current Shift */}
      <div className={`card card-body mb-6 border-2 ${isOpen?'border-emerald-200 bg-emerald-50':'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isOpen?'bg-emerald-500':'bg-gray-300'}`}>
              <Clock size={22} className="text-white"/>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-900">Current Shift</p>
                <span className={`badge ${isOpen?'badge-success':'badge-gray'}`}>{isOpen?'🟢 Open':'⚫ No Active Shift'}</span>
              </div>
              {isOpen&&(
                <div className="flex gap-4 mt-1 text-sm text-gray-600">
                  <span>Cashier: <strong>{current.user?.name??'—'}</strong></span>
                  <span>Started: <strong>{fmtDT(current.opened_at)}</strong></span>
                  <span>Opening: <strong>৳ {Number(current.opening_balance??0).toLocaleString()}</strong></span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {!isOpen&&(
              <button onClick={()=>{loadPayMethods();setOpenForm({opening_balance:'',opening_payment_method_id:''});setOpenModal(true)}}
                className="btn-success"><PlayCircle size={16}/> Open Shift</button>
            )}
            {isOpen&&(
              <button onClick={()=>{setCloseForm({closing_balance:'',notes:''});setCloseModal(true)}}
                className="btn-danger"><StopCircle size={16}/> Close Shift</button>
            )}
          </div>
        </div>

        {/* Current shift summary */}
        {isOpen&&current.summary&&(
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-emerald-200">
            {[
              {label:'Sales',   value:current.summary.total_sales??0},
              {label:'Expenses',value:current.summary.total_expenses??0},
              {label:'Cash In', value:current.summary.cash_in??0},
              {label:'Cash Out',value:current.summary.cash_out??0},
            ].map(s=>(
              <div key={s.label} className="bg-white rounded-lg p-3">
                <p className="text-gray-500 text-xs">{s.label}</p>
                <p className="font-bold text-gray-900">৳ {Number(s.value).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shift history */}
      <div className="card">
        <div className="card-header">Shift History</div>
        <div className="table-wrapper rounded-none border-x-0 border-b-0">
          <table className="table">
            <thead><tr><th>#</th><th>Cashier</th><th>Opened</th><th>Closed</th><th className="text-right">Opening</th><th className="text-right">Total Sales</th><th className="w-24">Status</th></tr></thead>
            <tbody>
              {loading?(<tr><td colSpan={7} className="py-14 text-center"><div className="spinner border-brand-600 mx-auto"/></td></tr>)
              :!shifts.length?(<tr><td colSpan={7} className="py-10 text-center text-gray-400 text-sm">কোন shift history নেই</td></tr>)
              :shifts.map((s,i)=>(
                <tr key={s.id}>
                  <td className="text-gray-400 text-xs">{(page-1)*10+i+1}</td>
                  <td className="font-medium text-gray-800 text-sm">{s.user?.name??'—'}</td>
                  <td className="text-sm text-gray-600">{fmtDT(s.opened_at)}</td>
                  <td className="text-sm text-gray-600">{s.closed_at?fmtDT(s.closed_at):<span className="text-emerald-600 font-medium">Active</span>}</td>
                  <td className="text-right text-sm">৳ {Number(s.opening_balance??0).toLocaleString()}</td>
                  <td className="text-right text-sm font-medium">৳ {Number(s.total_sales??s.summary?.total_sales??0).toLocaleString()}</td>
                  <td><span className={`badge ${!s.closed_at?'badge-success':'badge-gray'}`}>{!s.closed_at?'Open':'Closed'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={meta} onPageChange={setPage}/>
      </div>

      {/* Open Shift Modal */}
      <Modal open={openModal} onClose={()=>setOpenModal(false)} title="Shift Open করুন" size="sm">
        <div className="space-y-4">
          <div><label className="label">Opening Balance (cash)</label>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">৳</span>
              <input type="number" min="0" step="0.01" value={openForm.opening_balance}
                onChange={e=>setOpenForm(p=>({...p,opening_balance:e.target.value}))} className="input pl-7" placeholder="0.00" autoFocus/></div></div>
          <div><label className="label">Payment Method (optional)</label>
            <select value={openForm.opening_payment_method_id}
              onChange={e=>setOpenForm(p=>({...p,opening_payment_method_id:e.target.value}))} className="input">
              <option value="">— Cash (default) —</option>
              {payMethods.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
            </select></div>
          <div className="flex justify-end gap-3"><button onClick={()=>setOpenModal(false)} className="btn-secondary">বাতিল</button>
            <button onClick={openShift} disabled={opening} className="btn-success">
              {opening?<><span className="spinner"/> Opening...</>:<><PlayCircle size={15}/> Open Shift</>}
            </button></div>
        </div>
      </Modal>

      {/* Close Shift Modal */}
      <Modal open={closeModal} onClose={()=>setCloseModal(false)} title="Shift Close করুন" size="sm">
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
            ⚠ Shift close করলে আর transaction করা যাবে না।
          </div>
          <div><label className="label">Closing Balance (cash count)</label>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">৳</span>
              <input type="number" min="0" step="0.01" value={closeForm.closing_balance}
                onChange={e=>setCloseForm(p=>({...p,closing_balance:e.target.value}))} className="input pl-7" placeholder="0.00" autoFocus/></div></div>
          <div><label className="label">Notes</label>
            <textarea value={closeForm.notes} onChange={e=>setCloseForm(p=>({...p,notes:e.target.value}))} rows={2} className="input resize-none" placeholder="(optional)"/></div>
          <div className="flex justify-end gap-3"><button onClick={()=>setCloseModal(false)} className="btn-secondary">বাতিল</button>
            <button onClick={closeShift} disabled={closing} className="btn-danger">
              {closing?<><span className="spinner"/> Closing...</>:<><StopCircle size={15}/> Close Shift</>}
            </button></div>
        </div>
      </Modal>
    </div>
  )
}
export default ShiftsPage