import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import useCrud       from '../../hooks/useCrud'
import Modal         from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

const INIT = { name: '', description: '', is_active: true }

const ExpenseCategoriesPage = () => {
  const c = useCrud('/expense-categories', { initialForm: INIT })
  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div><h1 className="page-title">Expense Categories</h1><p className="page-subtitle">Expense categories manage করুন</p></div>
        <button onClick={c.openAdd} className="btn-primary"><Plus size={16}/> Add Category</button>
      </div>
      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={c.search} onChange={e=>c.setSearch(e.target.value)} placeholder="Search..." className="input pl-9"/>
          </div>
        </div>
        <div className="table-wrapper rounded-none border-x-0 border-b-0">
          <table className="table">
            <thead><tr><th className="w-10">#</th><th>Category Name</th><th>Description</th><th className="w-24">Status</th><th className="w-20 text-right">Actions</th></tr></thead>
            <tbody>
              {c.loading?(<tr><td colSpan={5} className="py-14 text-center"><div className="spinner border-brand-600 mx-auto"/></td></tr>)
              :!c.items.length?(<tr><td colSpan={5} className="py-10 text-center text-gray-400 text-sm">কোন category নেই</td></tr>)
              :c.items.map((item,i)=>(
                <tr key={item.id}>
                  <td className="text-gray-400 text-xs">{(c.page-1)*15+i+1}</td>
                  <td className="font-medium text-gray-900">{item.name}</td>
                  <td className="text-gray-500 text-sm">{item.description||<span className="text-gray-300">—</span>}</td>
                  <td><span className={`badge ${item.is_active?'badge-success':'badge-gray'}`}>{item.is_active?'Active':'Inactive'}</span></td>
                  <td className="text-right"><div className="flex justify-end gap-1">
                    <button onClick={()=>c.openEdit(item,{name:item.name,description:item.description??'',is_active:item.is_active??true})} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"><Pencil size={14}/></button>
                    <button onClick={()=>c.confirmDelete(item)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={14}/></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={c.modal} onClose={c.closeModal} title={c.editing?'Edit Category':'New Category'} size="sm">
        <div className="space-y-4">
          <div><label className="label">Name *</label>
            <input name="name" value={c.form.name} onChange={c.onChange} autoFocus className={`input ${c.errors.name?'input-error':''}`} placeholder="Category নাম"/>
            {c.errors.name&&<p className="form-error">{c.errors.name}</p>}</div>
          <div><label className="label">Description</label>
            <input name="description" value={c.form.description} onChange={c.onChange} className="input" placeholder="(optional)"/></div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="is_active" checked={c.form.is_active} onChange={c.onChange} className="w-4 h-4 accent-brand-600"/>
            <span className="text-sm text-gray-700">Active</span></label>
          <div className="flex justify-end gap-3"><button onClick={c.closeModal} className="btn-secondary">বাতিল</button>
            <button onClick={()=>c.save()} disabled={c.saving} className="btn-primary">{c.saving?<><span className="spinner"/> Saving...</>:(c.editing?'Update':'Save')}</button></div>
        </div>
      </Modal>
      <ConfirmDialog open={!!c.delTarget} onClose={c.cancelDelete} onConfirm={c.doDelete} loading={c.delLoading} message={`"${c.delTarget?.name}" delete করতে চান?`}/>
    </div>
  )
}
export default ExpenseCategoriesPage