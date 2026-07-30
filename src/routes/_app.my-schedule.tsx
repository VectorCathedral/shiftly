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
        <h1 className="text-2xl font-semibold">Active Requests</h1>
        <p className="text-sm text-muted-foreground">Current active requests.</p>
      </div>

      <Card className="p-4">
        <div className="overflow-x-auto">
        Nothing To see here
        </div>
      </Card>
    </div>
  );
}
