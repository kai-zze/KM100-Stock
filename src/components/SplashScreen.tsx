/*
From Uiverse.io by andrew-manzyk - https://uiverse.io/andrew-manzyk/unlucky-mouse-21
MIT License, Copyright (c) andrew-manzyk (Andrew Manzyk)
*/

import React from "react";
import { ScrollingLoader } from "./ScrollingLoader";

interface SplashScreenProps {
  isFading?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  isFading = false,
}) => {
  return (
    <div
      id="institutional-splash-screen"
      className={`fixed inset-0 z-50 flex h-[100dvh] w-full select-none flex-col items-center justify-center bg-white px-6 text-center font-heading transition-opacity duration-400 ease-out ${
        isFading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-label="Loading KM100 Inventory Management System"
    >
      {/* Top Institutional Gradient Accent */}
      <div className="absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r from-amber-700 via-orange-600 to-amber-500" />

      {/* Institutional Brand Header (Centered, Adaptive & Balanced) */}
      <div className="flex w-full flex-col items-center justify-center max-w-4xl px-4 text-center">
        <img
          src="/logo-sm.png"
          alt="KM100 Official Emblem"
          width={72}
          height={72}
          className="h-[clamp(52px,8vw,72px)] w-[clamp(52px,8vw,72px)] shrink-0 rounded-full object-contain mb-3 sm:mb-4 filter drop-shadow-md"
        />

        <h1 className="splash-title text-[clamp(1.15rem,2.2vw,1.75rem)] font-extrabold tracking-tight text-slate-900 leading-tight">
          KM100 SKILLS AND TRAINING CENTER, INC.
        </h1>

        <p className="mt-1.5 sm:mt-2 font-sans text-[clamp(0.8rem,1.4vw,0.95rem)] font-medium text-slate-500 leading-relaxed max-w-md">
          Property Custody &amp; Inventory Management System
        </p>
      </div>

      {/* Uiverse.io Scrolling Loader (Adaptive Across All Screen Sizes & Devices) */}
      <div className="mt-8 sm:mt-12 md:mt-14 flex justify-center w-full overflow-hidden px-4">
        <ScrollingLoader text="Loading" />
      </div>
    </div>
  );
};

export default SplashScreen;
