import { scopeName } from "./engine.js?v=0.12.0";
// Original, code-drawn pixel artwork. No external asset downloads or fonts.
const palettes = [
  ["#27414c", "#7bbaaf", "#efbf88"],
  ["#342a47", "#ac92be", "#e4a06f"],
  ["#283c36", "#8dae91", "#e3c08e"],
  ["#443336", "#d6917c", "#e9be74"],
  ["#253448", "#80a7c3", "#f0af77"],
  ["#413d2e", "#bead6f", "#a2c7bf"],
];
export function portrait(p, size = 56) {
  const n = p.look || 0,
    skin = ["#e9b38b", "#b67655", "#714b3c", "#d69c75", "#9a644b"][n % 5],
    hair = ["#272627", "#593c32", "#c0935f", "#3a2929", "#d4c5ae"][
      Math.floor(n / 5) % 5
    ],
    shirt = palettes[n % 6][1],
    long = n % 3 === 0;
  return `<svg class="portrait" width="${size}" height="${size}" viewBox="0 0 32 32" role="img" aria-label="Pixel portrait" shape-rendering="crispEdges"><rect width="32" height="32" fill="${palettes[n % 6][0]}"/><path d="M4 32v-7h5v-3h14v3h5v7" fill="${shirt}"/><path d="M13 20h6v6h-6" fill="${skin}"/><path d="M8 7h16v14H8z" fill="${hair}"/>${long ? `<path d="M6 10h4v16H6m16-16h4v16h-4" fill="${hair}"/>` : ""}<path d="M10 9h12v12h-3v2h-6v-2h-3" fill="${skin}"/><path d="M8 7h16v4H8m2-6h12v3H10m-2 3h4v6H8" fill="${hair}"/><path d="M12 14h2v2h-2m6-2h2v2h-2" fill="#28262a"/><path d="M14 19h4v1h-4" fill="#92554b"/><path d="M12 25l4 3 4-3v7h-8" fill="#eee5d2"/></svg>`;
}
export function poster(m, large = false) {
  const photos=["beyond-the-pines","red-horizon","between-worlds","lights-off"];
  if (photos.includes(m.photoPoster)) return `<div class="poster photo-poster ${large ? "large" : ""}"><img src="./assets/posters/${m.photoPoster}.jpg" alt="${escapeHtml(m.title)} movie poster" loading="lazy"></div>`;

  const n = m.art || 0,
    [dark, light, warm] = palettes[n % 6];
  const variant = n % 4;
  const shapes =
    variant === 0
      ? `<circle cx="70" cy="62" r="35" fill="${warm}"/><path d="M0 131 45 65 72 103 98 76 140 134v66H0" fill="${light}"/><path d="m0 163 62-49 78 36v50H0" fill="${dark}"/>`
      : variant === 1
        ? `<path d="m68 0 55 200H22Z" fill="${light}" opacity=".6"/><circle cx="73" cy="78" r="26" fill="${warm}"/><path d="M0 132h22v-25h20v52h24v-40h26v21h25v-35h23v95H0" fill="${dark}"/>`
        : variant === 2
          ? `<circle cx="70" cy="90" r="60" fill="none" stroke="${light}" stroke-width="18"/><circle cx="70" cy="90" r="31" fill="none" stroke="${warm}" stroke-width="9"/><path d="M65 95h10v55H65z" fill="${warm}"/>`
          : `<path d="m0 110 140-65v34L0 144z" fill="${warm}"/><path d="m0 154 140-65v12L0 166z" fill="${light}"/><circle cx="38" cy="62" r="23" fill="${light}"/>`;
  return `<div class="poster ${large ? "large" : ""}" style="--poster:${dark}"><svg viewBox="0 0 140 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="140" height="200" fill="${dark}"/>${shapes}<path d="M0 192h140" stroke="${warm}" stroke-width="2"/></svg><span class="poster-top">A SILVER SCREEN ORIGINAL</span><strong>${escapeHtml(m.title)}</strong><span class="poster-bottom">${escapeHtml(m.genre)} • ${escapeHtml(scopeName(m.scale))}</span></div>`;
}
export function studioArt(s) {
  const level = Object.values(s.facilities).reduce((a, b) => a + b, 0);
  return `<svg class="studio-art" viewBox="0 0 720 220" role="img" aria-label="Pixel-art studio lot with soundstage, offices and screening room" shape-rendering="crispEdges"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#233e4b"/><stop offset="1" stop-color="#526369"/></linearGradient></defs><rect width="720" height="220" fill="url(#sky)"/><circle cx="583" cy="49" r="24" fill="#e3be89"/><path d="M0 131 64 97l50 25 88-42 88 48 98-52 80 41 100-36 62 37 90-41v143H0" fill="#334d4d"/><path d="M0 176h720v44H0" fill="#222e32"/><path d="M20 203h68m28 0h68m28 0h68m28 0h68m28 0h68m28 0h68m28 0h68m28 0h48" stroke="#9e9c7c" stroke-width="3"/><rect x="52" y="72" width="230" height="108" fill="#a57e66"/><rect x="45" y="63" width="244" height="12" fill="#d1af89"/><rect x="64" y="83" width="206" height="80" fill="#273a40"/><rect x="127" y="93" width="83" height="70" fill="#526d73"/><path d="m127 93 42 26 41-26" fill="#769497"/><path d="M80 95v66m-10-10 10-14 10 14m136-56v66m-10-10 10-14 10 14" stroke="#bcb39a" stroke-width="4"/><path d="m72 92 19-6 5 14-19 6m141-13 19-6 5 14-19 6" fill="#f0cf8c"/><path d="M168 137h12v25h-12m-7-17h26v6h-26" fill="#222a32"/><rect x="316" y="92" width="151" height="88" fill="#d3b38a"/><rect x="309" y="83" width="165" height="12" fill="#754f46"/><rect x="329" y="105" width="44" height="34" fill="#efcd87"/><path d="M351 105v34m-22-17h44" stroke="#8e7563" stroke-width="4"/><rect x="411" y="105" width="43" height="34" fill="#f1cc87"/><path d="M432 105v34m-21-17h43" stroke="#8e7563" stroke-width="4"/><rect x="381" y="126" width="22" height="54" fill="#485961"/><rect x="510" y="108" width="159" height="72" fill="${level ? "#79998a" : "#726d68"}"/><path d="m503 108 87-29 87 29" fill="#374e4e"/><rect x="545" y="126" width="88" height="45" fill="#233239"/><rect x="558" y="132" width="61" height="23" fill="${level ? "#dfbb7e" : "#8faca5"}"/><path d="M540 169h16v-9h14v9h16v-9h14v9h16v-9h14v9h16" fill="#be806b"/><path d="M24 180v-58m-10 13 10-18 10 18m-10-11-14-8m14 8 14-8M692 181v-71m-14 16 14-22 14 22m-14-14-18-8m18 8 18-8" stroke="#84a28a" stroke-width="5"/><rect x="71" y="68" width="193" height="10" fill="#283a3c"/><text x="167" y="76" text-anchor="middle" fill="#ead9b7" font-family="monospace" font-size="7" letter-spacing="2">S I L V E R L I N E  /  STAGE 01</text><rect x="329" y="87" width="123" height="10" fill="#283a3c"/><text x="391" y="95" text-anchor="middle" fill="#ead9b7" font-family="monospace" font-size="7">PRODUCTION OFFICE</text>${level > 2 ? '<path d="M290 140h15v40h-15m0-46h15v7h-15" fill="#dfbf79"/>' : ""}</svg>`;
}
export function escapeHtml(v) {
  return String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
