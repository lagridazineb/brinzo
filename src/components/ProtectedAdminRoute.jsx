import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function ProtectedAdminRoute({ children }) {
  const { isLoggedIn } = useAdminAuth();
  if (!isLoggedIn) return <Navigate to="/admin/login" replace />;
  return children;
}
