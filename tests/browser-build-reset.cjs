const {chromium}=require("C:/Users/joshb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
(async()=>{
const b=await chromium.launch({headless:true,channel:"msedge"});
const p=await b.newPage();await p.goto(process.env.TEST_URL||"http://127.0.0.1:4173");
await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem("moviesim-save-v1"));s.week=100;s.cash=90000;s.prestige=80;localStorage.setItem("moviesim-save-v1",JSON.stringify(s));localStorage.setItem("moviesim-build","older");});
await p.reload();
let s=await p.evaluate(()=>JSON.parse(localStorage.getItem("moviesim-save-v1")));
if(s.week!==0||s.cash!==6000||s.prestige!==0||s.movies.length||s.debt.length)throw Error("Build did not reset studio");
if(await p.locator('[data-action="nextEvent"]').count())throw Error("Fast advance remains");
await p.locator('[data-action="next"]').click();
await p.reload();s=await p.evaluate(()=>JSON.parse(localStorage.getItem("moviesim-save-v1")));
if(s.week!==1)throw Error("Weekly advance or same-build persistence failed");
await b.close();console.log("PASS: fresh build reset, weekly advance and same-build persistence");
})().catch(e=>{console.error(e);process.exit(1)});
