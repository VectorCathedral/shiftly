import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { employees, fetchTeamSchedule, type Employee, type Shift } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/team")({
  component: TeamPage,
});

function TeamPage() {
  const [selected, setSelected] = useState<Employee | null>(employees[0]);
  const [shifts, setShifts] = useState<Shift[]>([]);

  useEffect(() => {
    if (!selected) return;
    fetchTeamSchedule(selected.id).then(setShifts);
  }, [selected]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Team</h1>
        <p className="text-sm text-muted-foreground">Select a team member to see their shifts.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-[240px_1fr]">
        <Card className="p-2">
          <ul className="space-y-1">
            {employees.map((e) => (
              <li key={e.id}>
                <button
                  onClick={() => setSelected(e)}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent ${
                    selected?.id === e.id ? "bg-accent font-medium" : ""
                  }`}
                >
                  <div>{e.name}</div>
                  <div className="text-xs text-muted-foreground">{e.email}</div>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4">
          <h2 className="font-medium">{selected ? `${selected.name}'s shifts` : "Select someone"}</h2>
          <div className="mt-3 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Skill</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shifts.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.date}</TableCell>
                    <TableCell>{s.type}</TableCell>
                    <TableCell><Badge variant="secondary">{s.skill}</Badge></TableCell>
                    <TableCell>{s.startTime}</TableCell>
                    <TableCell>{s.endTime}</TableCell>
                  </TableRow>
                ))}
                {shifts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                      No shifts
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
