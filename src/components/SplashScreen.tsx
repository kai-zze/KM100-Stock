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

      {/* Institutional Brand Header with KM100 and TESDA Logos flanking the Company Name */}
      <div className="flex items-center justify-center gap-3 sm:gap-5 px-3 max-w-xl">
        <img
          src="/logo-sm.png"
          alt="KM100 Logo"
          width={52}
          height={52}
          className="h-11 w-11 sm:h-14 sm:w-14 shrink-0 rounded-full object-contain"
        />

        <div className="space-y-1 text-center">
          <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-slate-900 leading-tight">
            KM100 SKILLS AND TRAINING CENTER, INC.
          </h1>
          <p className="font-sans text-xs sm:text-sm font-medium text-slate-500">
            Property Custody &amp; Inventory Management System
          </p>
        </div>

        <img
          src="/tesda_logo.png"
          alt="TESDA Logo"
          width={52}
          height={52}
          className="h-11 w-11 sm:h-14 sm:w-14 shrink-0 rounded-full object-contain"
        />
      </div>

      {/* Uiverse.io Scrolling Loader (Enlarged) */}
      <div className="mt-10 sm:mt-12 flex justify-center w-full overflow-hidden px-4">
        <ScrollingLoader size="clamp(2.8rem, 8vw, 3.6rem)" text="Loading" />
      </div>

      {/* Regulatory Institutional Anchor */}
      <div className="absolute bottom-6 left-0 right-0 px-4 text-center">
        <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          TESDA Regulated &bull; Institutional Property Register
        </span>
      </div>
    </div>
  );
};

export default SplashScreen;
