// The timeline shows delivered conversations, not future task milestones.
function relatedTimelineTasks(t){
 const journey=['trip-plan','charter-confirm','day-charter'];
 if(journey.includes(t.id))return journey.map(id=>tasks.find(item=>item.id===id)).filter(Boolean);
 if(t.id==='prepare')return [t,...tasks.filter(item=>['airport','day-charter'].includes(item.id)&&item.day===t.day)];
 return [t];
}
const taskTimelineViews=new Map();
let timelineSpeech=null;
function timelinePeople(t,records){
 const people=new Map([
  ['ai',{id:'ai',name:'司导 AI',role:'AI'}],
  ['driver',{id:'driver',name:typeof profileInfo!=='undefined'?profileInfo.name:'我',role:'司导'}]
 ]);
 // Vehicle preparation involves the AI and driver, not passengers on linked orders.
 if(t.id==='prepare')return [...people.values()];
 for(const task of relatedTimelineTasks(t))if(task.customer)people.set('customer:'+task.customer,{id:'customer:'+task.customer,name:task.customer,role:'游客'});
 for(const record of records)if(!people.has(record.speakerId))people.set(record.speakerId,{id:record.speakerId,name:record.speakerName,role:record.role==='ai'?'AI':'参与者'});
 return [...people.values()];
}
function timelineAvatarHTML(id,name,role){
 if(id==='ai'||role==='AI'||role==='ai')return '<span class="task-person-avatar is-ai-avatar" aria-hidden="true"><img src="icons/task-timeline-agents.svg" alt=""></span>';
 const src=id==='driver'&&typeof profileInfo!=='undefined'?profileInfo.avatar:typeof customerRows!=='undefined'?customerRows.find(customer=>customer.name===name)?.avatar:'';
 return `<span class="task-person-avatar${src==='images/avatar.jpg'?' is-default-avatar':''}" aria-hidden="true">${src?`<img src="${esc(src)}" alt="">`:esc((name||'人').slice(0,1))}</span>`;
}
function timelineRecords(t){return getTaskConversationRecords(relatedTimelineTasks(t).map(item=>item.id));}
function timelineView(t,people){
 if(!taskTimelineViews.has(t.id))taskTimelineViews.set(t.id,{selected:new Set(people.map(person=>person.id)),known:new Set(people.map(person=>person.id)),draft:''});
 const view=taskTimelineViews.get(t.id);
 for(const person of people)if(!view.known.has(person.id)){view.known.add(person.id);view.selected.add(person.id);}
 return view;
}
function activeTimelineTask(){return $('#utility').open&&$('#utility').classList.contains('task-timeline-page')?tasks.find(t=>t.id===$('#task-dialogue-page')?.dataset.taskId):null;}
function timelineDate(value){return value?new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',month:'long',day:'numeric'}).format(value):'时间未记录';}
function timelineTime(value){return value?new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(value):'—';}
function timelineEventTitle(record){
 if(record.kind==='task-operation')return `点击「${record.operation.label}」`;
 if(record.purpose==='timeline-question')return '向 AI 提问';
 if(record.purpose==='timeline-answer')return '回复司导提问';
 if(record.kind==='visible-task-advice')return '给司导发送一个任务';
 if(record.kind==='task-intro')return '说明任务详情';
 if(record.attachment)return record.role==='ai'?'发送图片':'上传照片';
 return record.role==='ai'?'回复司导':'回复任务';
}
function timelineMessageHTML(record){
 const text=record.text||'',title=timelineEventTitle(record);
 const attachment=record.attachment&&/^(?:blob:|data:image\/|images\/)/.test(record.attachment.src)?`<img class="task-dialogue-photo" src="${esc(record.attachment.src)}" alt="${esc(record.attachment.label||'对话中的照片')}">`:'';
 const copy=record.kind==='task-operation'?`<p class="task-dialogue-operation">${esc(record.operation.content||text)}</p>`:text||attachment?`<details class="task-dialogue-long"><summary><span class="task-dialogue-expand">更多</span><span class="task-dialogue-collapse">收起</span><img src="icons/caret-right.svg" alt=""></summary>${text?`<p>${esc(text)}</p>`:''}${attachment}</details>`:'';
 return `<li class="task-dialogue-entry is-${record.role}" data-record-id="${esc(record.id)}"><span class="task-dialogue-dot" aria-hidden="true"></span><article class="task-dialogue-bubble" aria-label="${esc(record.speakerName)}：${esc(title)}"><div class="task-dialogue-meta"><time${record.recordedAt?` datetime="${new Date(record.recordedAt).toISOString()}"`:''}>${timelineTime(record.recordedAt)}</time></div><div class="task-dialogue-author">${timelineAvatarHTML(record.speakerId,record.speakerName,record.role)}<span>${esc(record.speakerName)}</span></div><h3 class="task-dialogue-event-title">${esc(title)}</h3><p class="task-dialogue-task-name">${esc(record.taskName)}</p>${copy}</article></li>`;
}
function timelineFeedHTML(t,records,selected){
 const shown=records.filter(record=>selected.has(record.speakerId));
 if(!shown.length)return `<div class="task-dialogue-empty"><img src="icons/chat-circle-dots.svg" alt=""><h3>${selected.size?'暂无对话或操作记录':'请选择要查看的角色'}</h3><p>${selected.size?'这些角色还没有对话或操作记录。':'点击上方角色，查看对应的消息。'}</p></div>`;
 let previousDate='';
 return `<ol class="task-dialogue-list">${shown.map(record=>{const date=timelineDate(record.recordedAt),heading=date!==previousDate?`<li class="task-dialogue-date"><span>${date}</span></li>`:'';previousDate=date;return heading+timelineMessageHTML(record);}).join('')}</ol>`;
}
function timelinePeopleHTML(people,view){
 return people.map(person=>`<button type="button" class="task-person-filter" data-timeline-person="${esc(person.id)}" aria-pressed="${view.selected.has(person.id)}" aria-label="${esc(person.name)}，${person.role}">${timelineAvatarHTML(person.id,person.name,person.role)}<span>${esc(person.name)}</span></button>`).join('');
}
function updateTimelineFeed(t,{bottom=false,reveal=[]}={}){
 const scroller=$('#task-dialogue-scroll');if(!scroller)return;
 const records=timelineRecords(t),people=timelinePeople(t,records),view=timelineView(t,people),position=scroller.scrollTop;
 const expanded=new Set([...scroller.querySelectorAll('details[open]')].map(detail=>detail.closest('[data-record-id]').dataset.recordId));
 reveal.forEach(id=>expanded.add(id));
 scroller.innerHTML=timelineFeedHTML(t,records,view.selected);
 scroller.querySelectorAll('[data-record-id]').forEach(entry=>{if(expanded.has(entry.dataset.recordId)){const detail=entry.querySelector('details');if(detail)detail.open=true;}});
 scroller.scrollTop=bottom?scroller.scrollHeight:position;
}
function renderTimelinePeople(t){
 const records=timelineRecords(t),people=timelinePeople(t,records),view=timelineView(t,people);
 $('#task-dialogue-people').innerHTML=timelinePeopleHTML(people,view);
}
function openTaskTimeline(t){
 if(!t)return;
 stopTaskNarration();
 const records=timelineRecords(t),people=timelinePeople(t,records),view=timelineView(t,people);
 // Each visit starts with every related person selected.
 view.selected=new Set(people.map(person=>person.id));
 utility('任务线',`<div id="task-dialogue-page" data-task-id="${esc(t.id)}"><section class="task-dialogue-toolbar" aria-label="相关角色筛选"><div class="task-dialogue-people" id="task-dialogue-people">${timelinePeopleHTML(people,view)}</div></section><section id="task-dialogue-scroll" class="task-dialogue-scroll" aria-label="已发生的对话与操作记录">${timelineFeedHTML(t,records,view.selected)}</section><footer class="task-dialogue-footer"><form id="task-dialogue-composer" class="task-dialogue-composer"><textarea name="question" rows="1" aria-label="向 AI 提问" placeholder="问问 AI，关于这些记录…" autocomplete="off">${esc(view.draft)}</textarea><button type="button" class="task-dialogue-mic" data-timeline-mic aria-label="语音输入"><img src="icons/microphone.svg" alt=""></button><button type="submit" class="task-dialogue-send" aria-label="发送给 AI" ${view.draft.trim()?'':'hidden'}><img src="icons/arrow-up.svg" alt=""></button></form><p id="task-dialogue-feedback" class="task-dialogue-feedback" role="status" hidden></p></footer></div>`);
 $('#utility').classList.add('profile-detail','task-timeline-page');
 syncOverlay();updateTimelineComposer();$('#utility-close').focus();
}
function updateTimelineComposer(){
 const form=$('#task-dialogue-composer');if(!form)return;
 const input=form.elements.question,filled=!!input.value.trim();
 form.querySelector('[type="submit"]').hidden=!filled;
 form.querySelector('[data-timeline-mic]').hidden=filled;
 input.style.height='auto';input.style.height=Math.min(input.scrollHeight,78)+'px';
 const task=activeTimelineTask();if(task)taskTimelineViews.get(task.id).draft=input.value;
}
function timelineRecordAnswer(question,records){
 const source=records.filter(record=>!['timeline-question','timeline-answer'].includes(record.purpose));
 if(!source.length)return '当前筛选范围内还没有已发生的对话。可以选择其他角色，再查看或总结他们的记录。';
 const quote=record=>`${record.speakerName}：${record.text||record.attachment?.label||'发送了照片'}`;
 const excerpt=record=>{const text=quote(record);return text.length>150?text.slice(0,150)+'…':text;};
 if(/谁|哪些人|人物|参与/.test(question)){
  const counts=new Map();for(const record of source)counts.set(record.speakerName,(counts.get(record.speakerName)||0)+1);
  return '当前记录中发过消息的有：\n'+[...counts].map(([name,count])=>`${name}，${count} 条消息`).join('\n');
 }
 if(/几点|什么时候|消息时间|对话时间/.test(question))return '这些消息的记录时间是：\n'+source.slice(-5).map(record=>`${timelineDate(record.recordedAt)} ${timelineTime(record.recordedAt)} · ${record.speakerName}`).join('\n');
 if(/确认|结论|结果/.test(question)){
  const confirmations=source.filter(record=>/(?:已确认|已完成|已同意|已接到|已送达|已发布|确认接单|已记录)/.test(record.text||''));
  return confirmations.length?'对话中明确记录的回复：\n\n'+confirmations.slice(-4).map(excerpt).join('\n\n'):'这些对话里暂时没有明确的确认结果。已有消息是：\n\n'+source.slice(-3).map(excerpt).join('\n\n');
 }
 if(/总结|概括|回顾|说了什么|重点/.test(question))return `当前筛选范围内有 ${source.length} 条已记录消息，最近的对话内容是：\n\n`+source.slice(-4).map(excerpt).join('\n\n');
 const keywords=question.match(/行李|老人|出发|接站|航班|车辆|照片|车况|证照|英语|名片|价格|报价|改价|发布|酒店|地点|客户|帽子|时间/g)||[];
 const matches=source.filter(record=>keywords.some(word=>(record.text||'').includes(word)));
 return matches.length?'相关对话记录：\n\n'+matches.slice(-4).map(excerpt).join('\n\n'):'当前已记录的对话里，没有直接提到这个问题。你可以让我总结对话、查找已确认的信息，或询问记录中出现的具体内容。';
}
function submitTimelineQuestion(text){
 const task=activeTimelineTask();text=text.trim();if(!task||!text)return;
 const records=timelineRecords(task),people=timelinePeople(task,records),view=timelineView(task,people);
 const answer=timelineRecordAnswer(text,records.filter(record=>view.selected.has(record.speakerId)));
 view.selected.add('driver');view.selected.add('ai');view.draft='';
 const questionRecord=appendTaskConversation(task.id,{role:'human',speakerId:'driver',text,purpose:'timeline-question'});
 const answerRecord=appendTaskConversation(task.id,{role:'ai',speakerId:'ai',text:answer,purpose:'timeline-answer'});
 $('#task-dialogue-composer').elements.question.value='';
 renderTimelinePeople(task);updateTimelineComposer();updateTimelineFeed(task,{bottom:true,reveal:[questionRecord?.id,answerRecord?.id].filter(Boolean)});
}
function stopTimelineSpeech(){if(timelineSpeech){timelineSpeech.abort();timelineSpeech=null;}}
function startTimelineSpeech(){
 if(timelineSpeech){timelineSpeech.stop();return;}
 const Speech=window.SpeechRecognition||window.webkitSpeechRecognition,feedback=$('#task-dialogue-feedback'),mic=$('[data-timeline-mic]'),input=$('#task-dialogue-composer')?.elements.question;
 if(!input)return;
 const status=text=>{if(feedback.isConnected){feedback.hidden=false;feedback.textContent=text;}};
 if(!Speech){status('当前浏览器不支持语音输入，可以直接输入文字。');input.focus();return;}
 const recognition=new Speech();timelineSpeech=recognition;recognition.lang='zh-CN';recognition.interimResults=false;
 mic.classList.add('is-listening');mic.setAttribute('aria-label','停止语音输入');status('正在聆听，识别后可编辑并发送');
 recognition.onresult=e=>{if(input.isConnected){input.value=e.results[0][0].transcript;updateTimelineComposer();status('已转为文字，确认后发送');}};
 recognition.onerror=e=>status(e.error==='not-allowed'?'未获得麦克风权限，可以直接输入文字。':'未能识别语音，请重试或输入文字。');
 recognition.onend=()=>{if(timelineSpeech===recognition)timelineSpeech=null;mic.classList.remove('is-listening');mic.setAttribute('aria-label','语音输入');};
 try{recognition.start();}catch{timelineSpeech=null;mic.classList.remove('is-listening');status('语音暂不可用，可以直接输入文字。');}
}
$('#utility-body').addEventListener('input',e=>{if(e.target.closest('#task-dialogue-composer'))updateTimelineComposer();});
$('#utility-body').addEventListener('keydown',e=>{if(e.target.matches('#task-dialogue-composer textarea')&&e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();submitTimelineQuestion(e.target.value);}});
$('#utility-body').addEventListener('submit',e=>{if(e.target.id==='task-dialogue-composer'){e.preventDefault();submitTimelineQuestion(e.target.elements.question.value);}});
new MutationObserver(()=>{if(!activeTimelineTask())stopTimelineSpeech();}).observe($('#utility'),{attributes:true,attributeFilter:['open','class']});
window.addEventListener('pagehide',stopTimelineSpeech);
window.addEventListener('task-conversation-updated',()=>{const task=activeTimelineTask();if(task){renderTimelinePeople(task);updateTimelineFeed(task);}});
// The card's voice gesture is handled in place by task-card-voice.js.
document.addEventListener('click',e=>{
 const timeline=e.target.closest('[data-task-timeline]');if(timeline){openTaskTimeline(tasks.find(t=>t.id===timeline.dataset.taskTimeline));return;}
 const task=activeTimelineTask();if(!task)return;
 const person=e.target.closest('[data-timeline-person]');if(person){const view=taskTimelineViews.get(task.id),id=person.dataset.timelinePerson;view.selected.has(id)?view.selected.delete(id):view.selected.add(id);person.setAttribute('aria-pressed',String(view.selected.has(id)));updateTimelineFeed(task);return;}
 if(e.target.closest('[data-timeline-mic]'))startTimelineSpeech();
});
