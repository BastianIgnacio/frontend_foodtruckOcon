import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Typography, Box, Badge
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PointOfSaleIcon from '@mui/icons-material/PointOfSale'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import FastfoodIcon from '@mui/icons-material/Fastfood'
import LocalAtmIcon from '@mui/icons-material/LocalAtm'
import InventoryIcon from '@mui/icons-material/Inventory'
import PeopleIcon from '@mui/icons-material/People'
import StorefrontIcon from '@mui/icons-material/Storefront'
import HourglassTopIcon from '@mui/icons-material/HourglassTop'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import SlideshowIcon from '@mui/icons-material/Slideshow'
import StorageIcon from '@mui/icons-material/Storage'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import SettingsIcon from '@mui/icons-material/Settings'
import AssignmentIcon from '@mui/icons-material/Assignment'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

const DRAWER_WIDTH = 240

const navItems = [
  { label: 'Dashboard',         path: '/dashboard',         icon: <DashboardIcon />,        roles: ['ADMIN','VENDEDOR'] },
  { label: 'Nueva Venta',       path: '/nueva-venta',       icon: <PointOfSaleIcon />,      roles: ['ADMIN','VENDEDOR'] },
  { label: 'Ventas',            path: '/ventas',            icon: <ReceiptLongIcon />,      roles: ['ADMIN','VENDEDOR'] },
  { label: 'Ventas Pendientes', path: '/ventas-pendientes', icon: <PendingActionsIcon />,   roles: ['ADMIN','VENDEDOR'], badgePending: true },
  { label: 'En Espera',         path: '/en-espera',         icon: <HourglassTopIcon />,     roles: ['ADMIN','VENDEDOR'], badge: true },
  { label: 'Productos',         path: '/productos',         icon: <FastfoodIcon />,         roles: ['ADMIN','VENDEDOR'] },
  { label: 'Caja',              path: '/caja',              icon: <LocalAtmIcon />,         roles: ['ADMIN','VENDEDOR'] },
  { label: 'Materias Primas',   path: '/materias-primas',   icon: <InventoryIcon />,        roles: ['ADMIN','VENDEDOR'] },
  { label: 'Tareas',            path: '/tareas',            icon: <AssignmentIcon />,       roles: ['ADMIN'] },
  { label: 'Usuarios',          path: '/usuarios',          icon: <PeopleIcon />,           roles: ['ADMIN'] },
  { label: 'BD',                path: '/bd',                icon: <StorageIcon />,          roles: ['ADMIN'] },
  { label: 'Carrusel',          path: '/carrusel',          icon: <SlideshowIcon />,        roles: ['ADMIN'] },
  { label: 'Carrusel 2',        path: '/carrusel2',         icon: <SlideshowIcon />,        roles: ['ADMIN'] },
  { label: 'Carrusel 3',        path: '/carrusel3',         icon: <SlideshowIcon />,        roles: ['ADMIN'] },
  { label: 'Tienda',            path: '/tienda',            icon: <StorefrontIcon />,       roles: ['ADMIN','VENDEDOR'], external: true },
  { label: 'Configuraciones',   path: '/configuraciones',   icon: <SettingsIcon />,         roles: ['ADMIN','VENDEDOR'] },
]

export default function Sidebar({ open, onClose, variant }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useSelector(s => s.auth)
  const { list: pendingOrders } = useSelector(s => s.pendingOrders)

  const waitingCount = pendingOrders.filter(o => o.status === 'WAITING').length
  const pendingPaymentCount = pendingOrders.filter(o => o.status === 'PENDING_PAYMENT').length

  const visible = navItems.filter(i => i.roles.includes(user?.role))

  const handleClick = (item) => {
    if (item.external) {
      window.open(item.path, '_blank')
    } else {
      navigate(item.path)
      if (variant === 'temporary') onClose()
    }
  }

  const content = (
    <>
      <Toolbar />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          MENÚ PRINCIPAL
        </Typography>
      </Box>
      <List dense>
        {visible.map(item => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={!item.external && location.pathname === item.path}
              onClick={() => handleClick(item)}
              sx={{
                mx: 1, borderRadius: 2, mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.main', color: 'white',
                  '& .MuiListItemIcon-root': { color: 'white' },
                  '&:hover': { bgcolor: 'primary.dark' }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                {item.badge && waitingCount > 0
                  ? <Badge badgeContent={waitingCount} color="error">{item.icon}</Badge>
                  : item.badgePending && pendingPaymentCount > 0
                    ? <Badge badgeContent={pendingPaymentCount} color="warning">{item.icon}</Badge>
                    : item.icon
                }
              </ListItemIcon>
              <ListItemText primary={item.label} />
              {item.external && <OpenInNewIcon sx={{ fontSize: 14, opacity: 0.5 }} />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  )

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{ width: DRAWER_WIDTH, flexShrink: 0, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
    >
      {content}
    </Drawer>
  )
}
