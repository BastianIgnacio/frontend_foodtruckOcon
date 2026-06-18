import { useEffect } from 'react'
import {
  Box, Card, CardContent, Typography, Grid, Switch, Chip,
  CircularProgress, Alert, Avatar
} from '@mui/material'
import SlideshowIcon from '@mui/icons-material/Slideshow'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts } from '../store/products/actions'
import { toggleProductCarouselApi } from '../api'

const CATEGORY_EMOJIS = { 'Hot Dogs': '🌭', 'Hamburguesas': '🍔', 'Acompañamientos': '🍟', 'Bebidas': '🥤', 'General': '🍽️', 'Otro': '🥘' }
const fmt = n => Number(n || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })

export default function CarouselPage() {
  const dispatch = useDispatch()
  const { list: products, loading } = useSelector(s => s.products)

  useEffect(() => {
    dispatch(fetchProducts({ active_only: true }))
  }, [dispatch])

  const handleToggle = async (product) => {
    try {
      await toggleProductCarouselApi(product.id)
      dispatch(fetchProducts({ active_only: true }))
    } catch (e) {
      console.error(e)
    }
  }

  const carouselCount = products.filter(p => p.show_in_carousel).length

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <SlideshowIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant="h5" fontWeight={700}>Carrusel de Productos</Typography>
          <Typography variant="body2" color="text.secondary">
            Selecciona los productos que se mostrarán en <strong>/productosVitrina</strong>
          </Typography>
        </Box>
        <Chip
          label={`${carouselCount} en carrusel`}
          color={carouselCount > 0 ? 'primary' : 'default'}
          sx={{ ml: 'auto' }}
        />
      </Box>

      {loading && <CircularProgress />}
      {!loading && products.length === 0 && (
        <Alert severity="info">No hay productos activos</Alert>
      )}

      <Grid container spacing={2}>
        {products.map(product => {
          const emoji = CATEGORY_EMOJIS[product.category] || '🍽️'
          return (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card
                sx={{
                  opacity: product.show_in_carousel ? 1 : 0.6,
                  transition: 'all 0.2s',
                  border: '2px solid',
                  borderColor: product.show_in_carousel ? 'primary.main' : 'transparent',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {product.image_url ? (
                      <Avatar
                        src={product.image_url}
                        variant="rounded"
                        sx={{ width: 56, height: 56 }}
                      />
                    ) : (
                      <Avatar variant="rounded" sx={{ width: 56, height: 56, fontSize: 28, bgcolor: 'action.hover' }}>
                        {emoji}
                      </Avatar>
                    )}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography fontWeight={600} noWrap>{product.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{product.category}</Typography>
                      <Typography variant="body2" color="primary.main" fontWeight={700}>{fmt(product.price)}</Typography>
                    </Box>
                    <Switch
                      checked={!!product.show_in_carousel}
                      onChange={() => handleToggle(product)}
                      color="primary"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}
