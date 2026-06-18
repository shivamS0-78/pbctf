"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { FormSection } from "@/components/registration/form-section";
import { FormInput } from "@/components/registration/form-input";
import { Button } from "@/components/registration/button";
import { StickyAlert } from "@/components/registration/sticky-alert";
import { DotPattern } from "@/components/registration/dot-pattern";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, Mail, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await resetPassword(email);
      setSuccess("Password reset link sent to your email.");
      setTimeout(() => router.push("/login"), 5000);
    } catch (err: any) {
      setError(err?.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-void relative overflow-hidden">
      <DotPattern />

      <main className="relative z-10 min-h-screen w-full flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-16">
        <div className="w-full max-w-[460px] flex flex-col gap-6 anim-fade-up">
          {error && <StickyAlert type="error" message={error} onClose={() => setError("")} />}
          {success && <StickyAlert type="success" message={success} onClose={() => setSuccess("")} />}

          <div className="flex flex-col items-center text-center gap-3">
            <div className="inline-flex w-12 h-12 items-center justify-center rounded-md bg-brand-soft border border-brand/30">
              <Mail className="w-5 h-5 text-brand" />
            </div>
            <h1 className="font-heading text-balance text-[28px] sm:text-[36px] font-bold text-ink leading-tight tracking-tight">
              Forgot Password
            </h1>
            <p className="text-[14px] text-ink-secondary font-body leading-relaxed max-w-[380px]">
              Enter your email and we'll send you a secure reset link.
            </p>
          </div>

          <FormSection title="Reset Password" eyebrow="recovery · 01">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
              <FormInput
                label="Email Address"
                type="email"
                placeholder="your.email@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full">
                {isSubmitting ? <Spinner size="sm" /> : <Mail className="w-4 h-4" />}
                Send Reset Link
                <ArrowRight className="w-4 h-4 -mr-1" />
              </Button>
              <div className="flex items-center justify-center pt-1">
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="inline-flex items-center gap-1.5 text-[13px] text-ink-secondary hover:text-brand transition-colors font-body"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Login
                </button>
              </div>
            </form>
          </FormSection>
        </div>
      </main>
    </div>
  );
}
