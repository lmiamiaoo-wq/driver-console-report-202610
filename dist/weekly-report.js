// Independent weekly demo data; not derived from the monthly dashboard.
const weeklyIncomeDemo={days:[680,920,680,1280,960,1680,1080],orders:13,positiveRate:100};
function weeklyReportMarkup(owner){
 const {days,orders,positiveRate}=weeklyIncomeDemo,total=days.reduce((sum,value)=>sum+value,0),max=2000;
 return `<div class="message ai"><div class="bubble weekly-report"><div class="weekly-report-heading"><h3>上周收入周报</h3></div><div class="weekly-report-metrics"><div><span>收入</span><strong><small>¥</small>${total.toLocaleString('zh-CN')}</strong></div><div><span>完成订单</span><strong>${orders}<small>单</small></strong></div><div><span>好评率</span><strong>${positiveRate}<small>%</small></strong></div></div><div class="weekly-chart-heading">每日收入<span>单位：元</span></div><div class="weekly-income-chart" role="img" aria-label="上周每日收入：${days.map((value,i)=>`周${'一二三四五六日'[i]}${value}元`).join('，')}"><div class="weekly-chart-axis" aria-hidden="true"><span>2,000</span><span>1,000</span><span>0</span></div><div class="weekly-chart-bars" aria-hidden="true">${days.map((value,i)=>`<div class="weekly-chart-column"><div class="weekly-chart-track"><div class="weekly-chart-bar" style="height:${value/max*100}%"><b>${value.toLocaleString('zh-CN')}</b></div></div><span>周${'一二三四五六日'[i]}</span></div>`).join('')}</div></div><p class="weekly-report-advice">周六咨询量是平时的两倍，建议上架<strong>【半日包车】</strong>填满空档。</p></div></div>${!owner.halfdayDraft?'<div class="agent-card-shortcuts"><button type="button" data-halfday-create>上架半日包车服务 <span aria-hidden="true">↗</span></button></div>':''}`;
}
function renderWeeklyMessage(message,owner){
 if(message.kind==='weekly-report')return weeklyReportMarkup(owner);
 if(message.kind!=='halfday-preview')return '';
 const draft=owner.halfdayDraft;
 return `<div class="message ai"><div class="bubble">${esc(message.text)}</div></div><div class="business-card-result">${businessServiceChatCard(draft,'halfday')}${!draft.published?'<div class="agent-card-shortcuts"><button type="button" data-halfday-publish>发布 <span aria-hidden="true">↗</span></button></div>':''}</div>`;
}
function prepareHalfdayService(){
 const conversation=festivalConversation();if(!conversation||conversation.owner.halfdayDraft)return;
 const {owner,messages}=conversation;
 owner.halfdayDraft={id:`${owner.id}-halfday`,title:'贵阳出发｜半日包车｜4小时灵活出行',detailTitle:'半日包车',price:680,priceUnit:'半天',route:'贵阳及周边半日包车，4小时起订，商务7座，适合市区游览、短途出行和行程空档。',details:'提前预约并确认人数、行李、路线与上车地点。出发前联系确认，司导按约定路线接送，途中可协商停靠。',pricing:'680元/半天，每半天4小时。超时及超出约定路线的费用需提前确认。'};
 messages.push({role:'user',text:'帮我上架半日包车服务。'});conversationScrollState(owner).following=true;
 queueAIReply(messages,'我把半日包车整理成服务卡片了，按你主页现有的680元/半天定价。点开看看服务范围和费用，确认后就可以发布。',owner,false,{kind:'halfday-preview'});renderAI();
}
function publishHalfdayService(){
 const conversation=festivalConversation();if(!conversation)return;
 const {owner,messages}=conversation,draft=owner.halfdayDraft;
 if(!draft||draft.published||!messages.some(m=>m.kind==='halfday-preview'&&!m.streaming))return;
 draft.published=true;
 if(!services.some(s=>s.id===draft.id))services.unshift({...businessServiceData(draft),type:'日包车',content:draft.route+'\n'+draft.details,location:'贵阳及周边'});
 renderProfile();messages.push({role:'user',text:'把半日包车服务发布到主页吧。'});conversationScrollState(owner).following=true;
 queueAIReply(messages,'已发布半日包车服务到主页。',owner);renderAI();
}
document.addEventListener('click',event=>{
 if(activeTab!=='ai'||open)return;
 if(event.target.closest('[data-halfday-create]')){prepareHalfdayService();return;}
 if(event.target.closest('[data-halfday-publish]')){publishHalfdayService();return;}
 if(event.target.closest('[data-halfday-service-detail]')){const draft=festivalConversation()?.owner.halfdayDraft;if(draft)showBusinessServiceDetail(draft);}
});
