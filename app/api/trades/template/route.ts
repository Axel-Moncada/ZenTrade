import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserPlan } from '@/lib/lemonsqueezy/get-user-plan'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Plan gate: la plantilla de import solo es útil para Pro y ZenMode
  const plan = await getUserPlan(supabase, user.id)
  if (!plan.isPro && !plan.isZenMode) {
    return NextResponse.json(
      { error: 'The import template requires the Professional plan or higher.' },
      { status: 403 }
    )
  }

  const headers = [
    'Date (YYYY-MM-DD)',
    'Instrument (symbol)',
    'Side (long/short)',
    'Contracts',
    'Result',
    'Exit Reason (take_profit/stop_loss/break_even/manual/timeout)',
    'Followed Plan (yes/no)',
    'Emotions (comma separated)',
    'Notes'
  ]

  const exampleRow = [
    '2024-02-12',
    'MNQ',
    'long',
    '2',
    '+150.00',
    'take_profit',
    'yes',
    'confident, patient',
    'Clean entry, followed my setup'
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
