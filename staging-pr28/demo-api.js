(function(){
'use strict';
const build='2026.09.28-supabase-v3';
const date=()=>new Date().toLocaleDateString('en-CA');
const tomorrow=()=>{const d=new Date(date()+'T12:00:00+07:00');d.setUTCDate(d.getUTCDate()+1);return d.toISOString().slice(0,10);};
const orders=[
{id:'DEMO-001',date:date(),time:'10:30',customer:'Khách minh họa A',phone:'000 000 0001',flower:'Bó hồng pastel',note:'Mẫu minh họa',shipping:'Nhận tại shop',address:'',sale:'Sale Demo',status:'Chờ bó',flowerTotal:850000,total:850000,paid:300000,debt:550000,payment:'Chuyển khoản',sourceSheet:'Demo',sourceRow:1,detailLoaded:true},
{id:'DEMO-002',date:tomorrow(),time:'14:00',customer:'Khách minh họa B',phone:'000 000 0002',flower:'Giỏ hoa chúc mừng',note:'Mẫu minh họa',shipping:'Khách book ship',address:'Địa chỉ minh họa',sale:'Sale Demo',status:'Đã bó',flowerTotal:1200000,total:1200000,paid:1200000,debt:0,payment:'Chuyển khoản',sourceSheet:'Demo',sourceRow:2,detailLoaded:true},
{id:'DEMO-003',date:date(),time:'17:00',customer:'Khách minh họa C',phone:'000 000 0003',flower:'Hoa khai trương',note:'Mẫu minh họa',shipping:'Nhận tại shop',address:'',sale:'Sale Demo',status:'Đã giao',flowerTotal:1500000,total:1500000,paid:1000000,debt:500000,payment:'Tiền mặt',sourceSheet:'Demo',sourceRow:3,detailLoaded:true}
];
const image='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200" viewBox="0 0 1600 1200"><rect width="1600" height="1200" fill="#d1e2f4"/><circle cx="800" cy="480" r="280" fill="#efb7bd"/><text x="800" y="1050" font-size="76" text-anchor="middle" fill="#103f82">DEMO FLOWER</text></svg>');
orders[0].imageUrls=[image];orders[0].imageUrl=image;orders[0].sampleUrls=[image];
const summary={orders:3,revenue:3550000,debt:1050000,cms:284000,'Chờ bó':1,'Đã bó':1,'Đã giao':1,alerts:1,unsettled:2};
const user={id:'demo',name:'Người xem demo',username:'demo',role:'ADMIN',active:true};
const options={sales:['Sale Demo'],shipping:['Nhận tại shop','Khách book ship'],payments:['Tiền mặt','Chuyển khoản']};
const dashboard=()=>({ok:true,build,summary,attentionGroups:{nearUnpacked:[orders[0]],packedOverdue:[]},attention:[orders[0]]});
const result=(name,p)=>{
 switch(name){
 case 'getCurrentUserAndBootstrap': case 'loginAndBootstrap': return {ok:true,build,token:'demo-only',user,options,initial:{page:'dashboard',data:dashboard()}};
 case 'getDashboardSummary': return dashboard();
 case 'getProductionOrders': return {ok:true,build,orders};
 case 'getOrders': {const q=String(p&&p.q||'').trim().toLowerCase();const phone=q.replace(/[^0-9]/g,'');const subset=orders.filter(o=>q?([o.customer,o.phone,o.flower,o.sale,o.id].join(' ').toLowerCase().includes(q)||(phone.length>=3&&o.phone.replace(/[^0-9]/g,'').includes(phone))):(o.date>=(p.start||date())&&o.date<=(p.end||date())));return {ok:true,build,items:subset,total:subset.length,page:1,hasMore:false,searchScope:q?'ALL_DATES':'SELECTED_DATE'};}
 case 'getDebtReview': return {ok:true,build,items:orders.filter(o=>o.debt),summary:{debt:1050000,orders:2,shipFeePending:0}};
 case 'getSettlementQueue': return {ok:true,build,items:[{requestId:'DEMO-REQ-001',orderId:'DEMO-003',saleName:'Sale Demo',order:orders[2],flowerTotal:1500000,accessoryTotal:0,vat:0,shipFee:0,requiredAmount:500000,billUrls:[]}]};
 case 'getKpi': return {ok:true,build,holiday:false,note:'Dữ liệu minh họa',items:[{sale:'Sale Demo',revenue:18500000,bigOrders:7,bigTarget:10,operationsScore:90,level1:false,level2:false,rate:.08,commission:1480000,bonus:0}]};
 case 'getFlowerInventory': return {ok:true,build,items:[{name:'Hoa hồng',orders:2,orderList:[{time:'10:30',customer:'Khách minh họa A'},{time:'14:00',customer:'Khách minh họa B'}]},{name:'Hoa cúc',orders:1,orderList:[{time:'17:00',customer:'Khách minh họa C'}]}],reviewCount:0,reviewOrders:[]};
 case 'listUsers': return {ok:true,build,items:[user]};
 case 'getAppOptions': return {ok:true,build,options};
 case 'getOrderDetail': case 'getOrder': return {ok:true,build,order:orders.find(o=>o.id===p.orderId||o.id===p.id)||orders[0]};
 case 'getPerformanceReport': return {ok:true,build,items:[],samples:0};
 case 'logPerformanceBatch': return {ok:true,build};
 default: return {ok:false,build,message:'Bản demo chỉ cho xem; thao tác lưu và thay đổi dữ liệu đã bị khóa.'};
 }
};
window.__MEE_DEMO_API__=result;
})();
