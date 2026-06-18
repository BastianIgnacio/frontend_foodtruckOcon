import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { Provider } from 'react-redux'
import theme from './theme'
import store from './store'

import AppLayout from './components/Layout/AppLayout'
import PrivateRoute from './components/Layout/PrivateRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import NewSalePage from './pages/NewSalePage'
import SalesPage from './pages/SalesPage'
import ProductsPage from './pages/ProductsPage'
import CashRegisterPage from './pages/CashRegisterPage'
import RawMaterialsPage from './pages/RawMaterialsPage'
import UsersPage from './pages/UsersPage'
import TiendaPage from './pages/TiendaPage'
import EnEsperaPage from './pages/EnEsperaPage'
import VentasPendientesPage from './pages/VentasPendientesPage'
import CarouselPage from './pages/CarouselPage'
import BDPage from './pages/BDPage'
import CarouselPage2 from './pages/CarouselPage2'
import CarouselPage3 from './pages/CarouselPage3'
import ProductosVitrinaPage from './pages/ProductosVitrinaPage'
import ProductosVitrinaPage2 from './pages/ProductosVitrinaPage2'
import ProductosVitrinaPage3 from './pages/ProductosVitrinaPage3'
import ConfiguracionesPage from './pages/ConfiguracionesPage'
import TareasPage from './pages/TareasPage'

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            {/* Rutas públicas — sin login */}
            <Route path="/tienda" element={<TiendaPage />} />
            <Route path="/productosVitrina" element={<ProductosVitrinaPage />} />
            <Route path="/productosVitrina2" element={<ProductosVitrinaPage2 />} />
            <Route path="/productosVitrina3" element={<ProductosVitrinaPage3 />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="nueva-venta" element={
                <PrivateRoute roles={['ADMIN','VENDEDOR']}><NewSalePage /></PrivateRoute>
              } />
              <Route path="ventas" element={
                <PrivateRoute roles={['ADMIN','VENDEDOR']}><SalesPage /></PrivateRoute>
              } />
              <Route path="productos" element={
                <PrivateRoute roles={['ADMIN','VENDEDOR']}><ProductsPage /></PrivateRoute>
              } />
              <Route path="caja" element={
                <PrivateRoute roles={['ADMIN','VENDEDOR']}><CashRegisterPage /></PrivateRoute>
              } />
              <Route path="materias-primas" element={
                <PrivateRoute roles={['ADMIN','VENDEDOR']}><RawMaterialsPage /></PrivateRoute>
              } />
              <Route path="ventas-pendientes" element={
                <PrivateRoute roles={['ADMIN','VENDEDOR']}><VentasPendientesPage /></PrivateRoute>
              } />
              <Route path="en-espera" element={
                <PrivateRoute roles={['ADMIN','VENDEDOR']}><EnEsperaPage /></PrivateRoute>
              } />
              <Route path="usuarios" element={
                <PrivateRoute roles={['ADMIN']}><UsersPage /></PrivateRoute>
              } />
              <Route path="bd" element={
                <PrivateRoute roles={['ADMIN']}><BDPage /></PrivateRoute>
              } />
              <Route path="carrusel" element={
                <PrivateRoute roles={['ADMIN']}><CarouselPage /></PrivateRoute>
              } />
              <Route path="carrusel2" element={
                <PrivateRoute roles={['ADMIN']}><CarouselPage2 /></PrivateRoute>
              } />
              <Route path="carrusel3" element={
                <PrivateRoute roles={['ADMIN']}><CarouselPage3 /></PrivateRoute>
              } />
              <Route path="configuraciones" element={
                <PrivateRoute roles={['ADMIN','VENDEDOR']}><ConfiguracionesPage /></PrivateRoute>
              } />
              <Route path="tareas" element={
                <PrivateRoute roles={['ADMIN']}><TareasPage /></PrivateRoute>
              } />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  )
}
