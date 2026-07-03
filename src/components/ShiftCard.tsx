import type { Shift } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ShiftCard({ shift }: { shift: Shift }) {
  return (
    <Card className="p-2 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-medium">{shift.type}</span>
        <Badge variant="secondary">{shift.skill}</Badge>
      </div>
      <div className="mt-1 text-muted-foreground">
        {shift.startTime} – {shift.endTime}
      </div>
    </Card>
  );
}
