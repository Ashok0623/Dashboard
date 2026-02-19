import React, { useMemo, useRef } from "react";

const hexToRgba = (hex, opacity) => {
  const clean = (hex || "").replace("#", "");
  if (/^[\dA-Fa-f]{6}$/.test(clean)) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  if (/^[\dA-Fa-f]{3}$/.test(clean)) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return `rgba(255, 255, 255, ${opacity})`;
};

const ReactBitsGlareHover = ({
  children,
  className = "",
  style = {},
  glareColor = "#ffffff",
  glareOpacity = 0.22,
  glareAngle = -34,
  glareSize = 230,
  transitionDuration = 620,
  playOnce = false,
}) => {
  const overlayRef = useRef(null);
  const glareRgba = useMemo(
    () => hexToRgba(glareColor, glareOpacity),
    [glareColor, glareOpacity],
  );

  const animateIn = () => {
    const el = overlayRef.current;
    if (!el) return;
    el.style.transition = "none";
    el.style.backgroundPosition = "-120% -120%, 0 0";
    el.style.transition = `${transitionDuration}ms ease`;
    el.style.backgroundPosition = "120% 120%, 0 0";
  };

  const animateOut = () => {
    const el = overlayRef.current;
    if (!el) return;
    if (playOnce) {
      el.style.transition = "none";
      el.style.backgroundPosition = "-120% -120%, 0 0";
      return;
    }
    el.style.transition = `${transitionDuration}ms ease`;
    el.style.backgroundPosition = "-120% -120%, 0 0";
  };

  return (
    <div
      className={`rb-glare-hover ${className}`.trim()}
      style={style}
      onMouseEnter={animateIn}
      onMouseLeave={animateOut}
    >
      <div className="rb-glare-content">{children}</div>
      <div
        ref={overlayRef}
        className="rb-glare-overlay"
        aria-hidden="true"
        style={{
          background: `linear-gradient(${glareAngle}deg, transparent 58%, ${glareRgba} 70%, transparent 100%)`,
          backgroundSize: `${glareSize}% ${glareSize}%, 100% 100%`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "-120% -120%, 0 0",
        }}
      />
    </div>
  );
};

export default ReactBitsGlareHover;
