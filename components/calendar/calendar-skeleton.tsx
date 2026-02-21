"use client";

export function CalendarSkeleton() {
  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const skeletonDays = Array.from({ length: 35 }, (_, i) => i);

  return (
    <div className="bg-zen-surface/60 backdrop-blur-sm rounded-xl border border-zen-forest/40 p-6 animate-pulse">
      {/* Headers días de la semana */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-bold text-zen-anti-flash/40 py-2.5 bg-zen-bangladesh-green/20 border border-zen-forest/30 rounded-md"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid de días skeleton */}
      <div className="grid grid-cols-7 gap-2">
        {skeletonDays.map((i) => (
          <div
            key={i}
            className="min-h-[120px] rounded-lg bg-zen-surface/40 border border-zen-forest/40 p-3"
          >
            <div className="space-y-2">
              <div className="h-4 w-6 bg-zen-forest/30 rounded"></div>
              <div className="h-3 w-16 bg-zen-forest/30 rounded"></div>
              <div className="h-3 w-12 bg-zen-forest/30 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
