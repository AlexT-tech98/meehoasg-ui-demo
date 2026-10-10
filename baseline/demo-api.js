(function(){
'use strict';
const build='2026.09.28-supabase-v3';
const date=()=>new Date().toLocaleDateString('en-CA');
const orders=[
{id:'DEMO-001',date:date(),time:'10:30',customer:'Khách minh họa A',phone:'000 000 0001',flower:'Bó hồng pastel',note:'Mẫu minh họa',shipping:'Nhận tại shop',address:'',sale:'Sale Demo',status:'Chờ bó',flowerTotal:850000,total:850000,paid:300000,debt:550000,payment:'Chuyển khoản',sourceSheet:'Demo',sourceRow:1,detailLoaded:true},
{id:'DEMO-002',date:date(),time:'14:00',customer:'Khách minh họa B',phone:'000 000 0002',flower:'Giỏ hoa chúc mừng',note:'Mẫu minh họa',shipping:'Khách book ship',address:'Địa chỉ minh họa',sale:'Sale Demo',status:'Đã bó',flowerTotal:1200000,total:1200000,paid:1200000,debt:0,payment:'Chuyển khoản',sourceSheet:'Demo',sourceRow:2,detailLoaded:true},
{id:'DEMO-003',date:date(),time:'17:00',customer:'Khách minh họa C',phone:'000 000 0003',flower:'Hoa khai trương',note:'Mẫu minh họa',shipping:'Nhận tại shop',address:'',sale:'Sale Demo',status:'Đã giao',flowerTotal:1500000,total:1500000,paid:1000000,debt:500000,payment:'Tiền mặt',sourceSheet:'Demo',sourceRow:3,detailLoaded:true}
];
const summary={orders:3,revenue:3550000,debt:1050000,cms:284000,'Chờ bó':1,'Đã bó':1,'Đã giao':1,alerts:1,unsettled:2};
const user={id:'demo',name:'Người xem demo',username:'demo',role:'ADMIN',active:true};
const options={sales:['Sale Demo'],shipping:['Nhận tại shop','Khách book ship'],payments:['Tiền mặt','Chuyển khoản']};
const dashboard=()=>({ok:true,build,summary,attentionGroups:{nearUnpacked:[orders[0]],packedOverdue:[]},attention:[orders[0]]});
const result=(name,p)=>{
 switch(name){
 case 'getCurrentUserAndBootstrap': case 'loginAndBootstrap': return {ok:true,build,token:'demo-only',user,options,initial:{page:'dashboard',data:dashboard()}};
 case 'getDashboardSummary': return dashboard();
 case 'getProductionOrders': return {ok:true,build,orders};
 case 'getOrders': return {ok:true,build,items:orders,total:orders.length,page:1,hasMore:false};
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
