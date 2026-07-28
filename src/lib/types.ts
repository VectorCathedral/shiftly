// Mock data + placeholder API functions.
// Replace these with real API calls to the Python backend later.

import { getUser } from "@/lib/auth";

const user = getUser();

export interface Shift {
  shift_id: number;
  agent_id: number;
  shift_date: string; // YYYY-MM-DD
  clock_in: string; // HH:mm
  clock_out: string; // HH:mm
}

export interface Employee {
  agent_id: number;
  fullname: string;
  email: string;
}

export const CURRENT_USER_ID = "e1";


