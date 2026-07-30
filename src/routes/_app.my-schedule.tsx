import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchMySchedule } from "@/lib/api";
import type { Shift } from "@/lib/types";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_app/my-schedule")({
  component: MySchedule,
});

function MySchedule() {
  const [shifts, setShifts] = useState<Shift[]>([]);

  useEffect(() => {
    fetchMySchedule().then((data) =>
      setShifts(
        [...data].sort((a, b) => a.shift_date.localeCompare(b.shift_date)),
      ),
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
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts.map((s) => (
                <TableRow key={s.shift_id}>
                  <TableCell>{s.shift_date}</TableCell>
                  <TableCell>{s.clock_in.slice(0, 5)}</TableCell>
                  <TableCell>{s.clock_out.slice(0, 5)}</TableCell>
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
  );
}
