import { useEffect, useState, useRef, useMemo } from 'react'
import {
  Box, Card, CardContent, Typography, Grid, Button, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem,
  Menu, ListItemIcon, ListItemText, LinearProgress,
  Accordion, AccordionSummary, AccordionDetails,
  List, ListItem, Divider
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import BlockIcon from '@mui/icons-material/Block'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import ImageIcon from '@mui/icons-material/Image'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CategoryIcon from '@mui/icons-material/Category'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import InventoryIcon from '@mui/icons-material/Inventory'
import LayersIcon from '@mui/icons-material/Layers'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts, createProduct, updateProduct, toggleStock, deleteProduct } from '../store/products/actions'
import { fetchRawMaterials } from '../store/rawMaterials/actions'
import api, { getCategoriesApi, createCategoryApi, updateCategoryApi, deleteCategoryApi, getProductRawMaterialsApi, setProductRawMaterialsApi, getProductSubcategoriesApi, createProductSubcategoryApi, updateProductSubcategoryApi, deleteProductSubcategoryApi, createSubcategoryItemApi, deleteSubcategoryItemApi } from '../api'

const fmt = (n) => Number(n || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })
const DEFAULT_EMOJI = '🍽️'
const emptyForm = { name: '', description: '', price: '', category: 'General', stock_quantity: 0, image_url: '' }

export default function ProductsPage() {
  const dispatch = useDispatch()
  const { list: products, loading, error } = useSelector(s => s.products)
  const { list: rawMaterials } = useSelector(s => s.rawMaterials)
  const { user } = useSelector(s => s.auth)

  // Product dialog
  const [dialog, setDialog] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef()

  // Context menu
  const [contextMenu, setContextMenu] = useState(null)

  const handleContextMenu = (e, product) => {
    e.preventDefault()
    setContextMenu({ mouseX: e.clientX, mouseY: e.clientY, product })
  }

  const closeContextMenu = () => setContextMenu(null)

  // Ingredients (product ↔ raw materials)
  const [ingredientsDialog, setIngredientsDialog] = useState(null)
  const [ingredients, setIngredients] = useState([])
  const [ingredientsLoading, setIngredientsLoading] = useState(false)
  const [ingredientsSaving, setIngredientsSaving] = useState(false)
  const [addMatId, setAddMatId] = useState('')
  const [addQty, setAddQty] = useState('')
  const [ingredientsError, setIngredientsError] = useState(null)

  // Subcategory groups
  const [subcatDialog, setSubcatDialog] = useState(null)
  const [subcategories, setSubcategories] = useState([])
  const [subcatLoading, setSubcatLoading] = useState(false)
  const [subcatSaving, setSubcatSaving] = useState(false)
  const [subcatError, setSubcatError] = useState(null)
  const [addingSubcat, setAddingSubcat] = useState(false)
  const [newSubcatName, setNewSubcatName] = useState('')
  const [newSubcatIsLimited, setNewSubcatIsLimited] = useState(false)
  const [newSubcatMax, setNewSubcatMax] = useState('')
  const [editingSubcatId, setEditingSubcatId] = useState(null)
  const [editSubcatName, setEditSubcatName] = useState('')
  const [editSubcatIsLimited, setEditSubcatIsLimited] = useState(false)
  const [editSubcatMax, setEditSubcatMax] = useState('')
  const [addingItemSubcatId, setAddingItemSubcatId] = useState(null)
  const [newItemName, setNewItemName] = useState('')
  const [newItemPrice, setNewItemPrice] = useState('')

  // Categories
  const [categories, setCategories] = useState([])
  const [catDialog, setCatDialog] = useState(false)
  const [editingCat, setEditingCat] = useState(null)
  const [editCatForm, setEditCatForm] = useState({ name: '', emoji: '' })
  const [addingCat, setAddingCat] = useState(false)
  const [newCatForm, setNewCatForm] = useState({ name: '', emoji: DEFAULT_EMOJI })
  const [catError, setCatError] = useState(null)
  const [catSaving, setCatSaving] = useState(false)

  useEffect(() => {
    dispatch(fetchProducts({ active_only: false }))
    dispatch(fetchRawMaterials())
    loadCategories()
  }, [dispatch])

  const loadCategories = async () => {
    try {
      const { data } = await getCategoriesApi()
      setCategories(data)
    } catch (e) {
      console.error(e)
    }
  }

  const resetImageState = () => { setImagePreview(null); setImageFile(null); setUploading(false); setDragOver(false) }

  const openCreate = () => {
    const defaultCat = categories[0]?.name || 'General'
    setEditing(null); setForm({ ...emptyForm, category: defaultCat }); setFormError(null); resetImageState(); setDialog(true)
  }
  const openEdit = (p) => {
    setEditing(p)
    setForm({ name: p.name, description: p.description || '', price: p.price, category: p.category, stock_quantity: p.stock_quantity, image_url: p.image_url || '' })
    setFormError(null); resetImageState(); setImagePreview(p.image_url || null); setDialog(true)
  }

  const handleImageSelect = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { setFormError('Solo se permiten archivos de imagen'); return }
    if (file.size > 5 * 1024 * 1024) { setFormError('La imagen no puede superar los 5 MB'); return }
    setImageFile(file); setImagePreview(URL.createObjectURL(file)); setFormError(null)
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleImageSelect(file)
  }

  const openIngredients = async (product) => {
    setIngredientsDialog(product)
    setIngredientsError(null)
    setAddMatId('')
    setAddQty('')
    setIngredientsLoading(true)
    try {
      const { data } = await getProductRawMaterialsApi(product.id)
      setIngredients(data)
    } catch {
      setIngredientsError('Error al cargar ingredientes')
    }
    setIngredientsLoading(false)
  }

  const addIngredient = () => {
    if (!addMatId || !addQty || Number(addQty) <= 0) return
    const mat = rawMaterials.find(m => m.id === Number(addMatId))
    if (!mat) return
    setIngredients(prev => [
      ...prev.filter(i => i.raw_material_id !== Number(addMatId)),
      { raw_material_id: mat.id, quantity_per_unit: Number(addQty), raw_material: mat }
    ])
    setAddMatId('')
    setAddQty('')
  }

  const removeIngredient = (rawMaterialId) => {
    setIngredients(prev => prev.filter(i => i.raw_material_id !== rawMaterialId))
  }

  const saveIngredients = async () => {
    setIngredientsSaving(true)
    setIngredientsError(null)
    try {
      await setProductRawMaterialsApi(ingredientsDialog.id, ingredients.map(i => ({
        raw_material_id: i.raw_material_id,
        quantity_per_unit: i.quantity_per_unit
      })))
      setIngredientsDialog(null)
    } catch {
      setIngredientsError('Error al guardar')
    }
    setIngredientsSaving(false)
  }

  const openSubcatDialog = async (product) => {
    setSubcatDialog(product)
    setSubcatError(null)
    setAddingSubcat(false)
    setEditingSubcatId(null)
    setAddingItemSubcatId(null)
    setSubcatLoading(true)
    try {
      const { data } = await getProductSubcategoriesApi(product.id)
      setSubcategories(data)
    } catch {
      setSubcatError('Error al cargar grupos')
    }
    setSubcatLoading(false)
  }

  const createSubcat = async () => {
    if (!newSubcatName.trim()) return
    setSubcatSaving(true)
    try {
      const maxChoices = newSubcatIsLimited && newSubcatMax ? Number(newSubcatMax) : null
      const { data } = await createProductSubcategoryApi(subcatDialog.id, { name: newSubcatName.trim(), max_choices: maxChoices })
      setSubcategories(prev => [...prev, { ...data, items: [] }])
      setAddingSubcat(false); setNewSubcatName(''); setNewSubcatIsLimited(false); setNewSubcatMax(''); setSubcatError(null)
    } catch { setSubcatError('Error al crear grupo') }
    setSubcatSaving(false)
  }

  const saveEditSubcat = async (subId) => {
    setSubcatSaving(true)
    try {
      const maxChoices = editSubcatIsLimited && editSubcatMax ? Number(editSubcatMax) : null
      const { data } = await updateProductSubcategoryApi(subcatDialog.id, subId, { name: editSubcatName.trim(), max_choices: maxChoices })
      setSubcategories(prev => prev.map(s => s.id === subId ? { ...s, ...data } : s))
      setEditingSubcatId(null); setSubcatError(null)
    } catch { setSubcatError('Error al actualizar grupo') }
    setSubcatSaving(false)
  }

  const deleteSubcat = async (subId) => {
    if (!window.confirm('¿Eliminar este grupo y todos sus ítems?')) return
    setSubcatSaving(true)
    try {
      await deleteProductSubcategoryApi(subcatDialog.id, subId)
      setSubcategories(prev => prev.filter(s => s.id !== subId)); setSubcatError(null)
    } catch { setSubcatError('Error al eliminar grupo') }
    setSubcatSaving(false)
  }

  const createSubcatItem = async (subId) => {
    if (!newItemName.trim() || newItemPrice === '') return
    setSubcatSaving(true)
    try {
      const { data } = await createSubcategoryItemApi(subcatDialog.id, subId, { name: newItemName.trim(), extra_price: Number(newItemPrice) })
      setSubcategories(prev => prev.map(s => s.id === subId ? { ...s, items: [...s.items, data] } : s))
      setNewItemName(''); setNewItemPrice(''); setAddingItemSubcatId(null); setSubcatError(null)
    } catch { setSubcatError('Error al agregar ítem') }
    setSubcatSaving(false)
  }

  const deleteSubcatItem = async (subId, itemId) => {
    setSubcatSaving(true)
    try {
      await deleteSubcategoryItemApi(subcatDialog.id, subId, itemId)
      setSubcategories(prev => prev.map(s => s.id === subId ? { ...s, items: s.items.filter(i => i.id !== itemId) } : s))
      setSubcatError(null)
    } catch { setSubcatError('Error al eliminar ítem') }
    setSubcatSaving(false)
  }

  const handleSave = async () => {
    if (!form.name || !form.price) { setFormError('Nombre y precio son requeridos'); return }
    setSaving(true)
    let finalImageUrl = form.image_url
    if (imageFile) {
      setUploading(true)
      try {
        const fd = new FormData()
        fd.append('file', imageFile)
        const { data } = await api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        finalImageUrl = data.url
      } catch (err) {
        setSaving(false); setUploading(false)
        setFormError(err.response?.data?.detail || 'Error al subir la imagen')
        return
      }
      setUploading(false)
    }
    const data = { ...form, price: Number(form.price), stock_quantity: Number(form.stock_quantity), image_url: finalImageUrl }
    const cb = (err) => { setSaving(false); if (!err) setDialog(false); else setFormError(err) }
    if (editing) dispatch(updateProduct(editing.id, data, cb))
    else dispatch(createProduct(data, cb))
  }

  // Category CRUD
  const startEditCat = (cat) => { setEditingCat(cat.id); setEditCatForm({ name: cat.name, emoji: cat.emoji }); setCatError(null) }
  const cancelEditCat = () => { setEditingCat(null); setCatError(null) }

  const saveEditCat = async (id) => {
    if (!editCatForm.name.trim()) { setCatError('El nombre es requerido'); return }
    setCatSaving(true)
    try {
      await updateCategoryApi(id, editCatForm)
      await loadCategories()
      dispatch(fetchProducts({ active_only: false }))
      setEditingCat(null); setCatError(null)
    } catch (e) {
      setCatError(e.response?.data?.detail || 'Error al guardar')
    }
    setCatSaving(false)
  }

  const handleDeleteCat = async (cat) => {
    if (!window.confirm(`¿Eliminar la categoría "${cat.name}"?`)) return
    setCatSaving(true)
    try {
      await deleteCategoryApi(cat.id)
      await loadCategories()
      dispatch(fetchProducts({ active_only: false }))
      setCatError(null)
    } catch (e) {
      setCatError(e.response?.data?.detail || 'Error al eliminar')
    }
    setCatSaving(false)
  }

  const handleToggleCatActive = async (cat) => {
    const deactivating = cat.is_active
    if (deactivating && !window.confirm(`¿Desactivar la categoría "${cat.name}"?\nTodos sus productos quedarán inactivos.`)) return
    setCatSaving(true)
    try {
      await updateCategoryApi(cat.id, { is_active: !cat.is_active })
      await loadCategories()
      dispatch(fetchProducts({ active_only: false }))
      setCatError(null)
    } catch (e) {
      setCatError(e.response?.data?.detail || 'Error al cambiar estado')
    }
    setCatSaving(false)
  }

  const handleAddCat = async () => {
    if (!newCatForm.name.trim()) { setCatError('El nombre es requerido'); return }
    setCatSaving(true)
    try {
      await createCategoryApi(newCatForm)
      await loadCategories()
      setAddingCat(false); setNewCatForm({ name: '', emoji: DEFAULT_EMOJI }); setCatError(null)
    } catch (e) {
      setCatError(e.response?.data?.detail || 'Error al crear')
    }
    setCatSaving(false)
  }

  const displayed = products

  const grouped = useMemo(() => {
    return categories.map(c => ({
      cat: c,
      products: displayed.filter(p => p.category === c.name)
    }))
  }, [categories, displayed])

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5">Productos</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          {user?.role === 'ADMIN' && (
            <Button variant="outlined" startIcon={<CategoryIcon />} onClick={() => { setCatDialog(true); setCatError(null); setEditingCat(null); setAddingCat(false) }}>
              Categorías
            </Button>
          )}
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Nuevo Producto
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {grouped.map(({ cat, products: catProducts }) => (
            <Accordion key={cat.name} defaultExpanded={catProducts.length > 0 && cat.is_active} disableGutters elevation={1}
              sx={{ opacity: cat.is_active ? 1 : 0.55 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ '&.Mui-expanded': { minHeight: 48 }, '& .MuiAccordionSummary-content.Mui-expanded': { my: 1 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography sx={{ fontSize: '1.4rem', lineHeight: 1 }}>{cat.emoji}</Typography>
                  <Typography fontWeight={600}>{cat.name}</Typography>
                  <Chip
                    label={catProducts.length}
                    size="small"
                    color={catProducts.length > 0 ? 'primary' : 'default'}
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                  {!cat.is_active && (
                    <Chip label="INACTIVA" size="small" color="error" sx={{ height: 18, fontSize: '0.65rem' }} />
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                {catProducts.length === 0 ? (
                  <Typography color="text.secondary" variant="body2" sx={{ py: 2, textAlign: 'center' }}>
                    Sin productos en esta categoría
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {catProducts.map(product => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                        <Card
                          onContextMenu={e => handleContextMenu(e, product)}
                          sx={{
                            opacity: product.is_active ? 1 : 0.6,
                            position: 'relative',
                            cursor: 'context-menu',
                            userSelect: 'none',
                          }}
                        >
                          {!product.is_active && (
                            <Chip label="INACTIVO" color="default" size="small" sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }} />
                          )}
                          {product.is_out_of_stock && product.is_active && (
                            <Chip label="SIN STOCK" color="error" size="small" sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }} />
                          )}
                          <CardContent>
                            {product.image_url ? (
                              <Box sx={{ height: 100, mb: 1, borderRadius: 1, overflow: 'hidden', bgcolor: 'grey.100' }}>
                                <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </Box>
                            ) : (
                              <Typography variant="h4" textAlign="center" lineHeight={1} mb={1}>
                                {cat.emoji}
                              </Typography>
                            )}
                            <Typography variant="subtitle1" fontWeight={600} noWrap>{product.name}</Typography>
                            <Typography variant="caption" color="text.secondary" noWrap display="block">{product.description}</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                              <Typography color="primary.main" fontWeight={700} variant="h6">{fmt(product.price)}</Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">Stock: {product.stock_quantity}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
          {displayed.length === 0 && !loading && grouped.length === 0 && (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No hay productos. ¡Agrega el primero!
            </Typography>
          )}
        </Box>
      )}

      {/* Create/Edit Product Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <TextField fullWidth label="Nombre *" margin="normal" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <TextField fullWidth label="Descripción" margin="normal" multiline rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField fullWidth label="Precio *" type="number" margin="normal" value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                InputProps={{ startAdornment: '$' }} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Stock" type="number" margin="normal" value={form.stock_quantity}
                onChange={e => setForm(f => ({ ...f, stock_quantity: e.target.value }))} />
            </Grid>
          </Grid>
          <FormControl fullWidth margin="normal">
            <InputLabel>Categoría</InputLabel>
            <Select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} label="Categoría">
              {categories.filter(c => c.is_active).map(c => (
                <MenuItem key={c.id} value={c.name}>{c.emoji} {c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>Imagen del producto</Typography>
            <Box
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              sx={{
                border: '2px dashed',
                borderColor: dragOver ? 'primary.main' : imagePreview ? 'success.main' : 'divider',
                borderRadius: 2, overflow: 'hidden', cursor: 'pointer',
                bgcolor: dragOver ? 'primary.50' : 'grey.50', transition: 'all 0.2s',
                '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' },
                minHeight: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
              }}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="preview" style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
                  <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', '&:hover': { opacity: 1 } }}>
                    <CloudUploadIcon sx={{ fontSize: 32, color: 'white', mb: 0.5 }} />
                    <Typography variant="caption" color="white" fontWeight={700}>Cambiar imagen</Typography>
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', p: 3, color: 'text.secondary' }}>
                  <ImageIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                  <Typography variant="body2" fontWeight={600}>Arrastra una imagen aquí</Typography>
                  <Typography variant="caption">o haz clic para seleccionar · JPG, PNG, WEBP · máx 5 MB</Typography>
                </Box>
              )}
            </Box>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: 'none' }} onChange={e => handleImageSelect(e.target.files[0])} />
            {imagePreview && (
              <Button size="small" color="error" sx={{ mt: 0.5 }}
                onClick={e => { e.stopPropagation(); setImagePreview(null); setImageFile(null); setForm(f => ({ ...f, image_url: '' })) }}>
                Quitar imagen
              </Button>
            )}
            {uploading && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="primary.main">Subiendo imagen…</Typography>
                <LinearProgress sx={{ mt: 0.5 }} />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)} disabled={saving}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : (editing ? 'Guardar' : 'Crear')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        open={!!contextMenu}
        onClose={closeContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
      >
        <MenuItem onClick={() => { openEdit(contextMenu.product); closeContextMenu() }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { openIngredients(contextMenu.product); closeContextMenu() }}>
          <ListItemIcon><InventoryIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Materias primas</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { openSubcatDialog(contextMenu.product); closeContextMenu() }}>
          <ListItemIcon><LayersIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Grupos de opciones</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { dispatch(toggleStock(contextMenu.product.id)); closeContextMenu() }}>
          <ListItemIcon>
            {contextMenu?.product.is_out_of_stock
              ? <CheckCircleIcon fontSize="small" color="success" />
              : <BlockIcon fontSize="small" color="warning" />}
          </ListItemIcon>
          <ListItemText>{contextMenu?.product.is_out_of_stock ? 'Marcar con stock' : 'Marcar sin stock'}</ListItemText>
        </MenuItem>
        {user?.role === 'ADMIN' && contextMenu?.product.is_active && (
          <MenuItem
            onClick={() => {
              if (window.confirm('¿Desactivar este producto?')) dispatch(deleteProduct(contextMenu.product.id))
              closeContextMenu()
            }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
            <ListItemText>Desactivar</ListItemText>
          </MenuItem>
        )}
        {user?.role === 'ADMIN' && !contextMenu?.product.is_active && (
          <MenuItem
            onClick={() => {
              dispatch(updateProduct(contextMenu.product.id, { is_active: true }))
              closeContextMenu()
            }}
            sx={{ color: 'success.main' }}
          >
            <ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>
            <ListItemText>Activar</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Ingredients Dialog */}
      <Dialog open={!!ingredientsDialog} onClose={() => setIngredientsDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InventoryIcon fontSize="small" /> Materias primas — {ingredientsDialog?.name}
        </DialogTitle>
        <DialogContent>
          {ingredientsError && <Alert severity="error" sx={{ mb: 2 }}>{ingredientsError}</Alert>}
          {ingredientsLoading ? (
            <Box sx={{ textAlign: 'center', py: 3 }}><CircularProgress /></Box>
          ) : (
            <>
              {ingredients.length === 0 ? (
                <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
                  Sin materias primas asociadas
                </Typography>
              ) : (
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', mb: 2 }}>
                  <Box component="thead">
                    <Box component="tr" sx={{ '& th': { textAlign: 'left', pb: 1, fontWeight: 600, fontSize: '0.8rem', color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider' } }}>
                      <Box component="th">Materia prima</Box>
                      <Box component="th">Unidad</Box>
                      <Box component="th" sx={{ textAlign: 'right' }}>Cant. por unidad</Box>
                      <Box component="th" />
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {ingredients.map(i => (
                      <Box component="tr" key={i.raw_material_id} sx={{ '& td': { py: 0.75, borderBottom: '1px solid', borderColor: 'grey.100' } }}>
                        <Box component="td"><Typography variant="body2">{i.raw_material.name}</Typography></Box>
                        <Box component="td"><Typography variant="body2" color="text.secondary">{i.raw_material.unit}</Typography></Box>
                        <Box component="td" sx={{ textAlign: 'right' }}><Typography variant="body2" fontWeight={600}>{i.quantity_per_unit}</Typography></Box>
                        <Box component="td" sx={{ textAlign: 'right', width: 40 }}>
                          <IconButton size="small" color="error" onClick={() => removeIngredient(i.raw_material_id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                <FormControl size="small" sx={{ flex: 1 }}>
                  <InputLabel>Materia prima</InputLabel>
                  <Select
                    value={addMatId}
                    label="Materia prima"
                    onChange={e => setAddMatId(e.target.value)}
                  >
                    {rawMaterials.map(m => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.name} <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>({m.unit})</Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  label="Cantidad"
                  type="number"
                  value={addQty}
                  onChange={e => setAddQty(e.target.value)}
                  sx={{ width: 110 }}
                  inputProps={{ min: 0, step: 'any' }}
                  onKeyDown={e => e.key === 'Enter' && addIngredient()}
                />
                <Button variant="outlined" onClick={addIngredient} disabled={!addMatId || !addQty}>
                  Agregar
                </Button>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIngredientsDialog(null)}>Cancelar</Button>
          <Button variant="contained" onClick={saveIngredients} disabled={ingredientsSaving || ingredientsLoading}>
            {ingredientsSaving ? <CircularProgress size={20} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Subcategory Groups Dialog */}
      <Dialog open={!!subcatDialog} onClose={() => { setSubcatDialog(null); setEditingSubcatId(null); setAddingSubcat(false) }} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LayersIcon fontSize="small" /> Grupos de opciones — {subcatDialog?.name}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {subcatError && <Alert severity="error" sx={{ mb: 2 }}>{subcatError}</Alert>}
          {subcatLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
          ) : (
            <>
              {subcategories.length === 0 && !addingSubcat && (
                <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
                  Este producto no tiene grupos de opciones.
                </Typography>
              )}

              {/* Existing subcategories */}
              {subcategories.map(sub => (
                <Box key={sub.id} sx={{ mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                  {/* Subcategory header */}
                  <Box sx={{ px: 2, py: 1.5, bgcolor: 'grey.50', display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    {editingSubcatId === sub.id ? (
                      <>
                        <TextField size="small" value={editSubcatName} onChange={e => setEditSubcatName(e.target.value)}
                          sx={{ flex: 1 }} autoFocus onKeyDown={e => e.key === 'Escape' && setEditingSubcatId(null)} />
                        <FormControl size="small" sx={{ minWidth: 160 }}>
                          <Select value={editSubcatIsLimited ? 'limited' : 'free'}
                            onChange={e => setEditSubcatIsLimited(e.target.value === 'limited')}>
                            <MenuItem value="free">Elección libre</MenuItem>
                            <MenuItem value="limited">Máximo de elecciones</MenuItem>
                          </Select>
                        </FormControl>
                        {editSubcatIsLimited && (
                          <TextField size="small" type="number" label="Máx." value={editSubcatMax}
                            onChange={e => setEditSubcatMax(e.target.value)} sx={{ width: 80 }} inputProps={{ min: 1 }} />
                        )}
                        <IconButton size="small" color="success" onClick={() => saveEditSubcat(sub.id)} disabled={subcatSaving}>
                          <CheckIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => setEditingSubcatId(null)} disabled={subcatSaving}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <Typography fontWeight={700} sx={{ flex: 1 }}>{sub.name}</Typography>
                        <Chip
                          size="small"
                          label={sub.max_choices === null ? 'Elección libre' : `Máx. ${sub.max_choices}`}
                          color={sub.max_choices === null ? 'success' : 'info'}
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                        <IconButton size="small" onClick={() => {
                          setEditingSubcatId(sub.id)
                          setEditSubcatName(sub.name)
                          setEditSubcatIsLimited(sub.max_choices !== null)
                          setEditSubcatMax(sub.max_choices !== null ? String(sub.max_choices) : '')
                        }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => deleteSubcat(sub.id)} disabled={subcatSaving}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>

                  {/* Items list */}
                  <Box sx={{ px: 2, py: 1 }}>
                    {sub.items.length === 0 && (
                      <Typography variant="caption" color="text.secondary">Sin ítems aún</Typography>
                    )}
                    {sub.items.map(item => (
                      <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', py: 0.5, borderBottom: '1px solid', borderColor: 'grey.100' }}>
                        <Typography variant="body2" sx={{ flex: 1 }}>{item.name}</Typography>
                        <Typography variant="body2" color="primary.main" fontWeight={600} sx={{ mr: 1 }}>
                          +${Number(item.extra_price).toLocaleString('es-CL')}
                        </Typography>
                        <IconButton size="small" color="error" onClick={() => deleteSubcatItem(sub.id, item.id)} disabled={subcatSaving}>
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    ))}

                    {/* Add item row */}
                    {addingItemSubcatId === sub.id ? (
                      <Box sx={{ display: 'flex', gap: 1, mt: 1.5, alignItems: 'flex-end' }}>
                        <TextField size="small" label="Nombre del ítem" value={newItemName}
                          onChange={e => setNewItemName(e.target.value)} sx={{ flex: 2 }} autoFocus
                          placeholder="ej: Salsa Bolognesa"
                          onKeyDown={e => e.key === 'Enter' && createSubcatItem(sub.id)} />
                        <TextField size="small" label="Precio adicional" type="number" value={newItemPrice}
                          onChange={e => setNewItemPrice(e.target.value)} sx={{ flex: 1 }}
                          InputProps={{ startAdornment: <span style={{ marginRight: 4 }}>+$</span> }}
                          inputProps={{ min: 0 }}
                          onKeyDown={e => e.key === 'Enter' && createSubcatItem(sub.id)} />
                        <IconButton size="small" color="success"
                          onClick={() => createSubcatItem(sub.id)}
                          disabled={!newItemName.trim() || newItemPrice === '' || subcatSaving}>
                          <CheckIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => { setAddingItemSubcatId(null); setNewItemName(''); setNewItemPrice('') }}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      <Button size="small" startIcon={<AddIcon />}
                        onClick={() => { setAddingItemSubcatId(sub.id); setNewItemName(''); setNewItemPrice('') }}
                        sx={{ mt: 1 }} disabled={subcatSaving}>
                        Agregar ítem
                      </Button>
                    )}
                  </Box>
                </Box>
              ))}

              {/* New subcategory form */}
              {addingSubcat ? (
                <Box sx={{ border: '2px dashed', borderColor: 'primary.main', borderRadius: 2, p: 2, mt: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>Nuevo grupo</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <TextField size="small" label="Nombre del grupo" value={newSubcatName}
                      onChange={e => setNewSubcatName(e.target.value)} sx={{ flex: 2, minWidth: 180 }}
                      autoFocus placeholder="ej: Salsas, Ingredientes, Tamaño" />
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                      <InputLabel>Tipo de selección</InputLabel>
                      <Select value={newSubcatIsLimited ? 'limited' : 'free'} label="Tipo de selección"
                        onChange={e => setNewSubcatIsLimited(e.target.value === 'limited')}>
                        <MenuItem value="free">Elección libre (sin límite)</MenuItem>
                        <MenuItem value="limited">Máximo de elecciones</MenuItem>
                      </Select>
                    </FormControl>
                    {newSubcatIsLimited && (
                      <TextField size="small" type="number" label="Máx. ítems" value={newSubcatMax}
                        onChange={e => setNewSubcatMax(e.target.value)} sx={{ width: 110 }} inputProps={{ min: 1 }} />
                    )}
                    <Button variant="contained" size="small" onClick={createSubcat}
                      disabled={!newSubcatName.trim() || subcatSaving}>
                      {subcatSaving ? <CircularProgress size={18} /> : 'Crear grupo'}
                    </Button>
                    <Button size="small" onClick={() => { setAddingSubcat(false); setNewSubcatName(''); setNewSubcatIsLimited(false); setNewSubcatMax('') }}>
                      Cancelar
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Button variant="outlined" startIcon={<AddIcon />} onClick={() => { setAddingSubcat(true); setEditingSubcatId(null) }}
                  sx={{ mt: 1 }} disabled={subcatSaving}>
                  Nuevo grupo
                </Button>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setSubcatDialog(null); setEditingSubcatId(null); setAddingSubcat(false) }}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Categories Management Dialog */}
      <Dialog open={catDialog} onClose={() => { setCatDialog(false); setAddingCat(false); setEditingCat(null) }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CategoryIcon fontSize="small" /> Gestionar Categorías
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {catError && <Alert severity="error" sx={{ m: 2, mb: 0 }}>{catError}</Alert>}
          <List disablePadding>
            {categories.map((cat, idx) => (
              <Box key={cat.id}>
                {idx > 0 && <Divider />}
                <ListItem sx={{ py: 1, px: 2 }}>
                  {editingCat === cat.id ? (
                    <Box sx={{ display: 'flex', gap: 1, width: '100%', alignItems: 'center' }}>
                      <TextField
                        value={editCatForm.emoji}
                        onChange={e => setEditCatForm(f => ({ ...f, emoji: e.target.value }))}
                        sx={{ width: 64 }} size="small"
                        inputProps={{ maxLength: 2, style: { textAlign: 'center', fontSize: '1.2rem' } }}
                      />
                      <TextField
                        value={editCatForm.name}
                        onChange={e => setEditCatForm(f => ({ ...f, name: e.target.value }))}
                        size="small" sx={{ flex: 1 }} autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') saveEditCat(cat.id); if (e.key === 'Escape') cancelEditCat() }}
                      />
                      <IconButton size="small" color="success" onClick={() => saveEditCat(cat.id)} disabled={catSaving}>
                        <CheckIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={cancelEditCat} disabled={catSaving}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Typography sx={{ fontSize: '1.2rem', mr: 1.5, lineHeight: 1, opacity: cat.is_active ? 1 : 0.4 }}>{cat.emoji}</Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: cat.is_active ? 'text.primary' : 'text.disabled' }}>{cat.name}</Typography>
                        {!cat.is_active && (
                          <Typography variant="caption" color="error.main">Inactiva</Typography>
                        )}
                      </Box>
                      <IconButton size="small" onClick={() => startEditCat(cat)} disabled={catSaving}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color={cat.is_active ? 'warning' : 'success'}
                        onClick={() => handleToggleCatActive(cat)}
                        disabled={catSaving}
                        title={cat.is_active ? 'Desactivar categoría' : 'Activar categoría'}
                      >
                        {cat.is_active ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteCat(cat)} disabled={catSaving}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </ListItem>
              </Box>
            ))}
            {addingCat && (
              <>
                <Divider />
                <ListItem sx={{ py: 1, px: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1, width: '100%', alignItems: 'center' }}>
                    <TextField
                      value={newCatForm.emoji}
                      onChange={e => setNewCatForm(f => ({ ...f, emoji: e.target.value }))}
                      sx={{ width: 64 }} size="small" placeholder="🍽️"
                      inputProps={{ maxLength: 2, style: { textAlign: 'center', fontSize: '1.2rem' } }}
                    />
                    <TextField
                      value={newCatForm.name}
                      onChange={e => setNewCatForm(f => ({ ...f, name: e.target.value }))}
                      size="small" sx={{ flex: 1 }} autoFocus placeholder="Nombre"
                      onKeyDown={e => { if (e.key === 'Enter') handleAddCat(); if (e.key === 'Escape') setAddingCat(false) }}
                    />
                    <IconButton size="small" color="success" onClick={handleAddCat} disabled={catSaving}>
                      <CheckIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => { setAddingCat(false); setCatError(null) }} disabled={catSaving}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItem>
              </>
            )}
          </List>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Button startIcon={<AddIcon />} onClick={() => { setAddingCat(true); setEditingCat(null); setCatError(null) }} size="small" disabled={addingCat}>
            Nueva Categoría
          </Button>
          <Button onClick={() => { setCatDialog(false); setAddingCat(false); setEditingCat(null) }}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
