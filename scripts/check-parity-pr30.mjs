import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const base='https://alext-tech98.github.io/meehoasg-ui-demo/parity-pr30/';
const browser=await chromium.launch({headless:true});
const checks=[];
try {
 for(const width of [320,375,390,430,1440]){
  const page=await browser.newPage({viewport:{width,height:850},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'?qa-mobile='+Date.now(),{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForTimeout(3000);
  console.log('boot-diagnostic',await page.evaluate(()=>({url:location.href,ready:window.__MEE_MAIN_READY__,state:window.__MEE_BOOT_STAGE__,user:window.S?.user?.role,htmlTitle:document.title,api:!!window.__MEE_DEMO_API__,scripts:[...document.scripts].filter(x=>x.src).map(x=>x.src),errors:[...document.querySelectorAll('#loginError')].map(x=>x.textContent)})));
  await page.waitForFunction(()=>window.MEEOPS7 && window.S?.user,{timeout:12000});
  await page.waitForTimeout(600);
  const dashboardSearch=await page.evaluate(()=>{const el=document.querySelector('.topbar-search');const cs=el&&getComputedStyle(el);return {visible:!!el&&!!el.getClientRects().length&&cs.display!=='none',viewport:innerWidth,right:el?.getBoundingClientRect().right||0};});
  assert.ok(dashboardSearch.visible,'dashboard must show global search');
  assert.ok(dashboardSearch.right<=width+2,'dashboard search must not clip');
  for(const selector of ['.mee-approved-summary','.mee-approved-analytics-sales','#meeHourlySingleV361','.mee-approved-attention']){
    assert.ok(await page.locator(selector).count()>0,'dashboard section missing: '+selector);
    assert.ok(await page.locator(selector).first().isVisible(),'dashboard section hidden: '+selector);
  }
  const ui=await page.evaluate(()=>{
    const refresh=document.querySelector('.mee-refresh-action');
    const s=refresh?getComputedStyle(refresh):null;
    const search=document.getElementById('globalSearchInput');
    return {
      refreshVisible:!!refresh&&!!refresh.getClientRects().length&&s.display!=='none'&&s.visibility!=='hidden',
      refreshRight:refresh?.getBoundingClientRect().right||0,
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
  if(width<=430)assert.ok(ui.refreshRight<=width+1,'refresh button must remain inside mobile viewport');
  if(width<=430)assert.ok(ui.inputFont>=16,'iOS search font is at least 16px');
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
  if(width<=430){
   assert.ok(thumb.width<=57&&thumb.height<=57,'mobile thumbnail must not exceed 56px');
   assert.ok(thumb.natural>=1000,'test image must have a large natural size');
  }
  const scroll=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth}));
  assert.ok(scroll.overflow<=2,'orders must not horizontally overflow');
  await page.evaluate(()=>window.MEEOPS7.go('production'));
  await page.waitForSelector('.order .status-next',{timeout:12000});
  const prodBefore=await page.evaluate(()=>window.S.orders.get('DEMO-001')?.status);
  assert.equal(prodBefore,'Chờ bó','demo production starts waiting');
  const control=page.locator('.order').filter({hasText:'Khách minh họa A'}).locator('button.status-next');
  assert.ok(await control.isVisible(),'production status action visible');
  await control.click();
  await page.waitForFunction(()=>window.S.orders.get('DEMO-001')?.status==='Đã bó',{timeout:10000});
  checks.push({width,ui,thumb,search:'PASS',productionStatus:'PASS',errors});
  assert.equal(errors.length,0,'no browser script errors');
  await page.close();
 }
}finally{await browser.close()}
console.log(JSON.stringify({result:'PASS',checks},null,2));
