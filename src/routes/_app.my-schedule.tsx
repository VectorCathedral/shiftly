import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchMySchedule, type Shift } from "@/lib/mock-data";
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

export const Route = createFileRoute("/_app/my-schedule")({
  component: MySchedule,
});

function MySchedule() {
  const [shifts, setShifts] = useState<Shift[]>([]);

  useEffect(() => {
    fetchMySchedule().then((s) =>
      setShifts([...s].sort((a, b) => a.date.localeCompare(b.date))),
    );
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Schedule</h1>
        <p className="text-sm text-muted-foreground">Your shifts for the current month.</p>
      </div>

      <Card className="p-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Skill</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
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
  );
}
