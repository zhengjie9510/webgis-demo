# Custom Shader Examples

Compile-tested snippets referenced from `../SKILL.md`.

## Layout

- `0N-<name>.js` — the **user-facing snippet**. Imports from `cesium`, creates a `CustomShader`, and shows the attachment call. No viewer boilerplate. These are what the skill links to.
- `_sandcastle-template.html` — internal scaffold used **only during compile-testing**. Each `.js` snippet is injected into this template and opened in Sandcastle to verify it renders without GLSL errors. Underscore prefix marks it as non-product tooling.

## Assets

All assets are fetched from public `raw.githubusercontent.com` URLs — no Ion token required. The specific dataset each example uses is documented in the snippet's opening comment.

## Running locally

1. Open `https://sandcastle.cesium.com/`.
2. Paste `_sandcastle-template.html` into the HTML tab.
3. Paste one of the `0N-*.js` snippets into the JS tab inside the marked `// <-- snippet -->` region.
4. Click **Run**.
