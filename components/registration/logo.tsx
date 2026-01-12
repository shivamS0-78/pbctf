import saturnLogo from "@/app/assets/saturn.png";

export function Logo() {
  const logoSrc = typeof saturnLogo === 'string' ? saturnLogo : saturnLogo.src;
  
  return (
    <div className="flex gap-[10px] items-center justify-center">
      <div className="h-[26.04px] relative w-[28px]">
        <img 
          alt="Zenith Logo" 
          className="size-full" 
          src={logoSrc}
        />
      </div>
      <div className="flex flex-col font-['Instrument_Serif',sans-serif] justify-center">
        <p className="text-[19px] text-white leading-[24.7px]">Zenith</p>
      </div>
    </div>
  );
}

