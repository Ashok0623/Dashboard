import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  ButtonGroup,
  Card,
  Col,
  ProgressBar,
  Row,
  Table,
  ToggleButton,
} from "react-bootstrap";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Area,
  Bar,
  ComposedChart,
  CartesianGrid,
  Cell,
  Label,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  ayacutData,
  employeeTypesData,
  engineeringCadreData,
  legalCasesData,
  majorMediumIrrigationData,
  minorIrrigationData,
  nonIrrigationPostsData,
  omWorksData,
  pendingApprovalsData,
  submissionStatusData,
} from "../data/dashboardData";
import ReactBitsAnimatedContent from "./ReactBitsAnimatedContent";
import ReactBitsGlareHover from "./ReactBitsGlareHover";

const GLASS_CHART_COLORS = [
  "#0284c7",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#f97316",
  "#0ea5c6",
];

const MINOR_CHART_COLOR_BY_NAME = {
  MI: "#0d7cc2",
  Percolation: "#1ba9c8",
  "Check Dams": "#2dbf83",
  Anicuts: "#f59e0b",
  Forest: "#2563eb",
  Private: "#14b8a6",
  Others: "#f97316",
};

const getMinorChartColor = (name, index) =>
  MINOR_CHART_COLOR_BY_NAME[name] ||
  GLASS_CHART_COLORS[index % GLASS_CHART_COLORS.length];

const VIEW_OPTIONS = [
  { key: "table", label: "Table" },
  { key: "graph", label: "Graph" },
];

const compactFormatter = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const numberFormatter = new Intl.NumberFormat("en-IN");

const compact = (value) => compactFormatter.format(Number(value || 0));

const formatNumber = (value) => numberFormatter.format(Number(value || 0));
const formatMixedMetric = (value) => {
  if (typeof value === "number") return formatNumber(value);
  if (typeof value === "string" && value.trim() && value.trim() !== "-") {
    return value.trim();
  }
  return "NA";
};

const toSafeNumber = (value) =>
  typeof value === "number" ? value : Number(value) || 0;
const SECTION_SCROLL_TOP_OFFSET = 18;
const TAP_MOVE_THRESHOLD = 10;
const TAP_TIME_THRESHOLD_MS = 420;
const MISSING_VALUE_PATTERN = /(not updated|not available)/i;

const prefersReducedMotionByDefault = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const getWindowTargetTop = (node) =>
  window.scrollY + node.getBoundingClientRect().top - SECTION_SCROLL_TOP_OFFSET;

const normalizePhoneLink = (value = "") => value.replace(/[^\d+]/g, "");
const hasUsableValue = (value = "") =>
  Boolean(value) && !MISSING_VALUE_PATTERN.test(value);

const ViewModeToggle = ({ idPrefix, mode, onChange, ariaLabel }) => (
  <ButtonGroup
    size="sm"
    role="tablist"
    aria-label={ariaLabel}
    className="view-toggle"
  >
    {VIEW_OPTIONS.map((option) => {
      const active = mode === option.key;
      return (
        <ToggleButton
          key={option.key}
          id={`${idPrefix}-${option.key}`}
          type="radio"
          variant={active ? "primary" : "outline-secondary"}
          name={`${idPrefix}-view-mode`}
          value={option.key}
          checked={active}
          onChange={() => onChange(option.key)}
          className={`view-pill ${active ? "active" : ""}`}
        >
          {option.label}
        </ToggleButton>
      );
    })}
  </ButtonGroup>
);

const ENCAdminDashboard = ({ userInfo }) => {
  const dashboardRef = useRef(null);
  const sectionPulseTimersRef = useRef({});
  const sectionPulseFramesRef = useRef({});
  const pointerStartRef = useRef(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    prefersReducedMotionByDefault,
  );
  const [viewMode, setViewMode] = useState({ om: "graph", mi: "graph" });
  const [activeMiSliceIndex, setActiveMiSliceIndex] = useState(0);
  // Navigate to a dashboard section.
  const clearSectionPulseTimers = () => {
    Object.values(sectionPulseTimersRef.current).forEach((timer) =>
      window.clearTimeout(timer),
    );
    Object.values(sectionPulseFramesRef.current).forEach((frame) =>
      window.cancelAnimationFrame(frame),
    );
    sectionPulseTimersRef.current = {};
    sectionPulseFramesRef.current = {};
  };

  const triggerSectionPulse = (el, sectionId, delayMs = 0) => {
    const startKey = `${sectionId}-start`;
    const stopKey = `${sectionId}-stop`;

    if (sectionPulseTimersRef.current[startKey]) {
      window.clearTimeout(sectionPulseTimersRef.current[startKey]);
    }
    if (sectionPulseTimersRef.current[stopKey]) {
      window.clearTimeout(sectionPulseTimersRef.current[stopKey]);
    }

    sectionPulseTimersRef.current[startKey] = window.setTimeout(() => {
      const headerEl = el.querySelector(".glass-card-header");
      el.classList.remove("section-focus");
      if (headerEl) {
        headerEl.classList.remove("section-focus-header");
      }
      void el.offsetWidth;
      el.classList.add("section-focus");
      if (headerEl) {
        void headerEl.offsetWidth;
        headerEl.classList.add("section-focus-header");
      }
      sectionPulseTimersRef.current[stopKey] = window.setTimeout(() => {
        el.classList.remove("section-focus");
        if (headerEl) {
          headerEl.classList.remove("section-focus-header");
        }
      }, 1180);
    }, delayMs);
  };

  const triggerPulseWhenArrived = (el, sectionId, targetTop) => {
    const frameKey = `${sectionId}-arrival-frame`;
    if (sectionPulseFramesRef.current[frameKey]) {
      window.cancelAnimationFrame(sectionPulseFramesRef.current[frameKey]);
    }

    let attempts = 0;
    const maxAttempts = 56;
    const anchor = window.innerHeight * 0.36;

    const checkArrival = () => {
      attempts += 1;
      const delta = Math.abs(window.scrollY - targetTop);
      const rectTop = el.getBoundingClientRect().top;
      const reachedAnchor = rectTop >= 0 && rectTop <= anchor;

      if (delta <= 14 || reachedAnchor || attempts >= maxAttempts) {
        triggerSectionPulse(el, sectionId, 0);
        delete sectionPulseFramesRef.current[frameKey];
        return;
      }

      sectionPulseFramesRef.current[frameKey] =
        window.requestAnimationFrame(checkArrival);
    };

    sectionPulseFramesRef.current[frameKey] =
      window.requestAnimationFrame(checkArrival);
  };

  const navigateToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (!el) return;
    const nextTop = Math.max(getWindowTargetTop(el), 0);
    const behavior = prefersReducedMotion ? "auto" : "smooth";

    window.scrollTo({ top: nextTop, behavior });
    if (prefersReducedMotion) {
      triggerSectionPulse(el, sectionId, 0);
      return;
    }
    triggerPulseWhenArrived(el, sectionId, nextTop);
  };
  // Pointer helpers: distinguish a genuine tap from scroll/drag.
  const handleStatPointerDown = (e, sectionId) => {
    if (e.pointerType === "mouse" && e.button !== 0) {
      pointerStartRef.current = null;
      return;
    }
    pointerStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      id: sectionId,
      t: Date.now(),
      moved: false,
    };
  };

  const handleStatPointerMove = (e) => {
    const s = pointerStartRef.current;
    if (!s || s.moved) return;
    const dx = Math.abs(e.clientX - s.x);
    const dy = Math.abs(e.clientY - s.y);
    if (dx >= TAP_MOVE_THRESHOLD || dy >= TAP_MOVE_THRESHOLD) {
      s.moved = true;
    }
  };

  const handleStatPointerUp = (e, sectionId) => {
    const s = pointerStartRef.current;
    if (!s) return;
    pointerStartRef.current = null;
    if (s.id !== sectionId) return;
    const dx = Math.abs(e.clientX - s.x);
    const dy = Math.abs(e.clientY - s.y);
    const dt = Date.now() - s.t;
    if (
      !s.moved &&
      dx < TAP_MOVE_THRESHOLD &&
      dy < TAP_MOVE_THRESHOLD &&
      dt < TAP_TIME_THRESHOLD_MS
    ) {
      navigateToSection(s.id);
    }
  };

  const handleStatPointerCancel = () => {
    pointerStartRef.current = null;
  };

  const headlineStats = useMemo(() => {
    const totalCadre =
      engineeringCadreData.find((x) => x.cadre === "Total") || {};
    const totalMi =
      minorIrrigationData.find((x) => x.type === "Total")?.count || 0;
    const majorIrrigationSources = 2;
    const mediumIrrigationSources = 13;
    const majorMediumTotal = majorIrrigationSources + mediumIrrigationSources;
    const minorIrrigationSources = toSafeNumber(totalMi);
    const totalWorks = omWorksData.reduce(
      (sum, item) => sum + toSafeNumber(item.adminSanction?.nos),
      0,
    );

    return [
      {
        label: "Cadre Strenght Irrigation",
        value: formatNumber(totalCadre.workingStrength),
        helper: `${formatNumber(totalCadre.vacant)} Vacancies`,
        sectionId: "section-cadre",
      },
      {
        label: "Major and Medium Irrigation",
        value: formatNumber(majorMediumTotal),
        helper: `Major ${formatMixedMetric(majorIrrigationSources)} | Medium ${formatMixedMetric(mediumIrrigationSources)}`,
        sectionId: "section-major-medium-assets",
      },
      {
        label: "Minor Irrigation",
        value: formatNumber(minorIrrigationSources),
        helper: "Total sources",
        sectionId: "section-minor-irrigation",
      },
      {
        label: "O&M Sanctions",
        value: formatNumber(totalWorks),
        helper: "Across all financial years",
        sectionId: "section-om-works",
      },
    ];
  }, []);

  const minorIrrigationChart = useMemo(() => {
    const rows = minorIrrigationData
      .filter((item) => !item.type.startsWith("Total"))
      .map((item) => ({
        name: item.type.replace(/\s*Tanks?$/i, ""),
        value: toSafeNumber(item.count),
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    const total = rows.reduce((sum, item) => sum + item.value, 0);

    return { rows, total };
  }, []);

  const omChartData = useMemo(
    () =>
      omWorksData.map((item) => ({
        year: item.financialYear,
        admin: toSafeNumber(item.adminSanction?.nos),
        technical: toSafeNumber(item.technicalSanction?.nos),
        agreements: toSafeNumber(item.agreements?.nos),
        adminAmount: toSafeNumber(item.adminSanction?.amount),
        technicalAmount: toSafeNumber(item.technicalSanction?.amount),
        agreementAmount: toSafeNumber(item.agreements?.amount),
      })),
    [],
  );

  const omTableRows = useMemo(
    () =>
      omWorksData.map((item) => ({
        year: item.financialYear,
        asNos: toSafeNumber(item.adminSanction?.nos),
        tsNos: toSafeNumber(item.technicalSanction?.nos),
        agNos: toSafeNumber(item.agreements?.nos),
        asAmt: toSafeNumber(item.adminSanction?.amount),
        tsAmt: toSafeNumber(item.technicalSanction?.amount),
        agAmt: toSafeNumber(item.agreements?.amount),
      })),
    [],
  );

  const miTableRows = useMemo(() => {
    const total = minorIrrigationChart.total || 1;
    return minorIrrigationChart.rows.map((item) => ({
      ...item,
      pct: ((item.value / total) * 100).toFixed(2),
    }));
  }, [minorIrrigationChart]);

  const minorPieRows = useMemo(() => {
    const total = minorIrrigationChart.total || 1;
    return minorIrrigationChart.rows.map((item, index) => ({
      ...item,
      pct: ((item.value / total) * 100).toFixed(1),
      color: getMinorChartColor(item.name, index),
    }));
  }, [minorIrrigationChart]);

  useEffect(() => {
    if (!minorPieRows.length) {
      if (activeMiSliceIndex !== 0) {
        setActiveMiSliceIndex(0);
      }
      return;
    }
    if (activeMiSliceIndex > minorPieRows.length - 1) {
      setActiveMiSliceIndex(0);
    }
  }, [activeMiSliceIndex, minorPieRows.length]);

  const approvals = useMemo(
    () =>
      pendingApprovalsData
        .filter((item) => /acr/i.test(item.type))
        .map((item) => ({
          type: item.type,
          count: item.count === "-" ? 0 : toSafeNumber(item.count),
        })),
    [],
  );

  const approvalHighlights = approvals;

  const submissionHighlights = useMemo(
    () =>
      submissionStatusData.map((item) => ({
        ...item,
        isSubmitted:
          /submitted/i.test(item.status) &&
          !/not\s*submitted/i.test(item.status),
      })),
    [],
  );

  const departmentAssets = useMemo(() => {
    const allowedAssetProjects = new Set([
      "Reservoirs/Barrages",
      "LIS",
      "IDC (Small lift)",
      "Tunnels",
      "Land Acquisition",
    ]);

    return majorMediumIrrigationData
      .filter((item) => allowedAssetProjects.has(item.project))
      .map((item) => ({
        project: item.project,
        count: formatMixedMetric(item.count),
      }));
  }, []);

  const ayacutHighlights = useMemo(() => {
    const parseAyacutNumber = (value) => {
      if (typeof value === "number") return value;
      if (typeof value === "string") {
        const match = value.match(/-?\d+(\.\d+)?/);
        if (match) return Number(match[0]);
      }
      return 0;
    };

    const baseRows = ayacutData.map((item) => ({
      category: item.category,
      contemplated: formatMixedMetric(item.contemplated),
      created: formatMixedMetric(item.created),
    }));

    const totalContemplated = ayacutData.reduce(
      (sum, item) => sum + parseAyacutNumber(item.contemplated),
      0,
    );
    const totalCreated = ayacutData.reduce(
      (sum, item) => sum + parseAyacutNumber(item.created),
      0,
    );
    const hasLacUnit = ayacutData.some((item) =>
      /lac/i.test(`${item.contemplated ?? ""} ${item.created ?? ""}`),
    );

    const totalRow = {
      category: "Total",
      contemplated: hasLacUnit
        ? `${totalContemplated.toFixed(1)} L ac`
        : formatNumber(totalContemplated),
      created: hasLacUnit
        ? `${totalCreated.toFixed(1)} L ac`
        : formatNumber(totalCreated),
      isTotal: true,
    };

    return [...baseRows, totalRow];
  }, []);

  const employeeCategoryTableData = useMemo(() => {
    const rows = employeeTypesData.map((item) => ({
      category: item.type.replace(" Employees", ""),
      count: toSafeNumber(item.count),
    }));
    const total = rows.reduce((sum, item) => sum + item.count, 0);
    return { rows, total };
  }, []);

  const legalSnapshot = useMemo(() => {
    const total = toSafeNumber(
      legalCasesData.find((x) => x.category === "Total Cases")?.count,
    );
    const pending = toSafeNumber(
      legalCasesData.find((x) => x.category === "Pending")?.count,
    );
    const disposed = toSafeNumber(
      legalCasesData.find((x) => x.category === "Disposed")?.count,
    );

    const pendingPct = total > 0 ? (pending / total) * 100 : 0;
    const disposedPct = total > 0 ? (disposed / total) * 100 : 0;

    return { total, pending, disposed, pendingPct, disposedPct };
  }, []);

  const dashboardStamp = useMemo(
    () =>
      new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date()),
    [],
  );

  const profileName = userInfo?.name || "Official";
  const profileDesignation = userInfo?.designation || "Designation";
  const profileOffice = userInfo?.office || "Office not available";
  const profilePhone = userInfo?.phone || "Phone not available";
  const profileEmail = userInfo?.email || "Email not available";
  const profilePhoneLink = normalizePhoneLink(profilePhone);
  const hasPhoneLink =
    hasUsableValue(profilePhone) && Boolean(profilePhoneLink);
  const hasEmailLink =
    hasUsableValue(profileEmail) && profileEmail.includes("@");
  const profileInitials = profileName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () =>
      setPrefersReducedMotion(mediaQuery.matches);
    syncMotionPreference();
    mediaQuery.addEventListener?.("change", syncMotionPreference);

    return () => {
      mediaQuery.removeEventListener?.("change", syncMotionPreference);
    };
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (prefersReducedMotion) {
      return () => {
        clearSectionPulseTimers();
        pointerStartRef.current = null;
      };
    }

    const ctx = gsap.context(() => {
      // Temporary header entrance: one-shot, then clear inline styles.
      gsap.from(".temp-header-strip", {
        y: 28,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        clearProps: "transform,opacity",
      });

      // Stat pills entrance: one-shot, then clear.
      gsap.fromTo(
        ".stats-col",
        { y: 18, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.65,
          stagger: 0.08,
          ease: "power2.out",
          delay: 0.18,
          clearProps: "transform,opacity,visibility",
        },
      );

      // Reveal cards once for scroll performance.
      gsap.utils.toArray(".reveal-card").forEach((element) => {
        gsap.from(element, {
          scrollTrigger: {
            trigger: element,
            start: "top 82%",
            once: true,
          },
          y: 22,
          opacity: 0,
          duration: 0.75,
          ease: "power2.out",
          clearProps: "transform,opacity",
        });
      });

      gsap.utils
        .toArray(".stack-row, .employee-pill, .micro-stat")
        .forEach((element) => {
          gsap.from(element, {
            scrollTrigger: {
              trigger: element,
              start: "top 88%",
              once: true,
            },
            x: -12,
            opacity: 0,
            duration: 0.45,
            ease: "power1.out",
            clearProps: "transform,opacity",
          });
        });
    }, dashboardRef);

    return () => {
      ctx.revert();
      clearSectionPulseTimers();
      pointerStartRef.current = null;
    };
  }, [prefersReducedMotion]);

  return (
    <div className="enc-premium-dashboard" ref={dashboardRef}>
      <section className="temp-header-strip">
        <div>
          <p className="temp-header-kicker mb-1">Dashboard Module</p>
          <h2 className="temp-header-title mb-1">ENC Admin Dashboard</h2>
          <p className="temp-header-note mb-0">
            Irrigation engineering operations overview for approvals, works,
            legal, and assets.
          </p>
        </div>
        <div className="temp-header-meta">Last refresh: {dashboardStamp}</div>
      </section>

      <Row className="g-3 mt-1 stats-row">
        {headlineStats.map((stat, index) => (
          <Col key={stat.label} xl={3} md={6} className="stats-col">
            <Card
              className={`glass-card shad-card stat-card h-100 clickable-stat ${stat.breakdown ? "has-breakdown" : ""} ${stat.breakdownOnly ? "breakdown-only" : ""} ${stat.breakdown?.length === 2 ? "has-breakdown-two" : ""}`}
              role="button"
              tabIndex={0}
              aria-label={`Jump to ${stat.label} section`}
              title={`Jump to ${stat.label}`}
              onPointerDown={(e) => handleStatPointerDown(e, stat.sectionId)}
              onPointerMove={handleStatPointerMove}
              onPointerCancel={handleStatPointerCancel}
              onPointerLeave={handleStatPointerCancel}
              onPointerUp={(e) => handleStatPointerUp(e, stat.sectionId)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  navigateToSection(stat.sectionId);
                }
              }}
            >
              <Card.Body>
                <div className="stat-kicker">{stat.label}</div>
                {stat.value ? (
                  <div className="stat-value">{stat.value}</div>
                ) : null}
                {stat.helper ? (
                  <div className="stat-helper">{stat.helper}</div>
                ) : null}
                {stat.breakdown ? (
                  <div className="stat-breakdown" aria-label={stat.label}>
                    {stat.breakdown.map((item) => (
                      <div key={item.label} className="stat-breakdown-item">
                        <span className="stat-breakdown-label">
                          {item.label}
                        </span>
                        <strong className="stat-breakdown-value">
                          {item.value}
                        </strong>
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className={`stat-glow glow-${index + 1}`} />
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-3 mt-1 reveal-card">
        <Col lg={8} className="d-flex flex-column gap-3">
          <Row className="g-3">
            <Col md={6} className="d-flex">
              <Card
                id="section-approvals"
                className="glass-card shad-card h-100 w-100"
              >
                <Card.Header className="glass-card-header">
                  Approvals
                </Card.Header>
                <Card.Body>
                  <div
                    className={`approval-grid approval-grid-compact ${approvalHighlights.length === 1 ? "approval-grid-single" : ""}`}
                  >
                    {approvalHighlights.map((item) => (
                      <div
                        key={item.type}
                        className={`approval-tile ${item.count > 0 ? "is-pending" : "is-clear"}`}
                      >
                        <div className="approval-label d-flex align-items-center justify-content-between gap-2">
                          <span>{item.type}</span>
                          <Badge
                            pill
                            bg={item.count > 0 ? "warning" : "success"}
                            className="approval-state-badge"
                          >
                            {item.count > 0 ? "Pending" : "Clear"}
                          </Badge>
                        </div>
                        <div className="approval-value">
                          {item.count > 0 ? formatNumber(item.count) : "-"}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="d-flex">
              <ReactBitsAnimatedContent
                className="h-100 w-100"
                distance={46}
                duration={0.74}
                threshold={0.2}
                scale={0.985}
              >
                <ReactBitsGlareHover
                  className="h-100 w-100 card-glare-shell"
                  glareOpacity={0.12}
                  glareSize={205}
                  transitionDuration={520}
                >
                  <Card className="glass-card shad-card h-100 w-100 submission-card">
                    <Card.Header className="glass-card-header">
                      Submission
                    </Card.Header>
                    <Card.Body>
                      <div className="submission-stack">
                        {submissionHighlights.map((item) => (
                          <div
                            key={item.type}
                            className={`submission-row ${item.isSubmitted ? "is-submitted" : "is-not-submitted"}`}
                          >
                            <span className="submission-label">
                              {item.type}
                            </span>
                            <Badge
                              pill
                              bg={item.isSubmitted ? "success" : "warning"}
                              className="submission-badge"
                            >
                              {item.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                </ReactBitsGlareHover>
              </ReactBitsAnimatedContent>
            </Col>
          </Row>

          <Row className="g-3 align-items-stretch">
            <Col md={6} className="d-flex">
              <Card
                id="section-major-medium-assets"
                className="glass-card shad-card h-100 w-100"
              >
                <Card.Header className="glass-card-header">
                  Major and Medium Irrigation
                </Card.Header>
                <Card.Body className="stack-list">
                  {departmentAssets.map((item) => (
                    <div key={item.project} className="stack-row">
                      <span>{item.project}</span>
                      <strong>{item.count}</strong>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="d-flex">
              <Card
                id="section-ayacut"
                className="glass-card shad-card h-100 w-100 compact-info-card"
              >
                <Card.Header className="glass-card-header">Ayacut</Card.Header>
                <Card.Body className="p-0 ayacut-card-body">
                  <div className="table-responsive ayacut-table-wrap">
                    <Table
                      hover
                      className="premium-table premium-table-soft ayacut-table mb-0"
                    >
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th className="text-end">Contemplated</th>
                          <th className="text-end">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ayacutHighlights.map((item) => (
                          <tr
                            key={item.category}
                            className={item.isTotal ? "table-total" : ""}
                          >
                            <td>{item.category}</td>
                            <td className="text-end">{item.contemplated}</td>
                            <td className="text-end">{item.created}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>

        <Col lg={4} className="d-flex flex-column gap-3">
          <Card className="glass-card shad-card operator-profile-card">
            <Card.Header className="glass-card-header">
              Profile Information
            </Card.Header>
            <Card.Body className="operator-profile-grid">
              <div className="operator-profile-top">
                <div className="operator-avatar">{profileInitials}</div>
                <div className="operator-id-block">
                  <div className="operator-id-name">{profileName}</div>
                  <div className="operator-id-designation">
                    {profileDesignation}
                  </div>
                </div>
              </div>

              <div className="operator-profile-row">
                <span className="operator-profile-label">Phone</span>
                <span className="operator-profile-value">
                  {hasPhoneLink ? (
                    <a
                      href={`tel:${profilePhoneLink}`}
                      className="operator-profile-link"
                    >
                      {profilePhone}
                    </a>
                  ) : (
                    profilePhone
                  )}
                </span>
              </div>
              <div className="operator-profile-row">
                <span className="operator-profile-label">Email</span>
                <span className="operator-profile-value">
                  {hasEmailLink ? (
                    <a
                      href={`mailto:${profileEmail}`}
                      className="operator-profile-link"
                    >
                      {profileEmail}
                    </a>
                  ) : (
                    profileEmail
                  )}
                </span>
              </div>
              <div className="operator-profile-row">
                <span className="operator-profile-label">Office</span>
                <span className="operator-profile-value">{profileOffice}</span>
              </div>
              <div className="operator-profile-footnote">
                Updated at {dashboardStamp}
              </div>
            </Card.Body>
          </Card>

          <Card
            id="section-legal-approvals"
            className="glass-card shad-card flex-fill"
          >
            <Card.Header className="glass-card-header">Legal</Card.Header>
            <Card.Body>
              <div className="legal-metrics-grid">
                <div className="metric-strip mb-0">
                  <div>
                    <div className="metric-title">Pending Cases</div>
                    <div className="metric-value warning">
                      {compact(legalSnapshot.pending)}
                    </div>
                  </div>
                  <ProgressBar
                    now={legalSnapshot.pendingPct}
                    className="metric-progress"
                    variant="warning"
                  />
                </div>

                <div className="metric-strip mb-0">
                  <div>
                    <div className="metric-title">Disposed Cases</div>
                    <div className="metric-value success">
                      {compact(legalSnapshot.disposed)}
                    </div>
                  </div>
                  <ProgressBar
                    now={legalSnapshot.disposedPct}
                    className="metric-progress"
                    variant="success"
                  />
                </div>
              </div>
              <div className="mini-total text-center mt-3">
                Total Cases:{" "}
                <strong>{formatNumber(legalSnapshot.total)}</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mt-1 reveal-card">
        <Col xl={8} className="order-2 order-xl-2">
          <Card id="section-om-works" className="glass-card shad-card h-100">
            <Card.Header className="glass-card-header card-head-split">
              <span>O&M Works Trend (Nos)</span>
              <ViewModeToggle
                idPrefix="om"
                mode={viewMode.om}
                ariaLabel="O&M view mode"
                onChange={(nextMode) =>
                  setViewMode((prev) => ({ ...prev, om: nextMode }))
                }
              />
            </Card.Header>
            <Card.Body className="chart-shell">
              {viewMode.om === "table" ? (
                <div className="beauty-table-wrap">
                  <Table
                    responsive
                    hover
                    className="premium-table premium-table-soft mb-0"
                  >
                    <thead>
                      <tr>
                        <th>FY</th>
                        <th className="text-end">AS (Nos)</th>
                        <th className="text-end">TS (Nos)</th>
                        <th className="text-end">AGR (Nos)</th>
                        <th className="text-end">AS Amt</th>
                        <th className="text-end">TS Amt</th>
                        <th className="text-end">AGR Amt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {omTableRows.map((row) => (
                        <tr key={row.year}>
                          <td>{row.year}</td>
                          <td className="text-end">
                            {formatNumber(row.asNos)}
                          </td>
                          <td className="text-end">
                            {formatNumber(row.tsNos)}
                          </td>
                          <td className="text-end">
                            {formatNumber(row.agNos)}
                          </td>
                          <td className="text-end">
                            {formatNumber(row.asAmt)}
                          </td>
                          <td className="text-end">
                            {formatNumber(row.tsAmt)}
                          </td>
                          <td className="text-end">
                            {formatNumber(row.agAmt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="chart-interactive-surface">
                  <ResponsiveContainer width="100%" height={310}>
                    <ComposedChart data={omChartData} barGap={8}>
                      <defs>
                        <linearGradient
                          id="omAmountGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#14b8a6"
                            stopOpacity={0.42}
                          />
                          <stop
                            offset="95%"
                            stopColor="#14b8a6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="omAdminBarGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#1f9de3" />
                          <stop offset="100%" stopColor="#0b6fb8" />
                        </linearGradient>
                        <linearGradient
                          id="omAgreementsBarGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#34d399" />
                          <stop offset="100%" stopColor="#15a85b" />
                        </linearGradient>
                        <linearGradient
                          id="omAgreementLineGradient"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#f97316" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="4 4"
                        vertical={false}
                        stroke="rgba(132, 175, 199, 0.55)"
                      />
                      <XAxis
                        dataKey="year"
                        tick={{ fontSize: 11, fill: "#3b5e75" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        yAxisId="count"
                        tick={{ fontSize: 11, fill: "#3b5e75" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        yAxisId="amount"
                        orientation="right"
                        tick={{ fontSize: 11, fill: "#3b5e75" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => compact(value)}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 14,
                          border: "1px solid rgba(126, 193, 223, 0.85)",
                          boxShadow: "0 16px 42px rgba(9, 54, 79, 0.18)",
                          backdropFilter: "blur(6px)",
                          backgroundColor: "rgba(251, 254, 255, 0.96)",
                          padding: "0.56rem 0.64rem",
                        }}
                        cursor={{ fill: "rgba(14, 165, 198, 0.09)" }}
                        formatter={(value, name) => [formatNumber(value), name]}
                      />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{
                          fontSize: 11,
                          paddingTop: 6,
                          color: "#35556d",
                        }}
                      />
                      <Area
                        yAxisId="amount"
                        type="monotone"
                        dataKey="adminAmount"
                        name="Admin Amount"
                        stroke="#14b8a6"
                        fill="url(#omAmountGradient)"
                        strokeWidth={2}
                        animationDuration={900}
                        animationEasing="ease-out"
                      />
                      <Line
                        yAxisId="amount"
                        type="monotone"
                        dataKey="agreementAmount"
                        name="Agreement Amount"
                        stroke="url(#omAgreementLineGradient)"
                        strokeWidth={2.4}
                        dot={{ r: 2.4, fill: "#f59e0b", stroke: "#ffffff" }}
                        activeDot={{ r: 5, stroke: "#ffffff", strokeWidth: 2 }}
                        animationDuration={860}
                        animationEasing="ease-out"
                      />
                      <Bar
                        yAxisId="count"
                        dataKey="admin"
                        name="Admin Sanction (Nos)"
                        fill="url(#omAdminBarGradient)"
                        barSize={28}
                        radius={[8, 8, 0, 0]}
                        animationDuration={820}
                        animationEasing="ease-out"
                      />
                      <Bar
                        yAxisId="count"
                        dataKey="agreements"
                        name="Agreements (Nos)"
                        fill="url(#omAgreementsBarGradient)"
                        barSize={28}
                        radius={[8, 8, 0, 0]}
                        animationDuration={900}
                        animationEasing="ease-out"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xl={4} className="order-1 order-xl-1">
          <Card
            id="section-minor-irrigation"
            className="glass-card shad-card h-100 minor-irrigation-card"
          >
            <Card.Header className="glass-card-header card-head-split">
              <span>Minor Irrigation</span>
              <ViewModeToggle
                idPrefix="mi"
                mode={viewMode.mi}
                ariaLabel="Minor Irrigation view mode"
                onChange={(nextMode) =>
                  setViewMode((prev) => ({ ...prev, mi: nextMode }))
                }
              />
            </Card.Header>
            <Card.Body
              className={`chart-shell ${viewMode.mi === "graph" ? "mi-chart-body" : ""}`}
            >
              {viewMode.mi === "table" ? (
                <div className="beauty-table-wrap mi-table-scroll">
                  <Table
                    responsive
                    hover
                    className="premium-table premium-table-soft mb-0"
                  >
                    <thead>
                      <tr>
                        <th>Source</th>
                        <th className="text-end">Count</th>
                        <th className="text-end">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {miTableRows.map((row) => (
                        <tr key={row.name}>
                          <td>{row.name}</td>
                          <td className="text-end">
                            {formatNumber(row.value)}
                          </td>
                          <td className="text-end">{row.pct}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="chart-interactive-surface chart-interactive-surface-sm mi-chart-shell mi-chart-surface">
                  <div className="mi-graph-layout">
                    <div className="mi-breakdown-list">
                      {minorPieRows.map((row, idx) => (
                        <button
                          key={row.name}
                          type="button"
                          className={`mi-breakdown-item ${idx === activeMiSliceIndex ? "active" : ""}`}
                          onMouseEnter={() => setActiveMiSliceIndex(idx)}
                          onFocus={() => setActiveMiSliceIndex(idx)}
                          onClick={() => setActiveMiSliceIndex(idx)}
                        >
                          <span className="mi-breakdown-left">
                            <span
                              className="mi-source-dot"
                              style={{ backgroundColor: row.color }}
                            />
                            <span className="mi-breakdown-name">
                              {row.name}
                            </span>
                          </span>
                          <span className="mi-breakdown-right">{row.pct}%</span>
                        </button>
                      ))}
                    </div>
                    <div className="mi-pie-wrap">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={minorPieRows}
                            cx="50%"
                            cy="50%"
                            innerRadius={62}
                            outerRadius={96}
                            dataKey="value"
                            nameKey="name"
                            paddingAngle={1}
                            stroke="rgba(255,255,255,0.94)"
                            strokeWidth={3}
                            activeIndex={activeMiSliceIndex}
                            activeShape={(props) => (
                              <Sector
                                {...props}
                                outerRadius={(props.outerRadius || 0) + 8}
                              />
                            )}
                            onMouseEnter={(_, idx) =>
                              setActiveMiSliceIndex(idx)
                            }
                            animationDuration={880}
                            animationEasing="ease-out"
                          >
                            {minorPieRows.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                            <Label
                              content={({ viewBox }) => {
                                if (
                                  !viewBox ||
                                  typeof viewBox.cx !== "number" ||
                                  typeof viewBox.cy !== "number"
                                ) {
                                  return null;
                                }
                                return (
                                  <text
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                  >
                                    <tspan
                                      x={viewBox.cx}
                                      y={viewBox.cy - 3}
                                      className="mi-donut-total"
                                    >
                                      {formatNumber(minorIrrigationChart.total)}
                                    </tspan>
                                    <tspan
                                      x={viewBox.cx}
                                      y={viewBox.cy + 14}
                                      className="mi-donut-sub"
                                    >
                                      Total
                                    </tspan>
                                  </text>
                                );
                              }}
                            />
                          </Pie>
                          <Tooltip
                            formatter={(value) => formatNumber(value)}
                            contentStyle={{
                              borderRadius: 12,
                              border: "1px solid rgba(126, 193, 223, 0.85)",
                              boxShadow: "0 12px 30px rgba(9,54,79,0.16)",
                              backgroundColor: "rgba(251,255,255,0.95)",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mt-1 reveal-card density-row">
        <Col lg={12}>
          <Card
            id="section-cadre"
            className="glass-card shad-card h-100 balanced-data-card cadre-unified-card"
          >
            <Card.Header className="glass-card-header">
              Cadre Strength
            </Card.Header>
            <Card.Body className="cadre-unified-body">
              <Row className="g-3">
                <Col xl={4} md={6}>
                  <section className="cadre-subcard h-100">
                    <h6 className="cadre-subcard-title">Irrigation</h6>
                    <div className="table-responsive">
                      <Table hover className="premium-table mb-0">
                        <thead>
                          <tr>
                            <th>Cadre</th>
                            <th>Sanctioned</th>
                            <th>Working</th>
                            <th>Vacant</th>
                          </tr>
                        </thead>
                        <tbody>
                          {engineeringCadreData.map((row) => (
                            <tr
                              key={row.cadre}
                              className={
                                row.cadre === "Total" ? "table-total" : ""
                              }
                            >
                              <td>{row.cadre}</td>
                              <td>{formatNumber(row.sanctionedStrength)}</td>
                              <td>{formatNumber(row.workingStrength)}</td>
                              <td>{formatNumber(row.vacant)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </section>
                </Col>

                <Col xl={4} md={6}>
                  <section className="cadre-subcard h-100">
                    <h6 className="cadre-subcard-title">Non-Irrigation</h6>
                    <div className="table-responsive">
                      <Table hover className="premium-table mb-0">
                        <thead>
                          <tr>
                            <th>Office</th>
                            <th>Sanctioned</th>
                            <th>Working</th>
                            <th>Vacant</th>
                          </tr>
                        </thead>
                        <tbody>
                          {nonIrrigationPostsData.map((row) => (
                            <tr
                              key={row.cadre}
                              className={
                                row.cadre === "Total" ? "table-total" : ""
                              }
                            >
                              <td>{row.cadre}</td>
                              <td>{formatNumber(row.sanctionedStrength)}</td>
                              <td>{formatNumber(row.workingStrength)}</td>
                              <td>{formatNumber(row.vacant)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </section>
                </Col>

                <Col xl={4} md={12}>
                  <section className="cadre-subcard h-100">
                    <h6 className="cadre-subcard-title">
                      Contractual & Out-sourced Staff
                    </h6>
                    <div className="table-responsive">
                      <Table hover className="premium-table mb-0">
                        <thead>
                          <tr>
                            <th>Category</th>
                            <th className="text-end">Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {employeeCategoryTableData.rows.map((row) => (
                            <tr key={row.category}>
                              <td>{row.category}</td>
                              <td className="text-end">
                                {formatNumber(row.count)}
                              </td>
                            </tr>
                          ))}
                          <tr className="table-total">
                            <td>Total</td>
                            <td className="text-end">
                              {formatNumber(employeeCategoryTableData.total)}
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                  </section>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ENCAdminDashboard;
