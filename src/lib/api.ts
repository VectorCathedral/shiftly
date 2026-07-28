
import { getUser } from "@/lib/auth";
import { Shift } from "./types";

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




export async function fetchTeamSchedule(): Promise<Shift[]> {
  const response= await fetch("http://16.28.2.192:8000/shifts");
  
  if (!response.ok){
    throw new Error ("Failed to fetch shifts");

  }

    const data=await response.json()
    return data.shifts;
}



// export async function fetchEmployees(): Promise<Employee[]> {
//   await new Promise((r) => setTimeout(r, 100));
//   return employees;
// }
