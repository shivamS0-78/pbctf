"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Trophy,
  XCircle,
  Check,
  X,
} from "lucide-react";
import { Button } from "./button";

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

interface DeadlineTimerProps {
  teamStatus?: string;
  hasSubmitted?: boolean;
  isEvaluated?: boolean;
  evaluations?: Array<{
    evaluatorId: string;
    name: string;
    tier: "strongly_accepted" | "accepted" | "borderline" | "rejected";
    comment: string;
    createdAt: Date | string;
  }>;
  hasTeam?: boolean;
  rsvpStatus?: "pending" | "confirmed" | "declined";
  onRSVP?: (status: "confirmed" | "declined") => void;
}

export function DeadlineTimer({
  teamStatus,
  hasSubmitted = false,
  isEvaluated = false,
  evaluations = [],
  hasTeam = true,
  rsvpStatus = "pending",
  onRSVP,
}: DeadlineTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [serverOffset, setServerOffset] = useState(0);
  const [error, setError] = useState(false);
  const [rsvpDeadline, setRsvpDeadline] = useState<Date | null>(null);
  const [rsvpTimeRemaining, setRsvpTimeRemaining] = useState<TimeRemaining | null>(null);
  const [isRsvpExpired, setIsRsvpExpired] = useState(false);

  useEffect(() => {
    const fetchDeadline = async () => {
      try {
        const response = await fetch("/api/config/deadline");
        const data = await response.json();
        if (data.success && data.data) {
          const serverTime = new Date(data.data.serverTime).getTime();
          const clientTime = Date.now();
          setServerOffset(serverTime - clientTime);
          setDeadline(new Date(data.data.deadline));
          setIsExpired(data.data.isExpired);
          if (data.data.rsvpDeadline) {
            setRsvpDeadline(new Date(data.data.rsvpDeadline));
            setIsRsvpExpired(data.data.isRsvpExpired);
          }
        }
      } catch (error) {
        console.error("Failed to fetch deadline:", error);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeadline();
  }, []);

  useEffect(() => {
    if (!deadline || isExpired) return;
    const calculateTimeRemaining = (): TimeRemaining => {
      const now = Date.now() + serverOffset;
      const total = deadline.getTime() - now;
      if (total <= 0) {
        setIsExpired(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      }
      return {
        seconds: Math.floor((total / 1000) % 60),
        minutes: Math.floor((total / 1000 / 60) % 60),
        hours: Math.floor((total / (1000 * 60 * 60)) % 24),
        days: Math.floor(total / (1000 * 60 * 60 * 24)),
        total,
      };
    };
    const timer = setInterval(() => setTimeRemaining(calculateTimeRemaining()), 1000);
    setTimeRemaining(calculateTimeRemaining());
    return () => clearInterval(timer);
  }, [deadline, serverOffset, isExpired]);

  useEffect(() => {
    if (!rsvpDeadline || isRsvpExpired) return;
    const calculateRsvpTimeRemaining = (): TimeRemaining => {
      const now = Date.now() + serverOffset;
      const total = rsvpDeadline.getTime() - now;
      if (total <= 0) {
        setIsRsvpExpired(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      }
      return {
        seconds: Math.floor((total / 1000) % 60),
        minutes: Math.floor((total / 1000 / 60) % 60),
        hours: Math.floor((total / (1000 * 60 * 60)) % 24),
        days: Math.floor(total / (1000 * 60 * 60 * 24)),
        total,
      };
    };
    const timer = setInterval(() => setRsvpTimeRemaining(calculateRsvpTimeRemaining()), 1000);
    setRsvpTimeRemaining(calculateRsvpTimeRemaining());
    return () => clearInterval(timer);
  }, [rsvpDeadline, serverOffset, isRsvpExpired]);

  if (isLoading) {
    return (
      <div className="w-full relative rounded-[20px] overflow-hidden">
        <div className="absolute inset-0 bg-[rgba(13,13,13,0.85)] backdrop-blur-[24px]" />
        <div className="absolute inset-0 rounded-[20px] border border-[rgba(0,255,136,0.15)]" />
        <div className="relative z-10 p-[24px] h-[80px] flex items-center justify-center">
          <div className="w-full h-[24px] bg-[rgba(0,255,136,0.05)] rounded-[6px] animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full relative rounded-[20px] overflow-hidden">
        <div className="absolute inset-0 bg-[rgba(13,13,13,0.85)] backdrop-blur-[24px]" />
        <div className="absolute inset-0 rounded-[20px] border border-[rgba(0,255,136,0.15)]" />
        <div className="relative z-10 p-[24px]">
          <p className="text-[14px] text-white/50 text-center" style={{ fontFamily: "var(--font-body)" }}>
            Failed to load deadline timer
          </p>
        </div>
      </div>
    );
  }

  const submitted =
    hasSubmitted ||
    teamStatus === "submitted" ||
    teamStatus === "shortlisted" ||
    teamStatus === "rsvped";
  const hasRejectedEvaluation = evaluations.some((e) => e.tier === "rejected");
  const hasAcceptedEvaluation = evaluations.some(
    (e) => e.tier === "accepted" || e.tier === "strongly_accepted",
  );

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center justify-center min-w-[64px] p-[14px] rounded-[12px] bg-[rgba(0,0,0,0.5)] border border-[rgba(0,255,136,0.2)]">
      <span
        className="text-[28px] font-bold text-[#00FF88] tabular-nums leading-none"
        style={{ fontFamily: "var(--font-heading)", textShadow: "0 0 20px rgba(0,255,136,0.5)" }}
      >
        {String(value).padStart(2, "0")}
      </span>
      <span
        className="text-[9px] text-white/40 uppercase tracking-[0.2em] mt-[4px]"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {label}
      </span>
    </div>
  );

  const SmallTimeBox = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center justify-center min-w-[52px] p-[10px] rounded-[10px] bg-[rgba(0,0,0,0.4)] border border-[rgba(0,255,136,0.15)]">
      <span
        className="text-[20px] font-bold text-[#00FF88] tabular-nums leading-none"
        style={{ fontFamily: "var(--font-heading)", textShadow: "0 0 12px rgba(0,255,136,0.4)" }}
      >
        {String(value).padStart(2, "0")}
      </span>
      <span
        className="text-[8px] text-white/40 uppercase tracking-[0.15em] mt-[3px]"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {label}
      </span>
    </div>
  );

  const RsvpStatusBadge = ({ status, message }: { status: "confirmed" | "declined"; message: string }) => (
    <div className={`flex items-center justify-center gap-[8px] p-[12px] rounded-[12px] mt-[8px] border ${
      status === "confirmed"
        ? "bg-[rgba(0,255,136,0.08)] border-[rgba(0,255,136,0.3)]"
        : "bg-[rgba(0,0,0,0.4)] border-[rgba(0,255,136,0.2)]"
    }`}>
      {status === "confirmed" ? (
        <Check className="w-4 h-4 text-[#00FF88]" />
      ) : (
        <X className="w-4 h-4 text-white/50" />
      )}
      <p
        className={`text-[14px] font-medium ${status === "confirmed" ? "text-[#00FF88]" : "text-white/50"}`}
        style={{ fontFamily: "var(--font-body)" }}
      >
        {message}
      </p>
    </div>
  );

  const getHeaderIcon = () => {
    if (isExpired && hasTeam && isEvaluated) {
      if (hasRejectedEvaluation) return <XCircle className="w-5 h-5 text-white/40" />;
      if (hasAcceptedEvaluation) return <Trophy className="w-5 h-5 text-[#00FF88]" />;
      return <AlertTriangle className="w-5 h-5 text-[#8CFF00]" />;
    }
    if (isExpired) return <AlertTriangle className="w-5 h-5 text-[#8CFF00]" />;
    if (submitted) return <CheckCircle2 className="w-5 h-5 text-[#00FF88]" />;
    return <Clock className="w-5 h-5 text-white/60" />;
  };

  const getHeaderText = () => {
    if (isExpired && hasTeam && isEvaluated) {
      if (hasRejectedEvaluation) return "Team Not Selected";
      if (hasAcceptedEvaluation) return "🎉 Your Team Has Been Selected!";
      return "Registration Closed";
    }
    if (isExpired) return "Registration Closed";
    if (submitted) return "You're Registered!";
    return "Registration Deadline";
  };

  const getHeaderColor = () => {
    if (isExpired && hasTeam && isEvaluated && hasAcceptedEvaluation) return "text-[#00FF88]";
    if (submitted) return "text-white";
    return "text-white";
  };

  return (
    <div className="w-full relative rounded-[20px]">
      {/* Background + grid clipped by their own rounded wrapper */}
      <div className="absolute inset-0 rounded-[20px] overflow-hidden">
        <div className="absolute inset-0 bg-[rgba(13,13,13,0.85)] backdrop-blur-[24px]" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,255,136,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.5)]" />
      </div>
      {/* Uniform 1px border */}
      <div className="absolute inset-0 rounded-[20px] border border-[rgba(0,255,136,0.35)] pointer-events-none z-20" />

      <div className="relative z-10 p-[24px] flex flex-col items-center justify-center text-center">
        {/* Header */}
        <div className="flex items-center justify-center gap-[10px] mb-[20px] w-full">
          {getHeaderIcon()}
          <h3
            className={`text-[16px] font-semibold ${getHeaderColor()}`}
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {getHeaderText()}
          </h3>
        </div>

        {/* Countdown or Status Message */}
        {isExpired ? (
          <div className="flex flex-col items-center gap-[12px] w-full">
            {hasTeam ? (
              isEvaluated ? (
                hasRejectedEvaluation ? (
                  <>
                    <p className="text-[15px] text-white/50 font-medium text-center w-full" style={{ fontFamily: "var(--font-body)" }}>
                      Unfortunately, your team was not selected for the next round.
                    </p>
                    <p className="text-[13px] text-white/40 text-center w-full" style={{ fontFamily: "var(--font-body)" }}>
                      Thank you for participating! We appreciate your effort and dedication.
                    </p>
                  </>
                ) : hasAcceptedEvaluation ? (
                  <>
                    <p className="text-[15px] text-[#00FF88] font-semibold text-center w-full" style={{ fontFamily: "var(--font-body)" }}>
                      🎉 Congratulations! Your team has been selected for the next round!
                    </p>
                    <p className="text-[13px] text-white/60 text-center w-full" style={{ fontFamily: "var(--font-body)" }}>
                      Please confirm your participation:
                    </p>

                    {/* RSVP Deadline Timer */}
                    {rsvpTimeRemaining && !isRsvpExpired && (
                      <div className="w-full mb-[8px]">
                        <p className="text-[11px] text-white/40 text-center mb-[10px] uppercase tracking-[0.15em]" style={{ fontFamily: "var(--font-body)" }}>
                          RSVP Deadline
                        </p>
                        <div className="flex justify-center gap-[8px] w-full">
                          <SmallTimeBox value={rsvpTimeRemaining.days} label="Days" />
                          <SmallTimeBox value={rsvpTimeRemaining.hours} label="Hours" />
                          <SmallTimeBox value={rsvpTimeRemaining.minutes} label="Mins" />
                          <SmallTimeBox value={rsvpTimeRemaining.seconds} label="Secs" />
                        </div>
                      </div>
                    )}

                    {isRsvpExpired && (
                      <p className="text-[12px] text-[#8CFF00]/80 font-medium text-center w-full mb-[8px]" style={{ fontFamily: "var(--font-body)" }}>
                        ⚠️ RSVP deadline has passed (January 24, 2026, 11:59 PM IST)
                      </p>
                    )}

                    {(() => {
                      if (isRsvpExpired) {
                        return (
                          <>
                            <p className="text-[12px] text-white/40 text-center w-full mt-[8px]" style={{ fontFamily: "var(--font-body)" }}>
                              RSVP deadline has passed. Please contact the organizers if you need assistance.
                            </p>
                            {rsvpStatus === "confirmed" && <RsvpStatusBadge status="confirmed" message="✅ RSVP Confirmed! See you at the event!" />}
                            {rsvpStatus === "declined" && <RsvpStatusBadge status="declined" message="You have declined participation." />}
                          </>
                        );
                      }

                      if (!onRSVP) return null;

                      if (rsvpStatus === "confirmed" || rsvpStatus === "declined") {
                        return (
                          <div className="flex flex-col gap-[12px] w-full mt-[8px]">
                            {rsvpStatus === "confirmed" && <RsvpStatusBadge status="confirmed" message="✅ RSVP Confirmed! See you at the event!" />}
                            {rsvpStatus === "declined" && <RsvpStatusBadge status="declined" message="You have declined participation." />}
                          </div>
                        );
                      }

                      return (
                        <div className="flex flex-col gap-[12px] w-full mt-[8px]">
                          <p className="text-[13px] text-white/60 text-center w-full" style={{ fontFamily: "var(--font-body)" }}>
                            Please confirm your participation:
                          </p>
                          <div className="flex gap-[12px] w-full justify-center">
                            <Button onClick={() => onRSVP("confirmed")} variant="primary">
                              <Check className="w-4 h-4" />
                              Confirm Participation
                            </Button>
                            <Button onClick={() => onRSVP("declined")} variant="danger">
                              <X className="w-4 h-4" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  <>
                    <p className="text-[13px] text-white/50 text-center w-full" style={{ fontFamily: "var(--font-body)" }}>
                      The registration deadline has passed. No new registrations are being accepted.
                    </p>
                    <p className="text-[14px] text-white/70 font-medium text-center w-full" style={{ fontFamily: "var(--font-body)" }}>
                      Results will be out soon :)
                    </p>
                  </>
                )
              ) : (
                <>
                  <p className="text-[13px] text-white/50 text-center w-full" style={{ fontFamily: "var(--font-body)" }}>
                    The registration deadline has passed. No new registrations are being accepted.
                  </p>
                  <p className="text-[14px] text-white/70 font-medium text-center w-full" style={{ fontFamily: "var(--font-body)" }}>
                    Results will be out soon :)
                  </p>
                </>
              )
            ) : (
              <p className="text-[13px] text-white/50 text-center w-full" style={{ fontFamily: "var(--font-body)" }}>
                The submission deadline has passed. No new submissions are being accepted.
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            {/* Countdown */}
            {!submitted && timeRemaining && (
              <div className="flex justify-center gap-[10px] mb-[16px] w-full">
                <TimeBox value={timeRemaining.days} label="Days" />
                <TimeBox value={timeRemaining.hours} label="Hours" />
                <TimeBox value={timeRemaining.minutes} label="Mins" />
                <TimeBox value={timeRemaining.seconds} label="Secs" />
              </div>
            )}

            <p
              className="text-[13px] text-center w-full text-white/60"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {submitted
                ? "Your team is registered. Good luck!"
                : "⚠️ Your team is not registered yet. Make sure to register before the deadline!"}
            </p>

            <p
              className="text-[11px] text-white/30 mt-[10px] text-center w-full uppercase tracking-[0.1em]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Changes allowed until{" "}
              {new Date(deadline!).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
                timeZone: "Asia/Kolkata",
              })}{" "}
              IST
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
