import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Workout History",
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
