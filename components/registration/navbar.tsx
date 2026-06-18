import React from "react";
import { LogOut, LogIn } from "lucide-react";
import { Logo } from "./logo";

interface User {
  uid: string;
  name: string;
  email: string;
  role?: string;
}

interface NavBarProps {
  user?: User;
  onLogout: () => void;
  onNavigate?: (view: string) => void;
}

export function NavBar({
  user,
  onLogout,
  onNavigate,
}: NavBarProps) {
  return (
    <div className="bg-gradient-to-t from-[rgba(10,10,10,0)] to-[#0a0a0a] h-[78px] w-full sticky top-0 z-50">
      <div className="flex items-center justify-center size-full pt-[16px]">
        <div className="flex items-center justify-between px-4 md:px-[40px] max-w-[1200px] w-full">
          <div
            className="cursor-pointer"
            onClick={() => onNavigate && onNavigate('landing')}
          >
            <Logo />
          </div>

          {user ? (
            <div className="flex items-center gap-[12px]">
              <div
                className="text-[13px] text-white hidden sm:block"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {user.name}{' '}
                {user.role === 'admin' && (
                  <span className="text-[#00FF88] capitalize">({user.role})</span>
                )}
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-[8px] justify-center px-[18px] py-[8px] rounded-[10px]
                  bg-[rgba(13,13,13,0.8)] hover:bg-[rgba(13,13,13,0.95)]
                  border border-[rgba(0,255,136,0.25)] hover:border-[rgba(0,255,136,0.55)]
                  text-white/60 hover:text-white
                  backdrop-blur-[12px] transition-all duration-200
                  hover:shadow-[0_0_16px_rgba(0,255,136,0.15)]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block text-[13px]">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-[12px]">
              <button
                onClick={() => onNavigate && onNavigate('login')}
                className="flex items-center gap-[8px] justify-center px-[18px] py-[8px] rounded-[10px]
                  bg-[#00FF88] hover:bg-[#00CC70]
                  text-black font-semibold
                  transition-all duration-200
                  hover:shadow-[0_0_20px_rgba(0,255,136,0.5)]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:block text-[13px]">Login</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
