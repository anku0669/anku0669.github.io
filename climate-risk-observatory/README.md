# Climate Shock Lab — Risk Observatory

An evidence-led, multi-page research observatory exploring two distinct planetary-risk pathways: **nuclear winter** and **climate-change-driven hydrometeorological hazards**. The deployed experience uses an Astro static build, Tailwind CSS v4 design utilities, and GSAP motion while preserving the lightweight, no-backend research pages and interactive calculators.

## Project structure

- `index.html`: fallback/static overview source. The production homepage is generated from `site-src/src/pages/climate-risk-observatory/index.astro`.
- outcomes.html: impact pathways, hazard mechanisms and cascading-system map.
- simulator.html: interactive educational scenario lab.
- studio.html: advanced decision workbench, open-data catalogue and model cards.
- research.html: full research synthesis in accessible web layout.
- research-paper.md: editable/downloadable paper source.
- response.html: resilience and disaster-risk-reduction playbook.
- sources.html: annotated source library with search/filter.
- `assets/css/site.css`: responsive visual system, motion layer, charts and accessible reduced-motion support.
- assets/js/site.js: navigation, scroll progress, reveal motion and source filtering.
- assets/js/simulator.js: local calculations and chart rendering; no data sent to a server.
- assets/css/studio.css and assets/js/studio.js: transparent user-assumption stress-test, sensitivity view, shareable URLs, JSON/CSV exports and research-data filtering.

## Run locally

For the production homepage and all child pages, use Node.js 22+ and npm:

    cd site-src
    npm install
    npm run dev

Open the Astro development URL and visit `/climate-risk-observatory/`. The `predev` script stages the existing static research pages and assets into Astro's public directory. To create a production build:

    npm run build
    npm run preview

GitHub Actions builds and deploys the whole profile website, preserving the root portfolio while replacing the deployed observatory homepage with the Astro-generated page. Do not deploy `site-src` as a separate site.

The interactive research pages need no API key or backend. The deployed homepage is built with Astro + Tailwind CSS v4 and GSAP; the build preserves the existing simulator, studio, research paper, resilience guide and source library as static pages. The Advanced Studio links to the May 2026 NWDC open-data article and OSF archive rather than silently copying or modifying its source data. Google Fonts are an optional third-party request; system fallbacks keep the site readable if fonts cannot load.

## Scenario model disclosure

The nuclear-winter chart uses three published benchmark figures summarized from Xia et al. (2022): 5 Tg → about 7% global annual crop-calorie reduction in years 1–5; 47 Tg → up to 50% in that scenario; 150 Tg → around 90% in years 3–4. Intermediate soot points are simple linear interpolation, not outputs from the original climate/crop model. The paper itself covers six scenarios.

The climate mode displays either (a) a conceptual linear interpolation between IPCC AR6's global 4–5× direct flood-damage assessment at 4°C versus 1.5°C, using 4.5× as a midpoint, or (b) an approximate atmospheric moisture-capacity rule of thumb. Neither is a local projection. Exposure, vulnerability and preparedness feed an uncalibrated educational stress index.

Compound mode deliberately does not pretend to run a coupled Earth-system model. It shows separate pressures and a conceptual index, not joint event probabilities, rainfall forecasts or death counts.

## Research quality and limitations

The article is a focused narrative evidence synthesis, not a systematic review, new simulation or peer-reviewed publication. The linked NWDC data article is peer reviewed; this project itself is not. The primary source library includes peer-reviewed papers and assessment reports from Nature Food, the Journal of Geophysical Research: Atmospheres, the IPCC, WMO and UNDRR. Claims are linked to source publications; local decisions should use official meteorological/hydrological services and validated local risk assessments.

## Hosting

The project is self-contained under the climate-risk-observatory/ directory of the GitHub Pages profile repository. The static pages are intended to be served at:

https://anku0669.github.io/climate-risk-observatory/

Advanced Studio: https://anku0669.github.io/climate-risk-observatory/studio.html

## Accessibility

- Responsive desktop/tablet/mobile layouts
- Keyboard focus indicators
- Semantic headings and native form controls
- ARIA labels on chart and controls
- Reduced-motion support (CSS, GSAP and the native fallback)
- GSAP scroll reveals and restrained pointer-responsive highlights
- Astro static build and Tailwind CSS v4 utility system on the main landing page
- Color labels and supporting text so meaning is not conveyed through color alone

## Sources

- Xia et al. (2022), DOI: https://doi.org/10.1038/s43016-022-00573-0
- Coupe et al. (2019), DOI: https://doi.org/10.1029/2019JD030509
- IPCC AR6 WGI Chapter 11: https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-11/
- IPCC AR6 WGII Chapter 4: https://www.ipcc.ch/report/ar6/wg2/chapter/chapter-4/
- IPCC AR6 WGII Chapter 10: https://www.ipcc.ch/report/ar6/wg2/chapter/chapter-10/
- WMO State of the Global Climate 2025: https://wmo.int/publication-series/state-of-global-climate/state-of-global-climate-2025
- UNDRR Hazard terminology: https://www.undrr.org/terminology/hazard
- Harrison et al. (2026), NWDC data article: https://doi.org/10.1002/gdj3.70076
- NWDC OSF dataset: https://osf.io/e28gq/
- NWDC processing code: https://github.com/Nuclear-Winter-Data-Commons-NWDC/nw-data-commons
