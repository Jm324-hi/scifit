import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
