// Enquiry form options and limits, shared by the form and the route handler.

export const projectTypes = [
  "Kitchen",
  "Ceiling",
  "Bathroom",
  "Full home",
  "Commercial",
  "Hospitality",
  "Other",
] as const;

// PROPOSED ranges, to be confirmed by the client.
export const budgetRanges = [
  "Under ₹5 lakh",
  "₹5 to 10 lakh",
  "₹10 to 20 lakh",
  "₹20 to 40 lakh",
  "Over ₹40 lakh",
  "Not sure yet",
] as const;

export const timelines = ["As soon as possible", "In 1 to 3 months", "In 3 to 6 months", "Just exploring"] as const;

export const uploadLimits = {
  maxFiles: 5,
  // Photos are resized in the browser before upload; the total stays under the hosting body limit.
  maxTotalBytes: 4 * 1024 * 1024,
  types: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  accept: "image/jpeg,image/png,image/webp,image/heic,application/pdf",
};

export const fieldLimits = { name: 100, phone: 20, email: 200, area: 100, size: 100, message: 3000 };

export function validPhone(v: string) {
  const digits = v.replace(/[\s\-()]/g, "");
  return /^\+?\d{10,14}$/.test(digits);
}

export function validEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}
