# Spec: GEO Metadata (JSON-LD) Integration

## Objective
Optimize the `ple.simway.io` landing page for Generative Engine Optimization (GEO) by injecting structured JSON-LD metadata. This helps AI crawlers (Perplexity, ChatGPT, etc.) accurately categorize `ple` as a "Deterministic Intent Engine."

## Implementation Details

### 1. JSON-LD Block
Insert the following `<script type="application/ld+json">` block into the `<head>` of `index.html`:

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ple",
  "operatingSystem": "Any",
  "applicationCategory": "DeveloperApplication",
  "description": "The Deterministic Intent Engine. Stop writing code and fixing AI hallucinations. ple transforms fuzzy human intent into a mathematical ADM and disposable execution artifacts.",
  "keywords": "Deterministic Intent Engine, Mathematical ADM, Disposable Code, Event Sourcing, Domain Driven Design, AI Code Generation, Intent Engineering",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/OnlineOnly"
  },
  "author": {
    "@type": "Organization",
    "name": "Simway",
    "url": "https://simway.io"
  },
  "url": "https://ple.simway.io"
}
```

### 2. Semantic HTML Tags
- Ensure the `<h1>` and `subtitle` are wrapped in semantically clear tags if not already.
- Add `itemprop` attributes to the key value proposition text (e.g., `itemprop="description"` on the hook text).

## Acceptance Criteria
- The JSON-LD script is present and valid (check with Schema Markup Validator).
- The `keywords` list correctly reflects our core paradigm terminology.
