import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
const url='https://alext-tech98.github.io/meehoasg-ui-demo/staging-pr28/';
const browser=await chromium.launch({headless:true});
const findings=[];
mkdirSync('evidence/staging-pr28',{recursive:true});
try{
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:850}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url+'?qa='+Date.now(),{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.MEEOPS7&&document.querySelector('#content'),{timeout:20000});
  for(const module of ['dashboard','orders','production','debt','payment','flowers']){
   try{await page.evaluate(async p=>await window.MEEOPS7.go(p),module);await page.waitForTimeout(300);}
   catch(e){errors.push(module+': '+e.message)}
   const metrics=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth,length:document.querySelector('#content')?.innerText?.length||0}));
   await page.screenshot({path:'evidence/staging-pr28/'+module+'-'+width+'.png',animations:'disabled'});
   findings.push({module,screen:width,...metrics,errors:errors.splice(0)});
  }
  await page.close();
 }
}finally{await browser.close()}
writeFileSync('evidence/staging-pr28/results.json',JSON.stringify(findings,null,2));
const failures=findings.filter(x=>x.width>x.viewport+2||x.length<20||x.errors.length);
console.log(JSON.stringify({states:findings.length,failures},null,2));
if(failures.length)process.exitCode=1;