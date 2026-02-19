import React, { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const getMotionPreferences = () => {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return { coarsePointer: false };
  }

  return {
    coarsePointer: window.matchMedia("(hover: none), (pointer: coarse)")
      .matches,
  };
};

const AnimatedBackground = () => {
  const [{ coarsePointer }, setMotionPreference] = useState(() =>
    getMotionPreferences(),
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return undefined;
    }

    const coarsePointerQuery = window.matchMedia(
      "(hover: none), (pointer: coarse)",
    );

    const syncPreferences = () => {
      setMotionPreference({
        coarsePointer: coarsePointerQuery.matches,
      });
    };

    syncPreferences();
    coarsePointerQuery.addEventListener?.("change", syncPreferences);

    return () => {
      coarsePointerQuery.removeEventListener?.("change", syncPreferences);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setReady(false);

    const startEngine = async () => {
      await initParticlesEngine(async (engine) => {
        await loadSlim(engine);
      });

      if (!cancelled) {
        setReady(true);
      }
    };

    let handle;
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      handle = window.requestIdleCallback(
        () => {
          void startEngine();
        },
        { timeout: 500 },
      );
    } else {
      handle = window.setTimeout(() => {
        void startEngine();
      }, 120);
    }

    return () => {
      cancelled = true;
      if (typeof window !== "undefined" && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(handle);
      } else {
        window.clearTimeout(handle);
      }
    };
  }, []);

  const options = useMemo(
    () => ({
      pauseOnBlur: true,
      pauseOnOutsideViewport: true,
      fullScreen: {
        enable: false,
      },
      background: {
        color: "transparent",
      },
      fpsLimit: coarsePointer ? 24 : 34,
      detectRetina: !coarsePointer,
      particles: {
        number: {
          value: coarsePointer ? 14 : 32,
          density: {
            enable: true,
            area: coarsePointer ? 1200 : 980,
          },
        },
        color: {
          value: ["#54a9cf", "#69bfd8", "#67c6b0"],
        },
        links: {
          enable: !coarsePointer,
          distance: 128,
          color: "#6fb7d3",
          opacity: 0.16,
          width: 1,
        },
        move: {
          enable: true,
          speed: coarsePointer ? 0.2 : 0.42,
          direction: "none",
          random: true,
          straight: false,
          outModes: {
            default: "bounce",
          },
        },
        opacity: {
          value: { min: 0.12, max: 0.42 },
          animation: {
            enable: true,
            speed: 0.45,
          },
        },
        size: {
          value: { min: 0.8, max: 2.6 },
          animation: {
            enable: true,
            speed: 0.38,
            minimumValue: 0.7,
          },
        },
      },
      interactivity: {
        events: {
          onHover: {
            enable: false,
            mode: "grab",
          },
          resize: {
            enable: true,
          },
        },
        modes: {
          grab: {
            distance: 170,
            links: {
              opacity: 0.45,
            },
          },
        },
      },
    }),
    [coarsePointer],
  );

  return ready ? (
    <Particles
      id="enc-particles"
      options={options}
      className="enc-particles-layer"
    />
  ) : null;
};

export default AnimatedBackground;
