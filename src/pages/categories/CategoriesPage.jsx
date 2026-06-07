import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Search, Layers, ChevronRight } from 'lucide-react'
import api from '../../lib/axios'
import useCrud       from '../../hooks/useCrud'
import Modal         from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Pagination    from '../../components/ui/Pagination'

const INIT = { name: '', parent_id: '', description: '', is_active: true }

const CategoriesPage = () => {
  const c = useCrud('/categories', { initialForm: INIT })

  // Parent dropdown এর জন্য সব categories load করি
  const [allCats, setAllCats] = useState([])
  useEffect(() => {
    api.get('/categories?per_page=500')
      .then(({ data }) => {
        const d = data?.data
        setAllCats(Array.isArray(d) ? d : d?.data ?? [])
      })
      .catch(() => {})
  }, [c.modal])

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Product categories manage করুন</p>
        </div>
        <button onClick={c.openAdd} className="btn-primary"><Plus size={16} /> Add Category</button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={c.search} onChange={e => c.setSearch(e.target.value)}
              placeholder="Category search করুন..." className="input pl-9" />
          </div>
        </div>

        <div className="table-wrapper rounded-none border-x-0 border-b-0">
          <table className="table">
            <thead>
              <tr>
                <th className="w-10">#</th>
                <th>Category Name</th>
                <th>Parent</th>
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
                  <Layers size={36} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm">কোন category নেই</p>
                </td></tr>
              ) : c.items.map((cat, i) => (
                <tr key={cat.id}>
                  <td className="text-gray-400 text-xs">{(c.page-1)*15+i+1}</td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      {cat.parent_id && <ChevronRight size={12} className="text-gray-300 flex-shrink-0" />}
                      <span className="font-medium text-gray-900">{cat.name}</span>
                    </div>
                  </td>
                  <td>
                    {cat.parent?.name
                      ? <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded">{cat.parent.name}</span>
                      : <span className="text-gray-300 text-sm">Root</span>
                    }
                  </td>
                  <td>
                    <span className={`badge ${cat.is_active ? 'badge-success' : 'badge-gray'}`}>
                      {cat.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => c.openEdit(cat, {
                        name: cat.name, parent_id: cat.parent_id ?? '',
                        description: cat.description ?? '', is_active: cat.is_active ?? true,
                      })} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => c.confirmDelete(cat)}
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
        title={c.editing ? 'Category Edit করুন' : 'নতুন Category যোগ করুন'} size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Category Name <span className="text-red-500">*</span></label>
            <input name="name" value={c.form.name} onChange={c.onChange}
              placeholder="যেমন: Electronics, Food & Beverage"
              className={`input ${c.errors.name ? 'input-error' : ''}`} autoFocus />
            {c.errors.name && <p className="form-error">{c.errors.name}</p>}
          </div>

          <div>
            <label className="label">Parent Category</label>
            <select name="parent_id" value={c.form.parent_id} onChange={c.onChange} className="input">
              <option value="">— Root Category (কোন parent নেই) —</option>
              {allCats
                .filter(cat => !c.editing || cat.id !== c.editing.id)
                .map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.parent_id ? `  → ` : ''}{cat.name}
                  </option>
                ))
              }
            </select>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea name="description" value={c.form.description} onChange={c.onChange}
              rows={2} className="input resize-none" placeholder="(optional)" />
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
        title="Category Delete করুন"
        message={`"${c.delTarget?.name}" delete করতে চান? Sub-categories প্রভাবিত হতে পারে।`} />
    </div>
  )
}

export default CategoriesPage