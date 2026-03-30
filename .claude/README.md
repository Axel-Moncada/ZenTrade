# .claude/ — Workspace de Claude para Zentrade

Todo lo relacionado con Claude Code vive aquí. Índice de lo que hay:

---

## 📁 Estructura

```
.claude/
├── README.md                        ← este archivo
├── settings.local.json              ← permisos y configuración local
│
├── agents/                          ← definiciones de agentes especializados
│   └── zentrade-marketing-strategist.md
│
├── skills/                          ← guías de referencia que Claude usa como contexto
│   └── zentrade-email-design.md     ← design system para emails (transaccionales + marketing)
│
├── marketing/                       ← estrategia y copy de marca
│   ├── MARKETING-ROADMAP.md         ← plan de 4 semanas pre-lanzamiento, tácticas por red social
│   └── ZENTRADE-SAAS-INFO.md        ← fuente de verdad: bios, taglines, propuesta de valor, SEO
│
├── testing/                         ← guías de pruebas manuales
│   ├── TESTING_GUIDE.md             ← journey completo de trading (trades → dashboard → métricas)
│   └── MANUAL_TESTS.md              ← checklist de pruebas generales de la app
│
└── agent-memory/
    └── zentrade-marketing-strategist/
        ├── MEMORY.md                ← memoria del agente de marketing
        ├── content-hooks.md         ← hooks y ángulos de contenido probados
        ├── positioning.md           ← posicionamiento de marca
        └── Marketing/               ← contenido generado listo para publicar
            ├── Campanas/            ← campañas específicas (expectativa, lanzamiento)
            ├── Estrategia/          ← content strategy semanal
            ├── Evergreen/           ← posts de valor permanente
            ├── Perfiles/            ← bios y portadas de redes sociales
            └── Semanas/             ← posts organizados por semana de publicación
                └── Semana-1-Lanzamiento/
```

---

## 📄 Archivos raíz del proyecto (fuera de .claude/)

| Archivo | Qué es |
|---------|--------|
| `CLAUDE.md` | Instrucciones obligatorias para Claude (reglas, stack, fases) |
| `ROADMAP.md` | Estado del producto, fases, decisiones técnicas, plan de lanzamiento |
| `README.md` | Descripción estándar del repo |
| `IDEAS.md` | Backlog libre de ideas y features futuros |

---

## 🔍 Cómo encontrar algo rápido

- **¿Qué debo publicar esta semana?** → `agent-memory/.../Marketing/Semanas/`
- **¿Cuál es el tagline oficial?** → `marketing/ZENTRADE-SAAS-INFO.md`
- **¿Cómo probar el flujo de trades?** → `testing/TESTING_GUIDE.md`
- **¿Cómo se diseña un email?** → `skills/zentrade-email-design.md`
- **¿En qué fase está el producto?** → `../ROADMAP.md`
