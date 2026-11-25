import React, { useEffect, useState } from "react";
import { ScrollingLoader } from "./ScrollingLoader";

interface SplashAssembly3DProps {
  onComplete?: () => void;
  isFading?: boolean;
}

export const SplashAssembly3D: React.FC<SplashAssembly3DProps> = ({
  onComplete,
  isFading = false,
}) => {
  const [stage, setStage] = useState<
    "scatter" | "assembling" | "locked" | "sheen" | "complete"
  >("scatter");

  useEffect(() => {
    // Stage 1: Trigger 3D assembly fly-in almost immediately on mount
    const assembleTimer = setTimeout(() => {
      setStage("assembling");
    }, 60);

    // Stage 2: Mechanical lock & gear snap (around 1.5s)
    const lockTimer = setTimeout(() => {
      setStage("locked");
    }, 1500);

    // Stage 3: Metallic light sheen & shockwave pulse (around 1.8s)
    const sheenTimer = setTimeout(() => {
      setStage("sheen");
    }, 1850);

    // Stage 4: Settle into crisp badge before fade out (around 2.5s)
    const completeTimer = setTimeout(() => {
      setStage("complete");
      if (onComplete) onComplete();
    }, 2600);

    return () => {
      clearTimeout(assembleTimer);
      clearTimeout(lockTimer);
      clearTimeout(sheenTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const isAssembling = stage !== "scatter";
  const isLocked =
    stage === "locked" || stage === "sheen" || stage === "complete";
  const isSheen = stage === "sheen" || stage === "complete";

  return (
    <div
      id="km100-3d-splash"
      className={`fixed inset-0 z-50 flex h-[100dvh] w-full select-none flex-col items-center justify-center overflow-hidden bg-[#090d14] px-4 text-center font-heading transition-all duration-500 ease-out ${
        isFading
          ? "pointer-events-none scale-105 opacity-0"
          : "opacity-100 scale-100"
      }`}
      style={{
        perspective: "1400px",
        background:
          "radial-gradient(circle at 50% 45%, #151d2a 0%, #080c13 70%, #030508 100%)",
      }}
      role="status"
      aria-label="KM100 3D Assembly Loading Animation"
    >
      {/* ── Subtle Ambient Background Grid & Vignette ─────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(243, 112, 33, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(243, 112, 33, 0.08) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          backgroundPosition: "center center",
        }}
      />

      {/* ── Shockwave Pulse on Mechanical Lock ──────────────────────── */}
      {isLocked && (
        <div
          className="pointer-events-none absolute h-72 w-72 sm:h-[22rem] sm:w-[22rem] rounded-full border-2 border-[#F37021] animate-ping opacity-30"
          style={{
            boxShadow:
              "0 0 30px rgba(243, 112, 33, 0.6), inset 0 0 20px rgba(243, 112, 33, 0.4)",
          }}
        />
      )}

      {/* ── 3D Perspective Stage Container ──────────────────────────── */}
      <div
        className="relative flex items-center justify-center transition-transform duration-1000 ease-out"
        style={{
          width: "320px",
          height: "320px",
          transformStyle: "preserve-3d",
          transform: isLocked
            ? "rotateX(0deg) rotateY(0deg) scale(1)"
            : "rotateX(12deg) rotateY(-8deg) scale(0.95)",
        }}
      >
        {/* ============================================================== */}
        {/* LAYER 3: Dark Charcoal Outer Ring (#333333) with Two Stars     */}
        {/* ============================================================== */}
        <div
          className="absolute inset-0 transition-all duration-1200 ease-out"
          style={{
            transformStyle: "preserve-3d",
            transform: isAssembling
              ? "translateZ(0px) rotateZ(0deg) rotateX(0deg) scale(1)"
              : "translateZ(-480px) rotateZ(-140deg) rotateX(35deg) scale(1.4)",
            opacity: isAssembling ? 1 : 0,
            filter: isAssembling
              ? "drop-shadow(0 15px 35px rgba(0,0,0,0.8))"
              : "blur(8px)",
          }}
        >
          <svg viewBox="0 0 400 400" className="h-full w-full">
            {/* Outer Charcoal Annulus Ring */}
            <circle
              cx="200"
              cy="200"
              r="164"
              fill="none"
              stroke="#26282e"
              strokeWidth="56"
            />
            {/* White Outer Border Trim */}
            <circle
              cx="200"
              cy="200"
              r="192"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.5"
            />
            {/* White Inner Border Trim */}
            <circle
              cx="200"
              cy="200"
              r="136"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.5"
            />
            {/* Inner White Disc Canvas for Emblem */}
            <circle cx="200" cy="200" r="134" fill="#ffffff" />

            {/* Left Orange Star (★) */}
            <polygon
              points="65,190 71,194 69,202 75,197 81,202 79,194 85,190 77,190 75,182 73,190"
              fill="#F37021"
              transform="rotate(-5, 75, 192)"
            />
            {/* Right Orange Star (★) */}
            <polygon
              points="325,190 331,194 329,202 335,197 341,202 339,194 345,190 337,190 335,182 333,190"
              fill="#F37021"
              transform="rotate(5, 335, 192)"
            />
          </svg>
        </div>

        {/* ============================================================== */}
        {/* LAYER 4: Curved Typography (KM100 top, SKILLS... bottom)       */}
        {/* ============================================================== */}
        <div
          className="absolute inset-0 transition-all duration-1300 ease-out"
          style={{
            transformStyle: "preserve-3d",
            transform: isAssembling
              ? "translateZ(30px) rotateX(0deg) scale(1)"
              : "translateZ(550px) rotateX(55deg) scale(1.6)",
            opacity: isAssembling ? 1 : 0,
            filter: isAssembling ? "none" : "blur(6px)",
          }}
        >
          <svg viewBox="0 0 400 400" className="h-full w-full">
            <defs>
              {/* Arc path for Top KM100 Text */}
              <path
                id="km100-top-text-arc"
                d="M 80,200 A 120,120 0 0,1 320,200"
                fill="none"
              />
              {/* Arc path for Bottom SKILLS AND TRAINING CENTER, INC. */}
              <path
                id="km100-bottom-text-arc"
                d="M 336,200 A 136,136 0 0,1 64,200"
                fill="none"
              />
            </defs>

            {/* Top Curved Text: KM100 */}
            <text
              fill="#F37021"
              fontSize="44"
              fontWeight="900"
              letterSpacing="0.04em"
              fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
              textAnchor="middle"
              stroke="#ffffff"
              strokeWidth="0.8"
            >
              <textPath href="#km100-top-text-arc" startOffset="50%">
                KM100
              </textPath>
            </text>

            {/* Bottom Curved Text: SKILLS AND TRAINING CENTER, INC. */}
            <text
              fill="#ffffff"
              fontSize="16.5"
              fontWeight="800"
              letterSpacing="0.16em"
              fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
              textAnchor="middle"
            >
              <textPath href="#km100-bottom-text-arc" startOffset="50%">
                SKILLS AND TRAINING CENTER, INC.
              </textPath>
            </text>
          </svg>
        </div>

        {/* ============================================================== */}
        {/* LAYER 2: 3 Interlocking Orange Gear-People Figures             */}
        {/* ============================================================== */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Figure 1: Top-Right (Angle ~30°) */}
          <div
            className="absolute inset-0 transition-all duration-1100 ease-out"
            style={{
              transformStyle: "preserve-3d",
              transform: isAssembling
                ? "translate3d(0, 0, 15px) rotate(0deg) scale(1)"
                : "translate3d(160px, -130px, -380px) rotate(-120deg) rotateX(45deg) scale(0.6)",
              opacity: isAssembling ? 1 : 0,
            }}
          >
            <svg viewBox="0 0 400 400" className="h-full w-full">
              {/* Head Dot */}
              <circle cx="274" cy="150" r="14" fill="#F37021" />
              {/* Interlocking Gear-Person Torso & Arm */}
              <path
                d="M 230,170 A 38,38 0 0,0 215,164 L 232,108 A 96,96 0 0,1 268,124 L 254,152 A 70,70 0 0,1 278,172 L 298,162 A 96,96 0 0,1 306,190 L 254,204 A 38,38 0 0,0 230,170 Z"
                fill="#F37021"
              />
            </svg>
          </div>

          {/* Figure 2: Top-Left (Angle ~150°) */}
          <div
            className="absolute inset-0 transition-all duration-1150 ease-out"
            style={{
              transformStyle: "preserve-3d",
              transform: isAssembling
                ? "translate3d(0, 0, 15px) rotate(0deg) scale(1)"
                : "translate3d(-170px, -130px, -440px) rotate(140deg) rotateY(45deg) scale(0.6)",
              opacity: isAssembling ? 1 : 0,
            }}
          >
            <svg viewBox="0 0 400 400" className="h-full w-full">
              {/* Head Dot */}
              <circle cx="126" cy="150" r="14" fill="#F37021" />
              {/* Interlocking Gear-Person Torso & Arm */}
              <path
                d="M 170,170 A 38,38 0 0,1 185,164 L 168,108 A 96,96 0 0,0 132,124 L 146,152 A 70,70 0 0,0 122,172 L 102,162 A 96,96 0 0,0 94,190 L 146,204 A 38,38 0 0,1 170,170 Z"
                fill="#F37021"
              />
            </svg>
          </div>

          {/* Figure 3: Bottom (Angle ~270°) */}
          <div
            className="absolute inset-0 transition-all duration-1250 ease-out"
            style={{
              transformStyle: "preserve-3d",
              transform: isAssembling
                ? "translate3d(0, 0, 15px) rotate(0deg) scale(1)"
                : "translate3d(0px, 210px, -520px) rotate(-160deg) rotateX(-50deg) scale(0.5)",
              opacity: isAssembling ? 1 : 0,
            }}
          >
            <svg viewBox="0 0 400 400" className="h-full w-full">
              {/* Head Dot */}
              <circle cx="200" cy="286" r="14" fill="#F37021" />
              {/* Interlocking Gear-Person Torso & Arm */}
              <path
                d="M 185,224 A 38,38 0 0,0 215,224 L 244,266 A 96,96 0 0,1 216,284 L 206,256 A 70,70 0 0,1 194,256 L 184,284 A 96,96 0 0,1 156,266 Z"
                fill="#F37021"
              />
            </svg>
          </div>
        </div>

        {/* ============================================================== */}
        {/* LAYER 1: Central Orange Dot (#F37021)                          */}
        {/* ============================================================== */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-out"
          style={{
            transformStyle: "preserve-3d",
            transform: isAssembling
              ? "translateZ(40px) scale(1)"
              : "translateZ(600px) scale(0.1) rotateX(60deg)",
            opacity: isAssembling ? 1 : 0,
          }}
        >
          <div
            className="h-14 w-14 rounded-full bg-[#F37021]"
            style={{
              boxShadow: isLocked
                ? "0 0 20px rgba(243, 112, 33, 0.8), inset 0 2px 4px rgba(255, 255, 255, 0.4)"
                : "none",
            }}
          />
        </div>

        {/* ============================================================== */}
        {/* FINAL UNIFIED CRISP BADGE CROSS-FADE (On Lock Settle)          */}
        {/* ============================================================== */}
        <div
          className={`pointer-events-none absolute inset-0 transition-opacity duration-600 ease-in-out ${
            isLocked ? "opacity-100" : "opacity-0"
          }`}
          style={{
            transformStyle: "preserve-3d",
            transform: "translateZ(5px)",
          }}
        >
          <img
            src="/logo.png"
            alt="KM100 Master Badge"
            className="h-full w-full object-contain rounded-full"
            style={{
              filter: "drop-shadow(0 15px 30px rgba(0, 0, 0, 0.7))",
            }}
          />
        </div>

        {/* ============================================================== */}
        {/* METALLIC / GLOSSY LIGHT SHEEN SWEEP OVER ASSEMBLED BADGE       */}
        {/* ============================================================== */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
          style={{ transform: "translateZ(50px)" }}
        >
          <div
            className={`absolute -inset-full h-[300%] w-[80px] bg-gradient-to-r from-transparent via-white/70 to-transparent transition-transform duration-[800ms] ease-in-out ${
              isSheen
                ? "translate-x-[650px] rotate-[25deg]"
                : "-translate-x-full rotate-[25deg]"
            }`}
          />
        </div>
      </div>

      {/* ── Institutional Identity & Verification Footnote ───────────── */}
      <div
        className="mt-6 flex flex-col items-center space-y-2.5 transition-all duration-[800ms] ease-out"
        style={{
          transform: isLocked ? "translateY(0)" : "translateY(20px)",
          opacity: isLocked ? 1 : 0,
        }}
      >
        <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
          KM100 SKILLS AND TRAINING CENTER, INC.
        </h2>

        <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-500">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>
            Precision Property Custody &bull; Official Inventory System
          </span>
        </div>

        <div
          className="pt-2 flex justify-center w-full overflow-hidden"
          aria-hidden="true"
        >
          <ScrollingLoader text="Loading" textColor="#f8fafc" />
        </div>
      </div>
    </div>
  );
};

export default SplashAssembly3D;
