import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL and one of SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface SeedExercise {
  name: string;
  movement_pattern: string;
  primary_muscle: string;
  secondary_muscles: string[];
  equipment: string;
  difficulty: number;
  description: string;
  tips: string;
}

const exercises: SeedExercise[] = [
  // ── PUSH: Chest ──
  {
    name: "Barbell Bench Press",
    movement_pattern: "push",
    primary_muscle: "chest",
    secondary_muscles: ["triceps", "shoulders"],
    equipment: "barbell",
    difficulty: 3,
    description:
      "Lie on a flat bench and press a barbell from chest level to full arm extension.",
    tips: "Keep your shoulder blades retracted and feet flat on the floor. Control the descent.",
  },
  {
    name: "Incline Barbell Bench Press",
    movement_pattern: "push",
    primary_muscle: "chest",
    secondary_muscles: ["shoulders", "triceps"],
    equipment: "barbell",
    difficulty: 3,
    description:
      "Press a barbell overhead while lying on a bench set to 30-45 degrees.",
    tips: "Angle the bench at 30-45°. Avoid flaring elbows excessively to protect the shoulder joint.",
  },
  {
    name: "Dumbbell Bench Press",
    movement_pattern: "push",
    primary_muscle: "chest",
    secondary_muscles: ["triceps", "shoulders"],
    equipment: "dumbbell",
    difficulty: 2,
    description:
      "Press two dumbbells from chest height to lockout while lying on a flat bench.",
    tips: "Allow a slight arch in the lower back. Lower the dumbbells until your elbows are at 90°.",
  },
  {
    name: "Incline Dumbbell Press",
    movement_pattern: "push",
    primary_muscle: "chest",
    secondary_muscles: ["shoulders", "triceps"],
    equipment: "dumbbell",
    difficulty: 3,
    description:
      "Press dumbbells overhead on an incline bench to emphasize the upper chest.",
    tips: "Keep wrists neutral and drive the dumbbells up in a slight arc. Don't bounce at the bottom.",
  },
  {
    name: "Machine Chest Press",
    movement_pattern: "push",
    primary_muscle: "chest",
    secondary_muscles: ["triceps", "shoulders"],
    equipment: "machine",
    difficulty: 1,
    description:
      "Push handles forward on a seated chest press machine until arms are extended.",
    tips: "Adjust the seat so handles align with mid-chest. Focus on a full range of motion.",
  },
  {
    name: "Cable Fly",
    movement_pattern: "push",
    primary_muscle: "chest",
    secondary_muscles: ["shoulders"],
    equipment: "cable",
    difficulty: 2,
    description:
      "Bring cable handles together in a wide arc in front of the chest, squeezing the pecs.",
    tips: "Keep a slight bend in the elbows throughout. Control the negative for a deep stretch.",
  },
  {
    name: "Push-up",
    movement_pattern: "push",
    primary_muscle: "chest",
    secondary_muscles: ["triceps", "shoulders", "core"],
    equipment: "bodyweight",
    difficulty: 1,
    description:
      "Lower your body to the floor and press back up while maintaining a straight line from head to heels.",
    tips: "Engage your core and avoid sagging hips. Scale by elevating hands to reduce difficulty.",
  },
  {
    name: "Band-Resisted Push-up",
    movement_pattern: "push",
    primary_muscle: "chest",
    secondary_muscles: ["triceps", "shoulders"],
    equipment: "band",
    difficulty: 2,
    description:
      "Perform a push-up with a resistance band looped across the back and under the hands for added load.",
    tips: "Choose a band tension that lets you complete 8-12 reps with good form.",
  },

  // ── PUSH: Shoulders ──
  {
    name: "Overhead Press",
    movement_pattern: "push",
    primary_muscle: "shoulders",
    secondary_muscles: ["triceps", "core"],
    equipment: "barbell",
    difficulty: 3,
    description:
      "Press a barbell from shoulder height to overhead while standing.",
    tips: "Brace your core hard. Tuck chin back as the bar passes your face, then push your head through.",
  },
  {
    name: "Dumbbell Shoulder Press",
    movement_pattern: "push",
    primary_muscle: "shoulders",
    secondary_muscles: ["triceps"],
    equipment: "dumbbell",
    difficulty: 2,
    description:
      "Press two dumbbells from shoulder level to full lockout overhead while seated or standing.",
    tips: "Don't arch your back excessively. Lower until elbows are at roughly 90°.",
  },
  {
    name: "Arnold Press",
    movement_pattern: "push",
    primary_muscle: "shoulders",
    secondary_muscles: ["triceps"],
    equipment: "dumbbell",
    difficulty: 3,
    description:
      "Start with palms facing you at shoulder height, rotate outward as you press overhead.",
    tips: "Use a smooth rotation. This targets all three deltoid heads more evenly than a standard press.",
  },
  {
    name: "Machine Shoulder Press",
    movement_pattern: "push",
    primary_muscle: "shoulders",
    secondary_muscles: ["triceps"],
    equipment: "machine",
    difficulty: 1,
    description:
      "Push handles overhead on a seated shoulder press machine.",
    tips: "Adjust the seat so the handles start at ear level. Avoid locking out aggressively.",
  },
  {
    name: "Lateral Raise",
    movement_pattern: "push",
    primary_muscle: "shoulders",
    secondary_muscles: ["traps"],
    equipment: "dumbbell",
    difficulty: 2,
    description:
      "Raise dumbbells out to the sides until arms are parallel with the floor.",
    tips: "Lead with the elbows, not the hands. Use a slight forward lean to reduce impingement risk.",
  },
  {
    name: "Cable Lateral Raise",
    movement_pattern: "push",
    primary_muscle: "shoulders",
    secondary_muscles: ["traps"],
    equipment: "cable",
    difficulty: 2,
    description:
      "Raise a low-cable handle out to the side to shoulder height.",
    tips: "Stand sideways to the cable for constant tension throughout the range of motion.",
  },

  // ── PUSH: Triceps ──
  {
    name: "Dips",
    movement_pattern: "push",
    primary_muscle: "triceps",
    secondary_muscles: ["chest", "shoulders"],
    equipment: "bodyweight",
    difficulty: 3,
    description:
      "Lower yourself between parallel bars by bending the elbows, then press back up.",
    tips: "Lean forward slightly to involve more chest; stay upright to isolate triceps. Go to at least 90° elbow bend.",
  },
  {
    name: "Tricep Pushdown",
    movement_pattern: "push",
    primary_muscle: "triceps",
    secondary_muscles: [],
    equipment: "cable",
    difficulty: 1,
    description:
      "Push a cable attachment down from chest height until the arms are fully extended.",
    tips: "Keep elbows pinned at your sides. Squeeze the triceps at the bottom.",
  },
  {
    name: "Close-Grip Bench Press",
    movement_pattern: "push",
    primary_muscle: "triceps",
    secondary_muscles: ["chest", "shoulders"],
    equipment: "barbell",
    difficulty: 3,
    description:
      "Bench press with a narrower-than-shoulder-width grip to shift emphasis to the triceps.",
    tips: "Hands about shoulder-width apart. Keep elbows tucked close to the body.",
  },
  {
    name: "Overhead Tricep Extension",
    movement_pattern: "push",
    primary_muscle: "triceps",
    secondary_muscles: [],
    equipment: "dumbbell",
    difficulty: 2,
    description:
      "Hold a dumbbell overhead with both hands and lower it behind the head, then extend.",
    tips: "Keep upper arms vertical and close to the ears. Focus on the stretch at the bottom.",
  },

  // ── PULL: Back ──
  {
    name: "Barbell Row",
    movement_pattern: "pull",
    primary_muscle: "back",
    secondary_muscles: ["biceps", "core"],
    equipment: "barbell",
    difficulty: 3,
    description:
      "Hinge forward and pull a barbell into the lower chest or upper abdomen.",
    tips: "Keep your back flat and core braced. Pull to the belly button for lower lats, to the sternum for upper back.",
  },
  {
    name: "Dumbbell Row",
    movement_pattern: "pull",
    primary_muscle: "back",
    secondary_muscles: ["biceps"],
    equipment: "dumbbell",
    difficulty: 2,
    description:
      "Row a dumbbell to the hip while supporting yourself on a bench with the opposite hand and knee.",
    tips: "Drive the elbow past the torso. Avoid rotating the trunk excessively.",
  },
  {
    name: "Pull-up",
    movement_pattern: "pull",
    primary_muscle: "back",
    secondary_muscles: ["biceps", "forearms"],
    equipment: "bodyweight",
    difficulty: 4,
    description:
      "Hang from a bar with an overhand grip and pull your chin above the bar.",
    tips: "Initiate by depressing the shoulder blades. Avoid kipping until you can do strict reps.",
  },
  {
    name: "Lat Pulldown",
    movement_pattern: "pull",
    primary_muscle: "back",
    secondary_muscles: ["biceps"],
    equipment: "cable",
    difficulty: 2,
    description:
      "Pull a wide bar attachment down to the upper chest while seated.",
    tips: "Lean back slightly and pull the bar to the collarbone. Squeeze shoulder blades together at the bottom.",
  },
  {
    name: "Seated Cable Row",
    movement_pattern: "pull",
    primary_muscle: "back",
    secondary_muscles: ["biceps", "traps"],
    equipment: "cable",
    difficulty: 2,
    description:
      "Pull a cable handle to the abdomen while seated with feet braced.",
    tips: "Keep your torso upright—don't lean back excessively. Think about pulling with your elbows.",
  },
  {
    name: "T-Bar Row",
    movement_pattern: "pull",
    primary_muscle: "back",
    secondary_muscles: ["biceps", "core"],
    equipment: "barbell",
    difficulty: 3,
    description:
      "Straddle a landmine barbell and row the loaded end toward the chest.",
    tips: "Use a V-grip handle for a neutral grip. Maintain a flat back throughout.",
  },
  {
    name: "Pendlay Row",
    movement_pattern: "pull",
    primary_muscle: "back",
    secondary_muscles: ["core", "biceps"],
    equipment: "barbell",
    difficulty: 4,
    description:
      "Row a barbell explosively from a dead stop on the floor to the torso each rep.",
    tips: "Reset fully on the floor between reps. Use a strict back position—no momentum from the legs.",
  },
  {
    name: "Machine Row",
    movement_pattern: "pull",
    primary_muscle: "back",
    secondary_muscles: ["biceps"],
    equipment: "machine",
    difficulty: 1,
    description:
      "Pull handles toward your torso on a seated row machine.",
    tips: "Focus on squeezing the shoulder blades together at peak contraction.",
  },
  {
    name: "Band Row",
    movement_pattern: "pull",
    primary_muscle: "back",
    secondary_muscles: ["biceps"],
    equipment: "band",
    difficulty: 1,
    description:
      "Anchor a band at waist height and row the handles to the abdomen.",
    tips: "Great for warm-ups and high-rep finishers. Hold the peak contraction for 1-2 seconds.",
  },

  // ── PULL: Biceps ──
  {
    name: "Chin-up",
    movement_pattern: "pull",
    primary_muscle: "biceps",
    secondary_muscles: ["back", "forearms"],
    equipment: "bodyweight",
    difficulty: 3,
    description:
      "Hang from a bar with an underhand grip and pull your chin above the bar.",
    tips: "Supinated grip biases the biceps more than pull-ups. Full dead hang at the bottom.",
  },
  {
    name: "Barbell Curl",
    movement_pattern: "pull",
    primary_muscle: "biceps",
    secondary_muscles: ["forearms"],
    equipment: "barbell",
    difficulty: 2,
    description:
      "Curl a barbell from hip level to shoulder height with a supinated grip.",
    tips: "Keep elbows stationary at your sides. Avoid swinging the torso.",
  },
  {
    name: "Dumbbell Curl",
    movement_pattern: "pull",
    primary_muscle: "biceps",
    secondary_muscles: ["forearms"],
    equipment: "dumbbell",
    difficulty: 1,
    description:
      "Curl dumbbells alternately or simultaneously from arms-length to shoulder height.",
    tips: "Supinate at the top for extra bicep contraction. Control the eccentric.",
  },
  {
    name: "Hammer Curl",
    movement_pattern: "pull",
    primary_muscle: "biceps",
    secondary_muscles: ["forearms"],
    equipment: "dumbbell",
    difficulty: 2,
    description:
      "Curl dumbbells with a neutral (palms facing each other) grip.",
    tips: "Targets the brachialis and brachioradialis in addition to the biceps. Keep wrists locked.",
  },
  {
    name: "Cable Curl",
    movement_pattern: "pull",
    primary_muscle: "biceps",
    secondary_muscles: ["forearms"],
    equipment: "cable",
    difficulty: 1,
    description:
      "Curl a low-cable bar or handle to shoulder height.",
    tips: "Constant tension from the cable makes this excellent for time-under-tension training.",
  },
  {
    name: "Preacher Curl",
    movement_pattern: "pull",
    primary_muscle: "biceps",
    secondary_muscles: ["forearms"],
    equipment: "machine",
    difficulty: 2,
    description:
      "Curl on a preacher bench that braces the upper arms, isolating the biceps.",
    tips: "Don't fully extend at the bottom to keep tension on the muscle and protect the elbow.",
  },

  // ── PULL: Shoulders (rear delts) ──
  {
    name: "Face Pull",
    movement_pattern: "pull",
    primary_muscle: "shoulders",
    secondary_muscles: ["traps", "back"],
    equipment: "cable",
    difficulty: 1,
    description:
      "Pull a rope attachment toward the face with elbows high, targeting rear deltoids.",
    tips: "Externally rotate at the end of each rep. Use light weight and high reps.",
  },
  {
    name: "Reverse Fly",
    movement_pattern: "pull",
    primary_muscle: "shoulders",
    secondary_muscles: ["traps", "back"],
    equipment: "dumbbell",
    difficulty: 2,
    description:
      "Bend forward and raise dumbbells out to the sides to target the rear deltoids.",
    tips: "Keep a slight bend in the elbows. Focus on squeezing the shoulder blades together.",
  },
  {
    name: "Band Pull-Apart",
    movement_pattern: "pull",
    primary_muscle: "shoulders",
    secondary_muscles: ["traps", "back"],
    equipment: "band",
    difficulty: 1,
    description:
      "Hold a band at arm's length and pull it apart by squeezing the rear delts.",
    tips: "Excellent warm-up and posture exercise. Aim for 15-25 reps per set.",
  },

  // ── PULL: Traps ──
  {
    name: "Barbell Shrug",
    movement_pattern: "pull",
    primary_muscle: "traps",
    secondary_muscles: ["forearms"],
    equipment: "barbell",
    difficulty: 2,
    description:
      "Hold a barbell at arm's length and shrug your shoulders toward your ears.",
    tips: "Hold the top position for a full second. Avoid rolling the shoulders.",
  },
  {
    name: "Dumbbell Shrug",
    movement_pattern: "pull",
    primary_muscle: "traps",
    secondary_muscles: ["forearms"],
    equipment: "dumbbell",
    difficulty: 1,
    description:
      "Hold dumbbells at your sides and shrug your shoulders up.",
    tips: "Dumbbells allow a more natural hand position. Use straps if grip is limiting.",
  },

  // ── PULL: Forearms ──
  {
    name: "Wrist Curl",
    movement_pattern: "pull",
    primary_muscle: "forearms",
    secondary_muscles: [],
    equipment: "dumbbell",
    difficulty: 1,
    description:
      "Rest forearms on a bench with wrists hanging off the edge; curl the wrist up.",
    tips: "Use light weight and high reps (15-20). Let the dumbbell roll to the fingertips for extra ROM.",
  },
  {
    name: "Reverse Barbell Curl",
    movement_pattern: "pull",
    primary_muscle: "forearms",
    secondary_muscles: ["biceps"],
    equipment: "barbell",
    difficulty: 2,
    description:
      "Curl a barbell with an overhand (pronated) grip to target the brachioradialis and forearm extensors.",
    tips: "Use lighter weight than standard curls. Keep elbows pinned to your sides.",
  },

  // ── SQUAT: Quads ──
  {
    name: "Back Squat",
    movement_pattern: "squat",
    primary_muscle: "quads",
    secondary_muscles: ["glutes", "hamstrings", "core"],
    equipment: "barbell",
    difficulty: 4,
    description:
      "Place a barbell on the upper back and squat down until hips are below knee level.",
    tips: "Drive knees out over toes. Keep chest up and core braced. Aim for at least parallel depth.",
  },
  {
    name: "Front Squat",
    movement_pattern: "squat",
    primary_muscle: "quads",
    secondary_muscles: ["glutes", "core"],
    equipment: "barbell",
    difficulty: 4,
    description:
      "Hold a barbell in a front rack position and squat to depth.",
    tips: "Keep elbows high to prevent the bar from rolling forward. Requires good wrist and thoracic mobility.",
  },
  {
    name: "Goblet Squat",
    movement_pattern: "squat",
    primary_muscle: "quads",
    secondary_muscles: ["glutes", "core"],
    equipment: "dumbbell",
    difficulty: 2,
    description:
      "Hold a dumbbell at chest height and squat between your legs.",
    tips: "Great for learning squat mechanics. Push knees out and keep the torso upright.",
  },
  {
    name: "Leg Press",
    movement_pattern: "squat",
    primary_muscle: "quads",
    secondary_muscles: ["glutes"],
    equipment: "machine",
    difficulty: 2,
    description:
      "Push a weighted sled away using your legs on a 45° leg press machine.",
    tips: "Don't lock out knees at the top. Place feet higher on the platform to emphasize glutes.",
  },
  {
    name: "Bulgarian Split Squat",
    movement_pattern: "squat",
    primary_muscle: "quads",
    secondary_muscles: ["glutes", "hamstrings"],
    equipment: "dumbbell",
    difficulty: 3,
    description:
      "Lunge with the rear foot elevated on a bench behind you.",
    tips: "Keep most of your weight on the front foot. Lean the torso slightly forward for glute emphasis.",
  },
  {
    name: "Hack Squat",
    movement_pattern: "squat",
    primary_muscle: "quads",
    secondary_muscles: ["glutes"],
    equipment: "machine",
    difficulty: 2,
    description:
      "Squat on a hack squat machine with the back supported on an angled pad.",
    tips: "Place feet lower on the platform for more quad emphasis. Control the eccentric.",
  },
  {
    name: "Leg Extension",
    movement_pattern: "squat",
    primary_muscle: "quads",
    secondary_muscles: [],
    equipment: "machine",
    difficulty: 1,
    description:
      "Extend the knees against a padded lever on a leg extension machine.",
    tips: "Use a controlled tempo—avoid swinging the weight. Pause at full extension.",
  },
  {
    name: "Walking Lunge",
    movement_pattern: "squat",
    primary_muscle: "quads",
    secondary_muscles: ["glutes", "hamstrings"],
    equipment: "dumbbell",
    difficulty: 3,
    description:
      "Step forward into a lunge, then bring the rear foot forward to continue walking.",
    tips: "Take long steps for glute emphasis, shorter steps for quad emphasis. Keep torso upright.",
  },
  {
    name: "Pistol Squat",
    movement_pattern: "squat",
    primary_muscle: "quads",
    secondary_muscles: ["glutes", "core"],
    equipment: "bodyweight",
    difficulty: 5,
    description:
      "Single-leg squat performed all the way to the bottom with the free leg extended forward.",
    tips: "Progress by using a box or TRX for assistance. Requires excellent mobility and balance.",
  },
  {
    name: "Band Squat",
    movement_pattern: "squat",
    primary_muscle: "quads",
    secondary_muscles: ["glutes"],
    equipment: "band",
    difficulty: 1,
    description:
      "Stand on a resistance band and squat while holding the band at shoulder height for added resistance.",
    tips: "Useful for warm-ups and high-rep sets. Band tension increases at the top of the movement.",
  },
  {
    name: "Zercher Squat",
    movement_pattern: "squat",
    primary_muscle: "quads",
    secondary_muscles: ["core", "glutes"],
    equipment: "barbell",
    difficulty: 4,
    description:
      "Hold a barbell in the crook of your elbows and squat to depth.",
    tips: "Wrap the bar in a pad for comfort. Forces an extremely upright torso position.",
  },

  // ── SQUAT: Calves ──
  {
    name: "Standing Calf Raise",
    movement_pattern: "squat",
    primary_muscle: "calves",
    secondary_muscles: [],
    equipment: "machine",
    difficulty: 1,
    description:
      "Rise onto the toes under a shoulder-padded calf raise machine.",
    tips: "Pause at the top and get a full stretch at the bottom. Slow eccentric (3-4 seconds).",
  },
  {
    name: "Seated Calf Raise",
    movement_pattern: "squat",
    primary_muscle: "calves",
    secondary_muscles: [],
    equipment: "machine",
    difficulty: 1,
    description:
      "Raise the heels while seated with a pad across the knees, targeting the soleus.",
    tips: "The bent-knee position shifts emphasis to the soleus. Use a 2-second pause at the top.",
  },
  {
    name: "Dumbbell Calf Raise",
    movement_pattern: "squat",
    primary_muscle: "calves",
    secondary_muscles: [],
    equipment: "dumbbell",
    difficulty: 1,
    description:
      "Hold a dumbbell and stand on a step or plate; rise onto the toes and lower for a full stretch.",
    tips: "Perform one leg at a time for balanced development. Use a ledge for full range of motion.",
  },

  // ── HINGE: Hamstrings ──
  {
    name: "Deadlift",
    movement_pattern: "hinge",
    primary_muscle: "hamstrings",
    secondary_muscles: ["back", "glutes", "core", "forearms"],
    equipment: "barbell",
    difficulty: 5,
    description:
      "Lift a barbell from the floor to hip level by extending the hips and knees.",
    tips: "Keep the bar close to the body. Brace your core, push the floor away, and lock out with the glutes.",
  },
  {
    name: "Romanian Deadlift",
    movement_pattern: "hinge",
    primary_muscle: "hamstrings",
    secondary_muscles: ["glutes", "back"],
    equipment: "barbell",
    difficulty: 3,
    description:
      "Lower a barbell along the thighs by hinging at the hips with a slight knee bend.",
    tips: "Push your hips back like closing a door with your glutes. Feel the stretch in the hamstrings.",
  },
  {
    name: "Dumbbell Romanian Deadlift",
    movement_pattern: "hinge",
    primary_muscle: "hamstrings",
    secondary_muscles: ["glutes"],
    equipment: "dumbbell",
    difficulty: 2,
    description:
      "Hinge at the hips and lower dumbbells along the legs with a slight knee bend.",
    tips: "Dumbbells allow a more natural path and better range of motion than a barbell for some lifters.",
  },
  {
    name: "Good Morning",
    movement_pattern: "hinge",
    primary_muscle: "hamstrings",
    secondary_muscles: ["back", "glutes"],
    equipment: "barbell",
    difficulty: 3,
    description:
      "With a barbell on the upper back, bow forward by hinging at the hips, then return to standing.",
    tips: "Use moderate weight and a controlled tempo. Keep the knees slightly bent.",
  },
  {
    name: "Leg Curl",
    movement_pattern: "hinge",
    primary_muscle: "hamstrings",
    secondary_muscles: [],
    equipment: "machine",
    difficulty: 1,
    description:
      "Curl the heels toward the glutes against a padded lever on a lying or seated leg curl machine.",
    tips: "Control the eccentric—don't let the weight slam down. Squeeze the hamstrings at peak contraction.",
  },
  {
    name: "Nordic Hamstring Curl",
    movement_pattern: "hinge",
    primary_muscle: "hamstrings",
    secondary_muscles: [],
    equipment: "bodyweight",
    difficulty: 4,
    description:
      "Kneel with ankles anchored and slowly lower your torso forward, resisting with the hamstrings.",
    tips: "One of the best exercises for hamstring injury prevention. Use a push-off from the floor to assist.",
  },
  {
    name: "Band Good Morning",
    movement_pattern: "hinge",
    primary_muscle: "hamstrings",
    secondary_muscles: ["glutes"],
    equipment: "band",
    difficulty: 2,
    description:
      "Loop a band behind the neck and under the feet; hinge forward and return to standing.",
    tips: "Useful for warm-ups and light accessory work. Increasing tension at the top reinforces lockout.",
  },

  // ── HINGE: Glutes ──
  {
    name: "Hip Thrust",
    movement_pattern: "hinge",
    primary_muscle: "glutes",
    secondary_muscles: ["hamstrings"],
    equipment: "barbell",
    difficulty: 3,
    description:
      "Sit on the floor with upper back against a bench, roll a barbell over the hips, and thrust upward.",
    tips: "Drive through the heels and squeeze glutes at the top. Use a bar pad for comfort.",
  },
  {
    name: "Glute Bridge",
    movement_pattern: "hinge",
    primary_muscle: "glutes",
    secondary_muscles: ["hamstrings"],
    equipment: "bodyweight",
    difficulty: 1,
    description:
      "Lie on the floor and drive the hips up by squeezing the glutes.",
    tips: "Great for activation before heavy lifts. Hold the top for 2-3 seconds each rep.",
  },
  {
    name: "Cable Pull-Through",
    movement_pattern: "hinge",
    primary_muscle: "glutes",
    secondary_muscles: ["hamstrings"],
    equipment: "cable",
    difficulty: 2,
    description:
      "Face away from a low cable, hinge forward, then drive the hips forward to pull the rope through the legs.",
    tips: "Hinge deep and snap the hips through at the top. Constant cable tension is the key benefit.",
  },
  {
    name: "Kettlebell Swing",
    movement_pattern: "hinge",
    primary_muscle: "glutes",
    secondary_muscles: ["hamstrings", "core"],
    equipment: "dumbbell",
    difficulty: 2,
    description:
      "Hike a weight between the legs and drive the hips forward to swing it to chest height.",
    tips: "Power comes from the hip snap, not the arms. Keep arms relaxed and core braced. Can use a dumbbell or kettlebell.",
  },
  {
    name: "Sumo Deadlift",
    movement_pattern: "hinge",
    primary_muscle: "glutes",
    secondary_muscles: ["hamstrings", "back", "core"],
    equipment: "barbell",
    difficulty: 4,
    description:
      "Deadlift with a wide stance and hands inside the knees, shifting more emphasis to the glutes.",
    tips: "Push the knees out over the toes. The wider stance shortens the range of motion compared to conventional.",
  },

  // ── CORE ──
  {
    name: "Plank",
    movement_pattern: "core",
    primary_muscle: "core",
    secondary_muscles: ["shoulders"],
    equipment: "bodyweight",
    difficulty: 1,
    description:
      "Hold a push-up position (or forearm position) with the body in a straight line.",
    tips: "Squeeze glutes and brace as if someone will poke your stomach. Build up to 60-second holds.",
  },
  {
    name: "Cable Woodchop",
    movement_pattern: "core",
    primary_muscle: "core",
    secondary_muscles: ["shoulders"],
    equipment: "cable",
    difficulty: 2,
    description:
      "Rotate the torso to pull a cable diagonally from high to low (or low to high).",
    tips: "The power comes from the hips and core rotation, not the arms. Control the return.",
  },
  {
    name: "Hanging Leg Raise",
    movement_pattern: "core",
    primary_muscle: "core",
    secondary_muscles: ["forearms"],
    equipment: "bodyweight",
    difficulty: 3,
    description:
      "Hang from a pull-up bar and raise the legs to at least 90° by curling the pelvis.",
    tips: "Avoid swinging. Bend knees to make it easier; keep legs straight for a greater challenge.",
  },
  {
    name: "Ab Rollout",
    movement_pattern: "core",
    primary_muscle: "core",
    secondary_muscles: [],
    equipment: "bodyweight",
    difficulty: 3,
    description:
      "Kneel and roll an ab wheel (or barbell) forward, extending the body, then pull back.",
    tips: "Only go as far as you can control without your lower back collapsing. Progress range over time.",
  },
  {
    name: "Russian Twist",
    movement_pattern: "core",
    primary_muscle: "core",
    secondary_muscles: [],
    equipment: "dumbbell",
    difficulty: 2,
    description:
      "Sit with knees bent, lean back slightly, and rotate a dumbbell from side to side.",
    tips: "Lift your feet off the ground for added difficulty. Focus on controlled rotation, not speed.",
  },
  {
    name: "Pallof Press",
    movement_pattern: "core",
    primary_muscle: "core",
    secondary_muscles: [],
    equipment: "cable",
    difficulty: 2,
    description:
      "Stand sideways to a cable, press the handle straight out from the chest, and resist the rotation.",
    tips: "Anti-rotation is the goal. Hold the extended position for 2-3 seconds per rep.",
  },
  {
    name: "Machine Crunch",
    movement_pattern: "core",
    primary_muscle: "core",
    secondary_muscles: [],
    equipment: "machine",
    difficulty: 1,
    description:
      "Crunch forward against resistance on a seated ab machine.",
    tips: "Focus on curling the rib cage toward the pelvis, not just bending at the hips.",
  },
  {
    name: "Dead Bug",
    movement_pattern: "core",
    primary_muscle: "core",
    secondary_muscles: [],
    equipment: "bodyweight",
    difficulty: 1,
    description:
      "Lie on the back and alternately extend opposite arm and leg while keeping the lower back pressed to the floor.",
    tips: "Exhale fully as you extend. If your lower back lifts off, reduce the range of motion.",
  },
  {
    name: "Band Anti-Rotation Press",
    movement_pattern: "core",
    primary_muscle: "core",
    secondary_muscles: [],
    equipment: "band",
    difficulty: 2,
    description:
      "Similar to a Pallof press but using a resistance band anchored to the side.",
    tips: "Great for home workouts. Step further from the anchor to increase resistance.",
  },

  // ── CARRY ──
  {
    name: "Farmer's Walk",
    movement_pattern: "carry",
    primary_muscle: "forearms",
    secondary_muscles: ["traps", "core"],
    equipment: "dumbbell",
    difficulty: 2,
    description:
      "Hold heavy dumbbells at your sides and walk for distance or time.",
    tips: "Stand tall, keep shoulders packed, and take short, quick steps. Grip will often be the limiting factor.",
  },
  {
    name: "Suitcase Carry",
    movement_pattern: "carry",
    primary_muscle: "core",
    secondary_muscles: ["forearms", "traps"],
    equipment: "dumbbell",
    difficulty: 2,
    description:
      "Carry a heavy dumbbell on one side while walking, challenging the core to resist lateral flexion.",
    tips: "Keep the torso perfectly upright—don't lean to the loaded side. Walk 30-40 meters per set.",
  },
  {
    name: "Trap Bar Carry",
    movement_pattern: "carry",
    primary_muscle: "traps",
    secondary_muscles: ["forearms", "core"],
    equipment: "barbell",
    difficulty: 3,
    description:
      "Pick up a loaded trap bar and walk for distance, building total-body stability and grip.",
    tips: "Allows heavier loads than dumbbell carries. Keep a tall posture and brace the core throughout.",
  },
  {
    name: "Overhead Carry",
    movement_pattern: "carry",
    primary_muscle: "shoulders",
    secondary_muscles: ["core", "traps"],
    equipment: "dumbbell",
    difficulty: 3,
    description:
      "Press a dumbbell overhead and walk for distance while keeping the arm locked out.",
    tips: "Challenges shoulder stability and core anti-lateral flexion. Start light and progress slowly.",
  },
];

async function seed() {
  console.log(`Seeding ${exercises.length} exercises...`);

  const { error: deleteError } = await supabase
    .from("exercises")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (deleteError) {
    console.error("Error clearing existing exercises:", deleteError.message);
    process.exit(1);
  }

  const { data, error } = await supabase
    .from("exercises")
    .insert(exercises)
    .select();

  if (error) {
    console.error("Error inserting exercises:", error.message);
    process.exit(1);
  }

  console.log(`Successfully seeded ${data.length} exercises.`);

  const patterns = [...new Set(exercises.map((e) => e.movement_pattern))];
  for (const p of patterns) {
    const count = exercises.filter((e) => e.movement_pattern === p).length;
    console.log(`  ${p}: ${count}`);
  }

  const equipment = [...new Set(exercises.map((e) => e.equipment))];
  console.log(`\nEquipment types covered: ${equipment.join(", ")}`);
}

seed();
