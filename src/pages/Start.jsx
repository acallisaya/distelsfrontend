import React, { useState } from "react"; // 👈 Eliminamos useEffect
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
  Divider,
  ListItemIcon,
  Grid,
  Paper,
  Avatar,
  Chip,
  Container
} from "@mui/material"; // 👈 Eliminamos CircularProgress

import MenuIcon from "@mui/icons-material/Menu";

// Íconos
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import PhoneIcon from "@mui/icons-material/Phone";
import QrCodeIcon from "@mui/icons-material/QrCode";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import VideocamIcon from "@mui/icons-material/Videocam";
import LogoutIcon from "@mui/icons-material/Logout"; // Para cerrar sesión

import { useAuth } from "../hooks/useAuth";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const COLOR_PALETTE = {
  primary: "#667eea",
  secondary: "#f5576c",
  accent: "#EAB126",
  dark: "#040404",
  success: "#4caf50",
  info: "#2196f3",
  warning: "#ff9800"
};

const Start = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth(); // 👈 Eliminamos loading
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDrawer = (state) => () => setOpen(state);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (logout) logout();
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
    if (!user) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          return userData.nombre || userData.usuario || "Usuario";
        } catch {
          return "Usuario";
        }
      }
      return "Usuario";
    }
    return user.nombre || user.usuario || "Usuario";
  };

  const getAvatarColor = (nombre) => {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'];
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
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          background: `linear-gradient(90deg, ${COLOR_PALETTE.primary}, ${COLOR_PALETTE.secondary})`,
          color: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: getAvatarColor(getDisplayName()),
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}
          >
            {getDisplayName().charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              👋 ¡Bienvenido {getDisplayName()}!
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Sistema completo: Streaming + Call Center IA con automatización
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Estadísticas Rápidas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Paper sx={{
            p: 2,
            borderRadius: 2,
            textAlign: 'center',
            bgcolor: `${COLOR_PALETTE.primary}10`,
            borderLeft: `4px solid ${COLOR_PALETTE.primary}`
          }}>
            <VideocamIcon sx={{ fontSize: 30, color: COLOR_PALETTE.primary, mb: 1 }} />
            <Typography variant="h6" fontWeight="bold">Servicios</Typography>
            <Typography variant="body2" color="text.secondary">Netflix, Disney+, etc.</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper sx={{
            p: 2,
            borderRadius: 2,
            textAlign: 'center',
            bgcolor: `${COLOR_PALETTE.success}10`,
            borderLeft: `4px solid ${COLOR_PALETTE.success}`
          }}>
            <PeopleAltIcon sx={{ fontSize: 30, color: COLOR_PALETTE.success, mb: 1 }} />
            <Typography variant="h6" fontWeight="bold">Clientes</Typography>
            <Typography variant="body2" color="text.secondary">Gestiona tus clientes</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper sx={{
            p: 2,
            borderRadius: 2,
            textAlign: 'center',
            bgcolor: `${COLOR_PALETTE.info}10`,
            borderLeft: `4px solid ${COLOR_PALETTE.info}`
          }}>
            <CardGiftcardIcon sx={{ fontSize: 30, color: COLOR_PALETTE.info, mb: 1 }} />
            <Typography variant="h6" fontWeight="bold">Tarjetas</Typography>
            <Typography variant="body2" color="text.secondary">Códigos y planes</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper sx={{
            p: 2,
            borderRadius: 2,
            textAlign: 'center',
            bgcolor: `${COLOR_PALETTE.warning}10`,
            borderLeft: `4px solid ${COLOR_PALETTE.warning}`
          }}>
            <PhoneIcon sx={{ fontSize: 30, color: COLOR_PALETTE.warning, mb: 1 }} />
            <Typography variant="h6" fontWeight="bold">Call Center</Typography>
            <Typography variant="body2" color="text.secondary">IA Automatizado</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Sistema de Accesos */}
      <Paper sx={{ p: 2, borderRadius: 2, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: COLOR_PALETTE.dark }}>
          🔐 Sistema de Accesos
        </Typography>
        <Grid container spacing={2}>
          {menuItems.slice(1).map((item, index) => (
            <Grid item xs={6} md={4} key={index}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  py: 1.5,
                  borderRadius: 1,
                  borderColor: COLOR_PALETTE.primary + '30',
                  '&:hover': {
                    borderColor: COLOR_PALETTE.primary,
                    backgroundColor: COLOR_PALETTE.primary + '10'
                  }
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {item.text}
                </Typography>
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

      <AppBar position="fixed" sx={{
        background: `linear-gradient(90deg, ${COLOR_PALETTE.primary}, ${COLOR_PALETTE.secondary})`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}>
        <Toolbar variant="dense" sx={{ minHeight: 48 }}>
          <IconButton color="inherit" edge="start" onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: "bold",
              fontSize: '0.95rem',
              ml: 1
            }}>
              DISTELS + Call Center IA
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={getDisplayName()}
              size="small"
              avatar={
                <Avatar sx={{ 
                  width: 24, 
                  height: 24, 
                  bgcolor: getAvatarColor(getDisplayName()),
                  fontSize: '0.75rem'
                }}>
                  {getDisplayName().charAt(0)}
                </Avatar>
              }
              sx={{
                bgcolor: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                fontSize: '0.75rem'
              }}
            />
            <Button 
              variant="outlined" 
              color="inherit" 
              onClick={handleLogout}
              size="small"
              startIcon={<LogoutIcon />}
              sx={{ 
                fontSize: '0.75rem',
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Salir
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer open={open} onClose={toggleDrawer(false)} PaperProps={{ sx: { width: 240, bgcolor: 'white' } }}>
        <Box sx={{ width: 240 }}>
          <Box sx={{ textAlign: 'center', py: 2, borderBottom: `1px solid ${COLOR_PALETTE.primary}20` }}>
            <img src={Logo} style={{ height: 48 }} alt="logo" />
            <Typography variant="caption" sx={{ display: 'block', color: COLOR_PALETTE.primary, fontWeight: 'bold', mt: 0.5 }}>
              Sistema DISTELS
            </Typography>
          </Box>

          <List sx={{ p: 1 }}>
            {menuItems.map((item, idx) => (
              <ListItemButton 
                key={idx} 
                onClick={() => { navigate(item.path); setOpen(false); }}
                selected={location.pathname === item.path}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  py: 1,
                  '&.Mui-selected': {
                    backgroundColor: `${COLOR_PALETTE.primary}15`,
                    borderLeft: `3px solid ${COLOR_PALETTE.primary}`,
                    '&:hover': { backgroundColor: `${COLOR_PALETTE.primary}20` },
                    '& .MuiListItemIcon-root': { color: COLOR_PALETTE.primary }
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  color: location.pathname === item.path ? COLOR_PALETTE.primary : COLOR_PALETTE.dark + '80',
                  minWidth: 40
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.85rem' }} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 2, mt: 6, bgcolor: `${COLOR_PALETTE.dark}02` }}>
        {location.pathname === "/Start" ? <Dashboard /> : <Outlet />}
      </Box>
    </Box>
  );
};

export default Start;