// Mock data + placeholder API functions.
// Replace these with real API calls to the Python backend later.

import { getUser } from "@/lib/auth";

const user = getUser();
export type ShiftType = "Morning" | "Afternoon" | "Night";
export type Skill = "Voice" | "Chat";

export interface Shift {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  type: ShiftType;
  skill: Skill;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface Employee {
  id: string;
  name: string;
  email: string;
}

export const CURRENT_USER_ID = "e1";

export const employees: Employee[] = [
  { id: "e1", name: "Alex Johnson", email: "alex@shiftsync.io" },
  { id: "e2", name: "Priya Patel", email: "priya@shiftsync.io" },
  { id: "e3", name: "Marco Rossi", email: "marco@shiftsync.io" },
  { id: "e4", name: "Sara Kim", email: "sara@shiftsync.io" },
  { id: "e5", name: "Diego Alvarez", email: "diego@shiftsync.io" },
];

// Build a month of mock shifts for the current month
function buildMockShifts(): Shift[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const types: ShiftType[] = ["Morning", "Afternoon", "Night"];
  const skills: Skill[] = ["Voice", "Chat"];
  const timings: Record<ShiftType, [string, string]> = {
    Morning: ["06:00", "14:00"],
    Afternoon: ["14:00", "22:00"],
    Night: ["22:00", "06:00"],
  };

  const shifts: Shift[] = [];
  let idx = 0;
  for (const emp of employees) {
    for (let day = 1; day <= daysInMonth; day++) {
      // ~5 shifts per week per employee
      if ((day + emp.id.charCodeAt(1)) % 7 < 5) {
        const type = types[(day + idx) % 3];
        const skill = skills[(day + idx) % 2];
        const [start, end] = timings[type];
        const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        shifts.push({
          id: `s-${emp.id}-${day}`,
          employeeId: emp.id,
          date,
          type,
          skill,
          startTime: start,
          endTime: end,
        });
      }
      idx++;
    }
  }
  return shifts;
}

export const shifts: Shift[] = buildMockShifts();

// ---- Placeholder API functions ----

export async function uploadSchedule(file: File) {
    const formData = new FormData();

    formData.append("file", file);
    
    if (user){
      formData.append("email",user.email);
    }

    const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
    });

    return response.json();
}

export async function fetchTeamSchedule(employeeId?: string): Promise<Shift[]> {
  // TODO: GET /api/shifts?employeeId=...
  await new Promise((r) => setTimeout(r, 200));
  return employeeId ? shifts.filter((s) => s.employeeId === employeeId) : shifts;
}

export async function fetchMySchedule(userId: string = CURRENT_USER_ID): Promise<Shift[]> {
  // TODO: GET /api/me/shifts
  await new Promise((r) => setTimeout(r, 200));
  return shifts.filter((s) => s.employeeId === userId);
}

export async function fetchEmployees(): Promise<Employee[]> {
  await new Promise((r) => setTimeout(r, 100));
  return employees;
}
