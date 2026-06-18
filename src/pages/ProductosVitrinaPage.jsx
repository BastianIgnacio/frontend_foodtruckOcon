import { useEffect, useState, useRef } from 'react'
import { Box, Typography, LinearProgress } from '@mui/material'
import axios from 'axios'

const SLIDE_DURATION = 5000
const TICK_MS = 50

const CATEGORY_EMOJIS = { 'Hot Dogs': '🌭', 'Hamburguesas': '🍔', 'Acompañamientos': '🍟', 'Bebidas': '🥤', 'General': '🍽️', 'Otro': '🥘' }
const fmt = n => Number(n || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })

export default function ProductosVitrinaPage() {
  const [products, setProducts] = useState([])
  const [current, setCurrent] = useState(0)
  const [progress, setProgress] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [visible, setVisible] = useState(true)
  const startRef = useRef(null)
  const timerRef = useRef(null)
  const tickRef = useRef(null)

  useEffect(() => {
    axios.get('/api/products/public', { params: { carousel_only: true } })
      .then(r => { setProducts(r.data); setLoaded(true) })
      .catch(() => setLoaded(true))
  }, [])

  useEffect(() => {
    if (!products.length) return

    startRef.current = Date.now()
    setProgress(0)
    setVisible(true)

    tickRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current
      setProgress(Math.min((elapsed / SLIDE_DURATION) * 100, 100))
    }, TICK_MS)

    timerRef.current = setTimeout(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrent(c => (c + 1) % products.length)
      }, 400)
    }, SLIDE_DURATION)

    return () => {
      clearInterval(tickRef.current)
      clearTimeout(timerRef.current)
    }
  }, [current, products])

  if (!loaded) {
    return (
      <Box sx={{ height: '100vh', bgcolor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.4)', letterSpacing: 4 }}>CARGANDO...</Typography>
      </Box>
    )
  }

  if (!products.length) {
    return (
      <Box sx={{ height: '100vh', bgcolor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h4" sx={{ color: 'white' }}>Sin productos en el carrusel</Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.4)' }}>Agrega productos desde el panel de administración → Carrusel</Typography>
      </Box>
    )
  }

  const product = products[current]
  const emoji = CATEGORY_EMOJIS[product.category] || '🍽️'

  return (
    <Box sx={{
      height: '100vh', width: '100vw', bgcolor: '#0a0a0a',
      overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative'
    }}>
      {/* Progress bar */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 4,
          bgcolor: 'rgba(255,255,255,0.08)',
          '& .MuiLinearProgress-bar': { bgcolor: '#e53935', transition: 'none' }
        }}
      />

      {/* Dot indicators */}
      <Box sx={{ position: 'absolute', top: 20, right: 24, display: 'flex', gap: 1, zIndex: 10 }}>
        {products.map((_, i) => (
          <Box key={i} sx={{
            width: 8, height: 8, borderRadius: '50%',
            bgcolor: i === current ? '#e53935' : 'rgba(255,255,255,0.25)',
            transition: 'background-color 0.4s'
          }} />
        ))}
      </Box>

      {/* Slide */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: { xs: 4, md: 10 },
        px: { xs: 3, md: 10 },
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
        flexDirection: { xs: 'column', md: 'row' },
      }}>
        {/* Image */}
        <Box sx={{ flexShrink: 0 }}>
          {product.image_url ? (
            <Box
              component="img"
              src={product.image_url}
              alt={product.name}
              sx={{
                width: { xs: 220, md: 380 },
                height: { xs: 220, md: 380 },
                objectFit: 'cover',
                borderRadius: 4,
                boxShadow: '0 24px 80px rgba(0,0,0,0.9)'
              }}
            />
          ) : (
            <Box sx={{
              width: { xs: 220, md: 380 },
              height: { xs: 220, md: 380 },
              borderRadius: 4,
              bgcolor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: { xs: '100px', md: '150px' },
              boxShadow: '0 24px 80px rgba(0,0,0,0.9)'
            }}>
              {emoji}
            </Box>
          )}
        </Box>

        {/* Text */}
        <Box sx={{ maxWidth: 520 }}>
          <Typography sx={{
            color: '#e53935',
            fontSize: '0.85rem',
            fontWeight: 700,
            letterSpacing: 5,
            textTransform: 'uppercase',
            mb: 1
          }}>
            {product.category}
          </Typography>
          <Typography sx={{
            color: 'white',
            fontWeight: 900,
            lineHeight: 1.05,
            fontSize: { xs: '2.8rem', md: '4.5rem' },
            mb: 2
          }}>
            {product.name}
          </Typography>
          {product.description && (
            <Typography sx={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: { xs: '1rem', md: '1.25rem' },
              lineHeight: 1.6,
              mb: 4,
              fontWeight: 300
            }}>
              {product.description}
            </Typography>
          )}
          <Typography sx={{
            color: '#e53935',
            fontWeight: 900,
            fontSize: { xs: '2.5rem', md: '4rem' },
            letterSpacing: -1
          }}>
            {fmt(product.price)}
          </Typography>
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 2, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.7rem', letterSpacing: 6 }}>
          FOOD TRUCK
        </Typography>
      </Box>
    </Box>
  )
}
