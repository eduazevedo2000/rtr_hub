# Supabase Cached Egress Checklist

## Before and After Validation

1. Open the app in development and clear metrics:
   - `window.__supabaseMetrics?.clear()`
2. Navigate through critical routes:
   - `/`
   - `/live`
   - `/palmares`
3. Inspect request counters:
   - `window.__supabaseMetrics?.snapshot()`
4. Compare with Supabase dashboard:
   - Storage egress (daily/weekly)
   - Bandwidth by bucket

## Media Guardrails

- Prefer `webp` or `avif` for hero/landing assets.
- Keep hero images under 400 KB whenever possible.
- Avoid rendering duplicated fullscreen backgrounds on the same page.
- Use versioned paths for uploads and long cache TTL.
- Keep `cacheControl` high for immutable media (`31536000`).
- Lazy-load non-critical images (`loading="lazy"` and `decoding="async"`).

## Release Checklist

- Validate no page renders duplicated image stacks unnecessarily.
- Confirm realtime channels are filtered by entity (e.g. `race_id`).
- Verify components reuse cached driver lists instead of repeated fetches.
- Check Supabase dashboard 24h after deploy for egress trend improvement.
