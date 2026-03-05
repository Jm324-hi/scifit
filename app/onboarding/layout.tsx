import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Set Up Your Profile",
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
