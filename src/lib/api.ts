
import { getUser } from "@/lib/auth";
import { Shift,Employee } from "./types";

export async function uploadSchedule(file: File) {
    const formData = new FormData();

    formData.append("file", file);
    const user=getUser();
    if (user){
      formData.append("email",user.email);
    }

    const response =await fetch("http://16.28.2.192:8000/upload", {
        method: "POST",
        body: formData,
    });

    return response.json();
}



export async function fetchMySchedule(): Promise<Shift[]> {
    const user = getUser();

    if (!user) {
        throw new Error("User not logged in");
    }

    const response = await fetch(
        `http://16.28.2.192:8000/myshifts?email=${encodeURIComponent(user.email)}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch shifts");
    }

    const data = await response.json();
    return data.shifts;
}



export async function fetchTeam(): Promise<Employee[]> {
  const response= await fetch("http://16.28.2.192:8000/team");

  if (!response.ok){
    throw new Error ("Failed to fetch shifts");

  }

    const data=await response.json()
    return data.team;

}

export async function fetchEmployeeSchedule(agentId: number): Promise<Shift[]> {
    const response = await fetch(
        `http://16.28.2.192:8000/team/${agentId}/shifts`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch shifts");
    }

    const data = await response.json();
    return data.shifts;
}