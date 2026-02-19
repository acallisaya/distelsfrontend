import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Start from "./pages/Start";
import EmployeeList from "./pages/EmployeeList";
import ParametrosList from "./pages/ParametrosList";
import UserList from "./pages/UserList";
import LoginCliente from './pages/LoginCliente';
import DashboardCliente from './pages/DashboardCliente';
import { ClienteAuthGuard } from './pages/ClienteAuthGuard';
import TiposParametros from "./pages/TiposParametros";
import ServiciosList from "./pages/ServiciosList";
import CuentasList from "./pages/CuentasList";
import ClientesListPro from "./pages/ClientesListPro";
import PreviewPagePro from "./pages/PreviewPagePro";
import PaginaPublicaPro from "./pages/PaginaPublicaPro";
import TarjetasList from "./pages/TarjetasList";
import PlanesList from "./pages/PlanesList";
import GenerarTarjetas from "./pages/GenerarTarjetas";
import ActivacionClienteFinalPage from './pages/ActivacionClienteFinalPage';
import CallCenterDashboard from './pages/call-center/CallCenterDashboard';
import AuthGuard from './components/AuthGuard';

// Componente Dashboard simple para la ruta index
const Dashboard = () => (
  <div style={{ padding: '20px' }}>
    <h2>Bienvenido al Dashboard</h2>
    <p>Selecciona una opción del menú</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==================== */}
        {/* RUTAS PÚBLICAS */}
        {/* ==================== */}
        <Route path="/login" element={<Login />} />
        <Route path="/login/cliente" element={<LoginCliente />} />
        <Route path="/preview/:clienteId" element={<PreviewPagePro />} />
        <Route path="/pagina/:clienteId" element={<PaginaPublicaPro />} />
        <Route path="/activar" element={<ActivacionClienteFinalPage />} />
        <Route path="/activar/:codigo" element={<ActivacionClienteFinalPage />} />

        {/* ==================== */}
        {/* RUTAS PROTEGIDAS DE ADMIN */}
        {/* ==================== */}
        <Route
          path="/"
          element={
            <AuthGuard>
              <Start />
            </AuthGuard>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="start" element={<Dashboard />} />
          <Route path="servicioslist" element={<ServiciosList />} />
          <Route path="planeslist" element={<PlanesList />} />
          <Route path="clienteslistpro" element={<ClientesListPro />} />
          <Route path="generartarjetas" element={<GenerarTarjetas />} />
          <Route path="tarjetaslist" element={<TarjetasList />} />
          <Route path="callcenter" element={<CallCenterDashboard />} />
          <Route path="tiposparametros" element={<TiposParametros />} />
          <Route path="employeelist" element={<EmployeeList />} />
          <Route path="parametroslist" element={<ParametrosList />} />
          <Route path="userlist" element={<UserList />} />
          <Route path="cuentaslist" element={<CuentasList />} />
        </Route>
        
        {/* ==================== */}
        {/* RUTA PROTEGIDA DE CLIENTE */}
        {/* ==================== */}
        <Route 
          path="/cliente/dashboard/:clienteId" 
          element={
            <ClienteAuthGuard>
              <DashboardCliente />
            </ClienteAuthGuard>
          } 
        />
        
        {/* ==================== */}
        {/* RUTA DE FALLBACK */}
        {/* ==================== */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;