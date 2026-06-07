import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/store/authstore"

export default function UnprotectedRoutes() {
  const currentUser = useAuthStore((state) => state.currentUser)

  if (currentUser) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
