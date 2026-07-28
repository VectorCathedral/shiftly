import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchTeam, fetchEmployeeSchedule } from "@/lib/api";
import type { Employee, Shift } from "@/lib/types";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


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
        const shifts = await fetchEmployeeSchedule(selected.agent_id);
        setShifts(shifts);
    }

    loadShifts();
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
              <li key={e.agent_id}>
                <button
                  onClick={() => setSelected(e)}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent ${
                    selected?.agent_id === e.agent_id ? "bg-accent font-medium" : ""
                  }`}
                >
                  <div>{e.fullname}</div>
                  <div className="text-xs text-muted-foreground">{e.email}</div>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4">
          <h2 className="font-medium">{selected ? `${selected.fullname}'s shifts` : "Select someone"}</h2>
          <div className="mt-3 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shifts.map((s) => (
                  <TableRow key={s.shift_id}>
            <TableCell>{s.shift_date}</TableCell>
            <TableCell>{s.clock_in}</TableCell>
            <TableCell>{s.clock_out}</TableCell>
            </TableRow>
                ))}
                {shifts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
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
