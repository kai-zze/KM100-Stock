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

      {/* Institutional Titles (No Big Logo) */}
      <div className="space-y-1.5">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
          KM100 SKILLS AND TRAINING CENTER, INC.
        </h1>
        <p className="font-sans text-xs font-medium text-slate-500 sm:text-sm">
          Property Custody &amp; Inventory Management System
        </p>
      </div>

      {/* Uiverse.io Scrolling Loader */}
      <div className="mt-8">
        <ScrollingLoader size="2.2rem" text="Loading" />
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
