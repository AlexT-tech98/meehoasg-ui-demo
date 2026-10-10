import {readFileSync,writeFileSync} from 'node:fs';
const result={};
for(const version of ['baseline','after']) for(const device of ['mobile','desktop']){
 const r=JSON.parse(readFileSync(`evidence/lighthouse-${version}-${device}.json`,'utf8'));
 const metric=id=>r.audits[id]?.numericValue??null;
 result[`${version}-${device}`]={score:Math.round((r.categories.performance?.score??0)*100),LCP:metric('largest-contentful-paint'),CLS:metric('cumulative-layout-shift'),TBT:metric('total-blocking-time'),FCP:metric('first-contentful-paint'),URL:r.finalDisplayedUrl};
}
writeFileSync('evidence/performance-summary.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
