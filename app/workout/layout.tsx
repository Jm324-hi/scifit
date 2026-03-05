import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Workout",
};

export default function WorkoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
