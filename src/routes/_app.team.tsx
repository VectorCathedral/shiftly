import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, Info, LayoutList, Search, Sun } from "lucide-react";
import { fetchTeam, fetchEmployeeSchedule } from "@/lib/api";
import type { Employee, Shift } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/team")({
  component: TeamPage,
});

const AVATAR_TINTS = [
  "bg-chart-1/20 text-chart-1",
  "bg-chart-2/20 text-chart-2",
  "bg-chart-3/20 text-chart-3",
  "bg-chart-4/20 text-chart-4",
  "bg-chart-5/20 text-chart-5",
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function toMinutes(t: string) {
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  return h * 60 + (m || 0);
}

function duration(shift: Shift) {
  if (!shift.clock_in || !shift.clock_out) {
    return { mins: 0, label: "Off" };
  }

  let mins = toMinutes(shift.clock_out) - toMinutes(shift.clock_in);

  if (mins < 0) mins += 24 * 60;

  const h = Math.floor(mins / 60);
  const m = mins % 60;

  return {
    mins,
    label: m ? `${h}h ${m}m` : `${h}h`,
  };
}

function totalHoursLabel(shifts: Shift[]) {
  const mins = shifts.reduce((sum, s) => sum + duration(s).mins, 0);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function mondayOf(date: Date) {
  const d = new Date(date);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  d.setHours(0, 0, 0, 0);
  return d;
}

function fmt(d: Date, opts: Intl.DateTimeFormatOptions) {
  return d.toLocaleDateString(undefined, opts);
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function TeamPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"calendar" | "list">("calendar");

  useEffect(() => {
    async function loadTeam() {
      const team = await fetchTeam();
      setEmployees(team);
      if (team.length > 0) setSelected(team[0]);
    }
    loadTeam();
  }, []);

  useEffect(() => {
    if (!selected) return;
    const agentId = selected.agent_id;
    async function loadShifts() {
      const data = await fetchEmployeeSchedule(agentId);
      setShifts(data);
    }
    loadShifts();
  }, [selected]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        e.fullname.toLowerCase().includes(q) || e.email.toLowerCase().includes(q),
    );
  }, [employees, query]);

  // Group into full Mon–Sun weeks, including off days
  const weeks = useMemo(() => {
    if (shifts.length === 0) return [];

    const byDate = new Map<string, Shift>();
    shifts.forEach((s) => byDate.set(s.shift_date.slice(0, 10), s));

    const dates = shifts.map((s) => new Date(s.shift_date));
    const start = mondayOf(new Date(Math.min(...dates.map((d) => d.getTime()))));
    const lastMonday = mondayOf(
      new Date(Math.max(...dates.map((d) => d.getTime()))),
    );

    const result: { start: Date; end: Date; days: { date: Date; shift?: Shift }[] }[] =
      [];

    for (
      let cursor = new Date(start);
      cursor <= lastMonday;
      cursor.setDate(cursor.getDate() + 7)
    ) {
      const weekStart = new Date(cursor);
      const days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        return { date, shift: byDate.get(key) };
      });
      const end = new Date(weekStart);
      end.setDate(weekStart.getDate() + 6);
      result.push({ start: weekStart, end, days });
    }

    return result;
  }, [shifts]);

  const today = new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Team</h1>
        <p className="text-sm text-muted-foreground">
          Select a team member to see their shifts.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        {/* Employee list */}
        <Card className="h-fit p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search team member..."
              className="pl-9"
            />
          </div>

          <ul className="mt-3 space-y-1">
            {filtered.map((e, i) => (
              <li key={e.agent_id}>
                <button
                  onClick={() => setSelected(e)}
                  className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition hover:bg-accent ${
                    selected?.agent_id === e.agent_id
                      ? "border-l-2 border-l-primary border-border bg-accent"
                      : "border-transparent"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      AVATAR_TINTS[i % AVATAR_TINTS.length]
                    }`}
                  >
                    {initials(e.fullname)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {e.fullname}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {e.email}
                    </span>
                  </span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                No team members found.
              </li>
            )}
          </ul>
        </Card>

        {/* Schedule */}
        <div className="space-y-4">
          <Card className="flex flex-wrap items-center gap-6 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  AVATAR_TINTS[
                    Math.max(
                      0,
                      employees.findIndex((e) => e.agent_id === selected?.agent_id),
                    ) % AVATAR_TINTS.length
                  ]
                }`}
              >
                {selected ? initials(selected.fullname) : "–"}
              </span>
              <div className="min-w-0">
                <div className="truncate text-lg font-semibold">
                  {selected ? selected.fullname : "Select a team member"}
                </div>
                {selected && (
                  <div className="truncate text-sm text-muted-foreground">
                    {selected.email}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">Total Shifts</div>
                <div className="font-semibold text-primary">{shifts.length}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">Total Hours</div>
                <div className="font-semibold text-primary">
                  {totalHoursLabel(shifts)}
                </div>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button
                variant={view === "calendar" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setView("calendar")}
              >
                <CalendarDays className="h-4 w-4" />
                Calendar
              </Button>
              <Button
                variant={view === "list" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setView("list")}
              >
                <LayoutList className="h-4 w-4" />
                List
              </Button>
            </div>
          </Card>

          {weeks.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">
              No shifts found.
            </Card>
          ) : view === "calendar" ? (
            <>
              {weeks.map((week, index) => {
                const count = week.days.filter((d) => d.shift).length;
                return (
                  <Card key={week.start.toISOString()} className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        <span className="font-semibold">Week {index + 1}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">
                          {fmt(week.start, { month: "short", day: "numeric" })} –{" "}
                          {fmt(week.end, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                        {count} shifts
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                      {week.days.map(({ date, shift }) => {
                        const isToday = isSameDay(date, today);
                        return (
                          <div
                            key={date.toISOString()}
                            className={`rounded-lg border p-3 text-center ${
                              isToday ? "border-primary" : "border-border"
                            }`}
                          >
                            <div className="mb-1 flex items-center justify-center gap-1">
                              {shift && <Sun className="h-3.5 w-3.5 text-primary" />}
                              <span className="text-sm font-medium">
                                {fmt(date, { weekday: "short" })}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {fmt(date, { month: "short", day: "numeric" })}
                            </div>

                            {shift ? (
                              shift.clock_in ? (
                                <>
                                  <div className="mt-2 text-sm font-semibold">
                                    {shift.clock_in.slice(0,5)}
                                  </div>

                                  <div className="text-xs text-muted-foreground">–</div>

                                  <div className="text-sm font-semibold">
                                    {shift.clock_out.slice(0,5)}
                                  </div>

                                  <div className="mt-2 inline-block rounded-md bg-accent px-2 py-0.5 text-[11px] font-medium">
                                    {duration(shift).label}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="mt-3 text-muted-foreground">OFF</div>

                                  <div className="mt-2 inline-block rounded-md bg-muted px-2 py-0.5 text-[11px]">
                                    Off Day
                                  </div>
                                </>
                              )
                            ) : (
                              <>
                                <div className="mt-3 text-muted-foreground">—</div>
                                <div className="mt-3 inline-block rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                  Off
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                );
              })}
              <div className="flex items-center justify-center gap-2 pb-2 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5" />
                All times are local time
              </div>
            </>
          ) : (
            <Card className="divide-y p-0">
              {shifts
                .slice()
                .sort(
                  (a, b) =>
                    new Date(a.shift_date).getTime() -
                    new Date(b.shift_date).getTime(),
                )
                .map((shift) => (
                  <div
                    key={shift.shift_id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Sun className="h-4 w-4 text-primary" />
                      <div className="text-sm font-medium">
                        {fmt(new Date(shift.shift_date), {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span>
                       {shift.clock_in
                        ? `${shift.clock_in.slice(0,5)} – ${shift.clock_out.slice(0,5)}`
                        : "OFF"}
                      </span>
                      <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                        {duration(shift).label}
                      </span>
                    </div>
                  </div>
                ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
