# Bhanu Prakash: astronomer, stargazing expert and developer

Personal portfolio website for Bhanu Prakash. Scrolling the page is one journey: from a hillside under the night sky, out past the Moon, planets, nebulae and galaxies to the cosmic web, and finally down to the smallest scale string theory describes. Every scene is made of particles drawn in the browser.

## What's in this repository

| Path | What it is |
| --- | --- |
| `index.html` | The page: metadata, fonts and script tags |
| `css/styles.css` | All styles, built on the brand kit's tokens |
| `js/universe.js` | The WebGL particle universe: thirteen formations and the scroll-driven journey |
| `js/app.js` | The React interface: navigation, sections, Cassiopeia expertise map, star-life process, vibrating strings, projects, gallery, astrophotography stacking demo, practical labs for schools and contact form |
| `assets/` | Site files, such as the favicon |
| `brand/` | The brand kit: brand book, the thirteen-stop journey, design tokens, logos and patterns |

There is no build step. React 18 and htm load from public CDNs, so the folder can be hosted as it is.

## Physics layers

On top of the particles, the universe follows real physics. Each layer is explained on the page in a "Physics" note at its stop.

| Theory | Where | What you see |
| --- | --- | --- |
| General relativity | Every stop from the Moon on | A spacetime grid that dips under each mass: the Sun and planets, a narrow steep well at the Crab pulsar, a deep funnel at Sagittarius A*. The cursor has mass too. |
| Gravitational lensing | Sagittarius A*, Andromeda | Background stars bend around the lens, with a second image inside the ring (exaggerated for Andromeda) |
| Hawking radiation | Sagittarius A* | Faint particles escaping the shadow's edge while their partners fall in |
| Dark matter | The Milky Way | An invisible halo that the cursor reveals |
| Dark energy | The cosmic web | The web and the grid under it expand faster and faster as you scroll |
| Loop quantum gravity | The smallest scale | The spacetime grid becomes a woven lattice of loops |
| Quantum uncertainty | The smallest scale | Each point is a fuzzy cloud until the cursor measures it |
| Special relativity | Everywhere | Scroll fast and stars crowd ahead and turn bluer (aberration and Doppler shift); scroll back and they redden |
| Kepler's laws | The Solar System | Elliptical orbits (Mercury and Mars stretched), with a wedge behind Mars sweeping equal areas in equal times |
| Nuclear fusion | The Solar System | Flashes in the Sun's core |
| Pulsar beams | The Crab Nebula | Two lighthouse beams sweeping round, slowed 20 times, with the pulsar flashing in step |
| Time dilation | The Crab Nebula, Sagittarius A* | Two ticking clocks in the Physics note: one far away, one deep in the gravity |
| Frame dragging | Sagittarius A* | The grid twists into a whirlpool around the spinning black hole |
| Doppler beaming | Sagittarius A* | The side of the disk moving toward you is brighter and bluer |
| Tidal stretching | Sagittarius A* | The disk stretches toward the hole near the cursor |
| Gravitational waves | Andromeda | Spiral ripples across the grid from a pair of black holes |
| Quantum entanglement | The smallest scale | Paired clouds: measure one and both settle, one amber and one blue |
| Vacuum fluctuations | The smallest scale | Particle pairs flickering in and out of empty space |
| Cosmic inflation and the CMB | The Big Bang (chapter XIII) | One bright point expands; matter gathers into clusters inside the speckled cosmic microwave background. "Replay the Big Bang" restarts it |

The numbers for each stop (grid depth, lens strength and the notes) are in the `PHYS` list in `js/universe.js`.

## Run it locally

Any static file server works. From this folder:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Publish it

- **GitHub Pages:** in the repository's Settings → Pages, choose "Deploy from a branch", pick `main` and the root folder.
- **Netlify or Vercel:** import the repository with no build command and the root folder as the output.
- **Custom domain:** point the domain at whichever host you pick, following that host's domain instructions.

## Before launch

The site is a draft. Amber dashed tags on the page mark details still to confirm:

- University, graduation year and the start year of outreach work
- Event photographs, with permission
- Your own astrophotos for the Astrophotography section: put the image files in `assets/astro/` and set each `src` in the `astroPhotos` list in `js/app.js` (for example `"assets/astro/moon.jpg"`)
- Real projects, with links and your role in each
- Programming languages and tools
- Contact email, social links and service area
- The contact form opens a ready-written email or WhatsApp message to Bhanu. For messages that arrive without the visitor’s email app, connect a form service such as Formspree

## Editing content

Text for every section lives in the `CONTENT` object near the top of `js/app.js`. The thirteen journey stops, with their distances and facts, are the `SCENES` list in `js/universe.js`. Colors, type and spacing follow `brand/tokens.json`. Change a value there and in the `:root` block of `css/styles.css`.

### Adding a public session

Add an entry to the `EVENTS` list in `js/app.js` (there is an example in the comment above it). Each event appears under "Upcoming sessions" and is also published to Google as an Event, so it can show up in event searches.

### Practical labs

The labs for each class group are the `GRADES` list in `js/app.js`. Each group has one interactive lab (`MoonLab`, `ShadowLab`, `ScopeLab`, `JupiterLab`) and three hands-on activities: title, time, what you need, an optional safety line, steps, what you'll see and why. "Print these activities" prints only the activity cards of the chosen group.

### Sky Notes

Articles are plain pages in `notes/`. To add one, copy an existing note, change its title, description and text, add it to the `NOTES` list in `js/app.js`, and add its address to `sitemap.xml`. Review the three starter notes before publishing: they are written in your voice.


### After changing CSS or JavaScript

Browsers keep the site's files for about 10 minutes. When you change `css/styles.css`, `js/universe.js` or `js/app.js`, also change the `?v=` number after those file names in `index.html` (any new number works, such as today's date and time). Visitors then get the new files straight away.

### Writing next month's Sky Note

1. Copy the newest monthly note in `notes/` (for example `sky-february-2027.html`) and rename it, such as `sky-march-2027.html`.
2. Change the title, description, the "Monthly sky" label and the text. Use the site's **Tonight's Sky** panel and **Sky calendar** to check planet times, New and Full Moons and meteor showers for Hyderabad.
3. Add it to the top of the `NOTES` list in `js/app.js`, add its address to `sitemap.xml`, and bump the `?v=` numbers in `index.html`.
