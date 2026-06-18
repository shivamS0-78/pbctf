"use client";

import {
  Calendar,
  Users,
  FileText,
  Award,
  Trophy,
  HelpCircle,
  LogIn,
  UserPlus,
  ChevronRight,
} from "lucide-react";
import { FormSection } from "./form-section";
import { Button } from "./button";
import { Card } from "./card";

interface LandingContainerProps {
  onNavigate: (view: string) => void;
}

const TIMELINE = [
  { Icon: Calendar, title: "Registration",                  meta: "Dec 1 – Dec 20, 2024", state: "live" as const },
  { Icon: Users,    title: "Team Formation",                meta: "Dec 1 – Dec 22, 2024", state: "next" as const },
  { Icon: FileText, title: "Capture the Flag (CTF)",        meta: "Jan 15–16, 2025",       state: "queued" as const },
  { Icon: Award,    title: "Results & Awards",              meta: "Jan 20, 2025",          state: "queued" as const },
];

const PRIZES = [
  { rank: "01", label: "1st", value: "$5,000",  tint: "from-brand to-brand-hover",     ink: "text-brand-ink" },
  { rank: "02", label: "2nd", value: "$3,000",  tint: "from-white/30 to-white/15",     ink: "text-ink" },
  { rank: "03", label: "3rd", value: "$1,500",  tint: "from-[#cd7f32]/70 to-[#cd7f32]/30", ink: "text-ink" },
];

const FAQS = [
  {
    q: "Who can participate?",
    a: "Students from any university or college can participate. Teams can have at most two members.",
  },
  {
    q: "Is it free to participate?",
    a: "Yes, registration is completely free. We provide meals, refreshments, and swag.",
  },
  {
    q: "What should I bring?",
    a: "Your laptop, charger, and enthusiasm. We'll provide everything else.",
  },
];

export function LandingContainer({ onNavigate }: LandingContainerProps) {
  return (
    <div className="flex flex-col gap-12 md:gap-16 w-full max-w-[960px] mx-auto anim-fade-up">
      {/* Hero */}
      <section className="flex flex-col items-center text-center gap-5">
        <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full border border-brand/45 bg-brand-soft text-brand font-mono text-[10.5px] uppercase tracking-[0.18em]">
          <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-brand">
            <span className="absolute inset-0 rounded-full bg-brand anim-pulse-soft opacity-70" />
          </span>
          Registration Open
        </div>

        <h1 className="font-heading text-balance text-[40px] sm:text-[52px] md:text-[64px] font-bold text-ink leading-[1.02] tracking-tight">
          Welcome to{" "}
          <span className="inline-block">
            <span className="text-ink">PBCTF</span>{" "}
            <span className="font-mono text-brand" style={{ textShadow: "0 0 28px rgba(0,255,136,0.35)" }}>
              5.0
            </span>
          </span>
        </h1>

        <p className="font-body text-[15px] sm:text-[16px] text-ink-secondary leading-relaxed max-w-[640px]">
          An intense Capture the Flag competition. Solve security challenges, work with talented hackers,
          and compete for real prizes. web, pwn, reverse, crypto, forensics.
        </p>

        <div className="flex flex-col sm:flex-row gap-2.5 mt-2">
          <Button onClick={() => onNavigate("register")} variant="primary" size="lg">
            <UserPlus className="w-4 h-4" />
            Register Now
            <ChevronRight className="w-4 h-4 -mr-1" />
          </Button>
          <Button onClick={() => onNavigate("login")} variant="secondary" size="lg">
            <LogIn className="w-4 h-4" />
            Login
          </Button>
        </div>
      </section>

      {/* Timeline */}
      <FormSection title="Event Timeline" eyebrow="01 · Schedule">
        <ol className="relative pl-6 md:pl-7 border-l border-[var(--border-soft)] space-y-5">
          {TIMELINE.map(({ Icon, title, meta, state }, i) => {
            const live = state === "live";
            return (
              <li key={title} className="relative pl-1">
                <span
                  className={[
                    "absolute -left-[27px] md:-left-[31px] top-0 inline-flex w-10 h-10 items-center justify-center rounded-md border",
                    live
                      ? "bg-brand-soft border-brand/55"
                      : "bg-surface-inset border-[var(--border-soft)]",
                  ].join(" ")}
                >
                  <Icon className={`w-4 h-4 ${live ? "text-brand" : "text-ink-secondary"}`} />
                  {live && (
                    <span className="absolute -right-0.5 -top-0.5 inline-flex w-2 h-2 rounded-full bg-brand anim-pulse-soft" />
                  )}
                </span>
                <div className="flex items-baseline justify-between flex-wrap gap-2 pl-3">
                  <h3 className="font-heading text-[15px] md:text-[16px] font-semibold text-ink">
                    {title}
                  </h3>
                  <span className="font-mono text-[11px] text-ink-muted uppercase tracking-[0.14em]">
                    {meta}
                  </span>
                </div>
                {live && (
                  <p className="pl-3 mt-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-brand">
                    · live now
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      </FormSection>

      {/* Prizes */}
      <FormSection title="Prizes & Benefits" eyebrow="02 · Rewards">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {PRIZES.map(({ rank, label, value, tint, ink }) => (
            <Card key={rank} className="text-center !p-5">
              <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-muted mb-3">
                rank · {rank}
              </div>
              <div className={`inline-flex w-12 h-12 mx-auto mb-3 items-center justify-center rounded-md bg-gradient-to-br ${tint}`}>
                <Trophy className={`w-5 h-5 ${ink}`} />
              </div>
              <h3 className="font-heading text-[15px] font-semibold text-ink mb-1">
                {label} Prize
              </h3>
              <p className="font-mono text-[24px] sm:text-[28px] font-bold text-brand tracking-tight">
                {value}
              </p>
            </Card>
          ))}
        </div>

        <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
          {[
            "Mentorship from industry experts",
            "Networking opportunities with sponsors",
            "Free swag, meals, and refreshments",
            "Certificate of participation for all attendees",
          ].map((perk) => (
            <li key={perk} className="flex items-start gap-2.5 text-[13.5px] text-ink-secondary font-body">
              <span className="mt-2 inline-block w-1 h-1 rounded-full bg-brand shrink-0" />
              {perk}
            </li>
          ))}
        </ul>
      </FormSection>

      {/* FAQ */}
      <FormSection title="Frequently Asked" eyebrow="03 · FAQ">
        <div className="grid gap-3">
          {FAQS.map(({ q, a }, i) => (
            <Card key={q} className="!p-5">
              <div className="flex items-start gap-3">
                <div className="shrink-0 inline-flex w-8 h-8 items-center justify-center rounded-md bg-brand-soft border border-brand/30">
                  <HelpCircle className="w-4 h-4 text-brand" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-muted mb-1">
                    Q · {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="font-heading text-[15px] font-semibold text-ink mb-1.5">
                    {q}
                  </h3>
                  <p className="text-[13.5px] text-ink-secondary font-body leading-relaxed">
                    {a}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </FormSection>
    </div>
  );
}
