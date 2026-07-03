import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { shifts as allShifts } from "@/lib/mock-data";
import { ShiftCard } from "@/components/ShiftCard";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_app/calendar")({
  component: CalendarPage,
});

function CalendarPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const { weeks, monthLabel } = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startWeekday = firstDay.getDay(); // 0 Sun
    const cells: (number | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    const weeks: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    const monthLabel = firstDay.toLocaleString(undefined, { month: "long", year: "numeric" });
    return { weeks, monthLabel };
  }, [year, month]);

  const shiftsByDate = useMemo(() => {
    const map: Record<string, typeof allShifts> = {};
    for (const s of allShifts) {
      (map[s.date] ||= []).push(s);
    }
    return map;
  }, []);

  const dayKey = (d: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Calendar</h1>
        <p className="text-sm text-muted-foreground">{monthLabel}</p>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-7 border-b bg-muted text-xs font-medium">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="px-2 py-2 text-center">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {weeks.flat().map((day, i) => {
            const dayShifts = day ? (shiftsByDate[dayKey(day)] || []).slice(0, 3) : [];
            return (
              <div key={i} className="min-h-28 border-b border-r p-1 last:border-r-0">
                {day && (
                  <>
                    <div className="mb-1 text-xs text-muted-foreground">{day}</div>
                    <div className="space-y-1">
                      {dayShifts.map((s) => (
                        <ShiftCard key={s.id} shift={s} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
