const $=s=>document.querySelector(s);
const taskBackgrounds=document.createElement('div');taskBackgrounds.className='task-backgrounds';taskBackgrounds.setAttribute('aria-hidden','true');$('#app').prepend(taskBackgrounds);
const tasks=[
{id:'business-card',icon:'user',time:'接单必做',name:'领取智能体名片',customer:'',phone:'',from:'',to:'',advice:'简单介绍自己，完善服务信息，领取你的智能体名片。身份认证和开通钱包可按需完成。',actions:['简单介绍自己'],status:'待完善'},
{id:'prepare',icon:'clipboard-text',time:'今日',name:'车辆出车准备',customer:'',phone:'',from:'',to:'',advice:'当天首次出车前，请上传车辆照，并完成出车确认。',actions:['出车准备'],status:'待准备'},
{id:'day-charter',icon:'car',time:'今日',name:'按天包车订单履约',customer:'杨女士',phone:'156****4141',orderDate:'9月25日-26日',from:'贵阳北站',via:['红枫湖'],to:'阿云朵仓珍珀酒店',serviceStops:['贵阳北站南广场','红枫湖上侗下寨停车场','阿云朵仓珍珀酒店'],serviceDepartureTimes:['','19:30'],description:'2天包车第1天，贵阳北站→红枫湖→阿云朵仓珍珀酒店。',advice:'2天包车第1天，11:00去贵阳北站南广场接到乘客后出发去红枫湖上侗下寨停车场，19:30前往阿云朵仓珍珀酒店。根据当前路况，建议10:00出发',actions:['开始出发'],ready:false,status:'待出发'},
{id:'airport',icon:'car',time:'22:30',name:'机场接送',customer:'张晓雯',phone:'13566759842',from:'龙洞堡机场 T2',to:'贵阳观山湖希尔顿欢朋酒店',flight:'CZ3657',arrival:'22:10',advice:'今天22:30机场接送，游客乘坐的 CZ3657 航班预计22:10到达龙洞堡机场 T2，带了两件大行李。现在路上有点堵，建议21:55前出发。',actions:['开始出发'],ready:false,status:'待出发',price:260},
{id:'charter-confirm',icon:'calendar-check',time:'今日',name:'2天包车订单确认',customer:'杨女士',phone:'156****4141',orderDate:'9月25日-26日',from:'贵阳北站',via:['红枫湖'],to:'青岩古镇',description:'9月25日-9月26日2天包车，贵阳北站→红枫湖→青岩古镇，4位乘客，2件行李',advice:'9月25日-26日包车订单，第1天11:00贵阳北站南广场接站，游客备注有2位老人需要帮忙提行李，游玩时行李放车上。要接这个订单吗？',actions:['可以','接不了'],status:'待接单'},
{id:'trip-plan',icon:'calendar-check',time:'今日',orderTime:'9月24日起，3天2晚',name:'生成出行方案',customer:'杨女士',phone:'156****4141',from:'',to:'',description:'一家4口含2老人，3天2晚，去大地指纹音乐节、红枫湖、青岩古镇，品尝状元蹄、咖啡，9月24日开始行程',advice:'依据您可提供的服务和资源，建议您代为预订毕节大方的食宿和演出。红枫湖和青岩古镇提供按天包车服务。',actions:['生成出行方案'],status:'待规划'},
{id:'lost-hat',icon:'chat-circle-dots',time:'17:00',name:'帽子遗失询问',customer:'李女士',phone:'138****2334',from:'贵阳北站 南广场',to:'观山湖',description:'李女士询问小孩的帽子是否遗留在车上。行程：贵阳北站 南广场 → 观山湖。',advice:'17:00贵阳北站南广场到观山湖的订单中，乘客询问小孩的帽子是不是落在车上了？请检查车内后回复',actions:['是','否'],status:'待回复'},
{id:'order',icon:'receipt',time:'21:00',name:'订单改价待确认',customer:'王静怡',phone:'13900139028',from:'甲秀楼 停车场',to:'龙洞堡机场 T2',advice:'游客想把 21:00 的订单从 ¥240 调到 ¥220。这个价格可以考虑接受；如果你觉得有点低，我也可以继续帮你和游客沟通。',actions:['沟通改价'],status:'待议价',price:240,requestedPrice:220,negotiation:'new'},
];
let current=tasks[0],open=false,savedScroll=0,returnFocus=null,muted=true,recognition=null,taskSheet=false;
let conversationPage=false;let taskFromAll=false;let allTasksOpen=false;let activeTab='home',reviewConversation=null;const reviewConversations=[];
let historyConversation=false,restoring=false;const navigationStack=[];
const localDate=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const today=localDate(new Date()),tomorrowDate=new Date();tomorrowDate.setDate(tomorrowDate.getDate()+1);
tasks.forEach(t=>{t.day=t.day||today;t.firstDeparture=t.id==='airport'});
const seedNow=Date.now();
for(const [id,name,advice,done,hours] of [
 ['custom-clean','车辆内饰清洁','已完成座椅、脚垫和后备厢清洁，补齐纸巾与饮用水。',true,-3],
 ['custom-check','核对行程安排','已核对今日接送时间与车辆安排，确认各段行程没有时间冲突。',true,-2]
]){const due=new Date(seedNow+hours*3600000);tasks.push({id,name,advice,description:advice,done,day:localDate(due),time:due.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false}),dueAt:due.toISOString(),completedAt:done?new Date(due.getTime()-20*60000).toISOString():null,icon:'clipboard-text',customer:'',phone:'',from:'',to:'',actions:['整理要求'],status:done?'已完成':'逾期'})}
const histories=new Map(tasks.map(t=>[t.id,[]]));
tasks.filter(t=>t.done).forEach(t=>histories.set(t.id,[{role:'ai',text:t.description+' 已在截止时间前完成。'}]));const preparedDays=new Set();
current=tasks.find(t=>!t.done)||tasks[0];
const activeTasks=()=>tasks.filter(t=>!t.done&&!t.chatOnly);
function taskActions(t){if(t.done)return [];if(t.id==='charter-confirm')return t.actions;if(t.id==='lost-hat')return ['是','否'];if(t.id==='prepare')return [preparation.confirmed?'已完成出车准备':'已确认'];if(t.id==='order')return [t.negotiation==='agreed'?'确认接单':'沟通改价'];if(t.contactPending)return ['确认沟通'];if(t.id==='contact')return ['需沟通','确认'];if(t.flow)return flowActions(t);if(['airport','day-charter'].includes(t.id))return [preparedDays.has(t.day)?'开始出发':'去完成出车准备'];if(t.day>today)return ['联系游客'];if(t.from&&t.to&&!preparedDays.has(t.day))return ['出车准备'];return t.actions.filter(a=>a!=='出车准备'||t.id==='prepare')}
function completeTask(t,reply){if(t.done||taskHandoffPending)return;if(reply)add('ai',reply);goBack();handoffCompletedTask(t,()=>{t.done=true;t.status='已完成';t.completedAt=new Date().toISOString();renderTasks();refreshReviewSurfaces();const list=$('#task-list');savedScroll=Math.min(savedScroll,Math.max(0,list.scrollHeight-list.clientHeight));list.scrollTop=savedScroll;current=visibleTask();toast('任务已完成，已移入历史任务')})}

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const maskPhone=phone=>String(phone||'').replace(/^(\d{3})\d{4}(\d{4})$/u,'$1****$2');
function buttonLabel(text){return ({'确认沟通':'我已了解','调整价格':'沟通改价','完成行前确认':'确认完成','前往接驾点':'前往接驾','前往目的地':'开始送达'})[text]||text}
function taskActionCompleted(t,action){return t.done||(action==='联系游客'&&t.contactConfirmed)||(action==='出车准备'&&preparedDays.has(t.day))}
function card(t,compact=false){if(t.id==='trip-plan'&&compact)return `<article class="task-card" data-id="${t.id}"><h2 class="task-title"><span>${esc(t.name)}</span></h2><div class="details"><div>${esc(t.customer)} · ${esc(maskPhone(t.phone))}</div><p class="advice">${esc(t.description)}</p></div></article>`;return `<article class="task-card" data-id="${t.id}"><h2 class="task-title">${compact?'':`<img src="icons/${t.icon}.svg" alt="">`}<span>${compact&&t.id==='business-card'?'':esc(t.time)+' '}${esc(t.name)}</span></h2><div class="details">${t.id.startsWith('custom-')?'':t.id==='prepare'?`<p>上传车辆照<br>确认车况、证照与随车物品</p>`:compact?(t.customer?`<div>${esc(t.customer)} · ${esc(t.from)}</div>`:''):`<div class="customer">${esc(t.customer)}<a href="tel:${esc(t.phone)}">${esc(maskPhone(t.phone))}</a></div><p class="route">${[t.from,...(t.via||[]),t.to.replace(/机场\s+T/g,'机场T')].map(esc).join('→')}</p>`}<p class="advice">${esc(t.flow?rideStepsFor(t)[t.flowIndex].hint(t):t.contactPending?'游客已回复，请确认沟通结果':t.advice)}</p></div>${compact?'':`<div class="actions">${taskActions(t).map((a,i)=>`<button class="action ${i===taskActions(t).length-1?'primary':''}" data-task="${t.id}" data-action="${a}" ${taskActionCompleted(t,a)?'disabled':''}>${buttonLabel(a)}</button>`).join('')}</div>`}${!compact&&t.id==='order'?`<div class="task-meta">当前报价￥${t.price}</div>`:''}</article>`}
function renderTasks(){const list=$('#task-list'),position=list.scrollTop;const active=homeTasks();$('#task-summary').textContent=`今日任务，共 ${active.length} 件`;list.innerHTML=active.map((t,i)=>`<section class="task-page" aria-label="任务 ${i+1}，共 ${active.length} 项">${homeCard(t)}</section>`).join('')||'<div class="empty-tasks"><img src="icons/check-circle.svg" alt=""><h2>辛苦了，歇一歇吧</h2><p>喝口水，活动一下肩颈。<br>照顾好自己，再从容出发。</p></div>';taskBackgrounds.innerHTML=active.map(t=>`<div class="task-background-page task-tone-${homeTaskType(t)}" data-task-id="${t.id}"></div>`).join('');list.scrollTop=position; observeTicketDividers(); queueTaskMotion(); if(open)$('#context').innerHTML=card(current,true); requestAnimationFrame(()=>speakVisibleTask()); }
// Cut through both glass layers so the ticket notches reveal the page background.
const ticketDividerObserver=new ResizeObserver(entries=>{
 const cards=new Set(entries.map(entry=>entry.target.closest('.task-card')));
 cards.forEach(updateTicketCutouts);
});
function updateTicketCutouts(card){
 const divider=card?.querySelector('.ticket-divider');
 if(!divider)return;
 const body=card.querySelector('.home-card-body'),line=divider.getBoundingClientRect();
 const center=line.top+line.height/2;
 [card,body].forEach(surface=>{
  const rect=surface.getBoundingClientRect(),width=rect.width,height=rect.height,y=center-rect.top;
  if(!width||!height)return;
  const circle=(x,r)=>`M ${x-r} ${y} a ${r} ${r} 0 1 0 ${r*2} 0 a ${r} ${r} 0 1 0 ${-r*2} 0 Z`;
  const count=Math.floor((width-40)/7),start=(width-(count-1)*7)/2;
  let holes=circle(0,8)+circle(width,8);
  for(let i=0;i<count;i++)holes+=circle(start+i*7,1.25);
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><path fill="white" fill-rule="evenodd" d="M 0 0 H ${width} V ${height} H 0 Z ${holes}"/></svg>`;
  surface.style.setProperty('--ticket-mask',`url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
 });
}
function observeTicketDividers(){
 ticketDividerObserver.disconnect();
 $('#task-list').querySelectorAll('.ticket-divider').forEach(divider=>{
  const card=divider.closest('.task-card'),body=card.querySelector('.home-card-body');
  ticketDividerObserver.observe(body);
  ticketDividerObserver.observe(divider.closest('.details'));
  body.addEventListener('scroll',()=>updateTicketCutouts(card),{passive:true});
  updateTicketCutouts(card);
 });
}
// Keep keyboard focus on the task currently filling the viewport.
let taskMotionFrame=0;
function queueTaskMotion(){if(taskMotionFrame)return;taskMotionFrame=requestAnimationFrame(()=>{taskMotionFrame=0;const list=$('#task-list'),phone=$('#app'),workspace=$('.workspace');if(activeTab==='home'&&!open){phone.style.setProperty('--task-top-inset',`${workspace.offsetTop}px`);phone.style.setProperty('--task-bottom-inset',`${phone.clientHeight-workspace.offsetTop-workspace.clientHeight}px`)}const height=list.clientHeight;if(!height)return;const progress=list.scrollTop/height,activeIndex=Math.round(progress),phoneHeight=phone.clientHeight;taskBackgrounds.style.setProperty('--background-page-height',`${height}px`);taskBackgrounds.style.setProperty('--background-last-page-height',`${phoneHeight}px`);taskBackgrounds.style.transform=`translate3d(0,${-list.scrollTop}px,0)`;$('#app').dataset.taskTone=homeTaskType(homeTasks()[activeIndex]);list.querySelectorAll('.task-page').forEach((page,index)=>{page.inert=index!==activeIndex;page.setAttribute('aria-hidden',String(index!==activeIndex))})})}
$('#task-list').addEventListener('scroll',queueTaskMotion,{passive:true});
let narrationTimer,taskNarrationAudio=null,lastNarratedTaskId=null;
const lastNarratedAdvice=new Map();
function stopTaskNarration(){if(taskNarrationAudio){taskNarrationAudio.pause();taskNarrationAudio.currentTime=0}if('speechSynthesis'in window)speechSynthesis.cancel()}
function taskAudioSource(t){if(t.id!=='order')return ['prepare','airport','contact'].includes(t.id)?`audio/tasks/${t.id}.m4a`:'';if(t.negotiation==='agreed')return `audio/tasks/order-${t.price}.m4a`;return t.insistedOriginal?'audio/tasks/order-waiting.m4a':'audio/tasks/order-new.m4a'}
function visibleTaskAdvice(t){
 let advice=t.id==='prepare'?preparationCardAdvice():t.id==='order'?homeOrderHint(t):t.flow?rideStepsFor(t)[t.flowIndex].hint(t):t.contactPending?'游客已回复，请确认沟通结果':t.advice;
 const orderTime=t.orderDate||t.orderTime||t.time;
 if(!(t.flow&&['airport','day-charter'].includes(t.id))&&homeTaskType(t)!=='compliance'&&orderTime&&!advice.includes(orderTime))advice=`${orderTime}，${advice}`;
 return taskPrompt(advice,t);
}
function speakVisibleTask(force=false){if(muted||open||activeTab!=='home'||$('#utility').open||$('#history-drawer').open)return;const list=$('#task-list'),index=Math.round(list.scrollTop/Math.max(1,list.clientHeight)),t=homeTasks()[index];if(!t)return;const hint=visibleTaskAdvice(t),changedTask=t.id!==lastNarratedTaskId;if(!changedTask&&!force&&lastNarratedAdvice.get(t.id)===hint)return;stopTaskNarration();lastNarratedTaskId=t.id;lastNarratedAdvice.set(t.id,hint);if('speechSynthesis'in window){const details=t.id==='trip-plan'?t.description:t.id==='prepare'?'上传车辆照，确认车况、证照与随车物品':`从${t.from}到${t.to}`;const content=changedTask?`${t.time}，${t.name}。${details}。${hint}`:hint;const utterance=new SpeechSynthesisUtterance(content);utterance.lang='zh-CN';speechSynthesis.speak(utterance);return}if(changedTask){const source=!t.flow&&!t.contactPending&&t.id!=='order'?taskAudioSource(t):'';if(source){taskNarrationAudio=new Audio(source);taskNarrationAudio.play().catch(()=>toast('当前浏览器未能播放语音'))}}}
$('#task-list').addEventListener('scroll',()=>{if(open||activeTab!=='home')return;const list=$('#task-list'),t=homeTasks()[Math.round(list.scrollTop/Math.max(1,list.clientHeight))];if(t?.id!==lastNarratedTaskId){stopTaskNarration();lastNarratedTaskId=null}clearTimeout(narrationTimer);narrationTimer=setTimeout(()=>speakVisibleTask(),240)},{passive:true});
new ResizeObserver(queueTaskMotion).observe($('#task-list'));
function visibleTask(){const list=$('#task-list'),r=list.getBoundingClientRect();let best=activeTasks()[0],area=-1;list.querySelectorAll('.task-card').forEach(el=>{let b=el.getBoundingClientRect(),n=Math.max(0,Math.min(b.bottom,r.bottom)-Math.max(b.top,r.top));if(n>area){area=n;best=tasks.find(t=>t.id===el.dataset.id)}});return best}
function showTask(t=current,sheet=activeTab==='home'&&!allTasksOpen&&!['business-card','trip-plan'].includes(t?.id)){stopTaskNarration();if(t?.id==='prepare'){if(t.done)utility('出车准备记录',preparationRecordBody());else openPreparation();return}if(!t){openNewTask();return}if(!restoring&&(!open||current?.id!==t.id||$('#utility').open||$('#history-drawer').open))rememberPage();if(!open)savedScroll=$('#task-list').scrollTop;taskFromAll=allTasksOpen;taskSheet=sheet&&activeTab==='home';$('#history-drawer').close();$('#utility').close();allTasksOpen=false;allTasksPage.hidden=true;$('#app').classList.remove('secondary-page');reviewSection.hidden=true;aiSection.hidden=true;$('#task-list').hidden=!taskSheet;$('#task-summary').hidden=true;returnFocus=document.activeElement;open=true;conversationPage=!taskSheet;$('#task-list').inert=true;$('#chat').inert=false;$('#context').hidden=taskSheet;$('#context').inert=taskSheet;$('#app').classList.add('processing');$('#app').classList.toggle('task-chat-sheet',taskSheet);if(current?.id!==t.id){$('#input').value='';updateSend()}current=t;if(!taskSheet)$('#context').innerHTML=card(t,true);renderMessages();updateHeader();syncOverlay()}
function closeChat(){if(!open)return;open=false;conversationPage=false;taskSheet=false;taskFromAll=false;historyConversation=false;$('#input').value='';updateSend();$('#input').blur();recognition?.stop();$('#app').classList.remove('processing','task-chat-sheet');$('#task-list').style.removeProperty('height');$('#context').inert=true;$('#context').hidden=true;$('#chat').inert=true;$('#task-list').inert=false;$('#task-list').scrollTop=savedScroll;updateHeader()}
const simulatedReplyDelay=2000;
// Follow new text only while the reader stays at the conversation bottom.
const conversationScrollStates=new WeakMap(),conversationScrollOwners=new WeakMap();
function conversationScrollState(owner){
 if(!conversationScrollStates.has(owner))conversationScrollStates.set(owner,{following:true,top:0});
 return conversationScrollStates.get(owner);
}
function bindConversationScroll(scroller,owner){
 if(!scroller)return;
 const alreadyBound=conversationScrollOwners.has(scroller);conversationScrollOwners.set(scroller,owner);
 if(alreadyBound)return;
 const state=()=>conversationScrollState(conversationScrollOwners.get(scroller));
 scroller.addEventListener('wheel',e=>{if(e.deltaY<0)state().following=false},{passive:true});
 let touchY=null;
 scroller.addEventListener('touchstart',e=>{touchY=e.touches[0]?.clientY??null},{passive:true});
 scroller.addEventListener('touchmove',e=>{const y=e.touches[0]?.clientY;if(touchY!==null&&y>touchY+2)state().following=false;touchY=y},{passive:true});
 scroller.addEventListener('keydown',e=>{if(!e.target.closest('input,textarea')&&(['ArrowUp','PageUp','Home'].includes(e.key)||(e.key===' '&&e.shiftKey)))state().following=false});
 scroller.addEventListener('scroll',()=>{
  const current=state(),top=scroller.scrollTop;
  if(top<current.top-1)current.following=false;
  else if(scroller.scrollHeight-scroller.clientHeight-top<=24)current.following=true;
  current.top=top;
 },{passive:true});
}
function setConversationScroll(scroller,state,top){scroller.scrollTop=top;state.top=scroller.scrollTop;}

// Keep complete messages in history; only their visible prefix is rendered while streaming.
function streamReply(message,refresh){
 const chars=Array.from(message.text||'');
 message.streaming=true;message.visibleText='';
 let started=null,shown=0;
 refresh();
 const frame=now=>{
  started??=now;
  const count=Math.min(chars.length,Math.floor((now-started)/24)+1);
  const changed=count!==shown;
  if(changed){shown=count;message.visibleText=chars.slice(0,count).join('');}
  if(count>=chars.length){message.streaming=false;message.streamed=true;delete message.visibleText;refresh();return;}
  if(changed)refresh();requestAnimationFrame(frame);
 };
 requestAnimationFrame(frame);
}
function taskReplyRefresh(task){if(open&&current===task&&!$('#utility').open)renderMessages()}

function add(role,text,kind='',extra=null){
 const task=current,messages=histories.get(task.id),message={role,text,kind,extra};
 if(role==='user'){message.sentAt=Date.now();conversationScrollState(task).following=true;}
 const previousUser=messages.findLast(m=>m.role==='user');
 const delay=role==='ai'&&previousUser?.sentAt?Math.max(0,simulatedReplyDelay-(Date.now()-previousUser.sentAt)):0;
 const deliver=()=>{messages.push(message);if(role==='ai'){streamReply(message,()=>taskReplyRefresh(task));if(open&&current===task&&!muted&&'speechSynthesis'in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='zh-CN';speechSynthesis.speak(u)}}else taskReplyRefresh(task)};
 if(delay)setTimeout(deliver,delay);else deliver();
}
function contactDraft(t){
const drafts={
airport:{summary:'我已经整理好这次需要确认的重点：到达出口，以及是否需要儿童座椅。可直接发送：',draft:'张晓雯您好，我是今天接您的司机。看到您乘坐 CZ3657 航班，预计 14:10 抵达 T2，携带两件大行李。请问落地后从哪个出口出来？是否需要儿童座椅？'},
contact:{summary:'我已经整理好这次需要确认的重点：贵阳北站的碰面位置、到站时间，以及两件大行李的尺寸。可直接发送：',draft:'李明轩您好，我是今天接您去青岩古镇的司机。想和您确认一下到站时间，我们在贵阳北站南广场哪里碰面？另外两件大行李大概多大，方便我提前安排后备厢。'},
order:{summary:'我已经整理好这次需要确认的重点：甲秀楼的上车位置、两位游客是否同时出发，以及航班起飞时间。可直接发送：',draft:'王静怡您好，我是今天送您去龙洞堡机场的司机。想和您确认一下，21:00 在甲秀楼停车场的哪个位置接您？两位游客是否一起上车，航班是几点起飞？'},
tour:{summary:'我已经整理好这次需要确认的重点：明天的上车位置、老人和儿童的乘车需求，以及休息与用餐安排。可直接发送：',draft:'陈志远您好，我是明天黄果树一日游的司机。我们约好 08:30 从观山湖区出发，方便发一下具体上车位置吗？同行老人和孩子是否有需要特别照顾的地方，用餐和途中休息有什么偏好？'}
};return {...(drafts[t.id]||{summary:'我已经根据这次任务整理好沟通内容，可直接发送：',draft:`${t.customer}您好，我是这次行程的司机。想和您确认一下${t.time}在${t.from}的上车安排，以及需要提前准备的物品。`}),customer:t.customer,phone:t.phone,sent:false}}
function contactCard(m,i){return `<div class="contact-draft">${esc(m.extra.draft)}</div><div class="contact-actions"><button class="contact-send" data-send-contact="${i}" ${m.extra.sent||current.done?'disabled':''}>${m.extra.sent?'已发送':'确认发送'}</button></div>`}
function renderMessages(){const scroller=['business-card','trip-plan'].includes(current.id)?$('.workspace'):$('#messages'),scrollState=conversationScrollState(current),previousTop=scroller.scrollTop;bindConversationScroll(scroller,current);const msgs=histories.get(current.id);if(!msgs.some(m=>m.kind==='task-intro')){const intro={role:'ai',text:taskOpening(current),kind:'task-intro',extra:taskActions(current)};if(current.id==='trip-plan'){const task=current;intro.pendingReply=true;msgs.unshift({role:'user',text:'先按9月24日—9月26日安排一版3天2晚方案',kind:'trip-initial-request'},intro);setTimeout(()=>{intro.pendingReply=false;streamReply(intro,()=>taskReplyRefresh(task))},simulatedReplyDelay)}else msgs.unshift(intro);}$('#messages').innerHTML=msgs.length?msgs.map((original,i)=>{if(original.pendingReply)return '';const m=original.streaming?{...original,text:original.visibleText,kind:original.kind?.startsWith('business-')?'business-stream':'streaming'}:original;return current.id==='trip-plan'?tripConversationMessage(m,current,i,msgs):m.kind?.startsWith('business-')?businessCardMessage(m,current,i):`<div class="message ${m.role}" data-message-index="${i}"><div class="bubble ">${esc((m.role==='ai'?taskPrompt(m.text,current):m.text).replace('可直接发送：',''))}${m.kind==='task-intro'?introActions(m,msgs):m.kind==='next-actions'?taskChatActions(current,i===msgs.length-1):m.kind==='contact'?`</div></div><div class="message ai"><div class="bubble contact-card"><div class="draft-label">可直接发送</div>${contactCard(m,i)}`:m.kind==='negotiation'?negotiationMessage(m):m.kind==='confirmation'?`<button class="flow-next" data-command="我已了解" ${current.contactPending&&!current.done&&!m.used?'':'disabled'}>${current.contactPending&&!current.done&&!m.used?'我已了解':'已了解'}</button>`:m.kind==='flow'?flowMessage(m):m.kind==='ready'?`<button class="flow-next" data-command="出车准备" ${preparedDays.has(current.day)||current.done?'disabled':''}>${preparedDays.has(current.day)?'已完成':'出车检查'}</button>`:m.kind==='depart'?`<button class="flow-next" data-command="开始出发" ${m.used||current.flow||current.done?'disabled':''}>${m.used||current.flow?'已出发':'开始出发'}</button>`:m.kind==='call'?`<a href="tel:${esc(current.phone)}">拨打 ${esc(maskPhone(current.phone))}</a>`:m.kind==='clarify'?tasks.filter(t=>t.customer==='陈志远'&&t.id!=='prepare').map(t=>`<button data-resolve="${t.id}" data-message="${esc(m.extra)}">${t.time} ${t.customer} · ${t.name}</button>`).join(''):''}</div></div>`}).join(''):'';$('#messages').setAttribute('aria-busy',String(msgs.some(m=>m.streaming||m.pendingReply)));if(!scrollState.following)setConversationScroll(scroller,scrollState,previousTop);const renderedTask=current;requestAnimationFrame(()=>{if(!open||current!==renderedTask||$('#utility').open||!scrollState.following)return;setConversationScroll(scroller,scrollState,current.id==='trip-plan'&&!msgs.some(m=>m.streaming||m.streamed||(m.role==='user'&&m.kind!=='trip-initial-request'))?0:scroller.scrollHeight)});scheduleBusinessDemo(current)}
// Start simulated AI replies two seconds after driver input.
function scheduleBusinessDemo(t){
 if(t?.id!=='business-card'||t.demoTimer||!open||current!==t||$('#utility').open||(histories.get(t.id)||[]).some(m=>m.streaming))return;
 if(!['reply-pending','awaiting-photo','preview-pending','publish-pending','service-question-pending','service-price-pending','service-details-pending','service-preview-pending','service-saved-pending'].includes(t.cardStage))return;
 const stage=t.cardStage;
 t.demoTimer=setTimeout(()=>{
  t.demoTimer=null;
  if(!open||current!==t||$('#utility').open||t.cardStage!==stage)return;
  if(stage.startsWith('service-')){advanceBusinessService(t,stage);return}
  if(stage==='reply-pending'){
   t.cardStage=t.cardAvatar?'preview':'awaiting-photo';
   add('ai',t.cardAvatar?'介绍已经帮你更新好了，看看这样写是否合适。':'了解了，我来把这些经历整理成介绍。再补一张个人头像，就可以帮你做好名片了。',t.cardAvatar?'business-card-preview':'business-avatar-request');
  }else if(stage==='awaiting-photo'){
   receiveBusinessAvatar(t,'images/agent-avatar.png');
  }else if(stage==='preview-pending'){
   t.cardStage='preview';
   add('ai','名片做好了，我把你的介绍润色了一下，看看是不是你想表达的。你可以继续添加服务或商品，觉得合适就确认发布。','business-card-preview');
  }else{
   t.cardStage='published';
   add('ai','智能体名片已发布。');
  }
 },stage==='awaiting-photo'?5000:simulatedReplyDelay);
}
function receiveBusinessAvatar(t,photo){
 clearTimeout(t.demoTimer);t.demoTimer=null;
 if(t.cardAvatar?.startsWith('blob:'))URL.revokeObjectURL(t.cardAvatar);
 t.cardAvatar=photo;t.cardStage='preview-pending';
 histories.get(t.id).push({role:'user',text:'',kind:'business-avatar',extra:photo});
 if(open&&current===t)renderMessages();
}
function respondBusinessCard(text,t){
 if(t.serviceFlow&&t.serviceFlow.stage!=='saved'){respondBusinessService(text,t);return}
 if(t.cardPublished){add('ai','智能体名片已发布，你可以继续查看名片和已添加的服务、商品。');return}
 clearTimeout(t.demoTimer);t.demoTimer=null;
 t.introductionNotes=t.introductionNotes||[];
 t.introductionNotes.push(text);
 t.cardStage='reply-pending';
 scheduleBusinessDemo(t);
}
function polishBusinessIntroduction(t){
 return (t.introductionNotes||[]).map(note=>note.trim()
  .replace(/开商务车\s*(\d+)\s*年了[，,]?/, '拥有 $1 年商务车驾驶经验，')
  .replace(/主要跑市区到青岩古镇这条线[，,]?/, '主要提供市区往返青岩古镇的接送服务，')
  .replace(/英语满足日常交流需求/, '可使用英语进行日常交流')
  .replace(/[，,。]+$/, '')+'。').join('\n');
}
function businessShortcut(action,label,disabled=false){
 return `<button type="button" data-business-action="${action}" ${disabled?'disabled':''}>${esc(label)}<img src="icons/arrow-up-right.svg" alt=""></button>`;
}
function businessCardActions(t){
 if(t.cardPublished)return '';
 return `<div class="agent-card-shortcuts">${businessShortcut('service','添加服务')}${businessShortcut('product','添加商品')}${businessShortcut('publish','确认发布')}</div>`;
}
function dismissBusinessShortcuts(){
 if(!open||current?.id!=='business-card'||!$('#input').value.trim())return;
 for(const message of histories.get(current.id)||[])message.shortcutsDismissed=true;
 $('#messages').querySelectorAll('.agent-card-shortcuts').forEach(el=>el.remove());
}
function businessCardPreview(t,showActions=true){
 const name=typeof profileInfo!=='undefined'?profileInfo.name:'我的智能体名片';
 const bio=polishBusinessIntroduction(t);
 return `<article class="agent-card-preview" aria-label="智能体名片预览"><img class="agent-card-cover" src="images/agent-waterfall.jpg" alt="瀑布风景"><div class="agent-card-copy"><img class="agent-card-avatar" src="${esc(t.cardAvatar)}" alt="${esc(name)}的头像"><h3>${esc(name)}</h3><p class="agent-card-role">贵旅出行·文旅推荐官</p><div class="agent-card-tags"><span>商务7座</span><span>5年驾龄</span></div><p class="agent-card-bio">${esc(bio)}</p>${t.cardItems?.length?`<div class="agent-card-items">${t.cardItems.map(item=>`<div><span>${esc(item.type)} · ${esc(item.title)}</span><strong>¥${esc(item.price)}</strong></div>`).join('')}</div>`:''}</div></article>${showActions?businessCardActions(t):''}`;
}
const businessServiceExamples={
 route:'贵阳市区到青岩古镇单程接送，商务7座，最多坐6位乘客，市区酒店可以上门接。',
 price:'单程260元，包含司机、油费和过路费，停车费按实际收取，不含景区门票。',
 details:'提前一天预约，出发前联系确认时间和上车地点，酒店接上后直达青岩古镇。车上备有饮用水、纸巾和充电线，也能用英语日常交流。'
};
function startBusinessService(t,editing=false){
 if(t.cardPublished)return;
 if(!editing&&t.serviceFlow&&t.serviceFlow.stage!=='saved')return;
 const previous=editing?t.serviceFlow?.draft:null;
 t.serviceFlow={stage:'pending',editing,draft:previous?{...previous,id:'service-'+Date.now()}:{id:'service-'+Date.now(),title:'贵阳市区 → 青岩古镇 · 商务车接送'}};
 t.cardStage='service-question-pending';
 add('user',editing?'我想修改这项服务':'添加服务');scheduleBusinessDemo(t);
}
function advanceBusinessService(t,stage){
 const flow=t.serviceFlow;if(!flow)return;
 t.cardStage='service-chat';
 if(stage==='service-question-pending'){
  flow.stage=flow.editing?'edit':'route';add('ai',flow.editing?'你想修改这项服务的哪些内容？直接告诉我就好，比如接送范围、价格，或预约和服务安排。':'就从你熟悉的市区到青岩古镇接送开始吧。是单程还是往返？能接几位乘客，市区酒店可以上门接吗？','business-service-question');
 }else if(stage==='service-price-pending'){
  flow.stage='price';add('ai','好，接送范围记下了。这项服务准备收多少钱？也说说费用包含什么，哪些需要另外付，游客下单前就能看清楚。','business-service-question');
 }else if(stage==='service-details-pending'){
  flow.stage='details';add('ai','价格和费用说明有了。最后聊聊怎么预约、怎么接送，以及车上准备了哪些用品，我一起写进服务介绍。','business-service-question');
 }else if(stage==='service-preview-pending'){
  flow.stage='preview';add('ai',flow.editing?'已按你的要求更新服务，看看这版是否合适。':'我把刚才的信息整理成服务卡片了。看看接送范围、价格和流程是否准确，合适就添加到名片里。','business-service-preview',{...flow.draft});
 }else{
  flow.stage='saved';t.cardStage='preview';add('ai','已添加到名片主页','business-service-saved');
 }
}
function respondBusinessService(text,t){
 const flow=t.serviceFlow;if(!flow||!['route','price','details','edit'].includes(flow.stage))return;
 if(flow.stage==='edit'){
  const clauses=text.split(/[。；;\n]/).map(x=>x.trim()).filter(Boolean);
  for(const clause of clauses){
   const amount=clause.match(/(?:¥|￥)\s*(\d+(?:\.\d{1,2})?)|(?:价格|单程|往返|收费|改为|改成)?\s*(\d+(?:\.\d{1,2})?)\s*元/);
   if(amount&&!/停车|过路|夜间|等待/.test(clause)&&Number(amount[1]||amount[2])>0){
    const price=Number(amount[1]||amount[2]);flow.draft.pricing=(flow.draft.pricing||'').replace(new RegExp(String(flow.draft.price)+'(?=\\s*元)'),String(price));flow.draft.price=price;
   }else if(/价格|费用|收费|停车|过路|包含|不含/.test(clause))flow.draft.pricing+='\n'+clause;
   else if(/接送|单程|往返|乘客|人数|座|酒店|路线|范围/.test(clause))flow.draft.route+='\n调整：'+clause;
   else flow.draft.details+='\n'+clause;
  }
  flow.stage='pending';t.cardStage='service-preview-pending';scheduleBusinessDemo(t);return;
 }
 if(flow.stage==='price'){
  const match=text.match(/(?:¥|￥)\s*(\d+(?:\.\d{1,2})?)|(?:单程|价格|收费)?\s*(\d+(?:\.\d{1,2})?)\s*元/);
  const price=Number(match?.[1]||match?.[2]||(/^\d+(?:\.\d{1,2})?$/.test(text.trim())?text.trim():NaN));
  if(!Number.isFinite(price)||price<=0){t.cardStage='service-price-pending';flow.stage='pending';scheduleBusinessDemo(t);return}
  flow.draft.price=price;
 }
 const step=flow.stage;flow.draft[step==='price'?'pricing':step]=text;
 flow.stage='pending';t.cardStage=step==='route'?'service-price-pending':step==='price'?'service-details-pending':'service-preview-pending';
 scheduleBusinessDemo(t);
}
function businessServiceData(draft){
 return {id:draft.id,type:'点对点包车',title:draft.title,content:draft.route,price:draft.price,image:'images/service-transfer.png',pricing:draft.pricing,details:draft.details,priceUnit:draft.priceUnit,priceFrom:draft.priceFrom};
}
function businessServiceCard(t,draft,showActions=true){
 const saved=t.cardItems?.some(item=>item.id===draft.id),active=t.serviceFlow?.draft.id===draft.id&&t.serviceFlow.stage==='preview';
 return `<div class="business-service-list">${businessServiceChatCard(draft)}</div>${showActions&&!saved&&active?`<div class="agent-card-shortcuts">${businessShortcut('save-service','添加到名片')}${businessShortcut('edit-service','修改服务')}</div>`:''}`;
}
function businessServiceChatCard(draft,context='business'){
 return `<button class="business-chat-service" data-${context}-service-detail="${esc(draft.id)}" aria-label="查看服务详情：${esc(draft.title)}"><img src="images/service-transfer.png" alt="商务接送车辆"><span><strong>${esc(draft.title)}</strong><small>${esc(draft.route)}</small><b><small>¥</small>${Number(draft.price).toLocaleString('zh-CN')}<small>/${esc(draft.priceUnit||'次')}${draft.priceFrom?' 起':''}</small></b></span></button>`;
}
function showBusinessServiceDetail(draft){
 const sentences=(draft.details||'').split(/[。\n]/).map(x=>x.trim()).filter(Boolean);
 const clauses=sentences.flatMap(x=>x.split('，'));
 const notices=clauses.filter(x=>/预约|提前/.test(x)),process=clauses.filter(x=>!/预约|提前/.test(x)&&/确认|接上|直达|接送/.test(x));
 const list=items=>`<ul>${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
 utility(draft.detailTitle||'定点接送',`<article class="business-transfer-detail"><img class="business-service-cover" src="images/service-transfer.png" alt="商务接送车辆"><section class="business-service-intro"><p class="business-service-price"><small>￥</small>${esc(draft.price)}<small>/${esc(draft.priceUnit||'次')}${draft.priceFrom?' 起':''}</small></p><h1>${esc(draft.title)}</h1></section><div class="business-service-divider"></div><section><h2>服务描述</h2><p>${esc(draft.route)}</p>${list(sentences.filter(x=>!/预约|提前|确认|接上|直达|接送/.test(x)))}</section>${notices.length?`<section><h2>下单须知</h2>${list(notices)}</section>`:''}${process.length?`<section><h2>包车流程</h2>${list(process)}</section>`:''}<section><h2>计费方式</h2><p>${esc(draft.detailTitle||'点对点接送')} · ${esc(draft.price)} 元/${esc(draft.priceUnit||'次')}${draft.priceFrom?'起':''}</p></section><section><h2>费用说明</h2>${list((draft.pricing||'').split(/[。\n]/).filter(Boolean))}</section></article>`);
 $('#utility').classList.add('profile-detail','business-service-detail');$('#utility-body').scrollTop=0;$('#utility-close').focus();
}
function businessCardMessage(m,t,index){
 const text=m.text?`<p class="business-message-text">${esc(m.text)}</p>`:'';
 const showActions=!m.shortcutsDismissed&&index===histories.get(t.id).length-1;
 if(m.kind==='business-avatar')return `<div class="message user business-avatar-message" data-message-index="${index}"><img class="chat-avatar-photo" src="${esc(m.extra)}" alt="已补充的个人头像"></div>`;
 if(m.kind==='business-service-preview')return `<div class="message ai" data-message-index="${index}"><div class="bubble business-message">${text}</div></div><div class="business-card-result">${businessServiceCard(t,m.extra,showActions)}</div>`;
 if(m.kind==='business-card-preview')return `<div class="message ai" data-message-index="${index}"><div class="bubble business-message">${text}</div></div><div class="business-card-result">${businessCardPreview(t,showActions)}</div>`;
 if(m.kind==='business-service-saved')return `<div class="message ai" data-message-index="${index}"><div class="bubble business-message">${text}</div></div>${showActions?businessCardActions(t):''}`;
 return `<div class="message ${m.role}" data-message-index="${index}"><div class="bubble business-message">${text}</div></div>`;
}
$('#messages').addEventListener('click',e=>{
 const detail=e.target.closest('[data-business-service-detail]');
 if(detail){const draft=(histories.get(current.id)||[]).find(m=>m.kind==='business-service-preview'&&m.extra.id===detail.dataset.businessServiceDetail)?.extra;if(draft)showBusinessServiceDetail(draft);return}
 const button=e.target.closest('[data-business-action]');if(!button||button.disabled)return;
 const t=current;if(t.id!=='business-card'||!t.cardAvatar||t.cardPublished)return;
 const action=button.dataset.businessAction;
 if(action==='service'||action==='edit-service'){startBusinessService(t,action==='edit-service');return}
 if(action==='save-service'){
  const flow=t.serviceFlow;if(flow?.stage!=='preview')return;
  t.cardItems=t.cardItems||[];
  if(!t.cardItems.some(item=>item.id===flow.draft.id))t.cardItems.push({...flow.draft,type:'服务',description:flow.draft.details});
  if(!services.some(service=>service.id===flow.draft.id))services.push(businessServiceData(flow.draft));
  flow.stage='pending';t.cardStage='service-saved-pending';add('user','添加到名片');scheduleBusinessDemo(t);return;
 }

 if(button.dataset.businessAction==='publish'){
  t.cardPublished=true;t.done=true;t.status='已发布';t.completedAt=new Date().toISOString();
  t.cardStage='publish-pending';renderMessages();renderTasks();refreshReviewSurfaces();return;
 }
 const type=button.dataset.businessAction==='service'?'服务':'商品';
 utility(`添加${type}`,`<form id="business-item-form" class="business-item-form" data-task-id="${t.id}" data-item-type="${type}"><label>${type}名称<input name="title" required maxlength="40" placeholder="请输入${type}名称"></label><label>${type}内容<textarea name="description" required rows="4" placeholder="${type==='服务'?'服务内容、流程、设施环境':'商品介绍、规格与交付方式'}"></textarea></label><label>价格（元）<input name="price" type="number" min="0.01" step="0.01" required placeholder="请输入价格"></label><button class="new-task" type="submit">添加到名片</button></form>`);
});
function fillBusinessItemExample(e){
 const input=e.target,form=input.closest('#business-item-form');
 if(!form||!['INPUT','TEXTAREA'].includes(input.tagName)||input.value.trim())return;
 const sample=form.dataset.itemType==='服务'?{title:'贵阳市区至青岩古镇商务车接送',description:'市区接驾，前往青岩古镇；提供日常英语交流，车内整洁舒适。',price:'260'}:{title:'青岩古镇出游伴手礼',description:'当地特色伴手礼一份，行程结束时交付。',price:'68'};
 input.value=sample[input.name]||'';
}
$('#utility-body').addEventListener('focusin',fillBusinessItemExample);
$('#utility-body').addEventListener('click',fillBusinessItemExample);
$('#utility-body').addEventListener('submit',e=>{
 const form=e.target;if(form.id!=='business-item-form')return;e.preventDefault();
 const t=tasks.find(task=>task.id===form.dataset.taskId);if(!t||t.cardPublished)return;
 const title=form.elements.title.value.trim(),description=form.elements.description.value.trim(),price=Number(form.elements.price.value);
 if(!title||!description||!Number.isFinite(price)||price<=0)return;
 t.cardItems=t.cardItems||[];t.cardItems.push({type:form.dataset.itemType,title,description,price});
 goBack();renderMessages();
});
function submit(text,explicit){if(!explicit&&!open&&(activeTab==='ai'||activeTab==='review')){submitAI(text);return;}text=text.trim();if(!text)return;if(!open&&!activeTasks().length){openNewTask(text);return;}let target=explicit|| (open?current:visibleTask());if(!explicit&&!open){const named=activeTasks().filter(t=>t.customer&&text.includes(t.customer));if(named.length===1)target=named[0];else if(named.length>1){showTask(target);add('user',text);add('ai','你是指陈志远明天的黄果树一日游吗？','clarify',text);return;}const timed=activeTasks().filter(t=>text.includes(t.time));if(timed.length===1)target=timed[0];}showTask(target);add('user',text);respond(text);$('#input').value='';updateSend()}

const rideSteps=[
 {name:'开始出发',action:'前往接驾点',input:t=>`开始导航，前往${t.from}`,hint:t=>`出车准备已完成，下一步前往${t.from}`,ai:t=>`已开始${t.time}的${t.name}。我已整理接驾位置与游客联系方式。下一步前往${t.from}，请在安全停车时操作。`},
 {name:'前往接驾点',action:'即将到达',input:()=> '距离接驾点还有 5 分钟',hint:t=>`前往${t.from}，留意临停与接客指引`,ai:t=>`现在前往${t.from}接${t.customer}。快到时告诉我，我会提前提醒游客带好行李，到约定位置等候。`},
 {name:'即将到达接驾点',action:'已到达',input:()=> '我已到达接驾点，正在安全停车区等待',hint:()=> '接驾点即将到达，请确认安全停车位置',ai:t=>`我已提醒${t.customer}：“司机大约还有 5 分钟到，请带好行李，前往约定的位置。”你到达并停稳后告诉我，我会通知游客出来碰面。`},
 {name:'已到达 / 等待游客',action:'接到游客',input:t=>`${t.customer}已上车，人数和行李已核对，安全带已系好`,hint:t=>`已到达${t.from}，等待${t.customer}`,ai:t=>`我已通知${t.customer}：“司机已到达${t.from}，请带好行李，前往约定位置上车。”你可以在允许停车的位置等候。游客上车后，记得核对人数、收好行李，并提醒大家系好安全带。`},
 {name:'接到游客',action:'前往目的地',input:t=>`游客已确认目的地为${t.to}，现在出发`,hint:t=>`游客已上车，请确认目的地：${t.to}`,ai:t=>`已记录游客上车。目的地是${t.to}，请与${t.customer}再次确认。我会继续协助目的地到达提醒与下车检查。`},
 {name:'前往目的地',action:'即将到达',input:()=> '距离目的地还有 5 分钟，请准备下车提醒',hint:t=>`正在前往${t.to}`,ai:t=>`现在送游客去${t.to}，请平稳驾驶。快到时告诉我，我会提醒游客准备好下车，带齐随身物品。`},
 {name:'即将到达目的地',action:'游客下车',input:()=> '已安全到达，游客已下车，行李和随身物品已取齐',hint:t=>`即将到达${t.to}，准备安全下客`,ai:t=>`即将到达${t.to}。请提醒${t.customer}带好手机、证件和随身物品，确认周边车辆后再开门；协助取出后备厢行李，确认无遗漏后记录游客下车。`},
 {name:'游客下车',action:'服务结束',input:()=> '游客和行李已全部送达，车内无遗留物品，确认结束服务',hint:()=> '游客已下车，请完成最后的车内检查',ai:t=>`${t.customer}已经在${t.to}下车了。辛苦你再看一眼座位和后备厢，确认没有遗留物品，就可以结束这趟服务。`},
 {name:'服务结束',action:'',input:()=>'',hint:()=> '服务已完成',ai:t=>`这趟服务完成了，${t.customer}已安全送到${t.to}，行李和随身物品也都带齐了。辛苦了，我会继续帮你安排接下来的事情。`}
];
// Airport and day-charter simplify pickup while charter delivery stays per stop.
function rideStepsFor(t){
 if(!['airport','day-charter'].includes(t.id))return rideSteps;
 const stops=t.serviceStops||[t.from,...(t.via||[]),t.to];
 const trip={...t,from:stops[0],to:t.id==='day-charter'?stops[1]:stops.at(-1)};
 const deliveryStep=(from,to,first=false)=>({
  name:first?'接到乘客':`前往${to}`,action:'送达目的地',
  input:()=>`已送达目的地${to}，乘客已安全下车，行李已取齐`,
  hint:()=>`${first?'已接到乘客，接下来前往'+to:'正在从'+from+'前往'+to}。抵达并确认乘客安全下车后，点击“送达目的地”。`,
  ai:()=>`${first?'已记录乘客上车。接下来前往'+to:'现在从'+from+'前往'+to}，请平稳驾驶。抵达并确认乘客安全下车后，点击“送达目的地”。`,
  aliases:/^(?:我)?(?:已)?送达(?:目的地)?|^(?:已安全到达|已到达目的地|游客已下车|乘客已下车)/u
 });
 const steps=[
  {...rideSteps[0],action:'到达上车点',input:()=> '已到达上车点，正在安全停车区等待乘客',hint:()=>rideSteps[0].hint(trip),ai:()=>rideSteps[0].ai(trip),aliases:/^(?:我)?(?:已)?到达(?:上车点|接驾点|接客点)(?:[，,。！!]|$)/u},
  {name:'到达上车点',action:'接到乘客',input:()=> '已接到乘客，人数和行李已核对，安全带已系好',hint:()=>`已到达${trip.from}，请在允许停车的位置等候；乘客上车后核对人数、行李和安全带。`,ai:()=>rideSteps[3].ai(trip),aliases:/^(?:我)?(?:已)?接到(?:乘客|游客)|^(?:乘客|游客|已确认乘客|已确认游客).*已上车/u},
  deliveryStep(trip.from,trip.to,true)
 ];
 if(t.id==='day-charter'){
  for(let index=1;index<stops.length-1;index++){
   const from=stops[index],to=stops[index+1],departure=t.serviceDepartureTimes?.[index];
   const ready=`已送达${from}，${departure?departure+'前往'+to:'下一段前往'+to}。出发前请确认乘客已上车，再点击“开始出发”。`;
   steps.push(
    {name:`已送达${from}`,action:'开始出发',input:()=>`开始出发，前往${to}`,hint:()=>ready,ai:()=>ready,aliases:/^(开始出发|出发|走吧|前往目的地|开始送达|确认目的地)(?:[，,。！!]|$)/u},
    deliveryStep(from,to)
   );
  }
 }
 const finalTrip={...trip,to:stops.at(-1)};
 steps.push(
  {name:'送达目的地',action:'服务结束',input:()=> '服务结束，已检查车内并确认无遗留物品',hint:()=>`已送达${finalTrip.to}，请确认乘客、行李和随身物品已全部下车，检查车内后结束服务。`,ai:()=>rideSteps[7].ai(finalTrip),aliases:/^(服务结束|结束服务|确认结束|完成任务|结束任务)/u},
  {name:'服务结束',action:'',input:()=>'',hint:()=> '服务已完成',ai:()=>t.id==='day-charter'?`今日包车服务已结束，已依次送达${stops.slice(1).join('、')}，服务记录已归档。`:rideSteps[8].ai(finalTrip)}
 );
 return steps;
}
function flowActions(t){return t.done?[]:[rideStepsFor(t)[t.flowIndex].action].filter(Boolean)}
function suggestedInput(t){if(t.done)return '';if(t.id==='trip-plan')return '';if(t.id==='business-card'){const flow=t.serviceFlow;if(flow&&['route','price','details'].includes(flow.stage))return flow.draft[flow.stage==='price'?'pricing':flow.stage]||businessServiceExamples[flow.stage];return !t.introductionNotes?.length?'开商务车5年了，主要跑市区到青岩古镇这条线，英语满足日常交流需求':'';}if(t.id==='order')return t.negotiation==='agreed'?'确认接单':t.negotiation==='proposal'?`同意按 ${t.requestedPrice} 元报价`:'沟通改价';const draft=[...(histories.get(t.id)||[])].reverse().find(m=>m.kind==='contact'&&!m.extra.sent);if(draft&&!t.contactPending)return `发送给${t.customer}：${draft.extra.draft}`;if(t.awaitingPrice)return '把价格改成 220';if(t.contactPending)return '我已了解';if(t.flow)return rideStepsFor(t)[t.flowIndex].input(t);if(t.id==='prepare')return '出车准备';if(t.id==='order')return '确认接单';if(t.id==='contact'||t.day>today)return '联系游客';if(t.id.startsWith('custom-'))return t.customStage?'事项已处理完毕，确认完成任务':'请帮我整理这件事的处理步骤';return '开始出发'}
function flowMessage(m){const valid=!m.used&&!current.done&&current.flow&&m.extra===current.flowIndex;return `${rideStepsFor(current)[m.extra].action?`<button class="flow-next" data-flow-command="${rideStepsFor(current)[m.extra].action}" ${valid?'':'disabled'}>${valid?buttonLabel(rideStepsFor(current)[m.extra].action):'已完成'}</button>`:''}`}
function startRide(t){t.flow=true;t.flowIndex=0;publishRide(t)}
function publishRide(t){const step=rideStepsFor(t)[t.flowIndex];t.status=step.name;if(t.flowIndex===rideStepsFor(t).length-1){completeTask(t,step.ai(t));return}add('ai',step.ai(t),'flow',t.flowIndex);renderTasks()}
function contactReply(t){if(t.id==='airport')return '张晓雯确认在 T2 到达层 3 号出口，两件大行李，不需要儿童座椅';if(t.id==='contact')return '李明轩确认 15:40 在贵阳北站南广场上车，两件大行李';if(t.id==='tour')return '陈志远确认明天 08:30 在酒店大堂集合，2 位成人和 1 位儿童，需要儿童座椅，途中安排休息';return `${t.customer}已确认上车位置、乘车人数与行李安排`}
function contactSent(t){t.contactPending=true;t.passengerReply=contactReply(t);add('ai',t.passengerReply+'。','confirmation');renderTasks()}

function negotiationMessage(m){const valid=!m.used&&!current.done&&current.negotiation===m.extra;const label=m.extra==='agreed'?'确认接单':'同意改价';return `<button class="flow-next" data-command="${label}" ${valid?'':'disabled'}>${valid?label:'已处理'}</button>`}
function proposePrice(t){t.negotiation='proposal';t.status='协商中';add('ai',`${t.customer}想把今天 21:00 的订单从 ¥${t.price} 调到 ¥${t.requestedPrice}。2 位游客，从${t.from}前往${t.to}，行程安排不变。\n这个价格可以考虑接受；如果你觉得有点低，也可以输入希望报价的金额，我来继续沟通。`,'negotiation','proposal');renderTasks()}
function handleNegotiation(text,t){
 if(/接单|接了|确认订单|完成任务|结束任务/.test(text)){if(t.negotiation!=='agreed'){add('ai','客户正在议价，报价还未达成一致。我先帮你确认价格，议价成功后再接单。');proposePrice(t)}else completeTask(t,`已按 ¥${t.price} 确认接单。${t.customer}的今天 21:00 接送安排已记录：${t.from} → ${t.to}，2 位游客。议价与接单任务已完成。`);return true;}
 if(!/议价|改价|价格|金额|报价|改成|改为|\d+\s*元/.test(text))return false;
 if(t.negotiation==='agreed'){add('ai',`双方已确认 ¥${t.price}，行程安排不变。下一步确认接单即可。`,'negotiation','agreed');return true;}
 const match=text.match(/(?:改成|改为|报价|价格|金额)\s*[¥￥]?\s*(\d+(?:\.\d+)?)/)||text.match(/(\d+(?:\.\d+)?)\s*元/);
 if(!match&&!/同意(?:改价|报价)/.test(text)){proposePrice(t);return true;}
 if(t.negotiation!=='proposal'){proposePrice(t);return true;}
 const amount=match?Number(match[1]):t.requestedPrice;
 if(!Number.isFinite(amount)||amount<=0||amount>100000){add('ai','请提供 0 元以上、100000 元以内的报价。');return true;}
 if(amount>t.requestedPrice){add('ai',`我已将 ¥${amount} 的报价与${t.customer}沟通。客户表示预算仍为 ¥${t.requestedPrice}，接送时间和地点不变。是否同意按 ¥${t.requestedPrice} 接这笔订单？`,'negotiation','proposal');return true;}
 t.price=amount;t.negotiation='agreed';t.status='待接单';t.advice=`议价成功，${t.customer}已同意 ¥${amount}。2 位游客，等待你确认接单`;
 add('ai',`议价成功。${t.customer}已同意 ¥${amount}，确认今天 21:00 在${t.from}上车，2 位游客前往${t.to}，行程安排不变。\n报价已更新，下一步请确认接单。`,'negotiation','agreed');renderTasks();return true;
}

function handleFlow(text,t){if(t.done)return false;if(t.id==='order'&&handleNegotiation(text,t))return true;const draft=[...(histories.get(t.id)||[])].reverse().find(m=>m.kind==='contact'&&!m.extra.sent);if(draft&&(text.startsWith('发送给')||text===draft.extra.draft)){draft.extra.sent=true;contactSent(t);return true;}if(['airport','day-charter'].includes(t.id)&&!t.flow&&/完成任务|结束任务|服务结束/.test(text)){add('ai','这次接送尚未开始。请先完成出车准备，再点击“开始出发”，我会陪你完成接驾与送达。');return true;}
 if(t.contactPending&&!/联系(?:游客|乘客)|语音联系/.test(text)){if(/我已了解|确认|出口|行李|座椅|上车|集合/.test(text)){const reply=/^(我已了解|确认沟通|确认无误|确认)$/.test(text)?(t.passengerReply||contactReply(t)):text;t.contactPending=false;t.contactConfirmed=true;histories.get(t.id).filter(m=>m.kind==='confirmation').forEach(m=>m.used=true);t.contactNotes=reply;if(t.id==='contact'||t.id==='tour'){t.advice='游客沟通已完成，需求已确认';completeTask(t)}else {add('ai',`已记录：${reply}。${t.flow?'继续当前服务步骤即可。':'接驾信息已准备好，出车检查完成后可以开始出发。'}`);renderTasks()}return true;}}
 if(t.day>today&&/完成行前确认|结束任务|完成任务/.test(text)){if(!t.contactConfirmed){add('ai','请先联系游客并确认行前需求，我会帮你整理好明天的安排。');return true}completeTask(t,`行前确认已完成：${t.contactNotes}。明天的接驾、儿童座椅与途中休息安排已记录。`);return true}
 if(t.id.startsWith('custom-')){if(/完成任务|结束任务/.test(text)){if(!t.customStage){add('ai','我先帮你整理处理事项，请确认需求后再完成。');t.customStage=1;return true}completeTask(t,`“${t.name}”已处理完成，处理记录已归档。`);return true}t.customStage=1;t.actions=['完成任务'];renderTasks();add('ai',`已整理“${t.name}”：${t.advice.replace(/[。！]$/,'')}。请核对要求并处理，完成后点击输入框填写处理结果，发送即可归档。`,'next-actions');return true}
 if(!t.flow)return false;
 const aliases=[/前往接驾点|开始导航/,/即将到达|还有\s*5\s*分钟/,/已到达|正在.*等待/,/接到游客|接到乘客|已上车/,/前往目的地|确认目的地/,/即将到达|还有\s*5\s*分钟/,/游客下车|乘客下车|已下车/,/服务结束|结束服务|确认结束/];
 const step=rideStepsFor(t)[t.flowIndex],alias=['airport','day-charter'].includes(t.id)?step.aliases:aliases[t.flowIndex];
 if(text===step.action||alias?.test(text)){t.flowIndex++;publishRide(t);return true}
 if(/联系|电话/.test(text))return false;
 add('ai',`当前处于“${rideStepsFor(t)[t.flowIndex].name}”。${rideStepsFor(t)[t.flowIndex].hint(t)}。请确认“${rideStepsFor(t)[t.flowIndex].action}”，或点击输入框填写当前进展后发送。`,'flow',t.flowIndex);return true
}

// User-provided presentation copy; no live booking or timetable lookup.
function tripPlanGentleDraft(){return "已调整为少步行、午间休息的3天2晚方案：\n大地指纹音乐节|红枫湖|青岩古镇3天2晚家庭游包车方案\n\nDay1 高铁到达毕节大方游览奢香古镇、大地指纹音乐节（住大方云里芳香酒店）\n14:00 抵达大方，酒店办理入住，长辈午休休整\n15:30 慢逛奢香古镇（平地为主），可选奢香博物馆，平地游览，不累\n17:00 古镇晚餐，点餐备注免辣 / 微辣：六龙豆干火锅、大方蹄花粉\n17:30 步行前往大地指纹音乐节场地\n老人友好预案：不必下梯田观众区，在上方观景台看大地指纹景观、听现场；备好厚外套、防滑鞋、折叠小板凳；夜间山区降温明显\n21:30 音乐节结束，步行回酒店休息\n\nDay2 大方高铁→贵阳北，游览红枫湖，包车送回阿云朵仓（住珍珀酒店）\n09:56 大方站搭乘城际 C5883（10:56 抵达贵阳北，车程约 1h，适合老人，不用早起）\n10:56 抵达贵阳北站，出站，和包车司机在贵阳北网约车接送区汇合，搬行李上车\n11:10 贵阳北站 → 红枫湖上侗下寨停车场（约 50km，50 分钟）\n12:00 抵达红枫湖上侗下寨停车场，司机原地等候\n12:10 红枫湖附近农家乐午餐（清淡湖鲜，免辣）\n13:30 红枫湖游览（老人优选滴澄关平缓环湖步道，平地，随时休息，1.5h；体力好可加游船）\n15:10 前往右二彩色村庄，停车打卡拍照（平地，20–30 分钟），湖边露营打牌\n18:00 湖边烧烤\n19:30 返回车上，司机送往阿云朵仓珍珀酒店（红枫湖→阿云朵仓珍珀约 32km，40 分钟）。办理入住，休整。\n全天包车服务\n\nDay3 游览青岩古镇，晚上送回贵阳北站（高铁返程）\n10:00 珍珀酒店退房，司机酒店门口接人，出发前往青岩古镇西门停车场（阿云朵仓→青岩西门约 38km，45 分钟）\n10:45 抵达青岩古镇西门停车场，司机原地等候\n老人友好路线：西门入园，主街→百岁坊→短段背街→十字街；不爬全程城墙，仅可选登定广门小城楼拍照；65 岁以上老人免大门票\n12:30 古镇午餐：青岩卤猪脚（软烂免辣）、豆腐圆子、糕粑稀饭\n17:45 返回停车场上车，司机送回贵阳北站（青岩古镇西门→贵阳北约 35km，45–50 分钟）\n18:30 抵达贵阳北站，办理高铁检票，行程结束\n全天包车服务\n\n费用明细\n省内全天包车（7座商务）900元/台/天，共1台2天，合计1800元"}
function tripPlanStandardDraft(){
 return tripPlanGentleDraft()
  .replace('已调整为少步行、午间休息的3天2晚方案：','9月24日—9月26日，3天2晚家庭游包车方案：')
  .replace('15:30 慢逛奢香古镇（平地为主），可选奢香博物馆，平地游览，不累','15:30 步行游览奢香古镇街巷和奢香博物馆，沿古镇步道多走一段，欣赏梯田景观')
  .replace('老人友好预案：不必下梯田观众区，在上方观景台看大地指纹景观、听现场；备好厚外套、防滑鞋、折叠小板凳；夜间山区降温明显','观演安排：沿步道下到梯田观众区听现场，演出间隙步行看看大地指纹景观，再原路返回；备好厚外套、防滑鞋，夜间山区降温明显')
  .replace('13:30 红枫湖游览（老人优选滴澄关平缓环湖步道，平地，随时休息，1.5h；体力好可加游船）','13:30 红枫湖游览（沿滴澄关环湖步道串联多个观景点，步行约1.5h，中途安排休息；可选游船）')
  .replace('15:10 前往右二彩色村庄，停车打卡拍照（平地，20–30 分钟），湖边露营打牌','15:10 前往右二彩色村庄，步行逛村落街巷、拍照约40分钟，再到湖边露营打牌')
  .replace('老人友好路线：西门入园，主街→百岁坊→短段背街→十字街；不爬全程城墙，仅可选登定广门小城楼拍照；65 岁以上老人免大门票','游览路线：西门入园，主街→百岁坊→背街→十字街，再步行到定广门城楼及附近城墙段拍照，中途安排休息；65 岁以上老人免大门票');
}
function tripPlanDraft(t){
 const draft=t.tripGentle?tripPlanGentleDraft():tripPlanStandardDraft();
 return draft+(t.tripNotes?.length?'\n\n补充要求：\n'+t.tripNotes.map(note=>'· '+note).join('\n'):'');
}

function respondTripPlan(text,t){
 if(t.done){add('ai','这份方案已经发送给乘客，任务已完成。你可以点开方案卡片查看完整行程。');return;}
 if(/老人|走路|步行|轻松|休息|慢一点/.test(text))t.tripGentle=true;
 if(!['生成三天行程','生成出行方案','请先生成一份适合两位老人的3天2晚出行方案','老人走路少一点','食宿和演出怎么预订','包车怎么安排'].includes(text)){
  t.tripNotes=t.tripNotes||[];if(!t.tripNotes.includes(text))t.tripNotes.push(text);
 }
 if(/生成|草案|完整|汇总|三天|3天|老人|走路|步行|轻松|休息|慢一点/.test(text)){t.status='规划中';add('ai',tripPlanDraft(t),'trip-plan-draft');return;}
 const replies=[];
 if(/预订|住宿|食宿|酒店|演出|音乐节|门票/.test(text))replies.push('毕节大方的食宿和演出建议由你协助代订。先确认日期、房间数量及床型、用餐偏好和音乐节场次，再向资源方核对房源、票务、价格与退改规则，汇总给游客确认。当前仅讨论方案，尚未查询库存或完成预订。');
 if(/包车|车辆|接送|交通/.test(text))replies.push('红枫湖和青岩古镇分别安排按天包车。四位游客需要至少四个乘客座位，并结合行李、老人上下车便利性选车。报价前确认每日用车时长、里程、接送地点、停车及路桥费用；大方至下一站的转场用车需单独核实。');
 if(/预算|价格|报价|费用|元/.test(text))replies.push('可以把预算拆为两晚住宿、餐饮、音乐节票务、两天包车和转场交通。先明确总预算是否含上述项目，再按资源方实际报价汇总；现阶段没有房价、票价或包车报价，先按两间双床房、四人餐食、两天包车分别整理报价清单，再合并核算。');
 if(/状元蹄|咖啡|吃|用餐|餐食/.test(text))replies.push('在青岩古镇安排品尝状元蹄，红枫湖游览中留出咖啡休息时间。先确认两位老人的口味、忌口和用餐习惯，餐厅及咖啡店可在日期与路线确定后再选。');
 if(!replies.length)replies.push(`已记录你的补充：“${text}”。下一版草案会一并列出，具体安排纳入以下方案。\n\n${tripPlanDraft(t)}`);
 add('ai',replies.join('\n\n'));
}

function respond(text){const t=current;if(t.id==='charter-confirm'){if(t.done){add('ai',`这笔订单${t.accepted?'已确认接单':'已记录无法接单'}，可查看上方处理结果。`);return;}if(['可以','接不了'].includes(text)){resolveCharterOrder(t,text);return;}add('ai',`${t.description}。${t.advice}请选择“可以”或“接不了”。`);return;}if(t.id==='lost-hat'){if(t.done){add('ai','已记录回复，可查看上方处理结果。');return;}if(['是','否'].includes(text)){resolveLostHat(t,text);return;}add('ai','请检查座椅、脚垫和后备厢，确认帽子是否在车上，再选择“是”或“否”。');return;}if(t.id==='trip-plan'){respondTripPlan(text,t);return;}if(t.id==='business-card'){respondBusinessCard(text,t);return;}if(handleFlow(text,t))return;if(t.done){add('ai','这个任务已经结束，可在侧边栏新建任务。');return}if(t.day>today&&/出发|走吧|准备|检查|完成任务|结束任务/.test(text)){add('ai','这次行程还未到出发日期，现在可以先联系游客，确认上车与乘车需求。');return}if(t.id==='prepare'){openPreparation();return}if(/完成任务|结束任务/.test(text)){completeTask(t,'任务已完成，已保存到历史记录。');return}if(/出发|走吧/.test(text)){if(t.status==='待接单'){add('ai','这笔订单还未接单，请先确认接单。');return}if(t.status==='进行中'){add('ai','这个任务已经开始出发，请安全驾驶。');return}if(!preparedDays.has(t.day)){add('ai','请先完成今天的车辆出车准备，再开始首次出车。','ready');return}startRide(t)}
else if(/准备|检查/.test(text)){if(preparedDays.has(t.day))add('ai','今天的车辆出车准备已完成。');else openPreparation()}
else if(/联系|电话|游客|乘客/.test(text)){if(!t.phone){add('ai','这个任务还没有游客联系方式，请先补充客户信息。');return}const contact=contactDraft(t);add('ai',contact.summary,'contact',contact)}
else if(/价格|金额|\d+\s*元/.test(text)){const amount=text.match(/(?:改成|改为|调整为|价格|金额)\s*[¥￥]?\s*(\d+(?:\.\d{1,2})?)/)||text.match(/(\d+(?:\.\d{1,2})?)\s*元/);if(!amount){t.awaitingPrice=true;add('ai',`这笔订单当前为 ¥${t.price}。点击输入框可填写调整金额，发送后我会继续协助你确认接单。`);return}const n=Number(amount[1]);if(n<=0||n>100000){add('ai','请输入 0 元以上、100000 元以内的订单金额。');return}t.price=n;t.awaitingPrice=false;add('ai',`已将${t.customer}这笔订单的金额改为 ¥${n}。确认无误后，点击“确认接单”即可完成这个任务。`);renderTasks()}
else if(/接单|接了|确认订单/.test(text)){if(t.status!=='待接单'){add('ai','这笔订单已经确认，无需重复接单。');return}completeTask(t,`已确认${t.time} ${t.customer}的订单，确认接单任务已结束。`)}
else if(/需求|详情|行程/.test(text))add('ai',`${esc(t.time)} ${esc(t.name)}\n${t.customer} · ${maskPhone(t.phone)}\n${[t.from,...(t.via||[]),t.to.replace(/机场\s+T/g,'机场T')].map(esc).join('→')}\n订单金额：¥${t.price}\n${t.advice}`);
else add('ai',`我正在协助处理${t.time} ${t.customer}的${t.name}。\n你可以进行出车准备、开始出发、联系游客、确认接单和调整价格。请告诉我具体要做哪一步。`)}
document.addEventListener('click',e=>{if(e.target.closest('[data-masked-call]')){toast('当前为脱敏号码，补充完整号码后可拨打');return;}const orderDecision=e.target.closest('[data-order-decision]');if(orderDecision){if(!orderDecision.disabled)resolveHomeOrder(orderDecision.dataset.orderDecision);return}const clicked=e.target.closest('button');if(clicked?.disabled)return;const messageElement=clicked?.closest('[data-message-index]');if(messageElement&&clicked.dataset.command!=='出车准备'){const message=histories.get(current.id)?.[Number(messageElement.dataset.messageIndex)];if(message)message.used=true;}const sendContact=e.target.closest('[data-send-contact]');if(sendContact){const message=histories.get(current.id)?.[Number(sendContact.dataset.sendContact)];if(!current.done&&message?.kind==='contact'&&!message.extra.sent){message.extra.sent=true;renderMessages();contactSent(current);toast('已发送给'+message.extra.customer)}return;}const flowButton=e.target.closest('[data-flow-command]');if(flowButton){submit(flowButton.dataset.flowCommand,current);return;}if(e.target.closest('[data-create]'))openNewTask();const homeContact=e.target.closest('[data-home-contact-confirm]');if(homeContact){const t=tasks.find(task=>task.id===homeContact.dataset.homeContactConfirm);if(t)confirmHomeContact(t);return}const homeAction=e.target.closest('[data-home-action]');if(homeAction){const t=tasks.find(task=>task.id===homeAction.dataset.task);if(t)runHomeAction(t,homeAction.dataset.homeAction);return}const action=e.target.closest('[data-action]');if(action){if(action.dataset.action==='去完成出车准备')showPreparationCard();else if(action.dataset.action==='出车准备')openPreparation();else submit(action.dataset.action,tasks.find(t=>t.id===action.dataset.task));}const cmd=e.target.closest('[data-command]');if(cmd)submit(cmd.dataset.command,current);const resolve=e.target.closest('[data-resolve]');if(resolve)submit(resolve.dataset.message,tasks.find(t=>t.id===resolve.dataset.resolve))});
function fillSuggestedInput(){
 if($('#input').value.trim())return;
 if(activeTab==='ai'&&!open){
  if(!reviewConversation&&!aiTask){$('#input').value='帮我查一下前天去贵阳北站的任务';updateSend()}
  return;
 }
 if(activeTab!=='home'&&!open)return;
 if(!open)showTask(visibleTask());
 if(current&&!current.done){$('#input').value=suggestedInput(current);updateSend()}
}$('#input').addEventListener('focus',fillSuggestedInput);$('#input').addEventListener('click',fillSuggestedInput);function resizeComposer(){
 const input=$('#input');if(!input.getClientRects().length)return;
 input.style.height='auto';
 const style=getComputedStyle(input),lineHeight=parseFloat(style.lineHeight),padding=parseFloat(style.paddingTop)+parseFloat(style.paddingBottom),contentHeight=input.scrollHeight;
 input.style.height=`${Math.min(contentHeight,lineHeight*3+padding)}px`;
 input.style.overflowY=contentHeight>lineHeight*3+padding+1?'auto':'hidden';
 $('#composer').classList.toggle('multiline',contentHeight>lineHeight+padding+1);
}
function updateSend(){$('#send').hidden=!$('#input').value.trim();$('#mic').hidden=!!$('#input').value.trim();resizeComposer()}
$('#input').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing&&e.keyCode!==229){e.preventDefault();$('#composer').requestSubmit()}});
let composerWidth=0;
new ResizeObserver(entries=>{const width=entries[0].contentRect.width;if(width!==composerWidth){composerWidth=width;resizeComposer()}}).observe($('#composer'));
window.addEventListener('resize',resizeComposer);
$('#input').addEventListener('input',()=>{updateSend();dismissBusinessShortcuts()});$('#composer').addEventListener('submit',e=>{e.preventDefault();submit($('#input').value)});$('#close').onclick=goBack;$('#home').onclick=()=>{if(open)goBack()};
function utility(title,body){if(!restoring)rememberPage();$('#history-drawer').close();$('#utility').classList.remove('new-task-dialog','preparation-sheet','voice-dialog','profile-detail','trip-document-detail','business-service-detail','personal-homepage','homepage-scrolled');$('#utility-title').textContent=title;$('#utility').setAttribute('aria-label',title);$('#utility-body').innerHTML=body;$('#utility').show();syncOverlay()}$('#utility-close').onclick=goBack;
$('#profile').onclick=()=>utility('我的工作台','<p class="utility-note">旅游司导</p><div class="utility-row">服务城市<small>贵州 · 贵阳</small></div><p class="utility-note">每天的工作，从这里开始。</p>');
function renderHistoryList(){
 const taskRows=[...tasks].reverse().filter(t=>histories.get(t.id)?.length).map(t=>`<button class="history-row" data-history="${t.id}"><span class="history-copy"><strong>${esc(t.name)}</strong></span></button>`);
 const reviewRows=[...reviewConversations].reverse().map(c=>`<button class="history-row" data-ai-history="${c.id}"><span class="history-copy"><strong>${esc(c.title)}</strong></span></button>`);
 $('#history-list').innerHTML=[...taskRows,...reviewRows].join('')||'<p class="history-empty">暂无对话</p>';
 filterHistoryList();
}
function filterHistoryList(){
 const query=$('#history-search').value.trim().toLocaleLowerCase();
 const rows=[...$('#history-list').querySelectorAll('.history-row')];let visible=0;
 rows.forEach(row=>{const id=row.dataset.history||row.dataset.aiHistory||row.dataset.reviewHistory;const messages=histories.get(id)||reviewConversations.find(c=>c.id===id)?.messages||[];const content=row.textContent+' '+messages.map(m=>m.text||'').join(' ');row.hidden=!!query&&!content.toLocaleLowerCase().includes(query);if(!row.hidden)visible++});
 $('#history-search-clear').hidden=!$('#history-search').value;
 $('#history-search-empty').hidden=!query||visible>0;
 const empty=$('#history-list .history-empty');if(empty)empty.hidden=!!query;
}
$('#history-search').addEventListener('input',filterHistoryList);
$('#history-search-clear').onclick=()=>{$('#history-search').value='';filterHistoryList();$('#history-search').focus()};
function showHistory(){if(activeTab!=='ai')return;if(!restoring)rememberPage();$('#utility').close();$('#history-title').textContent='历史对话';$('#history-close').setAttribute('aria-label','关闭历史对话');$('#new-task').hidden=true;$('#history-tabs').hidden=true;if(!restoring)$('#history-search').value='';renderHistoryList();$('#history-drawer').show();syncOverlay()}
$('#menu').onclick=()=>open||conversationPage?goBack():allTasksOpen?closeAllTasks():showHistory();$('#history-close').onclick=goBack;
$('#history-list').onclick=e=>{const row=e.target.closest('[data-history],[data-ai-history]');if(!row)return;goBack();if(row.dataset.aiHistory){rememberPage();if(open)closeChat();conversationPage=true;reviewConversation=reviewConversations.find(c=>c.id===row.dataset.aiHistory);aiTask=null;renderAI();updateHeader();}else{const t=tasks.find(t=>t.id===row.dataset.history);reviewConversation=null;if(t.chatOnly){if(open)closeChat();aiTask=t;renderAI()}else{aiTask=null;showTask(t);aiSection.hidden=true}}};
function openNewTask(prefill='',task=null){if($('#utility').open||$('#history-drawer').open){$('#utility').close();$('#history-drawer').close();syncOverlay()}newAIChat();aiTask=task;renderAI();$('#input').value=prefill;updateSend()}
function conversationHTML(t){return histories.get(t.id).map(m=>`<div class="message ${m.role}"><div class="bubble">${esc(m.text)}${m.kind==='trip-answer'?`<button class="flow-next" data-inquiry-confirm="${t.id}" ${t.done||m.used?'disabled':''}>${t.done||m.used?'已了解':'我已了解'}</button>`:''}</div></div>`).join('')}
function answerConversation(text,t){const previous=histories.get(t.id).filter(m=>m.role==='user').map(m=>m.text).join('。');const context=previous+'。'+text;const business=businessReply(text);if(business)return business;
 if(/前天/.test(text)&&/贵阳北站/.test(text)){
  // Local demonstration task; no task service is queried.
  const date=new Date(Date.now()-2*86400000),label=date.toLocaleDateString('zh-CN',{timeZone:'Asia/Shanghai',month:'long',day:'numeric'});
  t.stationTaskDemo={title:'贵阳北站送站任务',date:label,departure:'17:45',arrival:'18:35',from:'青岩古镇西门停车场',to:'贵阳北站南广场',passenger:'杨女士',party:'4位乘客 · 2件行李',status:'已完成',record:'已送达游客，确认行李取齐'};
  return `前天（${label}）去贵阳北站有 **1 项已完成任务**。`;
 }
 if(/(?:上周|本周).*(收入|周报)|收入周报/.test(text))return '上周收入周报已整理好，看看每天的收入和接单表现。';
 if(/大地指纹音乐节|音乐节.*(策划|服务)/.test(text))return `可以，围绕大地指纹音乐节，我建议先做这两种服务，方便游客按自己的行程选择。

**单程接送**
建议定价 **¥299/次 起**。适合只需要去程或返程的游客。贵阳城区约定地点上门接，到音乐节附近约定地点下车；如果是返程，就在散场后按约定地点接回。

**往返包车**
建议定价 **¥699/次 起**。包含去程、现场等候和散场接回，司机全程待命，适合朋友结伴或家庭出行，也方便提前商量停靠、用餐和返程时间。

两种服务都可以提前确认人数、行李和上车地点，根据演出时间和路况安排出发。

你想先发布哪一种？我可以先整理成服务卡片，你看过详情、确认合适后，再发布到主页。`;

 if(/高价单|高客单.*(接|获取|增加)/.test(text))return `想多接高价单，除了等合适的订单，更重要的是让客户觉得“**你值得更高的价格**”。

**你可以重点做这几件事：**

**先理解客户，而不是先谈价格**
客户咨询时，先问清楚人数、行李、老人小孩、目的地和行程安排。比如：“这次有老人或小朋友吗？行李多不多？我可以提前帮你把接送和时间安排好。”客户会更容易把你当成“帮他解决出行问题的人”，而不只是司机。

**把自己的经验说出来**
不要只说“可以接”，可以告诉客户：“这条线路我比较熟，几点容易堵、哪里上下车方便，我可以提前帮你安排。”高价客户更愿意为省心和经验付费。

**主动提供一点额外价值**
例如提前提醒天气、拥堵、景区预约、建议出发时间，或者告诉客户带老人、小孩时哪些地方需要注意。这些小服务几乎不增加成本，但很容易拉开和普通司机的差距。

**多经营有后续价值的客户**
家庭出游、商务接待、多日旅游、多人同行的客户，后续更容易产生包车、接送或转介绍。服务结束后可以自然地说：“后面还有接送或贵州其他行程，也可以直接找我。”

**不要只看订单金额，要看客户长期价值**
有些单第一次金额不高，但客户可能有多日行程、返程接送，或者同行的人也有用车需求。这类客户值得重点维护。

如果你愿意，我也可以根据你最近的订单，帮你找出哪些客户更值得重点维护、哪些沟通方式可以提高成交率。`;
 if(/明天.*(行程|任务|安排|信息)/.test(text))return tomorrowTripAdvice();
 if(/(今天|今日|当天|任务).*(安排|梳理|建议|先做|计划)|安排.*任务/.test(text))return todayTaskAdvice();
 if(/黄果树/.test(context)&&!/话术|怎么说|写.*回复/.test(text))return '当前任务中没有黄果树行程。你可以提供新的行程时间和游客信息，我再帮你整理安排。';

 if(/谢谢|就这样|解决了|好的/.test(text)&&text.length<16)return '不客气，有需要随时接着问我。刚才聊的内容已经留在历史任务里了。';
 if(/简短|短一点|精简/.test(text)&&/联系|客户|游客|乘客|话术/.test(context))return '可以这样说：“您好，我是您的司机。请确认一下上车时间、位置和乘车人数，有大件行李或儿童座椅需求也请告诉我，谢谢。”';
 if(/联系|客户|游客|乘客|话术|上车时间|人数/.test(context)){const customer=context.match(/[张李王陈刘赵周吴郑孙]女士|[张李王陈刘赵周吴郑孙]先生/)?.[0]||'您';return `可以直接这样和${customer==='您'?'游客':customer}沟通：

“${customer==='您'?'您好':customer+'您好'}，我是接送您的司机。想和您确认一下上车时间和具体位置，一共有几位游客、几件大件行李？${/儿童|孩子|座椅/.test(context)?'如果有小朋友同行，也请告诉我年龄和儿童座椅需求。':'如果有其他乘车需求，也请提前告诉我。'}谢谢。”

收到回复后，你可以发给我，我会帮你整理需要留意的地方。`;}
 if(/行李|遗失|遗落|丢失/.test(context))return '先在安全位置停车，检查后排座位、脚垫和后备厢。找到物品后拍照记录，再联系游客确认归还方式；暂时联系不上时，妥善保管并向平台报备。你也可以把具体情况告诉我，我帮你整理给游客的说明。';
 if(/准备|检查|车辆/.test(context))return '出车前请上传车辆照，一次确认行驶证照、能源车况、乘用物品及司机状态。';
 if(/价格|报价|议价/.test(context))return '先确认乘车人数、上下车地点，以及是否需要等候或增加停靠，再和游客商量一个双方认可的价格。你把原报价和游客的期望价格告诉我，我可以帮你组织回复。';
 if(/天气|路况|实时|航班/.test(text))return '我目前无法核实实时信息。你可以把查到的天气、路况或航班动态发给我，我会帮你判断需要怎样调整接驾安排。';
 return `关于“${summarizeTask(text).name}”，你希望我帮你写一段回复、梳理处理步骤，还是整理行程安排？补充一下具体情况，我们就在这里接着处理。`;
}
function summarizeConversation(requests){const all=requests.join('；');if(/黄果树/.test(all))return {name:'黄果树行程咨询',advice:'查询明天黄果树瀑布行程的乘车人数和行李数量。'};if(/联系|客户|游客|乘客|话术/.test(all)){const details=[];if(/时间/.test(all))details.push('上车时间');if(/人数/.test(all))details.push('乘车人数');if(/行李/.test(all))details.push('行李安排');if(/儿童|座椅/.test(all))details.push('儿童座椅需求');return {name:/包车/.test(all)?'包车游客沟通':'游客沟通',advice:`整理与游客沟通的${/话术|回复/.test(all)?'话术':'安排'}${details.length?'，确认'+details.join('、'):''}${/简短|精简/.test(all)?'，并精简表达':''}。`}}const first=summarizeTask(requests[0]);return {name:first.name,advice:first.advice+(requests.length>1?'；补充讨论了'+summarizeTask(requests.at(-1)).advice:'')};}
function summarizeTask(text){const clean=text.replace(/^(请|麻烦)?(帮我|帮忙)(安排一下|安排|记一下|记录一下|创建一个任务|新建一个任务)?[，,：: ]*/,'').trim()||text;const first=clean.split(/[，。！；\n]/)[0];return {name:first.length>20?first.slice(0,19)+'…':first,advice:clean}}

const preparation={vehiclePhoto:'',confirmed:false};
const preparationConfirmation='证照齐全、能源充足，车辆安全整洁；饮用水、纸巾、充电线等用品齐备；司机仪容整洁、休息充足，严禁酒驾和疲劳驾驶。';
function preparationCardAdvice(){return preparation.confirmed?'请上传车辆照。':`出车前请务必确认：${preparationConfirmation}`}
function homePreparationUpload(key,label){const photo=preparation[key];return `<label class="home-preparation-upload"><span class="home-preparation-upload-box">${photo?`<img src="${photo}" alt="已上传的${label}">`:`<img src="icons/plus.svg" alt=""><small>上传${label}</small>`}</span><input type="file" data-home-prep-photo="${key}" accept="image/*" aria-label="上传${label}"></label>`}
const preparationReady=()=>Boolean(preparation.vehiclePhoto&&preparation.confirmed);
function preparationPhotoField(key,label,step,tip){const photo=preparation[key];return `<div class="preparation-photo-field"><div class="preparation-step-heading"><span>${step}</span><div><p class="photo-label">上传${label}</p><small>${tip}</small></div></div><label class="photo-upload" aria-label="上传${label}"><input type="file" data-prep-photo="${key}" accept="image/*">${photo?`<img class="vehicle-photo" src="${photo}" alt="${label}">`:`<img src="icons/plus.svg" alt=""><span>点击上传${label}</span>`}</label></div>`}
function preparationBody(){const hasVehicle=Boolean(preparation.vehiclePhoto),stepPrompt=!hasVehicle?'第 1 步，请上传车辆照。':'车辆照已上传。第 2 步，请核对并确认出车事项。';return `<form id="preparation-form"><div class="preparation-ai-prompt" role="status"><span>AI 出车提醒</span><p>${stepPrompt}出车前请务必确认：${preparationConfirmation}</p></div><div class="preparation-photo-steps">${preparationPhotoField('vehiclePhoto','车辆照','1','拍摄车辆外观，确认车况安全整洁')}</div>${hasVehicle?`<div class="preparation-confirmation"><h3><span class="preparation-step-number">2</span>确认出车事项</h3><p>${preparationConfirmation}</p><label class="preparation-checks"><input type="checkbox" data-prep-confirm ${preparation.confirmed?'checked':''}><span class="check-circle"><img src="icons/check.svg" alt=""></span><span>我已确认以上事项</span></label></div>`:''}<button class="new-task preparation-complete" ${preparationReady()?'':'disabled'}>完成出车准备</button></form>`}
function preparationRecordBody(){return `<div class="preparation-record"><p class="utility-note">车辆照和出车确认已完成，今天可以开始出车。</p><div class="preparation-photos"><div class="preparation-photo-field"><p class="photo-label">车辆照</p><img src="${preparation.vehiclePhoto}" alt="已上传的车辆照"></div></div><p class="utility-note">${preparationConfirmation}</p></div>`}
function openPreparation(){if(preparedDays.has(today)){toast('今天的车辆出车准备已完成');return}utility('车辆出车准备',preparationBody());$('#utility').classList.add('preparation-sheet');syncOverlay()}
$('#utility-body').addEventListener('change',e=>{if(e.target.matches('[data-prep-photo]')){const file=e.target.files[0],key=e.target.dataset.prepPhoto;if(!file)return;if(!file.type.startsWith('image/')){toast('请选择图片文件');return}if(preparation[key])URL.revokeObjectURL(preparation[key]);preparation[key]=URL.createObjectURL(file);$('#utility-body').innerHTML=preparationBody();renderTasks()}else if(e.target.matches('[data-prep-confirm]')){preparation.confirmed=e.target.checked;$('.preparation-complete').disabled=!preparationReady();renderTasks()}});
function finishPreparation(){if(!preparationReady()||preparedDays.has(today)||taskHandoffPending)return;const fromSheet=$('#utility').open,previous=fromSheet?navigationStack.at(-1):null,list=$('#task-list'),returnTaskId=previous?.activeTab==='home'&&!previous.open?homeTasks()[Math.round(previous.scroll/Math.max(1,list.clientHeight))]?.id:null,task=tasks.find(t=>t.id==='prepare');const finish=()=>{preparedDays.add(today);task.done=true;task.completedAt=new Date().toISOString();task.ready=true;task.status='已完成';histories.get(task.id).push({role:'ai',text:'车辆照和出车确认已完成，今天可以开始出车。'});if(fromSheet)goBack();renderTasks();if(returnTaskId&&returnTaskId!=='prepare'){const index=homeTasks().findIndex(t=>t.id===returnTaskId);if(index>=0){list.scrollTop=index*list.clientHeight;savedScroll=list.scrollTop;queueTaskMotion()}}if(open&&current.id!=='prepare')add('ai','今天的出车准备已完成，可以开始出发。','depart');toast('出车准备已完成')};if(fromSheet)finish();else handoffCompletedTask(task,finish)}
$('#utility-body').addEventListener('submit',e=>{if(e.target.id!=='preparation-form')return;e.preventDefault();finishPreparation()});

function updateInquirySend(){const form=$('#new-task-chat');if(!form)return;const filled=!!form.elements.request.value.trim();form.querySelector('[data-inquiry-send]').hidden=!filled;form.querySelector('[data-inquiry-mic]').hidden=filled}
$('#utility-body').addEventListener('input',e=>{if(e.target.matches('#new-task-chat input'))updateInquirySend()});
$('#utility-body').addEventListener('click',e=>{if(e.target.closest('[data-inquiry-add]'))utility('快捷指令','<button class="utility-row" data-inquiry-question="李明轩的上车位置和行李安排是什么？">查询人数和行李</button>');const question=e.target.closest('[data-inquiry-question]');if(question){const text=question.dataset.inquiryQuestion;goBack();$('#new-task-chat').elements.request.value=text;updateInquirySend()}if(e.target.closest('[data-inquiry-mic]'))startComposerVoice($('#new-task-chat').elements.request,$('[data-inquiry-mic]'),updateInquirySend)});
function fillInquiryInput(e){if(!e.target.matches('#new-task-chat input')||e.target.value.trim())return;const t=tasks.find(t=>t.id===e.target.form.dataset.taskId);if(t?.done)return;e.target.value=t?.inquiryTrip?'我已了解':'李明轩的上车位置和行李安排是什么？';updateInquirySend()}
$('#utility-body').addEventListener('focusin',fillInquiryInput);
$('#utility-body').addEventListener('click',e=>{fillInquiryInput(e);const button=e.target.closest('[data-inquiry-confirm]');if(button&&!button.disabled){const t=tasks.find(t=>t.id===button.dataset.inquiryConfirm);if(t)finishInquiry(t)}});
function finishInquiry(t){if(t.done)return;t.done=true;t.status='已完成';histories.get(t.id).push({role:'user',text:'我已了解'});histories.get(t.id).filter(m=>m.kind==='trip-answer').forEach(m=>m.used=true);goBack();toast('已了解，已保存到历史任务')}
$('#new-task').onclick=()=>{goBack();newAIChat()};
$('#utility-body').addEventListener('submit',e=>{if(e.target.id!=='new-task-chat')return;e.preventDefault();const input=e.target.elements.request,text=input.value.trim();if(!text)return;const existing=tasks.find(t=>t.id===e.target.dataset.taskId);if(existing?.inquiryTrip&&text==='我已了解'){finishInquiry(existing);return}const summary=summarizeTask(text);const t=existing||{id:'conversation-'+Date.now(),chatOnly:true,day:localDate(new Date()),time:new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false}),icon:'chat-circle-dots',name:summary.name,advice:summary.advice,actions:[],status:'进行中'};if(!existing){tasks.push(t);histories.set(t.id,[])}const reply=answerConversation(text,t);histories.get(t.id).push({role:'user',text},{role:'ai',text:reply,kind:t.inquiryTrip?'trip-answer':''});t.done=false;t.status='进行中';const requests=histories.get(t.id).filter(m=>m.role==='user').map(m=>m.text);const digest=summarizeConversation(requests);t.name=digest.name;t.advice=digest.advice;e.target.dataset.taskId=t.id;$('#utility-title').textContent=t.name;$('#creation-messages').innerHTML=conversationHTML(t);input.value='';updateInquirySend();renderTasks();$('#creation-messages').scrollTop=$('#creation-messages').scrollHeight});

let voiceRecognition=null,voiceConversation=null,voiceMicMuted=false,voiceTextVisible=false;
let voiceActive=false,voiceSession=0,voiceStream=null,voiceRestart=null,voiceInterim='',voiceStarted=false,voicePhase='idle',voiceContext=null,voiceDraft=null,voiceFailures=0,voiceRequesting=false;
function setVoicePhase(phase,copy){voicePhase=phase;const el=$('#voice-status');if(el){el.hidden=false;el.textContent=copy||({idle:'现在可以开始说话',speaking:'你在说话',thinking:'AI 正在处理',answering:'AI 回答中',muted:'麦克风已关闭',permission:'请允许使用麦克风'}[phase]||'语音暂不可用')}$('.voice-orb')?.classList.toggle('is-listening',phase==='speaking');$('.voice-orb')?.classList.toggle('is-answering',phase==='answering');$('[data-voice-mic]')?.classList.toggle('recording',voiceActive&&!voiceMicMuted&&['idle','speaking'].includes(phase))}
function stopVoiceRecognition(){clearTimeout(voiceRestart);const r=voiceRecognition;voiceRecognition=null;if(r){r.onend=null;r.onresult=null;r.onerror=null;try{r.abort()}catch{}}}
function stopIntercom(){voiceActive=false;voiceSession++;voiceRequesting=false;stopVoiceRecognition();voiceStream?.getTracks().forEach(t=>t.stop());voiceStream=null;voiceInterim='';voiceDraft=null;if('speechSynthesis'in window)speechSynthesis.cancel()}
function openIntercom(){stopIntercom();voiceActive=true;voicePhase='idle';voiceSession++;voiceConversation=null;voiceMicMuted=false;voiceTextVisible=false;voiceStarted=false;voiceInterim='';voiceFailures=0;voiceContext=(open?current:activeTab==='home'?visibleTask():null);const inquiry=$('#new-task-chat');if(inquiry?.dataset.taskId){const prior=tasks.find(t=>t.id===inquiry.dataset.taskId);voiceContext=tasks.find(t=>t.id===prior?.inquiryTrip)||voiceContext;}recognition?.stop();utility('语音对讲',`<div class="voice-center"><button class="voice-orb" data-voice-listen aria-label="开始语音对讲"><span class="orb-core"></span></button><div id="voice-copy" aria-live="polite"><p class="voice-invite">试着问我</p><button class="voice-example" data-voice-example>“李明轩的上车位置和行李安排是什么？”</button></div></div><p class="voice-status" id="voice-status">…现在可以开始说话</p><div class="voice-controls"><button class="icon-button" data-voice-mic aria-label="静音话筒" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M6 10v2a6 6 0 0 0 12 0v-2M12 18v4m-3 0h6"/><path class="mic-slash" d="M3 3l18 18"/></svg></button><button class="icon-button" data-voice-close aria-label="关闭对讲"><img src="icons/x-warning.svg" alt=""></button><button class="icon-button voice-text" data-voice-text aria-label="显示对话文字" aria-pressed="false" aria-controls="voice-transcript">字</button></div><div class="home-indicator"></div>`);$('#utility').classList.add('voice-dialog');renderVoiceCopy();syncOverlay();listenIntercom()}

function ensureVoiceConversation(){if(voiceConversation)return voiceConversation;const t={id:'voice-'+Date.now(),chatOnly:true,day:localDate(new Date()),time:new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false}),icon:'chat-circle-dots',name:'语音对讲',advice:'',status:'进行中',actions:[],contextTaskId:voiceContext?.id};voiceConversation=t;tasks.push(t);histories.set(t.id,[]);return t}
function intercomReply(text){
 let t=voiceContext;
 const named=tasks.filter(x=>!x.chatOnly&&(text.includes(x.name)||(x.customer&&text.includes(x.customer))));if(named.length===1)t=voiceContext=named[0];
 if(/黄果树/.test(text))return '当前任务中没有黄果树行程。请提供新的行程信息。'
 if(/^(发布|发送|发给她|发给他|确认发送)[。！!]?$/u.test(text)){if(!voiceDraft)return '还没有待发送内容。请先告诉我发给哪位游客、发送什么内容。';const draft=voiceDraft;voiceDraft=null;histories.get(draft.task.id).push({role:'ai',text:'模拟发送给'+draft.task.customer+'：'+draft.text});return `已模拟发送给${draft.task.customer}：${draft.text}`}
 if(/告诉|通知|发消息/.test(text)){if(!t?.customer)return '请说出要通知的游客姓名，我会结合对应订单整理消息。';const timing=text.match(/还有(.+?)到/);voiceDraft={task:t,text:timing?`${t.customer}您好，我预计还有${timing[1]}到达，请在约定地点等候。`:text.replace(/^.*?(告诉|通知)(她|他|游客|乘客|客户)?/,'')};return `准备发给${t.customer}：${voiceDraft.text} 说“发布”即可模拟发送。`}
 if(['airport','day-charter'].includes(t?.id)&&t.flow&&!t.done){
  const step=rideStepsFor(t)[t.flowIndex];
  if(text===step.action||step.aliases?.test(text)){
   runHomeAction(t,step.action);
   return rideStepsFor(t)[t.flowIndex].hint(t);
  }
 }
 if(/^(出发|开始出发|走吧)[。！!]?$/u.test(text)){if(!t||t.id==='prepare')t=voiceContext=tasks.find(x=>x.id==='airport');if(t.done)return '这项任务已完成，请指定下一项接送任务。';if(t.day>today)return '这次行程还未到出发日期，可以先联系游客确认需求。';if(!t.from)return '当前任务不是接送任务，请告诉我要开始哪一段行程。';if(!preparedDays.has(t.day))return '出发前还需要上传车辆照，并完成出车确认。请先回到出车准备任务，再说“出发”。';if(!t.flow){t.flow=true;t.flowIndex=0;t.status=rideStepsFor(t)[0].name;histories.get(t.id).push({role:'ai',text:rideStepsFor(t)[0].ai(t),kind:'flow',extra:0});renderTasks()}return `已开始${t.customer}的${t.name}，${rideStepsFor(t)[t.flowIndex].hint(t)}。`}
 if(/^(接|接单|确认接单|接到游客|接到乘客)[。！!]?$/u.test(text)){if(!t)return '你是要确认接单，还是已经接到游客？请说出对应订单。';if(t.id==='order'){if(t.done)return '这笔订单已经确认。';if(t.negotiation!=='agreed')return `这笔订单还在议价，客户期望 ¥${t.requestedPrice}，请先完成报价沟通，再确认接单。`;t.done=true;t.status='已完成';t.completedAt=new Date().toISOString();histories.get(t.id).push({role:'ai',text:'通过语音确认接单。'});renderTasks();return `已在当前订单中确认${t.customer}的接单，报价 ¥${t.price}。`}if(t.flow&&rideStepsFor(t)[t.flowIndex].action==='接到游客'){t.flowIndex++;const step=rideStepsFor(t)[t.flowIndex];t.status=step.name;histories.get(t.id).push({role:'ai',text:step.ai(t),kind:'flow',extra:t.flowIndex});renderTasks();return `已记录接到${t.customer}。${step.hint(t)}。`}return `当前${t.name}状态为${t.status}。请先完成当前接驾步骤，或明确说“确认接单”。`}
 if(t&&/谁|客户|订单|任务|哪里|几点|时间|价格|金额|进度|人数|行李/.test(text))return `${t.name}：${taskDescription(t)} 当前状态为${t.status}。${t.price!=null?'当前报价 ¥'+t.price+'。':''}`;
 return answerConversation(text,ensureVoiceConversation());
}
function answerIntercom(text){text=text.trim();if(!voiceActive||!text)return;voiceStarted=true;voiceInterim='';stopVoiceRecognition();setVoicePhase('thinking');const t=ensureVoiceConversation();histories.get(t.id).push({role:'user',text});const reply=intercomReply(text);histories.get(t.id).push({role:'ai',text:reply});t.name=summarizeTask(text).name;renderVoiceCopy();setVoicePhase('answering');const session=voiceSession;const resume=()=>{if(!voiceActive||session!==voiceSession)return;setVoicePhase(voiceMicMuted?'muted':'idle');if(!voiceMicMuted)voiceRestart=setTimeout(startVoiceRecognition,450)};
 if(!muted&&'speechSynthesis'in window){const u=new SpeechSynthesisUtterance(reply);u.lang='zh-CN';u.onend=resume;u.onerror=resume;speechSynthesis.cancel();speechSynthesis.speak(u)}else voiceRestart=setTimeout(resume,900)
}
function renderVoiceCopy(){if(!$('#voice-copy'))return;const messages=voiceConversation?histories.get(voiceConversation.id):[];$('#voice-copy').innerHTML=`${voiceStarted||voiceTextVisible?'':'<p class="voice-invite">试着问我</p><button class="voice-example" data-voice-example>“李明轩的上车位置和行李安排是什么？”</button>'}<div id="voice-transcript" class="voice-transcript" role="log" aria-label="对话文字" ${voiceTextVisible?'':'hidden'}>${messages.map(m=>`<p class="${m.role==='user'?'voice-question':'voice-answer'}">${esc(m.text)}</p>`).join('')}${voiceInterim?`<p class="voice-question voice-interim">${esc(voiceInterim)}</p>`:''}${!messages.length&&!voiceInterim?'<p class="voice-transcript-empty">请说话</p>':''}</div>`;$('.voice-center').classList.toggle('text-visible',voiceTextVisible);$('#voice-status').hidden=false;if(voiceTextVisible){const panel=$('#voice-transcript');panel.scrollTop=panel.scrollHeight}}
function toggleVoiceMic(){voiceMicMuted=!voiceMicMuted;const mic=$('[data-voice-mic]');mic.setAttribute('aria-pressed',String(voiceMicMuted));mic.setAttribute('aria-label',voiceMicMuted?'取消静音':'静音话筒');voiceStream?.getAudioTracks().forEach(t=>t.enabled=!voiceMicMuted);if(voiceMicMuted){stopVoiceRecognition();setVoicePhase('muted')}else if(voicePhase!=='answering')listenIntercom()}
async function listenIntercom(){if(!voiceActive||voiceMicMuted||voiceRequesting||voiceRecognition||voicePhase==='answering')return;const session=voiceSession;voiceRequesting=true;try{if(!voiceStream){setVoicePhase('permission');if(!navigator.mediaDevices?.getUserMedia)throw new Error('unsupported');const stream=await navigator.mediaDevices.getUserMedia({audio:true});if(!voiceActive||session!==voiceSession){stream.getTracks().forEach(t=>t.stop());return}voiceStream=stream;voiceStream.getAudioTracks().forEach(t=>t.enabled=!voiceMicMuted);}if(!voiceMicMuted)startVoiceRecognition()}catch(e){if(session===voiceSession)setVoicePhase('error',e.name==='NotAllowedError'?'未获得麦克风权限，请在浏览器设置中允许后点击光球重试':e.name==='NotFoundError'?'未找到麦克风，请连接后点击光球重试':'麦克风暂不可用，请点击光球重试')}finally{if(session===voiceSession)voiceRequesting=false}}
function startVoiceRecognition(){if(!voiceActive||voiceMicMuted||voiceRecognition)return;const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;if(!Speech){voiceStream?.getTracks().forEach(t=>t.stop());voiceStream=null;setVoicePhase('error','当前浏览器不支持语音转写，请使用支持语音识别的浏览器');return}const r=new Speech(),session=voiceSession;voiceRecognition=r;r.lang='zh-CN';r.continuous=true;r.interimResults=true;r.onstart=()=>{if(session!==voiceSession)return;setVoicePhase('idle')};r.onspeechstart=()=>{if(session!==voiceSession||voiceMicMuted)return;voiceStarted=true;setVoicePhase('speaking');renderVoiceCopy()};r.onresult=e=>{if(session!==voiceSession||voiceMicMuted)return;voiceStarted=true;voiceFailures=0;let final='',interim='';for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal)final+=e.results[i][0].transcript;else interim+=e.results[i][0].transcript}voiceInterim=interim;setVoicePhase('speaking');renderVoiceCopy();if(final.trim())answerIntercom(final)};r.onerror=e=>{if(session!==voiceSession)return;if(e.error==='no-speech')return;voiceFailures++;if(['not-allowed','service-not-allowed','audio-capture','language-not-supported'].includes(e.error)||voiceFailures>=3){stopVoiceRecognition();voiceStream?.getTracks().forEach(t=>t.stop());voiceStream=null;setVoicePhase('error',e.error==='not-allowed'?'麦克风权限被拒绝，请允许后点击光球重试':'语音识别服务暂不可用，请点击光球重试')}};r.onend=()=>{if(voiceRecognition!==r||session!==voiceSession)return;voiceRecognition=null;if(voiceActive&&!voiceMicMuted&&voicePhase!=='answering'&&voicePhase!=='error')voiceRestart=setTimeout(startVoiceRecognition,600)};try{r.start()}catch{voiceRecognition=null;setVoicePhase('error','语音暂不可用，请点击光球重试')}}
window.addEventListener('pagehide',stopIntercom);
$('#intercom').onclick=openIntercom;
$('#utility-body').addEventListener('click',e=>{if(e.target.closest('[data-voice-close]'))goBack();if(e.target.closest('[data-voice-listen]'))listenIntercom();if(e.target.closest('[data-voice-example]'))answerIntercom('李明轩的上车位置和行李安排是什么？');if(e.target.closest('[data-voice-mic]'))toggleVoiceMic();if(e.target.closest('[data-voice-text]')){voiceTextVisible=!voiceTextVisible;const button=$('[data-voice-text]');button.setAttribute('aria-pressed',String(voiceTextVisible));button.setAttribute('aria-label',voiceTextVisible?'隐藏对话文字':'显示对话文字');renderVoiceCopy()}if(e.target.closest('[data-voice-ack]')&&voiceConversation){voiceConversation.done=true;voiceConversation.status='已完成';histories.get(voiceConversation.id).push({role:'user',text:'我已了解'});goBack()}});
$('#more').onclick=()=>utility('关于司导智能体','<p class="utility-note">先看任务，再通过说话或点击动作处理事情。对话关闭后，任务浏览位置与本次会话都会保留。</p><p class="utility-note">本版本为交互原型，未连接真实订单、实时路况或大模型服务。电话按钮将调用设备拨号能力。</p>');
$('#add').onclick=()=>{if(activeTab!=='home'&&!open){utility('对话提问',['帮我复盘任务完成情况','哪些客户需要优先沟通？','帮我分析订单情况'].map(q=>`<button class="utility-row" data-review-question="${q}">${q}</button>`).join(''));return;}if(!open)showTask(visibleTask());utility('快捷指令', (current?.done?[]:current?.id==='airport'?taskActions(current):current?.day>today?['联系游客']:[...new Set([...taskActions(current),'联系游客','调整价格'])]).map(s=>`<button class="utility-row" data-shortcut="${s}">${buttonLabel(s)}</button>`).join(''))};
$('#utility-body').onclick=e=>{const jump=e.target.closest('[data-jump]'),cmd=e.target.closest('[data-shortcut]'),tool=e.target.closest('[data-tool]');if(jump){showTask(tasks.find(t=>t.id===jump.dataset.jump))}if(cmd){goBack();submit(cmd.dataset.shortcut,current)}if(tool){$('#utility').close();if(tool.dataset.tool==='tasks')closeChat();else switchTab('ai')}};
function toast(){}$('#sound').onclick=()=>{muted=!muted;$('#sound img').src=`icons/${muted?'speaker-slash':'speaker-high'}.svg`;$('#sound').setAttribute('aria-checked',String(!muted));$('#sound').setAttribute('aria-label',muted?'开启语音播报':'关闭语音播报');if(muted)stopTaskNarration();if(!muted)speakVisibleTask(true);toast(muted?'语音播报已关闭':'语音播报已开启')};
function startComposerVoice(input,mic,update){const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;if(!Speech){toast('当前浏览器不支持语音识别，请使用键盘或系统听写。');input.focus();return}if(recognition){recognition.stop();return}recognition=new Speech();recognition.lang='zh-CN';recognition.interimResults=false;mic.classList.add('listening');mic.setAttribute('aria-label','停止语音输入');toast('正在聆听，识别后可编辑并发送');recognition.onresult=e=>{input.value=e.results[0][0].transcript;update()};recognition.onerror=e=>toast(e.error==='not-allowed'?'未获得麦克风权限，请使用文字输入。':'未能识别语音，请重试或输入文字。');recognition.onend=()=>{recognition=null;mic.classList.remove('listening');mic.setAttribute('aria-label','语音输入')};try{recognition.start()}catch{recognition=null;mic.classList.remove('listening');toast('语音暂不可用，请使用文字输入。')}}
$('#mic').onclick=()=>{if(activeTab!=='home'&&!open){startComposerVoice($('#input'),$('#mic'),updateSend);return;}if(!open)showTask(visibleTask());startComposerVoice($('#input'),$('#mic'),updateSend)};
function capturePage(){const modal=$('#utility');return {activeTab,conversationPage,taskSheet,reviewId:reviewConversation?.id,aiTaskId:aiTask?.id,input:$('#input').value,allTasksOpen,taskFromAll,allFilter:$('#all-tasks-page [aria-selected="true"]')?.dataset.taskFilter||'全部',allScroll:$('#all-tasks-page')?.scrollTop||0,reviewScroll:$('.review-feed')?.scrollTop||0,open,taskId:current?.id,historyConversation,scroll:$('#task-list').scrollTop,savedScroll,chatScroll:$('#messages').scrollTop,drawer:$('#history-drawer').open,drawerScroll:$('#history-list').scrollTop,utility:modal.open?{scroll:$('#utility-body').scrollTop,title:$('#utility-title').textContent,body:$('#utility-body').innerHTML,className:modal.className,fields:[...modal.querySelectorAll('input:not([type="file"]),textarea')].map(el=>({name:el.name,value:el.value}))}:null}}
function rememberPage(){const page=capturePage();page.tripScroll=['business-card','trip-plan'].includes(current?.id)&&open?$('.workspace').scrollTop:null;navigationStack.push(page)}
function updateHeader(){const detail=(open&&!taskSheet)||conversationPage;$('#app').classList.toggle('trip-plan-conversation',open&&!taskSheet&&current?.id==='trip-plan');$('#app').classList.toggle('business-card-conversation',open&&!taskSheet&&current?.id==='business-card');$('#app').classList.toggle('profile-mode',activeTab==='profile'&&!detail&&!allTasksOpen);if($('#profile-page'))$('#profile-page').hidden=activeTab!=='profile'||detail||allTasksOpen;$('#app').classList.toggle('home-design',activeTab==='home'&&!detail&&!allTasksOpen);$('#header-new-chat').hidden=activeTab!=='ai'||detail;$('#app').classList.toggle('conversation-page',detail);$('#app').classList.toggle('task-from-all',open&&taskFromAll);$('#app').classList.remove('history-conversation');$('#menu').hidden=activeTab!=='ai'&&!allTasksOpen&&!detail;$('#intercom').hidden=activeTab!=='ai'||open||conversationPage;$('#sound').hidden=!(activeTab==='home'||activeTab==='ai'||open||conversationPage);$('#close').hidden=!taskSheet;$('#page-title').textContent=allTasksOpen?'全部任务':open&&!taskSheet?current.name:conversationPage?'复盘对话':activeTab==='review'?'看板':activeTab==='ai'?'经营小智':activeTab==='profile'?'我的':'任务';$('#menu img').src=allTasksOpen||detail?'icons/arrow-left.svg':'icons/list.svg';$('#menu').setAttribute('aria-label',detail?'返回上一页':allTasksOpen?(activeTab==='profile'?'返回我的主页':'返回看板'):'历史对话')}
function syncOverlay(){syncInquiryHeader();updateNavIcons();const drawer=$('#history-drawer'),modal=$('#utility'),layer=modal.open?modal:drawer.open?drawer:null;$('#overlay-scrim').hidden=!layer||(modal.classList.contains('new-task-dialog')||modal.classList.contains('voice-dialog'))&&modal.open;for(const selector of ['.statusbar','header','.workspace','footer'])$(selector).inert=!!layer;for(const el of [drawer,modal]){el.setAttribute('aria-modal','true');el.inert=el!==layer}if(layer)requestAnimationFrame(()=>[...layer.querySelectorAll('button,input')].find(el=>el.getClientRects().length&&!el.disabled)?.focus({preventScroll:true}))}
function goBack(){if(allTasksOpen&&!$('#utility').open&&!$('#history-drawer').open){closeAllTasks();return;}if($('#utility').classList.contains('voice-dialog'))stopIntercom();const previous=navigationStack.pop();restoring=true;$('#utility').close();$('#history-drawer').close();syncOverlay();if(open)closeChat();conversationPage=false;if(previous){conversationPage=!!previous.conversationPage;reviewConversation=reviewConversations.find(c=>c.id===previous.reviewId)||null;aiTask=tasks.find(t=>t.id===previous.aiTaskId)||null;applyPageSurface(previous.activeTab||'home',!!previous.allTasksOpen);if(previous.allTasksOpen){allTasksPage.innerHTML=allTasksBody(previous.allFilter);allTasksPage.scrollTop=previous.allScroll;}if($('.review-feed'))$('.review-feed').scrollTop=previous.reviewScroll;savedScroll=previous.savedScroll;$('#task-list').scrollTop=previous.scroll;current=tasks.find(t=>t.id===previous.taskId)||visibleTask();historyConversation=previous.historyConversation;taskFromAll=!!previous.taskFromAll;if(previous.open&&current){showTask(current,!!previous.taskSheet);savedScroll=previous.savedScroll;requestAnimationFrame(()=>{if(previous.tripScroll!==null&&previous.tripScroll!==undefined)$('.workspace').scrollTop=previous.tripScroll;else $('#messages').scrollTop=previous.chatScroll})}if(previous.drawer){showHistory();$('#history-list').scrollTop=previous.drawerScroll}if(previous.utility){utility(previous.utility.title,previous.utility.body);$('#utility').className=previous.utility.className;$('#utility-body').scrollTop=previous.utility.scroll||0;for(const field of previous.utility.fields){const el=[...$('#utility').querySelectorAll('input,textarea')].find(x=>x.name===field.name);if(el)el.value=field.value}}}if(previous){$('#input').value=previous.input||'';updateSend()}restoring=false;if(activeTab==='ai'&&!open)renderAI();updateHeader();syncOverlay()}
$('#overlay-scrim').onclick=goBack;
document.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();if(allTasksOpen||open||conversationPage||$('#utility').open||$('#history-drawer').open)goBack()}if(e.key==='Tab'){const layer=$('#utility').open?$('#utility'):$('#history-drawer').open?$('#history-drawer'):null;if(!layer)return;const controls=[...layer.querySelectorAll('button,input,textarea,a[href]')].filter(x=>!x.disabled&&x.getClientRects().length);const first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}});
if(window.visualViewport){const syncPreviewHeight=()=>{if(window.innerWidth<=430)$('#app').style.height=Math.min(844,visualViewport.height)+'px';else $('#app').style.removeProperty('height')};visualViewport.addEventListener('resize',syncPreviewHeight);window.addEventListener('resize',syncPreviewHeight);syncPreviewHeight()}
new ResizeObserver(()=>{if(open&&!taskSheet&&current?.id!=='business-card'){$('#chat').style.top=($('#context').offsetTop+$('#context').offsetHeight+16)+'px'}}).observe($('#context'));
renderTasks();
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'start_task_processing',description:'在工作台展开指定任务的 AI 操作面板，不执行订单操作。',inputSchema:{type:'object',properties:{taskId:{type:'string',enum:tasks.map(t=>t.id)}},required:['taskId'],additionalProperties:false},annotations:{readOnlyHint:false},execute:async input=>{const t=tasks.find(t=>t.id===input?.taskId);if(!t)throw new Error('Unknown task');showTask(t);return{taskId:t.id,status:t.status,panelOpen:open}}})).catch(()=>{})}catch{}}

// Review uses the same live task records, with conversations isolated from workbench tasks.
const reviewSection=document.createElement('section');reviewSection.id='review';reviewSection.hidden=true;$('.workspace').append(reviewSection);
function taskDeadline(t){if(t.dueAt)return new Date(t.dueAt).getTime();const time=t.time.match(/\d{2}:\d{2}/)?.[0]||'23:59';return new Date(`${t.day}T${time}:00`).getTime()}
function taskState(t){return t.done?'已完成':Date.now()>taskDeadline(t)?'逾期':'待办'}
function reviewData(){const all=tasks.filter(t=>!t.chatOnly),late=all.filter(t=>taskState(t)==='逾期'),timely=all.filter(t=>t.done&&t.completedAt&&new Date(t.completedAt).getTime()<=taskDeadline(t)),customers=[...new Set(all.map(t=>t.customer).filter(Boolean))],orders=all.filter(t=>t.price!=null);return {all,late,timely,customers,orders}}
function taskReviewAdvice(){const d=reviewData();return d.late.length?`当前有 ${d.late.length} 项逾期任务，建议优先处理“${d.late[0].name}”，确认延误原因后再安排后续任务。` : d.all.some(t=>!t.done)?'当前没有逾期任务。建议先完成出车准备，再按预约时间处理接送与客户沟通，提前确认明日行程。':'当前任务均已完成，建议回顾客户反馈，为下一次服务做好准备。'}
function reviewCard(title,icon,body,index){const advice=body.match(/<div class="review-advice">[\s\S]*?<\/p><\/div>/)?.[0]||'';body=body.replace(advice,'')+reviewShortcuts(title);const hint=index<3?'向上滑动，查看'+(index===1?'客户':'订单')+'复盘':'向下滑动，回看客户与任务';return `<section class="review-page" aria-label="${title}复盘" data-review-hint="${hint}"><article class="review-card" data-board-icon-color="${({任务:'service',客户:'communication',订单:'compliance'})[title]}"><div class="review-card-heading"><h2><span class="board-heading-icon" style="--review-symbol:url(icons/${icon}.svg)" aria-hidden="true"></span>${title}</h2></div>${body}</article></section>`}
let reviewMotionObserver;
function bindReviewMotion(){reviewMotionObserver?.disconnect();const feed=$('.review-feed'),hint=$('.review-swipe-fixed');if(!feed||!hint)return;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let frame=0,hintTimer=0;const pages=[...feed.querySelectorAll('.review-page')];const nearest=()=>pages.reduce((best,page)=>Math.abs(feed.scrollTop-page.offsetTop)<Math.abs(feed.scrollTop-best.offsetTop)?page:best,pages[0]);const update=()=>{frame=0;if(reduced)return;const top=feed.getBoundingClientRect().top,height=feed.clientHeight||1;pages.forEach(page=>{const distance=(page.getBoundingClientRect().top-top)/height,progress=Math.min(1,Math.abs(distance)),eased=progress*progress*(3-2*progress);page.style.setProperty('--review-shift',`${(distance*20).toFixed(1)}px`);page.style.setProperty('--review-scale',(1-.04*eased).toFixed(4));page.style.setProperty('--review-opacity',(1-.18*eased).toFixed(3))})};const queue=()=>{if(!frame)frame=requestAnimationFrame(update)};feed.addEventListener('scroll',()=>{hint.classList.add('is-scrolling');clearTimeout(hintTimer);queue();hintTimer=setTimeout(()=>{hint.textContent=nearest().dataset.reviewHint;hint.classList.remove('is-scrolling')},110)},{passive:true});reviewMotionObserver=new ResizeObserver(queue);reviewMotionObserver.observe(feed);hint.textContent=nearest().dataset.reviewHint;update()}
function renderReview(){

 const taskChart=dashboardTaskMetrics(reviewData());
 const customerChart=customerMetrics();
 const orderChart=orderMetrics();
 reviewSection.innerHTML=`<div class="review-feed">${reviewCard('任务','clipboard-text-outline',`${taskChart}<div class="review-advice"><span>AI 建议</span><p>${taskReviewAdvice()}</p></div>`,1)}${reviewCard('客户','user',`${customerChart}<div class="review-advice"><span>AI 建议</span><p>提前确认今日接驾位置与行李需求，并核对游客上车点。</p></div>`,2)}${reviewCard('订单','check-circle',`${orderChart}<div class="review-advice"><span>AI 建议</span><p>${tasks.find(t=>t.id==='order').done?'议价订单已确认，建议核对接送时间，提前安排车辆。':'王静怡的订单仍需确认报价，建议先完成议价沟通，再确认接单。'}</p></div>`,3)}</div><p class="review-swipe review-swipe-fixed" aria-hidden="true">向上滑动，查看客户复盘</p>`;
 bindReviewMotion();
}
function switchTab(tab){clearTimeout(narrationTimer);stopTaskNarration();lastNarratedTaskId=null;if(allTasksOpen)closeAllTasks();if(open)closeChat();conversationPage=false;navigationStack.length=0;if(tab==='ai'){reviewConversation=null;aiTask=null}applyPageSurface(tab,false);$('#input').value='';updateSend();if(tab==='review')renderReview();else if(tab==='home')renderTasks();else if(tab==='profile')renderProfile();else renderAI();updateHeader();updateNavIcons()}
$('#home').onclick=()=>switchTab('home');$('#ai-tab').onclick=()=>switchTab('ai');
function taskDescription(t){if(t.description)return t.description;if(t.id==='prepare')return '上传车辆照，确认行驶证照、能源车况、乘用物品及司机状态。';if(t.id==='airport')return `接${t.customer}从${t.from}前往${t.to}。航班 ${t.flight} 预计 ${t.arrival} 抵达，携带两件大行李，提前确认落地出口。`;if(t.id==='contact')return t.advice;if(t.id==='order')return `与${t.customer}沟通今天 21:00 的机场接送报价，客户期望 ¥${t.requestedPrice}，达成一致后确认接单。`;if(t.id==='tour')return `确认陈志远一家黄果树出游安排，提前沟通老人和儿童的休息、用餐需求。`;return t.advice}
function allTasksBody(filter){const rank={'逾期':0,'待办':1,'已完成':2},all=[...reviewData().all].sort((a,b)=>rank[taskState(a)]-rank[taskState(b)]),shown=all.filter(t=>filter==='全部'||taskState(t)===filter);return `<div class="task-filters" role="tablist" aria-label="任务状态">${['全部','逾期','待办','已完成'].map(f=>`<button role="tab" aria-selected="${f===filter}" data-task-filter="${f}">${f}</button>`).join('')}</div>${shown.map(t=>`<div class="utility-row task-list-row"><span class="task-row-heading"><strong>${esc(t.name)}</strong><span class="task-state ${t.done?'done':taskState(t)==='逾期'?'late':''}">${taskState(t)}</span></span><span class="task-row-description">${esc(taskDescription(t))}</span><span class="task-row-meta"><span>${esc(t.day)} · ${esc(t.time)}</span></span></div>`).join('')||'<p class="review-empty">暂无'+filter+'任务</p>'}`}
function showReviewHistory(){if(!restoring)rememberPage();$('#utility').close();$('#history-title').textContent='复盘历史对话';$('#history-close').setAttribute('aria-label','关闭历史对话');$('#new-task').hidden=true;$('#history-tabs').hidden=true;$('#history-list').innerHTML=[...reviewConversations].reverse().map(c=>`<button class="history-row" data-review-history="${c.id}"><span class="history-icon"><img src="icons/chat-circle-dots.svg" alt=""></span><span class="history-copy"><strong>${esc(c.title)}</strong></span></button>`).join('')||'<p class="review-empty">暂无复盘对话<br>在底部向 AI 提问，开始第一次复盘</p>';if(!restoring)$('#history-search').value='';filterHistoryList();$('#history-drawer').show();syncOverlay()}
function reviewReply(text){const business=businessReply(text);if(business)return business;const d=reviewData();if(/客户|游客|乘客/.test(text))return `当前共 ${d.customers.length} 位客户。建议提前确认张晓雯的接驾位置，以及李明轩的上车点和行李需求。`;if(/订单|报价|收入/.test(text))return `当前关联 ${d.orders.length} 笔订单，报价合计 ¥${d.orders.reduce((n,t)=>n+t.price,0)}，不代表已结算收入。${tasks.find(t=>t.id==='order').done?'王静怡的订单已确认。':'建议优先与王静怡沟通报价，达成一致后确认接单。'}`;return `当前共有 ${d.all.length} 项任务，及时完成 ${d.timely.length} 项，逾期 ${d.late.length} 项。${taskReviewAdvice()}${/任务|复盘|完成|逾期|建议/.test(text)?'':'你也可以继续问我任务完成情况、客户沟通或订单报价。'}`}
function submitReview(text){submitAI(text)}
function renderReviewChat(){renderAI()}
$('#history-list').addEventListener('click',e=>{const row=e.target.closest('[data-review-history]');if(!row)return;reviewConversation=reviewConversations.find(c=>c.id===row.dataset.reviewHistory);goBack();renderReviewChat()});
document.addEventListener('click',e=>{if(e.target.closest('[data-all-tasks]'))openAllTasks();const filter=e.target.closest('[data-task-filter]');if(filter){$('#all-tasks-page').innerHTML=allTasksBody(filter.dataset.taskFilter);$('#all-tasks-page [aria-selected="true"]').focus();}const question=e.target.closest('[data-review-question]');if(question){goBack();submitReview(question.dataset.reviewQuestion)}if(e.target.closest('[data-review-back],[data-review-new]')){reviewConversation=null;renderReview()}});

function updateNavIcons(){const selected=activeTab==='profile'?'profile':activeTab==='ai'?'ai-tab':'home';for(const [id,icon] of [['home','nav-task'],['ai-tab','nav-chat'],['profile','nav-profile']]){const button=$('#'+id),active=id===selected;button.classList.toggle('selected',active);button.setAttribute('aria-current',active?'page':'false');button.querySelector('img').src=`icons/${icon}${active?'-selected.svg':'.png'}`}}
const allTasksPage=document.createElement('section');allTasksPage.id='all-tasks-page';allTasksPage.hidden=true;allTasksPage.setAttribute('aria-label','全部任务列表');$('.workspace').append(allTasksPage);
function openAllTasks(){allTasksOpen=true;$('#task-list').hidden=true;aiSection.hidden=true;$('#app').classList.add('secondary-page');reviewSection.hidden=true;allTasksPage.hidden=false;allTasksPage.innerHTML=allTasksBody('全部');updateHeader();$('#menu').focus()}
function closeAllTasks(){allTasksOpen=false;$('#app').classList.remove('secondary-page');allTasksPage.hidden=true;applyPageSurface(activeTab,false);updateHeader();$('[data-all-tasks]')?.focus()}
updateNavIcons();

function applyPageSurface(tab,allOpen){activeTab=tab;allTasksOpen=allOpen;$('#app').classList.toggle('review-mode',tab==='review');$('#app').classList.toggle('ai-mode',tab==='ai');$('#app').classList.toggle('secondary-page',allOpen);$('#task-list').hidden=tab!=='home'||allOpen;$('#task-summary').hidden=tab!=='home'||allOpen;reviewSection.hidden=tab!=='review'||allOpen;aiSection.hidden=tab!=='ai'||open;allTasksPage.hidden=!allOpen;$('#input').placeholder=tab==='review'?'和 AI 聊聊本次复盘':'告诉我你的目标';updateNavIcons()}
function refreshReviewSurfaces(){if(activeTab!=='review')return;const scroll=$('.review-feed')?.scrollTop||0;renderReview();if($('.review-feed'))$('.review-feed').scrollTop=scroll;if(allTasksOpen){const filter=$('#all-tasks-page [aria-selected="true"]')?.dataset.taskFilter||'全部',position=allTasksPage.scrollTop;allTasksPage.innerHTML=allTasksBody(filter);allTasksPage.scrollTop=position}}

function taskOpening(t){if(t.id==='trip-plan')return tripPlanDraft(t).replace(/^先按9月24日—9月26日安排一版3天2晚方案：\n\n/,'');if(t.id==='business-card')return '我们先聊聊你吧。你平时开什么车，主要跑哪些线路？也可以说说驾龄和擅长的服务，我来帮你整理成名片。';const description=taskDescription(t);if(t.done)return description+'\n这项任务已完成，可在下方查看处理记录。';if(t.id==='lost-hat')return description+'\n请检查车内后选择“是”或“否”，我会记录回复。';if(t.id==='contact')return description+'\n请核对这项安排。需要调整时，在下方告诉我。';const advice=t.id==='contact'?'建议先联系游客，确认碰面位置和行李需求。':t.id==='airport'?'建议先确认车辆出车准备，再开始出发；接近和到达接驾点时，我会协助提醒游客。':t.id==='prepare'?'建议在首次出车前上传车辆照并完成出车确认。':t.id==='order'?'建议先沟通报价，达成一致后再确认接单。':t.id==='tour'?'建议先联系游客，确认集合时间、同行人员和行李需求。':'建议先整理处理要求，处理后记录结果并完成任务。';return description+'\n'+(taskState(t)==='逾期'?'这项任务已逾期，请优先处理。':'')+advice}
function taskChatActions(t,enabled=true,actions=taskActions(t)){if(t.id==='business-card')return '';if(t.id==='trip-plan')return enabled?`<div class="agent-card-shortcuts"><button data-command="老人走路少一点">老人走路少一点 <span aria-hidden="true">↗</span></button></div>`:'';if(t.id==='contact')return t.done?'':`<div class="chat-task-actions"><button data-home-action="确认" data-task="${t.id}">可以</button></div>`;return actions.length?`<div class="chat-task-actions">${actions.map(a=>`<button data-action="${esc(a)}" data-task="${t.id}" ${!enabled||taskActionCompleted(t,a)?'disabled':''}>${buttonLabel(a)}</button>`).join('')}</div>`:''}
function introActions(m,msgs){return taskChatActions(current,!msgs.some(x=>x.role==='user'),m.extra||[])}

function syncInquiryHeader(){let controls=$('#inquiry-header-controls');if(!controls){controls=document.createElement('div');controls.id='inquiry-header-controls';controls.innerHTML='<button class="icon-button" data-header-sound aria-label="开启语音播报"><img src="icons/speaker-slash.svg" alt=""></button><button class="icon-button" data-header-intercom aria-label="打开对讲"><img src="icons/walkie-talkie.svg" alt=""></button><button class="capsule" data-header-more aria-label="微信状态与更多选项"><img src="icons/dots-three.svg" alt=""><i></i><img src="icons/record.svg" alt=""></button>';$('#utility .dialog-head').append(controls);controls.addEventListener('click',e=>{if(e.target.closest('[data-header-intercom]'))openIntercom();if(e.target.closest('[data-header-sound]')){$('#sound').click();syncInquiryHeader()}if(e.target.closest('[data-header-more]'))$('#more').click()})}controls.hidden=!$('#utility').classList.contains('new-task-dialog');controls.querySelector('[data-header-intercom]').hidden=activeTab!=='ai';const sound=controls.querySelector('[data-header-sound]');sound.setAttribute('aria-label',muted?'开启语音播报':'关闭语音播报');sound.querySelector('img').src=`icons/${muted?'speaker-slash':'speaker-high'}.svg`}

// Unified AI workspace. Task records remain shared with the workbench.
const aiSection=document.createElement('section');aiSection.id='ai-page';aiSection.hidden=true;$('.workspace').append(aiSection);
let aiTask=null;
function reviewShortcuts(type){
 const late=reviewData().late[0];
 const suggestions=type==='任务'?[late?`优先处理${late.name}，梳理后续安排`:'梳理待办任务，安排处理顺序','回顾已完成任务，找出改进点']:type==='客户'?['排查黄小西客户流失原因','向高客单、高复购客户推送Q4出行计划']:['成交额为什么下降','下月增长机会'];
 const labels=type==='任务'?[late?'安排逾期任务的处理顺序':'安排待办任务的处理顺序','回顾完成情况，找出改进点']:type==='客户'?['排查黄小西客户流失原因','制定 Q4 客户出行计划']:['分析成交额变化','寻找下月增长机会'];
 return `<div class="review-advice review-shortcuts"><div class="review-advice-heading"><span><span class="board-advice-icon" aria-hidden="true"></span>AI 建议</span><button class="review-chat-shortcut" data-ai-shortcut="想换个思路，和 AI 聊聊" data-ai-type="${type}" data-free="true">和 AI 聊聊<span class="board-chat-icon" aria-hidden="true"></span></button></div>${suggestions.map((q,i)=>`<button data-ai-shortcut="${esc(q)}" data-ai-type="${type}" data-free="false" aria-label="${esc(q)}"><span>${labels[i]}</span><img src="icons/caret-right.svg" alt=""></button>`).join('')}</div>`;
}
function newAIChat(){conversationPage=false;navigationStack.length=0;$('#input').placeholder='告诉我你的目标';if(activeTab!=='ai')switchTab('ai');if(open)closeChat();reviewConversation=null;aiTask=null;$('#input').value='';updateSend();renderAI();updateHeader()}
function formatAIMessage(text){return esc(text).replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>')}
function renderAI(){if(activeTab!=='ai')return;aiSection.hidden=open;if(open)return;const c=reviewConversation,t=aiTask,owner=c||t,scrollState=owner?conversationScrollState(owner):null,previousTop=aiSection.querySelector('.messages')?.scrollTop??scrollState?.top??0;const messages=c?.messages||(t?histories.get(t.id):[]);const existingBox=aiSection.querySelector('.messages'),messageHTML=messages.map((m,i)=>renderBusinessAIMessage(m,i,messages,owner)).join('');if(messages.length&&existingBox){existingBox.innerHTML=messageHTML;existingBox.setAttribute('aria-busy',String(messages.some(m=>m.streaming)))}else aiSection.innerHTML=`<div class="review-chat">${messages.length?`<div class="messages" role="log" aria-live="polite" aria-busy="${messages.some(m=>m.streaming)}">${messageHTML}</div>`:`<div class="ai-welcome"><h2>帮你做对事、赚到钱</h2></div><div class="ai-recommendations"><h3><span class="business-ideas-icon" aria-hidden="true"></span>经营点子</h3><div class="ai-prompt-list"><button data-ai-prompt="大地指纹音乐节火了，我想上架一个相关的服务">大地指纹音乐节火了，我想上架一个相关的服务 ↗</button><button data-ai-prompt="怎么多接高价单">怎么多接高价单 ↗</button><button data-ai-prompt="查看上周收入周报">查看上周收入周报 ↗</button></div></div>`}</div>`;const box=aiSection.querySelector('.messages');if(box&&owner){bindConversationScroll(box,owner);setConversationScroll(box,scrollState,scrollState.following?box.scrollHeight:previousTop)}}
function queueAIReply(messages,text,owner,animate=false,metadata={}){
 setTimeout(()=>{const message={role:'ai',text,...metadata};messages.push(message);streamReply(message,()=>{if(activeTab==='ai'&&!open&&(reviewConversation===owner||aiTask===owner)&&!$('#utility').open)renderAI()})},simulatedReplyDelay);
}
function submitAI(text,animate=false){
 text=text.trim();if(!text)return;
 if(activeTab==='review'){startReviewChat(/订单|报价|收入/.test(text)?'订单':/客户|游客|乘客/.test(text)?'客户':'任务',text);return}
 if(activeTab!=='ai')switchTab('ai');
 if(reviewConversation){conversationScrollState(reviewConversation).following=true;reviewConversation.messages.push({role:'user',text});queueAIReply(reviewConversation.messages,reviewReply(reviewConversation.type+'：'+text),reviewConversation,animate)}
 else{
  if(!aiTask){aiTask={id:'chat-'+Date.now(),chatOnly:true,day:today,time:new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'}),name:summarizeTask(text).name,icon:'chat-circle-dots',status:'进行中',actions:[],advice:text};tasks.push(aiTask);histories.set(aiTask.id,[])}
  conversationScrollState(aiTask).following=true;const messages=histories.get(aiTask.id);messages.push({role:'user',text});
  const reply=answerConversation(text,aiTask);
  const metadata=/前天/.test(text)&&/贵阳北站/.test(text)&&aiTask.stationTaskDemo?{kind:'station-task',task:{...aiTask.stationTaskDemo}}:/(?:上周|本周).*(收入|周报)|收入周报/.test(text)?{kind:'weekly-report'}:/大地指纹音乐节|音乐节.*(策划|服务)/.test(text)?{kind:'festival-options'}:{};
  queueAIReply(messages,reply,aiTask,animate,metadata);
 }
 $('#input').value='';updateSend();renderAI();
}
function startReviewChat(type,text,free=false){rememberPage();conversationPage=true;applyPageSurface('ai',false);aiTask=null;reviewConversation={id:'review-'+Date.now(),type:'复盘-'+type,title:text.slice(0,26),date:new Date().toLocaleString('zh-CN',{hour12:false}),messages:[]};reviewConversations.push(reviewConversation);reviewConversation.messages.push({role:'user',text});queueAIReply(reviewConversation.messages,free?`我们一起换个思路。关于${type}，你希望调整哪部分建议，或有什么实际情况需要补充？`:reviewReply(type+'：'+text),reviewConversation);renderAI();updateHeader();$('#input').placeholder=free?'说说你的想法或实际情况':'继续聊聊这条建议'}
document.addEventListener('click',e=>{const shortcut=e.target.closest('[data-ai-shortcut]');if(shortcut)startReviewChat(shortcut.dataset.aiType,shortcut.dataset.aiShortcut,shortcut.dataset.free==='true');if(e.target.closest('[data-ai-new]'))newAIChat();const prompt=e.target.closest('[data-ai-prompt]');if(prompt)submitAI(prompt.dataset.aiPrompt,true)});
updateHeader();

// Local context policy: structured checks stay in the checklist; communication gets AI assistance.
function tomorrowTripAdvice(){const day=localDate(tomorrowDate),list=tasks.filter(t=>!t.chatOnly&&t.day===day&&!t.done).sort((a,b)=>taskDeadline(a)-taskDeadline(b));return list.length?`明天共有 ${list.length} 项行程：\n\n${list.map(t=>`${t.time} ${t.name}：${t.from&&t.to?`${t.from} → ${t.to}。`:''}${taskPrompt(t.advice,t)}`).join('\n\n')}`:'目前没有明天的行程记录。新增行程后，我可以帮你整理出发时间、接驾地点和游客需求。'}
function todayTaskAdvice(){const day=localDate(new Date()),list=tasks.filter(t=>!t.chatOnly&&t.day===day),pending=list.filter(t=>!t.done),completed=list.filter(t=>t.done);if(!pending.length)return `今天的 ${list.length} 项任务都已完成。建议检查车内是否有遗留物品、补齐随车用品，再确认明日预约。`;const prep=pending.find(t=>t.id==='prepare'),scheduled=pending.filter(t=>t.id!=='prepare').sort((a,b)=>taskDeadline(a)-taskDeadline(b));const tips=scheduled.map(t=>{const late=taskState(t)==='逾期'?'（预约时间已过，请先确认实际进度）':'';let advice=t.flow?`当前${t.status}，下一步${rideStepsFor(t)[t.flowIndex].action}。`:t.id==='airport'?`从${t.from}接${t.customer}去${t.to}；提前确认航班出口和到达时间，结合实际路况安排出发。`:t.id==='contact'?`联系${t.customer}确认${t.from}的碰面位置，核对两件大行李的存放需求。`:t.id==='order'?t.negotiation==='agreed'?`已达成 ¥${t.price} 的报价，下一步确认接单。`:`与${t.customer}确认报价：当前 ¥${t.price}，客户期望 ¥${t.requestedPrice}。达成一致后再确认接单。`:taskDescription(t);return taskPrompt(`${t.time} ${t.name}${late}：${advice}`,t)});const next=tasks.find(t=>!t.chatOnly&&!t.done&&t.day>day);return [`今天还有 ${pending.length} 项待处理，已完成 ${completed.length} 项。建议按以下顺序安排：`,prep?'先上传车辆照，确认车况、证照、随车物品及司机状态后再出发。':'出车准备已完成，接下来按预约时间衔接各项任务。',...tips,next?`今天的任务安排妥当后，可提前沟通${next.time}的${next.name}，确认老人和儿童的休息、用餐需求。`:''].filter(Boolean).join('\n\n')}
$('#header-new-chat').onclick=newAIChat;

// Illustrative business metrics, separate from today's operational task records.
const businessMetrics={customers:120,convertedCustomers:48,channels:[['黄小西',60],['私域',42],['其它',18]],segments:[['企业',30],['高端',24],['亲子',42],['其它',24]],revenue:[['出行服务',30720],['佣金',5760],['其它',1920]],orders:64,inquiries:100,complaintRate:2.3};
const metricPercent=(n,total)=>Math.round(n/total*100);
function customerMetrics(){return dashboardCustomerMetrics()}
function orderMetrics(){return dashboardOrderMetrics()}
function businessReply(text){const d=businessMetrics,total=d.revenue.reduce((n,x)=>n+x[1],0);if(/黄小西|流失/.test(text))return `本月数据中，黄小西渠道有 ${d.channels[0][1]} 位客户，占客户总数的 50%。当前没有流失明细，暂时不能确定流失原因。\n\n建议先核对未成交客户的首次响应时间、报价后跟进、取消原因和服务反馈，再按“未响应、价格不匹配、行程变更、服务体验”分类，逐项排查。你可以补充一条客户记录，我们一起分析。`;if(/Q4|高客单|高复购/.test(text))return '按客户出行和消费记录，优先联系这 3 位高客单、高复购客户：\n\n1. 林女士｜近 12 个月出行 5 次，累计消费 ¥8,600；偏好亲子周末游，最近一次出行是 9 月 14 日。建议推荐 Q4 周末亲子路线。\n2. 陈志远｜近 12 个月出行 4 次，累计消费 ¥12,400；偏好商务接送，最近一次出行是 9 月 20 日。建议推荐固定用车方案。\n3. 王静怡｜近 12 个月出行 3 次，累计消费 ¥9,200；偏好定制游，最近一次出行是 8 月 28 日。建议推荐秋季短途路线。\n\n建议先向林女士发送：“您好，Q4 我们准备了适合亲子出行的周末路线。您近期有出游计划吗？告诉我人数和日期，我为您整理方案与报价。”\n\n以上是推荐名单和待发送话术，尚未向客户推送。';if(/下降|成交额/.test(text))return `本月营收为 ¥${total.toLocaleString()}，成交 ${d.orders} 笔，订单转化率 ${metricPercent(d.orders,d.inquiries)}%。目前缺少上月同期成交额及退款数据，不能确认下降幅度或原因。\n\n建议使用相同时间范围，依次比较有效询单量、订单转化率、平均客单价和退款金额；再拆分出行服务、佣金和其它收入。若询单减少，优先看渠道获客；若转化下降，检查响应和报价；若客单价下降，检查产品组合与折扣。`;if(/下月|增长机会/.test(text))return '结合当前营收结构，出行服务占营收 80%，佣金占 15%，其它占 5%。下月可优先验证三个增长方向：\n\n1. 企业客户：提前沟通商务接送与固定用车需求，争取连续订单。\n2. 高端、亲子客群：按预算和出行偏好组合定制路线，提高服务匹配度。\n3. 渠道转化：核对黄小西未成交线索，减少响应与跟进遗漏；向有意向的私域老客介绍 Q4 计划。\n\n先选一个客群小范围验证，每周记录询单、成交率、客单价和复购。当前数据不足以承诺增长幅度。';if(/复盘-客户/.test(text))return `本月客户总数 ${d.customers} 位，${d.convertedCustomers} 位已成交，客户转化率 40%。渠道占比为黄小西 50%、私域 35%、其它 15%；客群为企业 25%、高端 20%、亲子 35%、其它 20%。可以继续分析渠道流失或 Q4 客户经营计划。`;if(/复盘-订单/.test(text))return `本月营收 ¥${total.toLocaleString()}，成交 ${d.orders} 笔，订单转化率 64%。出行服务 ¥30,720、佣金 ¥5,760、其它 ¥1,920。可以继续讨论成交额变化或下月增长机会。`;return ''}

function homeTasks(){return activeTasks()}
function taskPrompt(text,t){return t?.customer&&t.id!=='trip-plan'?String(text).replaceAll(t.customer,'游客'):String(text)}
function formatTripPlanAdvice(text){return esc(text).replace(/毕节大方|食宿和演出|红枫湖|青岩古镇|按天包车/gu,word=>`<strong class="trip-plan-emphasis">${word}</strong>`)}
function formatTaskAdvice(text){return esc(text).replace(/\d{1,2}:\d{2}\s*前出发|\d{1,2}:\d{2}|[¥￥]\s*\d+(?:\.\d+)?|车辆照|出车确认|证照齐全|能源充足|车辆安全整洁|用品齐备|休息充足|酒驾和疲劳驾驶|26寸|28寸|东侧网约车上车点|两件大行李|2位老人|帽子|确认沟通结果|确认接单|坚持原价|同意改价|按此安排接驾/gu,match=>`<strong class="advice-emphasis">${match==='两件大行李'?'两件<span class="advice-word">大行李</span>':match}</strong>`)}
let taskHandoffPending=false;
function handoffCompletedTask(t,commit){
 const list=$('#task-list'),page=[...list.querySelectorAll('.task-page')].find(el=>el.querySelector('.task-card')?.dataset.id===t.id);
 const visible=page&&Math.abs(page.offsetTop-list.scrollTop)<list.clientHeight*.5;
 if(taskHandoffPending)return;
 if(!visible||activeTab!=='home'||open||$('#utility').open||$('#history-drawer').open||matchMedia('(prefers-reduced-motion: reduce)').matches){commit();return}
 taskHandoffPending=true;list.inert=true;stopTaskNarration();
 const exit=page.animate([{opacity:1,transform:'translateY(0) scale(1)'},{opacity:0,transform:'translateY(-30px) scale(.98)'}],{duration:280,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
 const backgroundExit=taskBackgrounds.animate([{opacity:1},{opacity:0}],{duration:280,easing:'ease-in',fill:'forwards'});
 exit.finished.catch(()=>{}).then(()=>{
  const index=Math.round(list.scrollTop/Math.max(1,list.clientHeight));
  commit();
  const nextIndex=Math.min(index,homeTasks().length-1);
  if(nextIndex>=0)list.scrollTop=nextIndex*list.clientHeight;
  queueTaskMotion();
  backgroundExit.cancel();
  if(activeTab==='home'){
   const next=list.querySelectorAll('.task-page')[nextIndex];
   next?.animate([{opacity:0,transform:'translateY(30px) scale(.98)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:420,easing:'cubic-bezier(.22,.8,.25,1)'});
   taskBackgrounds.animate([{opacity:0},{opacity:1}],{duration:420,easing:'ease-out'});
  }
  list.inert=false;taskHandoffPending=false;
 });
}
function completeHomeTask(t,message){if(t.done||taskHandoffPending)return;handoffCompletedTask(t,()=>{t.done=true;t.status='已完成';t.completedAt=new Date().toISOString();histories.get(t.id).push({role:'ai',text:message});renderTasks();refreshReviewSurfaces();toast('任务已完成，已移入历史任务')})}
function showPreparationCard(){if(open)goBack();const list=$('#task-list'),index=homeTasks().findIndex(task=>task.id==='prepare');if(index>=0)list.scrollTo({top:index*list.clientHeight,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}
function homeOrderHint(t){if(t.negotiation==='agreed')return `游客已按 ¥${t.price} 下单。请确认是否接单？`;if(t.insistedOriginal)return `已向游客提出按 ¥${t.price} 接单，等待回复。你仍可接受 ¥${t.requestedPrice}。`;if(t.negotiation==='proposal')return `报价正在协商。你可以提出 ¥${t.price}，或接受游客提出的 ¥${t.requestedPrice}。`;return t.advice}
let homeOrderReplyTimer;
function resolveHomeOrder(decision){const t=tasks.find(task=>task.id==='order');if(!t||t.done)return;if(decision==='keep'){if(t.insistedOriginal)return;t.insistedOriginal=true;t.negotiation='proposal';t.status='协商中';histories.get(t.id).push({role:'ai',text:`已向游客提出按 ¥${t.price} 接单，等待回复。`});toast(`已提出 ¥${t.price} 报价`);clearTimeout(homeOrderReplyTimer);homeOrderReplyTimer=setTimeout(()=>{if(t.done||t.negotiation!=='proposal'||!t.insistedOriginal)return;t.acceptedOriginal=true;t.negotiation='agreed';t.status='待接单';histories.get(t.id).push({role:'ai',text:homeOrderHint(t)});renderTasks();refreshReviewSurfaces();toast('游客已同意报价')},5000)}else if(decision==='agree'){clearTimeout(homeOrderReplyTimer);t.acceptedOriginal=false;t.price=t.requestedPrice;t.negotiation='agreed';t.status='待接单';histories.get(t.id).push({role:'ai',text:homeOrderHint(t)});toast('已同意改价，下一步确认接单')}else if(decision==='reject'){clearTimeout(homeOrderReplyTimer);handoffCompletedTask(t,()=>{t.done=true;t.rejected=true;t.status='已拒绝';t.completedAt=new Date().toISOString();histories.get(t.id).push({role:'ai',text:`已拒绝${t.customer}的订单。`});renderTasks();refreshReviewSurfaces();toast('已拒绝订单，已移入历史任务')});return}renderTasks();refreshReviewSurfaces()}
function openHomeContact(t){const draft=contactDraft(t);utility('联系游客',`<p class="utility-note">请先与${esc(t.customer)}确认行程安排。</p><div class="home-contact-draft">${esc(draft.draft)}</div><a class="home-contact-call" href="tel:${esc(t.phone)}">拨打 ${esc(maskPhone(t.phone))}</a><button class="new-task" data-home-contact-confirm="${t.id}">已完成联系</button>`)}
function confirmHomeContact(t){t.contactPending=true;t.passengerReply=contactReply(t);t.advice=`游客已回复：${t.passengerReply}。请确认沟通结果。`;histories.get(t.id).push({role:'ai',text:t.advice});goBack();renderTasks();toast('已记录联系结果，请确认沟通')}
function resolveLostHat(t,answer){
 if(t.done||taskHandoffPending||!['是','否'].includes(answer))return;
 t.itemFound=answer==='是';
 const reply=t.itemFound?'帽子在车上，我会先帮您保管，请联系我约定取回方式。':'检查过车内，暂时没有找到您的帽子。';
 histories.get(t.id).push({role:'user',text:answer});
 if(open&&current===t)goBack();
 completeHomeTask(t,`已回复乘客：${reply}`);
}
function runHomeAction(t,action){if(t.done)return;if(t.id==='charter-confirm'){resolveCharterOrder(t,action);return;}if(t.id==='lost-hat'){resolveLostHat(t,action);return;}if(t.id==='trip-plan'){showTask(t,false);return;}if(t.id==='business-card'){showTask(t,false);return;}if(t.id==='prepare'){if(action==='已确认'){preparation.confirmed=true;renderTasks()}else if(action==='已完成出车准备'&&preparationReady())finishPreparation();return}if(t.id==='contact'&&action==='需沟通'){if(t.luggageAsked)return;t.luggageAsked=true;t.advice='正在向游客确认行李箱尺寸，稍后告诉你结果。';histories.get(t.id).push({role:'ai',text:t.advice});renderTasks();setTimeout(()=>{if(t.done)return;t.luggageAnswered=true;t.advice='游客的行李箱尺寸是26寸和28寸。这个订单要接吗？';histories.get(t.id).push({role:'ai',text:t.advice});renderTasks();toast('已确认游客行李箱尺寸')},5000);return}if(t.id==='contact'&&action==='接不了'){if(taskSheet&&open)goBack();handoffCompletedTask(t,()=>{t.done=true;t.status='无法接驾';t.completedAt=new Date().toISOString();histories.get(t.id).push({role:'ai',text:'已记录无法按当前安排接驾，请及时与游客沟通后续安排。'});renderTasks();refreshReviewSurfaces();toast('已记录无法接驾')});return}if(t.id==='contact'&&action==='确认'){if(taskSheet&&open)goBack();completeHomeTask(t,'已确认游客的接驾地点与行李安排。');return}if(action==='去完成出车准备'){showPreparationCard();return}if(action==='出车准备'){openPreparation();return}if(t.id==='order'&&action==='确认接单'){if(t.negotiation==='agreed')completeHomeTask(t,`已按 ¥${t.price} 确认接单。`);return}if(action==='联系游客'){openHomeContact(t);return}if(action==='确认沟通'){t.contactPending=false;t.contactConfirmed=true;t.contactNotes=t.passengerReply||contactReply(t);if(t.id==='contact')completeHomeTask(t,`已确认与${t.customer}的沟通结果：${t.contactNotes}。`);else{t.advice='游客需求已确认，可以继续当前任务。';renderTasks();toast('沟通结果已确认')}return}if(action==='开始出发'&&!t.flow){if(t.day>today){toast('行程尚未开始，请先联系游客');return}if(!preparedDays.has(t.day)){openPreparation();return}t.flow=true;t.flowIndex=0;t.status=rideStepsFor(t)[0].name;histories.get(t.id).push({role:'ai',text:`已记录开始出发，下一步前往${t.from}。`});renderTasks();toast('已开始出发');return}if(t.flow&&action===rideStepsFor(t)[t.flowIndex].action){t.flowIndex++;if(t.flowIndex>=rideStepsFor(t).length-1){completeHomeTask(t,`已完成${t.customer}的${t.name}服务。`);return}t.status=rideStepsFor(t)[t.flowIndex].name;histories.get(t.id).push({role:'ai',text:`已记录：${t.status}。${rideStepsFor(t)[t.flowIndex].hint(t)}。`});renderTasks();return}if(t.id.startsWith('custom-')){if(action==='完成任务')completeHomeTask(t,`“${t.name}”已完成。`);else{t.customStage=1;t.actions=['完成任务'];t.advice=`${t.advice} 请确认处理结果后完成任务。`;renderTasks();toast('处理步骤已整理')}return}}
function orderDetailIcon(icon){return `<span class="order-detail-icon" aria-hidden="true"><img src="icons/${icon}.svg" alt=""></span>`}
function charterOrderRequirements(t){return `<p class="charter-order-requirements">${orderDetailIcon('map-trifold-fill')}<span>${[t.from,...(t.via||[]),t.to].map(esc).join('→')}</span></p>`}
function resolveCharterOrder(t,answer){
 if(t.done||taskHandoffPending||!['可以','接不了'].includes(answer))return;
 if(open&&current===t)goBack();
 handoffCompletedTask(t,()=>{
  t.accepted=answer==='可以';t.done=true;t.status=t.accepted?'已接单':'无法接单';t.completedAt=new Date().toISOString();
  histories.get(t.id).push({role:'user',text:answer},{role:'ai',text:t.accepted?'已确认接单。9月25日11:00在贵阳北站南广场接站，行程共2天、4位乘客、2件行李；请协助2位老人提行李，游玩时行李留在车上。':'已记录无法承接这笔9月25日-9月26日的包车订单。'});
  renderTasks();refreshReviewSurfaces();
 });
}
function homeTaskType(t){return t?.id==='charter-confirm'||t?.id==='contact'||t?.id==='order'||t?.id==='trip-plan'||t?.id==='lost-hat'?'communication':t?.id==='prepare'||t?.id==='business-card'||t?.id?.startsWith('custom-')?'compliance':'service'}
function businessCardSteps(){return `<ol class="preparation-summary business-card-steps"><li><strong>简单介绍自己</strong><p>昵称、联系方式、想做点什么、相关经验、资源</p></li><li><strong>上架你的服务</strong><p>服务内容、流程、价格、设施环境</p></li><li><strong>身份认证<span class="business-card-optional">（可选）</span></strong><p>上传个人证件与经营许可</p></li><li><strong>开通钱包<span class="business-card-optional">（可选）</span></strong><p>私密交易、及时分账</p></li></ol>`}
function homeRoute(t){
 const stops=[t.from,...(t.via||[]),t.to];
 if(t.id==='day-charter')return `<p class="home-route-summary">${orderDetailIcon('map-trifold-fill')}<span>${stops.map(esc).join('→')}</span></p>`;
 return `<div class="home-route">${stops.map((stop,index)=>`<div>${index===0?'<img class="home-route-marker" src="icons/route-start.svg" alt="起点">':index===stops.length-1?'<img class="home-route-marker" src="icons/route-end.svg" alt="终点">':'<span class="home-route-marker home-route-waypoint" role="img" aria-label="途经">经</span>'}${esc(stop)}</div>`).join('')}</div>`;
}
function homeCard(t){
 const orderTime=t.from&&t.to?(t.orderDate||t.orderTime||t.time):'';
 const actions=taskActions(t),orderChoices=t.id==='order'&&t.negotiation!=='agreed';
 const type=homeTaskType(t);
 const actionButtons=orderChoices
  ?`<button class="home-order-choice" data-order-decision="keep" ${t.insistedOriginal?'disabled':''}>太少了，加一点</button><button class="home-order-choice agree" data-order-decision="agree">接受 ¥${t.requestedPrice}</button>`
  :`${t.id==='order'&&t.negotiation==='agreed'?'<button class="home-order-choice" data-order-decision="reject">拒绝</button>':''}${(t.id==='contact'?(t.luggageAsked?['接不了','确认']:['需沟通','接不了','确认']):actions).map((a,i,visibleActions)=>`<button class="action primary ${(['lost-hat','charter-confirm'].includes(t.id)?i===1:i<visibleActions.length-1)?'outline':''}" data-task="${t.id}" data-home-action="${esc(a)}" ${taskActionCompleted(t,a)?'disabled':t.id==='prepare'&&a==='已完成出车准备'&&!preparationReady()?'disabled':''}><span>${esc(t.id==='contact'&&a==='需沟通'?'行李箱多大':t.id==='contact'&&a==='确认'?'可以':buttonLabel(a))}</span></button>`).join('')}`;
 return `<div class="home-card-stack"><article class="task-card task-type-${type}" data-id="${t.id}" style="--task-icon:url(icons/${t.icon}.svg)">
  <div class="home-card-heading"><h2 class="task-title">${esc(t.name)}</h2></div><div class="home-card-body">
  <div class="home-card-content"><div class="details">${t.id==='business-card'?businessCardSteps():t.id==='prepare'?'<ol class="preparation-summary"><li>确认车况、证照与随车物品</li><li>上传车辆照</li></ol>':t.customer?`<div class="customer"><strong>${esc(t.customer)}</strong>${t.phone?`<span>${esc(maskPhone(t.phone))}</span>${/^\d{11}$/.test(t.phone)?`<a class="home-call" href="tel:${esc(t.phone)}" aria-label="拨打${esc(t.customer)}电话"><img src="icons/phone.svg" alt=""></a>`:`<button type="button" class="home-call" data-masked-call aria-label="拨打${esc(t.customer)}电话"><img src="icons/phone.svg" alt=""></button>`}`:''}</div>${orderTime?`<p class="home-order-date">${orderDetailIcon('calendar-dots-fill')}<span>${esc(orderTime)}</span></p>`:''}${t.id==='charter-confirm'?charterOrderRequirements(t):t.id==='trip-plan'?`<p class="trip-plan-request">${esc(t.description)}</p>`:`${homeRoute(t)}`}`:''}${t.customer||t.id==='prepare'?'<div class="ticket-divider" aria-hidden="true"></div>':''}${t.id==='business-card'?'':t.id==='prepare'&&preparation.confirmed?`<div class="home-preparation-advice" aria-live="polite"><p class="advice home-ai-advice">${formatTaskAdvice(preparationCardAdvice())}</p><div class="home-preparation-uploads">${homePreparationUpload('vehiclePhoto','车辆照')}</div></div>`:`<p class="advice home-ai-advice">${t.id==='trip-plan'?formatTripPlanAdvice(visibleTaskAdvice(t)):formatTaskAdvice(visibleTaskAdvice(t))}</p>`}</div></div>
  <div class="home-card-bottom"><div class="actions ${orderChoices||t.id==='order'&&t.negotiation==='agreed'?'home-order-actions':''} ${t.id==='contact'?'home-contact-actions':''} ${t.luggageAsked?'home-contact-asked':''}">${actionButtons}</div>${['airport','day-charter'].includes(t.id)&&!preparedDays.has(t.day)?'<p class="home-preparation-hint">首次出车前，请先完成出车准备</p>':''}</div>
 </div></article></div>`
}

// One continuous wheel or touch gesture turns at most one card.
const taskList=$('#task-list');
taskList.addEventListener('change',e=>{const input=e.target.closest('[data-home-prep-photo]');if(!input)return;const file=input.files[0],key=input.dataset.homePrepPhoto;if(!file)return;if(!file.type.startsWith('image/')){toast('请选择图片文件');return}if(preparation[key])URL.revokeObjectURL(preparation[key]);preparation[key]=URL.createObjectURL(file);renderTasks()});
const turnTaskPage=(direction,index=Math.round(taskList.scrollTop/taskList.clientHeight))=>{const next=Math.max(0,Math.min(homeTasks().length-1,index+Math.sign(direction)));taskList.scrollTo({top:next*taskList.clientHeight,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})};
let flipWheelLocked=false,flipWheelTimer;
taskList.addEventListener('wheel',e=>{if(open||activeTab!=='home'||Math.abs(e.deltaY)<Math.abs(e.deltaX)||!e.deltaY)return;const card=e.target.closest('.home-card-body')||e.target.closest('.task-card');if(card&&card.scrollHeight>card.clientHeight+2&&((e.deltaY>0&&card.scrollTop+card.clientHeight<card.scrollHeight-2)||(e.deltaY<0&&card.scrollTop>0)))return;e.preventDefault();clearTimeout(flipWheelTimer);flipWheelTimer=setTimeout(()=>{flipWheelLocked=false},150);if(flipWheelLocked)return;flipWheelLocked=true;turnTaskPage(e.deltaY)},{passive:false});
let taskSwipe=null;
taskList.addEventListener('touchstart',e=>{if(open||activeTab!=='home'||e.touches.length!==1)return;const touch=e.touches[0];taskSwipe={x:touch.clientX,y:touch.clientY,index:Math.round(taskList.scrollTop/taskList.clientHeight),card:e.target.closest('.home-card-body')||e.target.closest('.task-card'),handled:false}},{passive:true});
taskList.addEventListener('touchmove',e=>{if(!taskSwipe||e.touches.length!==1)return;const touch=e.touches[0],dy=touch.clientY-taskSwipe.y,dx=touch.clientX-taskSwipe.x;if(Math.abs(dy)<5||Math.abs(dy)<Math.abs(dx))return;const card=taskSwipe.card,scrollDirection=-Math.sign(dy);if(card&&card.scrollHeight>card.clientHeight+2&&((scrollDirection>0&&card.scrollTop+card.clientHeight<card.scrollHeight-2)||(scrollDirection<0&&card.scrollTop>0))){taskSwipe=null;return}e.preventDefault();taskSwipe.handled=true},{passive:false});
taskList.addEventListener('touchend',e=>{if(!taskSwipe)return;const dy=(e.changedTouches[0]?.clientY??taskSwipe.y)-taskSwipe.y;if(taskSwipe.handled&&Math.abs(dy)>=70)turnTaskPage(-dy,taskSwipe.index);taskSwipe=null},{passive:true});
taskList.addEventListener('touchcancel',()=>{taskSwipe=null},{passive:true});
