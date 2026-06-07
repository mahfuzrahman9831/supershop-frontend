import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'

const ProtectedRoute = ({ children }) => {
  const token    = useAuthStore((s) => s.token)
  const location = useLocation()

  if (!token) {
    // Login এর পর যেখানে ছিল সেখানে redirect করার জন্য state পাঠাচ্ছি
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute