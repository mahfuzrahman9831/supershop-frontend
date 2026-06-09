import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'

const ConfirmDialog = ({
  open, onClose, onConfirm, loading = false,
  title      = 'নিশ্চিত করুন',
  message    = 'এটি permanently delete হবে। নিশ্চিত?',
  confirmText = 'Delete করুন',
}) => (
  <Modal open={open} onClose={onClose} title={title} size="sm">
    <div className="flex gap-3 mb-6">
      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
        <AlertTriangle size={18} className="text-red-600" />
      </div>
      <p className="text-gray-600 text-sm leading-relaxed pt-2">{message}</p>
    </div>
    <div className="flex justify-end gap-3">
      <button onClick={onClose} className="btn-secondary">বাতিল</button>
      <button onClick={onConfirm} disabled={loading} className="btn-danger">
        {loading ? <><span className="spinner" /> Deleting...</> : confirmText}
      </button>
    </div>
  </Modal>
)

export default ConfirmDialog