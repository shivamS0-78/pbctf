"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMockAuth } from "@/hooks/useMockAuth";
import { NavBar } from "./navbar";
import { DotPattern } from "./dot-pattern";
import { AlertBanner } from "./alert-banner";
import { StickyAlert } from "./sticky-alert";
import { RegistrationContainer } from "./registration-container";
import { DashboardContainer } from "./dashboard-container";
import { ProfileContainer } from "./profile-container";
import { TeamContainer } from "./team-container";
import { SubmissionContainer } from "./submission-container";

type View = "landing" | "dashboard" | "profile" | "team" | "submission";

export function AppContainer() {
  const { user, isAuthenticated, isLoading, logout } = useMockAuth();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<View>("landing");
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning" | "info";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && user) {
      setCurrentView("dashboard");
    } else {
      setCurrentView("landing");
    }
  }, [isAuthenticated, user, isLoading]);

  const handleNavigate = (view: "dashboard" | "profile" | "team" | "submission") => {
    setCurrentView(view);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
    setAlert({
      type: "info",
      message: "Logged out successfully",
    });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleRegistrationSuccess = () => {
    setCurrentView("dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#171717]">
        <div className="text-white" style={{ fontFamily: 'var(--font-body)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col items-start relative"
      style={{
        backgroundImage: "linear-gradient(90deg, rgb(23, 23, 23) 0%, rgb(23, 23, 23) 100%)",
      }}
    >
      <NavBar 
        user={user ? { uid: user.uid, name: user.name, email: user.email } : undefined} 
        onLogout={handleLogout} 
      />

      <div className="bg-[#171717] w-full relative flex-1">
        <div
          className="flex flex-col items-center justify-center w-full min-h-screen pb-[80px] pt-[60px] px-[40px] relative"
          style={{
            backgroundImage:
              "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 1440 652\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(31.68 0 0 22.168 0 174.74)\\'><stop stop-color=\\'rgba(62,32,19,1)\\' offset=\\'0.10445\\'/><stop stop-color=\\'rgba(62,32,19,0)\\' offset=\\'1\\'/></radialGradient></defs></svg>')",
          }}
        >
          <div className="max-w-[1000px] w-full z-10 flex flex-col gap-[32px] items-center">
            {alert && (
              <StickyAlert
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert(null)}
              />
            )}

            {currentView === "landing" && (
              <RegistrationContainer onSuccess={handleRegistrationSuccess} />
            )}

            {currentView === "dashboard" && isAuthenticated && (
              <DashboardContainer onNavigate={handleNavigate} />
            )}

            {currentView === "profile" && isAuthenticated && (
              <ProfileContainer onNavigate={handleNavigate} />
            )}

            {currentView === "team" && isAuthenticated && (
              <TeamContainer onNavigate={handleNavigate} />
            )}

            {currentView === "submission" && isAuthenticated && (
              <SubmissionContainer onNavigate={handleNavigate} />
            )}
          </div>
        </div>

        <DotPattern />
      </div>
    </div>
  );
}

