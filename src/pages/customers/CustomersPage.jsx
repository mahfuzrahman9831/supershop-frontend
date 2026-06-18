import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search, Phone, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'
import api          from '../../lib/axios'
import useCrud       from '../../hooks/useCrud'
import Modal         from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Pagination    from '../../components/ui/Pagination'

const INIT = { name:'', phone:'', email:'', address:'', customer_group_id:'', notes:'', is_active:true }

const CustomersPage = () => {
  const c = useCrud('/customers', { initialForm: INIT })
  const [groups,   setGroups]   = useState([])
  const [payModal, setPayModal] = useState(false)
  const [payTarget,setPayTarget]= useState(null)
  const [payMethods,setPayMethods]= useState([])
  const [payForm,  setPayForm]  = useState({ payment_method_id:'', amount:'' })
  const [paying,   setPaying]   = useState(false)

  useEffect(()=>{
    api.get('/customer-groups?per_page=100').then(({data})=>{const d=data?.data;setGroups(Array.isArray(d)?d:d?.data??[])})
  },[])

  const openPay = async (customer) => {
    setPayTarget(customer); setPayForm({payment_method_id:'',amount:String(customer.total_due??0)})
    if(!payMethods.length){const {data}=await api.get('/payment-methods?per_page=100');const d=data?.data;setPayMethods(Array.isArray(d)?d:d?.data??[])}
    setPayModal(true)
  }
  const doPay = async () => {
    if(!payForm.payment_method_id){toast.error('Method select করুন');return}
    setPaying(true)
    try {
      await api.post(`/customers/${payTarget.id}/payment`,{payment_method_id:payForm.payment_method_id,amount:Number(payForm.amount)})
      toast.success('Payment সফল ✓'); setPayModal(false); c.reload()
    } catch(err){ toast.error(err.response?.data?.message??'Error') } finally{setPaying(false)}
  }

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div><h1 className="page-title">Customers</h1><p className="page-subtitle">Customer accounts manage করুন</p></div>
        <button onClick={c.openAdd} className="btn-primary"><Plus size={16}/> Add Customer</button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={c.search} onChange={e=>c.setSearch(e.target.value)} placeholder="Name বা phone search..." className="input pl-9"/>
          </div>
        </div>
        <div className="table-wrapper rounded-none border-x-0 border-b-0">
          <table className="table">
            <thead><tr><th className="w-10">#</th><th>Customer</th><th>Phone</th><th>Group</th><th className="text-right">Total Purchase</th><th className="text-right">Due</th><th className="text-right">Points</th><th className="w-20 text-right">Actions</th></tr></thead>
            <tbody>
              {c.loading?(<tr><td colSpan={8} className="py-14 text-center"><div className="spinner border-brand-600 mx-auto"/></td></tr>)
              :!c.items.length?(<tr><td colSpan={8} className="py-10 text-center text-gray-400 text-sm">কোন customer নেই</td></tr>)
              :c.items.map((cust,i)=>{
                const due=Number(cust.total_due??0)
                return(<tr key={cust.id}>
                  <td className="text-gray-400 text-xs">{(c.page-1)*15+i+1}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-brand-700 font-bold text-xs">{cust.name?.[0]?.toUpperCase()}</span>
                      </div>
                      <div><p className="font-medium text-gray-900 text-sm">{cust.name}</p>
                        <p className="text-xs text-gray-400">{cust.email??''}</p></div>
                    </div>
                  </td>
                  <td>{cust.phone?<a href={`tel:${cust.phone}`} className="flex items-center gap-1 text-brand-600 hover:underline text-sm"><Phone size={12}/>{cust.phone}</a>:<span className="text-gray-300">—</span>}</td>
                  <td className="text-sm text-gray-500">{cust.group?.name??'—'}</td>
                  <td className="text-right text-sm font-medium text-gray-700">৳ {Number(cust.total_purchase??0).toLocaleString()}</td>
                  <td className="text-right">{due>0?<span className="text-red-600 font-bold text-sm">৳ {due.toLocaleString()}</span>:<span className="text-emerald-600 text-sm">Clear</span>}</td>
                  <td className="text-right text-sm text-purple-600 font-medium">{Number(cust.loyalty_points??0).toLocaleString()}</td>
                  <td className="text-right"><div className="flex justify-end gap-1">
                    {due>0&&<button onClick={()=>openPay(cust)} className="p-1.5 rounded-lg hover:bg-green-50 text-emerald-600"><CreditCard size={14}/></button>}
                    <button onClick={()=>c.openEdit(cust,{name:cust.name,phone:cust.phone??'',email:cust.email??'',address:cust.address??'',customer_group_id:cust.customer_group_id??'',notes:cust.notes??'',is_active:cust.is_active??true})} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"><Pencil size={14}/></button>
                    <button onClick={()=>c.confirmDelete(cust)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={14}/></button>
                  </div></td>
                </tr>)
              })}
            </tbody>
          </table>
        </div>
        <Pagination meta={c.meta} onPageChange={c.setPage}/>
      </div>

      {/* Customer Form Modal */}
      <Modal open={c.modal} onClose={c.closeModal} title={c.editing?'Edit Customer':'New Customer'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Name *</label>
              <input name="name" value={c.form.name} onChange={c.onChange} autoFocus className={`input ${c.errors.name?'input-error':''}`} placeholder="Customer নাম"/>
              {c.errors.name&&<p className="form-error">{c.errors.name}</p>}</div>
            <div><label className="label">Phone *</label>
              <input name="phone" value={c.form.phone} onChange={c.onChange} className={`input ${c.errors.phone?'input-error':''}`} placeholder="01XXXXXXXXX"/>
              {c.errors.phone&&<p className="form-error">{c.errors.phone}</p>}</div>
            <div><label className="label">Email</label>
              <input name="email" type="email" value={c.form.email} onChange={c.onChange} className="input" placeholder="(optional)"/></div>
            <div><label className="label">Customer Group</label>
              <select name="customer_group_id" value={c.form.customer_group_id} onChange={c.onChange} className="input">
                <option value="">— No Group —</option>
                {groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
              </select></div>
          </div>
          <div><label className="label">Address</label>
            <textarea name="address" value={c.form.address} onChange={c.onChange} rows={2} className="input resize-none" placeholder="(optional)"/></div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="is_active" checked={c.form.is_active} onChange={c.onChange} className="w-4 h-4 accent-brand-600"/>
            <span className="text-sm text-gray-700">Active</span></label>
          <div className="flex justify-end gap-3"><button onClick={c.closeModal} className="btn-secondary">বাতিল</button>
            <button onClick={()=>c.save()} disabled={c.saving} className="btn-primary">{c.saving?<><span className="spinner"/> Saving...</>:(c.editing?'Update':'Save')}</button></div>
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal open={payModal} onClose={()=>setPayModal(false)} title={`Due Collection — ${payTarget?.name??''}`} size="sm">
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Due Amount:</span>
              <span className="font-bold text-red-600">৳ {Number(payTarget?.total_due??0).toLocaleString()}</span></div>
          </div>
          <div><label className="label">Payment Method *</label>
            <select value={payForm.payment_method_id} onChange={e=>setPayForm(p=>({...p,payment_method_id:e.target.value}))} className="input">
              <option value="">— Select —</option>{payMethods.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
            </select></div>
          <div><label className="label">Amount *</label>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">৳</span>
              <input type="number" min="0" step="0.01" value={payForm.amount} onChange={e=>setPayForm(p=>({...p,amount:e.target.value}))} className="input pl-7"/></div></div>
          <div className="flex justify-end gap-3"><button onClick={()=>setPayModal(false)} className="btn-secondary">বাতিল</button>
            <button onClick={doPay} disabled={paying} className="btn-success">{paying?<><span className="spinner"/> Processing...</>:'✓ Collect Payment'}</button></div>
        </div>
      </Modal>
      <ConfirmDialog open={!!c.delTarget} onClose={c.cancelDelete} onConfirm={c.doDelete} loading={c.delLoading} message={`"${c.delTarget?.name}" customer delete করতে চান?`}/>
    </div>
  )
}
export default CustomersPage