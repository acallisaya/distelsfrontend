// Start.js - Sistema Administrativo
import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  CssBaseline,
  Box,
  Button,
  Divider,
  ListItemIcon,
  Grid,
  Paper,
  Avatar,
  Chip,
  Container,
  CircularProgress
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import VideocamIcon from "@mui/icons-material/Videocam";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import PhoneIcon from "@mui/icons-material/Phone";
import QrCodeIcon from "@mui/icons-material/QrCode";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import LogoutIcon from "@mui/icons-material/Logout";

import { useAuth } from "../hooks/useAuth";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const COLOR_PALETTE = {
  primary: "#1E4B8B",
  secondary: "#AA1B2B",
  accent: "#EAB126",
  dark: "#040404",
  success: "#4caf50",
  info: "#2196f3",
  warning: "#ff9800"
};

const Start = () => {
  const [open, setOpen] = useState(false);
  const { user, logout, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Verificar autenticación al cargar
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  const toggleDrawer = (state) => () => setOpen(state);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const menuItems = [
    { text: "Dashboard", path: "/Start", icon: <DashboardIcon /> },
    { text: "Servicios", path: "/ServiciosList", icon: <VideocamIcon /> },
    { text: "Planes", path: "/PlanesList", icon: <CardGiftcardIcon /> },
    { text: "Clientes", path: "/ClientesListPro", icon: <PeopleAltIcon /> },
    { text: "Generar Tarjetas", path: "/GenerarTarjetas", icon: <QrCodeIcon /> },
    { text: "Tarjetas", path: "/TarjetasList", icon: <CardGiftcardIcon /> },
    { text: "Call Center IA", path: "/callcenter", icon: <PhoneIcon /> },
    { text: "Configuraciones", path: "/TiposParametros", icon: <SettingsIcon /> }
  ];

  const getDisplayName = () => {
    if (!user) return "Invitado";
    return user.nombre || user.usuario || "Usuario";
  };

  const getAvatarColor = (nombre) => {
    const colors = ['#1E4B8B', '#AA1B2B', '#EAB126', '#4caf50', '#2196f3'];
    if (!nombre) return colors[0];
    let hash = 0;
    for (let i = 0; i < nombre.length; i++) {
      hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando...</Typography>
      </Box>
    );
  }

  // Si no está autenticado, no renderizar nada (la redirección ya ocurrió)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box sx={{ display: "flex", bgcolor: `${COLOR_PALETTE.dark}05`, minHeight: '100vh' }}>
      <CssBaseline />

      <AppBar position="fixed" sx={{
        background: `linear-gradient(90deg, ${COLOR_PALETTE.primary}, ${COLOR_PALETTE.secondary})`,
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}>
        <Toolbar variant="dense">
          <IconButton color="inherit" edge="start" onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold", ml: 1 }}>
            DISTELS + Call Center IA
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={getDisplayName()}
              size="small"
              avatar={
                <Avatar sx={{ 
                  width: 24, 
                  height: 24, 
                  bgcolor: getAvatarColor(getDisplayName())
                }}>
                  {getDisplayName().charAt(0)}
                </Avatar>
              }
              sx={{
                bgcolor: 'rgba(255,255,255,0.1)',
                color: 'white'
              }}
            />
            <Button 
              variant="outlined" 
              color="inherit" 
              onClick={handleLogout}
              size="small"
              startIcon={<LogoutIcon />}
            >
              Salir
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer open={open} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 240, pt: 7 }}>
          <List>
            {menuItems.map((item, idx) => (
              <ListItemButton 
                key={idx} 
                onClick={() => {
                  navigate(item.path);
                  setOpen(false);
                }}
                selected={location.pathname === item.path}
              >
                <ListItemIcon sx={{ color: location.pathname === item.path ? COLOR_PALETTE.primary : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 7 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Start;