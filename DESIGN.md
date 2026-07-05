# Design

## Direction

Premium technical portfolio, not a WordPress theme clone and not a generic SaaS
landing page.

The visual language should feel precise, calm and senior: white and graphite
surfaces, restrained blue/green signal accents, strong spacing, clear timelines,
and a professional portrait. Observability appears as subtle signal lines,
metrics and system vocabulary, not as a fake terminal interface.

## Visual Rules

- Use a light premium base with graphite text and dark technical bands.
- Accent colors are used sparingly for observability signal and calls to action.
- Cards stay restrained with small radii, subtle borders and no nested cards.
- The profile photo is a credibility anchor, not a decorative background.
- Avoid purple gradients, beige theme, noisy bento grids and hero badges.

## Structure

1. Home: hero, proof metrics, expertise, selected work, CV/download CTA.
2. CV: long timeline of experience plus education/certifications.
3. Contact: public email and social links only.
4. Legacy routes: `/blog/` and `/articles/` redirect to `/`.

## Responsive Rules

- The hero CTA and positioning must remain visible on mobile before long proof
  content.
- Timeline entries must collapse into one column without horizontal overflow.
- Large headings must wrap naturally and avoid viewport-width font scaling.
- Focus states must be visible for keyboard users.

## Accessibility

- Use semantic headings, lists and landmarks.
- Keep contrast comfortably above WCAG AA.
- Respect reduced-motion preferences.
- Links to PDF downloads must include format/language in the visible label.
