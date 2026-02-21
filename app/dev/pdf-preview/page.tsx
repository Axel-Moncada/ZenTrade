'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { RefreshCw } from 'lucide-react'
import { TradingPlan } from '@/types/trading-plan'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Plan de ejemplo para preview
const mockPlan: TradingPlan = {
  id: 'preview',
  account_id: 'preview',
  user_id: 'preview',
  daily_profit_target: 500,
  daily_loss_limit: 300,
  weekly_profit_target: 2500,
  max_risk_per_trade: 2,
  max_daily_trades: 5,
  max_concurrent_positions: 3,
  min_risk_reward_ratio: 2,
  entry_rules: 'Buscar setup de ruptura con confirmación de volumen.\nEsperar retroceso al nivel clave.\nConfirmar tendencia en múltiples temporalidades.',
  exit_rules: 'Salir en objetivo de profit previamente definido.\nCortar pérdidas en stop loss sin dudar.\nAjustar trailing stop en operaciones rentables.',
  pre_trade_checklist: [
    'Revisar calendario económico',
    'Verificar setup en múltiples temporalidades',
    'Confirmar nivel de riesgo',
    'Establecer stop loss y take profit',
    'Revisar estado emocional'
  ],
  trading_start_time: '09:30',
  trading_end_time: '16:00',
  trading_days: [1, 2, 3, 4, 5],
  allowed_instruments: ['ES', 'NQ', 'YM', 'RTY'],
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  weekly_loss_limit: null,
  monthly_profit_target: null,
  monthly_loss_limit: null,
  strategy_notes: null
}

export default function PDFPreviewPage() {
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const generatePDF = () => {
    setLoading(true)
    try {
      console.log('Generating PDF preview...')
      const doc = new jsPDF()

      // Configuración
      const pageWidth = 210
      const pageHeight = 297
      const margin = 15
      const contentWidth = pageWidth - (margin * 2)

      // === HEADER SIN FONDO ===
      // Título principal - verde zen
      doc.setFontSize(22)
      doc.setTextColor(0, 193, 124) // zen-caribbean-green
      doc.setFont('helvetica', 'bold')
      doc.text('PLAN DE TRADING', pageWidth / 2, 13, { align: 'center' })

      // Subtítulo - gris oscuro
      doc.setFontSize(14)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80, 80, 80)
      doc.text('CUENTA: FTMO 50K - EVALUACIÓN', pageWidth / 2, 21, { align: 'center' })
      doc.text(new Date().toLocaleDateString('es-ES'), pageWidth / 2, 26, { align: 'center' })

      let y = 36

      // Función helper para crear sección con banner ajustado al texto
      const createSectionBanner = (title: string, yPos: number, color: number[] = [0, 193, 124]) => {
        const bannerHeight = 7
        const borderRadius = 2
        const padding = 4
        
        // Calcular ancho del texto
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        const textWidth = doc.getTextWidth(title)
        const bannerWidth = textWidth + (padding * 2)
        
        doc.setFillColor(color[0], color[1], color[2])
        doc.roundedRect(margin, yPos, bannerWidth, bannerHeight, borderRadius, borderRadius, 'F')
        doc.setTextColor(255, 255, 255)
        doc.text(title, margin + padding, yPos + 5)
        return yPos + bannerHeight
      }

      // Función para crear cajetín
      const createBox = (label: string, value: string, x: number, yPos: number, width: number) => {
        doc.setFillColor(245, 245, 245)
        doc.rect(x, yPos, width, 12, 'F')
        doc.setDrawColor(200, 200, 200)
        doc.rect(x, yPos, width, 12, 'S')
        
        doc.setFontSize(8)
        doc.setTextColor(100, 100, 100)
        doc.setFont('helvetica', 'normal')
        doc.text(label, x + 2, yPos + 4)
        
        doc.setFontSize(10)
        doc.setTextColor(0, 0, 0)
        doc.setFont('helvetica', 'bold')
        doc.text(value, x + 2, yPos + 9)
      }

      // Función para normalizar fechas
      const normalizeDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('es-ES')
      }

      // === OBJETIVOS ===
      y = createSectionBanner('OBJETIVOS', y, [0, 193, 124]) // zen-caribbean-green
      y += 5

      if (mockPlan.daily_profit_target) {
        createBox('Objetivo Diario', `$${mockPlan.daily_profit_target.toFixed(2)}`, margin, y, 60)
      }
      if (mockPlan.daily_loss_limit) {
        createBox('Límite Diario', `$${mockPlan.daily_loss_limit.toFixed(2)}`, margin + 62, y, 60)
      }
      if (mockPlan.weekly_profit_target) {
        createBox('Objetivo Semanal', `$${mockPlan.weekly_profit_target.toFixed(2)}`, margin + 124, y, 60)
      }
      y += 20

      // === GESTIÓN DE RIESGO ===
      y = createSectionBanner('GESTIÓN DE RIESGO', y, [0, 193, 124]) // zen-caribbean-green
      y += 5

      const riskBoxes = []
      if (mockPlan.max_risk_per_trade) riskBoxes.push(['Riesgo/Trade', `${mockPlan.max_risk_per_trade}%`])
      if (mockPlan.max_daily_trades) riskBoxes.push(['Trades Diarios', `${mockPlan.max_daily_trades}`])
      if (mockPlan.max_concurrent_positions) riskBoxes.push(['Posiciones', `${mockPlan.max_concurrent_positions}`])
      if (mockPlan.min_risk_reward_ratio) riskBoxes.push(['Ratio R:R', `1:${mockPlan.min_risk_reward_ratio}`])

      const boxWidth = (contentWidth - 6) / 4
      riskBoxes.forEach(([label, value], index) => {
        createBox(label, value, margin + (index * (boxWidth + 2)), y, boxWidth)
      })
      y += 20

      // === REGLAS DE ENTRADA ===
      if (mockPlan.entry_rules) {
        y = createSectionBanner('REGLAS DE ENTRADA', y, [0, 193, 124]) // zen-caribbean-green
        y += 5
        
        doc.setFontSize(9)
        doc.setTextColor(50, 50, 50)
        doc.setFont('helvetica', 'normal')
        const entryLines = doc.splitTextToSize(mockPlan.entry_rules, contentWidth - 4)
        doc.text(entryLines, margin + 2, y + 3)
        y += (entryLines.length * 4) + 8
      }

      // === REGLAS DE SALIDA ===
      if (mockPlan.exit_rules) {
        y = createSectionBanner('REGLAS DE SALIDA', y, [0, 193, 124]) // zen-caribbean-green
        y += 5
        
        doc.setFontSize(9)
        doc.setTextColor(50, 50, 50)
        doc.setFont('helvetica', 'normal')
        const exitLines = doc.splitTextToSize(mockPlan.exit_rules, contentWidth - 4)
        doc.text(exitLines, margin + 2, y + 3)
        y += (exitLines.length * 4) + 8
      }

      // === CHECKLIST PRE-TRADE ===
      if (mockPlan.pre_trade_checklist && mockPlan.pre_trade_checklist.length > 0) {
        y = createSectionBanner('CHECKLIST PRE-TRADE', y, [0, 193, 124]) // zen-caribbean-green
        y += 5
        
        doc.setFontSize(9)
        doc.setTextColor(50, 50, 50)
        doc.setFont('helvetica', 'normal')
        mockPlan.pre_trade_checklist.forEach((item) => {
          doc.text(`• ${item}`, margin + 2, y + 3)
          y += 5
        })
        y += 5
      }

      // === INSTRUMENTOS PERMITIDOS Y HORARIOS (DOS COLUMNAS) ===
      const columnWidth = (contentWidth - 3) / 2
      const startY = y
      let leftY = startY
      let rightY = startY
      
      // Columna izquierda: INSTRUMENTOS PERMITIDOS
      if (mockPlan.allowed_instruments && mockPlan.allowed_instruments.length > 0) {
        const bannerHeight = 7
        const borderRadius = 2
        const padding = 4
        
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        const textWidth = doc.getTextWidth('INSTRUMENTOS PERMITIDOS')
        const bannerWidth = textWidth + (padding * 2)
        
        doc.setFillColor(0, 193, 124)
        doc.roundedRect(margin, leftY, bannerWidth, bannerHeight, borderRadius, borderRadius, 'F')
        doc.setTextColor(255, 255, 255)
        doc.text('INSTRUMENTOS PERMITIDOS', margin + padding, leftY + 5)
        leftY += bannerHeight + 3
        
        doc.setFontSize(9)
        doc.setTextColor(50, 50, 50)
        doc.setFont('helvetica', 'normal')
        doc.text(mockPlan.allowed_instruments.join(' • '), margin + 2, leftY)
        leftY += 5
      }

      // Columna derecha: HORARIOS
      if (mockPlan.trading_start_time || mockPlan.trading_days) {
        const bannerHeight = 7
        const borderRadius = 2
        const padding = 4
        
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        const textWidth = doc.getTextWidth('HORARIOS')
        const bannerWidth = textWidth + (padding * 2)
        
        doc.setFillColor(0, 193, 124)
        doc.roundedRect(margin + columnWidth + 3, rightY, bannerWidth, bannerHeight, borderRadius, borderRadius, 'F')
        doc.setTextColor(255, 255, 255)
        doc.text('HORARIOS', margin + columnWidth + 3 + padding, rightY + 5)
        rightY += bannerHeight + 3
        
        doc.setFontSize(9)
        doc.setTextColor(50, 50, 50)
        doc.setFont('helvetica', 'normal')
        
        if (mockPlan.trading_start_time && mockPlan.trading_end_time) {
          doc.text(`Horario: ${mockPlan.trading_start_time} - ${mockPlan.trading_end_time}`, margin + columnWidth + 3 + 2, rightY)
          rightY += 5
        }
        
        if (mockPlan.trading_days && mockPlan.trading_days.length > 0) {
          const daysNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
          const tradingDaysStr = mockPlan.trading_days.map(d => daysNames[d]).join(', ')
          doc.text(`Días: ${tradingDaysStr}`, margin + columnWidth + 3 + 2, rightY)
          rightY += 5
        }
      }
      
      // Avanzar y a la columna más alta
      y = Math.max(leftY, rightY) + 10

      // === FRASE MOTIVACIONAL Y ZENTRADE ===
      y += 40
      doc.setFontSize(8)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(80, 80, 80)
      const quote = '"El éxito en el trading no se mide por un solo día, sino por la consistencia de tu disciplina."'
      doc.text(quote, pageWidth / 2, y, { align: 'center', maxWidth: contentWidth - 20 })
      
      y += 10
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 193, 124) // zen-caribbean-green
      doc.text('ZenTrade', pageWidth / 2, y, { align: 'center' })
      
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(120, 120, 120)
      doc.text('Tu compañero de trading disciplinado', pageWidth / 2, y + 4, { align: 'center' })

      // Generar blob URL para preview
      const pdfBlob = doc.output('blob')
      const url = URL.createObjectURL(pdfBlob)
      
      // Limpiar URL anterior si existe
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
      
      setPdfUrl(url)
      console.log('PDF preview generated successfully')
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error al generar el PDF')
    } finally {
      setLoading(false)
    }
  }

  // Generar PDF inicial
  useEffect(() => {
    generatePDF()
    
    // Cleanup
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-zen-rich-black p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="p-6 bg-zen-dark-green border-zen-forest">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zen-anti-flash mb-2">
                Vista Previa del PDF - Plan de Trading
              </h1>
              <p className="text-zen-anti-flash/60">
                Previsualiza los cambios en tiempo real. Edita el código en{' '}
                <code className="text-zen-caribbean-green">export-plan-pdf.tsx</code>
              </p>
            </div>
            <Button
              onClick={generatePDF}
              disabled={loading}
              className="bg-zen-caribbean-green hover:bg-zen-mountain-meadow text-zen-rich-black"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar Preview
            </Button>
          </div>
        </Card>

        {/* PDF Viewer */}
        <Card className="p-4 bg-zen-dark-green border-zen-forest">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-[800px] rounded-lg border border-zen-forest"
              title="PDF Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-[800px] text-zen-anti-flash/60">
              Generando preview...
            </div>
          )}
        </Card>

        {/* Instrucciones */}
        <Card className="p-6 bg-zen-dark-green/50 border-zen-forest/50">
          <h3 className="text-lg font-semibold text-zen-anti-flash mb-3">
            📖 Instrucciones
          </h3>
          <ul className="space-y-2 text-zen-anti-flash/80 text-sm">
            <li>• Edita el archivo <code className="text-zen-caribbean-green">components/trading-plan/export-plan-pdf.tsx</code></li>
            <li>• Guarda los cambios y haz clic en "Actualizar Preview"</li>
            <li>• El PDF se regenerará con los cambios aplicados</li>
            <li>• Puedes modificar el <code className="text-zen-caribbean-green">mockPlan</code> en esta página para probar diferentes datos</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
