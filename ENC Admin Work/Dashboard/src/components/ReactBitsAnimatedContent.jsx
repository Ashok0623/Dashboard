import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ReactBitsAnimatedContent = ({
  children,
  container,
  distance = 40,
  direction = "vertical",
  reverse = false,
  duration = 0.7,
  ease = "power3.out",
  initialOpacity = 0,
  animateOpacity = true,
  scale = 1,
  threshold = 0.12,
  delay = 0,
  className = "",
  ...props
}) => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    let scrollerTarget =
      container || document.getElementById("snap-main-container") || null;
    if (typeof scrollerTarget === "string") {
      scrollerTarget = document.querySelector(scrollerTarget);
    }

    const axis = direction === "horizontal" ? "x" : "y";
    const offset = reverse ? -distance : distance;
    const startPct = (1 - threshold) * 100;

    gsap.set(element, {
      [axis]: offset,
      scale,
      opacity: animateOpacity ? initialOpacity : 1,
      visibility: "visible",
    });

    const timeline = gsap.timeline({ paused: true, delay });
    timeline.to(element, {
      [axis]: 0,
      scale: 1,
      opacity: 1,
      duration,
      ease,
    });

    const trigger = ScrollTrigger.create({
      trigger: element,
      scroller: scrollerTarget || window,
      start: `top ${startPct}%`,
      once: true,
      onEnter: () => timeline.play(),
    });

    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;
    if (
      element.getBoundingClientRect().top <=
      (startPct / 100) * viewportHeight
    ) {
      timeline.play(0);
    }

    return () => {
      trigger.kill();
      timeline.kill();
    };
  }, [
    animateOpacity,
    container,
    delay,
    direction,
    distance,
    duration,
    ease,
    initialOpacity,
    reverse,
    scale,
    threshold,
  ]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ visibility: "hidden" }}
      {...props}
    >
      {children}
    </div>
  );
};

export default ReactBitsAnimatedContent;
