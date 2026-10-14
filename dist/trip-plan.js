// Reuses the tourist 2610 report’s familyTrip.js itinerary and PlanOverview layout.
const tripDocumentTitle = '大地指纹音乐节|红枫湖|青岩古镇3天2晚家庭游包车方案';
const tripDocumentDays = [
  { title: '高铁到达毕节大方，游览奢香古镇、大地指纹音乐节', hotel: '大方云里芳香酒店', stops: [
  {
    "time": "14:00",
    "type": "住宿",
    "details": [
      "抵达大方，酒店办理入住，长辈午休休整。"
    ]
  },
  {
    "time": "15:30",
    "type": "景点/场馆",
    "details": [
      "慢逛奢香古镇（平地为主），可选奢香博物馆，平地游览，不累。"
    ]
  },
  {
    "time": "17:00",
    "type": "餐饮",
    "details": [
      "古镇晚餐，点餐备注免辣 / 微辣：六龙豆干火锅、大方蹄花粉。"
    ]
  },
  {
    "time": "17:30",
    "type": "音乐节",
    "details": [
      "步行前往大地指纹音乐节场地。老人友好预案：不必下梯田观众区，在上方观景台看大地指纹景观、听现场；备好厚外套、防滑鞋、折叠小板凳；夜间山区降温明显。"
    ]
  },
  {
    "time": "21:30",
    "type": "住宿",
    "details": [
      "音乐节结束，步行回酒店休息。"
    ]
  }
] },
  { title: '大方高铁 → 贵阳北，游览红枫湖，包车送回阿云朵仓', hotel: '阿云朵仓珍珀酒店', stops: [
  {
    "time": "09:56",
    "type": "高铁",
    "details": [
      "大方站搭乘城际 C5883（10:56 抵达贵阳北，车程约 1h，适合老人，不用早起）。"
    ]
  },
  {
    "time": "10:56",
    "type": "交通",
    "details": [
      "抵达贵阳北站，出站，和包车司机在贵阳北网约车接送区汇合，搬行李上车。"
    ]
  },
  {
    "time": "11:10",
    "type": "交通",
    "details": [
      "贵阳北站 → 红枫湖上侗下寨停车场（约 50km，50 分钟）。"
    ]
  },
  {
    "time": "12:00",
    "type": "交通",
    "details": [
      "抵达红枫湖上侗下寨停车场，司机原地等候。"
    ]
  },
  {
    "time": "12:10",
    "type": "餐饮",
    "details": [
      "红枫湖附近农家乐午餐（清淡湖鲜，免辣）。"
    ]
  },
  {
    "time": "13:30",
    "type": "景点/场馆",
    "details": [
      "红枫湖游览（老人优选滴澄关平缓环湖步道，平地，随时休息，1.5h；体力好可加游船）。"
    ]
  },
  {
    "time": "15:10",
    "type": "景点/场馆",
    "details": [
      "前往右二彩色村庄，停车打卡拍照（平地，20–30 分钟），湖边露营打牌。"
    ]
  },
  {
    "time": "18:00",
    "type": "餐饮",
    "details": [
      "湖边烧烤。"
    ]
  },
  {
    "time": "19:30",
    "type": "住宿",
    "details": [
      "返回车上，司机送往阿云朵仓珍珀酒店（约 32km，40 分钟）。办理入住，休整。"
    ]
  }
], service: "全天包车服务。" },
  { title: '游览青岩古镇，晚上送回贵阳北站（高铁返程）', stops: [
  {
    "time": "10:00",
    "type": "交通",
    "details": [
      "珍珀酒店退房，司机酒店门口接人，出发前往青岩古镇西门停车场（阿云朵仓 → 青岩西门约 38km，45 分钟）。"
    ]
  },
  {
    "time": "10:45",
    "type": "景点/场馆",
    "details": [
      "抵达青岩古镇西门停车场，司机原地等候。",
      "老人友好路线：西门入园，主街 → 百岁坊 → 短段背街 → 十字街；不爬全程城墙，仅可选登定广门小城楼拍照；65 岁以上老人免大门票。"
    ]
  },
  {
    "time": "12:30",
    "type": "餐饮",
    "details": [
      "古镇午餐：青岩卤猪脚（软烂免辣）、豆腐圆子、糕粑稀饭。"
    ]
  },
  {
    "time": "17:45",
    "type": "交通",
    "details": [
      "返回停车场上车，司机送回贵阳北站（约 35km，45–50 分钟）。"
    ]
  },
  {
    "time": "18:30",
    "type": "高铁",
    "details": [
      "抵达贵阳北站，办理高铁检票，行程结束。"
    ]
  }
], service: "全天包车服务。" }
];

function formatTripConversation(text){
 return String(text).split(/\n\s*\n/).map(block=>{
  const lines=block.split('\n').filter(Boolean);
  if(/^(Day\d|9月\d+日[｜|])/.test(lines[0])){
   const heading=lines.shift();
   return `<section class="trip-reply-section"><h3>${esc(heading)}</h3><ul>${lines.map(line=>`<li>${esc(line)}</li>`).join('')}</ul></section>`;
  }
  if(lines[0]==='费用明细')return `<section class="trip-reply-section"><h3>费用明细</h3><ul>${lines.slice(1).map(line=>`<li>${esc(line)}</li>`).join('')}</ul></section>`;
  return lines.map(line=>`<p>${esc(line)}</p>`).join('');
 }).join('');
}
function tripDocumentCard(){return `<button class="trip-document-card" data-trip-document-open aria-label="查看3天2晚家庭游包车方案"><img src="images/trip-plan-lake.png" alt="红枫湖行程山水示意"><span><strong title="${esc(tripDocumentTitle)}">${esc(tripDocumentTitle)}</strong><small>一家4口 · 商务7座 · 贵阳2天包车接送</small><b><span>¥</span>1800</b></span></button>`}
function tripConversationMessage(m,t,index,msgs){
 if(m.kind==='trip-document')return `<div class="message ai"><div class="bubble">${esc(m.text)}</div></div>${tripDocumentCard()}`;
 const bubble=m.role==='ai'?`<div class="bubble trip-reply">${formatTripConversation(m.text)}</div>`:`<div class="bubble">${esc(m.text)}</div>`;
 const gentle=m.kind==='task-intro'&&!msgs.some(x=>x.role==='user'&&x.kind!=='trip-initial-request')?taskChatActions(t):'';
 const generate=m.kind==='trip-plan-draft'&&!m.documentCreated&&index===msgs.length-1?`<div class="agent-card-shortcuts"><button data-trip-document-generate="${index}">生成文档发送给乘客 <span aria-hidden="true">↗</span></button></div>`:'';
 return `<div class="message ${m.role}" data-message-index="${index}">${bubble}</div>${gentle}${generate}`;
}
function generateTripDocument(index){
 if(current.id!=='trip-plan'||current.done)return;
 const msgs=histories.get(current.id),message=msgs[index];
 if(message?.kind!=='trip-plan-draft'||message.documentCreated)return;
 message.documentCreated=true;
 add('user','生成文档发送给乘客');
 add('ai','已生成方案并发送给客户，点开卡片查看完整行程。','trip-document');
 current.done=true;current.status='已完成';current.completedAt=new Date().toISOString();
 renderTasks();refreshReviewSurfaces();
}
function openTripDocument(){
 const icons={'交通':'car-profile','高铁':'train','住宿':'bed','景点/场馆':'mountains','餐饮':'fork-knife','音乐节':'music-notes'};
 const icon=name=>`<span class="trip-detail-icon" style="--detail-icon:url('../icons/trip-${name}.svg')" aria-hidden="true"></span>`;
 const body=`<section class="plan-introduction"><h1>${esc(tripDocumentTitle.replaceAll('|',' · '))}</h1><p class="plan-author">龙师傅 · 贵旅出行</p><p>9月24日—9月26日 · 一家4口 · 商务7座</p></section><section class="plan-section"><h2>${icon('calendar-check')}行程安排</h2><div class="plan-day-list">${tripDocumentDays.map((day,i)=>`<article class="plan-day-card"><header><div class="plan-day-heading"><span class="plan-day-badge">D${i+1}</span><h3>9月${24+i}日</h3></div></header><h3>${esc(day.title)}</h3><ol class="plan-timeline">${day.stops.map(stop=>`<li class="plan-timeline-item"><span class="plan-timeline-icon">${icon(icons[stop.type]||'map-pin')}</span><div class="plan-timeline-content"><h4><time>${esc(stop.time)}</time><span> · </span>${esc(stop.type)}</h4>${stop.details.map(detail=>`<p>${esc(detail)}</p>`).join('')}</div></li>`).join('')}</ol>${day.hotel?`<p><strong>住宿：</strong>${esc(day.hotel)}</p>`:''}${day.service?`<p class="plan-day-service-note">${esc(day.service)}</p>`:''}</article>`).join('')}</div></section><section class="plan-section plan-fees"><h2>费用明细</h2><p>省内全天包车（7座商务）900元/台/天，共1台2天，合计1800元</p></section>`;
 utility('游玩方案详情',body);
 $('#utility').classList.add('profile-detail','trip-document-detail');
 $('#utility-body').scrollTop=0;
 $('#utility-close').focus({preventScroll:true});
}
document.addEventListener('click',e=>{
 const generate=e.target.closest('[data-trip-document-generate]');
 if(generate){generateTripDocument(Number(generate.dataset.tripDocumentGenerate));return;}
 if(e.target.closest('[data-trip-document-open]'))openTripDocument();
});
