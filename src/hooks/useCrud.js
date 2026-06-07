import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import api from '../lib/axios'

const useCrud = (endpoint, { initialForm = {}, perPage = 15 } = {}) => {
  const [items,      setItems]      = useState([])
  const [meta,       setMeta]       = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [page,       setPage]       = useState(1)

  const [modal,      setModal]      = useState(false)
  const [editing,    setEditing]    = useState(null)
  const [form,       setForm]       = useState({ ...initialForm })
  const [saving,     setSaving]     = useState(false)
  const [errors,     setErrors]     = useState({})

  const [delTarget,  setDelTarget]  = useState(null)
  const [delLoading, setDelLoading] = useState(false)

  // ── Load ───────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get(endpoint, {
        params: { page, per_page: perPage, search: search || undefined },
      })
      const d = data?.data
      if (Array.isArray(d)) {
        setItems(d)
        setMeta(null)
      } else {
        setItems(d?.data ?? [])
        setMeta(d?.meta ?? (d?.last_page ? d : null))
      }
    } catch {
      toast.error('Data লোড হয়নি')
    } finally {
      setLoading(false)
    }
  }, [endpoint, page, perPage, search])

  useEffect(() => { load() }, [load])

  // search change → page 1 এ reset
  useEffect(() => {
    const t = setTimeout(() => setPage(1), 400)
    return () => clearTimeout(t)
  }, [search])

  // ── Modal ─────────────────────────────────────────────────
  const openAdd = () => {
    setEditing(null)
    setForm({ ...initialForm })
    setErrors({})
    setModal(true)
  }

  const openEdit = (item, mapped) => {
    setEditing(item)
    setForm(mapped ?? { ...initialForm, ...item })
    setErrors({})
    setModal(true)
  }

  const closeModal = () => {
    setModal(false)
    setErrors({})
  }

  const onChange = ({ target: { name, value, type, checked } }) => {
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
    setErrors(p => ({ ...p, [name]: '' }))
  }

  // dropdown বা custom input এর জন্য
  const setField = (name, value) => {
    setForm(p => ({ ...p, [name]: value }))
    setErrors(p => ({ ...p, [name]: '' }))
  }

  // ── Save ──────────────────────────────────────────────────
  const save = async (payload) => {
    setSaving(true)
    try {
      const body = payload ?? form
      editing
        ? await api.put(`${endpoint}/${editing.id}`, body)
        : await api.post(endpoint, body)
      toast.success(editing ? 'Update সফল হয়েছে ✓' : 'তৈরি সফল হয়েছে ✓')
      closeModal()
      load()
      return true
    } catch (err) {
      const { errors: errs, message } = err.response?.data ?? {}
      if (errs) setErrors(errs)
      else toast.error(message ?? 'Error হয়েছে')
      return false
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ────────────────────────────────────────────────
  const confirmDelete = (item) => setDelTarget(item)
  const cancelDelete  = ()     => setDelTarget(null)

  const doDelete = async () => {
    setDelLoading(true)
    try {
      await api.delete(`${endpoint}/${delTarget.id}`)
      toast.success('Delete সফল হয়েছে')
      setDelTarget(null)
      if (items.length === 1 && page > 1) setPage(p => p - 1)
      else load()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Delete হয়নি')
    } finally {
      setDelLoading(false)
    }
  }

  return {
    items, meta, loading, search, setSearch, page, setPage,
    modal, editing, form, saving, errors, setForm, setField,
    openAdd, openEdit, closeModal, onChange, save,
    delTarget, delLoading, confirmDelete, cancelDelete, doDelete,
    reload: load,
  }
}

export default useCrud