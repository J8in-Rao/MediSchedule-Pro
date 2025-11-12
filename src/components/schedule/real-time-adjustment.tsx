"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Bot, Sparkles, AlertTriangle, CheckCircle } from "lucide-react";
import { adjustScheduleAction, type FormState } from "@/app/actions/adjust-schedule";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const initialState: FormState = {
  status: "idle",
  result: null,
  error: null,
};

export default function RealTimeAdjustment() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useActionState(adjustScheduleAction, initialState);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formAction(formData);
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form state when dialog closes
      // This is a simple way; for complex forms, consider form.reset() from react-hook-form
      const form = document.getElementById("ai-schedule-form") as HTMLFormElement;
      form?.reset();
      initialState.result = null; // Clear previous results
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-[#FFB347] hover:bg-[#FFB347]/90 text-primary-foreground">
          <Bot className="mr-2 h-4 w-4" /> AI Schedule Helper
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-[#FFB347]"/>
            Real-time Schedule Adjustment
          </DialogTitle>
          <DialogDescription>
            Describe a new event, cancellation, or emergency to get AI-powered schedule suggestions.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <form id="ai-schedule-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="event-details">Event Details</Label>
              <Textarea
                id="event-details"
                name="eventDetails"
                placeholder="e.g., 'Emergency appendectomy for John Doe, needs OT within 1 hour.' or 'Cancel surgery #sur2 for Bob Williams.'"
                className="mt-1"
                rows={4}
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={state.status === 'executing'}>
                {state.status === 'executing' ? "Analyzing..." : "Get Suggestions"}
              </Button>
            </DialogFooter>
          </form>

          {state.status === 'error' && (
            <div className="mt-4 text-sm text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <p>Error: {state.error}</p>
            </div>
          )}

          {state.result && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {state.result.feasibility ? 
                    <CheckCircle className="h-5 w-5 text-green-500" /> : 
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  }
                  Suggestion Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold">Feasibility</h4>
                  <p className="text-sm">{state.result.feasibility ? "The requested adjustment is feasible." : "The requested adjustment might not be feasible without significant changes."}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Reasoning</h4>
                  <p className="text-sm text-muted-foreground">{state.result.reasoning}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Suggested Adjustments</h4>
                  <pre className="mt-2 w-full whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
                    <code>{JSON.stringify(JSON.parse(state.result.suggestedAdjustments), null, 2)}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
