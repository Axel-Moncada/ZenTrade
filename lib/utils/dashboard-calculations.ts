import { TradeWithInstrument } from '@/types/trades';
import { 
  DashboardStats, 
  EquityCurvePoint, 
  WinsLossesPoint,
  EmotionDistribution,
  ExitReasonDistribution,
  InstrumentStats
} from '@/types/dashboard';

interface DailySummary {
  date: string;
  trades: TradeWithInstrument[];
  pnl: number;
  wins: number;
  losses: number;
}

export function calculateDashboardStats(trades: TradeWithInstrument[]): DashboardStats {
  if (trades.length === 0) {
    return getEmptyStats();
  }

  // Ordenar trades por fecha
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
  );

  // Agrupar por día
  const dailySummaries = groupTradesByDay(sortedTrades);

  // Calcular KPIs básicos
  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => t.result > 0).length;
  const losingTrades = trades.filter(t => t.result < 0).length;
  const totalPnl = trades.reduce((sum, t) => sum + t.result, 0);

  const totalGrossWins = trades
    .filter(t => t.result > 0)
    .reduce((sum, t) => sum + t.result, 0);
  
  const totalGrossLosses = Math.abs(
    trades
      .filter(t => t.result < 0)
      .reduce((sum, t) => sum + t.result, 0)
  );

  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const averagePerTrade = totalTrades > 0 ? totalPnl / totalTrades : 0;
  const profitFactor = totalGrossLosses > 0 ? totalGrossWins / totalGrossLosses : totalGrossWins > 0 ? Infinity : 0;

  // Max gain/loss - solo considerar trades ganadores/perdedores respectivamente
  const winningTradesList = trades.filter(t => t.result > 0);
  const losingTradesList = trades.filter(t => t.result < 0);
  const maxGain = winningTradesList.length > 0 ? Math.max(...winningTradesList.map(t => t.result)) : 0;
  const maxLoss = losingTradesList.length > 0 ? Math.min(...losingTradesList.map(t => t.result)) : 0;

  // Mejor día y peor día
  const bestDayData = dailySummaries.length > 0 
    ? dailySummaries.reduce((best, day) => day.pnl > best.pnl ? day : best)
    : null;
  
  // Peor día: solo considerar días con pérdidas (PNL < 0)
  const losingDays = dailySummaries.filter(day => day.pnl < 0);
  const worstDayData = losingDays.length > 0
    ? losingDays.reduce((worst, day) => day.pnl < worst.pnl ? day : worst)
    : null;

  const bestDay = bestDayData ? {
    date: bestDayData.date,
    pnl: bestDayData.pnl,
    percentOfTotal: totalPnl > 0 ? (bestDayData.pnl / totalPnl) * 100 : 0
  } : null;

  const worstDay = worstDayData ? {
    date: worstDayData.date,
    pnl: worstDayData.pnl
  } : null;

  // Racha actual
  const currentStreak = calculateCurrentStreak(sortedTrades);

  // Plan adherence
  const tradesFollowingPlan = trades.filter(t => t.followed_plan === true).length;
  const planAdherenceRate = totalTrades > 0 ? (tradesFollowingPlan / totalTrades) * 100 : 0;

  // Datos para gráficos
  const equityCurve = calculateEquityCurve(dailySummaries);
  const winsLossesByDay = calculateWinsLossesByDay(dailySummaries);
  const emotionsDistribution = calculateEmotionsDistribution(trades);
  const exitReasonsDistribution = calculateExitReasonsDistribution(trades);
  const instrumentStats = calculateInstrumentStats(trades);

  return {
    totalPnl,
    totalTrades,
    winningTrades,
    losingTrades,
    winRate,
    averagePerTrade,
    profitFactor,
    totalGrossWins,
    totalGrossLosses,
    maxGain,
    maxLoss,
    bestDay,
    worstDay,
    currentStreak,
    tradesFollowingPlan,
    planAdherenceRate,
    equityCurve,
    winsLossesByDay,
    emotionsDistribution,
    exitReasonsDistribution,
    instrumentStats
  };
}

function groupTradesByDay(trades: TradeWithInstrument[]): DailySummary[] {
  const dayMap = new Map<string, TradeWithInstrument[]>();

  trades.forEach(trade => {
    const date = trade.trade_date;
    if (!dayMap.has(date)) {
      dayMap.set(date, []);
    }
    dayMap.get(date)!.push(trade);
  });

  return Array.from(dayMap.entries()).map(([date, dayTrades]) => ({
    date,
    trades: dayTrades,
    pnl: dayTrades.reduce((sum, t) => sum + t.result, 0),
    wins: dayTrades.filter(t => t.result > 0).length,
    losses: dayTrades.filter(t => t.result < 0).length
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function calculateEquityCurve(dailySummaries: DailySummary[]): EquityCurvePoint[] {
  let cumulativePnl = 0;
  
  return dailySummaries.map(day => {
    cumulativePnl += day.pnl;
    return {
      date: day.date,
      cumulativePnl: Number(cumulativePnl.toFixed(2)),
      dailyPnl: Number(day.pnl.toFixed(2))
    };
  });
}

function calculateWinsLossesByDay(dailySummaries: DailySummary[]): WinsLossesPoint[] {
  return dailySummaries.map(day => ({
    date: day.date,
    wins: day.wins,
    losses: day.losses,
    totalTrades: day.trades.length
  }));
}

function calculateEmotionsDistribution(trades: TradeWithInstrument[]): EmotionDistribution[] {
  const emotionMap = new Map<string, number>();
  
  trades.forEach(trade => {
    if (trade.emotions && Array.isArray(trade.emotions)) {
      trade.emotions.forEach(emotion => {
        emotionMap.set(emotion, (emotionMap.get(emotion) || 0) + 1);
      });
    }
  });

  const total = Array.from(emotionMap.values()).reduce((sum, count) => sum + count, 0);
  
  return Array.from(emotionMap.entries())
    .map(([emotion, count]) => ({
      emotion,
      count,
      percentage: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0
    }))
    .sort((a, b) => b.count - a.count);
}

function calculateExitReasonsDistribution(trades: TradeWithInstrument[]): ExitReasonDistribution[] {
  const reasonMap = new Map<string, number>();
  
  trades.forEach(trade => {
    if (trade.exit_reason) {
      reasonMap.set(trade.exit_reason, (reasonMap.get(trade.exit_reason) || 0) + 1);
    }
  });

  const total = trades.length;
  
  return Array.from(reasonMap.entries())
    .map(([reason, count]) => ({
      reason,
      count,
      percentage: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0
    }))
    .sort((a, b) => b.count - a.count);
}

function calculateInstrumentStats(trades: TradeWithInstrument[]): InstrumentStats[] {
  const instrumentMap = new Map<string, TradeWithInstrument[]>();
  
  trades.forEach(trade => {
    const key = trade.instrument.symbol;
    if (!instrumentMap.has(key)) {
      instrumentMap.set(key, []);
    }
    instrumentMap.get(key)!.push(trade);
  });

  return Array.from(instrumentMap.entries())
    .map(([symbol, instrumentTrades]) => {
      const totalTrades = instrumentTrades.length;
      const winningTrades = instrumentTrades.filter(t => t.result > 0).length;
      const losingTrades = instrumentTrades.filter(t => t.result < 0).length;
      const totalPnl = instrumentTrades.reduce((sum, t) => sum + t.result, 0);
      const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
      const averagePnl = totalTrades > 0 ? totalPnl / totalTrades : 0;

      return {
        symbol,
        name: instrumentTrades[0].instrument.name,
        totalTrades,
        winningTrades,
        losingTrades,
        winRate: Number(winRate.toFixed(1)),
        totalPnl: Number(totalPnl.toFixed(2)),
        averagePnl: Number(averagePnl.toFixed(2))
      };
    })
    .sort((a, b) => b.totalPnl - a.totalPnl);
}

function calculateCurrentStreak(sortedTrades: TradeWithInstrument[]): {
  type: 'winning' | 'losing' | 'none';
  count: number;
} {
  if (sortedTrades.length === 0) {
    return { type: 'none', count: 0 };
  }

  // Empezar desde el trade más reciente
  const recentTrades = [...sortedTrades].reverse();
  const lastTrade = recentTrades[0];
  const isWinning = lastTrade.result > 0;
  
  let count = 0;
  for (const trade of recentTrades) {
    if ((isWinning && trade.result > 0) || (!isWinning && trade.result < 0)) {
      count++;
    } else {
      break;
    }
  }

  return {
    type: isWinning ? 'winning' : 'losing',
    count
  };
}

function getEmptyStats(): DashboardStats {
  return {
    totalPnl: 0,
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    winRate: 0,
    averagePerTrade: 0,
    profitFactor: 0,
    totalGrossWins: 0,
    totalGrossLosses: 0,
    maxGain: 0,
    maxLoss: 0,
    bestDay: null,
    worstDay: null,
    currentStreak: { type: 'none', count: 0 },
    tradesFollowingPlan: 0,
    planAdherenceRate: 0,
    equityCurve: [],
    winsLossesByDay: [],
    emotionsDistribution: [],
    exitReasonsDistribution: [],
    instrumentStats: []
  };
}
