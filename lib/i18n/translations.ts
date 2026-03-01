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
      profile: 'Perfil',
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
      lastDays: (n: number) => `Últimos ${n} días`,
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
      loadSummariesError: 'Error al cargar los resúmenes',
      saveNotesError: 'Error al guardar las notas',
      connectionError: 'Error de conexión',
      noAccounts: 'No tienes cuentas',
      noAccountsDesc: 'Crea una cuenta para empezar a registrar tus días de trading.',
      retry: 'Reintentar',
    },

    // ── Profile page ─────────────────────────────────────────
    profile: {
      title: 'Perfil',
      subtitle: 'Gestiona tu información personal y preferencias',
      memberSince: 'Miembro desde',
      editProfile: 'Editar',
      saveChanges: 'Guardar cambios',
      saveSuccess: 'Cambios guardados correctamente',
      saveError: 'Error al guardar los cambios',
      fullName: 'Nombre completo',
      timezone: 'Zona horaria',
      currency: 'Moneda',
      membership: 'Membresía',
      planCurrentBadge: 'Actual',
      planLockedLabel: 'Bloqueado',
      planComingSoon: 'Próximamente',
      planUpgradePro: 'Actualizar a Pro',
      planFreeName: 'Free',
      planFreePrice: 'Gratis',
      planFreeDesc: 'Para empezar tu journal de trading',
      planFreeFeatures: ['1 cuenta de trading', 'Registro manual de trades', 'Dashboard básico', 'Export CSV'],
      planFreeCtaLabel: 'Plan actual',
      planStarterName: 'Starter',
      planStarterPrice: '$9 USD/mes',
      planStarterDesc: 'Para traders que quieren llevar un journal serio',
      planStarterFeatures: ['2 cuentas de trading', 'Registro manual ilimitado', 'Dashboard básico', 'Export CSV'],
      planStarterCtaLabel: 'Actualizar a Starter',
      planProName: 'Professional',
      planProPrice: '$29 USD/mes',
      planProDesc: 'Todo lo que necesitas para ser rentable',
      planProFeatures: ['Cuentas ilimitadas', 'Import CSV automático', 'Dashboard analítico completo', 'Trading Plan en PDF'],
      planProCtaLabel: 'Actualizar a Professional',
      planMaxName: 'ZenMode',
      planMaxPrice: '$59 USD/mes',
      planMaxDesc: 'El máximo nivel con IA y automatización',
      planMaxFeatures: ['Todo en Professional +', 'Detección de revenge trading', 'Reportes semanales por email', 'Coaching 1-a-1 mensual'],
      planMaxCtaLabel: 'Próximamente',
      upgradePlan: 'Actualizar plan',
      session: 'Sesión activa',
      signOut: 'Cerrar sesión',
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

    // ── Landing page ─────────────────────────────────────────
    landing: {
      // navbar
      features: 'Características',
      pricing: 'Precios',
      faq: 'FAQ',
      signIn: 'Iniciar Sesión',
      tryFree: 'Probar Gratis',
      goToDashboard: 'Ir al Dashboard',
      // cta buttons
      ctaPrimary: 'Comenzar Gratis',
      ctaSecondary: 'Crear Cuenta Gratis',
      // hero
      heroBadge: 'Confiado por Traders Profesionales',
      heroHeadline1: 'De Trader Amateur',
      heroHeadline2: 'A Profesional Financiado',
      heroSubPrefix: 'El trading journal diseñado para ',
      heroSubHighlight: 'pasar evaluaciones de prop firms',
      heroSubSuffix: ' y escalar tu capital. Dashboard analítico, multi-cuenta y export profesional.',
      heroProof1: 'FTMO Ready',
      heroProof2: 'Multi-Cuenta',
      heroProof3: 'Métricas Reales',
      heroProof4: 'Export PDF',
      heroSeePlans: 'Ver Planes',
      heroStat1Label: 'Mejora en Consistency',
      heroStat2Label: 'Faster Prop Firm Pass',
      // problem section
      problemTitle: '¿Por Qué Fallamos en el Trading?',
      problemSubtitle: 'Sin métricas claras y estructura profesional, el 90% de traders repite los mismos errores sin aprender de su historial.',
      problemEmphasis: 'El problema no es tu estrategia. Es la falta de datos objetivos.',
      problemPoints: [
        { title: 'Trading a Ciegas', description: 'Sin métricas reales, cada trade es una apuesta. No sabes si tu estrategia funciona o estás teniendo suerte.' },
        { title: 'Desorganización Costosa', description: 'Cuentas mezcladas, datos perdidos en hojas de cálculo. Oportunidades de mejora desperdiciadas por falta de orden.' },
        { title: 'Sin Mejora Continua', description: 'Repites los mismos errores sin aprender de tu historial. Tu curva de aprendizaje se estanca sin feedback estructurado.' },
      ],
      // solution section
      solutionTitle1: 'La Solución Profesional',
      solutionTitle2: 'Que Buscabas',
      solutionSubtitle: 'ZenTrade centraliza tu actividad de trading en un dashboard analítico que te muestra exactamente dónde estás ganando y dónde estás perdiendo dinero.',
      solutionItems: [
        'Tracking automático de todas tus operaciones',
        'Dashboard analítico con KPIs profesionales',
        'Gestión multi-cuenta para prop firms',
        'Trading plan digital con export PDF',
      ],
      solutionTestimonial: '"Pasé de fallar FTMO 3 veces a obtener mi primera funded account en 6 semanas usando ZenTrade."',
      solutionTestimonialAuthor: '— Carlos M., Futures Trader',
      // features section
      featuresTitle1: 'Todo Lo Que Necesitas Para',
      featuresTitle2: 'Trading Profesional',
      featuresSubtitle: 'Herramientas diseñadas específicamente para traders que buscan pasar evaluaciones de prop firms y escalar su capital.',
      featuresBottomTitle: 'Integración Completa Con Tu Flujo de Trabajo',
      featuresBottomSubtitle: 'Compatible con NinjaTrader, MT5, TradingView, cTrader y más',
      featuresList: [
        { title: 'Journal Multi-Cuenta', description: 'Gestiona FTMO, prop firms y cuentas personales por separado. Mantén el tracking perfecto de cada evaluación.' },
        { title: 'Dashboard Analítico', description: 'KPIs en tiempo real: win rate, profit factor, consistencia y drawdown. Datos que impulsan decisiones.' },
        { title: 'Import CSV Inteligente', description: 'Carga trades desde NinjaTrader, MT5, TradingView y más. Sincronización automática de tus operaciones.' },
        { title: 'Trading Plan Digital', description: 'Define reglas, límites de riesgo y estrategias. Exporta tu plan en PDF profesional para prop firms.' },
        { title: 'Reportes Exportables', description: 'Genera reportes completos con métricas clave. Documentación lista para evaluaciones de prop firms.' },
      ],
      // benefits section
      benefitsTitle1: 'Resultados Concretos,',
      benefitsTitle2: 'No Promesas Vacías',
      benefitsSubtitle: 'ZenTrade no es solo un journal. Es tu sistema de mejora continua para alcanzar la consistencia que las prop firms buscan.',
      benefitsList: [
        { title: 'Control Emocional', description: 'Decisiones basadas en datos objetivos, no en emociones del momento. Elimina el trading impulsivo.' },
        { title: 'Métricas Reales', description: 'Conoce tu edge real en el mercado. Identifica qué funciona y qué no en tu estrategia.' },
        { title: 'Escalabilidad', description: 'Pasa de 5K a 200K con estructura profesional. Gestiona múltiples cuentas sin perder control.' },
        { title: 'Profesionalización', description: 'Documentación completa para prop firms. Reportes que demuestran tu consistencia y disciplina.' },
      ],
      benefitsReview1: '"Antes perdía el tracking de mis trades entre diferentes cuentas. Con ZenTrade veo todo centralizado y finalmente identifiqué mi edge real."',
      benefitsReview1Author: 'Alejandro M.',
      benefitsReview1Role: 'Forex Day Trader',
      benefitsReview2: '"El export PDF me salvó en mi evaluación de FTMO. Presenté métricas 100% profesionales y pasé a la primera."',
      benefitsReview2Author: 'Laura R.',
      benefitsReview2Role: 'Futures Trader',
      // pricing section
      pricingBadge: 'Precios Transparentes',
      pricingTitle1: 'Un Plan Para',
      pricingTitle2: 'Cada Trader',
      pricingSubtitle: 'Sin sorpresas. Sin contratos de larga duración. Cancela cuando quieras. Todos los planes incluyen prueba gratis por 14 días.',
      pricingBillingMonthly: 'Facturación mensual • Cancela cuando quieras',
      pricingBillingAnnual: 'Facturado anualmente • Cancela cuando quieras',
      pricingToggleMonthly: 'Mensual',
      pricingToggleAnnual: 'Anual',
      pricingAnnualBadge: 'Ahorra hasta 28%',
      pricingAnnualNote: '/mes · facturado anualmente',
      pricingAnnualSaveLabel: 'Ahorras',
      pricingAnnualSaveYear: '/año',
      // backward compat (no borrar — usado en upgrade-prompt)
      pricingBilling: 'Facturación mensual • Cancela cuando quieras',
      pricingFaqTitle: '¿Preguntas sobre los planes?',
      pricingFaq: [
        { title: '¿Puedo cambiar de plan?', description: 'Sí, actualiza o cambia de plan en cualquier momento. Los cambios se aplican en tu próximo ciclo de facturación.' },
        { title: '¿Hay período de prueba?', description: '14 días gratis en todos los planes. Sin tarjeta de crédito requerida.' },
        { title: '¿Qué incluye la prueba gratis?', description: 'Acceso completo a Professional. Perfecto para probar todas las funcionalidades.' },
        { title: '¿Cómo funciona la IA en ZenMode?', description: 'Analiza tus patrones de trading y te alerta sobre errores recurrentes, revenge trading y oportunidades de mejora.' },
      ],
      pricingGuarantee: 'Garantía de Satisfacción',
      pricingGuaranteeDesc: 'Si no te convence en los primeros 7 días, te devolvemos el 100% de tu dinero. Sin preguntas.',
      pricingTiers: [
        {
          name: 'ZenMode', price: 59, priceAnnual: 42, saveAnnual: 209, period: 'USD/mes',
          description: 'El AI que te protege de ti mismo durante evaluaciones',
          badge: 'Próximamente',
          comingSoon: true,
          features: ['Todo en Professional +', 'Detección de revenge trading en tiempo real (IA)', 'Alertas de reglas de riesgo (daily loss, position size)', 'Reporte semanal automático por email', 'Análisis de horario óptimo de trading (IA)', 'Benchmark vs. requisitos de prop firms', 'Coaching 1-a-1 mensual (30 min)', 'Soporte dedicado 24/7'],
          cta: 'Próximamente',
        },
        {
          name: 'Professional', price: 29, priceAnnual: 21, saveAnnual: 99, period: 'USD/mes',
          description: 'Todo lo que necesitas para ser rentable y consistente',
          badge: 'Lo Más Popular',
          features: ['Cuentas ilimitadas (Apex, TopStep, Uprofit, Tradoverse, Personal)', 'Import CSV automático (Rithmic, NinjaTrader, Tradoverse)', 'Dashboard analítico completo con todos los KPIs', 'Trading Plan digital exportable en PDF', 'Calendario con notas emocionales y tags de setup', 'Filtros avanzados por instrumento, sesión, setup', 'Profit factor, consistency score y equity curve', 'Export CSV/PDF/Excel ilimitado', 'Soporte prioritario'],
          cta: 'Probar Gratis 14 Días',
          highlight: true,
        },
        {
          name: 'Starter', price: 9, priceAnnual: 7, saveAnnual: 22, period: 'USD/mes',
          description: 'Perfecto para comenzar tu journal de trading',
          badge: 'Ideal para Empezar',
          features: ['2 Cuentas de Trading', 'Registro manual de trades (ilimitado)', 'Dashboard básico: Win Rate, PnL, Drawdown', 'Calendario de trades', 'Export CSV', 'Soporte por email'],
          cta: 'Comenzar Ahora',
        },
      ],
      // FAQ section
      faqBadge: 'Preguntas Frecuentes',
      faqTitle1: 'Todo Lo Que Necesitas',
      faqTitle2: 'Saber',
      faqSubtitle: 'Si tienes más preguntas, escríbenos a soporte@zen-trader.com y te respondemos en menos de 24 horas.',
      faqContact: '¿Otra pregunta? Escríbenos a soporte@zen-trader.com',
      faqItems: [
        {
          q: '¿Necesito tarjeta de crédito para la prueba gratis?',
          a: 'No. Los 14 días de prueba son completamente gratis sin necesidad de ingresar datos de pago. Solo creas tu cuenta y empiezas.',
        },
        {
          q: '¿Con qué plataformas de trading es compatible ZenTrade?',
          a: 'Compatible con NinjaTrader, Rithmic, MT5, TradingView y Tradoverse mediante importación de archivos CSV. También puedes registrar cualquier operación de forma manual.',
        },
        {
          q: '¿Es útil para evaluaciones de prop firms como FTMO o Apex Trader?',
          a: 'Sí, ZenTrade fue diseñado pensando en traders de evaluación. Incluye métricas clave como drawdown máximo, consistency score y profit factor que las prop firms utilizan para evaluarte.',
        },
        {
          q: '¿Puedo cancelar mi suscripción en cualquier momento?',
          a: 'Sí, sin compromisos ni penalizaciones. Cancelas desde tu portal de facturación en cualquier momento y conservas el acceso hasta el final del período pagado.',
        },
        {
          q: '¿Mis datos de trading son privados y seguros?',
          a: 'Completamente. Utilizamos Row Level Security (RLS) en base de datos, lo que garantiza que cada usuario solo puede ver sus propios datos. Nadie más puede acceder a tu información.',
        },
        {
          q: '¿Cómo se procesan los pagos?',
          a: 'A través de Lemon Squeezy, quien actúa como Merchant of Record y gestiona toda la facturación de forma segura. Aceptamos las principales tarjetas de crédito y débito. ZenTrade no almacena datos de tarjeta.',
        },
        {
          q: '¿Puedo usar ZenTrade desde cualquier dispositivo?',
          a: 'Sí. ZenTrade es una aplicación web que funciona en cualquier navegador moderno — computadora, tablet o móvil. Sin descargas, sin instalaciones.',
        },
      ],
      // final CTA section
      ctaSection1: '¿Listo Para Pasar Tu',
      ctaSection2: 'Próxima Evaluación?',
      ctaSectionSubtitle: 'Únete a cientos de traders que ya usan ZenTrade para profesionalizar su trading y obtener funded accounts.',
      ctaSectionPoints: [
        'Setup en menos de 2 minutos',
        'Import CSV automático incluido',
        'Exporta tu trading plan profesional',
        'Cancela cuando quieras, sin compromisos',
      ],
      ctaTrust1: 'Free Trial Disponible',
      ctaTrust2: 'Sin Tarjeta de Crédito',
      ctaTrust3: 'Setup Instantáneo',
      // footer
      footerTagline: 'El trading journal más profesional para pasar evaluaciones de prop firms.',
      footerProduct: 'Producto',
      footerResources: 'Recursos',
      footerLegal: 'Legal',
      footerLinkFeatures: 'Características',
      footerLinkPricing: 'Precios',
      footerLinkDashboard: 'Dashboard',
      footerLinkBlog: 'Blog',
      footerLinkDocs: 'Documentación',
      footerLinkRoadmap: 'Roadmap',
      footerLinkPrivacy: 'Privacidad',
      footerLinkTerms: 'Términos',
      footerLinkContact: 'Contacto',
      footerLinkRefunds: 'Reembolsos',
      footerLinkCookies: 'Cookies',
      footerLinkDisclaimer: 'Aviso Legal',
      footerCopyright: 'Todos los derechos reservados.',
    },

    // ── Legal pages ──────────────────────────────────────────
    legal: {
      lastUpdated: 'Última actualización',
      backHome: 'Volver al inicio',
      terms: {
        title: 'Términos de Servicio',
        date: '1 de marzo de 2026',
        subtitle: 'Por favor lee estos términos cuidadosamente antes de usar ZenTrade. Al acceder al Servicio, confirmas que los has leído y aceptas quedar vinculado por ellos.',
        sections: [
          {
            heading: '1. Aceptación de los Términos',
            body: [
              'Al acceder y utilizar ZenTrade ("el Servicio"), aceptas quedar vinculado por estos Términos de Servicio. Si no estás de acuerdo con alguna parte de estos términos, no podrás acceder al Servicio.',
              'Debes tener al menos 18 años de edad para usar ZenTrade. Al crear una cuenta, declaras que cumples con este requisito de edad.',
            ],
          },
          {
            heading: '2. Descripción del Servicio',
            body: [
              'ZenTrade es una plataforma web de journal de trading que permite a los usuarios registrar operaciones, analizar métricas de rendimiento y generar reportes. ZenTrade es exclusivamente una herramienta de organización y análisis; no constituye asesoría financiera de ningún tipo.',
              'Nos reservamos el derecho de modificar, suspender o descontinuar cualquier parte del Servicio en cualquier momento con previo aviso razonable.',
            ],
          },
          {
            heading: '3. Uso Aceptable',
            body: [
              'Te comprometes a usar el Servicio únicamente para fines lícitos y de conformidad con estos Términos.',
              'Está prohibido: (a) compartir credenciales de acceso con terceros; (b) intentar acceder a datos de otros usuarios; (c) realizar ingeniería inversa del software; (d) usar el Servicio para actividades fraudulentas o ilegales; (e) sobrecargar o interferir con la infraestructura del Servicio.',
            ],
          },
          {
            heading: '4. Suscripciones y Pagos',
            body: [
              'Los planes de pago se facturan según el ciclo elegido (mensual o anual) y se renuevan automáticamente hasta que se cancelen. Los pagos son procesados por Lemon Squeezy, LLC, quien actúa como Merchant of Record en todas las transacciones.',
              'Nos reservamos el derecho de modificar los precios con un aviso previo de al menos 30 días por email. El precio vigente en el momento de la renovación se aplicará al siguiente ciclo de facturación.',
            ],
          },
          {
            heading: '5. Cancelación',
            body: [
              'Puedes cancelar tu suscripción en cualquier momento desde el portal de facturación de tu cuenta. Tras la cancelación, conservarás acceso completo al plan de pago hasta el final del período de facturación vigente.',
              'ZenTrade se reserva el derecho de cancelar o suspender cuentas que violen estos Términos de Servicio sin previo aviso.',
            ],
          },
          {
            heading: '6. Propiedad Intelectual',
            body: [
              'Todo el contenido, diseño, código, marcas y logotipos de ZenTrade son propiedad exclusiva de sus creadores y están protegidos por leyes de propiedad intelectual. No se otorga ninguna licencia para reproducir, distribuir o crear obras derivadas sin autorización expresa por escrito.',
              'El usuario conserva todos los derechos sobre los datos de trading que introduce en la plataforma.',
            ],
          },
          {
            heading: '7. Limitación de Responsabilidad',
            body: [
              'ZenTrade se proporciona "tal cual" y "según disponibilidad" sin garantías de ningún tipo. No garantizamos que el Servicio sea ininterrumpido o libre de errores.',
              'En ningún caso ZenTrade será responsable por: pérdidas de trading o decisiones de inversión tomadas con base en el Servicio, pérdida de datos, interrupción del negocio, o cualquier daño indirecto o consecuente derivado del uso o la imposibilidad de uso del Servicio.',
            ],
          },
          {
            heading: '8. Modificaciones y Contacto',
            body: [
              'Nos reservamos el derecho de modificar estos Términos en cualquier momento. Los cambios materiales se notificarán por email con al menos 15 días de anticipación. El uso continuado del Servicio tras la notificación implica aceptación de los nuevos términos.',
              'Para consultas sobre estos Términos de Servicio: soporte@zen-trader.com',
            ],
          },
        ],
      },
      privacy: {
        title: 'Política de Privacidad',
        date: '1 de marzo de 2026',
        subtitle: 'En ZenTrade nos comprometemos a proteger tu privacidad. Esta política explica qué datos recopilamos, cómo los usamos y cuáles son tus derechos conforme al GDPR y leyes aplicables.',
        sections: [
          {
            heading: '1. Responsable del Tratamiento',
            body: [
              'ZenTrade ("nosotros", "nuestro") es el responsable del tratamiento de tus datos personales. Para cualquier consulta relacionada con privacidad, contáctanos en: soporte@zen-trader.com',
            ],
          },
          {
            heading: '2. Datos que Recopilamos',
            body: [
              'Datos de cuenta: nombre, dirección de email y contraseña (almacenada de forma hasheada; nunca guardamos contraseñas en texto plano).',
              'Datos de trading: registros de operaciones, métricas, notas de journal y configuraciones de cuentas que introduces voluntariamente en la plataforma.',
              'Datos de facturación: gestionados directamente por Lemon Squeezy. ZenTrade no almacena datos de tarjetas de crédito ni información bancaria.',
              'Datos técnicos: dirección IP, tipo de navegador, sistema operativo y logs de acceso, recopilados automáticamente para seguridad y diagnóstico.',
            ],
          },
          {
            heading: '3. Cómo Usamos tus Datos',
            body: [
              'Utilizamos tus datos para: proporcionar y mantener el Servicio; gestionar tu cuenta y suscripción; enviarte comunicaciones transaccionales (confirmaciones de pago, avisos de cuenta, soporte); mejorar la plataforma y corregir errores; y cumplir con obligaciones legales y regulatorias.',
              'No vendemos tus datos personales a terceros ni los usamos para publicidad de terceros.',
            ],
          },
          {
            heading: '4. Servicios de Terceros',
            body: [
              'Supabase (supabase.com): proveedor de base de datos y autenticación. Tus datos se almacenan en servidores de Supabase. Consulta su política de privacidad en supabase.com/privacy.',
              'Lemon Squeezy (lemonsqueezy.com): procesamiento de pagos y gestión de suscripciones como Merchant of Record. Gestionan de forma independiente los datos de pago. Consulta su política en lemonsqueezy.com/privacy.',
              'Resend (resend.com): servicio de envío de emails transaccionales. Reciben únicamente tu dirección de email y el contenido de los mensajes que te enviamos. Consulta su política en resend.com/privacy.',
              'Vercel (vercel.com): infraestructura de hosting y despliegue de la aplicación. Pueden procesar logs de acceso y métricas de rendimiento. Consulta su política en vercel.com/legal/privacy-policy.',
            ],
          },
          {
            heading: '5. Conservación de Datos',
            body: [
              'Conservamos tus datos personales mientras tu cuenta esté activa. Si eliminas tu cuenta, tus datos se borran permanentemente en un plazo máximo de 30 días, salvo que la ley requiera una retención mayor por razones fiscales o legales.',
            ],
          },
          {
            heading: '6. Tus Derechos (GDPR)',
            body: [
              'Si eres residente del Espacio Económico Europeo, tienes derecho a: Acceso (obtener una copia de tus datos); Rectificación (corregir datos inexactos); Supresión ("derecho al olvido"); Portabilidad (recibir tus datos en formato estructurado); Oposición (oponerte al tratamiento por interés legítimo); Restricción del tratamiento en ciertas circunstancias.',
              'Para ejercer cualquiera de estos derechos, escríbenos a soporte@zen-trader.com. Tienes también el derecho de presentar una reclamación ante la autoridad de protección de datos de tu país.',
            ],
          },
          {
            heading: '7. Seguridad de Datos',
            body: [
              'Implementamos medidas técnicas y organizativas para proteger tus datos: cifrado en tránsito (HTTPS/TLS), autenticación segura, y Row Level Security (RLS) en base de datos para garantizar que cada usuario solo pueda acceder a sus propios datos.',
              'Sin embargo, ningún sistema de transmisión o almacenamiento de datos es 100% seguro. En caso de una brecha de seguridad que afecte a tus datos, te notificaremos en el plazo que exija la ley aplicable.',
            ],
          },
          {
            heading: '8. Cambios y Contacto',
            body: [
              'Notificaremos cualquier cambio significativo a esta política por email con al menos 15 días de anticipación. El uso continuado del Servicio tras la notificación implica aceptación de la política actualizada.',
              'Para consultas sobre privacidad: soporte@zen-trader.com',
            ],
          },
        ],
      },
      refunds: {
        title: 'Política de Reembolsos',
        date: '1 de marzo de 2026',
        subtitle: 'Esta política explica nuestro enfoque de reembolsos de forma transparente.',
        sections: [
          {
            heading: '1. Lemon Squeezy como Merchant of Record',
            body: [
              'Todos los pagos realizados en ZenTrade son procesados por Lemon Squeezy, LLC ("Lemon Squeezy"), quien actúa como Merchant of Record en todas las transacciones. Esto significa que Lemon Squeezy es el vendedor legal, gestiona la facturación, la recaudación de impuestos aplicables y el cumplimiento de normativas de pago.',
              'Al completar una compra, recibirás una factura emitida por Lemon Squeezy. Para consultas técnicas sobre pagos, puedes contactar también a Lemon Squeezy directamente a través de su sitio web.',
            ],
          },
          {
            heading: '2. Política General de No Reembolso',
            body: [
              'Dado que ZenTrade ofrece acceso inmediato a una plataforma digital con un período de prueba gratuita disponible, no ofrecemos reembolsos por suscripciones ya iniciadas.',
              'Al completar tu suscripción, confirmas que has tenido la oportunidad de evaluar el Servicio durante el período de prueba gratuita y que aceptas los términos de esta política de reembolsos.',
            ],
          },
          {
            heading: '3. Excepciones',
            body: [
              'Evaluaremos solicitudes de reembolso en los siguientes casos excepcionales: (a) cobro duplicado verificable por error técnico de nuestra parte; (b) interrupción del servicio de más de 72 horas consecutivas atribuible exclusivamente a ZenTrade; (c) primer cargo a un nuevo suscriptor dentro de las 24 horas, sin uso registrado de funciones premium.',
              'Para solicitar un reembolso por excepción, escríbenos a soporte@zen-trader.com con el asunto "Solicitud de Reembolso" e incluye tu comprobante de pago. Respondemos en menos de 48 horas hábiles.',
            ],
          },
          {
            heading: '4. Cancelación de Suscripción',
            body: [
              'Puedes cancelar tu suscripción en cualquier momento desde el portal de facturación de tu cuenta. La cancelación es efectiva inmediatamente: no se realizarán cobros futuros.',
              'No se realizan reembolsos proporcionales por el tiempo restante del período de facturación ya pagado. Conservarás acceso completo al plan de pago hasta el final de ese período.',
            ],
          },
          {
            heading: '5. Disputas de Cargos',
            body: [
              'Antes de iniciar una disputa de cargo (chargeback) con tu institución bancaria, te pedimos que nos contactes directamente. Respondemos el 100% de los casos en menos de 48 horas hábiles y resolvemos los casos legítimos sin necesidad de procesos bancarios.',
              'Los chargebacks iniciados sin contacto previo con nuestro soporte pueden resultar en la suspensión inmediata de la cuenta. Soporte de pagos: soporte@zen-trader.com',
            ],
          },
        ],
      },
      cookies: {
        title: 'Política de Cookies',
        date: '1 de marzo de 2026',
        subtitle: 'Esta política explica cómo ZenTrade usa cookies y tecnologías similares para el funcionamiento del Servicio.',
        sections: [
          {
            heading: '1. ¿Qué Son las Cookies?',
            body: [
              'Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo (computadora, tablet o móvil) cuando visitas un sitio web. Permiten al sitio recordar tus preferencias y mantener tu sesión activa entre visitas.',
            ],
          },
          {
            heading: '2. Cookies Esenciales',
            body: [
              'Estas cookies son estrictamente necesarias para el funcionamiento del Servicio. Sin ellas, ZenTrade no puede funcionar correctamente y no se pueden desactivar.',
              'Incluyen: cookie de sesión de autenticación (te mantiene conectado a tu cuenta), token de seguridad CSRF (previene ataques de falsificación de solicitudes), y preferencias de interfaz (tema oscuro/claro e idioma seleccionado).',
            ],
          },
          {
            heading: '3. Cookies de Análisis y Rendimiento',
            body: [
              'Vercel Analytics puede recopilar datos anónimos y agregados sobre el rendimiento del sitio (tiempos de carga, tasas de error, páginas visitadas) para ayudarnos a mejorar el Servicio. Estos datos no incluyen información personal identificable.',
            ],
          },
          {
            heading: '4. Lo Que No Hacemos',
            body: [
              'ZenTrade no utiliza cookies de publicidad comportamental ni de retargeting. No rastreamos tu actividad en otros sitios web. No compartimos datos de cookies con redes publicitarias. No usamos cookies de seguimiento de redes sociales.',
            ],
          },
          {
            heading: '5. Control de Cookies',
            body: [
              'Puedes configurar tu navegador para rechazar algunas o todas las cookies. Ten en cuenta que deshabilitar las cookies esenciales impedirá el correcto funcionamiento de ZenTrade, incluyendo el inicio de sesión.',
              'Instrucciones para los navegadores más comunes: Chrome (chrome://settings/cookies), Firefox (Menú → Configuración → Privacidad), Safari (Preferencias → Privacidad), Edge (Configuración → Cookies y permisos del sitio).',
            ],
          },
          {
            heading: '6. Contacto',
            body: [
              'Para cualquier consulta sobre nuestra política de cookies: soporte@zen-trader.com',
            ],
          },
        ],
      },
      disclaimer: {
        title: 'Aviso Legal — No Asesoría Financiera',
        date: '1 de marzo de 2026',
        subtitle: 'Lee este aviso completo antes de usar ZenTrade. El trading conlleva riesgos financieros significativos.',
        warning: {
          title: 'IMPORTANTE: ZenTrade NO proporciona asesoría financiera.',
          body: 'Esta plataforma es exclusivamente una herramienta de software para el registro y análisis personal de operaciones de trading. Nada en ZenTrade constituye recomendación de inversión.',
        },
        sections: [
          {
            heading: '1. No Asesoría Financiera',
            body: [
              'ZenTrade es exclusivamente una herramienta de software para el registro, organización y análisis personal de operaciones de trading. NADA en esta plataforma —incluyendo métricas, gráficos, reportes, análisis de IA, sugerencias del sistema o cualquier otro contenido— constituye asesoría financiera, asesoría de inversión, asesoría legal o asesoría tributaria.',
              'No somos un asesor financiero registrado, agente de bolsa, ni gestora de inversiones bajo ninguna regulación financiera.',
            ],
          },
          {
            heading: '2. Solo para Propósitos Informativos y Organizativos',
            body: [
              'Toda la información presentada en ZenTrade tiene propósito puramente informativo y organizativo. Las métricas de rendimiento (win rate, profit factor, drawdown, etc.) reflejan únicamente el historial de trading que el usuario ha introducido en el sistema.',
              'Ningún contenido de ZenTrade debe interpretarse como una recomendación de compra, venta, tenencia o transacción de ningún instrumento financiero, criptomoneda, materia prima o cualquier otro activo.',
            ],
          },
          {
            heading: '3. Riesgo de Pérdida de Capital',
            body: [
              'El trading de futuros, forex, opciones, acciones, criptomonedas y otros instrumentos financieros conlleva un riesgo sustancial de pérdida y puede no ser apropiado para todos los inversores. Existe la posibilidad real de perder una cantidad igual o mayor al capital invertido.',
              'Solo debes operar con capital que puedas permitirte perder en su totalidad sin que afecte tu situación financiera personal o familiar.',
            ],
          },
          {
            heading: '4. Rendimiento Pasado No Garantiza Resultados Futuros',
            body: [
              'Las estadísticas, métricas y resultados históricos mostrados en ZenTrade se basan únicamente en el historial de trading registrado por el usuario. El rendimiento pasado no es indicativo ni garantía de resultados futuros.',
              'Los mercados financieros son inherentemente impredecibles e influenciados por factores macroeconómicos, geopolíticos y de liquidez que ninguna herramienta puede prever con certeza.',
            ],
          },
          {
            heading: '5. Responsabilidad Exclusiva del Usuario',
            body: [
              'El usuario es el único y exclusivo responsable de todas sus decisiones de trading. ZenTrade no asume ninguna responsabilidad por pérdidas financieras, daños económicos o cualquier consecuencia negativa derivada del uso de esta plataforma.',
              'Antes de comenzar a operar en los mercados financieros, considera consultar con un asesor financiero certificado y regulado en tu jurisdicción.',
            ],
          },
          {
            heading: '6. Cumplimiento Regulatorio',
            body: [
              'El usuario es responsable de asegurar que sus actividades de trading cumplan con todas las leyes, regulaciones y requisitos fiscales aplicables en su jurisdicción. ZenTrade no garantiza que el uso de la plataforma sea apropiado o legal en todas las jurisdicciones.',
              'Para consultas generales: soporte@zen-trader.com',
            ],
          },
        ],
      },
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
      profile: 'Profile',
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
      lastDays: (n: number) => `Last ${n} days`,
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
      loadSummariesError: 'Error loading summaries',
      saveNotesError: 'Error saving notes',
      connectionError: 'Connection error',
      noAccounts: 'No accounts yet',
      noAccountsDesc: 'Create an account to start recording your trading days.',
      retry: 'Retry',
    },

    // ── Profile page ─────────────────────────────────────────
    profile: {
      title: 'Profile',
      subtitle: 'Manage your personal information and preferences',
      memberSince: 'Member since',
      editProfile: 'Edit',
      saveChanges: 'Save changes',
      saveSuccess: 'Changes saved successfully',
      saveError: 'Error saving changes',
      fullName: 'Full name',
      timezone: 'Timezone',
      currency: 'Currency',
      membership: 'Membership',
      planCurrentBadge: 'Current',
      planLockedLabel: 'Locked',
      planComingSoon: 'Coming Soon',
      planUpgradePro: 'Upgrade to Pro',
      planFreeName: 'Free',
      planFreePrice: 'Free',
      planFreeDesc: 'To start your trading journal',
      planFreeFeatures: ['1 trading account', 'Manual trade logging', 'Basic dashboard', 'CSV export'],
      planFreeCtaLabel: 'Current plan',
      planStarterName: 'Starter',
      planStarterPrice: '$9 USD/mo',
      planStarterDesc: 'For traders who want a serious journal',
      planStarterFeatures: ['2 trading accounts', 'Unlimited manual logging', 'Basic dashboard', 'CSV export'],
      planStarterCtaLabel: 'Upgrade to Starter',
      planProName: 'Professional',
      planProPrice: '$29 USD/mo',
      planProDesc: 'Everything you need to be profitable',
      planProFeatures: ['Unlimited accounts', 'Auto CSV import', 'Full analytical dashboard', 'Trading Plan PDF export'],
      planProCtaLabel: 'Upgrade to Professional',
      planMaxName: 'ZenMode',
      planMaxPrice: '$59 USD/mo',
      planMaxDesc: 'The highest level with AI and automation',
      planMaxFeatures: ['Everything in Professional +', 'Revenge trading detection', 'Weekly email reports', 'Monthly 1-on-1 coaching'],
      planMaxCtaLabel: 'Coming Soon',
      upgradePlan: 'Upgrade plan',
      session: 'Active session',
      signOut: 'Sign out',
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

    // ── Landing page ─────────────────────────────────────────
    landing: {
      // navbar
      features: 'Features',
      pricing: 'Pricing',
      faq: 'FAQ',
      signIn: 'Sign In',
      tryFree: 'Try Free',
      goToDashboard: 'Go to Dashboard',
      // cta buttons
      ctaPrimary: 'Start Free',
      ctaSecondary: 'Create Free Account',
      // hero
      heroBadge: 'Trusted by Professional Traders',
      heroHeadline1: 'From Amateur Trader',
      heroHeadline2: 'To Funded Professional',
      heroSubPrefix: 'The trading journal designed to ',
      heroSubHighlight: 'pass prop firm evaluations',
      heroSubSuffix: ' and scale your capital. Analytical dashboard, multi-account and professional export.',
      heroProof1: 'FTMO Ready',
      heroProof2: 'Multi-Account',
      heroProof3: 'Real Metrics',
      heroProof4: 'Export PDF',
      heroSeePlans: 'See Plans',
      heroStat1Label: 'Consistency Improvement',
      heroStat2Label: 'Faster Prop Firm Pass',
      // problem section
      problemTitle: 'Why Do We Fail at Trading?',
      problemSubtitle: 'Without clear metrics and professional structure, 90% of traders repeat the same mistakes without learning from their history.',
      problemEmphasis: 'The problem is not your strategy. It is the lack of objective data.',
      problemPoints: [
        { title: 'Trading Blindly', description: 'Without real metrics, every trade is a guess. You do not know if your strategy works or if you are just getting lucky.' },
        { title: 'Costly Disorganization', description: 'Mixed accounts, data lost in spreadsheets. Improvement opportunities wasted due to lack of structure.' },
        { title: 'No Continuous Improvement', description: 'You repeat the same mistakes without learning from your history. Your learning curve stagnates without structured feedback.' },
      ],
      // solution section
      solutionTitle1: 'The Professional Solution',
      solutionTitle2: 'You Were Looking For',
      solutionSubtitle: 'ZenTrade centralizes your trading activity in an analytical dashboard that shows you exactly where you are winning and where you are losing money.',
      solutionItems: [
        'Automatic tracking of all your operations',
        'Analytical dashboard with professional KPIs',
        'Multi-account management for prop firms',
        'Digital trading plan with PDF export',
      ],
      solutionTestimonial: '"I went from failing FTMO 3 times to getting my first funded account in 6 weeks using ZenTrade."',
      solutionTestimonialAuthor: '— Carlos M., Futures Trader',
      // features section
      featuresTitle1: 'Everything You Need For',
      featuresTitle2: 'Professional Trading',
      featuresSubtitle: 'Tools specifically designed for traders looking to pass prop firm evaluations and scale their capital.',
      featuresBottomTitle: 'Full Integration With Your Workflow',
      featuresBottomSubtitle: 'Compatible with NinjaTrader, MT5, TradingView, cTrader and more',
      featuresList: [
        { title: 'Multi-Account Journal', description: 'Manage FTMO, prop firms and personal accounts separately. Keep perfect tracking of every evaluation.' },
        { title: 'Analytical Dashboard', description: 'Real-time KPIs: win rate, profit factor, consistency and drawdown. Data that drives decisions.' },
        { title: 'Smart CSV Import', description: 'Load trades from NinjaTrader, MT5, TradingView and more. Automatic synchronization of your operations.' },
        { title: 'Digital Trading Plan', description: 'Define rules, risk limits and strategies. Export your plan as a professional PDF for prop firms.' },
        { title: 'Exportable Reports', description: 'Generate complete reports with key metrics. Documentation ready for prop firm evaluations.' },
      ],
      // benefits section
      benefitsTitle1: 'Concrete Results,',
      benefitsTitle2: 'No Empty Promises',
      benefitsSubtitle: 'ZenTrade is not just a journal. It is your continuous improvement system to achieve the consistency prop firms are looking for.',
      benefitsList: [
        { title: 'Emotional Control', description: 'Decisions based on objective data, not in-the-moment emotions. Eliminate impulsive trading.' },
        { title: 'Real Metrics', description: 'Know your real edge in the market. Identify what works and what does not in your strategy.' },
        { title: 'Scalability', description: 'Go from 5K to 200K with professional structure. Manage multiple accounts without losing control.' },
        { title: 'Professionalization', description: 'Complete documentation for prop firms. Reports that demonstrate your consistency and discipline.' },
      ],
      benefitsReview1: '"Before I lost track of my trades across different accounts. With ZenTrade I see everything centralized and finally identified my real edge."',
      benefitsReview1Author: 'Alejandro M.',
      benefitsReview1Role: 'Forex Day Trader',
      benefitsReview2: '"The PDF export saved me in my FTMO evaluation. I presented 100% professional metrics and passed on the first try."',
      benefitsReview2Author: 'Laura R.',
      benefitsReview2Role: 'Futures Trader',
      // pricing section
      pricingBadge: 'Transparent Pricing',
      pricingTitle1: 'A Plan For',
      pricingTitle2: 'Every Trader',
      pricingSubtitle: 'No surprises. No long-term contracts. Cancel anytime. All plans include a 14-day free trial.',
      pricingBillingMonthly: 'Monthly billing • Cancel anytime',
      pricingBillingAnnual: 'Billed annually • Cancel anytime',
      pricingToggleMonthly: 'Monthly',
      pricingToggleAnnual: 'Annual',
      pricingAnnualBadge: 'Save up to 28%',
      pricingAnnualNote: '/mo · billed annually',
      pricingAnnualSaveLabel: 'Save',
      pricingAnnualSaveYear: '/year',
      // backward compat
      pricingBilling: 'Monthly billing • Cancel anytime',
      pricingFaqTitle: 'Questions about the plans?',
      pricingFaq: [
        { title: 'Can I change plans?', description: 'Yes, upgrade or downgrade at any time. Changes take effect on your next billing cycle.' },
        { title: 'Is there a trial period?', description: '14 days free on all plans. No credit card required.' },
        { title: 'What does the free trial include?', description: 'Full access to Professional. Perfect for testing all features.' },
        { title: 'How does the AI work in ZenMode?', description: 'It analyzes your trading patterns and alerts you about recurring mistakes, revenge trading and improvement opportunities.' },
      ],
      pricingGuarantee: 'Satisfaction Guarantee',
      pricingGuaranteeDesc: 'If you are not convinced in the first 7 days, we refund 100% of your money. No questions asked.',
      pricingTiers: [
        {
          name: 'ZenMode', price: 59, priceAnnual: 42, saveAnnual: 209, period: 'USD/mo',
          description: 'The AI that protects you from yourself during evaluations',
          badge: 'Coming Soon',
          comingSoon: true,
          features: ['Everything in Professional +', 'Real-time revenge trading detection (AI)', 'Risk rule alerts (daily loss, position size)', 'Automated weekly performance report by email', 'Optimal trading hours analysis (AI)', 'Benchmark vs. prop firm requirements', 'Monthly 1-on-1 coaching (30 min)', '24/7 dedicated support'],
          cta: 'Coming Soon',
        },
        {
          name: 'Professional', price: 29, priceAnnual: 21, saveAnnual: 99, period: 'USD/mo',
          description: 'Everything you need to be profitable and consistent',
          badge: 'Most Popular',
          features: ['Unlimited accounts (Apex, TopStep, Uprofit, Tradoverse, Personal)', 'Auto CSV import (Rithmic, NinjaTrader, Tradoverse)', 'Full analytical dashboard with all KPIs', 'Digital Trading Plan exportable as PDF', 'Calendar with emotional notes and setup tags', 'Advanced filters by instrument, session, setup', 'Profit factor, consistency score and equity curve', 'Unlimited CSV/PDF/Excel export', 'Priority support'],
          cta: 'Try Free 14 Days',
          highlight: true,
        },
        {
          name: 'Starter', price: 9, priceAnnual: 7, saveAnnual: 22, period: 'USD/mo',
          description: 'Perfect to start your trading journal',
          badge: 'Ideal to Start',
          features: ['2 Trading Accounts', 'Unlimited manual trade logging', 'Basic dashboard: Win Rate, PnL, Drawdown', 'Trade calendar', 'CSV export', 'Email support'],
          cta: 'Get Started',
        },
      ],
      // FAQ section
      faqBadge: 'Frequently Asked Questions',
      faqTitle1: 'Everything You Need',
      faqTitle2: 'To Know',
      faqSubtitle: 'If you have more questions, write to us at soporte@zen-trader.com and we will respond within 24 hours.',
      faqContact: 'Another question? Write to us at soporte@zen-trader.com',
      faqItems: [
        {
          q: 'Do I need a credit card for the free trial?',
          a: 'No. The 14-day trial is completely free with no payment information required. Just create your account and get started.',
        },
        {
          q: 'Which trading platforms is ZenTrade compatible with?',
          a: 'Compatible with NinjaTrader, Rithmic, MT5, TradingView and Tradoverse via CSV file import. You can also log any trade manually.',
        },
        {
          q: 'Is it useful for prop firm evaluations like FTMO or Apex Trader?',
          a: 'Yes, ZenTrade was designed with evaluation traders in mind. It includes key metrics like max drawdown, consistency score and profit factor that prop firms use to evaluate you.',
        },
        {
          q: 'Can I cancel my subscription at any time?',
          a: 'Yes, with no commitments or penalties. Cancel from your billing portal at any time and keep access until the end of your paid period.',
        },
        {
          q: 'Is my trading data private and secure?',
          a: 'Completely. We use Row Level Security (RLS) in the database, which guarantees that each user can only see their own data. No one else can access your information.',
        },
        {
          q: 'How are payments processed?',
          a: 'Through Lemon Squeezy, who acts as Merchant of Record and handles all billing securely. We accept major credit and debit cards. ZenTrade does not store card data.',
        },
        {
          q: 'Can I use ZenTrade from any device?',
          a: 'Yes. ZenTrade is a web app that works on any modern browser — computer, tablet or mobile. No downloads, no installations.',
        },
      ],
      // final CTA section
      ctaSection1: 'Ready to Pass Your',
      ctaSection2: 'Next Evaluation?',
      ctaSectionSubtitle: 'Join hundreds of traders already using ZenTrade to professionalize their trading and get funded accounts.',
      ctaSectionPoints: [
        'Setup in less than 2 minutes',
        'Automatic CSV import included',
        'Export your professional trading plan',
        'Cancel anytime, no commitments',
      ],
      ctaTrust1: 'Free Trial Available',
      ctaTrust2: 'No Credit Card',
      ctaTrust3: 'Instant Setup',
      // footer
      footerTagline: 'The most professional trading journal for passing prop firm evaluations.',
      footerProduct: 'Product',
      footerResources: 'Resources',
      footerLegal: 'Legal',
      footerLinkFeatures: 'Features',
      footerLinkPricing: 'Pricing',
      footerLinkDashboard: 'Dashboard',
      footerLinkBlog: 'Blog',
      footerLinkDocs: 'Documentation',
      footerLinkRoadmap: 'Roadmap',
      footerLinkPrivacy: 'Privacy',
      footerLinkTerms: 'Terms',
      footerLinkContact: 'Contact',
      footerLinkRefunds: 'Refunds',
      footerLinkCookies: 'Cookies',
      footerLinkDisclaimer: 'Legal Disclaimer',
      footerCopyright: 'All rights reserved.',
    },

    // ── Legal pages ──────────────────────────────────────────
    legal: {
      lastUpdated: 'Last updated',
      backHome: 'Back to Home',
      terms: {
        title: 'Terms of Service',
        date: 'March 1, 2026',
        subtitle: 'Please read these terms carefully before using ZenTrade. By accessing the Service, you confirm that you have read and agree to be bound by them.',
        sections: [
          {
            heading: '1. Acceptance of Terms',
            body: [
              'By accessing and using ZenTrade ("the Service"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the Service.',
              'You must be at least 18 years of age to use ZenTrade. By creating an account, you confirm that you meet this age requirement.',
            ],
          },
          {
            heading: '2. Description of Service',
            body: [
              'ZenTrade is a web-based trading journal platform that allows users to log trades, analyze performance metrics and generate reports. ZenTrade is exclusively an organization and analysis tool; it does not constitute financial advice of any kind.',
              'We reserve the right to modify, suspend or discontinue any part of the Service at any time with reasonable prior notice.',
            ],
          },
          {
            heading: '3. Acceptable Use',
            body: [
              'You agree to use the Service only for lawful purposes and in accordance with these Terms.',
              'The following is prohibited: (a) sharing login credentials with third parties; (b) attempting to access other users\' data; (c) reverse engineering the software; (d) using the Service for fraudulent or illegal activities; (e) overloading or interfering with the Service infrastructure.',
            ],
          },
          {
            heading: '4. Subscriptions and Payments',
            body: [
              'Paid plans are billed according to the chosen cycle (monthly or annual) and renew automatically until cancelled. Payments are processed by Lemon Squeezy, LLC, who acts as Merchant of Record for all transactions.',
              'We reserve the right to modify prices with at least 30 days prior email notice. The price in effect at the time of renewal will apply to the next billing cycle.',
            ],
          },
          {
            heading: '5. Cancellation',
            body: [
              'You may cancel your subscription at any time from your account\'s billing portal. After cancellation, you will retain full access to the paid plan until the end of the current billing period.',
              'ZenTrade reserves the right to cancel or suspend accounts that violate these Terms of Service without prior notice.',
            ],
          },
          {
            heading: '6. Intellectual Property',
            body: [
              'All content, design, code, trademarks and logos of ZenTrade are the exclusive property of their creators and are protected by intellectual property laws. No license is granted to reproduce, distribute or create derivative works without express written authorization.',
              'The user retains all rights to the trading data they input into the platform.',
            ],
          },
          {
            heading: '7. Limitation of Liability',
            body: [
              'ZenTrade is provided "as is" and "as available" without warranties of any kind. We do not guarantee that the Service will be uninterrupted or error-free.',
              'In no event shall ZenTrade be liable for: trading losses or investment decisions made based on the Service, data loss, business interruption, or any indirect or consequential damages arising from the use or inability to use the Service.',
            ],
          },
          {
            heading: '8. Changes and Contact',
            body: [
              'We reserve the right to modify these Terms at any time. Material changes will be notified by email with at least 15 days advance notice. Continued use of the Service after notification implies acceptance of the new terms.',
              'For inquiries about these Terms of Service: soporte@zen-trader.com',
            ],
          },
        ],
      },
      privacy: {
        title: 'Privacy Policy',
        date: 'March 1, 2026',
        subtitle: 'At ZenTrade we are committed to protecting your privacy. This policy explains what data we collect, how we use it and what your rights are under GDPR and applicable laws.',
        sections: [
          {
            heading: '1. Data Controller',
            body: [
              'ZenTrade ("we", "our") is the data controller for your personal data. For any privacy-related inquiries, contact us at: soporte@zen-trader.com',
            ],
          },
          {
            heading: '2. Data We Collect',
            body: [
              'Account data: name, email address and password (stored in hashed form; we never store passwords in plain text).',
              'Trading data: trade records, metrics, journal notes and account configurations you voluntarily enter into the platform.',
              'Billing data: managed directly by Lemon Squeezy. ZenTrade does not store credit card data or banking information.',
              'Technical data: IP address, browser type, operating system and access logs, collected automatically for security and diagnostics.',
            ],
          },
          {
            heading: '3. How We Use Your Data',
            body: [
              'We use your data to: provide and maintain the Service; manage your account and subscription; send transactional communications (payment confirmations, account notices, support); improve the platform and fix bugs; and comply with legal and regulatory obligations.',
              'We do not sell your personal data to third parties or use it for third-party advertising.',
            ],
          },
          {
            heading: '4. Third-Party Services',
            body: [
              'Supabase (supabase.com): database and authentication provider. Your data is stored on Supabase servers. See their privacy policy at supabase.com/privacy.',
              'Lemon Squeezy (lemonsqueezy.com): payment processing and subscription management as Merchant of Record. They independently manage payment data. See their policy at lemonsqueezy.com/privacy.',
              'Resend (resend.com): transactional email delivery service. They only receive your email address and the content of messages we send you. See their policy at resend.com/privacy.',
              'Vercel (vercel.com): application hosting and deployment infrastructure. They may process access logs and performance metrics. See their policy at vercel.com/legal/privacy-policy.',
            ],
          },
          {
            heading: '5. Data Retention',
            body: [
              'We retain your personal data while your account is active. If you delete your account, your data is permanently erased within a maximum of 30 days, unless the law requires longer retention for tax or legal reasons.',
            ],
          },
          {
            heading: '6. Your Rights (GDPR)',
            body: [
              'If you are a resident of the European Economic Area, you have the right to: Access (obtain a copy of your data); Rectification (correct inaccurate data); Erasure ("right to be forgotten"); Portability (receive your data in a structured format); Objection (object to processing based on legitimate interest); Restriction of processing in certain circumstances.',
              'To exercise any of these rights, write to us at soporte@zen-trader.com. You also have the right to file a complaint with the data protection authority in your country.',
            ],
          },
          {
            heading: '7. Data Security',
            body: [
              'We implement technical and organizational measures to protect your data: transit encryption (HTTPS/TLS), secure authentication, and Row Level Security (RLS) in the database to ensure each user can only access their own data.',
              'However, no data transmission or storage system is 100% secure. In the event of a security breach affecting your data, we will notify you within the timeframe required by applicable law.',
            ],
          },
          {
            heading: '8. Changes and Contact',
            body: [
              'We will notify any significant changes to this policy by email with at least 15 days advance notice. Continued use of the Service after notification implies acceptance of the updated policy.',
              'For privacy inquiries: soporte@zen-trader.com',
            ],
          },
        ],
      },
      refunds: {
        title: 'Refund Policy',
        date: 'March 1, 2026',
        subtitle: 'This policy explains our approach to refunds in a transparent manner.',
        sections: [
          {
            heading: '1. Lemon Squeezy as Merchant of Record',
            body: [
              'All payments made on ZenTrade are processed by Lemon Squeezy, LLC ("Lemon Squeezy"), who acts as Merchant of Record for all transactions. This means Lemon Squeezy is the legal seller, managing billing, applicable tax collection and payment compliance.',
              'Upon completing a purchase, you will receive an invoice issued by Lemon Squeezy. For technical payment inquiries, you may also contact Lemon Squeezy directly through their website.',
            ],
          },
          {
            heading: '2. General No-Refund Policy',
            body: [
              'Because ZenTrade provides immediate access to a digital platform with a free trial period available, we do not offer refunds for subscriptions that have already started.',
              'By completing your subscription, you confirm that you have had the opportunity to evaluate the Service during the free trial period and that you accept the terms of this refund policy.',
            ],
          },
          {
            heading: '3. Exceptions',
            body: [
              'We will evaluate refund requests in the following exceptional cases: (a) verifiable duplicate charge due to a technical error on our part; (b) service outage of more than 72 consecutive hours attributable solely to ZenTrade; (c) first charge to a new subscriber within 24 hours, with no recorded use of premium features.',
              'To request an exception refund, email us at soporte@zen-trader.com with the subject "Refund Request" and include your payment receipt. We respond within 48 business hours.',
            ],
          },
          {
            heading: '4. Subscription Cancellation',
            body: [
              'You may cancel your subscription at any time from your account\'s billing portal. Cancellation is immediate: no future charges will be made.',
              'No pro-rata refunds are issued for the remaining time of an already-paid billing period. You will retain full access to the paid plan until the end of that period.',
            ],
          },
          {
            heading: '5. Payment Disputes',
            body: [
              'Before initiating a chargeback with your bank, please contact us directly. We respond to 100% of cases within 48 business hours and resolve legitimate cases without the need for banking disputes.',
              'Chargebacks initiated without prior contact with our support may result in immediate account suspension. Payment support: soporte@zen-trader.com',
            ],
          },
        ],
      },
      cookies: {
        title: 'Cookie Policy',
        date: 'March 1, 2026',
        subtitle: 'This policy explains how ZenTrade uses cookies and similar technologies for the operation of the Service.',
        sections: [
          {
            heading: '1. What Are Cookies?',
            body: [
              'Cookies are small text files stored on your device (computer, tablet or mobile) when you visit a website. They allow the site to remember your preferences and keep your session active between visits.',
            ],
          },
          {
            heading: '2. Essential Cookies',
            body: [
              'These cookies are strictly necessary for the operation of the Service. Without them, ZenTrade cannot function correctly and they cannot be disabled.',
              'They include: authentication session cookie (keeps you logged in), CSRF security token (prevents request forgery attacks), and interface preferences (dark/light theme and selected language).',
            ],
          },
          {
            heading: '3. Analytics and Performance Cookies',
            body: [
              'Vercel Analytics may collect anonymous, aggregated data about site performance (load times, error rates, pages visited) to help us improve the Service. This data does not include personally identifiable information.',
            ],
          },
          {
            heading: '4. What We Do Not Do',
            body: [
              'ZenTrade does not use behavioral advertising or retargeting cookies. We do not track your activity on other websites. We do not share cookie data with ad networks. We do not use social media tracking cookies.',
            ],
          },
          {
            heading: '5. Cookie Control',
            body: [
              'You can configure your browser to reject some or all cookies. Note that disabling essential cookies will prevent ZenTrade from functioning correctly, including logging in.',
              'Instructions for common browsers: Chrome (chrome://settings/cookies), Firefox (Menu → Settings → Privacy), Safari (Preferences → Privacy), Edge (Settings → Cookies and site permissions).',
            ],
          },
          {
            heading: '6. Contact',
            body: [
              'For any inquiries about our cookie policy: soporte@zen-trader.com',
            ],
          },
        ],
      },
      disclaimer: {
        title: 'Legal Disclaimer — Not Financial Advice',
        date: 'March 1, 2026',
        subtitle: 'Read this disclaimer in full before using ZenTrade. Trading carries significant financial risks.',
        warning: {
          title: 'IMPORTANT: ZenTrade does NOT provide financial advice.',
          body: 'This platform is exclusively a software tool for personal trade logging and analysis. Nothing in ZenTrade constitutes an investment recommendation.',
        },
        sections: [
          {
            heading: '1. Not Financial Advice',
            body: [
              'ZenTrade is exclusively a software tool for the personal recording, organization and analysis of trading operations. NOTHING on this platform — including metrics, charts, reports, AI analysis, system suggestions or any other content — constitutes financial advice, investment advice, legal advice or tax advice.',
              'We are not a registered financial advisor, broker-dealer, or investment manager under any financial regulation.',
            ],
          },
          {
            heading: '2. For Informational and Organizational Purposes Only',
            body: [
              'All information presented in ZenTrade is for purely informational and organizational purposes. Performance metrics (win rate, profit factor, drawdown, etc.) reflect only the trading history the user has entered into the system.',
              'No content in ZenTrade should be interpreted as a recommendation to buy, sell, hold or transact in any financial instrument, cryptocurrency, commodity or any other asset.',
            ],
          },
          {
            heading: '3. Risk of Capital Loss',
            body: [
              'Trading futures, forex, options, stocks, cryptocurrencies and other financial instruments carries substantial risk of loss and may not be appropriate for all investors. There is a real possibility of losing an amount equal to or greater than the capital invested.',
              'You should only trade with capital that you can afford to lose entirely without affecting your personal or family financial situation.',
            ],
          },
          {
            heading: '4. Past Performance Does Not Guarantee Future Results',
            body: [
              'The statistics, metrics and historical results shown in ZenTrade are based solely on trading history recorded by the user. Past performance is not indicative or a guarantee of future results.',
              'Financial markets are inherently unpredictable and influenced by macroeconomic, geopolitical and liquidity factors that no tool can predict with certainty.',
            ],
          },
          {
            heading: '5. Sole Responsibility of the User',
            body: [
              'The user is the sole and exclusive responsible party for all trading decisions. ZenTrade assumes no responsibility for financial losses, economic damages or any negative consequences arising from the use of this platform.',
              'Before starting to trade in financial markets, consider consulting with a certified and regulated financial advisor in your jurisdiction.',
            ],
          },
          {
            heading: '6. Regulatory Compliance',
            body: [
              'The user is responsible for ensuring that their trading activities comply with all laws, regulations and tax requirements applicable in their jurisdiction. ZenTrade does not guarantee that use of the platform is appropriate or legal in all jurisdictions.',
              'For general inquiries: soporte@zen-trader.com',
            ],
          },
        ],
      },
    },
  },
} as const;

export type Translations = typeof translations.es;
export default translations;
