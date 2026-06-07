import { Plus, Pencil, Trash2, Search, Truck, Phone, Mail } from 'lucide-react'
import useCrud       from '../../hooks/useCrud'
import Modal         from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Pagination    from '../../components/ui/Pagination'

const INIT = {
  name: '', company: '', phone: '', email: '',
  address: '', tax_number: '', notes: '', is_active: true,
}

const SuppliersPage = () => {
  const c = useCrud('/suppliers', { initialForm: INIT })

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Suppliers</h1>
          <p className="page-subtitle">Product suppliers manage করুন</p>
        </div>
        <button onClick={c.openAdd} className="btn-primary"><Plus size={16} /> Add Supplier</button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={c.search} onChange={e => c.setSearch(e.target.value)}
              placeholder="Supplier search করুন..." className="input pl-9" />
          </div>
        </div>

        <div className="table-wrapper rounded-none border-x-0 border-b-0">
          <table className="table">
            <thead>
              <tr>
                <th className="w-10">#</th>
                <th>Name</th>
                <th>Company</th>
                <th>Phone</th>
                <th>Due</th>
                <th className="w-24">Status</th>
                <th className="w-20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {c.loading ? (
                <tr><td colSpan={7} className="py-14 text-center">
                  <div className="spinner border-brand-600 mx-auto" />
                </td></tr>
              ) : !c.items.length ? (
                <tr><td colSpan={7} className="py-14 text-center text-gray-400">
                  <Truck size={36} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm">কোন supplier নেই</p>
                </td></tr>
              ) : c.items.map((s, i) => (
                <tr key={s.id}>
                  <td className="text-gray-400 text-xs">{(c.page-1)*15+i+1}</td>
                  <td className="font-medium text-gray-900">{s.name}</td>
                  <td className="text-gray-500 text-sm">{s.company || <span className="text-gray-300">—</span>}</td>
                  <td className="text-sm">
                    {s.phone
                      ? <a href={`tel:${s.phone}`} className="flex items-center gap-1 text-brand-600 hover:underline">
                          <Phone size={12} />{s.phone}
                        </a>
                      : <span className="text-gray-300">—</span>
                    }
                  </td>
                  <td>
                    {s.total_due > 0
                      ? <span className="text-red-600 font-semibold text-sm">৳ {Number(s.total_due).toLocaleString()}</span>
                      : <span className="text-emerald-600 text-sm">Clear</span>
                    }
                  </td>
                  <td>
                    <span className={`badge ${s.is_active ? 'badge-success' : 'badge-gray'}`}>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => c.openEdit(s, {
                        name: s.name, company: s.company ?? '', phone: s.phone ?? '',
                        email: s.email ?? '', address: s.address ?? '',
                        tax_number: s.tax_number ?? '', notes: s.notes ?? '',
                        is_active: s.is_active ?? true,
                      })} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => c.confirmDelete(s)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={c.meta} onPageChange={c.setPage} />
      </div>

      {/* Form Modal */}
      <Modal open={c.modal} onClose={c.closeModal}
        title={c.editing ? 'Supplier Edit করুন' : 'নতুন Supplier যোগ করুন'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Name <span className="text-red-500">*</span></label>
              <input name="name" value={c.form.name} onChange={c.onChange}
                placeholder="Supplier নাম" className={`input ${c.errors.name ? 'input-error' : ''}`} autoFocus />
              {c.errors.name && <p className="form-error">{c.errors.name}</p>}
            </div>
            <div>
              <label className="label">Company</label>
              <input name="company" value={c.form.company} onChange={c.onChange}
                placeholder="Company নাম" className="input" />
            </div>
            <div>
              <label className="label">Phone <span className="text-red-500">*</span></label>
              <input name="phone" value={c.form.phone} onChange={c.onChange}
                placeholder="01XXXXXXXXX" className={`input ${c.errors.phone ? 'input-error' : ''}`} />
              {c.errors.phone && <p className="form-error">{c.errors.phone}</p>}
            </div>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" value={c.form.email} onChange={c.onChange}
                placeholder="email@example.com" className="input" />
            </div>
          </div>

          <div>
            <label className="label">Address</label>
            <textarea name="address" value={c.form.address} onChange={c.onChange}
              rows={2} className="input resize-none" placeholder="পূর্ণ ঠিকানা" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Tax/VAT Number</label>
              <input name="tax_number" value={c.form.tax_number} onChange={c.onChange}
                placeholder="Tax/VAT number" className="input" />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" name="is_active" checked={c.form.is_active}
                  onChange={c.onChange} className="w-4 h-4 accent-brand-600" />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea name="notes" value={c.form.notes} onChange={c.onChange}
              rows={2} className="input resize-none" placeholder="বাড়তি তথ্য (optional)" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={c.closeModal} className="btn-secondary">বাতিল</button>
            <button onClick={() => c.save()} disabled={c.saving} className="btn-primary">
              {c.saving ? <><span className="spinner" /> Saving...</> : (c.editing ? 'Update' : 'Save')}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!c.delTarget} onClose={c.cancelDelete}
        onConfirm={c.doDelete} loading={c.delLoading}
        title="Supplier Delete করুন"
        message={`"${c.delTarget?.name}" supplier delete করতে চান? সম্পর্কিত purchases প্রভাবিত হতে পারে।`} />
    </div>
  )
}

export default SuppliersPage