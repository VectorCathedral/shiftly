import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { fetchTeam, fetchEmployeeSchedule } from "@/lib/api";
import type { Employee, Shift } from "@/lib/types";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_app/team")({
  component: TeamPage,
});

function TeamPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);

  useEffect(() => {
    async function loadTeam() {
      const team = await fetchTeam();
      setEmployees(team);

      if (team.length > 0) {
        setSelected(team[0]);
      }
    }

    loadTeam();
  }, []);

  useEffect(() => {
    if (!selected) return;

    async function loadShifts() {
      const data = await fetchEmployeeSchedule(selected.agent_id);
      setShifts(data);
    }

    loadShifts();
  }, [selected]);

  // Group shifts by Monday of each week
  const weeklyShifts = useMemo(() => {
    const grouped: Record<string, Shift[]> = {};

    shifts.forEach((shift) => {
      const date = new Date(shift.shift_date);

      const monday = new Date(date);
      monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));

      const key = monday.toISOString().slice(0, 10);

      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push(shift);
    });

    Object.values(grouped).forEach((week) => {
      week.sort(
        (a, b) =>
          new Date(a.shift_date).getTime() -
          new Date(b.shift_date).getTime()
      );
    });

    return grouped;
  }, [shifts]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Team</h1>
        <p className="text-sm text-muted-foreground">
          Select a team member to see their shifts.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[260px_1fr]">
        {/* Employee List */}
        <Card className="p-2">
          <ul className="space-y-2">
            {employees.map((e) => (
              <li key={e.agent_id}>
                <button
                  onClick={() => setSelected(e)}
                  className={`w-full rounded-lg border px-3 py-3 text-left transition hover:bg-accent ${
                    selected?.agent_id === e.agent_id
                      ? "border-primary bg-accent"
                      : "border-transparent"
                  }`}
                >
                  <div className="font-medium">{e.fullname}</div>
                  <div className="text-xs text-muted-foreground">
                    {e.email}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        {/* Weekly Schedule */}
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="text-xl font-semibold">
              {selected
                ? `${selected.fullname}'s Schedule`
                : "Select a Team Member"}
            </h2>

            {selected && (
              <p className="text-sm text-muted-foreground mt-1">
                {selected.email}
              </p>
            )}
          </Card>

          {Object.entries(weeklyShifts).length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">
              No shifts found.
            </Card>
          ) : (
            Object.entries(weeklyShifts).map(
              ([weekStart, week], index) => (
                <Card key={weekStart} className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">
                      Week {index + 1}
                    </h3>

                    <span className="text-sm text-muted-foreground">
                      {new Date(weekStart).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-4">
                    {week.map((shift) => (
                      <Card
                        key={shift.shift_id}
                        className="p-4 text-center shadow-sm"
                      >
                        <div className="font-medium">
                          {new Date(
                            shift.shift_date
                          ).toLocaleDateString(undefined, {
                            weekday: "short",
                          })}
                        </div>

                        <div className="text-xs text-muted-foreground mb-3">
                          {new Date(
                            shift.shift_date
                          ).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>

                        <div className="text-lg font-semibold">
                          {shift.clock_in.slice(0, 5)}
                        </div>

                        <div className="text-muted-foreground">
                          {shift.clock_out.slice(0, 5)}
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}