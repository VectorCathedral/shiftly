import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { uploadSchedule } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

type UploadStatus = "idle" | "uploading" | "success" | "error";

function Dashboard() {
  const [filename, setFilename] = useState<string | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFilename(file.name);
    setStatus("uploading");
    console.log(file);
    const text = await file.text();
    console.log(text);
    try {
      const res = await uploadSchedule(file);
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Upload your monthly schedule HTML file.</p>
      </div>

      <Card className="p-6">
        <h2 className="font-medium">Upload schedule</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a HTML file. The backend will parse it and populate your shifts.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <input
            id="file-input"
            type="file"
            accept="application/html"
            className="hidden"
            onChange={onFileChange}
          />
          <Button asChild>
            <label htmlFor="file-input" className="cursor-pointer">Choose HTML</label>
          </Button>
          {filename && <span className="text-sm">{filename}</span>}
        </div>
        {status !== "idle" && (
          <div className="mt-4 text-sm">
            Status:{" "}
            <span
              className={
                status === "success"
                  ? "text-green-600"
                  : status === "error"
                    ? "text-destructive"
                    : "text-muted-foreground"
              }
            >


          
              {status === "uploading" && "Uploading…"}
              {status === "success" && "Uploaded successfully! (Please check your shift in the calendar tab)"}
              {status === "error" && "Upload failed"}
            </span>
          </div>
        )}
      </Card>
    </div>
  );
}
