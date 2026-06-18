import { AppBar, Toolbar, Typography, IconButton, Box, Chip, Tooltip } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import LogoutIcon from '@mui/icons-material/Logout'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/auth/actions'

const ROLE_LABELS = { ADMIN: 'Administrador', VENDEDOR: 'Vendedor', CLIENTE: 'Cliente' }
const ROLE_COLORS = { ADMIN: 'error', VENDEDOR: 'primary', CLIENTE: 'success' }

export default function Header({ onMenuToggle }) {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)

  return (
    <AppBar position="fixed" sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton color="inherit" edge="start" onClick={onMenuToggle} sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
          🍔 FoodTruck Manager
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountCircleIcon />
          <Typography variant="body2">{user?.full_name}</Typography>
          <Chip
            label={ROLE_LABELS[user?.role] || user?.role}
            color={ROLE_COLORS[user?.role] || 'default'}
            size="small"
            sx={{ fontWeight: 600 }}
          />
          <Tooltip title="Cerrar sesión">
            <IconButton color="inherit" onClick={() => dispatch(logout())}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
