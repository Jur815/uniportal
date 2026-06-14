const path = require("path");
const pptxgen = require("/Users/peterjur/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pptxgenjs");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "Sky High Tech";
pptx.company = "Sky High Tech";
pptx.subject = "UniPortal Executive Presentation";
pptx.title = "UniPortal Executive Presentation Final";
pptx.lang = "en-US";
pptx.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "en-US",
};
pptx.defineLayout({ name: "LAYOUT_WIDE", width: 13.333, height: 7.5 });

const OUT = path.join(__dirname, "UniPortal_Executive_Presentation_Final(1).pptx");
const LOGO = path.join(__dirname, "../client/public/branding/uniportal-logo.png");

const C = {
  navy: "0B2545",
  blue: "0F548C",
  gold: "C9A227",
  bg: "F4F8FC",
  white: "FFFFFF",
  ink: "122033",
  muted: "5D6978",
  line: "D6E0EA",
  paleBlue: "EAF1F8",
  paleGold: "FBF5DF",
};

function slideBase(slide, page) {
  slide.background = { color: C.bg };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.19,
    h: 7.5,
    fill: { color: C.blue },
    line: { color: C.blue },
  });
  slide.addImage({ path: LOGO, x: 1.2, y: 0.35, w: 0.47, h: 0.47 });
  slide.addText("Executive presentation", {
    x: 11.05,
    y: 0.48,
    w: 1.4,
    h: 0.18,
    fontFace: "Aptos",
    fontSize: 7.8,
    color: C.muted,
    align: "right",
    margin: 0,
  });
  slide.addShape(pptx.ShapeType.line, {
    x: 0.67,
    y: 6.96,
    w: 11.25,
    h: 0,
    line: { color: C.line, width: 0.6 },
  });
  slide.addText(`UniPortal / ${String(page).padStart(2, "0")}`, {
    x: 0.67,
    y: 7.08,
    w: 1.8,
    h: 0.15,
    fontSize: 6.6,
    color: C.muted,
    margin: 0,
  });
}

function title(slide, kicker, headline, subhead) {
  slide.addText(kicker, {
    x: 0.67,
    y: 1.05,
    w: 9.7,
    h: 0.2,
    fontFace: "Aptos Display",
    fontSize: 8.2,
    color: C.blue,
    bold: true,
    margin: 0,
    breakLine: false,
  });
  slide.addText(headline, {
    x: 0.67,
    y: 1.38,
    w: 9.9,
    h: 0.8,
    fontFace: "Aptos Display",
    fontSize: 24,
    color: C.ink,
    bold: true,
    fit: "shrink",
    margin: 0,
  });
  if (subhead) {
    slide.addText(subhead, {
      x: 0.67,
      y: 2.28,
      w: 10.3,
      h: 0.42,
      fontSize: 11,
      color: C.muted,
      fit: "shrink",
      margin: 0,
    });
  }
}

function footerlessCover(slide) {
  slide.background = { color: C.bg };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.19,
    h: 7.5,
    fill: { color: C.blue },
    line: { color: C.blue },
  });
  slide.addImage({ path: LOGO, x: 1.55, y: 0.6, w: 0.7, h: 0.7 });
  slide.addText("Institutional Student Information and Enrollment Management System", {
    x: 0.67,
    y: 1.55,
    w: 7.4,
    h: 0.7,
    fontFace: "Aptos Display",
    fontSize: 28,
    color: C.ink,
    bold: true,
    fit: "shrink",
    margin: 0,
  });
  slide.addShape(pptx.ShapeType.line, {
    x: 0.67,
    y: 4.38,
    w: 6.45,
    h: 0,
    line: { color: C.gold, width: 1.5 },
  });
  slide.addText("Prepared for university and college decision-makers.", {
    x: 0.67,
    y: 4.65,
    w: 7.6,
    h: 0.3,
    fontSize: 12.5,
    color: C.muted,
    margin: 0,
  });
  slide.addText("Focused institutional MVP for academic setup, student management, course registration, registrar approval, enrollment slips, and academic record foundations.", {
    x: 0.67,
    y: 5.18,
    w: 8.7,
    h: 0.5,
    fontSize: 11,
    color: C.ink,
    fit: "shrink",
    margin: 0,
  });
  slide.addText("Executive demo narrative", {
    x: 0.67,
    y: 6.33,
    w: 2.8,
    h: 0.24,
    fontSize: 9,
    color: C.blue,
    bold: true,
    margin: 0,
  });
  slide.addShape(pptx.ShapeType.line, {
    x: 0.67,
    y: 6.96,
    w: 11.25,
    h: 0,
    line: { color: C.line, width: 0.6 },
  });
  slide.addText("UniPortal / 01", {
    x: 0.67,
    y: 7.08,
    w: 1.8,
    h: 0.15,
    fontSize: 6.6,
    color: C.muted,
    margin: 0,
  });
}

function bullet(slide, text, x, y, w, color = C.ink) {
  slide.addShape(pptx.ShapeType.ellipse, {
    x,
    y: y + 0.07,
    w: 0.08,
    h: 0.08,
    fill: { color: C.gold },
    line: { color: C.gold },
  });
  slide.addText(text, {
    x: x + 0.22,
    y,
    w,
    h: 0.22,
    fontSize: 10.2,
    color,
    fit: "shrink",
    margin: 0,
  });
}

function panel(slide, x, y, w, h, header, body, fill = C.white) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.04,
    fill: { color: fill },
    line: { color: C.line, width: 0.8 },
  });
  slide.addText(header, {
    x: x + 0.25,
    y: y + 0.22,
    w: w - 0.5,
    h: 0.24,
    fontSize: 11,
    color: C.blue,
    bold: true,
    margin: 0,
  });
  slide.addText(body, {
    x: x + 0.25,
    y: y + 0.62,
    w: w - 0.5,
    h: h - 0.75,
    fontSize: 10.2,
    color: C.ink,
    fit: "shrink",
    margin: 0,
    valign: "mid",
  });
}

function numberItem(slide, n, text, x, y) {
  slide.addShape(pptx.ShapeType.ellipse, {
    x,
    y,
    w: 0.36,
    h: 0.36,
    fill: { color: C.blue },
    line: { color: C.blue },
  });
  slide.addText(String(n), {
    x,
    y: y + 0.08,
    w: 0.36,
    h: 0.12,
    fontSize: 8.5,
    color: C.white,
    bold: true,
    align: "center",
    margin: 0,
  });
  slide.addText(text, {
    x: x + 0.48,
    y,
    w: 4.25,
    h: 0.38,
    fontSize: 10,
    color: C.ink,
    fit: "shrink",
    margin: 0,
  });
}

function addComparisonTable(slide, x, y, rows, col1 = "UniPortal Advantage", col2 = "Institutional Benefit") {
  const rowH = 0.46;
  const w1 = 4.15;
  const w2 = 5.35;
  slide.addShape(pptx.ShapeType.rect, {
    x,
    y,
    w: w1 + w2,
    h: rowH,
    fill: { color: C.navy },
    line: { color: C.navy },
  });
  slide.addText(col1, { x: x + 0.18, y: y + 0.15, w: w1 - 0.35, h: 0.16, fontSize: 9.4, color: C.white, bold: true, margin: 0 });
  slide.addText(col2, { x: x + w1 + 0.18, y: y + 0.15, w: w2 - 0.35, h: 0.16, fontSize: 9.4, color: C.white, bold: true, margin: 0 });
  rows.forEach((r, i) => {
    const yy = y + rowH * (i + 1);
    const fill = i % 2 === 0 ? C.white : C.paleBlue;
    slide.addShape(pptx.ShapeType.rect, { x, y: yy, w: w1, h: rowH, fill: { color: fill }, line: { color: C.line, width: 0.5 } });
    slide.addShape(pptx.ShapeType.rect, { x: x + w1, y: yy, w: w2, h: rowH, fill: { color: fill }, line: { color: C.line, width: 0.5 } });
    slide.addText(r[0], { x: x + 0.18, y: yy + 0.12, w: w1 - 0.35, h: 0.18, fontSize: 8.8, color: C.ink, fit: "shrink", margin: 0 });
    slide.addText(r[1], { x: x + w1 + 0.18, y: yy + 0.12, w: w2 - 0.35, h: 0.18, fontSize: 8.8, color: C.ink, fit: "shrink", margin: 0 });
  });
}

function addDeck() {
  let s = pptx.addSlide();
  footerlessCover(s);

  s = pptx.addSlide();
  slideBase(s, 2);
  title(s, "THE PROBLEM", "Registration still runs through fragmented tools", "Paper forms, spreadsheets, manual approvals, and unclear student communication create avoidable friction.");
  const problems = [
    "Student records are fragmented across offices.",
    "Course registration lacks clear approval tracking.",
    "Registrars resolve duplicate or incomplete requests manually.",
    "Students do not always know their registration status.",
    "Leadership has limited real-time visibility.",
    "Audit trails are weak or missing.",
  ];
  problems.forEach((t, i) => bullet(s, t, 0.92, 3.04 + i * 0.49, 5.8));
  panel(s, 7.55, 2.75, 3.8, 1.55, "Manual registration creates hidden queues", "The cost is not only time; it is confidence in the institution's data.", C.paleGold);

  s = pptx.addSlide();
  slideBase(s, 3);
  title(s, "BEFORE UNIPORTAL / AFTER UNIPORTAL", "A clearer path from manual registration to controlled digital workflow");
  s.addText("Before UniPortal", { x: 1.25, y: 2.55, w: 3.6, h: 0.28, fontSize: 15, bold: true, color: C.navy, margin: 0 });
  s.addText("After UniPortal", { x: 8.25, y: 2.55, w: 3.6, h: 0.28, fontSize: 15, bold: true, color: C.navy, margin: 0 });
  const before = ["Paper registration", "Manual approvals", "Fragmented records", "Long student queues", "Limited reporting visibility"];
  const after = ["Structured registration workflow", "Registrar approval process", "Centralized student records", "Clear student status tracking", "Leadership dashboard visibility"];
  before.forEach((t, i) => bullet(s, t, 1.15, 3.16 + i * 0.46, 3.8, C.ink));
  after.forEach((t, i) => bullet(s, t, 8.15, 3.16 + i * 0.46, 3.8, C.ink));
  s.addShape(pptx.ShapeType.chevron, { x: 5.65, y: 3.55, w: 1.55, h: 1.2, fill: { color: C.gold, transparency: 8 }, line: { color: C.gold } });
  s.addText("Controlled digital process", { x: 5.2, y: 4.95, w: 2.4, h: 0.28, fontSize: 10, color: C.blue, bold: true, align: "center", margin: 0 });

  s = pptx.addSlide();
  slideBase(s, 4);
  title(s, "THE SOLUTION", "One web-based system for the core academic registration workflow");
  panel(s, 0.75, 2.8, 4.95, 1.25, "Academic setup", "Faculties, departments, programs, courses, and active academic sessions.");
  panel(s, 6.33, 2.8, 4.95, 1.25, "Student management", "Account creation, profiles, academic identity, and verification status.");
  panel(s, 0.75, 4.45, 4.95, 1.25, "Enrollment workflow", "Student requests, registrar review, structured decisions, and audit logs.");
  panel(s, 6.33, 4.45, 4.95, 1.25, "Official outputs", "Printable enrollment slips and academic record foundations from approved enrollments.");

  s = pptx.addSlide();
  slideBase(s, 5);
  title(s, "WHY UNIPORTAL?", "Institutional strengthening through local relevance, phased modernization, and practical support");
  addComparisonTable(s, 1.12, 2.48, [
    ["Built around South Sudan institutional realities", "Better local relevance and adaptability"],
    ["Local technical support", "Faster support, training, and customization"],
    ["Phased implementation model", "Lower adoption risk"],
    ["Consultation-driven development", "Institution shapes priorities"],
    ["Flexible academic structure", "Fits faculties, departments, programs, and courses"],
    ["Cost-aware deployment", "More realistic for regional institutions"],
  ]);

  s = pptx.addSlide();
  slideBase(s, 6);
  title(s, "CURRENT MVP SCOPE", "The complete registration lifecycle is demonstrable today");
  [1, 2, 3].forEach((n, i) => numberItem(s, n, [
    "Admin sets up faculties, departments, programs, and courses.",
    "Admin creates or manages student profiles.",
    "Admin opens an academic session for registration.",
  ][i], 1.0, 2.95 + i * 0.95));
  [4, 5, 6].forEach((n, i) => numberItem(s, n, [
    "Student browses courses and submits enrollment requests.",
    "Registrar approves, rejects, or returns requests.",
    "Student prints approved enrollment slip; records can begin.",
  ][i], 6.9, 2.95 + i * 0.95));
  s.addShape(pptx.ShapeType.roundRect, {
    x: 3.75,
    y: 6.08,
    w: 4.7,
    h: 0.34,
    rectRadius: 0.04,
    fill: { color: C.paleGold },
    line: { color: "E6D8A7", width: 0.5 },
  });
  s.addText("Current demonstrable workflow available for pilot discussion", {
    x: 3.95,
    y: 6.19,
    w: 4.3,
    h: 0.1,
    fontSize: 7.6,
    color: C.blue,
    bold: true,
    align: "center",
    margin: 0,
  });

  s = pptx.addSlide();
  slideBase(s, 7);
  title(s, "ROLE-BASED EXPERIENCE", "Access is separated by institutional responsibility");
  [
    ["Admin", ["Academic setup", "Student management", "Course management", "Sessions and dashboards"]],
    ["Registrar", ["Enrollment review", "Approval decisions", "Audit log review", "Academic records operations"]],
    ["Student", ["Profile update", "Course browsing", "Enrollment request", "Slips and records"]],
  ].forEach((role, i) => {
    const x = 0.8 + i * 3.9;
    panel(s, x, 2.85, 3.45, 2.55, "INSTITUTIONAL ROLE", role[0], i === 1 ? C.paleGold : C.white);
    s.addText(role[1].join("\n"), { x: x + 0.35, y: 4.0, w: 2.8, h: 0.95, fontSize: 9.3, color: C.ink, breakLine: false, fit: "shrink", margin: 0.02 });
  });

  s = pptx.addSlide();
  slideBase(s, 8);
  title(s, "ADMIN DASHBOARD", "Leadership gets a quick institutional snapshot", "Administrators can understand registration activity without waiting for manual reports.");
  [
    ["Total", "Students"], ["Total", "Courses"], ["Active", "Faculties"],
    ["Active", "Departments"], ["By status", "Enrollments"], ["Open / closed", "Academic session"],
  ].forEach((m, i) => {
    const x = 0.9 + (i % 3) * 3.65;
    const y = 3.0 + Math.floor(i / 3) * 1.3;
    panel(s, x, y, 2.85, 0.9, m[0], m[1]);
  });

  s = pptx.addSlide();
  slideBase(s, 9);
  title(s, "ACADEMIC SETUP AND COURSE MANAGEMENT", "The academic structure universities expect", "Faculty -> Department -> Program -> Course");
  ["Faculty", "Department", "Program", "Course"].forEach((t, i) => {
    const x = 0.95 + i * 2.6;
    s.addShape(pptx.ShapeType.ellipse, { x, y: 3.0, w: 0.42, h: 0.42, fill: { color: C.blue }, line: { color: C.blue } });
    s.addText(String(i + 1), { x, y: 3.11, w: 0.42, h: 0.12, fontSize: 8, color: C.white, bold: true, align: "center", margin: 0 });
    s.addText(t, { x: x + 0.58, y: 3.08, w: 1.5, h: 0.2, fontSize: 11, color: C.ink, bold: true, margin: 0 });
  });
  ["Create faculties, departments, and programs.", "Create and edit courses by level and semester.", "Filter courses by academic structure.", "Activate or deactivate courses.", "View course detail and enrollment counts."].forEach((t, i) => bullet(s, t, 1.1, 4.25 + i * 0.38, 8.8));

  s = pptx.addSlide();
  slideBase(s, 10);
  title(s, "STUDENT MANAGEMENT", "The institution controls official academic identity");
  panel(s, 0.9, 2.65, 5.2, 2.2, "Student data", "Name, email, student ID or registration number, faculty, department, program, level, intake year, guardian/contact information, account status, and verification status.", C.white);
  ["Admins manage student identity and academic placement.", "Academic verification protects official fields.", "Students retain self-service for allowed profile details."].forEach((t, i) => bullet(s, t, 7.0, 3.1 + i * 0.58, 4.2));

  s = pptx.addSlide();
  slideBase(s, 11);
  title(s, "REGISTRAR ENROLLMENT REVIEW", "Enrollment becomes an official approval process");
  ["View pending enrollment requests.", "Review student profile and academic identity.", "Review selected courses and credit total.", "Approve, reject, or return enrollment for correction.", "Add structured reasons and decision notes."].forEach((t, i) => bullet(s, t, 1.0, 2.9 + i * 0.45, 6.2));
  ["Pending", "Approved", "Rejected", "Returned"].forEach((t, i) => panel(s, 8.2, 2.75 + i * 0.75, 2.1, 0.46, t, "", i === 1 ? C.paleGold : C.white));

  s = pptx.addSlide();
  slideBase(s, 12);
  title(s, "DECISION AUDIT LOG", "Every enrollment decision is recorded");
  panel(s, 0.9, 2.75, 5.4, 1.35, "Audit log captures", "Decision maker, decision time, previous status, new status, reason type, and decision note.", C.paleBlue);
  ["Supports accountability.", "Improves transparency.", "Helps resolve disputes with evidence."].forEach((t, i) => bullet(s, t, 7.1, 3.0 + i * 0.62, 4.3));

  s = pptx.addSlide();
  slideBase(s, 13);
  title(s, "STUDENT SELF-SERVICE", "Students get clarity while offices receive fewer status-check visits");
  ["Login securely.", "Update allowed profile fields.", "Browse available courses.", "Submit enrollment requests.", "Track pending, approved, rejected, or correction-required status.", "Print approved enrollment slips and view academic records."].forEach((t, i) => numberItem(s, i + 1, t, i < 3 ? 1.0 : 6.9, 2.85 + (i % 3) * 0.85));

  s = pptx.addSlide();
  slideBase(s, 14);
  title(s, "PRINTABLE ENROLLMENT SLIP", "Approved enrollments produce branded proof of registration");
  panel(s, 0.9, 2.65, 5.4, 1.85, "Slip contents", "Student identity, academic year and semester, faculty, department, program, level, approved courses, credit hours, total credits, approval status, decision date, and reviewer.", C.white);
  ["Provides official proof for students.", "Supports departments and administrative offices.", "Turns approval into a usable institutional document."].forEach((t, i) => bullet(s, t, 7.1, 3.0 + i * 0.58, 4.2));

  s = pptx.addSlide();
  slideBase(s, 15);
  title(s, "DATA OWNERSHIP & GOVERNANCE", "The institution owns its data.", "Governance expectations should be agreed before production deployment.");
  ["University controls system administration", "Role-based permissions protect access", "Support access is restricted and authorized", "Hosting options are agreed with the institution", "Backup and recovery planning are part of deployment", "Audit logs support accountability"].forEach((t, i) => bullet(s, t, i < 3 ? 1.1 : 6.9, 3.05 + (i % 3) * 0.6, 4.5));
  panel(s, 1.1, 5.1, 10.2, 0.72, "Governance position", "Sky High Tech acts as a technology implementation and support partner, not the owner of institutional data.", C.paleGold);

  s = pptx.addSlide();
  slideBase(s, 16);
  title(s, "SECURITY AND DEPLOYMENT READINESS", "Built as a deployed web application, not only a local prototype");
  [["JWT", "Authentication"], ["RBAC", "Role protection"], ["Helmet", "Security headers"], ["CORS", "Origin control"], ["Rate limit", "Auth protection"], ["Health", "Endpoint"], ["Render", "Backend"], ["Vercel", "Frontend"]].forEach((m, i) => {
    const x = 0.95 + (i % 4) * 2.55;
    const y = 2.85 + Math.floor(i / 4) * 1.25;
    panel(s, x, y, 2.05, 0.8, m[0], m[1], i % 2 ? C.white : C.paleBlue);
  });

  s = pptx.addSlide();
  slideBase(s, 17);
  title(s, "WHAT THIS MVP PROVES", "A focused institutional registration MVP, not yet a complete production SIS");
  ["The institution can model its academic structure.", "Students can be managed with academic identity.", "Registration can be controlled by academic session.", "Registrars can review and approve requests.", "Decisions can be audited.", "Approved students can print enrollment slips.", "Academic records can begin from approved enrollments."].forEach((t, i) => bullet(s, t, 0.95, 2.75 + i * 0.38, 7.8));
  panel(s, 7.65, 4.3, 3.55, 1.1, "Honest positioning", "UniPortal is ready to demonstrate the registration lifecycle while future SIS modules remain pilot or roadmap items.", C.paleGold);

  s = pptx.addSlide();
  slideBase(s, 18);
  title(s, "ROADMAP AND NEXT STEP", "Move from successful demo to guided institutional pilot discovery");
  const steps = ["Institutional feedback session", "Priority module identification", "Guided pilot discovery", "Technical and governance discussion", "Pilot recommendation note"];
  steps.forEach((t, i) => {
    const x = 0.85 + i * 2.16;
    s.addShape(pptx.ShapeType.ellipse, { x, y: 2.82, w: 0.48, h: 0.48, fill: { color: C.blue }, line: { color: C.blue } });
    s.addText(String(i + 1), { x, y: 2.95, w: 0.48, h: 0.12, fontSize: 8, color: C.white, bold: true, align: "center", margin: 0 });
    s.addText(t, { x: x - 0.25, y: 3.55, w: 1.7, h: 0.55, fontSize: 9.5, color: C.ink, bold: true, align: "center", fit: "shrink", margin: 0 });
    if (i < 4) s.addShape(pptx.ShapeType.chevron, { x: x + 1.15, y: 2.92, w: 0.38, h: 0.28, fill: { color: C.gold }, line: { color: C.gold } });
  });
  panel(s, 0.95, 4.75, 10.4, 0.95, "Closing line", "A practical pathway to university digital transformation - beginning with registration and expanding through partnership.", C.paleGold);
}

addDeck();

pptx.writeFile({ fileName: OUT });
