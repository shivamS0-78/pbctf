import React, { useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";

interface StickyAlertProps {
  type?: "success" | "error" | "warning" | "info";
  message: string;
  onClose: () => void;
  duration?: number;
}

export function StickyAlert({
  type = "info",
  message,
  onClose,
  duration = 5000,
}: StickyAlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    // Auto-hide after duration
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to finish
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  useEffect(() => {
    // Check scroll position
    const handleScroll = () => {
      setIsAtTop(window.scrollY < 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getTypeClass = () => {
    switch (type) {
      case "success":
        return "bg-[rgba(0,200,0,0.3)] border-green-500";
      case "error":
        return "bg-[rgba(200,0,0,0.3)] border-red-500";
      case "warning":
        return "bg-[rgba(255,165,0,0.3)] border-orange-500";
      default:
        return "bg-[rgba(138,138,138,0.3)] border-[rgba(255,255,255,0.38)]";
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "success":
        return "text-green-400";
      case "error":
        return "text-red-400";
      case "warning":
        return "text-orange-400";
      default:
        return "text-white";
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-[90px] left-1/2 transform -translate-x-1/2 z-[100] w-[90%] max-w-[600px] transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      <div
        className={`backdrop-blur-[8px] backdrop-filter rounded-[15px] p-[16px] border ${getTypeClass()} flex items-center gap-[12px] shadow-[0px_8px_32px_0px_rgba(0,0,0,0.4)] relative`}
      >
        <AlertCircle className={`w-5 h-5 flex-shrink-0 ${getIconColor()}`} />
        <span
          className="font-['Inter',sans-serif] text-[14px] text-white flex-1"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {message}
        </span>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-white hover:text-gray-300 transition-colors flex-shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

