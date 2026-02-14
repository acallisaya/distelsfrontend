import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==================== */}
        {/* RUTAS PÚBLICAS */}
        {/* ==================== */}
        <Route path="/Login" element={<Login />} />
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
            <ProtectedRoute>
              <Start />
            </ProtectedRoute>
          }
        >
          <Route index element={<h2>Bienvenido al Inicio</h2>} />
          <Route path="Start" element={<h2>Bienvenido al Inicio</h2>} />
          <Route path="EmployeeList" element={<EmployeeList />} />
          <Route path="ParametrosList" element={<ParametrosList />} />
          <Route path="UserList" element={<UserList />} />
          <Route path="ServiciosList" element={<ServiciosList />} />
          <Route path="CuentasList" element={<CuentasList />} />
          <Route path="ClientesListPro" element={<ClientesListPro />} />
          <Route path="TarjetasList" element={<TarjetasList />} />
          <Route path="PlanesList" element={<PlanesList />} />
          <Route path="callcenter" element={<CallCenterDashboard />} />
          <Route path="GenerarTarjetas" element={<GenerarTarjetas />} />
          <Route path="TiposParametros" element={<TiposParametros />} />
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
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;