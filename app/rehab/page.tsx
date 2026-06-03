import type { Metadata } from "next";
import RehabContent from "@/components/rehab/RehabContent";

export const metadata: Metadata = {
  title: "Recover & Prevent",
  description:
    "Evidence-based home rehab and injury prevention — select your area, get mobility and loading guidance, and move safely from recovery to performance.",
};

export default function RehabPage() {
  return <RehabContent />;
}
