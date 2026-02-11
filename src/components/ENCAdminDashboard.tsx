import React, { useMemo } from "react";
import { Card, Row, Col, Table, Badge } from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

import {
  engineeringCadreData,
  nonIrrigationPostsData,
  employeeTypesData,
  essData,
  legalCasesData,
  majorMediumIrrigationData,
  infrastructureData,
  ayacutData,
  minorIrrigationData,
  mkPhaseWiseData,
  omWorksData,
  pendingApprovalsData,
} from "../data/dashboardData";

import MinorIrrigationDonut from "./MinorIrrigationDonut";

const PIE_COLORS = ["#1565c0", "#2e7d32", "#f57f17", "#c62828", "#7b1fa2"];

const BAR_COLORS = {
  as: "#1565c0",
  ts: "#2e7d32",
  agmt: "#f57f17",
};

const ANIMATION_CONFIG = {
  duration: 1500,
  delay: 200,
};

interface ENCAdminDashboardProps {
  userInfo?: {
    name: string;
    designation: string;
    office: string;
    phone?: string;
    email?: string;
  };
}

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

const renderCustomLabel = ({
  cx, cy, midAngle, outerRadius, percent, name,
}: {
  cx?: number; cy?: number; midAngle?: number; outerRadius?: number; percent?: number; name?: string;
}) => {
  const RADIAN = Math.PI / 180;
  const _cx = cx || 0;
  const _cy = cy || 0;
  const _midAngle = midAngle || 0;
  const _outerRadius = outerRadius || 0;
  const _percent = percent || 0;
  const _name = name || "";
  const radius = _outerRadius + 25;
  const x = _cx + radius * Math.cos(-_midAngle * RADIAN);
  const y = _cy + radius * Math.sin(-_midAngle * RADIAN);
  const percentValue = _percent * 100;
  const formattedPercent = percentValue < 1 ? percentValue.toFixed(1) : Math.round(percentValue);
  return (
    <text x={x} y={y} fill="#333" textAnchor={x > _cx ? "start" : "end"} dominantBaseline="central" fontSize={10} fontWeight={500}>
      {`${_name} ${formattedPercent}%`}
    </text>
  );
};

const ENCAdminDashboard: React.FC<ENCAdminDashboardProps> = ({ userInfo }) => {
  const miChartData = useMemo(() => {
    // Include all minor irrigation sources (tank sub-types + anicuts + check dams), exclude aggregate 'Total' rows
    return minorIrrigationData
      .filter((item) => !item.type.startsWith("Total"))
      .map((item) => ({ name: item.type.replace(/\s*Tanks?$/i, ""), value: item.count }));
  }, []);

  const structuresSummary = useMemo(() => {
    const tanks = minorIrrigationData.find((d) => d.type === "Total Tanks")?.count || 0;
    const anicuts = minorIrrigationData.find((d) => d.type === "Anicuts")?.count || 0;
    const checkDams = minorIrrigationData.find((d) => d.type === "Check Dams")?.count || 0;
    const total = minorIrrigationData.find((d) => d.type === "Total")?.count || (tanks + anicuts + checkDams);
    return [
      { name: "Tanks", value: tanks, isTotal: false },
      { name: "Anicuts", value: anicuts, isTotal: false },
      { name: "Check Dams", value: checkDams, isTotal: false },
      { name: "Total MI Sources", value: total, isTotal: true },
    ];
  }, []);

  const omChartData = useMemo(() => {
    return omWorksData.map((item) => ({
      year: item.financialYear.replace("20", "'"),
      AS: item.adminSanction.nos,
      TS: item.technicalSanction.nos,
      Agreements: item.agreements.nos,
      asAmt: item.adminSanction.amount,
      tsAmt: item.technicalSanction.amount,
      agmtAmt: item.agreements.amount,
    }));
  }, []);

  // Phase-wise chart data: exclude the 'Others' placeholder so the X axis shows the real phases (incl. CD phase1)
  const mkPhaseChartData = useMemo(() => mkPhaseWiseData.filter((d) => d.phase !== "Others"), []);

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: "2px 0" }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="enc-admin-dashboard">
      {/* HEADER */}
      <div className="dashboard-header">
        <Row className="align-items-center">
          <Col xs="auto">
            <img
              src="https://irrigation.telangana.gov.in/images/tg_logo.png"
              alt="Telangana Logo"
              className="gov-logo"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </Col>
          <Col>
            <h4 className="mb-0 dashboard-title">Dashboard - ENC Admin Login</h4>
            <small className="header-subtitle">Irrigation & CAD Department, Government of Telangana</small>
          </Col>
        </Row>
      </div>

      <Row className="g-2 mt-2">
        {/* LEFT COLUMN */}
        <Col lg={5} className="d-flex flex-column gap-2">
          {/* USER PROFILE */}
          {userInfo && (
            <Card className="dashboard-card">
              <Card.Body className="py-2 px-3">
                <Row className="align-items-center">
                  <Col xs="auto">
                    <div className="user-avatar">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="50" height="50">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  </Col>
                  <Col>
                    <div className="user-details">
                      <Row className="g-0">
                        <Col xs={12}><span className="detail-label">Name</span><span className="detail-value">{userInfo.name}</span></Col>
                        <Col xs={12}><span className="detail-label">Designation</span><span className="detail-value">{userInfo.designation}</span></Col>
                        <Col xs={12}><div className="contact-row"><span className="contact-icon">📞</span><span className="detail-value-sm">{userInfo.phone || "+91-XXXXXXXXXX"}</span></div></Col>
                        <Col xs={12}><div className="contact-row"><span className="contact-icon">✉️</span><span className="detail-value-sm">{userInfo.email || "Email Not Updated"}</span></div></Col>
                        <Col xs={12}><div className="contact-row"><span className="contact-icon">🏢</span><span className="detail-value-sm">{userInfo.office}</span></div></Col>
                      </Row>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* CADRE STRENGTH */}
          <Card className="dashboard-card">
            <Card.Header className="card-header-govt">Cadre Strength</Card.Header>
            <Card.Body className="p-0">
              <Table bordered size="sm" className="mb-0 govt-table hover-lift-rows">
                <thead>
                  <tr><th>Cadre</th><th className="text-center">Sanctioned</th><th className="text-center">Working</th><th className="text-center">Vacant</th></tr>
                </thead>
                <tbody>
                  {engineeringCadreData.map((row, idx) => (
                    <tr key={idx} className={row.cadre === "Total" ? "total-row-left" : ""}>
                      <td>{row.cadre}</td>
                      <td className="text-center">{row.sanctionedStrength}</td>
                      <td className="text-center">{row.workingStrength}</td>
                      <td className="text-center">{row.vacant}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* NON IRRIGATION POSTS */}
          <Card className="dashboard-card">... (truncated for brevity)