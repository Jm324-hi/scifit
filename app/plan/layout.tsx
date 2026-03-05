import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Training Plan",
};

export default function PlanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
