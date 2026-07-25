import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;