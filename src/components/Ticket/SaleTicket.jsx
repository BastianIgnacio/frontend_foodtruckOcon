import { useState, useEffect } from 'react'
import { Box, Button, CircularProgress, Snackbar, Alert } from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import PrintIcon from '@mui/icons-material/Print'
import { jsPDF } from 'jspdf'
import { printTicketApi } from '../../api'

const FMT = (n) => Number(n || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })
const PAY_LABEL = { CASH: 'Efectivo', CARD: 'Tarjeta', TRANSFER: 'Transferencia', JUNAEB: 'JUNAEB' }

function parseProductName(fullName) {
  const parenIdx = fullName.indexOf(' (')
  if (parenIdx === -1 || !fullName.endsWith(')')) return { base: fullName, options: null }
  return {
    base: fullName.substring(0, parenIdx),
    options: fullName.substring(parenIdx + 2, fullName.length - 1),
  }
}

// ── HTML preview ──────────────────────────────────────────────────────────────

const hr = `<hr style="border:none;border-top:1px solid #000;margin:5px 0;">`
const hrBold = `<hr style="border:none;border-top:2px solid #000;margin:5px 0;">`

const rowHtml = (label, value, bold = true) =>
  `<table width="100%" style="margin-bottom:3px;${bold ? 'font-weight:700;' : ''}">
    <tr><td>${label}</td><td align="right">${value}</td></tr>
  </table>`

function buildTicketHtml(sale, businessName) {
  const d = new Date(sale.created_at)
  const dateStr = d.toLocaleDateString('es-CL')
  const timeStr = d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const junaebCode =
    sale.payment_method === 'JUNAEB' && sale.notes?.startsWith('Código JUNAEB:')
      ? sale.notes.replace('Código JUNAEB: ', '') : null

  const items = (sale.items || []).map(item => {
    const { base, options } = parseProductName(item.product_name || `Producto #${item.product_id}`)
    return `
    <div style="margin-bottom:7px;">
      <div style="font-weight:700;">${base}</div>
      ${options ? `<div style="font-size:9px;color:#444;margin:1px 0 2px 4px;">${options}</div>` : ''}
      <table width="100%">
        <tr>
          <td>${item.quantity} X ${FMT(item.unit_price)}</td>
          <td align="right">${FMT(item.subtotal)}</td>
        </tr>
      </table>
    </div>`
  }).join('')

  return `
    <div style="border:2px solid #000;text-align:center;padding:7px 5px;margin-bottom:7px;">
      <div style="font-weight:700;font-size:13px;">TICKET DE VENTA</div>
      <div style="font-weight:700;">N&#186; ${String(sale.sale_number).padStart(6, '0')}</div>
    </div>
    <div style="text-align:center;font-weight:700;font-size:12px;margin-bottom:6px;">${businessName}</div>
    ${hrBold}
    <div style="margin-bottom:4px;">
      <table width="100%" style="margin-bottom:2px;">
        <tr>
          <td>FECHA EMISIÓN: ${dateStr}</td>
          <td align="right">HORA: ${timeStr}</td>
        </tr>
      </table>
      <div>VENDEDOR: ${sale.seller?.full_name || '-'}</div>
      ${sale.customer_name ? `<div>CLIENTE: ${sale.customer_name}</div>` : ''}
      ${junaebCode ? `<div>CÓD. JUNAEB: ${junaebCode}</div>` : ''}
    </div>
    ${hr}
    <table width="100%" style="font-weight:700;border-bottom:1px solid #000;padding-bottom:4px;margin-bottom:5px;">
      <tr><td>ARTÍCULO</td><td align="right">VALOR</td></tr>
    </table>
    ${items}
    ${hr}
    ${sale.discount > 0 ? rowHtml('SUBTOTAL', FMT(sale.subtotal)) : ''}
    ${sale.discount > 0 ? rowHtml('DESCUENTO', `-${FMT(sale.discount)}`) : ''}
    ${rowHtml('MONTO TOTAL', FMT(sale.total))}
    ${rowHtml('FORMA DE PAGO', PAY_LABEL[sale.payment_method] || sale.payment_method)}
    ${sale.amount_received ? rowHtml('RECIBIDO', FMT(sale.amount_received)) : ''}
    ${sale.change_given > 0 ? rowHtml('VUELTO', FMT(sale.change_given)) : ''}
    ${hrBold}
    <div style="text-align:center;margin-top:6px;">
      <div>¡Gracias por su compra!</div>
      <div style="color:#555;margin-top:2px;">Vuelva pronto</div>
    </div>`
}

// ── PDF con jsPDF (dos pasos: calcular alto → dibujar) ────────────────────────
// measureDoc es el doc real en el paso de dibujo, o un doc temporal en el paso de medición.
function renderTicket(doc, sale, biz) {
  const PW = 80, MX = 4, LH = 5, CW = PW - MX * 2
  const measureDoc = doc || new jsPDF({ unit: 'mm', format: [80, 200] })
  const D = (fn) => { if (doc) fn() }

  const d = new Date(sale.created_at)
  const dateStr = d.toLocaleDateString('es-CL')
  const timeStr = d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const junaebCode =
    sale.payment_method === 'JUNAEB' && sale.notes?.startsWith('Codigo JUNAEB:')
      ? sale.notes.replace('Codigo JUNAEB: ', '') : null

  let y = 5

  // Caja de cabecera (13mm alto + 3mm gap)
  D(() => {
    doc.setLineWidth(0.5)
    doc.rect(MX, y, PW - MX * 2, 13, 'S')
    doc.setFontSize(11); doc.setFont('helvetica', 'bold')
    doc.text('TICKET DE VENTA', PW / 2, y + 5, { align: 'center' })
    doc.setFontSize(10)
    doc.text(`No ${String(sale.sale_number).padStart(6, '0')}`, PW / 2, y + 10, { align: 'center' })
  })
  y += 16

  // Nombre del negocio
  D(() => { doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.text(biz, PW / 2, y, { align: 'center' }) })
  y += 7

  // Separador grueso
  D(() => { doc.setLineWidth(0.6); doc.line(MX, y, PW - MX, y) })
  y += 5

  // Fecha / hora
  D(() => {
    doc.setFontSize(9); doc.setFont('helvetica', 'normal')
    doc.text(`FECHA EMISION: ${dateStr}`, MX, y)
    doc.text(`HORA: ${timeStr}`, PW - MX, y, { align: 'right' })
  })
  y += LH

  // Vendedor
  D(() => doc.text(`VENDEDOR: ${sale.seller?.full_name || '-'}`, MX, y))
  y += LH

  if (sale.customer_name) {
    D(() => doc.text(`CLIENTE: ${sale.customer_name}`, MX, y))
    y += LH
  }
  if (junaebCode) {
    D(() => doc.text(`COD. JUNAEB: ${junaebCode}`, MX, y))
    y += LH
  }

  // Separador fino
  D(() => { doc.setLineWidth(0.3); doc.line(MX, y, PW - MX, y) })
  y += 4

  // Encabezado de ítems
  D(() => {
    doc.setFont('helvetica', 'bold')
    doc.text('ARTICULO', MX, y)
    doc.text('VALOR', PW - MX, y, { align: 'right' })
  })
  y += 3
  D(() => { doc.setLineWidth(0.3); doc.line(MX, y, PW - MX, y) })
  y += 4

  // Ítems
  for (const item of (sale.items || [])) {
    const { base, options } = parseProductName(item.product_name || `Producto #${item.product_id}`)

    // Nombre base en negrita (con wrap si es largo)
    measureDoc.setFontSize(9)
    measureDoc.setFont('helvetica', 'bold')
    const nameLines = measureDoc.splitTextToSize(base, CW)
    D(() => {
      doc.setFontSize(9); doc.setFont('helvetica', 'bold')
      doc.text(nameLines, MX, y)
    })
    y += nameLines.length * (LH - 1)

    // Opciones seleccionadas en itálica más pequeña
    if (options) {
      measureDoc.setFontSize(7.5)
      measureDoc.setFont('helvetica', 'italic')
      const optLines = measureDoc.splitTextToSize(options, CW - 4)
      D(() => {
        doc.setFontSize(7.5); doc.setFont('helvetica', 'italic')
        doc.text(optLines, MX + 2, y)
      })
      y += optLines.length * (LH - 2)
    }

    // Cantidad x precio
    D(() => {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
      doc.text(`${item.quantity} X ${FMT(item.unit_price)}`, MX + 2, y)
      doc.text(FMT(item.subtotal), PW - MX, y, { align: 'right' })
    })
    y += LH
  }

  // Separador fino
  D(() => { doc.setLineWidth(0.3); doc.line(MX, y, PW - MX, y) })
  y += 4

  // Filas de totales
  const addRow = (label, value) => {
    D(() => {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9)
      doc.text(label, MX, y)
      doc.text(value, PW - MX, y, { align: 'right' })
    })
    y += LH
  }

  if (sale.discount > 0) {
    addRow('SUBTOTAL', FMT(sale.subtotal))
    addRow('DESCUENTO', `-${FMT(sale.discount)}`)
  }
  addRow('MONTO TOTAL', FMT(sale.total))
  addRow('FORMA DE PAGO', PAY_LABEL[sale.payment_method] || sale.payment_method)
  if (sale.amount_received) addRow('RECIBIDO', FMT(sale.amount_received))
  if (sale.change_given > 0) addRow('VUELTO', FMT(sale.change_given))

  // Separador grueso final
  D(() => { doc.setLineWidth(0.6); doc.line(MX, y, PW - MX, y) })
  y += 5

  // Footer
  D(() => {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
    doc.text('Gracias por su compra!', PW / 2, y, { align: 'center' })
  })
  y += LH
  D(() => doc.text('Vuelva pronto', PW / 2, y, { align: 'center' }))
  y += 8

  return y
}

function buildTicketDoc(sale, biz) {
  const pageHeight = renderTicket(null, sale, biz)
  const doc = new jsPDF({ unit: 'mm', format: [80, pageHeight], orientation: 'portrait' })
  renderTicket(doc, sale, biz)
  return doc
}

function downloadTicketPDF(sale, biz) {
  const doc = buildTicketDoc(sale, biz)
  doc.save(`ticket-${String(sale.sale_number).padStart(6, '0')}.pdf`)
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function SaleTicket({ sale, businessName = 'FoodTruck PAZZTA&pizza', autoPrintCopies = 0 }) {
  const [printing, setPrinting] = useState(false)
  const [feedback, setFeedback] = useState(null) // { severity, message }

  const printOnce = async () => {
    const doc = buildTicketDoc(sale, businessName)
    const base64 = doc.output('datauristring').split('base64,')[1]
    const filename = `ticket-${String(sale.sale_number).padStart(6, '0')}.pdf`
    return printTicketApi({ pdf_base64: base64, filename })
  }

  useEffect(() => {
    if (!sale || !autoPrintCopies) return
    let cancelled = false
    ;(async () => {
      setPrinting(true)
      try {
        for (let i = 0; i < autoPrintCopies; i++) {
          if (cancelled) return
          await printOnce()
        }
        if (!cancelled) setFeedback({ severity: 'success', message: `Ticket impreso (${autoPrintCopies} copias)` })
      } catch (e) {
        if (!cancelled) setFeedback({ severity: 'error', message: e.response?.data?.detail || 'Error al imprimir el ticket automáticamente' })
      }
      if (!cancelled) setPrinting(false)
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sale?.id, autoPrintCopies])

  if (!sale) return null

  const handlePrint = async () => {
    setPrinting(true)
    try {
      const { data } = await printOnce()
      setFeedback({ severity: 'success', message: data.message || 'Ticket enviado a imprimir' })
    } catch (e) {
      setFeedback({ severity: 'error', message: e.response?.data?.detail || 'Error al imprimir el ticket' })
    }
    setPrinting(false)
  }

  return (
    <Box>
      <Box
        sx={{
          width: 300,
          mx: 'auto',
          border: '1px solid #ddd',
          bgcolor: 'white',
          p: 1.5,
          fontFamily: 'Arial, sans-serif',
          fontSize: '11px',
        }}
        dangerouslySetInnerHTML={{ __html: buildTicketHtml(sale, businessName) }}
      />

      <Box sx={{ textAlign: 'center', mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={() => downloadTicketPDF(sale, businessName)}
          size="small"
        >
          Descargar PDF (80mm)
        </Button>
        <Button
          variant="outlined"
          startIcon={printing ? <CircularProgress size={14} color="inherit" /> : <PrintIcon />}
          onClick={handlePrint}
          disabled={printing}
          size="small"
        >
          Imprimir
        </Button>
      </Box>

      <Snackbar
        open={!!feedback}
        autoHideDuration={4000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {feedback ? <Alert severity={feedback.severity} onClose={() => setFeedback(null)}>{feedback.message}</Alert> : undefined}
      </Snackbar>
    </Box>
  )
}
