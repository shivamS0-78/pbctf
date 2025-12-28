"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LogIn, UserPlus, Zap } from "lucide-react";
import { FormSection } from "@/components/registration/form-section";
import { FormInput } from "@/components/registration/form-input";
import { Button } from "@/components/registration/button";
import { StickyAlert } from "@/components/registration/sticky-alert";
import { DotPattern } from "@/components/registration/dot-pattern";
import Link from "next/link";

// PRODUCTION MODE - Debug features disabled
const DEBUG_MODE = false;

export default function LoginPage() {
  const { login } = useAuth();
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  // DEBUG: Auto-fill function
  const handleAutoFill = () => {
    setLoginData({
      email: "testuser@example.com",
      password: "password123",
    });
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await login(loginData.email, loginData.password);
      // Successful login - redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-start relative"
      style={{
        backgroundImage: "linear-gradient(90deg, rgb(23, 23, 23) 0%, rgb(23, 23, 23) 100%)",
      }}
    >
      <div className="bg-[#171717] w-full relative flex-1">
        <div
          className="flex flex-col items-center justify-center w-full min-h-screen pb-[80px] pt-[60px] px-[40px] relative"
          style={{
            backgroundImage:
              "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 1440 652\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(31.68 0 0 22.168 0 174.74)\\'><stop stop-color=\\'rgba(62,32,19,1)\\' offset=\\'0.10445\\'/><stop stop-color=\\'rgba(62,32,19,0)\\' offset=\\'1\\'/></radialGradient></defs></svg>')",
          }}
        >
          <div className="max-w-[600px] w-full z-10 flex flex-col gap-[32px] items-center">
            <div className="flex flex-col gap-[12px] items-center text-center">
              <div className="backdrop-blur-[2.5px] backdrop-filter bg-[rgba(255,255,255,0)] flex items-center justify-center px-[12px] py-[7px] rounded-[15px] shadow-[0px_3px_10px_0px_rgba(209,63,0,0.5)] relative">
                <p className="text-[14px] text-white leading-[16.8px]" style={{ fontFamily: 'var(--font-body)' }}>
                  Welcome Back
                </p>
                <div className="absolute inset-0 rounded-[15px]">
                  <div className="absolute border border-[#b85c00] border-solid inset-0 pointer-events-none rounded-[15px]" />
                </div>
              </div>

              <h1 className="text-[48px] text-white leading-[52px] tracking-[-1px]" style={{ fontFamily: 'var(--font-heading)' }}>
                Welcome to Zenith
              </h1>

              <p className="text-[15.9px] text-white opacity-90 leading-[23.8px]" style={{ fontFamily: 'var(--font-body)' }}>
                Login to your account to continue
              </p>
            </div>

            <div className="flex gap-[12px] items-center justify-center flex-wrap">
              <Button
                onClick={() => setAuthMode("login")}
                variant={authMode === "login" ? "primary" : "secondary"}
              >
                <LogIn className="w-4 h-4" />
                Login
              </Button>
              <Link href="/register">
                <Button variant={authMode === "register" ? "primary" : "secondary"}>
                  <UserPlus className="w-4 h-4" />
                  Register
                </Button>
              </Link>
              {DEBUG_MODE && (
                <Button
                  onClick={handleAutoFill}
                  variant="secondary"
                >
                  <Zap className="w-4 h-4" />
                  Auto-Fill (Debug)
                </Button>
              )}
            </div>

            {error && <StickyAlert type="error" message={error} onClose={() => setError("")} />}

            {DEBUG_MODE && (
              <div className="backdrop-blur-[2.5px] backdrop-filter bg-[rgba(255,165,0,0.2)] border border-orange-500 rounded-[15px] p-[12px] flex items-center gap-[12px]">
                <Zap className="w-5 h-5 text-orange-400" />
                <div className="flex flex-col gap-[4px]">
                  <span className="text-[13px] text-white font-semibold" style={{ fontFamily: 'var(--font-body)' }}>
                    Debug Mode Active
                  </span>
                  <span className="text-[12px] text-white opacity-80" style={{ fontFamily: 'var(--font-body)' }}>
                    Set DEBUG_MODE = false in login/page.tsx before production
                  </span>
                </div>
              </div>
            )}

            <FormSection title="Login to Your Account">
              <form onSubmit={handleLogin} className="flex flex-col gap-[20px]">
                <FormInput
                  label="Email Address"
                    type="email" 
                  placeholder="your.email@example.com"
                    required
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                />
                <FormInput
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                    required
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                />
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </form>
            </FormSection>
          </div>
        </div>

        <DotPattern />
      </div>
    </div>
  );
}
