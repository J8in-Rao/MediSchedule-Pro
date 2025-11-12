// Real-time schedule adjustment flow to suggest schedule optimizations.
'use server';

/**
 * @fileOverview A real-time schedule adjustment AI agent.
 *
 * - adjustSchedule - A function that handles the schedule adjustment process.
 * - ScheduleAdjustmentInput - The input type for the adjustSchedule function.
 * - ScheduleAdjustmentOutput - The return type for the adjustSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScheduleAdjustmentInputSchema = z.object({
  currentSchedule: z.string().describe('The current OT schedule in JSON format.'),
  newEvent: z.string().optional().describe('Details of the new surgery to be added, in JSON format.'),
  cancellation: z.string().optional().describe('Details of the cancellation, in JSON format.'),
  postponement: z.string().optional().describe('Details of the postponement, in JSON format.'),
  emergency: z.string().optional().describe('Details of the emergency, in JSON format.'),
  hospitalConstraints: z.string().describe('Hospital constraints in JSON format (e.g., room availability, doctor preferences, equipment needs).'),
});
export type ScheduleAdjustmentInput = z.infer<typeof ScheduleAdjustmentInputSchema>;

const ScheduleAdjustmentOutputSchema = z.object({
  suggestedAdjustments: z.string().describe('Suggested schedule adjustments in JSON format.'),
  reasoning: z.string().describe('Reasoning behind the suggested adjustments.'),
  feasibility: z.boolean().describe('Whether the suggested adjustments are feasible given the constraints.'),
});
export type ScheduleAdjustmentOutput = z.infer<typeof ScheduleAdjustmentOutputSchema>;

export async function adjustSchedule(input: ScheduleAdjustmentInput): Promise<ScheduleAdjustmentOutput> {
  return adjustScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adjustSchedulePrompt',
  input: {schema: ScheduleAdjustmentInputSchema},
  output: {schema: ScheduleAdjustmentOutputSchema},
  prompt: `You are an expert operating theater schedule optimizer.

  Based on the current OT schedule, new events, cancellations, postponements, emergencies, and hospital constraints, you will provide optimal schedule adjustments.

  Current OT Schedule:
  {{currentSchedule}}

  New Event Details (if any):
  {{newEvent}}

  Cancellation Details (if any):
  {{cancellation}}

  Postponement Details (if any):
  {{postponement}}

  Emergency Details (if any):
  {{emergency}}

Hospital Constraints:
  {{hospitalConstraints}}

  Consider all factors and provide schedule adjustments in JSON format, along with clear reasoning.  Also, indicate the feasibility of the adjustment.

  Ensure the adjustments are efficient and responsive.
  `,
});

const adjustScheduleFlow = ai.defineFlow(
  {
    name: 'adjustScheduleFlow',
    inputSchema: ScheduleAdjustmentInputSchema,
    outputSchema: ScheduleAdjustmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
