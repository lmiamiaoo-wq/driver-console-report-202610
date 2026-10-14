// Music-festival publishing stays inside this local prototype's storefront.
const festivalServiceTypes={oneway:'单程接送',roundtrip:'往返包车'};
function createFestivalService(owner,type){
 const roundtrip=type==='roundtrip',name=festivalServiceTypes[type],price=roundtrip?699:299;
 return {id:`${owner.id}-festival-${type}`,festivalType:type,title:`大地指纹音乐节${name}｜贵阳出发`,detailTitle:name,price,priceUnit:'次',priceFrom:true,
  route:roundtrip?'贵阳城区约定地点接驾，往返大地指纹音乐节，含现场等候和散场接回。':'贵阳城区与大地指纹音乐节之间单程接送，去程或返程任选一程。',
  details:roundtrip?'提前预约并确认日期、人数、行李和上车地点。出发前联系确认演出时间与接驾安排。送达音乐节后司机在约定区域等候，散场后按约定地点接回。停靠、用餐和返程时间可提前协商。':'提前预约并确认日期、人数、行李和接送方向。出发前联系确认时间与上车地点，按约定路线完成一程接送。散场返程请提前约好集合地点。',
  pricing:roundtrip?'699元/次 起，包含约定路线的往返接送、司机服务与现场等候。':'299元/次 起，包含约定路线的一程接送与司机服务。',
  bookingNotes:'最终报价根据接送地点、车型和时段确认；节假日、深夜、额外停靠等加价需提前与游客约定。过路费、停车费及其他费用是否包含，预约时一并说明。'};
}
function festivalChoiceButtons(owner){
 if(Object.keys(owner.festivalDrafts||{}).length)return '';
 return Object.entries(festivalServiceTypes).filter(([type])=>!owner.festivalDrafts?.[type]).map(([type,name])=>`<button type="button" data-festival-create="${type}">发布${name}服务 <span aria-hidden="true">↗</span></button>`).join('');
}
function renderBusinessAIMessage(message,index,messages,owner){
 const text=message.streaming?message.visibleText:message.text;
 const bubble=`<div class="message ${message.role}"><div class="bubble">${message.role==='ai'?formatAIMessage(text):esc(text)}</div></div>`;
 if(message.role!=='ai'||message.streaming)return bubble;
 if(message.kind==='station-task'&&message.task)return bubble+renderStationTaskCard(message.task);
 if(['weekly-report','halfday-preview'].includes(message.kind))return renderWeeklyMessage(message,owner);
 let extra='';
 if(message.kind==='festival-preview'){
  const draft=owner.festivalDrafts?.[message.festivalType];
  if(draft){extra=`<div class="business-card-result">${businessServiceChatCard(draft,'festival')}${!draft.published?`<div class="agent-card-shortcuts"><button type="button" data-festival-publish="${draft.festivalType}">发布 <span aria-hidden="true">↗</span></button></div>`:''}</div>`;}
 }
 if(['festival-options','festival-published'].includes(message.kind)&&index===messages.findLastIndex(m=>['festival-options','festival-published'].includes(m.kind))){
  const buttons=festivalChoiceButtons(owner);if(buttons)extra+=`<div class="agent-card-shortcuts">${buttons}</div>`;
 }
 return bubble+extra;
}
function renderStationTaskCard(task){
 return `<article class="chat-task-result" aria-label="${esc(task.title)}">
  <div class="chat-task-result-head"><span class="chat-task-result-icon" aria-hidden="true"></span><h3>${esc(task.title)}</h3><span class="chat-task-result-status">${esc(task.status)}</span></div>
  <div class="chat-task-result-details">
  <p class="chat-task-result-date">${orderDetailIcon('calendar-dots-fill')}<span>${esc(task.date)}</span></p>
  <div class="chat-task-result-route">
   <div><img class="chat-task-result-marker" src="icons/route-start.svg" alt="起点"><p><strong>${esc(task.from)}</strong><small>出发 · ${esc(task.departure)}</small></p></div>
   <div><img class="chat-task-result-marker" src="icons/route-end.svg" alt="终点"><p><strong>${esc(task.to)}</strong><small>到达 · ${esc(task.arrival)}</small></p></div>
  </div>
  </div>
  <div class="chat-task-result-passenger"><span>${esc(task.passenger)}</span><span>${esc(task.party)}</span></div>
  <div class="chat-task-result-record"><p>${esc(task.record)}</p></div>
 </article>`;
}
function festivalConversation(){
 const owner=reviewConversation||aiTask;
 return owner?{owner,messages:reviewConversation?reviewConversation.messages:histories.get(owner.id)}:null;
}
function prepareFestivalService(type){
 const conversation=festivalConversation();if(!conversation||!festivalServiceTypes[type])return;
 const {owner,messages}=conversation;owner.festivalDrafts??={};
 if(owner.festivalDrafts[type])return;
 const draft=createFestivalService(owner,type);owner.festivalDrafts[type]=draft;
 messages.push({role:'user',text:`先帮我整理${festivalServiceTypes[type]}的服务卡片。`});
 conversationScrollState(owner).following=true;
 queueAIReply(messages,`我把${festivalServiceTypes[type]}整理好了，点开卡片看看接送范围和费用，合适的话就发布到主页。`,owner,false,{kind:'festival-preview',festivalType:type});
 renderAI();
}
function publishFestivalService(type){
 const conversation=festivalConversation();if(!conversation)return;
 const {owner,messages}=conversation,draft=owner.festivalDrafts?.[type];
 if(!draft||draft.published||!messages.some(m=>m.kind==='festival-preview'&&m.festivalType===type&&!m.streaming))return;
 draft.published=true;
 const service={...businessServiceData(draft),content:draft.route+'\n'+draft.details,location:'贵阳及大地指纹音乐节接送范围'};
 if(!services.some(item=>item.id===service.id))services.unshift(service);
 renderProfile();
 messages.push({role:'user',text:`把这项${festivalServiceTypes[type]}服务发布到主页吧。`});
 conversationScrollState(owner).following=true;
 queueAIReply(messages,'已发布服务到主页。',owner,false,{kind:'festival-published',festivalType:type});
 renderAI();
}
document.addEventListener('click',event=>{
 if(activeTab!=='ai'||open)return;
 const create=event.target.closest('[data-festival-create]');if(create){prepareFestivalService(create.dataset.festivalCreate);return;}
 const publish=event.target.closest('[data-festival-publish]');if(publish){publishFestivalService(publish.dataset.festivalPublish);return;}
 const detail=event.target.closest('[data-festival-service-detail]');if(detail){
  const owner=festivalConversation()?.owner,draft=Object.values(owner?.festivalDrafts||{}).find(item=>item.id===detail.dataset.festivalServiceDetail);
  if(draft)showBusinessServiceDetail({...draft,pricing:draft.pricing+'\n'+draft.bookingNotes});
 }
});
