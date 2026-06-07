import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/authstore"

export default function ProtectedRoutes() {
  const location = useLocation()
  const currentUser = useAuthStore((state) => state.currentUser)

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
