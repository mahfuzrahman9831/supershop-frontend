import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import api          from '../../lib/axios'
import useCrud       from '../../hooks/useCrud'
import Modal         from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Pagination    from '../../components/ui/Pagination'

const INIT = { name:'', email:'', phone:'', password:'', password_confirmation:'', role:'Cashier', is_active:true }
const ROLES = ['Admin','Manager','Cashier']

const UsersPage = () => {
  const c = useCrud('/users', { initialForm: INIT })

  const saveUser = async () => {
    const payload = { ...c.form }
    if (!c.editing) {
      if (payload.password !== payload.password_confirmation) {
        toast.error('Password match করেনি'); return
      }
    } else {
      if (!payload.password) { delete payload.password; delete payload.password_confirmation }
    }
    await c.save(payload)
  }

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div><h1 className="page-title">User Management</h1><p className="page-subtitle">System users ও roles manage করুন</p></div>
        <button onClick={c.openAdd} className="btn-primary"><Plus size={16}/> Add User</button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={c.search} onChange={e=>c.setSearch(e.target.value)} placeholder="User search..." className="input pl-9"/>
          </div>
        </div>
        <div className="table-wrapper rounded-none border-x-0 border-b-0">
          <table className="table">
            <thead><tr><th className="w-10">#</th><th>User</th><th>Email</th><th>Phone</th><th>Role</th><th className="w-24">Status</th><th className="w-20 text-right">Actions</th></tr></thead>
            <tbody>
              {c.loading?(<tr><td colSpan={7} className="py-14 text-center"><div className="spinner border-brand-600 mx-auto"/></td></tr>)
              :!c.items.length?(<tr><td colSpan={7} className="py-10 text-center text-gray-400 text-sm">কোন user নেই</td></tr>)
              :c.items.map((user,i)=>(
                <tr key={user.id}>
                  <td className="text-gray-400 text-xs">{(c.page-1)*15+i+1}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {user.name?.[0]?.toUpperCase()??'U'}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{user.name}</span>
                    </div>
                  </td>
                  <td className="text-sm text-gray-600">{user.email}</td>
                  <td className="text-sm text-gray-600">{user.phone??'—'}</td>
                  <td>
                    <span className={`badge ${(user.roles?.[0]??user.role)==='Admin'?'badge-danger':(user.roles?.[0]??user.role)==='Manager'?'badge-info':'badge-gray'}`}>
                      <Shield size={10} className="mr-0.5"/>{user.roles?.[0]??user.role??'—'}
                    </span>
                  </td>
                  <td><span className={`badge ${user.is_active!==false?'badge-success':'badge-gray'}`}>{user.is_active!==false?'Active':'Inactive'}</span></td>
                  <td className="text-right"><div className="flex justify-end gap-1">
                    <button onClick={()=>c.openEdit(user,{name:user.name,email:user.email,phone:user.phone??'',password:'',password_confirmation:'',role:user.roles?.[0]??user.role??'Cashier',is_active:user.is_active??true})}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"><Pencil size={14}/></button>
                    <button onClick={()=>c.confirmDelete(user)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={14}/></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={c.meta} onPageChange={c.setPage}/>
      </div>

      <Modal open={c.modal} onClose={c.closeModal} title={c.editing?'Edit User':'New User'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Full Name *</label>
              <input name="name" value={c.form.name} onChange={c.onChange} autoFocus className={`input ${c.errors.name?'input-error':''}`} placeholder="পূর্ণ নাম"/>
              {c.errors.name&&<p className="form-error">{c.errors.name}</p>}</div>
            <div><label className="label">Email *</label>
              <input name="email" type="email" value={c.form.email} onChange={c.onChange} className={`input ${c.errors.email?'input-error':''}`} placeholder="user@email.com"/>
              {c.errors.email&&<p className="form-error">{c.errors.email}</p>}</div>
            <div><label className="label">Phone</label>
              <input name="phone" value={c.form.phone} onChange={c.onChange} className="input" placeholder="01XXXXXXXXX"/></div>
            <div><label className="label">Role *</label>
              <select name="role" value={c.form.role} onChange={c.onChange} className="input">
                {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">{c.editing?'New Password (blank = no change)':'Password *'}</label>
              <input name="password" type="password" value={c.form.password} onChange={c.onChange} className={`input ${c.errors.password?'input-error':''}`} placeholder="••••••••"/>
              {c.errors.password&&<p className="form-error">{c.errors.password}</p>}</div>
            <div><label className="label">Confirm Password</label>
              <input name="password_confirmation" type="password" value={c.form.password_confirmation} onChange={c.onChange} className="input" placeholder="••••••••"/></div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="is_active" checked={c.form.is_active} onChange={c.onChange} className="w-4 h-4 accent-brand-600"/>
            <span className="text-sm text-gray-700">Active</span></label>
          <div className="flex justify-end gap-3"><button onClick={c.closeModal} className="btn-secondary">বাতিল</button>
            <button onClick={saveUser} disabled={c.saving} className="btn-primary">{c.saving?<><span className="spinner"/> Saving...</>:(c.editing?'Update':'Create User')}</button></div>
        </div>
      </Modal>
      <ConfirmDialog open={!!c.delTarget} onClose={c.cancelDelete} onConfirm={c.doDelete} loading={c.delLoading}
        message={`"${c.delTarget?.name}" user delete করতে চান?`}/>
    </div>
  )
}
export default UsersPage