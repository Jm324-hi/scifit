import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Recovery Readiness",
};

export default function RecoveryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
