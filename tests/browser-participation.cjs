const {chromium}=require("C:/Users/joshb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
(async()=>{
const b=await chromium.launch({headless:true,channel:"msedge"});const p=await b.newPage({viewport:{width:390,height:844}});
await p.goto(process.env.TEST_URL||"http://127.0.0.1:4173");
await p.evaluate(async()=>{
 const E=await import("./engine.js?v=0.7.0");const s=E.newGame(78);
 const m=E.act(s,"buy",{script:s.market[0].id});m.scale="Blockbuster";m.difficulty=80;
 const star=s.people.find(p=>p.kind==="actor");star.star=80;star.majorCredits=8;
 E.act(s,"audition",{id:m.id,person:star.id,role:0});
 localStorage.setItem("moviesim-save-v1",JSON.stringify(s));
});
await p.reload();
await p.locator('[data-action="movie"]').first().click();
await p.locator('[data-action="casting"]').first().click();
await p.locator('[data-action="castingMode"]').click();
const id=await p.evaluate(()=>JSON.parse(localStorage.getItem("moviesim-save-v1")).people[0].id);
await p.locator('[data-action="offer"][data-person="'+id+'"]').click();
if(!(await p.locator("dialog").innerText()).includes("Required revenue share: 5%"))throw Error("Missing demand");
await p.screenshot({path:"test-results/participation-offer.png"});
if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error("Mobile overflow");
await p.locator("#offer-form button").click();
const s=await p.evaluate(()=>JSON.parse(localStorage.getItem("moviesim-save-v1")));
if(s.movies[0].contracts[0].grossShare!==.05)throw Error("Demand not signed");
await b.close();console.log("PASS: star demand visible before signing and persists at 5%; mobile offer");
})().catch(e=>{console.error(e);process.exit(1)});
