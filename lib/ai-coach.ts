export type AiContext = "workout" | "plan" | "recovery";

export interface PromptPair {
  systemPrompt: string;
  userMessage: string;
}

const DISCLAIMER =
  "Kineroz provides fitness guidance, not medical advice. Consult a healthcare professional for medical concerns.";

const OUTPUT_FORMAT_INSTRUCTION = `You are Kineroz AI Coach — a concise, evidence-based fitness assistant.

Always respond using this exact structure:

**Conclusion**
[Direct answer — what the user should do today]

**Reason**
[Based on their data: sleep, soreness, last RPE, recent performance, etc.]

**Options**
[Alternative exercises, intensity variations, or schedule modifications]

**Cautions**
[Safety notes, pain red flags suggesting medical consultation, and the following disclaimer at the end:]
"${DISCLAIMER}"

Rules:
- Be concise. No filler.
- Use metric units (kg).
- Reference the user's actual data in your reasoning.
- If the user reports sharp/acute pain, advise stopping immediately and seeking medical evaluation.
- Never prescribe medication or diagnose conditions.`;

/* ─── Workout context ─── */

export interface WorkoutContextData {
  exercise: {
    name: string;
    primary_muscle: string;
    secondary_muscles: string[];
    equipment: string;
    movement_pattern: string;
    difficulty: number;
    description?: string;
    tips?: string;
  };
  recentSets: {
    weight: number | null;
    reps: number | null;
    rpe: number | null;
    set_number: number;
  }[];
  planItem?: {
    sets: number;
    rep_range_min: number;
    rep_range_max: number;
    target_rpe: number;
    notes?: string | null;
  } | null;
}

export function buildWorkoutPrompt(
  data: WorkoutContextData,
  userMessage?: string,
): PromptPair {
  const { exercise, recentSets, planItem } = data;

  const exerciseInfo = [
    `Exercise: ${exercise.name}`,
    `Primary muscle: ${exercise.primary_muscle}`,
    `Secondary muscles: ${exercise.secondary_muscles.join(", ") || "none"}`,
    `Equipment: ${exercise.equipment}`,
    `Movement pattern: ${exercise.movement_pattern}`,
    `Difficulty: ${exercise.difficulty}/5`,
  ];
  if (exercise.description) exerciseInfo.push(`Description: ${exercise.description}`);
  if (exercise.tips) exerciseInfo.push(`Tips: ${exercise.tips}`);

  let performanceBlock = "No recent set data available.";
  if (recentSets.length > 0) {
    const lines = recentSets.map(
      (s) =>
        `  Set ${s.set_number}: ${s.weight ?? "—"}kg × ${s.reps ?? "—"} reps @ RPE ${s.rpe ?? "—"}`,
    );
    performanceBlock = `Recent sets:\n${lines.join("\n")}`;
  }

  let planBlock = "";
  if (planItem) {
    planBlock = `\nPlan target: ${planItem.sets} sets × ${planItem.rep_range_min}-${planItem.rep_range_max} reps @ RPE ${planItem.target_rpe}`;
    if (planItem.notes) planBlock += `\nPlan notes: ${planItem.notes}`;
  }

  const userMsg =
    userMessage ||
    `Analyze my performance on ${exercise.name} and give me coaching advice.`;

  return {
    systemPrompt: `${OUTPUT_FORMAT_INSTRUCTION}\n\nContext — Exercise Coaching:\n${exerciseInfo.join("\n")}\n\n${performanceBlock}${planBlock}`,
    userMessage: userMsg,
  };
}

/* ─── Plan context ─── */

export interface PlanContextData {
  plan: {
    name: string;
    goal: string;
    frequency: number;
    duration_weeks: number;
    split_type: string;
  };
  days: {
    day_number: number;
    name: string;
    focus: string;
    items: {
      exercise_name: string;
      sets: number;
      rep_range_min: number;
      rep_range_max: number;
      target_rpe: number;
      notes?: string | null;
    }[];
  }[];
  profile: {
    goal: string;
    frequency: number;
    equipment: string;
    experience: string;
    available_time: number;
  };
}

export function buildPlanPrompt(
  data: PlanContextData,
  userMessage?: string,
): PromptPair {
  const { plan, days, profile } = data;

  const planOverview = [
    `Plan: ${plan.name}`,
    `Goal: ${plan.goal}`,
    `Frequency: ${plan.frequency}x/week`,
    `Duration: ${plan.duration_weeks} weeks`,
    `Split: ${plan.split_type}`,
  ].join("\n");

  const profileInfo = [
    `User goal: ${profile.goal}`,
    `Training frequency: ${profile.frequency}x/week`,
    `Equipment: ${profile.equipment}`,
    `Experience: ${profile.experience}`,
    `Available time: ${profile.available_time} min/session`,
  ].join("\n");

  const dayBlocks = days
    .map((d) => {
      const header = `Day ${d.day_number} — ${d.name} (${d.focus})`;
      const items = d.items
        .map(
          (item) =>
            `  • ${item.exercise_name}: ${item.sets}×${item.rep_range_min}-${item.rep_range_max} @RPE ${item.target_rpe}${item.notes ? ` (${item.notes})` : ""}`,
        )
        .join("\n");
      return `${header}\n${items}`;
    })
    .join("\n\n");

  const userMsg =
    userMessage || "Review my current training plan and suggest improvements.";

  return {
    systemPrompt: `${OUTPUT_FORMAT_INSTRUCTION}\n\nContext — Plan Advisory:\n${planOverview}\n\nUser Profile:\n${profileInfo}\n\nCurrent Plan Structure:\n${dayBlocks}`,
    userMessage: userMsg,
  };
}

/* ─── Recovery context ─── */

export interface RecoveryContextData {
  readiness: {
    score: number;
    level: string;
    description: string;
  };
  recoveryLog: {
    sleep: number;
    doms: number;
    stress: number;
  };
  todayPlan?: {
    day_name: string;
    focus: string;
    items: {
      exercise_name: string;
      sets: number;
      rep_range_min: number;
      rep_range_max: number;
      target_rpe: number;
    }[];
  } | null;
  lastWorkout?: {
    date: string;
    exercises: {
      name: string;
      topWeight: number | null;
      totalSets: number;
      avgRpe: number | null;
    }[];
  } | null;
}

export function buildRecoveryPrompt(
  data: RecoveryContextData,
  userMessage?: string,
): PromptPair {
  const { readiness, recoveryLog, todayPlan, lastWorkout } = data;

  const readinessBlock = [
    `Readiness score: ${readiness.score}/100`,
    `Level: ${readiness.level}`,
    `Description: ${readiness.description}`,
  ].join("\n");

  const recoveryBlock = [
    `Sleep: ${recoveryLog.sleep} hours`,
    `Muscle soreness (DOMS): ${recoveryLog.doms}/10`,
    `Stress / fatigue: ${recoveryLog.stress}/10`,
  ].join("\n");

  let planBlock = "No planned workout for today.";
  if (todayPlan) {
    const items = todayPlan.items
      .map(
        (item) =>
          `  • ${item.exercise_name}: ${item.sets}×${item.rep_range_min}-${item.rep_range_max} @RPE ${item.target_rpe}`,
      )
      .join("\n");
    planBlock = `Today's planned workout — ${todayPlan.day_name} (${todayPlan.focus}):\n${items}`;
  }

  let lastWorkoutBlock = "No recent workout data available.";
  if (lastWorkout) {
    const exLines = lastWorkout.exercises
      .map(
        (ex) =>
          `  • ${ex.name}: ${ex.topWeight ?? "—"}kg top weight, ${ex.totalSets} sets, avg RPE ${ex.avgRpe ?? "—"}`,
      )
      .join("\n");
    lastWorkoutBlock = `Last workout (${lastWorkout.date}):\n${exLines}`;
  }

  const userMsg =
    userMessage ||
    "Based on my recovery data, how should I approach training today?";

  return {
    systemPrompt: `${OUTPUT_FORMAT_INSTRUCTION}\n\nContext — Recovery Coaching:\n${readinessBlock}\n\nRecovery Data:\n${recoveryBlock}\n\n${planBlock}\n\n${lastWorkoutBlock}`,
    userMessage: userMsg,
  };
}
