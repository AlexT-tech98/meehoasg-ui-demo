import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const base='https://alext-tech98.github.io/meehoasg-ui-demo/staging-pr28/';
const browser=await chromium.launch({headless:true});
const checks=[];
try {
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:850},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'?qa-mobile='+Date.now(),{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.MEEOPS7 && window.S?.user,{timeout:25000});
  await page.waitForTimeout(600);
  const ui=await page.evaluate(()=>{
    const refresh=document.querySelector('.mee-refresh-action');
    const s=refresh?getComputedStyle(refresh):null;
    const search=document.getElementById('globalSearchInput');
    return {
      refreshVisible:!!refresh&&!!refresh.getClientRects().length&&s.display!=='none'&&s.visibility!=='hidden',
      refreshCount:document.querySelectorAll('.mee-refresh-action').length,
      reloadButton:!!document.querySelector('#meeReloadApp'),
      inputFont:search?parseFloat(getComputedStyle(search).fontSize):0,
      dashboardHeading:document.querySelector('.mee-atelier-dashboard-header h1')?.textContent||'',
      dashboardLabel:document.querySelector('.mee-atelier-dashboard-header>div:first-child')?getComputedStyle(document.querySelector('.mee-atelier-dashboard-header>div:first-child'),'::before').content:'',
      brand:document.querySelector('.sidebar .brand-copy small')?.textContent||'',
      overflow:document.documentElement.scrollWidth-innerWidth,
      viewport:document.querySelector('meta[name="viewport"]')?.content||''
    };
  });
  assert.equal(ui.reloadButton,false,'reload button must be removed');
  assert.equal(ui.refreshCount,1,'one refresh action');
  assert.equal(ui.refreshVisible,true,'refresh action visible');
  if(width===390)assert.ok(ui.inputFont>=16,'iOS search font is at least 16px');
  assert.ok(ui.dashboardHeading.includes('Một ngày ở Meehoasg'),'approved dashboard heading');
  assert.ok(ui.dashboardLabel.includes('Dashboard Meehoasg'),'approved dashboard label');
  assert.ok(ui.brand.includes('MEEHOASG OPERATIONS'),'approved sidebar tagline');
  assert.ok(ui.overflow<=2,'dashboard must not overflow viewport');
  assert.ok(!ui.viewport.includes('user-scalable=no'),'intentional pinch zoom must remain available');
  await page.evaluate(()=>window.MEEOPS7.go('orders'));
  await page.waitForFunction(()=>window.S?.data?.orders?.items?.length>0,{timeout:15000});
  const before=await page.evaluate(()=>window.S.data.orders.items.map(x=>x.id));
  assert.ok(before.includes('DEMO-001'),'selected-date order shown');
  assert.ok(!before.includes('DEMO-002'),'tomorrow order absent without search');
  await page.fill('#globalSearchInput','0000000002');
  await page.evaluate(()=>window.MEEOPS7.submitSearch());
  await page.waitForFunction(()=>window.S?.data?.orders?.items?.some(x=>x.id==='DEMO-002'),{timeout:15000});
  const searched=await page.evaluate(()=>window.S.data.orders.items.map(x=>x.id));
  assert.ok(searched.includes('DEMO-002'),'phone search finds a future-date order');
  await page.evaluate(()=>window.MEEOPS7.clearSearch());
  await page.waitForFunction(()=>window.S?.data?.orders?.items?.some(x=>x.id==='DEMO-001')&&!window.S?.data?.orders?.items?.some(x=>x.id==='DEMO-002'),{timeout:15000});
  const thumb=await page.evaluate(()=>{
    const img=document.querySelector('.order-card-mobile-thumb');
    if(!img)return null;
    const box=img.getBoundingClientRect();
    return {width:box.width,height:box.height,natural:img.naturalWidth,cssMax:getComputedStyle(img).maxWidth};
  });
  assert.ok(thumb,'mobile thumbnail source should exist');
  if(width===390){
   assert.ok(thumb.width<=57&&thumb.height<=57,'mobile thumbnail must not exceed 56px');
   assert.ok(thumb.natural>=1000,'test image must have a large natural size');
  }
  const scroll=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth}));
  assert.ok(scroll.overflow<=2,'orders must not horizontally overflow');
  checks.push({width,ui,thumb,search:'PASS',errors});
  assert.equal(errors.length,0,'no browser script errors');
  await page.close();
 }
}finally{await browser.close()}
console.log(JSON.stringify({result:'PASS',checks},null,2));
