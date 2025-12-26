import Image from "next/image";

export function Logo() {
  return (
    <div className="flex gap-[10px] items-center justify-center">
      <div className="h-[26.04px] relative w-[28px]">
        <Image
          alt="Zenith Logo"
          src="/images/pblogo-nobg.webp"
          width={28}
          height={26}
          className="size-full object-contain"
        />
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-[19px] text-white leading-[24.7px]" style={{ fontFamily: 'var(--font-heading)' }}>
          Zenith
        </p>
      </div>
    </div>
  );
}

