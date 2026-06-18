import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Search, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api          from '../../lib/axios'
import Modal         from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Pagination    from '../../components/ui/Pagination'

const INIT = { expense_category_id:'', amount:'', expense_date: new Date().toISOString().slice(0,10), reference:'', description:'', is_approved: false }
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-BD',{day:'2-digit',month:'short',year:'numeric'}) : '—'

const ExpensesPage = () => {
  const [items,setItems]=useState([]); const [meta,setMeta]=useState(null)
  const [loading,setLoading]=useState(true); const [search,setSearch]=useState(''); const [page,setPage]=useState(1)
  const [cats,setCats]=useState([]); const [modal,setModal]=useState(false); const [editing,setEditing]=useState(null)
  const [form,setForm]=useState({...INIT}); const [saving,setSaving]=useState(false); const [errors,setErrors]=useState({})
  const [delTarget,setDelTarget]=useState(null); const [delLoading,setDelLoading]=useState(false)

  const load = useCallback(async()=>{
    setLoading(true)
    try {
      const {data} = await api.get('/expenses',{params:{page,per_page:15,search:search||undefined}})
      const d=data?.data; setItems(Array.isArray(d)?d:d?.data??[]); setMeta(d?.meta??(d?.last_page?d:null))
    } catch { toast.error('Expenses লোড হয়নি') } finally { setLoading(false) }
  },[page,search])

  useEffect(()=>{load()},[load])
  useEffect(()=>{const t=setTimeout(()=>setPage(1),400);return()=>clearTimeout(t)},[search])
  useEffect(()=>{
    api.get('/expense-categories?per_page=200').then(({data})=>{const d=data?.data;setCats(Array.isArray(d)?d:d?.data??[])})
  },[])

  const openAdd  = () => { setEditing(null); setForm({...INIT}); setErrors({}); setModal(true) }
  const openEdit = (item) => {
    setEditing(item)
    setForm({expense_category_id:item.expense_category_id??'',amount:item.amount??'',
      expense_date:item.expense_date?.slice(0,10)??item.created_at?.slice(0,10)??INIT.expense_date,
      reference:item.reference??'',description:item.description??'',is_approved:item.is_approved??false})
    setErrors({}); setModal(true)
  }
  const onChange = ({target:{name,value,type,checked}}) => {
    setForm(p=>({...p,[name]:type==='checkbox'?checked:value})); setErrors(p=>({...p,[name]:''}))
  }
  const save = async () => {
    setSaving(true)
    try {
      const body = {...form,amount:Number(form.amount),expense_category_id:form.expense_category_id||undefined}
      editing ? await api.put(`/expenses/${editing.id}`,body) : await api.post('/expenses',body)
      toast.success(editing?'Update সফল ✓':'Expense যোগ হয়েছে ✓'); setModal(false); load()
    } catch(err) {
      const {errors:errs,message}=err.response?.data??{}
      if(errs) setErrors(errs); else toast.error(message??'Error হয়েছে')
    } finally { setSaving(false) }
  }
  const approve = async (id) => {
    try { await api.post(`/expenses/${id}/approve`); toast.success('Approved ✓'); load() }
    catch(err){ toast.error(err.response?.data?.message??'Error') }
  }
  const doDelete = async () => {
    setDelLoading(true)
    try { await api.delete(`/expenses/${delTarget.id}`); toast.success('Delete সফল'); setDelTarget(null); load() }
    catch(err){ toast.error(err.response?.data?.message??'Delete হয়নি') } finally{setDelLoading(false)}
  }

  const totalAmt = items.reduce((s,i)=>s+Number(i.amount??0),0)

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div><h1 className="page-title">Expenses</h1><p className="page-subtitle">Business expenses track করুন</p></div>
        <button onClick={openAdd} className="btn-primary"><Plus size={16}/> Add Expense</button>
      </div>

      {!loading&&items.length>0&&(
        <div className="card card-body mb-4 flex items-center gap-4">
          <p className="text-gray-500 text-sm">Total (this page):</p>
          <p className="text-xl font-bold text-gray-900">৳ {totalAmt.toLocaleString()}</p>
        </div>
      )}

      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="input pl-9"/>
          </div>
        </div>
        <div className="table-wrapper rounded-none border-x-0 border-b-0">
          <table className="table">
            <thead><tr><th className="w-10">#</th><th>Category</th><th>Description</th><th>Date</th><th className="text-right">Amount</th><th className="w-24">Status</th><th className="w-28 text-right">Actions</th></tr></thead>
            <tbody>
              {loading?(<tr><td colSpan={7} className="py-14 text-center"><div className="spinner border-brand-600 mx-auto"/></td></tr>)
              :!items.length?(<tr><td colSpan={7} className="py-10 text-center text-gray-400 text-sm">কোন expense নেই</td></tr>)
              :items.map((item,i)=>(
                <tr key={item.id}>
                  <td className="text-gray-400 text-xs">{(page-1)*15+i+1}</td>
                  <td className="text-sm font-medium text-gray-800">{item.category?.name??item.expense_category?.name??'—'}</td>
                  <td className="text-gray-500 text-sm max-w-xs truncate">{item.description||'—'}</td>
                  <td className="text-gray-500 text-sm">{fmtDate(item.expense_date??item.created_at)}</td>
                  <td className="text-right font-bold text-gray-900">৳ {Number(item.amount??0).toLocaleString()}</td>
                  <td><span className={`badge ${item.is_approved?'badge-success':'badge-warning'}`}>{item.is_approved?'Approved':'Pending'}</span></td>
                  <td className="text-right"><div className="flex justify-end gap-1">
                    {!item.is_approved&&<button onClick={()=>approve(item.id)} title="Approve" className="p-1.5 rounded-lg hover:bg-green-50 text-emerald-600"><CheckCircle size={14}/></button>}
                    <button onClick={()=>openEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"><Pencil size={14}/></button>
                    <button onClick={()=>setDelTarget(item)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={14}/></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={meta} onPageChange={setPage}/>
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title={editing?'Edit Expense':'New Expense'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Category</label>
              <select name="expense_category_id" value={form.expense_category_id} onChange={onChange} className="input">
                <option value="">— Category —</option>
                {cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select></div>
            <div><label className="label">Amount *</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">৳</span>
                <input name="amount" type="number" min="0" step="0.01" value={form.amount} onChange={onChange} className={`input pl-7 ${errors.amount?'input-error':''}`} placeholder="0.00"/>
              </div>{errors.amount&&<p className="form-error">{errors.amount}</p>}</div>
            <div><label className="label">Expense Date</label>
              <input name="expense_date" type="date" value={form.expense_date} onChange={onChange} className="input"/></div>
            <div><label className="label">Reference</label>
              <input name="reference" value={form.reference} onChange={onChange} className="input" placeholder="Receipt/Invoice no."/></div>
          </div>
          <div><label className="label">Description</label>
            <textarea name="description" value={form.description} onChange={onChange} rows={2} className="input resize-none" placeholder="Expense এর বিস্তারিত"/></div>
          <div className="flex justify-end gap-3"><button onClick={()=>setModal(false)} className="btn-secondary">বাতিল</button>
            <button onClick={save} disabled={saving} className="btn-primary">{saving?<><span className="spinner"/> Saving...</>:(editing?'Update':'Save')}</button></div>
        </div>
      </Modal>
      <ConfirmDialog open={!!delTarget} onClose={()=>setDelTarget(null)} onConfirm={doDelete} loading={delLoading} message={`এই expense delete করতে চান?`}/>
    </div>
  )
}
export default ExpensesPage