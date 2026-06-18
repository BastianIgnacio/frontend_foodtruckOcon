import { useEffect, useState } from 'react'
import {
  Box, Grid, Card, CardContent, Typography, Chip, CircularProgress,
  TextField, InputAdornment
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts } from '../store/products/actions'

const fmt = (n) => Number(n || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })
const EMOJIS = { 'Hot Dogs': '🌭', 'Hamburguesas': '🍔', 'Acompañamientos': '🍟', 'Bebidas': '🥤', 'General': '🍽️' }

export default function ClientMenuPage() {
  const dispatch = useDispatch()
  const { list: products, loading } = useSelector(s => s.products)
  const [search, setSearch] = useState('')

  useEffect(() => {
    dispatch(fetchProducts({ active_only: true }))
  }, [dispatch])

  const available = products.filter(p => p.is_active && !p.is_out_of_stock &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()))
  )

  const categories = [...new Set(available.map(p => p.category))]

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={700} color="primary.main" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <MenuBookIcon fontSize="large" /> Nuestro Menú
        </Typography>
        <Typography color="text.secondary">Productos disponibles hoy</Typography>
        <TextField
          size="small" placeholder="Buscar en el menú..." sx={{ mt: 2, maxWidth: 320 }}
          value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        />
      </Box>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress size={48} /></Box>
      ) : (
        categories.map(cat => {
          const catProducts = available.filter(p => p.category === cat)
          if (!catProducts.length) return null
          return (
            <Box key={cat} sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <span style={{ fontSize: 24 }}>{EMOJIS[cat] || '🍽️'}</span> {cat}
              </Typography>
              <Grid container spacing={2}>
                {catProducts.map(p => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={p.id}>
                    <Card sx={{ height: '100%', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 4 } }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography fontSize={48} lineHeight={1} mb={1}>
                          {EMOJIS[p.category] || '🍽️'}
                        </Typography>
                        <Typography variant="h6" fontWeight={700}>{p.name}</Typography>
                        {p.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1 }}>
                            {p.description}
                          </Typography>
                        )}
                        <Typography variant="h5" color="primary.main" fontWeight={800}>
                          {fmt(p.price)}
                        </Typography>
                        <Chip label={p.category} size="small" variant="outlined" sx={{ mt: 1 }} />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )
        })
      )}

      {!loading && available.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No hay productos disponibles en este momento
          </Typography>
        </Box>
      )}
    </Box>
  )
}
