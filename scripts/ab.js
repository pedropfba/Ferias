const { chromium } = require('playwright');
(async () => {
  const [,, tag, box, d1, d2, adults, beds] = process.argv;
  const [sw_lat, sw_lng, ne_lat, ne_lng] = box.split(',');
  const b = await chromium.launch(); const ctx = await b.newContext({locale:'pt-BR', viewport:{width:1400,height:1000}, userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'});
  const p = await ctx.newPage(); const all = {};
  for (let pg = 0; pg < 3; pg++) {
    const url = `https://www.airbnb.com.br/s/homes?checkin=${d1}&checkout=${d2}&adults=${adults}&min_bedrooms=${beds}&currency=BRL&search_by_map=true&sw_lat=${sw_lat}&sw_lng=${sw_lng}&ne_lat=${ne_lat}&ne_lng=${ne_lng}&zoom_level=14&items_offset=${pg*18}`;
    await p.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
    await p.waitForSelector('[itemprop="itemListElement"]',{timeout:40000}).catch(()=>{});
    await p.waitForTimeout(4000);
    const cards = await p.$$eval('[itemprop="itemListElement"]', els => els.map(e => ({ t: e.innerText.replace(/\n+/g,' | '), u: ((e.querySelector('a')||{}).href||'').split('?')[0] })));
    if (!cards.length) break;
    for (const c of cards) all[c.u] = c.t; if(process.env.RAW) cards.slice(0,4).forEach(c=>console.log("RAW",c.t));
  }
  console.log('##', tag, d1, d2, adults+'pax', beds+'+qts', Object.keys(all).length, 'anúncios');
  const rows = Object.entries(all).map(([u,t]) => {
    const tot = (t.match(/novo preço total é R\$\s*([\d.]+)/)||t.match(/Total:\s*R\$\s*([\d.]+)/)||[])[1];
    const totalN = tot ? +tot.replace(/\./g,'') : null;
    const rate = (t.match(/([\d,]+) de uma avaliação média de 5(?:, (\d+) avalia)?/)||[]);
    const parts=t.split(' | '); const ri=parts.findIndex(x=>/avaliação média|Novo/.test(x)); const title = (parts.slice(ri+1).find(x=>x.length>12 && !/^[\d,]+$|camas|quartos|Novo|avaliação/.test(x))||'');
    const kind = (t.match(/\| ([^|]+ ⋅ [^|]+) \|/)||[])[1]||'';
    const q = (t.match(/(\d+) quartos/)||[])[1]; const bn = (t.match(/([\d]+(?: banheiros e meio| banheiros?))/)||[])[1];
    return {totalN, u, txt:`${title.slice(0,60)} | ${q}qts ${bn||''} | nota ${rate[1]||'-'}${/Cancelamento gratuito/.test(t)?' | canc. grátis':''}${/Preferido/.test(t)?' | preferido':''}`};
  }).filter(r=>r.totalN).sort((a,b)=>a.totalN-b.totalN);
  for (const r of rows) console.log(`R$ ${r.totalN.toLocaleString('pt-BR')} | ${r.txt} | ${r.u}`);
  await b.close();
})();
