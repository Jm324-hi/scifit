import { z } from "zod";

export const profileSchema = z.object({
  goal: z.enum(["muscle", "strength", "fat_loss", "general"], {
    message: "Please select a training goal.",
  }),
  frequency: z.number().int().min(2, "Minimum 2 days per week.").max(6, "Maximum 6 days per week."),
  equipment: z.enum(["gym", "home", "both"], {
    message: "Please select your equipment access.",
  }),
  experience: z.enum(["beginner", "intermediate", "advanced"], {
    message: "Please select your experience level.",
  }),
  available_time: z
    .number()
    .int()
    .min(20, "Minimum 20 minutes per session.")
    .max(120, "Maximum 120 minutes per session."),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const workoutSetSchema = z.object({
  weight: z
    .number({ error: "Weight must be a number." })
    .min(0, "Weight cannot be negative.")
    .nullable(),
  reps: z
    .number({ error: "Reps must be a number." })
    .int("Reps must be a whole number.")
    .min(1, "At least 1 rep required.")
    .nullable(),
  rpe: z
    .number({ error: "RPE must be a number." })
    .int("RPE must be a whole number.")
    .min(1, "RPE must be between 1 and 10.")
    .max(10, "RPE must be between 1 and 10.")
    .nullable(),
});

export type WorkoutSetInput = z.infer<typeof workoutSetSchema>;

export const recoveryLogSchema = z.object({
  sleep: z
    .number({ error: "Please enter your sleep hours." })
    .min(0, "Sleep cannot be negative.")
    .max(12, "Maximum 12 hours."),
  doms: z
    .number({ error: "Please rate your soreness." })
    .int()
    .min(0, "DOMS must be between 0 and 10.")
    .max(10, "DOMS must be between 0 and 10."),
  stress: z
    .number({ error: "Please rate your stress." })
    .int()
    .min(0, "Stress must be between 0 and 10.")
    .max(10, "Stress must be between 0 and 10."),
});

export type RecoveryLogInput = z.infer<typeof recoveryLogSchema>;
