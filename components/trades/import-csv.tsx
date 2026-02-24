'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Download, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ImportCSVProps {
  accountId: string
  initialBalance: number
  onImportSuccess: () => void
}

interface ParsedTrade {
  trade_date: string
  instrument_symbol: string
  side: string
  contracts: string | number
  result: string | number
  cumNetProfit?: string | number // Para NinjaTrader
  exit_reason?: string
  followed_plan?: string | boolean
  emotions?: string
  notes?: string
}

type PlatformType = 'ninjatrader' | 'rithmic' | 'tradovate' | 'tradovate-web' | 'custom'

interface ColumnMapping {
  date: string[]
  instrument: string[]
  side: string[]
  contracts: string[]
  result: string[]
  exitReason?: string[]
  notes?: string[]
}

interface ColumnMappingExtended extends ColumnMapping {
  cumNetProfit?: string[]
}

const PLATFORM_MAPPINGS: Record<PlatformType, ColumnMappingExtended> = {
  ninjatrader: {
    date: ['Entry time'],
    instrument: ['Instrument'],
    side: ['Market pos.'],
    contracts: ['Qty'],
    result: ['Profit'],
    cumNetProfit: ['Cum. net profit', 'Cum. Net Profit', 'Cum. $ Net Profit'],
    exitReason: ['Exit name'],
    notes: ['Strategy'],
  },
  rithmic: {
    date: ['Trade Date', 'Entry Time'],
    instrument: [], // Se detecta desde el resumen
    side: ['Entry Buy/Sell'],
    contracts: ['Fill Size'],
    result: ['Net P&L'], // Ya incluye comisiones
  },
  tradovate: {
    date: ['Time', 'Date', 'DateTime'],
    instrument: ['Symbol', 'Contract'],
    side: ['Side', 'B/S'],
    contracts: ['Qty', 'Quantity'],
    result: ['P/L', 'PnL', 'Profit/Loss'],
  },
  'tradovate-web': {
    date: ['Exec Time', 'Time'],
    instrument: ['Symbol'],
    side: ['Buy/Sell'],
    contracts: ['Filled'],
    result: ['Net P/L'],
  },
  custom: {
    date: ['Fecha', 'Fecha (YYYY-MM-DD)', 'trade_date'],
    instrument: ['Instrumento', 'Instrumento (símbolo)', 'instrument_symbol'],
    side: ['Lado', 'Lado (long/short)', 'side'],
    contracts: ['Contratos', 'contracts'],
    result: ['Resultado', 'result'],
    exitReason: ['Razón Salida', 'exit_reason'],
    notes: ['Notas', 'notes'],
  },
}

const PLATFORM_LABELS: Record<PlatformType, string> = {
  ninjatrader: 'NinjaTrader',
  rithmic: 'Rithmic (R Trader Pro)',
  tradovate: 'Tradovate Desktop',
  'tradovate-web': 'Tradovate Web',
  custom: 'Plantilla ZenTrade (Custom)',
}

export function ImportCSV({ accountId, initialBalance, onImportSuccess }: ImportCSVProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [parsedData, setParsedData] = useState<ParsedTrade[]>([])
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('custom')

  // Función para normalizar fechas a formato YYYY-MM-DD
  const normalizeDate = (dateStr: string): string => {
    if (!dateStr) return ''
    
    // Eliminar cualquier parte de hora que venga con la fecha
    // Detectar si tiene hora (HH:MM:SS o HH:MM:SS AM/PM)
    let dateOnly = dateStr
    if (dateStr.includes(' ')) {
      // Tomar solo la parte de la fecha (antes del primer espacio)
      dateOnly = dateStr.split(' ')[0]
    }
    
    // Ya está en YYYY-MM-DD
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateOnly)) {
      const [year, month, day] = dateOnly.split('-')
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }

    // Formato DD/MM/YYYY o D/M/YYYY (común en NinjaTrader y Europa)
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateOnly)) {
      const [day, month, year] = dateOnly.split('/')
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }

    // Formato MM/DD/YYYY (común en plataformas US)
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateOnly) && dateStr.includes('AM') || dateStr.includes('PM')) {
      const [month, day, year] = dateOnly.split('/')
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }

    // Formato DD-MM-YYYY o D-M-YYYY
    if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateOnly)) {
      const [day, month, year] = dateOnly.split('-')
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }

    // ISO datetime format
    if (dateStr.includes('T')) {
      return dateStr.split('T')[0]
    }

    return dateOnly
  }

  // Función para normalizar el lado (long/short)
  const normalizeSide = (sideStr: string): string => {
    if (!sideStr) return 'long'
    
    const normalized = sideStr.toLowerCase().trim()
    
    // Mapeos comunes
    if (['long', 'buy', 'bought', 'l', 'b', 'largo'].includes(normalized)) {
      return 'long'
    }
    if (['short', 'sell', 'sold', 's', 'corto'].includes(normalized)) {
      return 'short'
    }
    
    return 'long' // Default
  }

  // Función para normalizar exit_reason a los valores permitidos por la BD
  const normalizeExitReason = (exitStr: string | undefined): string | undefined => {
    if (!exitStr || exitStr.trim() === '') return undefined
    
    const normalized = exitStr.toLowerCase().trim()
    
    // Mapeos de NinjaTrader y otras plataformas a valores de ZenTrade
    if (normalized.includes('tp') || normalized.includes('take') || normalized.includes('profit') || normalized.includes('target')) {
      return 'take_profit'
    }
    if (normalized.includes('sl') || normalized.includes('stop') && normalized.includes('loss')) {
      return 'stop_loss'
    }
    if (normalized.includes('be') || normalized.includes('break') || normalized.includes('even')) {
      return 'break_even'
    }
    if (normalized.includes('manual') || normalized.includes('market') || normalized.includes('exit')) {
      return 'manual'
    }
    if (normalized.includes('timeout') || normalized.includes('time') || normalized.includes('eod')) {
      return 'timeout'
    }
    
    // Si no coincide con ninguno, retornar undefined (NULL en BD)
    return undefined
  }

  // Función para encontrar un campo por múltiples variaciones
  const findField = (headers: string[], variations: string[]): string | undefined => {
    // Primero buscar coincidencia exacta (case insensitive)
    for (const variation of variations) {
      const exactMatch = headers.find(h => h.toLowerCase().trim() === variation.toLowerCase().trim())
      if (exactMatch) return exactMatch
    }
    
    // Si no hay coincidencia exacta, buscar si el header contiene la variación
    for (const variation of variations) {
      const partialMatch = headers.find(h => h.toLowerCase().includes(variation.toLowerCase()))
      if (partialMatch) return partialMatch
    }
    
    return undefined
  }

  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/trades/template')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'zentrade-plantilla-import.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError('Error al descargar la plantilla')
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setError(null)
    setSuccess(null)
    setParsedData([])

    // Para Rithmic, necesitamos parsing especial sin headers
    if (selectedPlatform === 'rithmic') {
      Papa.parse(file, {
        header: false, // No usar headers automáticos
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            setError('Error al parsear el archivo CSV')
            return
          }

          const rows = results.data as string[][]
          const allTrades: ParsedTrade[] = []
          let currentInstrument = ''
          let isInTradeSection = false
          
          console.log('Total rows:', rows.length)
          
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i]
            if (!row || row.length === 0) continue
            
            // Limpiar valores
            const col0 = (row[0] || '').replace(/"/g, '').trim()
            const col1 = (row[1] || '').replace(/"/g, '').trim()
            
            // Detectar header de trades (Trade Date en primera columna)
            if (col0 === 'Trade Date') {
              isInTradeSection = true
              console.log('Found trade section header at row', i)
              continue
            }
            
            // Detectar línea de instrumento: 
            // - No contiene "Account" ni "Trade Date"
            // - Tiene formato de código de instrumento (letras + números, ej: MNQH6, MGCJ6)
            // - Segunda columna es un número decimal
            if (!isInTradeSection && col0 && col1 && !col0.includes('Account') && !col0.includes('-')) {
              const isInstrumentCode = /^[A-Z0-9]{4,10}$/i.test(col0) // Códigos como MNQH6, MGCJ6
              const hasNumericValue = !isNaN(parseFloat(col1))
              
              if (isInstrumentCode && hasNumericValue) {
                currentInstrument = col0
                isInTradeSection = false
                console.log('Found instrument:', currentInstrument, 'at row', i)
                continue
              }
            }
            
            // Parsear trades: debe estar en sección de trades Y tener un instrumento activo
            if (isInTradeSection && currentInstrument && row.length >= 14) {
              try {
                const tradeDate = (row[0] || '').replace(/"/g, '').trim()
                const entrySide = (row[2] || '').replace(/"/g, '').trim()
                const entryTime = (row[3] || '').replace(/"/g, '').trim()
                const fillSize = (row[10] || '').replace(/"/g, '').trim()
                const netPnL = (row[13] || '').replace(/"/g, '').trim()
                
                // Validar que tenemos datos mínimos
                if (!tradeDate || !fillSize || !netPnL || tradeDate === 'Trade Date') continue
                
                // Convertir fecha de YYYYMMDD o usar entryTime si está disponible
                let formattedDate = ''
                if (entryTime && entryTime.includes('-')) {
                  // Usar Entry Time si tiene formato YYYY-MM-DD HH:MM:SS
                  formattedDate = entryTime.split(' ')[0]
                } else if (tradeDate.length === 8 && /^\d{8}$/.test(tradeDate)) {
                  // Convertir YYYYMMDD a YYYY-MM-DD
                  formattedDate = `${tradeDate.slice(0, 4)}-${tradeDate.slice(4, 6)}-${tradeDate.slice(6, 8)}`
                } else {
                  continue
                }
                
                // Parsear contratos y resultado
                const contracts = parseInt(fillSize)
                const result = parseFloat(netPnL.replace(/[$,]/g, ''))
                
                if (isNaN(contracts) || isNaN(result)) continue
                
                // Determinar lado (B=Long, S=Short)
                const side = entrySide.toLowerCase() === 'b' || entrySide.toLowerCase() === 'buy' ? 'long' : 'short'
                
                allTrades.push({
                  trade_date: formattedDate,
                  instrument_symbol: currentInstrument,
                  side,
                  contracts,
                  result,
                })
              } catch (e) {
                console.error('Error parsing row', i, ':', e)
                continue
              }
            }
          }
          
          console.log('Parsed trades:', allTrades.length)
          
          if (allTrades.length === 0) {
            setError('No se encontraron trades válidos en el archivo de Rithmic. Verifica que el archivo tenga el formato correcto.')
            return
          }
          
          if (allTrades.length > 50) {
            setError('El archivo contiene más de 50 trades (máximo permitido)')
            return
          }
          
          setParsedData(allTrades)
        },
        error: (error) => {
          setError(`Error al leer el archivo: ${error.message}`)
        },
      })
      return
    }

    // Parsing normal para otras plataformas
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Error al parsear el archivo CSV')
          return
        }

        const trades = results.data as any[]
        if (trades.length === 0) {
          setError('El archivo no contiene datos')
          return
        }

        if (trades.length > 50) {
          setError('El archivo contiene más de 50 trades (máximo permitido)')
          return
        }

        // Obtener headers del archivo
        const firstRow = trades[0]
        const headers = Object.keys(firstRow)
        
        // Obtener mapeo de la plataforma seleccionada
        const mapping = PLATFORM_MAPPINGS[selectedPlatform]
        
        // Encontrar campos usando el mapeo de la plataforma
        const cumNetProfitField = (mapping as ColumnMappingExtended).cumNetProfit ? findField(headers, (mapping as ColumnMappingExtended).cumNetProfit!) : null
        const dateField = findField(headers, mapping.date)
        const instrumentField = findField(headers, mapping.instrument)
        const sideField = findField(headers, mapping.side)
        const contractsField = findField(headers, mapping.contracts)
        const resultField = findField(headers, mapping.result)
        const exitReasonField = mapping.exitReason ? findField(headers, mapping.exitReason) : null
        const notesField = mapping.notes ? findField(headers, mapping.notes) : null
        
        // Validar campos requeridos (Rithmic detecta instrument del archivo)
        const missingFields = []
        if (!dateField) missingFields.push('Fecha')
        if (!instrumentField) missingFields.push('Instrumento')
        if (!sideField) missingFields.push('Lado (Long/Short)')
        if (!contractsField) missingFields.push('Contratos')
        if (!resultField) missingFields.push('Resultado/Profit')

        if (missingFields.length > 0) {
          setError(`No se encontraron los siguientes campos requeridos: ${missingFields.join(', ')}. Verifica que seleccionaste la plataforma correcta.`)
          return
        }

        // Mapear y limpiar datos
        const mappedTrades: ParsedTrade[] = trades
          .map((row: any) => {
            const resultValue = row[resultField!]
            const contractsValue = row[contractsField!]
            
            // Validar que result y contracts existan (pueden ser 0)
            if (resultValue === undefined || resultValue === null || resultValue === '' || 
                contractsValue === undefined || contractsValue === null || contractsValue === '') {
              return null
            }
            
            // Función para parsear números de NinjaTrader/plataformas de trading
            // Maneja: $1,234.56, -$1,234.56, ($1,234.56), etc.
            const parseTradeNumber = (value: any): number => {
              let str = value.toString().trim()
              
              // Si está entre paréntesis, es negativo (formato contable)
              const isNegative = str.startsWith('(') && str.endsWith(')')
              if (isNegative) {
                str = str.slice(1, -1) // Quitar paréntesis
              }
              
              // Eliminar $, comas, espacios
              str = str.replace(/[$,\s]/g, '')
              
              // Parsear
              let num = parseFloat(str)
              
              // Aplicar signo negativo si estaba entre paréntesis
              if (isNegative) {
                num = -Math.abs(num)
              }
              
              return num
            }
            
            const contracts = parseTradeNumber(contractsValue)
            const result = parseTradeNumber(resultValue)
            const cumNetProfit = cumNetProfitField && row[cumNetProfitField] ? parseTradeNumber(row[cumNetProfitField]) : null
            
            // Validar que sean números válidos
            if (isNaN(contracts) || isNaN(result)) {
              return null
            }
            
            return {
              trade_date: normalizeDate(row[dateField!]),
              instrument_symbol: row[instrumentField!],
              side: normalizeSide(row[sideField!]),
              contracts,
              result,
              cumNetProfit: cumNetProfit !== null ? cumNetProfit : undefined,
              exit_reason: exitReasonField ? normalizeExitReason(row[exitReasonField]) : undefined,
              notes: notesField ? row[notesField] : undefined,
            }
          })
          .filter(trade => trade !== null) as ParsedTrade[]

        if (mappedTrades.length === 0) {
          setError('No se encontraron trades válidos. Verifica que las columnas de Resultado y Contratos no estén vacías.')
          return
        }

        const skippedCount = trades.length - mappedTrades.length
        if (skippedCount > 0) {
          setError(`Se omitieron ${skippedCount} trade(s) con valores vacíos en Resultado o Contratos.`)
        }

        setParsedData(mappedTrades)
      },
      error: (error) => {
        setError(`Error al leer el archivo: ${error.message}`)
      },
    })
  }, [selectedPlatform])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  })

  const handleImport = async () => {
    if (parsedData.length === 0) return

    setIsUploading(true)
    setError(null)

    try {
      // Si hay cumNetProfit (NinjaTrader), calcular el resultado real de cada trade
      const tradesToImport = parsedData.map((trade, index) => {
        let finalResult = typeof trade.result === 'number' ? trade.result : parseFloat(trade.result.toString())
        
        // Si tiene cumNetProfit, calcular el resultado individual
        if (trade.cumNetProfit !== undefined) {
          const currentCumProfit = typeof trade.cumNetProfit === 'number' ? trade.cumNetProfit : parseFloat(trade.cumNetProfit.toString())
          
          if (index === 0) {
            // Primer trade: el cumNetProfit es el resultado
            finalResult = currentCumProfit
          } else {
            // Otros trades: diferencia entre el cumNetProfit actual y el anterior
            const prevTrade = parsedData[index - 1]
            if (prevTrade.cumNetProfit !== undefined) {
              const prevCumProfit = typeof prevTrade.cumNetProfit === 'number' ? prevTrade.cumNetProfit : parseFloat(prevTrade.cumNetProfit.toString())
              finalResult = currentCumProfit - prevCumProfit
            }
          }
        }
        
        // Limpiar objeto: remover cumNetProfit y otros campos no necesarios
        const { cumNetProfit, ...cleanTrade } = trade as any
        
        return {
          trade_date: cleanTrade.trade_date,
          instrument_symbol: cleanTrade.instrument_symbol,
          side: cleanTrade.side,
          contracts: cleanTrade.contracts,
          result: finalResult,
          exit_reason: cleanTrade.exit_reason || null,
          followed_plan: cleanTrade.followed_plan || false,
          emotions: cleanTrade.emotions || null,
          notes: cleanTrade.notes || null,
        }
      })

      console.log('Enviando trades:', tradesToImport.length)
      console.log('Primer trade:', tradesToImport[0])

      console.log('Llamando a /api/trades/import...')
      
      // Agregar timeout de 30 segundos
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)
      
      const response = await fetch('/api/trades/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: accountId,
          trades: tradesToImport,
        }),
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      const data = await response.json()
      console.log('Data recibida:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Error al importar')
      }

      setSuccess(`Se importaron ${data.imported} trades exitosamente`)
      setParsedData([])
      onImportSuccess()
    } catch (err: any) {
      console.error('Error en handleImport:', err)
      if (err.name === 'AbortError') {
        setError('La importación tardó demasiado tiempo (timeout). Intenta con menos trades o verifica que el servidor esté corriendo.')
      } else {
        setError(err.message || 'Error desconocido al importar')
      }
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Selector de plataforma */}
      <Card className="p-6 border-zen-forest/40 bg-zen-surface/60">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform" className="text-zen-anti-flash font-semibold">
              Plataforma de Trading
            </Label>
            <p className="text-sm text-zen-text-muted">
              Selecciona la plataforma desde donde exportaste tu CSV. Esto permite mapear automáticamente las columnas correctas.
            </p>
          </div>
          <Select value={selectedPlatform} onValueChange={(value) => setSelectedPlatform(value as PlatformType)}>
            <SelectTrigger id="platform" className="w-full bg-zen-rich-black border-zen-border-soft text-zen-anti-flash">
              <SelectValue placeholder="Selecciona una plataforma" />
            </SelectTrigger>
            <SelectContent className="bg-zen-rich-black border-zen-border-soft">
              {(Object.keys(PLATFORM_LABELS) as PlatformType[]).map((platform) => (
                <SelectItem 
                  key={platform} 
                  value={platform}
                  className="text-zen-anti-flash hover:bg-zen-surface focus:bg-zen-surface"
                >
                  {PLATFORM_LABELS[platform]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Botón de plantilla - Solo visible cuando se selecciona Custom */}
      {selectedPlatform === 'custom' && (
        <Card className="p-4 border-zen-forest/40 bg-zen-surface/60">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-zen-anti-flash">Plantilla CSV</h3>
              <p className="text-sm text-zen-text-muted">
                Descarga la plantilla ZenTrade si quieres usar nuestro formato custom
              </p>
            </div>
            <Button 
              onClick={downloadTemplate} 
              variant="outline" 
              className="gap-2 border-zen-caribbean-green text-zen-caribbean-green hover:bg-zen-caribbean-green hover:text-zen-rich-black"
            >
              <Download className="h-4 w-4" />
              Descargar plantilla
            </Button>
          </div>
        </Card>
      )}

      {/* Zona de drop */}
      <Card className="p-8 border-zen-forest/40 bg-zen-surface/60">
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
            isDragActive
              ? 'border-zen-caribbean-green bg-zen-caribbean-green/10'
              : 'border-zen-border-soft hover:border-zen-caribbean-green/50 hover:bg-zen-surface-elevated'
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-zen-text-muted" />
          <p className="text-lg font-semibold text-zen-anti-flash mb-2">
            {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra un archivo CSV o haz clic'}
          </p>
          <p className="text-sm text-zen-text-muted">
            Máximo 50 trades por importación
          </p>
        </div>
      </Card>

      {/* Preview de datos */}
      {parsedData.length > 0 && (
        <Card className="p-6 border-zen-caribbean-green/40 bg-zen-caribbean-green/5">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-zen-caribbean-green" />
              <h3 className="text-lg font-semibold text-zen-anti-flash">
                {parsedData.length} trades listos para importar
              </h3>
            </div>
            <Button
              onClick={handleImport}
              disabled={isUploading}
              className="gap-2 bg-zen-caribbean-green hover:bg-zen-mountain-meadow text-zen-rich-black"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Importar trades
                </>
              )}
            </Button>
          </div>

          {/* Balance esperado - SIMPLIFICADO */}
          <div className="bg-zen-surface/80 border border-zen-border-soft rounded-lg p-5 mb-5">
            <h4 className="text-sm font-medium text-zen-text-muted mb-4">Verifica que coincida con tu cuenta</h4>
            
            <div className="space-y-3">
              {/* Balance inicial */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-zen-text-muted">Balance inicial</span>
                <span className="text-base font-medium text-zen-anti-flash">
                  ${initialBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Total P&L */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-zen-text-muted">Total P&L</span>
                <span className={`text-lg font-semibold ${
                  (() => {
                    // Si hay cumNetProfit (NinjaTrader), usar el último valor (es acumulativo)
                    const lastTrade = parsedData[parsedData.length - 1]
                    if (lastTrade && lastTrade.cumNetProfit !== undefined) {
                      const cumProfit = typeof lastTrade.cumNetProfit === 'number' ? lastTrade.cumNetProfit : parseFloat(lastTrade.cumNetProfit.toString())
                      return cumProfit >= 0 ? 'text-zen-caribbean-green' : 'text-zen-danger'
                    }
                    // Si no, sumar todos los resultados
                    return parsedData.reduce((sum, t) => sum + (typeof t.result === 'number' ? t.result : parseFloat(t.result.toString())), 0) >= 0 ? 'text-zen-caribbean-green' : 'text-zen-danger'
                  })()
                }`}>
                  {(() => {
                    const lastTrade = parsedData[parsedData.length - 1]
                    let totalPnL = 0
                    if (lastTrade && lastTrade.cumNetProfit !== undefined) {
                      totalPnL = typeof lastTrade.cumNetProfit === 'number' ? lastTrade.cumNetProfit : parseFloat(lastTrade.cumNetProfit.toString())
                    } else {
                      totalPnL = parsedData.reduce((sum, t) => sum + (typeof t.result === 'number' ? t.result : parseFloat(t.result.toString())), 0)
                    }
                    return (totalPnL >= 0 ? '+' : '') + '$' + totalPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  })()}
                </span>
              </div>

              {/* Separador */}
              <div className="border-t border-zen-border-soft my-2" />

              {/* Balance final esperado */}
              <div className="bg-zen-surface-elevated rounded-md p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-semibold text-zen-anti-flash block">Balance final esperado</span>
                    <span className="text-xs text-zen-text-muted">Este valor debe coincidir con tu cuenta</span>
                  </div>
                  <span className={`text-2xl font-bold ${
                    (() => {
                      const lastTrade = parsedData[parsedData.length - 1]
                      let totalPnL = 0
                      if (lastTrade && lastTrade.cumNetProfit !== undefined) {
                        totalPnL = typeof lastTrade.cumNetProfit === 'number' ? lastTrade.cumNetProfit : parseFloat(lastTrade.cumNetProfit.toString())
                      } else {
                        totalPnL = parsedData.reduce((sum, t) => sum + (typeof t.result === 'number' ? t.result : parseFloat(t.result.toString())), 0)
                      }
                      return (initialBalance + totalPnL) >= initialBalance ? 'text-zen-caribbean-green' : 'text-zen-danger'
                    })()
                  }`}>
                    ${(() => {
                      const lastTrade = parsedData[parsedData.length - 1]
                      let totalPnL = 0
                      if (lastTrade && lastTrade.cumNetProfit !== undefined) {
                        totalPnL = typeof lastTrade.cumNetProfit === 'number' ? lastTrade.cumNetProfit : parseFloat(lastTrade.cumNetProfit.toString())
                      } else {
                        totalPnL = parsedData.reduce((sum, t) => sum + (typeof t.result === 'number' ? t.result : parseFloat(t.result.toString())), 0)
                      }
                      return (initialBalance + totalPnL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-zen-surface/60 border border-zen-border-soft rounded-lg p-4">
              <div className="text-sm text-zen-text-muted mb-1">Ganadores</div>
              <div className="text-2xl font-semibold text-zen-caribbean-green">
                {parsedData.filter((t, index) => {
                  let finalResult = typeof t.result === 'number' ? t.result : parseFloat(t.result.toString())
                  
                  if (t.cumNetProfit !== undefined) {
                    const currentCumProfit = typeof t.cumNetProfit === 'number' ? t.cumNetProfit : parseFloat(t.cumNetProfit.toString())
                    if (index === 0) {
                      finalResult = currentCumProfit
                    } else {
                      const prevTrade = parsedData[index - 1]
                      if (prevTrade.cumNetProfit !== undefined) {
                        const prevCumProfit = typeof prevTrade.cumNetProfit === 'number' ? prevTrade.cumNetProfit : parseFloat(prevTrade.cumNetProfit.toString())
                        finalResult = currentCumProfit - prevCumProfit
                      }
                    }
                  }
                  
                  return finalResult > 0
                }).length}
              </div>
            </div>
            <div className="bg-zen-surface/60 border border-zen-border-soft rounded-lg p-4">
              <div className="text-sm text-zen-text-muted mb-1">Perdedores</div>
              <div className="text-2xl font-semibold text-zen-danger">
                {parsedData.filter((t, index) => {
                  let finalResult = typeof t.result === 'number' ? t.result : parseFloat(t.result.toString())
                  
                  if (t.cumNetProfit !== undefined) {
                    const currentCumProfit = typeof t.cumNetProfit === 'number' ? t.cumNetProfit : parseFloat(t.cumNetProfit.toString())
                    if (index === 0) {
                      finalResult = currentCumProfit
                    } else {
                      const prevTrade = parsedData[index - 1]
                      if (prevTrade.cumNetProfit !== undefined) {
                        const prevCumProfit = typeof prevTrade.cumNetProfit === 'number' ? prevTrade.cumNetProfit : parseFloat(prevTrade.cumNetProfit.toString())
                        finalResult = currentCumProfit - prevCumProfit
                      }
                    }
                  }
                  
                  return finalResult < 0
                }).length}
              </div>
            </div>
          </div>

          {/* Preview de trades */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <p className="text-xs text-zen-text-muted mb-2">Vista previa de los primeros trades:</p>
            {parsedData.slice(0, 5).map((trade, index) => {
              let finalResult = typeof trade.result === 'number' ? trade.result : parseFloat(trade.result.toString())
              
              if (trade.cumNetProfit !== undefined) {
                const currentCumProfit = typeof trade.cumNetProfit === 'number' ? trade.cumNetProfit : parseFloat(trade.cumNetProfit.toString())
                if (index === 0) {
                  finalResult = currentCumProfit
                } else {
                  const prevTrade = parsedData[index - 1]
                  if (prevTrade.cumNetProfit !== undefined) {
                    const prevCumProfit = typeof prevTrade.cumNetProfit === 'number' ? prevTrade.cumNetProfit : parseFloat(prevTrade.cumNetProfit.toString())
                    finalResult = currentCumProfit - prevCumProfit
                  }
                }
              }
              
              return (
                <div
                  key={index}
                  className="text-sm text-zen-anti-flash border border-zen-border-soft rounded p-3 bg-zen-rich-black flex justify-between items-center"
                >
                  <span className="text-zen-text-muted">
                    {trade.trade_date} • {trade.instrument_symbol} • {trade.side} • {trade.contracts} contratos
                  </span>
                  <span className={finalResult >= 0 ? 'text-zen-caribbean-green font-medium' : 'text-zen-danger font-medium'}>
                    ${finalResult.toFixed(2)}
                  </span>
                </div>
              )
            })}
            {parsedData.length > 5 && (
              <p className="text-sm text-zen-text-muted text-center pt-2">
                ... y {parsedData.length - 5} trades más
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Alertas */}
      {error && (
        <Alert variant="destructive" className="border-zen-danger/50 bg-zen-danger/10">
          <XCircle className="h-4 w-4 text-zen-danger" />
          <AlertDescription className="text-zen-danger">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-zen-caribbean-green/50 bg-zen-caribbean-green/10">
          <CheckCircle2 className="h-4 w-4 text-zen-caribbean-green" />
          <AlertDescription className="text-zen-caribbean-green">{success}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
