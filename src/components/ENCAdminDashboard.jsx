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
  omWorksData,
  pendingApprovalsData,
} from "../data/dashboardData";

import MinorIrrigationDonut from "./MinorIrrigationDonut";

const BAR_COLORS = {
  as: "#1565c0",
  ts: "#2e7d32",
  agmt: "#f57f17",
};

const ANIMATION_CONFIG = {
  duration: 1500,
  delay: 200,
};

const ENCAdminDashboard = ({ userInfo }) => {
  const miChartData = useMemo(() => {
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

  const CustomTooltip = ({ active, payload, label }) => {
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
              onError={(e) => { e.target.style.display = "none"; }}
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
          <Card className="dashboard-card">
            <Card.Header className="card-header-govt">Non Irrigation Posts</Card.Header>
            <Card.Body className="p-0">
              <Table bordered size="sm" className="mb-0 govt-table hover-lift-rows">
                <thead>
                  <tr><th>Office</th><th className="text-center">Sanctioned</th><th className="text-center">Working</th><th className="text-center">Vacant</th></tr>
                </thead>
                <tbody>
                  {nonIrrigationPostsData.map((row, idx) => (
                    <tr key={idx} className={row.cadre === "Total" ? "total-row-left" : ""}>
                      <td className="text-truncate" style={{ maxWidth: "180px" }}>{row.cadre}</td>
                      <td className="text-center">{row.sanctionedStrength}</td>
                      <td className="text-center">{row.workingStrength}</td>
                      <td className="text-center">{row.vacant}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* EMPLOYEE TYPES */}
          <Card className="dashboard-card">
            <Card.Header className="card-header-govt">Contract / Work Charged / Out-Sourcing / Contingent Employees</Card.Header>
            <Card.Body className="py-2 px-2">
              <Row className="g-1 text-center">
                {employeeTypesData.map((emp, idx) => (
                  <Col xs={3} key={idx}>
                    <div className="stat-box stat-box-primary">
                      <div className="stat-number">{emp.count}</div>
                      <div className="stat-label">{emp.type.replace(" Employees", "")}</div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>

          {/* ESS & LEGAL CASES */}
          <Row className="g-2">
            <Col xs={6}>
              <Card className="dashboard-card h-100">
                <Card.Header className="card-header-govt">Engineer Security Scheme</Card.Header>
                <Card.Body className="py-2 px-2">
                  <Row className="g-1 text-center">
                    {essData.map((item, idx) => (
                      <Col xs={4} key={idx}>
                        <div className={`stat-box-mini ${item.category === "ESS Not Paid" ? "danger" : item.category === "ESS Paid" ? "success" : "info"}`}>
                          <div className="stat-num">{item.count.toLocaleString()}</div>
                          <div className="stat-lbl">{item.category === "Working Strength" ? "Working" : item.category === "ESS Paid" ? "Paid" : "Not Paid"}</div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={6}>
              <Card className="dashboard-card h-100">
                <Card.Header className="card-header-govt">High Court Legal Cases</Card.Header>
                <Card.Body className="py-2 px-2">
                  <Row className="g-1 text-center">
                    {legalCasesData.map((item, idx) => (
                      <Col xs={4} key={idx}>
                        <div className={`stat-box-mini ${item.category === "Pending" ? "warning" : item.category === "Disposed" ? "success" : "primary"}`}>
                          <div className="stat-num">{item.count.toLocaleString()}</div>
                          <div className="stat-lbl">{item.category.replace(" Cases", "")}</div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* PENDING APPROVALS */}
          <Card className="dashboard-card">
            <Card.Header className="card-header-govt">Pending Approvals</Card.Header>
            <Card.Body className="py-2 px-2">
              <Row className="g-1 text-center">
                {pendingApprovalsData.map((item, idx) => (
                  <Col xs={6} key={idx}>
                    <Badge className={`w-100 py-2 ${item.type.includes("APR") || item.type.includes("ACR") ? "pending-badge-alert-red hover-lift" : "pending-badge-warning"}`}>
                      <div className="pending-count">{item.count || "-"}</div>
                      <div className="pending-label">{item.type}</div>
                    </Badge>
                  </Col>
                ))}
              </Row>
              <div className="text-muted tiny-text text-center mt-1">* Show only pending data</div>
            </Card.Body>
          </Card>
        </Col>

        {/* RIGHT COLUMN */}
        <Col lg={7} className="d-flex flex-column gap-2">
          {/* MAJOR & INFRASTRUCTURE */}
          <Row className="g-2">
            <Col md={6} xs={12}>
              <Card className="dashboard-card h-100">
                <Card.Header className="card-header-govt-alt">Major & Medium Irrigation <span className="no-count-header">No's</span></Card.Header>
                <Card.Body className="p-0">
                  <Table bordered size="sm" className="mb-0 govt-table-alt hover-lift-rows">
                    <tbody>
                      {majorMediumIrrigationData.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.project}</td>
                          <td className="text-center" style={{ width: "80px" }}>{row.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} xs={12} className="d-flex flex-column gap-2">
              <Card className="dashboard-card">
                <Card.Header className="card-header-govt-alt ">Non Irrigation <span className="no-count-header">No's</span></Card.Header>
                <Card.Body className="p-0">
                  <Table bordered size="sm" className="mb-0 govt-table-alt hover-lift-rows">
                    <tbody>
                      {infrastructureData.map((row, idx) => (
                        <tr key={`infra-${idx}`}>
                          <td>{row.project}</td>
                          <td className="text-center" style={{ width: "80px" }}>{row.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>

              <Card className="dashboard-card">
                <Card.Header className="card-header-govt-alt">Ayacut</Card.Header>
                <Card.Body className="p-0">
                  <Table bordered size="sm" className="mb-0 govt-table-alt hover-lift-rows">
                    <tbody>
                      {ayacutData.map((row, idx) => (
                        <tr key={`ayacut-${idx}`}>
                          <td>{row.category}</td>
                          <td className="text-center" style={{ width: "80px" }}>{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* MINOR IRRIGATION */}
          <Card className="dashboard-card">
            <Card.Header className="card-header-govt-alt">
              Minor Irrigation
              <span className="float-end badge total-badge-right">{structuresSummary.find(s => s.isTotal)?.value.toLocaleString()} No's</span>
            </Card.Header>
            <Card.Body className="p-2">
              <div className="mi-donut-wrap" style={{ height: '250px' }}>
                <MinorIrrigationDonut data={miChartData} height="100%" />
              </div>
            </Card.Body>
          </Card>

          {/* O&M WORKS - Full Width */}
          <Card className="dashboard-card">
            <Card.Header className="card-header-govt-alt">
              O&M Works (Financial Year)
            </Card.Header>
            <Card.Body className="p-2">
              <div className="chart-center-wrap">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={omChartData} barGap={1} barCategoryGap="15%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} label={{ value: 'No of Works', angle: -90, position: 'insideLeft', dy: 0, dx: 6, style: { fill: '#000', fontWeight: 700, fontSize: 11, textAnchor: 'middle' } }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "5px" }} iconSize={8} />
                    <Bar dataKey="AS" name="Admin Sanction" fill={BAR_COLORS.as} radius={[2, 2, 0, 0]} barSize={20} isAnimationActive animationDuration={ANIMATION_CONFIG.duration} animationBegin={0} animationEasing="ease-out" />
                    <Bar dataKey="TS" name="Tech Sanction" fill={BAR_COLORS.agmt} radius={[2, 2, 0, 0]} barSize={20} isAnimationActive animationDuration={ANIMATION_CONFIG.duration} animationBegin={ANIMATION_CONFIG.delay} animationEasing="ease-out" />
                    <Bar dataKey="Agreements" fill={BAR_COLORS.ts} radius={[2, 2, 0, 0]} barSize={20} isAnimationActive animationDuration={ANIMATION_CONFIG.duration} animationBegin={ANIMATION_CONFIG.delay * 2} animationEasing="ease-out" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ENCAdminDashboard;
