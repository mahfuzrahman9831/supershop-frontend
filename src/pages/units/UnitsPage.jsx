import { Plus, Pencil, Trash2, Search, Ruler } from 'lucide-react'
import useCrud       from '../../hooks/useCrud'
import Modal         from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Pagination    from '../../components/ui/Pagination'

const INIT = { name: '', short_name: '', is_active: true }

const UnitsPage = () => {
  const c = useCrud('/units', { initialForm: INIT })

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Units</h1>
          <p className="page-subtitle">Measurement units manage করুন</p>
        </div>
        <button onClick={c.openAdd} className="btn-primary"><Plus size={16} /> Add Unit</button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={c.search} onChange={e => c.setSearch(e.target.value)}
              placeholder="Unit search করুন..." className="input pl-9" />
          </div>
        </div>

        <div className="table-wrapper rounded-none border-x-0 border-b-0">
          <table className="table">
            <thead>
              <tr>
                <th className="w-10">#</th>
                <th>Unit Name</th>
                <th>Short Name</th>
                <th className="w-24">Status</th>
                <th className="w-20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {c.loading ? (
                <tr><td colSpan={5} className="py-14 text-center">
                  <div className="spinner border-brand-600 mx-auto" />
                </td></tr>
              ) : !c.items.length ? (
                <tr><td colSpan={5} className="py-14 text-center text-gray-400">
                  <Ruler size={36} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm">কোন unit নেই</p>
                </td></tr>
              ) : c.items.map((u, i) => (
                <tr key={u.id}>
                  <td className="text-gray-400 text-xs">{(c.page-1)*15+i+1}</td>
                  <td className="font-medium text-gray-900">{u.name}</td>
                  <td>
                    {u.short_name
                      ? <span className="bg-gray-100 text-gray-700 text-xs font-mono px-2 py-0.5 rounded">{u.short_name}</span>
                      : <span className="text-gray-300">—</span>
                    }
                  </td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-success' : 'badge-gray'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => c.openEdit(u, { name: u.name, short_name: u.short_name ?? '', is_active: u.is_active ?? true })}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => c.confirmDelete(u)}
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

      <Modal open={c.modal} onClose={c.closeModal}
        title={c.editing ? 'Unit Edit করুন' : 'নতুন Unit যোগ করুন'} size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Unit Name <span className="text-red-500">*</span></label>
            <input name="name" value={c.form.name} onChange={c.onChange}
              placeholder="যেমন: Kilogram, Liter, Piece"
              className={`input ${c.errors.name ? 'input-error' : ''}`} autoFocus />
            {c.errors.name && <p className="form-error">{c.errors.name}</p>}
          </div>
          <div>
            <label className="label">Short Name</label>
            <input name="short_name" value={c.form.short_name} onChange={c.onChange}
              placeholder="যেমন: kg, L, pcs" className="input" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" name="is_active" checked={c.form.is_active}
              onChange={c.onChange} className="w-4 h-4 accent-brand-600" />
            <span className="text-sm text-gray-700">Active</span>
          </label>
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
        message={`"${c.delTarget?.name}" unit টি delete করতে চান?`} />
    </div>
  )
}

export default UnitsPage