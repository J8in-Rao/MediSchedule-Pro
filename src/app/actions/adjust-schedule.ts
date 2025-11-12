"use server";

import { adjustSchedule, ScheduleAdjustmentOutput } from "@/ai/flows/real-time-schedule-adjustment";
import { surgeries, doctors } from "@/lib/data";

export type FormState = {
  status: "idle" | "executing" | "success" | "error";
  result: ScheduleAdjustmentOutput | null;
  error: string | null;
};

export async function adjustScheduleAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const eventDetails = formData.get("eventDetails") as string;

  if (!eventDetails) {
    return {
      status: "error",
      result: null,
      error: "Event details are required.",
    };
  }

  // In a real app, you would fetch the current, up-to-date schedule and constraints.
  // For this demo, we use mock data.
  const currentSchedule = JSON.stringify(surgeries, null, 2);
  const hospitalConstraints = JSON.stringify({
    roomAvailability: ["OT 1", "OT 2", "OT 3", "OT 4"],
    doctorPreferences: doctors.map(d => ({ doctor: d.name, availableDays: d.availability })),
    equipmentNeeds: ["Heart-lung machine", "Microscope", "Laparoscopic tower"],
    operatingHours: "08:00-20:00"
  }, null, 2);

  try {
    const result = await adjustSchedule({
      currentSchedule,
      // The AI is tasked to figure out the type of event from the natural language input.
      newEvent: eventDetails,
      hospitalConstraints,
    });
    
    return {
      status: "success",
      result,
      error: null,
    };
  } catch (error) {
    console.error("Error calling adjustSchedule flow:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      status: "error",
      result: null,
      error: `Failed to get schedule adjustments. ${errorMessage}`,
    };
  }
}
