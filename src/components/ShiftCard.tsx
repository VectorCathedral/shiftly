import type { Shift } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ShiftCard({ shift }: { shift: Shift }) {
  return (
    <Card className="p-2 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-medium">{"Voice"}</span>
        {/* <Badge variant="secondary">{"Test"}</Badge> */}
      </div>
      <div className="mt-1 text-muted-foreground">
        {shift.clock_in} – {shift.clock_out}
      </div>
    </Card>
  );
}
