# Bhanu Prakash: astronomer, stargazing expert and developer

Personal portfolio website for Bhanu Prakash. Scrolling the page is one journey: from a hillside under the night sky, out past the Moon, planets, nebulae and galaxies to the cosmic web, and finally down to the smallest scale string theory describes. Every scene is made of particles drawn in the browser.

## What's in this repository

| Path | What it is |
| --- | --- |
| `index.html` | The page: metadata, fonts and script tags |
| `css/styles.css` | All styles, built on the brand kit's tokens |
| `js/universe.js` | The WebGL particle universe: twelve formations and the scroll-driven journey |
| `js/app.js` | The React interface: navigation, sections, Cassiopeia expertise map, star-life process, vibrating strings, projects, gallery and contact form |
| `assets/` | Site files, such as the favicon |
| `brand/` | The brand kit: brand book, the twelve-stop journey, design tokens, logos and patterns |

There is no build step. React 18 and htm load from public CDNs, so the folder can be hosted as it is.

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
- Portrait and event photographs, with permission
- Real projects, with links and your role in each
- Programming languages and tools
- Contact email, social links and service area
- Connecting the contact form to an email or form service, such as Formspree or EmailJS (it does not send messages yet)

## Editing content

Text for every section lives in the `CONTENT` object near the top of `js/app.js`. The twelve journey stops, with their distances and facts, are the `SCENES` list in `js/universe.js`. Colors, type and spacing follow `brand/tokens.json`. Change a value there and in the `:root` block of `css/styles.css`.

### Adding a public session

Add an entry to the `EVENTS` list in `js/app.js` (there is an example in the comment above it). Each event appears under "Upcoming sessions" and is also published to Google as an Event, so it can show up in event searches.

### Sky Notes

Articles are plain pages in `notes/`. To add one, copy an existing note, change its title, description and text, add it to the `NOTES` list in `js/app.js`, and add its address to `sitemap.xml`. Review the three starter notes before publishing: they are written in your voice.

