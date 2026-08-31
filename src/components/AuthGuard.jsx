import { Navigate } from "react-router-dom";
import { useAuth } from "../auth";

export function AuthGuard({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-white p-6 text-center shadow-soft">
        Checking session...
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
