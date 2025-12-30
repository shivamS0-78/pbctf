"use client";

import { useState, useEffect } from "react";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

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
}

export function DeadlineTimer({ teamStatus, hasSubmitted = false }: DeadlineTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [serverOffset, setServerOffset] = useState(0);

  // Fetch deadline and server time from API
  useEffect(() => {
    const fetchDeadline = async () => {
      try {
        const response = await fetch('/api/config/deadline');
        const data = await response.json();
        
        if (data.success && data.data) {
          const serverTime = new Date(data.data.serverTime).getTime();
          const clientTime = Date.now();
          // Calculate offset between server and client time
          setServerOffset(serverTime - clientTime);
          setDeadline(new Date(data.data.deadline));
          setIsExpired(data.data.isExpired);
        }
      } catch (error) {
        console.error("Failed to fetch deadline:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeadline();
  }, []);

  // Update countdown every second
  useEffect(() => {
    if (!deadline || isExpired) return;

    const calculateTimeRemaining = (): TimeRemaining => {
      // Use server-adjusted time
      const now = Date.now() + serverOffset;
      const total = deadline.getTime() - now;

      if (total <= 0) {
        setIsExpired(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      }

      const seconds = Math.floor((total / 1000) % 60);
      const minutes = Math.floor((total / 1000 / 60) % 60);
      const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
      const days = Math.floor(total / (1000 * 60 * 60 * 24));

      return { days, hours, minutes, seconds, total };
    };

    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    // Initial calculation
    setTimeRemaining(calculateTimeRemaining());

    return () => clearInterval(timer);
  }, [deadline, serverOffset, isExpired]);

  if (isLoading) {
    return (
      <div className="w-full p-[16px] rounded-[16px] bg-[rgba(138,138,138,0.1)] border border-[rgba(255,255,255,0.1)] animate-pulse">
        <div className="h-[60px] bg-[rgba(255,255,255,0.05)] rounded-[8px]" />
      </div>
    );
  }

  const submitted = hasSubmitted || teamStatus === 'submitted' || teamStatus === 'shortlisted' || teamStatus === 'rsvped';

  return (
    <div className={`w-full p-[20px] rounded-[16px] border ${
      isExpired 
        ? 'bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.3)]' 
        : submitted
          ? 'bg-[rgba(34,197,94,0.1)] border-[rgba(34,197,94,0.3)]'
          : 'bg-[rgba(251,191,36,0.1)] border-[rgba(251,191,36,0.3)]'
    }`}>
      {/* Header */}
      <div className="flex items-center gap-[12px] mb-[16px]">
        {isExpired ? (
          <AlertTriangle className="w-5 h-5 text-red-400" />
        ) : submitted ? (
          <CheckCircle2 className="w-5 h-5 text-green-400" />
        ) : (
          <Clock className="w-5 h-5 text-amber-400" />
        )}
        <h3 
          className={`text-[16px] font-semibold ${
            isExpired ? 'text-red-400' : submitted ? 'text-green-400' : 'text-amber-400'
          }`}
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {isExpired 
            ? "Submission Deadline Passed" 
            : submitted 
              ? "Submission Complete!"
              : "Submission Deadline"}
        </h3>
      </div>

      {/* Countdown or Status Message */}
      {isExpired ? (
        <p className="text-[14px] text-red-300/80" style={{ fontFamily: 'var(--font-body)' }}>
          The submission deadline has passed. No new submissions are being accepted.
        </p>
      ) : (
        <>
          {/* Countdown Display */}
          {timeRemaining && (
            <div className="flex gap-[12px] mb-[12px]">
              {[
                { value: timeRemaining.days, label: 'Days' },
                { value: timeRemaining.hours, label: 'Hours' },
                { value: timeRemaining.minutes, label: 'Mins' },
                { value: timeRemaining.seconds, label: 'Secs' },
              ].map((item, index) => (
                <div 
                  key={index}
                  className="flex flex-col items-center justify-center min-w-[60px] p-[12px] rounded-[12px] bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)]"
                >
                  <span 
                    className="text-[24px] font-bold text-white tabular-nums"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {String(item.value).padStart(2, '0')}
                  </span>
                  <span 
                    className="text-[10px] text-white/60 uppercase tracking-wider"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Status Message */}
          <p 
            className={`text-[13px] ${submitted ? 'text-green-300/80' : 'text-amber-300/80'}`}
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {submitted 
              ? "Your team has successfully submitted. Good luck!" 
              : "⚠️ Your team has not submitted yet. Make sure to submit before the deadline!"}
          </p>

          {/* Deadline Date */}
          <p 
            className="text-[12px] text-white/50 mt-[8px]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Deadline: January 20, 2026 at 11:59 PM IST
          </p>
        </>
      )}
    </div>
  );
}
