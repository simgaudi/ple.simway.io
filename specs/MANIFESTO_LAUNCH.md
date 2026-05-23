# Feature Spec: The ple Manifesto (HN Launch)

## Intent
We are pivoting our whitepaper from an ArXiv academic draft into a high-impact, provocative "Show HN" style Manifesto. This needs to be hosted on `ple.simway.io/manifesto` to drive the paradigm shift and attract builders, CTOs, and Staff Engineers who feel the pain of "Cognitive Debt."

## Structural Requirements
1. **New Route/Page:** Create a dedicated page at `/manifesto` (or `manifesto.html` if we are staying vanilla HTML).
2. **Design & Vibe:** 
   - Hyper-clean, minimalist, typography-focused (think reading a beautifully typeset article on Hacker News, Stripe's blog, or similar high-engineering-brand sites).
   - High contrast, extremely readable.
   - We need to look like a mature enterprise architecture standard, not a flashy crypto scam.
3. **Content:** The raw markdown content is provided in `docs/MANIFESTO.md` in the `lob` workspace (or I will paste it to you). Convert this into the HTML structure.
4. **Call to Action (CTA):** At the bottom, link to `ple-adm-schema-v1.json` (you can create a placeholder file for it if it doesn't exist yet) and include an email/Discord link for the alpha waitlist.
5. **Index Page Update:** Update `index.html` to prominently link to "Read the Manifesto".

## Execution
Please implement this HTML/CSS structure, ensure it is responsive for mobile, and open a PR against `main`.
