export interface Exercise {
  id: string;
  name: string;
  movement_pattern: string;
  primary_muscle: string;
  secondary_muscles: string[];
  equipment: string;
  difficulty: number;
  description: string;
  tips: string;
  video_id?: string | null;
}

const EQUIPMENT_SIMILARITY: Record<string, string[]> = {
  barbell: ["dumbbell", "machine", "cable"],
  dumbbell: ["barbell", "cable", "machine"],
  machine: ["cable", "dumbbell", "barbell"],
  cable: ["machine", "dumbbell", "band"],
  bodyweight: ["band", "machine", "dumbbell"],
  band: ["bodyweight", "cable", "dumbbell"],
};

function equipmentScore(
  candidate: string,
  original: string,
  userEquipment?: string[]
): number {
  if (userEquipment) {
    if (!userEquipment.includes(candidate)) return -100;
    if (candidate === original) return 10;
    return 5;
  }

  if (candidate === original) return 10;

  const similarity = EQUIPMENT_SIMILARITY[original];
  if (!similarity) return 0;
  const idx = similarity.indexOf(candidate);
  return idx === -1 ? 0 : (similarity.length - idx) * 2;
}

function difficultyScore(candidateDiff: number, originalDiff: number): number {
  return -Math.abs(candidateDiff - originalDiff) * 3;
}

function secondaryOverlap(a: string[], b: string[]): number {
  const setB = new Set(b);
  return a.filter((m) => setB.has(m)).length;
}

/**
 * Find up to 5 substitute exercises for the given exercise.
 *
 * Matches on the same movement_pattern + primary_muscle,
 * then ranks by equipment similarity, difficulty closeness,
 * and secondary muscle overlap.
 */
export function findSubstitutes(
  exercise: Exercise,
  allExercises: Exercise[],
  userEquipment?: string[]
): Exercise[] {
  const candidates = allExercises.filter(
    (e) =>
      e.id !== exercise.id &&
      e.movement_pattern === exercise.movement_pattern &&
      e.primary_muscle === exercise.primary_muscle
  );

  const scored = candidates.map((c) => {
    const eqScore = equipmentScore(c.equipment, exercise.equipment, userEquipment);
    const diffScore = difficultyScore(c.difficulty, exercise.difficulty);
    const overlapScore = secondaryOverlap(
      c.secondary_muscles,
      exercise.secondary_muscles
    );
    return { exercise: c, score: eqScore + diffScore + overlapScore };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 5).map((s) => s.exercise);
}
