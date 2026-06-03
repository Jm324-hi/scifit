import type { Metadata } from "next";
import ScienceContent from "@/components/science/ScienceContent";

export const metadata: Metadata = {
  title: "The Science",
  description:
    "How Kineroz turns established exercise-science and rehabilitation methods — the FITT-VP model, autoregulation, progressive overload, and periodization — into adaptive training that takes you safely from recovery to performance.",
};

export default function SciencePage() {
  return <ScienceContent />;
}
