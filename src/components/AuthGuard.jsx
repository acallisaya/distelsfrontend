// components/AuthGuard.js
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const AuthGuard = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <h2>Cargando...</h2>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AuthGuard;