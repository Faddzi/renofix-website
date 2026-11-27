// Receives the Get in Touch form and emails it to Renofix through Resend.
// Needs RESEND_API_KEY and RESEND_FROM (a sender on a domain verified in Resend, e.g.
// "Renofix website <website@renofix.in>"). ENQUIRY_TO defaults to hello@renofix.in.

import {
  budgetRanges,
  fieldLimits,
  projectTypes,
  timelines,
  uploadLimits,
  validEmail,
  validPhone,
} from "@/lib/enquiry";

type Errors = Record<string, string>;

const text = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
};

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(request: Request) {
  let fd: FormData;
  try {
    fd = await request.formData();
  } catch {
    return Response.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  // Spam guard: a hidden field people never fill in, and a minimum time on the page.
  const started = Number(text(fd, "started"));
  if (text(fd, "company") || !started || Date.now() - started < 3000) {
    // Look like a success so bots learn nothing.
    return Response.json({ ok: true });
  }

  const v = {
    name: text(fd, "name"),
    phone: text(fd, "phone"),
    email: text(fd, "email"),
    projectType: text(fd, "projectType"),
    area: text(fd, "area"),
    size: text(fd, "size"),
    budget: text(fd, "budget"),
    timeline: text(fd, "timeline"),
    siteVisit: fd.get("siteVisit") === "yes",
    message: text(fd, "message"),
  };

  const errors: Errors = {};
  if (!v.name) errors.name = "Please enter your name.";
  else if (v.name.length > fieldLimits.name) errors.name = "Please shorten your name.";
  if (!validPhone(v.phone)) errors.phone = "Please enter a valid phone number.";
  if (!validEmail(v.email) || v.email.length > fieldLimits.email) errors.email = "Please enter a valid email address.";
  if (v.projectType && !(projectTypes as readonly string[]).includes(v.projectType)) errors.projectType = "Please pick a project type.";
  if (v.budget && !(budgetRanges as readonly string[]).includes(v.budget)) errors.budget = "Please pick a budget range.";
  if (v.timeline && !(timelines as readonly string[]).includes(v.timeline)) errors.timeline = "Please pick a timeline.";
  if (v.area.length > fieldLimits.area) errors.area = "Please shorten this.";
  if (v.size.length > fieldLimits.size) errors.size = "Please shorten this.";
  if (v.message.length > fieldLimits.message) errors.message = "Please shorten your message.";

  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const total = files.reduce((n, f) => n + f.size, 0);
  if (files.length > uploadLimits.maxFiles) errors.files = `Please attach up to ${uploadLimits.maxFiles} files.`;
  else if (files.some((f) => !uploadLimits.types.includes(f.type))) errors.files = "Please attach photos (JPG, PNG, WebP) or a PDF.";
  else if (total > uploadLimits.maxTotalBytes) errors.files = "These files are too large. Please attach fewer or smaller files.";

  if (Object.keys(errors).length) return Response.json({ ok: false, errors }, { status: 422 });

  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from) return Response.json({ ok: false, error: "not_configured" }, { status: 503 });

  const rows: [string, string][] = [
    ["Name", v.name],
    ["Phone", v.phone],
    ["Email", v.email],
    ["Project type", v.projectType],
    ["Area", v.area],
    ["Approximate size", v.size],
    ["Budget", v.budget],
    ["Timeline", v.timeline],
    ["Site visit", v.siteVisit ? "Yes, they would like a site visit" : "Not requested"],
  ];
  const html = `<h2>New enquiry from the website</h2>
<table cellpadding="6">${rows
    .filter(([, val]) => val)
    .map(([k, val]) => `<tr><th align="left">${k}</th><td>${escape(val)}</td></tr>`)
    .join("")}</table>
${v.message ? `<h3>Message</h3><p>${escape(v.message).replace(/\n/g, "<br>")}</p>` : ""}
${files.length ? `<p>${files.length} file(s) attached.</p>` : ""}`;

  const attachments = await Promise.all(
    files.map(async (f) => ({
      filename: f.name.replace(/[^\w.\- ]/g, "_").slice(0, 100) || "attachment",
      content: Buffer.from(await f.arrayBuffer()).toString("base64"),
    })),
  );

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [process.env.ENQUIRY_TO || "hello@renofix.in"],
      reply_to: v.email,
      subject: `Website enquiry: ${v.name}${v.projectType ? `, ${v.projectType}` : ""}`,
      html,
      attachments,
    }),
  }).catch(() => null);

  if (!res?.ok) return Response.json({ ok: false, error: "send_failed" }, { status: 502 });
  return Response.json({ ok: true });
}
