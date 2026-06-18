import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import useCrud       from '../../hooks/useCrud'
import Modal         from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Pagination    from '../../components/ui/Pagination'

const INIT = { name:'', phone:'', email:'', designation_id:'', salary:'', join_date:new Date().toISOString().slice(0,10), is_active:true }

const EmployeesPage = () => {
  const c = useCrud('/employees', { initialForm: INIT })
  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div><h1 className="page-title">Employees</h1><p className="page-subtitle">Employee records manage করুন</p></div>
        <button onClick={c.openAdd} className="btn-primary"><Plus size={16}/> Add Employee</button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={c.search} onChange={e=>c.setSearch(e.target.value)} placeholder="Employee search..." className="input pl-9"/>
          </div>
        </div>
        <div className="table-wrapper rounded-none border-x-0 border-b-0">
          <table className="table">
            <thead><tr><th className="w-10">#</th><th>Name</th><th>Phone</th><th>Designation</th><th className="text-right">Salary</th><th>Join Date</th><th className="w-24">Status</th><th className="w-20 text-right">Actions</th></tr></thead>
            <tbody>
              {c.loading?(<tr><td colSpan={8} className="py-14 text-center"><div className="spinner border-brand-600 mx-auto"/></td></tr>)
              :!c.items.length?(<tr><td colSpan={8} className="py-10 text-center text-gray-400 text-sm">কোন employee নেই</td></tr>)
              :c.items.map((emp,i)=>(
                <tr key={emp.id}>
                  <td className="text-gray-400 text-xs">{(c.page-1)*15+i+1}</td>
                  <td className="font-medium text-gray-900 text-sm">{emp.name}</td>
                  <td className="text-sm text-gray-600">{emp.phone??'—'}</td>
                  <td className="text-sm text-gray-500">{emp.designation?.name??'—'}</td>
                  <td className="text-right text-sm font-medium">{emp.salary?`৳ ${Number(emp.salary).toLocaleString()}`:'—'}</td>
                  <td className="text-sm text-gray-500">{emp.join_date?new Date(emp.join_date).toLocaleDateString('en-BD'):'—'}</td>
                  <td><span className={`badge ${emp.is_active?'badge-success':'badge-gray'}`}>{emp.is_active?'Active':'Inactive'}</span></td>
                  <td className="text-right"><div className="flex justify-end gap-1">
                    <button onClick={()=>c.openEdit(emp,{name:emp.name,phone:emp.phone??'',email:emp.email??'',designation_id:emp.designation_id??'',salary:emp.salary??'',join_date:emp.join_date?.slice(0,10)??INIT.join_date,is_active:emp.is_active??true})}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"><Pencil size={14}/></button>
                    <button onClick={()=>c.confirmDelete(emp)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={14}/></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={c.meta} onPageChange={c.setPage}/>
      </div>

      <Modal open={c.modal} onClose={c.closeModal} title={c.editing?'Edit Employee':'New Employee'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Name *</label>
              <input name="name" value={c.form.name} onChange={c.onChange} autoFocus className={`input ${c.errors.name?'input-error':''}`} placeholder="Employee নাম"/>
              {c.errors.name&&<p className="form-error">{c.errors.name}</p>}</div>
            <div><label className="label">Phone</label>
              <input name="phone" value={c.form.phone} onChange={c.onChange} className="input" placeholder="01XXXXXXXXX"/></div>
            <div><label className="label">Email</label>
              <input name="email" type="email" value={c.form.email} onChange={c.onChange} className="input" placeholder="(optional)"/></div>
            <div><label className="label">Salary</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">৳</span>
                <input name="salary" type="number" min="0" value={c.form.salary} onChange={c.onChange} className="input pl-7" placeholder="0"/></div></div>
            <div><label className="label">Join Date</label>
              <input name="join_date" type="date" value={c.form.join_date} onChange={c.onChange} className="input"/></div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="is_active" checked={c.form.is_active} onChange={c.onChange} className="w-4 h-4 accent-brand-600"/>
                <span className="text-sm text-gray-700">Active</span></label></div>
          </div>
          <div className="flex justify-end gap-3"><button onClick={c.closeModal} className="btn-secondary">বাতিল</button>
            <button onClick={()=>c.save()} disabled={c.saving} className="btn-primary">{c.saving?<><span className="spinner"/> Saving...</>:(c.editing?'Update':'Save')}</button></div>
        </div>
      </Modal>
      <ConfirmDialog open={!!c.delTarget} onClose={c.cancelDelete} onConfirm={c.doDelete} loading={c.delLoading} message={`"${c.delTarget?.name}" delete করতে চান?`}/>
    </div>
  )
}
export default EmployeesPage