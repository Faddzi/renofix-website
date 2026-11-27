// Approved website copy. Source: "Website Script" Google Doc, appendix of the PRD (2026-11-27).
// Do not rewrite, extend or "improve" this copy. Only the appendix's own grammar fixes are applied.

export const contact = {
  priti: { label: "Priti", display: "+91 98925 46720", tel: "+919892546720" },
  husain: { label: "Husain", display: "+91 99302 92943", tel: "+919930292943" },
  // WhatsApp number confirmed by the client on 2026-11-27.
  whatsapp: { display: "+91 99302 92943", href: "https://wa.me/919930292943" },
  email: "hello@renofix.in",
  instagram: { handle: "@renofix.ig", href: "https://www.instagram.com/renofix.ig/" },
  // Confirmed service area (2026-11-27). No office address is shown for now.
  serviceArea: "Mumbai, Thane and Navi Mumbai",
  since: "Since 2024",
};

export const home = {
  heroHeadline: "LOOKING FOR THE RIGHT TEAM TO RENOVATE YOUR HOME? STOP SCROLLING.",
  heroSupporting: "Yes, we'll listen to your Pinterest board. And make it better.",
  statement: "YOUR HOME. OUR OBSESSION. NO EXCUSES.",
  introLead: "Renofix was built on one idea: renovation shouldn't be stressful.",
  intro: [
    "Renofix is a Mumbai-based interior design and renovation firm, founded in 2024. We started with a simple frustration: great designs getting lost on the way to the actual build. So we built Renofix to own the whole journey. One side of the team focuses on creative direction and design. The other keeps projects running on time, on budget and on spec. The result is interiors that look as good on site as they do in the 3D render.",
    "We handle everything from concept and planning to final handover. Whether it's a single modular kitchen, a full home transformation, a luxury multifamily property, a commercial space, a hotel or a restaurant, every project gets the same attention to detail, clear communication and clean finishing.",
  ],
  whyChooseUs: [
    "No surprise costs",
    "Clear timelines",
    "3D models",
    "Customised designs",
    "Vastu consultation",
    "Value for money",
  ],
  mission:
    "Great homes shouldn't need great patience. Our job is to turn your ideas into finished spaces while you stay informed, relaxed and in control of your budget.",
  vision:
    "To be the most trusted name in interior design and renovation, recognised for transparent processes, thoughtful design and dependable execution. We strive to create spaces that are well-planned, enduring in quality and aligned with the way our clients live.",
};

// "What we do": the plain list from the copy. `category` links to the Portfolio filter
// only where the Drive holds work in that category.
export const services: { label: string; category?: string }[] = [
  { label: "Modular kitchens", category: "kitchens" },
  { label: "Ceiling designs", category: "ceilings" },
  { label: "Bathroom renovations", category: "bathrooms" },
  { label: "Complete home interiors", category: "full-homes" },
  { label: "Luxury multifamily properties" },
  { label: "Commercial spaces", category: "commercial" },
  { label: "Hotels and restaurants" },
  { label: "Vastu consultation" },
];

// "How we work": only steps named in the copy (founders' bios). No durations.
export const steps = [
  "First meeting",
  "Concept",
  "Material selection",
  "Detailed planning",
  "Execution and site supervision",
  "Final inspection",
  "Handover",
];

export const getInTouch = {
  heading: "YOUR SPACE IS WAITING. LET'S GET STARTED.",
  // Approved intro. The client confirmed the response time "[24 hours]" on 2026-11-27.
  intro:
    "Whether you are planning a single modular kitchen or a complete home makeover, we would like to hear about it. Share a few details about your space, your requirements and your timeline, and our team will respond within 24 hours. Your first consultation is free. You can reach us by phone, WhatsApp or email, or fill in the form. If you prefer to meet in person, we are happy to arrange a visit to your site. Every enquiry is handled with no obligation and no pressure.",
  // First consultation line from the approved Get in Touch intro.
  freeConsultation: "Your first consultation is free.",
  responseTime: "24 hours",
};

// PLACEHOLDERS. The client has no testimonials yet and asked for placeholders.
// These must be replaced with real, approved client quotes before launch.
export const placeholderTestimonials = [
  { quote: "Placeholder testimonial. Replace with a real client quote about a modular kitchen.", name: "Client name", area: "Area" },
  { quote: "Placeholder testimonial. Replace with a real client quote about a full home renovation.", name: "Client name", area: "Area" },
  { quote: "Placeholder testimonial. Replace with a real client quote about a bathroom renovation.", name: "Client name", area: "Area" },
];

export const about = {
  heading: "MEET THE FOUNDERS",
  founders: [
    {
      id: "priti",
      name: "Ms. Priti Kumawat",
      role: "Owner",
      bio: "Ms. Priti Kumawat leads Renofix with a clear purpose: to give every home a layout and look that truly belong to the people living in it. She has built a reputation for understanding what clients expect before they even put it into words. Her work begins at the first meeting, where she listens closely to the family's routine, taste and budget, and carries that brief through concept, material selection and detailed planning. She then stays on each project all the way to handover, coordinating the team and keeping clients informed at every milestone. Under her direction, Renofix has completed projects for families including modular kitchens, ceiling designs, bathroom renovations and complete home interiors. Whether the home is a compact first flat or a spacious family residence, she treats each one with the same care and attention to detail. Priti believes good design should never depend on the size of the budget, and that a well-planned home is something every client deserves.",
      // Hover line in the founder scene: a sentence taken unchanged from the bio above.
      sceneLine:
        "She has built a reputation for understanding what clients expect before they even put it into words.",
    },
    {
      id: "husain",
      name: "Mr. Husain Electricwala",
      role: "Co-Owner",
      bio: "Mr. Husain Electricwala is the force behind the work you see at RENOFIX. With 7+ years of hands-on experience in renovation and interior execution, he is known for keeping projects disciplined, orderly and true to the approved plan. He manages the site from the first day of work to the final inspection, supervising the team, scheduling each stage and resolving problems before they turn into delays. Material quality is one of his strongest commitments: he personally checks the products, finishes and fittings that go into every home, so that the result stays durable well beyond handover. Clients value his straightforward communication, as he explains progress clearly, responds quickly to concerns and sets realistic expectations from the start. From kitchens and ceilings to complete bathroom makeovers and full-home projects, Husain brings the same dependable approach to every site. His principle is simple: when the workmanship is right, the design speaks for itself.",
      sceneLine: "His principle is simple: when the workmanship is right, the design speaks for itself.",
    },
  ],
} as const;
