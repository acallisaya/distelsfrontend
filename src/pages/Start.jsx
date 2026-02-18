import React, { useState, useEffect } from "react";
import Logo from "../assets/distelslogo.png";
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
  ListItemIcon,
  Grid,
  Paper,
  Avatar,
  Chip,
  Container
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import PhoneIcon from "@mui/icons-material/Phone";
import QrCodeIcon from "@mui/icons-material/QrCode";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import VideocamIcon from "@mui/icons-material/Videocam";
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // VERIFICAR AUTENTICACIÓN AL CARGAR
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
    }
  }, []);

  const toggleDrawer = (state) => () => setOpen(state);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (logout) logout();
    window.location.href = '/';
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
    try {
      if (user?.nombre) return user.nombre;
      if (user?.usuario) return user.usuario;
      
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        return userData.nombre || userData.usuario || "Usuario";
      }
      return "Usuario";
    } catch {
      return "Usuario";
    }
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

  const Dashboard = () => (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Header del Dashboard */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, background: `linear-gradient(90deg, ${COLOR_PALETTE.primary}, ${COLOR_PALETTE.secondary})`, color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: getAvatarColor(getDisplayName()) }}>
            {getDisplayName().charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              👋 ¡Bienvenido {getDisplayName()}!
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Estadísticas Rápidas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: `${COLOR_PALETTE.primary}10` }}>
            <VideocamIcon sx={{ fontSize: 30, color: COLOR_PALETTE.primary, mb: 1 }} />
            <Typography variant="h6">Servicios</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: `${COLOR_PALETTE.success}10` }}>
            <PeopleAltIcon sx={{ fontSize: 30, color: COLOR_PALETTE.success, mb: 1 }} />
            <Typography variant="h6">Clientes</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: `${COLOR_PALETTE.info}10` }}>
            <CardGiftcardIcon sx={{ fontSize: 30, color: COLOR_PALETTE.info, mb: 1 }} />
            <Typography variant="h6">Tarjetas</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: `${COLOR_PALETTE.warning}10` }}>
            <PhoneIcon sx={{ fontSize: 30, color: COLOR_PALETTE.warning, mb: 1 }} />
            <Typography variant="h6">Call Center</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Accesos Rápidos */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>🔐 Accesos Rápidos</Typography>
        <Grid container spacing={2}>
          {menuItems.slice(1).map((item, index) => (
            <Grid item xs={6} md={4} key={index}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{ justifyContent: 'flex-start', py: 1.5 }}
              >
                {item.text}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );

  return (
    <Box sx={{ display: "flex", bgcolor: `${COLOR_PALETTE.dark}05`, minHeight: '100vh' }}>
      <CssBaseline />

      <AppBar position="fixed" sx={{ background: `linear-gradient(90deg, ${COLOR_PALETTE.primary}, ${COLOR_PALETTE.secondary})` }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" sx={{ flexGrow: 1, ml: 1, fontSize: '0.95rem' }}>
            DISTELS + Call Center IA
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={getDisplayName()}
              size="small"
              avatar={<Avatar sx={{ bgcolor: getAvatarColor(getDisplayName()) }}>{getDisplayName().charAt(0)}</Avatar>}
              sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}
            />
            <Button color="inherit" onClick={handleLogout} size="small" startIcon={<LogoutIcon />}>
              Salir
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer open={open} onClose={toggleDrawer(false)} PaperProps={{ sx: { width: 240 } }}>
        <Box sx={{ textAlign: 'center', py: 2, borderBottom: `1px solid ${COLOR_PALETTE.primary}20` }}>
          <img src={Logo} style={{ height: 48 }} alt="logo" />
        </Box>

        <List>
          {menuItems.map((item, idx) => (
            <ListItemButton 
              key={idx} 
              onClick={() => { navigate(item.path); setOpen(false); }}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 2, mt: 8 }}>
        {location.pathname === "/Start" ? <Dashboard /> : <Outlet />}
      </Box>
    </Box>
  );
};

export default Start;