/**
 * ============================================================================
 * DASHBOARD DATA CONSTANTS
 * ============================================================================
 */

// ============== CADRE STRENGTH ==============
export const engineeringCadreData = [
  {
    cadre: "Engineering Cadre",
    sanctionedStrength: 2450,
    workingStrength: 2156,
    vacant: 294,
  },
  {
    cadre: "Unit level Establishment",
    sanctionedStrength: 850,
    workingStrength: 742,
    vacant: 108,
  },
  {
    cadre: "Total",
    sanctionedStrength: 3300,
    workingStrength: 2898,
    vacant: 402,
  },
];

export const nonIrrigationPostsData = [
  {
    cadre: "TSIDC LTD",
    sanctionedStrength: 125,
    workingStrength: 98,
    vacant: 27,
  },
  {
    cadre: "DG Walamtari, Hyderabad",
    sanctionedStrength: 82,
    workingStrength: 71,
    vacant: 11,
  },
  {
    cadre: "TSERL, Hyderabad",
    sanctionedStrength: 95,
    workingStrength: 84,
    vacant: 11,
  },
  { cadre: "Total", sanctionedStrength: 302, workingStrength: 253, vacant: 49 },
];

// ============== EMPLOYEE TYPES ==============
export const employeeTypesData = [
  { type: "Contract Employees", count: 143 },
  { type: "Work Charged Employees", count: 913 },
  { type: "Out-Sourcing Employees", count: 647 },
  { type: "Contingent Employees", count: 294 },
];

// ============== ENGINEER SECURITY SCHEME ==============
export const essData = [
  { category: "Working Strength", count: 3249 },
  { category: "ESS Paid", count: 1667 },
  { category: "ESS Not Paid", count: 1582 },
];

// ============== HIGH COURT LEGAL CASES ==============
export const legalCasesData = [
  { category: "Total Cases", count: 6604 },
  { category: "Pending", count: 4029 },
  { category: "Disposed", count: 2575 },
];

// ============== MAJOR & MEDIUM IRRIGATION ==============
export const majorMediumIrrigationData = [
  { project: "Major Irrigation Projects", count: 85 },
  { project: "Medium Irrigation Projects", count: "-" },
  { project: "Reservoirs/Barrages", count: 160 },
  { project: "LIS", count: 147 },
  { project: "IDC (Small lift)", count: "-" },
  { project: "Tunnels", count: 30 },
  { project: "Land Acquisition", count: "13.04 Lakh Acres" },
];

export const infrastructureData = [
  { project: "Buildings", count: 370 },
  { project: "Quarters", count: "-" },
  { project: "Vehicles", count: 178 },
  { project: "Machinery", count: 401 },
];

// ============== AYACUT DATA ==============
export const ayacutData = [
  { category: "Major", contemplated: "12.8 L ac", created: "10.9 L ac" },
  { category: "Medium", contemplated: "6.4 L ac", created: "5.7 L ac" },
  { category: "Minor", contemplated: "24.3 L ac", created: "21.6 L ac" },
];

// ============== MINOR IRRIGATION ==============
export const minorIrrigationData = [
  { type: "MI Tanks", count: 34245 },
  { type: "Percolation Tanks", count: 4058 },
  { type: "Forest Tanks", count: 168 },
  { type: "Private Tanks", count: 1234 },
  { type: "Others Tanks", count: 231 },
  { type: "Total Tanks", count: 39936 },
  { type: "Anicuts", count: 710 },
  { type: "Check Dams", count: 3619 },
  { type: "Total", count: 44265 },
];

// ============== MK PHASE WISE WORKS ==============
export const mkPhaseWiseData = [
  { phase: "Phase 1", adminSanction: 63, agreements: 50, worksCompleted: 49 },
  {
    phase: "Phase 2",
    adminSanction: 1280,
    agreements: 1264,
    worksCompleted: 1245,
  },
  {
    phase: "Phase 3",
    adminSanction: 1521,
    agreements: 1485,
    worksCompleted: 1443,
  },
  {
    phase: "Phase 4",
    adminSanction: 1257,
    agreements: 1143,
    worksCompleted: 1050,
  },
  {
    phase: "CD phase1",
    adminSanction: 1407,
    agreements: 1194,
    worksCompleted: 997,
  },
  {
    phase: "CD phase2",
    adminSanction: 800,
    agreements: 441,
    worksCompleted: 311,
  },
  { phase: "Others", adminSanction: 0, agreements: 0, worksCompleted: 0 },
];

// ============== O&M WORKS DATA ==============
export const omWorksData = [
  {
    slNo: 1,
    financialYear: "2020-21",
    adminSanction: { nos: 63, amount: 18398.89 },
    technicalSanction: { nos: 50, amount: 13312.26 },
    agreements: { nos: 49, amount: 1666.06 },
  },
  {
    slNo: 2,
    financialYear: "2021-22",
    adminSanction: { nos: 1280, amount: 35219.32 },
    technicalSanction: { nos: 1264, amount: 33835.94 },
    agreements: { nos: 1245, amount: 18552.1 },
  },
  {
    slNo: 3,
    financialYear: "2022-23",
    adminSanction: { nos: 1521, amount: 24981.2 },
    technicalSanction: { nos: 1485, amount: 24620.96 },
    agreements: { nos: 1443, amount: 16848.03 },
  },
  {
    slNo: 4,
    financialYear: "2023-24",
    adminSanction: { nos: 1257, amount: 34764.84 },
    technicalSanction: { nos: 1143, amount: 28944.8 },
    agreements: { nos: 1050, amount: 16707.01 },
  },
  {
    slNo: 5,
    financialYear: "2024-25",
    adminSanction: { nos: 1407, amount: 29895.22 },
    technicalSanction: { nos: 1194, amount: 23081.95 },
    agreements: { nos: 997, amount: 12425.05 },
  },
  {
    slNo: 6,
    financialYear: "2025-26",
    adminSanction: { nos: 800, amount: 21119.45 },
    technicalSanction: { nos: 441, amount: 4944.62 },
    agreements: { nos: 311, amount: 3024.74 },
  },
];

// ============== PENDING APPROVALS ==============
export const pendingApprovalsData = [
  { type: "ACR Pending", count: "-" },
  { type: "APR Pending", count: "-" },
];

// ============== SUBMISSION STATUS (MOCK) ==============
export const submissionStatusData = [
  { type: "APR", status: "Not Submitted" },
  { type: "ACR", status: "Submitted" },
];

// ============== CIRCULARS ==============
export const circularsData = [
  {
    id: 1,
    date: "18/02/2026",
    circularNumber: "RC/ENC/A4/19032025/B-10/AE/2025",
    subject:
      "TSIES-AEs - Exemption from passing the Language Test in Telugu - Orders issued.",
  },
  {
    id: 2,
    date: "13/02/2026",
    circularNumber: "RC/ENC(Admn.)/D2/12063040/2026",
    subject:
      "TGMS - Review of seniority list of Superintendents and inclusion of eligible names - Called for.",
  },
  {
    id: 3,
    date: "10/02/2026",
    circularNumber: "RC/ENC/D2/26021524/2026",
    subject:
      "TIES-DEEs & AEE/AEs - Drafting of services for AMRP SLBC tunnel works - Willingness called for.",
  },
];
