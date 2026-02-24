export type Locale = 'es' | 'en';

const translations = {
  es: {
    // ── Sidebar ──────────────────────────────────────────────
    nav: {
      dashboard: 'Dashboard',
      accounts: 'Cuentas',
      withdrawals: 'Retiros',
      calendar: 'Calendario',
      trades: 'Trades',
      tradingPlan: 'Plan de Trading',
    },
    sidebar: {
      user: 'Usuario',
      darkMode: 'Modo Oscuro',
      lightMode: 'Modo Claro',
      language: 'Language',
    },

    // ── Común ────────────────────────────────────────────────
    common: {
      loading: 'Cargando...',
      error: 'Error',
      retry: 'Reintentar',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      create: 'Crear',
      confirm: 'Confirmar',
      back: 'Volver',
      export: 'Exportar',
      import: 'Importar',
      search: 'Buscar',
      filter: 'Filtrar',
      all: 'Todos',
      yes: 'Sí',
      no: 'No',
    },

    // ── Dashboard page ───────────────────────────────────────
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Análisis de rendimiento',
      noAccounts: 'No tienes cuentas creadas',
      noAccountsDesc: 'Crea tu primera cuenta de trading para comenzar a trackear tu rendimiento',
      createFirst: 'Crear primera cuenta',
      pnlTotal: 'P&L Total',
      winRate: 'Win Rate',
      streak: 'Racha',
      bestDay: 'Mejor Día',
      worstDay: 'Peor Día',
      bestDayAlert: (pct: string) => `Mejor día = ${pct}% del total`,
      winners: 'ganadores',
      ops: 'ops',
    },

    // ── Accounts page ────────────────────────────────────────
    accounts: {
      title: 'Cuentas',
      subtitle: 'Gestiona tus cuentas de trading',
      loadingAccounts: 'Cargando cuentas...',
      loadError: 'Error al cargar las cuentas',
      loadErrorGeneric: 'Error al cargar',
      noAccounts: 'No tienes cuentas',
      noAccountsDesc: 'Comienza creando tu primera cuenta de trading para poder registrar tus operaciones.',
      newAccount: 'Nueva Cuenta',
      createFirst: 'Crear Primera Cuenta',
    },

    // ── Trades page ──────────────────────────────────────────
    trades: {
      title: 'Historial de Trades',
      subtitle: 'Visualiza y gestiona todos tus trades',
      importBtn: 'Importar',
      exportBtn: 'Exportar CSV',
      newTrade: 'Nuevo trade',
      totalTrades: 'Total trades',
      winners: 'Ganadores',
      losers: 'Perdedores',
      totalPnl: 'P&L Total',
      loading: 'Cargando...',
      selectedInfo: (n: number) => `${n} trade(s) seleccionado(s)`,
      deselectAll: 'Deseleccionar todo',
      deleteSelected: 'Borrar seleccionados',
      deleting: 'Borrando...',
      confirmDelete: (n: number) => `¿Estás seguro de que quieres eliminar ${n} trade(s)? Esta acción no se puede deshacer.`,
      deleteSuccess: (n: number) => `Se eliminaron ${n} trade(s) correctamente`,
      deleteError: 'Hubo un error al eliminar los trades',
      prevPage: 'Anterior',
      nextPage: 'Siguiente',
      page: (cur: number, total: number) => `Página ${cur} de ${total}`,
    },

    // ── Calendar page ────────────────────────────────────────
    calendar: {
      title: 'Calendario',
      subtitle: 'Historial de trading por día',
      loadError: 'Error al cargar las cuentas',
      connectionError: 'Error de conexión',
      noAccounts: 'No tienes cuentas',
      noAccountsDesc: 'Crea una cuenta para empezar a registrar tus días de trading.',
      retry: 'Reintentar',
    },

    // ── Trading Plan page ────────────────────────────────────
    tradingPlan: {
      title: 'Plan de Trading',
      subtitle: 'Define tus reglas y objetivos de trading',
      noPlan: 'No tienes un plan activo',
      noPlanDesc: 'Crea un plan de trading para definir tus reglas y objetivos.',
      createPlan: 'Crear Plan',
      editPlan: 'Editar Plan',
      exportPdf: 'Exportar PDF',
      activeSince: 'Activo desde',
      riskPerTrade: 'Riesgo por trade',
      maxDrawdown: 'Max drawdown',
      dailyTarget: 'Objetivo diario',
    },

    // ── Withdrawals page ─────────────────────────────────────
    withdrawals: {
      title: 'Retiros',
      subtitle: 'Gestiona tus retiros de cuentas live. Solo puedes retirar cuando tu saldo supere el 30% del saldo inicial.',
      totalWithdrawn: 'Total Retirado',
      completed: 'Retiros Completados',
      lastWithdrawal: 'Último Retiro',
      noLiveAccounts: 'No tienes cuentas live',
      noLiveAccountsDesc: 'Los retiros solo están disponibles para cuentas de tipo LIVE',
      liveAccounts: (n: number) => `Cuentas Live (${n})`,
      recentWithdrawals: 'Retiros Recientes',
      statusCompleted: 'Completado',
      statusPending: 'Pendiente',
      statusCancelled: 'Cancelado',
      loading: 'Cargando retiros...',
    },
  },

  en: {
    // ── Sidebar ──────────────────────────────────────────────
    nav: {
      dashboard: 'Dashboard',
      accounts: 'Accounts',
      withdrawals: 'Withdrawals',
      calendar: 'Calendar',
      trades: 'Trades',
      tradingPlan: 'Trading Plan',
    },
    sidebar: {
      user: 'User',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      language: 'Language',
    },

    // ── Común ────────────────────────────────────────────────
    common: {
      loading: 'Loading...',
      error: 'Error',
      retry: 'Retry',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      confirm: 'Confirm',
      back: 'Back',
      export: 'Export',
      import: 'Import',
      search: 'Search',
      filter: 'Filter',
      all: 'All',
      yes: 'Yes',
      no: 'No',
    },

    // ── Dashboard page ───────────────────────────────────────
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Performance analysis',
      noAccounts: 'No accounts yet',
      noAccountsDesc: 'Create your first trading account to start tracking your performance.',
      createFirst: 'Create first account',
      pnlTotal: 'Total P&L',
      winRate: 'Win Rate',
      streak: 'Streak',
      bestDay: 'Best Day',
      worstDay: 'Worst Day',
      bestDayAlert: (pct: string) => `Best day = ${pct}% of total`,
      winners: 'winners',
      ops: 'ops',
    },

    // ── Accounts page ────────────────────────────────────────
    accounts: {
      title: 'Accounts',
      subtitle: 'Manage your trading accounts',
      loadingAccounts: 'Loading accounts...',
      loadError: 'Error loading accounts',
      loadErrorGeneric: 'Error loading',
      noAccounts: 'No accounts yet',
      noAccountsDesc: 'Start by creating your first trading account to record your trades.',
      newAccount: 'New Account',
      createFirst: 'Create First Account',
    },

    // ── Trades page ──────────────────────────────────────────
    trades: {
      title: 'Trade History',
      subtitle: 'View and manage all your trades',
      importBtn: 'Import',
      exportBtn: 'Export CSV',
      newTrade: 'New trade',
      totalTrades: 'Total trades',
      winners: 'Winners',
      losers: 'Losers',
      totalPnl: 'Total P&L',
      loading: 'Loading...',
      selectedInfo: (n: number) => `${n} trade(s) selected`,
      deselectAll: 'Deselect all',
      deleteSelected: 'Delete selected',
      deleting: 'Deleting...',
      confirmDelete: (n: number) => `Are you sure you want to delete ${n} trade(s)? This action cannot be undone.`,
      deleteSuccess: (n: number) => `${n} trade(s) deleted successfully`,
      deleteError: 'An error occurred while deleting trades',
      prevPage: 'Previous',
      nextPage: 'Next',
      page: (cur: number, total: number) => `Page ${cur} of ${total}`,
    },

    // ── Calendar page ────────────────────────────────────────
    calendar: {
      title: 'Calendar',
      subtitle: 'Daily trading history',
      loadError: 'Error loading accounts',
      connectionError: 'Connection error',
      noAccounts: 'No accounts yet',
      noAccountsDesc: 'Create an account to start recording your trading days.',
      retry: 'Retry',
    },

    // ── Trading Plan page ────────────────────────────────────
    tradingPlan: {
      title: 'Trading Plan',
      subtitle: 'Define your trading rules and goals',
      noPlan: 'No active plan',
      noPlanDesc: 'Create a trading plan to define your rules and objectives.',
      createPlan: 'Create Plan',
      editPlan: 'Edit Plan',
      exportPdf: 'Export PDF',
      activeSince: 'Active since',
      riskPerTrade: 'Risk per trade',
      maxDrawdown: 'Max drawdown',
      dailyTarget: 'Daily target',
    },

    // ── Withdrawals page ─────────────────────────────────────
    withdrawals: {
      title: 'Withdrawals',
      subtitle: 'Manage withdrawals from live accounts. You can only withdraw when your balance exceeds 30% of the initial balance.',
      totalWithdrawn: 'Total Withdrawn',
      completed: 'Completed Withdrawals',
      lastWithdrawal: 'Last Withdrawal',
      noLiveAccounts: 'No live accounts',
      noLiveAccountsDesc: 'Withdrawals are only available for LIVE account types',
      liveAccounts: (n: number) => `Live Accounts (${n})`,
      recentWithdrawals: 'Recent Withdrawals',
      statusCompleted: 'Completed',
      statusPending: 'Pending',
      statusCancelled: 'Cancelled',
      loading: 'Loading withdrawals...',
    },
  },
} as const;

export type Translations = typeof translations.es;
export default translations;
