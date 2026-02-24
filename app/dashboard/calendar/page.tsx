"use client";

import { useEffect, useState } from "react";
import { AccountSelector } from "@/components/accounts/account-selector";
import { CalendarHeader } from "@/components/calendar/calendar-header";
import { CalendarLegend } from "@/components/calendar/calendar-legend";
import { MonthlyCalendar } from "@/components/calendar/monthly-calendar";
import { DayModal } from "@/components/calendar/day-modal";
import { CalendarSkeleton } from "@/components/calendar/calendar-skeleton";
import type { Account } from "@/types/accounts";
import type { DailySummary } from "@/types/daily-summaries";
import {
  getCurrentMonthYear,
  getPreviousMonth,
  getNextMonth,
  formatDateToISO,
} from "@/lib/utils/date-helpers";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";

export default function CalendarPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t } = useI18n();

  // Estado del calendario
  const currentMonthYear = getCurrentMonthYear();
  const [year, setYear] = useState(currentMonthYear.year);
  const [month, setMonth] = useState(currentMonthYear.month);

  // Estado del modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSummary, setSelectedSummary] = useState<DailySummary | null>(null);

  // Fetch cuentas
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch("/api/accounts");
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || t.calendar.loadError);
          setLoading(false);
          return;
        }

        const accountsList = data.accounts || [];
        setAccounts(accountsList);

        // Seleccionar primera cuenta por defecto
        if (accountsList.length > 0) {
          setSelectedAccountId(accountsList[0].id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setError(t.calendar.connectionError);
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  // Fetch summaries cuando cambian cuenta, mes o año
  useEffect(() => {
    if (!selectedAccountId) {
      setLoading(false);
      return;
    }

    const fetchSummaries = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/daily-summaries?account_id=${selectedAccountId}&month=${
            month + 1
          }&year=${year}`
        );
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Error al cargar los resúmenes");
          setLoading(false);
          return;
        }

        setSummaries(data.summaries || []);
        setError("");
        setLoading(false);
      } catch (err) {
        setError(t.calendar.connectionError);
        setLoading(false);
      }
    };

    fetchSummaries();
  }, [selectedAccountId, month, year]);

  // Handlers de navegación
  const handlePreviousMonth = () => {
    const prev = getPreviousMonth(year, month);
    setYear(prev.year);
    setMonth(prev.month);
  };

  const handleNextMonth = () => {
    const next = getNextMonth(year, month);
    setYear(next.year);
    setMonth(next.month);
  };

  const handleToday = () => {
    const current = getCurrentMonthYear();
    setYear(current.year);
    setMonth(current.month);
  };

  // Handler de click en día
  const handleDayClick = (date: Date, summary: DailySummary | null) => {
    setSelectedDate(date);
    setSelectedSummary(summary);
    setModalOpen(true);
  };

  // Handler guardar notas
  const handleSaveNotes = async (notes: string) => {
    if (!selectedDate || !selectedAccountId) return;

    try {
      const dateString = formatDateToISO(selectedDate);
      const response = await fetch("/api/daily-summaries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_id: selectedAccountId,
          summary_date: dateString,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Error al guardar las notas");
        return;
      }

      // Actualizar summary en el estado
      setSummaries((prev) => {
        const existingIndex = prev.findIndex(
          (s) => s.summary_date === dateString
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = data.summary;
          return updated;
        } else {
          return [...prev, data.summary];
        }
      });

      setSelectedSummary(data.summary);
      setModalOpen(false);
    } catch (err) {
      alert("Error de conexión");
    }
  };

  // Handler para refrescar summary cuando cambian trades
  const handleSummaryUpdate = async () => {
    if (!selectedDate || !selectedAccountId) return;

    try {
      const dateString = formatDateToISO(selectedDate);
      const response = await fetch(
        `/api/daily-summaries?account_id=${selectedAccountId}&month=${
          month + 1
        }&year=${year}`
      );
      const data = await response.json();

      if (response.ok) {
        setSummaries(data.summaries || []);
        
        // Actualizar el summary seleccionado
        const updatedSummary = data.summaries?.find(
          (s: DailySummary) => s.summary_date === dateString
        );
        setSelectedSummary(updatedSummary || null);
      }
    } catch (err) {
      console.error("Error refreshing summaries:", err);
    }
  };

  // Loading state
  if (loading && accounts.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-zen-anti-flash">{t.calendar.title}</h1>
          <p className="text-zen-anti-flash/60 mt-2">{t.calendar.subtitle}</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-zen-anti-flash/60">{t.common.loading}</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && accounts.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-zen-anti-flash">{t.calendar.title}</h1>
          <p className="text-zen-anti-flash/60 mt-2">{t.calendar.subtitle}</p>
        </div>
        <div className="bg-zen-danger/10 border border-zen-danger/40 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-zen-danger mt-0.5" />
          <div>
            <h3 className="font-medium text-zen-danger">{t.common.error}</h3>
            <p className="text-zen-danger/80 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // No accounts state
  if (accounts.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-zen-anti-flash">{t.calendar.title}</h1>
          <p className="text-zen-anti-flash/60 mt-2">{t.calendar.subtitle}</p>
        </div>
        <div className="text-center py-12 bg-zen-surface/60 rounded-lg border border-zen-forest/40">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-medium text-zen-anti-flash mb-2">
              {t.calendar.noAccounts}
            </h3>
            <p className="text-zen-anti-flash/70 mb-6">{t.calendar.noAccountsDesc}</p>
            <Button onClick={() => (window.location.href = "/dashboard/accounts/new")} className="bg-zen-caribbean-green hover:bg-zen-mountain-meadow text-zen-rich-black">
              {t.accounts.createFirst}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zen-anti-flash mb-2">Calendario de Trading</h1>
        <p className="text-zen-anti-flash/60">
          Visualiza tu rendimiento diario y gestiona tus trades mes a mes
        </p>
      </div>

      {/* Navegación + Selector de cuenta en una fila */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <CalendarHeader
            year={year}
            month={month}
            onPreviousMonth={handlePreviousMonth}
            onNextMonth={handleNextMonth}
            onToday={handleToday}
          />
        </div>

        {/* Selector de cuenta */}
        <div className=" flex-1 bg-zen-surface/60 backdrop-blur-sm rounded-lg border border-zen-forest/40 px-4 py-3">
          <AccountSelector
            accounts={accounts}
            value={selectedAccountId}
            onValueChange={setSelectedAccountId}
            label="Cuenta"
            showLabel={false}
          />
        </div>
      </div>

      {/* Calendar Legend */}
      <CalendarLegend />

      {/* Calendar Grid */}
      <div>
        {loading ? (
          <CalendarSkeleton />
        ) : (
          <MonthlyCalendar
            year={year}
            month={month}
            summaries={summaries}
            onDayClick={handleDayClick}
          />
        )}
      </div>

      {/* Day Modal */}
      {selectedDate && (
        <DayModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          date={selectedDate}
          accountId={selectedAccountId}
          summary={selectedSummary}
          onSaveNotes={handleSaveNotes}
          onSummaryUpdate={handleSummaryUpdate}
        />
      )}
    </div>
  );
}
