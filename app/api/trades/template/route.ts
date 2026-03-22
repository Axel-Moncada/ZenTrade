import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserPlan } from '@/lib/lemonsqueezy/get-user-plan'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Plan gate: la plantilla de import solo es útil para Pro y ZenMode
  const plan = await getUserPlan(supabase, user.id)
  if (!plan.isPro && !plan.isZenMode) {
    return NextResponse.json(
      { error: 'La plantilla de importación requiere el plan Professional o superior.' },
      { status: 403 }
    )
  }

  const headers = [
    'Fecha (YYYY-MM-DD)',
    'Instrumento (símbolo)',
    'Lado (long/short)',
    'Contratos',
    'Resultado',
    'Razón Salida (take_profit/stop_loss/break_even/manual/timeout)',
    'Siguió Plan (si/no)',
    'Emociones (separadas por coma)',
    'Notas'
  ]

  const exampleRow = [
    '2024-02-12',
    'MNQ',
    'long',
    '2',
    '+150.00',
    'take_profit',
    'si',
    'confiado, paciente',
    'Entrada perfecta siguiendo estrategia'
  ]

  const csvContent = '\uFEFF' + [
    headers.join(','),
    exampleRow.map(cell => typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell).join(',')
  ].join('\n')

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="zentrade-plantilla-import.csv"',
    },
  })
}
