# Gamma AI — investigation findings

## Current result after publication — 19 October 2026

**Partial public-surface observation; authenticated workflows remain unverified.** Gamma now returns HTTP 200. REA successfully captured the home, sign-up, pricing and creation-entry pages using Chromium through the inherited proxy. A workspace-local NSS trust store imports the supplied CA certificates; TLS verification remains enabled. REA attaches through loopback CDP, disconnects, and the harness closes its own browser. No target account was created and no credentials were entered.

### Observations and advertised capabilities

- Home Evidence `ev_a45bcf79cba7534eec712d560222430c62a4704ccbd86d883a91b16c25f8a1dd` advertises conversational brainstorming, outline-first creation, chat iteration, audience/brand-aware styles, smart layouts and freeform editing. These are observed page claims, not exercised editor behavior.
- The same page advertises presentations, documents, social graphics, websites, API and AI images; PowerPoint/PDF import and export; and connectors. Backend architecture and export fidelity are unknown.
- Pricing Evidence `ev_ed17c6c4b5c558eea4275b69e84a02da3f5e23d5c107f60ecb077fc03dc5f569` lists Free, Plus, Pro and Ultra. Free advertises 400 signup credits, up to 10 slides per prompt, PDF/PPTX import and PDF/PPTX/PNG/Google Slides export. Premium features/API use credits and unlimited creation has fair-use conditions. Actual entitlements and prices were not validated.
- Sign-up Evidence `ev_248129212a21b3c35e9135b73393f7224608e314f99e42cb061e035edac3eade` exposes Google, email and SSO entry options.
- Creation-entry Evidence `ev_a618650a80a0a79c5bca8c3f04e2ade3a6a321500029af6ad264b1a3b69b7bdc` observes `/create` redirecting to sign-in with a return URL. This establishes an authentication boundary, not the post-login creation workflow.
- Home-linked `/templates`, `/prompts`, `/integrations`, `/accessibility`, `/products/presentations`, `/products/documents`, `/products/graphics` and `/products/api` displayed “This page doesn't seem to exist (404).” Preserve this discrepancy; do not infer missing product capabilities from a public-route failure.

Complete captures, requests, accessibility extracts and SHA-256 hashes are retained in [STATUS.json](STATUS.json) and `evidence/published-*`. These successful records supersede the network-blocked status below, which remains as historical evidence.

### Remaining investigation

An authenticated Gamma session through a supported browser transport is needed to exercise intake, outline revisions, design controls, chat edits, media, sharing, versioning and real exports. No such transport/session is currently available. Do not request passwords or session cookies in chat. The full Gamma investigation is unfinished; keep ElevenLabs and Canva separate and in the user's priority order.

---

# Gamma AI — investigation findings

Priority **1**. Recorded 19 October 2026. Target: https://gamma.app/

## Historical pre-publication result

**Blocked; product behavior is not yet verified.** An actual REA browser scenario was executed and returned `execution_failure`. Completed scenario steps: **0**. Provider cleanup outcome: `terminated-owned-process`.

A separate ordinary HTTPS check returned a proxy tunnel **403 Forbidden**. This connectivity observation is from Python/HTTP, not a REA product-feature finding. No editor behavior, export implementation, underlying backend architecture or feature parity can be concluded from these failures.

## Retained evidence

- [Exact REA request](evidence/scenario.json)
- [Raw REA result](evidence/rea-result.json)
- [Status and artifact hashes](STATUS.json)
- [Feature coverage checklist](COVERAGE.md)

The raw result retains partial observations and limitations. It is a failure record, not successful product-analysis Evidence. No Evidence ID is invented for this unsuccessful operation.

## Historical next action

Apply the saved destination access requirements through the supported environment mechanism, verify actual connectivity, then rerun the focused scenario. If sign-in is required, use a supported authenticated browser/session; do not ask for passwords in chat or bypass access controls. Expand to feature interactions only after observing the page.

## Interpretation rules

Keep observed behavior, derivations, original design proposals and unknowns separate. Public marketing descriptions, when accessible, may establish advertised features but do not verify editor behavior. “Full” is the requested investigation scope, not a completion claim.
