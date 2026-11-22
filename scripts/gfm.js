const { chromium } = require('playwright');
const origins = process.argv[2].split(',');
const dates = [
 ['2027-06-13','2027-06-27'],['2027-06-16','2027-06-30'],['2027-06-18','2027-06-30'],['2027-06-19','2027-07-03'],
 ['2027-06-20','2027-07-04'],['2027-07-01','2027-07-15'],['2027-07-03','2027-07-17'],['2027-07-10','2027-07-24'],['2027-07-17','2027-07-31']];
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ locale: 'pt-BR' });
  const jobs = [];
  for (const o of origins) for (const [d1,d2] of dates) jobs.push([o,d1,d2]);
  const out = [];
  async function run([o,d1,d2]) {
    const p = await ctx.newPage();
    try {
      const q = `Flights from ${o} to FOR on ${d1} through ${d2}`;
      await p.goto(`https://www.google.com/travel/flights?q=${encodeURIComponent(q)}&hl=pt-BR&curr=BRL&gl=BR`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await p.waitForTimeout(9000);
      await p.waitForFunction(()=>document.body.innerText.includes("ida e volta"),null,{timeout:30000}).catch(()=>{}); const t = await p.innerText("body"); require("fs").writeFileSync(`txt/${o}_${d1}_${d2}.txt`, t);
      const min = (t.match(/a partir de (R\$ [\d.]+)/)||[])[1];
      const info = (t.match(/Os preços estão[^\n]*/)||[''])[0];
      // first 3 flights
      const seg = t.split('Principais voos de ida')[1]||'';
      const fl = [];
      const re = /(\d\d:\d\d)\n – \n(\d\d:\d\d(?:\+1)?)\n([^\n]+)\n(\d+h(?: \d+ min)?)\n[^\n]+\n(Sem escalas|\d paradas?)[\s\S]*?(R\$ [\d.]+)\nida e volta/g;
      let m; while ((m = re.exec(seg)) && fl.length < 4) fl.push(`${m[1]}-${m[2]} ${m[3].replace('Operado por Latam Airlines Brasil','')} ${m[4]} ${m[5]} ${m[6]}`);
      out.push({o,d1,d2,min,info,fl});
    } catch(e) { out.push({o,d1,d2,err:e.message.slice(0,80)}); }
    await p.close();
  }
  const pool = 4; let i = 0;
  await Promise.all(Array.from({length:pool}, async () => { while (i < jobs.length) await run(jobs[i++]); }));
  out.sort((a,b)=> (a.o+a.d1).localeCompare(b.o+b.d1));
  console.log(JSON.stringify(out,null,1));
  await b.close();
})();
