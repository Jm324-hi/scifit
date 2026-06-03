import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Footprints,
  Hand,
  PersonStanding,
  Shield,
} from "lucide-react";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export type BodyPartId =
  | "knee"
  | "shoulder"
  | "lower-back"
  | "achilles"
  | "hip"
  | "neck"
  | "upper-back"
  | "calf"
  | "hamstring"
  | "wrist";

export type ExerciseCard = {
  name: string;
  duration: string;
  tip: string;
  difficulty: Difficulty;
};

export type ActivationCard = ExerciseCard & {
  sets: string;
};

export type ProgressionPhase = {
  phase: string;
  load: string;
  criterion: string;
};

export type BodyPartData = {
  id: BodyPartId;
  label: string;
  icon: LucideIcon;
  chipColor: string;
  chipActive: string;
  available: boolean;
  mobility: ExerciseCard[];
  activation: ActivationCard[];
  progression: ProgressionPhase[];
};

export const BODY_PARTS: BodyPartData[] = [
  {
    id: "knee",
    label: "Knee",
    icon: Activity,
    chipColor: "border-sky-300/60 text-sky-700 dark:text-sky-300",
    chipActive: "border-sky-500 bg-sky-500/15 text-sky-700 dark:text-sky-200",
    available: true,
    mobility: [
      {
        name: "Quad foam roll",
        duration: "60–90 sec each side",
        tip: "Slow rolls above the kneecap — avoid rolling directly on the joint.",
        difficulty: "Beginner",
      },
      {
        name: "Couch stretch (hip flexor)",
        duration: "45 sec × 2 each side",
        tip: "Opens the front of the hip so the knee tracks better under load.",
        difficulty: "Beginner",
      },
      {
        name: "Patellar tendon floss",
        duration: "10 reps × 2",
        tip: "Gentle bend–extend with light pressure — stop if sharp pain.",
        difficulty: "Intermediate",
      },
    ],
    activation: [
      {
        name: "Spanish squat (isometric)",
        duration: "30–45 sec holds",
        tip: "Band behind knees, sit back slightly — target 4–5/10 discomfort only.",
        difficulty: "Intermediate",
        sets: "3 × 45 sec",
      },
      {
        name: "Terminal knee extension",
        duration: "Controlled tempo",
        tip: "Band-resisted lockout — builds quad without deep flexion.",
        difficulty: "Beginner",
        sets: "3 × 12–15",
      },
      {
        name: "Heavy-slow resistance (HSR)",
        duration: "4 sec up / 4 sec down",
        tip: "Leg press or hack squat at ~6–8/10 effort — gold standard for patellar tendinopathy.",
        difficulty: "Advanced",
        sets: "4 × 6–8",
      },
    ],
    progression: [
      {
        phase: "Phase 1",
        load: "Isometrics + mobility daily",
        criterion: "Morning pain ≤ 3/10 for 3 days → advance",
      },
      {
        phase: "Phase 2",
        load: "HSR 2–3×/week, no jumping",
        criterion: "Load tolerated with ≤ 3/10 next-day pain → advance",
      },
      {
        phase: "Phase 3",
        load: "Return to running / plyometrics",
        criterion: "Single-leg hop pain-free → sport-specific drills",
      },
    ],
  },
  {
    id: "shoulder",
    label: "Shoulder",
    icon: Hand,
    chipColor: "border-violet-300/60 text-violet-700 dark:text-violet-300",
    chipActive:
      "border-violet-500 bg-violet-500/15 text-violet-700 dark:text-violet-200",
    available: true,
    mobility: [
      {
        name: "Pec / anterior shoulder roll",
        duration: "60 sec each side",
        tip: "Arm across chest or on wall — breathe slowly, no pinching.",
        difficulty: "Beginner",
      },
      {
        name: "Sleeper stretch (posterior capsule)",
        duration: "30 sec × 3",
        tip: "Lie on side, gentle internal rotation — mild stretch only.",
        difficulty: "Intermediate",
      },
      {
        name: "Thoracic extension on foam roller",
        duration: "8–10 reps",
        tip: "Opens upper back so the shoulder blade moves freely.",
        difficulty: "Beginner",
      },
    ],
    activation: [
      {
        name: "Y-T-W raises (prone)",
        duration: "Pause 2 sec at top",
        tip: "Light load, thumbs up — builds rotator cuff endurance.",
        difficulty: "Beginner",
        sets: "2 × 10 each position",
      },
      {
        name: "Band external rotation",
        duration: "Elbow at side",
        tip: "Keep shoulder blade set — no shrugging.",
        difficulty: "Beginner",
        sets: "3 × 15–20",
      },
      {
        name: "Scaption raises",
        duration: "30° in front of body",
        tip: "Progress load only when overhead reach is pain-free.",
        difficulty: "Intermediate",
        sets: "3 × 10–12",
      },
    ],
    progression: [
      {
        phase: "Phase 1",
        load: "Daily mobility + light band work",
        criterion: "Night pain not worsening → add load",
      },
      {
        phase: "Phase 2",
        load: "Push/press patterns below shoulder height",
        criterion: "Full ROM without sharp pain → overhead work",
      },
      {
        phase: "Phase 3",
        load: "Full pressing & pulling volume",
        criterion: "Strength within 10% of uninjured side → sport",
      },
    ],
  },
  {
    id: "lower-back",
    label: "Lower back",
    icon: PersonStanding,
    chipColor: "border-amber-300/60 text-amber-800 dark:text-amber-300",
    chipActive:
      "border-amber-500 bg-amber-500/15 text-amber-800 dark:text-amber-200",
    available: true,
    mobility: [
      {
        name: "Cat–cow",
        duration: "10 slow reps",
        tip: "Move segment by segment — no forcing end range.",
        difficulty: "Beginner",
      },
      {
        name: "Piriformis / glute roll",
        duration: "60–90 sec each side",
        tip: "Reduces referred tension into the low back.",
        difficulty: "Beginner",
      },
      {
        name: "Child's pose breathing",
        duration: "5 slow breaths",
        tip: "Exhale long — calms guarding around the spine.",
        difficulty: "Beginner",
      },
    ],
    activation: [
      {
        name: "Bird dog",
        duration: "Hold 5 sec",
        tip: "Keep pelvis level — builds anti-rotation control.",
        difficulty: "Beginner",
        sets: "3 × 8 each side",
      },
      {
        name: "Side plank (knees or feet)",
        duration: "20–40 sec",
        tip: "Progress to feet when form stays solid.",
        difficulty: "Intermediate",
        sets: "2–3 × 20–40 sec",
      },
      {
        name: "Hip hinge with dowel",
        duration: "Controlled tempo",
        tip: "Re-teaches safe bending before adding bar load.",
        difficulty: "Intermediate",
        sets: "3 × 10",
      },
    ],
    progression: [
      {
        phase: "Phase 1",
        load: "Walking + mobility, no heavy flexion",
        criterion: "Pain centralizing / not spreading → loading",
      },
      {
        phase: "Phase 2",
        load: "Hinge & carry patterns light–moderate",
        criterion: "No morning stiffness spike → volume",
      },
      {
        phase: "Phase 3",
        load: "Full squat / deadlift progression",
        criterion: "1RM within plan targets → performance blocks",
      },
    ],
  },
  {
    id: "achilles",
    label: "Achilles",
    icon: Footprints,
    chipColor: "border-emerald-300/60 text-emerald-700 dark:text-emerald-300",
    chipActive:
      "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-200",
    available: true,
    mobility: [
      {
        name: "Gastrocnemius foam roll",
        duration: "60 sec each leg",
        tip: "Ankle circles at tender spots — avoid bouncing on tendon.",
        difficulty: "Beginner",
      },
      {
        name: "Wall calf stretch (straight knee)",
        duration: "45 sec × 2",
        tip: "Gastrocnemius — keep heel down.",
        difficulty: "Beginner",
      },
      {
        name: "Soleus stretch (bent knee)",
        duration: "45 sec × 2",
        tip: "Lower calf — often missed in Achilles rehab.",
        difficulty: "Beginner",
      },
    ],
    activation: [
      {
        name: "Alfredson eccentric (off step)",
        duration: "3 sec lowering",
        tip: "Use non-painful leg to return up — cornerstone for mid-portion tendinopathy.",
        difficulty: "Intermediate",
        sets: "3 × 15",
      },
      {
        name: "Seated heel raise (isometric)",
        duration: "45 sec hold",
        tip: "Load at 70% max voluntary — pain ≤ 4/10 during hold.",
        difficulty: "Beginner",
        sets: "4–5 × 45 sec",
      },
      {
        name: "Single-leg calf raise",
        duration: "Full ROM, controlled",
        tip: "Add load in backpack only when 25+ pain-free reps.",
        difficulty: "Advanced",
        sets: "3 × 8–12",
      },
    ],
    progression: [
      {
        phase: "Phase 1",
        load: "Isometrics + bilateral eccentrics",
        criterion: "Morning stiffness < 15 min → single-leg work",
      },
      {
        phase: "Phase 2",
        load: "Heavy slow calf raises 3×/week",
        criterion: "Hop test pain ≤ 2/10 → energy storage",
      },
      {
        phase: "Phase 3",
        load: "Plyometrics & run progression",
        criterion: "10% weekly run volume increase rule",
      },
    ],
  },
  {
    id: "hip",
    label: "Hip",
    icon: Activity,
    chipColor: "border-indigo-300/60 text-indigo-700 dark:text-indigo-300",
    chipActive:
      "border-indigo-500 bg-indigo-500/15 text-indigo-700 dark:text-indigo-200",
    available: true,
    mobility: [
      {
        name: "Figure-4 glute stretch",
        duration: "45 sec × 2",
        tip: "Targets deep hip external rotators — common in hip/Groin pain.",
        difficulty: "Beginner",
      },
      {
        name: "Hip flexor foam roll",
        duration: "60 sec each side",
        tip: "Stay below the iliac crest — don't roll the groin.",
        difficulty: "Beginner",
      },
      {
        name: "90/90 hip switches",
        duration: "8 reps each side",
        tip: "Gentle rotation mobility — no forcing range.",
        difficulty: "Intermediate",
      },
    ],
    activation: [
      {
        name: "Clamshell (band)",
        duration: "Controlled tempo",
        tip: "Pelvis still — builds glute med for stable gait.",
        difficulty: "Beginner",
        sets: "3 × 15",
      },
      {
        name: "Bridge (double → single)",
        duration: "2 sec pause at top",
        tip: "Progress to single leg when pelvis stays level.",
        difficulty: "Intermediate",
        sets: "3 × 10–12",
      },
      {
        name: "Step-down (slow eccentric)",
        duration: "3 sec lowering",
        tip: "Knee tracks over toes — key for return to stairs & running.",
        difficulty: "Intermediate",
        sets: "3 × 8 each leg",
      },
    ],
    progression: [
      {
        phase: "Phase 1",
        load: "Activation + walking tolerance",
        criterion: "Groin pain not increasing post-session → load",
      },
      {
        phase: "Phase 2",
        load: "Split squat & step patterns",
        criterion: "Single-leg balance 30 sec stable → running prep",
      },
      {
        phase: "Phase 3",
        load: "Running & change-of-direction",
        criterion: "Sprint pain-free in practice → full training",
      },
    ],
  },
  {
    id: "neck",
    label: "Neck",
    icon: Shield,
    chipColor: "border-slate-300/60 text-slate-600",
    chipActive: "border-slate-400 bg-slate-500/10 text-slate-600",
    available: false,
    mobility: [],
    activation: [],
    progression: [],
  },
  {
    id: "upper-back",
    label: "Upper back",
    icon: Shield,
    chipColor: "border-slate-300/60 text-slate-600",
    chipActive: "border-slate-400 bg-slate-500/10 text-slate-600",
    available: false,
    mobility: [],
    activation: [],
    progression: [],
  },
  {
    id: "calf",
    label: "Calf",
    icon: Footprints,
    chipColor: "border-slate-300/60 text-slate-600",
    chipActive: "border-slate-400 bg-slate-500/10 text-slate-600",
    available: false,
    mobility: [],
    activation: [],
    progression: [],
  },
  {
    id: "hamstring",
    label: "Hamstring",
    icon: Activity,
    chipColor: "border-slate-300/60 text-slate-600",
    chipActive: "border-slate-400 bg-slate-500/10 text-slate-600",
    available: false,
    mobility: [],
    activation: [],
    progression: [],
  },
  {
    id: "wrist",
    label: "Wrist",
    icon: Hand,
    chipColor: "border-slate-300/60 text-slate-600",
    chipActive: "border-slate-400 bg-slate-500/10 text-slate-600",
    available: false,
    mobility: [],
    activation: [],
    progression: [],
  },
];

export const AVAILABLE_PARTS = BODY_PARTS.filter((p) => p.available);

export function getBodyPart(id: BodyPartId): BodyPartData | undefined {
  return BODY_PARTS.find((p) => p.id === id);
}
