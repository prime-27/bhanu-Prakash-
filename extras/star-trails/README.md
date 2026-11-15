# Star trails

The star-trails effect from the opening of stargazinghyderabad.com, as a standalone file: stars circle the pole star, leaving fading trails, with twinkling diffraction spikes on the bright ones. Plain WebGL, no libraries.

- `star-trails.js`: the effect (about 6 KB)
- `index.html`: a demo with sliders that writes the code for the settings you choose

## Use it on any page

Copy `star-trails.js` next to your page, then:

```html
<canvas id="sky" style="position:fixed;inset:0;width:100%;height:100%;z-index:-1"></canvas>
<script src="star-trails.js"></script>
<script>StarTrails(document.getElementById("sky"), { speed: 0.12, trail: 0.75 });</script>
```

Give the page's own content a transparent background so the sky shows behind it.

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `speed` | `0.12` | Turns of the sky per minute; `0` keeps it still |
| `scroll` | `false` | `true` turns the sky as the page scrolls instead of with time |
| `trail` | `0.75` | Trail length, from `0` (none) to `1` (very long) |
| `stars` | `9000` | Number of stars, halved on small or slow devices |
| `pole` | `[0.25, 0.18]` | Where the pole star sits, as fractions of width and height from the top left |
| `milkyWay` | `true` | A faint band of the Milky Way |
| `horizon` | `true` | A dark hillside along the bottom |
| `background` | `"#04050a"` | Sky colour |

`StarTrails(...)` returns `{ stop(), setSpeed(n), set(option, value) }`. Visitors who ask their device for reduced motion get a still sky.
