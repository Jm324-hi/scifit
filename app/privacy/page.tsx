import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Privacy Policy - SciFit",
  description:
    "Learn how SciFit collects, uses, and protects your personal data.",
};

const sections = [
  {
    title: "1. What Data We Collect",
    content: `SciFit collects information you voluntarily provide when using our service, including:

• Account information — email address and hashed password used for authentication.
• Training data — workout logs, exercise selections, sets, reps, weight, and RPE values you record during training sessions.
• Recovery data — sleep hours, muscle soreness (DOMS), stress levels, and readiness scores you submit through the recovery tracker.
• Profile preferences — training goal, frequency, equipment access, experience level, and available session time.

We do not collect location data, contacts, or any information unrelated to your fitness journey.`,
  },
  {
    title: "2. How We Use Your Data",
    content: `Your data is used exclusively to power the SciFit experience:

• Personalized training plans — your profile preferences drive the plan generator so your program matches your goals and schedule.
• Progressive overload engine — workout history is analyzed to recommend weight and volume adjustments for your next session.
• Recovery-driven scheduling — sleep, soreness, and stress inputs are used to calculate readiness scores and adapt today's workout intensity.
• Progress tracking — historical data is aggregated to display personal records, weekly trends, and training streaks.

We never sell, rent, or share your personal data with third parties for advertising or marketing purposes.`,
  },
  {
    title: "3. Data Storage and Security",
    content: `All user data is stored securely via Supabase, which provides:

• Row-Level Security (RLS) — ensuring each user can only access their own data at the database level.
• Encryption at rest and in transit — data is encrypted using industry-standard protocols (AES-256 for storage, TLS 1.2+ for transmission).
• Hosted on secure cloud infrastructure with regular security audits and compliance with SOC 2 Type II standards.

We retain your data for as long as your account is active. You may request deletion at any time.`,
  },
  {
    title: "4. Third-Party Services",
    content: `SciFit integrates with the following third-party services to operate:

• Supabase — authentication, database storage, and real-time data management.
• Potential AI services — we may use AI-powered analysis to improve training recommendations in the future. If implemented, data shared with AI providers will be anonymized and never include personally identifiable information.

We carefully vet all third-party providers to ensure they meet our privacy and security standards.`,
  },
  {
    title: "5. Your Rights",
    content: `You have full control over your data. At any time you may:

• Access your data — view all stored information through the app's Dashboard, History, and Progress pages.
• Export your data — request a full export of your training and recovery data via Settings (Pro feature).
• Delete your account — permanently remove all your data from our servers through the Settings page or by contacting us.
• Correct your data — update your profile preferences and training records at any time.

Requests will be processed within 30 days in compliance with applicable data protection regulations (including GDPR and CCPA where applicable).`,
  },
  {
    title: "6. Cookies",
    content: `SciFit uses only essential cookies required to maintain your authentication session and basic application functionality. We do not use tracking cookies, third-party advertising cookies, or analytics cookies that identify individual users.`,
  },
  {
    title: "7. Disclaimer",
    content: `SciFit provides fitness guidance based on exercise science principles and user-reported data. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider before starting any new exercise program, especially if you have pre-existing medical conditions or injuries.

By using SciFit, you acknowledge that all training decisions are made at your own risk.`,
  },
  {
    title: "8. Policy Updates",
    content: `We may update this privacy policy from time to time to reflect changes in our practices or applicable regulations. For significant changes, we will notify you via in-app notification. Continued use of SciFit after an update constitutes acceptance of the revised policy.`,
  },
  {
    title: "9. Contact",
    content: `If you have questions about this privacy policy or wish to exercise your data rights, please contact us at:

Email: privacy@scifit.app

We aim to respond to all inquiries within 5 business days.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">
          Last updated: March 2026
        </p>
      </div>

      <Card>
        <CardContent className="space-y-8 pt-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            SciFit (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed
            to protecting your privacy. This policy explains what data we
            collect, how we use it, and your rights regarding that data.
          </p>

          {sections.map((section) => (
            <div key={section.title} className="space-y-2">
              <h2 className="font-semibold">{section.title}</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {section.content}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
