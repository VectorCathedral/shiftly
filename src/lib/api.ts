
import { getUser } from "@/lib/auth";
import { Shift,Employee } from "./types";



const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
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



export async function fetchMySchedule() {
    const user = getUser();

    if (!user) {
        throw new Error("User not logged in");
    }

    const cacheKey = `my_schedule_${user.email}`;
    const cacheTimeKey = `my_schedule_time_${user.email}`;

    const cached = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(cacheTimeKey);

    if (cached && cachedTime) {
        const age = Date.now() - Number(cachedTime);

        if (age < CACHE_DURATION) {
            console.log("Using cached schedule");
            return JSON.parse(cached);
        }
    }

    console.log("Fetching schedule from API");

    const res = await fetch(
        `http://16.28.2.192:8000/myshifts?email=${encodeURIComponent(user.email)}`
    );

    if (!res.ok) {
        throw new Error("Failed to fetch schedule");
    }

    const data = await res.json();

    localStorage.setItem(cacheKey, JSON.stringify(data));
    localStorage.setItem(cacheTimeKey, Date.now().toString());

    return data;
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