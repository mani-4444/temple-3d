# Asset strategy

## Main model
Find one high-quality South Indian Dravidian temple model, preferably GLB with embedded or correctly referenced textures. Desired features: gopuram, sculptural detail, mandapa/pillared hall, stone materials, and courtyard if available.

## Candidate sources
- Sketchfab: inspect the individual downloadable asset and its license.
- Poly Haven: HDRIs and textures where appropriate.
- Blender: inspect, clean, reorient, optimize, and export assets when needed.
- Other sources are acceptable only when terms, provenance, and downloads can be verified.

## License requirements
- Verify the license on the actual asset page, not only the platform's general terms.
- Record title, creator, source URL, license name/URL, required attribution, and date checked in `ASSET_CREDITS.md`.
- Do not use assets with unclear rights, bypass downloads, or misrepresent license terms.
- Do not spend money or start a paid plan. If a suitable asset cannot be found, use a legally safe temporary fallback and clearly report that the model is not final.

## Model validation
- Confirm it loads independently and in the target app.
- Confirm textures are included and render correctly.
- Check scale, origin, orientation, camera framing, and missing materials.
- Inspect polygon count, draw calls, file size, texture dimensions and memory impact.
- Remove unnecessary hidden objects and compress/resize textures where justified.
- Do not destroy the original source asset; keep an unmodified copy if optimization is performed.
- Prefer GLB for simple asset packaging when appropriate.

## Supporting assets
- One optimized poster/fallback image matching the initial camera angle.
- Optional environment map, ground texture and subtle atmospheric effects.
- Keep decorative assets limited and performant.

## Fallback hierarchy
1. Preferred licensed model.
2. Another verified, appropriately licensed model.
3. A temporary procedural blockout or placeholder scene clearly marked in docs.
4. A static poster/fallback for unsupported WebGL.
Never describe a static image or primitive blockout as the finished interactive temple model.

## Attribution template
For every external asset:
- Asset:
- Creator:
- Source URL:
- License:
- License URL:
- Attribution required:
- Modifications:
- Date verified:
