"use client";

import { useEffect, useRef, useState } from "react";
import { contact, getInTouch } from "@/lib/content";
import {
  budgetRanges,
  fieldLimits,
  projectTypes,
  timelines,
  uploadLimits,
  validEmail,
  validPhone,
} from "@/lib/enquiry";

type Errors = Partial<Record<"name" | "phone" | "email" | "files" | "projectType" | "budget" | "timeline" | "area" | "size" | "message", string>>;
type Status = "idle" | "sending" | "sent" | "failed";

// Photos are resized in the browser so five of them fit within the upload limit.
async function shrink(file: File): Promise<File> {
  if (!file.type.startsWith("image/") && !/\.heic$/i.test(file.name)) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * scale);
    c.height = Math.round(bmp.height * scale);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/jpeg", 0.8));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

const label = "mb-1.5 block font-semibold";
const input =
  "block min-h-12 w-full border-2 border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-base outline-none focus:border-[var(--fg)] aria-[invalid=true]:border-[var(--accent)]";
const errorText = "mt-1.5 text-sm font-semibold text-[var(--accent)]";

export function EnquiryForm() {
  const form = useRef<HTMLFormElement>(null);
  const started = useRef(0);
  const summary = useRef<HTMLDivElement>(null);
  const done = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    started.current = Date.now();
  }, []);

  useEffect(() => {
    if (status === "sent" || status === "failed") done.current?.focus();
  }, [status]);

  const check = (fd: FormData): Errors => {
    const e: Errors = {};
    const s = (k: string) => String(fd.get(k) ?? "").trim();
    if (!s("name")) e.name = "Please enter your name.";
    if (!validPhone(s("phone"))) e.phone = "Please enter a valid phone number.";
    if (!validEmail(s("email"))) e.email = "Please enter a valid email address.";
    if (files.length > uploadLimits.maxFiles) e.files = `Please attach up to ${uploadLimits.maxFiles} files.`;
    else if (files.some((f) => !uploadLimits.types.includes(f.type)))
      e.files = "Please attach photos (JPG, PNG, WebP) or a PDF.";
    else if (files.reduce((n, f) => n + f.size, 0) > uploadLimits.maxTotalBytes)
      e.files = "These files are too large. Please attach fewer or smaller files.";
    return e;
  };

  // After a failed submit, re-check a field when the visitor leaves it.
  const onBlur = (ev: React.FocusEvent<HTMLInputElement>) => {
    const name = ev.currentTarget.name as keyof Errors;
    const f = ev.currentTarget.form;
    if (!f || !errors[name]) return;
    const e = check(new FormData(f));
    setErrors((prev) => ({ ...prev, [name]: e[name] }));
  };

  const onFiles = async (list: FileList | null) => {
    const picked = Array.from(list ?? []).slice(0, uploadLimits.maxFiles);
    const ready = await Promise.all(picked.map(shrink));
    setFiles(ready);
    setErrors((prev) => ({
      ...prev,
      files:
        (list?.length ?? 0) > uploadLimits.maxFiles
          ? `Only the first ${uploadLimits.maxFiles} files were kept.`
          : undefined,
    }));
  };

  const onSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    const e = check(fd);
    setErrors(e);
    if (Object.values(e).some(Boolean)) {
      requestAnimationFrame(() => summary.current?.focus());
      return;
    }
    fd.delete("files");
    files.forEach((f) => fd.append("files", f));
    fd.set("started", String(started.current));
    setStatus("sending");
    try {
      const res = await fetch("/api/enquiry", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; errors?: Errors };
      if (res.ok && data.ok) {
        setStatus("sent");
        return;
      }
      if (res.status === 422 && data.errors) {
        setErrors(data.errors);
        setStatus("idle");
        requestAnimationFrame(() => summary.current?.focus());
        return;
      }
      setStatus("failed");
    } catch {
      setStatus("failed");
    }
  };

  if (status === "sent") {
    return (
      <div ref={done} tabIndex={-1} role="status" className="border-2 border-[var(--fg)] p-6 outline-none md:p-8">
        <p className="display text-[clamp(2rem,5vw,3rem)]">Thank you.</p>
        <p className="mt-3 text-lg">Your enquiry has been sent. Our team will respond within {getInTouch.responseTime}.</p>
      </div>
    );
  }

  const errorList = Object.entries(errors).filter(([, m]) => m) as [keyof Errors, string][];
  const describe = (k: keyof Errors) => (errors[k] ? `${k}-error` : undefined);

  return (
    <form ref={form} onSubmit={onSubmit} noValidate className="flex flex-col gap-6" aria-label="Enquiry form">
      {status === "failed" && (
        <div ref={done} tabIndex={-1} role="alert" className="border-2 border-[var(--accent)] p-5 outline-none">
          <p className="font-semibold">Sorry, your enquiry could not be sent.</p>
          <p className="mt-2">
            Please call{" "}
            <a className="link-underline font-semibold" href={`tel:${contact.priti.tel}`}>
              Priti on {contact.priti.display}
            </a>{" "}
            or{" "}
            <a className="link-underline font-semibold" href={`tel:${contact.husain.tel}`}>
              Husain on {contact.husain.display}
            </a>
            , or message us on{" "}
            <a className="link-underline font-semibold" href={contact.whatsapp.href} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            .
          </p>
        </div>
      )}

      {errorList.length > 0 && (
        <div ref={summary} tabIndex={-1} role="alert" className="border-2 border-[var(--accent)] p-5 outline-none">
          <p className="font-semibold">Please check {errorList.length === 1 ? "this field" : "these fields"}:</p>
          <ul className="mt-2 list-disc pl-5">
            {errorList.map(([k, m]) => (
              <li key={k}>
                <a className="link-underline" href={`#${k === "files" ? "files" : k}`}>
                  {m}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* spam guard: hidden from people, filled in by bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className={label}>
            Name <span className="font-normal text-[var(--muted)]">(required)</span>
          </label>
          <input id="name" name="name" autoComplete="name" required maxLength={fieldLimits.name} className={input}
            aria-invalid={!!errors.name} aria-describedby={describe("name")} onBlur={onBlur} />
          {errors.name && <p id="name-error" className={errorText}>{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="phone" className={label}>
            Phone <span className="font-normal text-[var(--muted)]">(required)</span>
          </label>
          <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required maxLength={fieldLimits.phone}
            className={input} aria-invalid={!!errors.phone} aria-describedby={describe("phone")} onBlur={onBlur} />
          {errors.phone && <p id="phone-error" className={errorText}>{errors.phone}</p>}
        </div>
        <div>
          <label htmlFor="email" className={label}>
            Email <span className="font-normal text-[var(--muted)]">(required)</span>
          </label>
          <input id="email" name="email" type="email" autoComplete="email" required maxLength={fieldLimits.email}
            className={input} aria-invalid={!!errors.email} aria-describedby={describe("email")} onBlur={onBlur} />
          {errors.email && <p id="email-error" className={errorText}>{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="projectType" className={label}>Project type</label>
          <select id="projectType" name="projectType" className={input} defaultValue="">
            <option value="">Choose one</option>
            {projectTypes.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="area" className={label}>Area in Mumbai</label>
          <input id="area" name="area" maxLength={fieldLimits.area} className={input} autoComplete="address-level2" />
        </div>
        <div>
          <label htmlFor="size" className={label}>Approximate size</label>
          <input id="size" name="size" maxLength={fieldLimits.size} className={input} placeholder="For example, 2 BHK or 900 sq ft" />
        </div>
        <div>
          <label htmlFor="budget" className={label}>Budget range</label>
          <select id="budget" name="budget" className={input} defaultValue="">
            <option value="">Choose one</option>
            {budgetRanges.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="timeline" className={label}>Timeline</label>
          <select id="timeline" name="timeline" className={input} defaultValue="">
            <option value="">Choose one</option>
            {timelines.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="message" className={label}>Message</label>
          <textarea id="message" name="message" rows={5} maxLength={fieldLimits.message} className={`${input} resize-y`} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="files" className={label}>
            Photos or a floor plan <span className="font-normal text-[var(--muted)]">(up to {uploadLimits.maxFiles})</span>
          </label>
          <input id="files" name="files" type="file" multiple accept={uploadLimits.accept}
            onChange={(e) => onFiles(e.currentTarget.files)} aria-invalid={!!errors.files} aria-describedby={describe("files")}
            className="block w-full text-base file:mr-4 file:min-h-11 file:cursor-pointer file:border-2 file:border-[var(--fg)] file:bg-transparent file:px-4 file:font-semibold hover:file:bg-[var(--fg)] hover:file:text-[var(--bg)]" />
          {files.length > 0 && (
            <p className="mt-1.5 text-sm text-[var(--muted)]">
              {files.length} {files.length === 1 ? "file" : "files"} ready, {(files.reduce((n, f) => n + f.size, 0) / 1024 / 1024).toFixed(1)} MB
            </p>
          )}
          {errors.files && <p id="files-error" className={errorText}>{errors.files}</p>}
        </div>

        <label className="flex min-h-11 cursor-pointer items-center gap-3 sm:col-span-2">
          <input type="checkbox" name="siteVisit" value="yes" className="h-5 w-5 accent-[var(--accent)]" />
          <span className="font-semibold">I&apos;d like a site visit</span>
        </label>
      </div>

      <div>
        <button type="submit" className="btn btn-primary" disabled={status === "sending"} aria-busy={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send enquiry"}
        </button>
      </div>
    </form>
  );
}
