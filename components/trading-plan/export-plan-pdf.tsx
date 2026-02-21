'use client'

import { Button } from '@/components/ui/button'
import { FileDown } from 'lucide-react'
import { TradingPlan } from '@/types/trading-plan'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ExportPlanPDFProps {
  plan: TradingPlan
  accountName: string
}

export function ExportPlanPDF({ plan, accountName }: ExportPlanPDFProps) {
  const generatePDF = () => {
    try {
      console.log('Generating PDF...')
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
      doc.text(`CUENTA: ${accountName.toUpperCase()}`, pageWidth / 2, 21, { align: 'center' })
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

      // === OBJETIVOS ===
      y = createSectionBanner('OBJETIVOS', y, [0, 193, 124]) // zen-caribbean-green
      y += 5

      if (plan.daily_profit_target) {
        createBox('Objetivo Diario', `$${plan.daily_profit_target.toFixed(2)}`, margin, y, 60)
      }
      if (plan.daily_loss_limit) {
        createBox('Límite Diario', `$${plan.daily_loss_limit.toFixed(2)}`, margin + 62, y, 60)
      }
      if (plan.weekly_profit_target) {
        createBox('Objetivo Semanal', `$${plan.weekly_profit_target.toFixed(2)}`, margin + 124, y, 60)
      }
      y += 20

      // === GESTIÓN DE RIESGO ===
      y = createSectionBanner('GESTIÓN DE RIESGO', y, [0, 193, 124]) // zen-caribbean-green
      y += 5

      const riskBoxes = []
      if (plan.max_risk_per_trade) riskBoxes.push(['Riesgo/Trade', `${plan.max_risk_per_trade}%`])
      if (plan.max_daily_trades) riskBoxes.push(['Trades Diarios', `${plan.max_daily_trades}`])
      if (plan.max_concurrent_positions) riskBoxes.push(['Posiciones', `${plan.max_concurrent_positions}`])
      if (plan.min_risk_reward_ratio) riskBoxes.push(['Ratio R:R', `1:${plan.min_risk_reward_ratio}`])

      const boxWidth = (contentWidth - 6) / 4
      riskBoxes.forEach(([label, value], index) => {
        createBox(label, value, margin + (index * (boxWidth + 2)), y, boxWidth)
      })
      y += 20

      // === REGLAS DE ENTRADA ===
      if (plan.entry_rules) {
        y = createSectionBanner('REGLAS DE ENTRADA', y, [0, 193, 124]) // zen-caribbean-green
        y += 5
        
        doc.setFontSize(9)
        doc.setTextColor(50, 50, 50)
        doc.setFont('helvetica', 'normal')
        const entryLines = doc.splitTextToSize(plan.entry_rules, contentWidth - 4)
        doc.text(entryLines, margin + 2, y + 3)
        y += (entryLines.length * 4) + 8
      }

      // === REGLAS DE SALIDA ===
      if (plan.exit_rules) {
        y = createSectionBanner('REGLAS DE SALIDA', y, [0, 193, 124]) // zen-caribbean-green
        y += 5
        
        doc.setFontSize(9)
        doc.setTextColor(50, 50, 50)
        doc.setFont('helvetica', 'normal')
        const exitLines = doc.splitTextToSize(plan.exit_rules, contentWidth - 4)
        doc.text(exitLines, margin + 2, y + 3)
        y += (exitLines.length * 4) + 8
      }

      // === CHECKLIST PRE-TRADE ===
      if (plan.pre_trade_checklist && plan.pre_trade_checklist.length > 0) {
        y = createSectionBanner('CHECKLIST PRE-TRADE', y, [0, 193, 124]) // zen-caribbean-green
        y += 5
        
        doc.setFontSize(9)
        doc.setTextColor(50, 50, 50)
        doc.setFont('helvetica', 'normal')
        plan.pre_trade_checklist.forEach((item) => {
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
      if (plan.allowed_instruments && plan.allowed_instruments.length > 0) {
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
        doc.text(plan.allowed_instruments.join(' • '), margin + 2, leftY)
        leftY += 5
      }

      // Columna derecha: HORARIOS
      if (plan.trading_start_time || plan.trading_days) {
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
        
        if (plan.trading_start_time && plan.trading_end_time) {
          doc.text(`Horario: ${plan.trading_start_time} - ${plan.trading_end_time}`, margin + columnWidth + 3 + 2, rightY)
          rightY += 5
        }
        
        if (plan.trading_days && plan.trading_days.length > 0) {
          const daysNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
          const tradingDaysStr = plan.trading_days.map(d => daysNames[d]).join(', ')
          doc.text(`Días: ${tradingDaysStr}`, margin + columnWidth + 3 + 2, rightY)
          rightY += 5
        }
      }
      
      // Avanzar y a la columna más alta
      y = Math.max(leftY, rightY) + 10

      // === NOTAS Y ESTRATEGIA ===
      if (plan.strategy_notes) {
        y = createSectionBanner('NOTAS Y ESTRATEGIA', y, [0, 193, 124]) // zen-caribbean-green
        y += 5
        
        doc.setFontSize(9)
        doc.setTextColor(50, 50, 50)
        doc.setFont('helvetica', 'normal')
        const notesLines = doc.splitTextToSize(plan.strategy_notes, contentWidth - 4)
        doc.text(notesLines, margin + 2, y + 3)
        y += (notesLines.length * 4) + 8
      }

      // === FRASE MOTIVACIONAL Y ZENTRADE ===
      y += 40
      doc.setFontSize(9)
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

      // Save PDF
      const fileName = `plan-trading-${accountName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
      console.log('PDF saved:', fileName)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error al generar el PDF. Revisa la consola para más detalles.')
    }
  }

  return (
    <Button onClick={generatePDF} variant="outline" className="gap-2">
      <FileDown className="h-4 w-4" />
      Exportar PDF
    </Button>
  )
}
