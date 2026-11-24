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
      <div className="flex flex-col items-center justify-center max-w-2xl px-4 text-center">
        <img
          src="/logo-sm.png"
          alt="KM100 Official Emblem"
          width={72}
          height={72}
          className="h-14 w-14 sm:h-18 sm:w-18 md:h-20 md:w-20 shrink-0 rounded-full object-contain mb-3 sm:mb-4 filter drop-shadow-md"
        />

        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight [text-wrap:balance]">
          KM100 SKILLS AND TRAINING CENTER, INC.
        </h1>

        <p className="mt-1.5 sm:mt-2 font-sans text-xs sm:text-sm md:text-base font-medium text-slate-500 leading-relaxed max-w-md">
          Property Custody &amp; Inventory Management System
        </p>
      </div>

      {/* Uiverse.io Scrolling Loader (Adaptive Across All Screen Sizes & Devices) */}
      <div className="mt-8 sm:mt-12 md:mt-14 flex justify-center w-full overflow-hidden px-4">
        <ScrollingLoader text="Loading" />
      </div>

      {/* Regulatory Institutional Anchor */}
      <div className="absolute bottom-6 left-0 right-0 px-4 text-center">
        <span className="font-sans text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
          Institutional Property Register &bull; Official Custody System
        </span>
      </div>
    </div>
  );
};

export default SplashScreen;
