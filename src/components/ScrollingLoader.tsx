/*
From Uiverse.io by andrew-manzyk - https://uiverse.io/andrew-manzyk/unlucky-mouse-21
MIT License, Copyright (c) andrew-manzyk (Andrew Manzyk)
*/

import React from "react";

export interface ScrollingLoaderProps {
  text?: string;
  className?: string;
  size?: string;
  textColor?: string;
  shadowColor?: string;
  accentColor?: string;
}

export const ScrollingLoader: React.FC<ScrollingLoaderProps> = ({
  text = "Loading",
  className = "",
  size,
  textColor = "#0f172a",
  shadowColor = "#94a3b8",
  accentColor = "#b45309",
}) => {
  const customStyles: Record<string, string> = {
    "--text-color": textColor,
    "--shadow-color": shadowColor,
    "--accent-color": accentColor,
  };

  if (size) {
    customStyles["--main-size"] = size;
    customStyles["--loader-font-size"] = size;
  }

  return (
    <div
      className={`uiverse-scrolling-loader ${className}`}
      style={customStyles as React.CSSProperties}
      role="status"
      aria-label={`${text}...`}
    >
      {[...Array(9)].map((_, i) => (
        <div key={i} className="uiverse-text">
          <span>{text}</span>
        </div>
      ))}
      <div className="uiverse-line" />
    </div>
  );
};

export default ScrollingLoader;
