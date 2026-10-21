// Personal storefront; like the rest of the prototype, changes live in memory.
const profileInfo={name:'杨通海',bio:polishBusinessIntroduction({introductionNotes:[businessCardDefaultIntroduction]}),avatar:'images/agent-avatar.png',cover:'images/system-cover-1.png'};
let services=[{id:'scenic',type:'日包车',title:'按天包车',content:'贵阳出发·按天包车（0.5天起）·省内纯玩',price:900,priceUnit:'天',image:'images/service-day-charter.png'},{id:'transfer',type:'点对点包车',title:'定点包车',content:'贵阳出发·市区 / 景区 / 机场接送',price:260,image:'images/service-point-to-point.png'}];
services.push({id:'anshun-21',category:'商品',type:'旅行线路',title:'安顺21℃计划2日游',content:'商务包车 / 司导服务 / 四钻住宿',price:1980,priceUnit:'人',image:'images/anshun-21-cover.png',detailImage:'images/anshun-21-detail.png',detailWidth:750,detailHeight:11261});
services.push({id:'promotion-nature',category:'商品',type:'旅行线路',title:'自然珍宝奇趣之旅7天6晚大环线',content:'商务包车 / 司导服务 / 优选餐厅',price:3980,priceUnit:'人',image:'images/promotion-nature-cover.png',detailImage:'images/promotion-nature-detail.jpg',detailWidth:750,detailHeight:13691});
const homepageServiceSections={
  "scenic": [
    {
      "title": "服务描述",
      "text": "贵阳出发·按天包车（0.5天起）·省内纯玩\n0.5天（4小时）起订，以0.5天为计费单位递增。租期内行程路线由您自由安排，司导全程跟随，适合一日游、商务接送、半日短途等多种场景。"
    },
    {
      "title": "计费说明",
      "items": [
        "起步0.5天，超出后按0.5天为单位向上取整（如5小时按1天计，9小时按1.5天计）",
        "超里程：超出包含里程部分，按车型费率加收（5座3元/km、7座4元/km、9座5元/km）",
        "超时长：超出包含时长部分，按车型费率加收（5座50元/h、7座60元/h、9座70元/h）",
        "服务时间：07:00–22:00；22:00–次日06:00 夜间服务加收50元/次"
      ]
    },
    {
      "title": "费用包含",
      "items": [
        "车辆使用费、燃油费",
        "专业司导服务费（兼司机+导游）",
        "每日包含里程内的油费",
        "车内矿泉水、充电线、湿巾"
      ]
    },
    {
      "title": "费用不含",
      "items": [
        "高速过路费、停车费（实报实销）",
        "景区门票、餐饮费用",
        "司机食宿补贴：租期≥2天或异地过夜时，100元/天",
        "个人消费及以上未提及项目"
      ]
    },
    {
      "title": "退改规则",
      "items": [
        "出发前24小时：免费取消或改期",
        "出发前24小时内：收取30%违约金",
        "服务开始后：不予退款",
        "因天气/交通管制等不可抗力：全额退款或免费改期"
      ]
    },
    {
      "title": "温馨提示",
      "items": [
        "高峰期（节假日/周末）建议提前3–7天预订",
        "如需儿童安全座椅请提前告知，免费提供",
        "行程中如需更改目的地，请提前与司导协商，超出部分按标准加收"
      ]
    }
  ],
  "transfer": [
    {
      "title": "服务描述",
      "text": "贵阳出发·市区 / 景区 / 机场接送\n司导一体：本人10年以上本地驾龄司机，兼持证导游，开车讲解两不误",
      "items": [
        "路况熟：熟悉贵阳及周边（黄果树、荔波、西江千户苗寨、梵净山、兴义等）全部路线，避开拥堵",
        "纯玩承诺：无购物、无隐形消费，行程自由，随时停靠拍照",
        "车辆整洁：七座商务，每日清洁消毒，车内常备矿泉水、充电线、雨伞，最多承运6人4大件行李",
        "安全可靠：全额营运保险，驾驶记录良好，可提供资质核验"
      ]
    },
    {
      "title": "下单须知",
      "items": [
        "拍前请先咨询，确认日期、路线、人数后再付款",
        "高峰期（节假日 / 周末）建议提前3–7天预订",
        "出发前24小时可免费取消；24小时内取消收取30%违约金"
      ]
    },
    {
      "title": "包车流程",
      "text": "下单付款-司机接单-沟通确认-接驾出发-行程结束"
    },
    {
      "title": "计费方式",
      "items": [
        "点对点一口价：按实际行程耗时计算，起步含2小时基础服务",
        "超时长：超出基础时长按50元 / 小时加收，不足1小时按1小时计",
        "服务时段：07:00–22:00正常服务；22:00–次日06:00夜间服务加收夜间费",
        "等待费：客户原因导致等待，超30分钟后按30元 / 小时计"
      ]
    },
    {
      "title": "费用说明",
      "items": [
        "费用含：车辆使用费、司机服务费、燃油费、景点讲解",
        "费用不含：高速过路费（实报实销）、停车费、景区门票、司机食宿（跨天 / 异地时补贴 100 元 / 天）",
        "夜间费：22:00–06:00 时段加收 50 元 / 次"
      ]
    }
  ]
};
const serviceUnit=type=>type==='日包车'?'半天':'次';
const serviceDrafts={日包车:{title:'贵阳出发|按天包车（0.5天起）|省内纯玩',content:'0.5天（4小时）起订，以0.5天为计费单位递增。租期内行程路线由您自由安排，司导全程跟随，适合一日游、商务接送、半日短途等多种场景。',location:'贵阳及周边',image:'images/service-day-charter.png'},点对点包车:{title:'贵阳出发｜点对点包车｜市区 / 景区 / 机场接送',content:'司导一体：本人10年以上本地驾龄司机，兼持证导游，开车讲解两不误。熟悉贵阳及周边路线，无购物、无隐形消费，七座商务车每日清洁消毒，最多承运6人和4大件行李。',location:'贵阳市区及周边',image:'images/service-point-to-point.png'}};
const profilePage=document.createElement('section');profilePage.id='profile-page';profilePage.hidden=true;profilePage.setAttribute('aria-label','我的');$('.workspace').append(profilePage);
const signedOutScreen=document.createElement('section');signedOutScreen.className='signed-out-screen';signedOutScreen.hidden=true;signedOutScreen.setAttribute('role','dialog');signedOutScreen.setAttribute('aria-label','已退出登录');signedOutScreen.innerHTML='<div><h2>已退出登录</h2><p>你可以随时重新进入司导工作台。</p><button type="button" data-profile-relogin>重新登录</button></div>';$('#app').append(signedOutScreen);let signedOutInert=[];
function signOut(){navigationStack.length=0;$('#utility').close();syncOverlay();signedOutInert=[...$('#app').children].filter(el=>el!==signedOutScreen).map(el=>[el,el.inert]);signedOutInert.forEach(([el])=>el.inert=true);signedOutScreen.hidden=false;signedOutScreen.querySelector('button').focus()}
function signIn(){signedOutScreen.hidden=true;signedOutInert.forEach(([el,value])=>el.inert=value);signedOutInert=[];switchTab('profile')}
const miniappControls=document.createElement('div');miniappControls.className='miniapp-controls';
miniappControls.append($('#more'));$('#app').append(miniappControls);
const homepageActions=document.createElement('div');homepageActions.className='homepage-actions';homepageActions.innerHTML='<button data-profile-edit>编辑主页</button>';$('#utility .dialog-head').append(homepageActions);
$('#utility-body').addEventListener('scroll',()=>{if($('#utility').classList.contains('personal-homepage'))$('#utility').classList.toggle('homepage-scrolled',$('#utility-body').scrollTop>0)},{passive:true});
const customerChatEntry=document.createElement('button');customerChatEntry.type='button';customerChatEntry.className='icon-button customer-chat-entry';customerChatEntry.setAttribute('aria-label','查看对话记录');customerChatEntry.setAttribute('data-customer-chat','');customerChatEntry.innerHTML='<img src="icons/chat-circle-dots.svg" alt="">';$('#utility .dialog-head').append(customerChatEntry);
const genderSheet=document.createElement('div');genderSheet.className='gender-sheet';genderSheet.hidden=true;genderSheet.setAttribute('role','dialog');genderSheet.setAttribute('aria-modal','true');genderSheet.setAttribute('aria-label','选择性别');genderSheet.innerHTML='<button type="button" class="gender-sheet-backdrop" data-gender-close aria-label="关闭性别选择"></button><div class="gender-sheet-panel"><div class="gender-sheet-head"><strong>选择性别</strong><button type="button" data-gender-close aria-label="关闭">×</button></div><div class="gender-sheet-options">'+['未录入','女','男'].map(value=>`<button type="button" data-gender-option="${value}" role="radio" aria-checked="false">${value}<span aria-hidden="true">✓</span></button>`).join('')+'</div></div>';$('#utility').append(genderSheet);
function closeGenderSheet(){genderSheet.hidden=true;$('#customer-edit-form [data-gender-picker]')?.focus({preventScroll:true})}
genderSheet.addEventListener('click',e=>{const choice=e.target.closest('[data-gender-option]');if(choice){const form=$('#customer-edit-form');form.elements.gender.value=choice.dataset.genderOption;form.querySelector('[data-gender-value]').textContent=choice.dataset.genderOption;closeGenderSheet();return}if(e.target.closest('[data-gender-close]'))closeGenderSheet()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!genderSheet.hidden){e.preventDefault();e.stopImmediatePropagation();closeGenderSheet()}},true);
document.addEventListener('click',e=>{if(!genderSheet.hidden&&e.target.closest('#utility-close')){e.preventDefault();e.stopImmediatePropagation();closeGenderSheet()}},true);
const defaultCovers=[{src:'images/system-cover-1.png',name:'背景图1'},{src:'images/system-cover-2.jpg',name:'背景图2'},{src:'images/system-cover-3.jpg',name:'背景图3'}];
const money=n=>Number(n).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});
function serviceCardMarkup(service,detail=false){
 return `<article class="service-card">${service.image?`<img class="service-image" src="${esc(service.image)}" alt="${esc(service.title)}">`:`<span class="service-image service-image-empty">暂无图片</span>`}<div class="service-copy"><h4>${esc(service.title)}</h4><p>${esc(service.content)}</p><div class="service-bottom"><strong><small>¥</small>${Number(service.price).toLocaleString('zh-CN')}<em>/${esc(service.priceUnit||serviceUnit(service.type))}${service.priceFrom?' 起':''}</em></strong>${detail?`<button class="service-detail-entry" data-business-service-detail="${esc(service.id)}" aria-label="查看服务详情：${esc(service.title)}">查看详情 ↗</button>`:`<div><button data-service-delete="${service.id}" aria-label="删除${esc(service.title)}">删除</button><button data-service-edit="${service.id}">编辑</button></div>` }</div></div></article>`;
}
const profileOrderEntries=[['进行中','car'],['待付款','wallet'],['待出行','luggage'],['退款/售后','refund']];
// Keep the supplied PNGs intact; frame their visible artwork inside the existing icon slot.
const orderImageBounds={car:[242,403,1011,869],wallet:[278,322,1006,941],luggage:[385,276,869,1016],refund:[336,372,918,882]};
function orderIconMarkup(icon){const [left,top,right,bottom]=orderImageBounds[icon],size=Math.max(right-left,bottom-top)/.9,x=(left+right-size)/2,y=(top+bottom-size)/2;return `<svg class="account-order-icon" viewBox="${x} ${y} ${size} ${size}" aria-hidden="true" focusable="false"><image href="icons/order-upload-${icon==='refund'?'refund-v2':icon}.png" width="1254" height="1254"/></svg>`}
let storefrontFilter='服务';
function profileAvatar(){return `<span class="profile-avatar"><img class="${profileInfo.avatar==='images/avatar.jpg'?'default-avatar':''}" src="${esc(profileInfo.avatar)}" alt="${esc(profileInfo.name)}的头像"></span>`}
function renderProfile(){
 const scroll=profilePage.scrollTop;
 profilePage.innerHTML=`<div class="account-cover"><img src="${esc(profileInfo.cover)}" alt="个人背景图"></div><div class="account-content"><button class="account-identity" data-profile-home aria-label="查看${esc(profileInfo.name)}的个人主页">${profileAvatar()}<strong>${esc(profileInfo.name)}</strong><img class="account-chevron" src="icons/caret-right.svg" alt=""></button><section class="account-orders" aria-labelledby="account-orders-title"><div class="account-section-heading"><h2 id="account-orders-title">我的订单</h2><button data-profile-orders="全部">全部<img class="account-chevron" src="icons/caret-right.svg" alt=""></button></div><div class="account-order-links">${profileOrderEntries.map(([label,icon])=>`<button data-profile-orders="${label}">${orderIconMarkup(icon)}<span>${label}</span></button>`).join('')}</div></section><div class="account-menu">${[['wallet','wallet','钱包'],['tasks','clipboard-text','任务'],['customers','users','客户'],['notifications','bell','通知'],['settings','gear','设置']].map(([key,icon,label])=>`<button data-profile-route="${key}"><img src="icons/account-menu-${icon}.svg?v=2" alt=""><span>${label}</span><img class="account-chevron" src="icons/caret-right.svg" alt=""></button>`).join('')}</div></div>`;
 profilePage.scrollTop=scroll;
 refreshPersonalHomepage();
}
function storefrontProducts(){return services.filter(service=>(service.category||'服务')===storefrontFilter).map(service=>`<article class="homepage-product"><button class="homepage-product-open" data-profile-service="${esc(service.id)}" aria-label="查看服务：${esc(service.title)}"></button>${service.image?`<img class="homepage-product-image" src="${esc(service.image)}" alt="${esc(service.title)}">`:'<span class="homepage-product-placeholder">暂无图片</span>'}<div class="homepage-product-copy"><h3><span class="homepage-product-title">${esc(service.title)}</span></h3><p>${esc(service.content)}</p>${service.promotion?'<span class="homepage-promotion-badge">推广商品</span>':''}<div class="homepage-product-bottom"><b><small>￥</small>${Number(service.price).toLocaleString('zh-CN')}<small>/${esc(service.priceUnit||serviceUnit(service.type))}${service.priceFrom?' 起':''}</small></b><div class="homepage-product-manage"><button data-service-delete="${esc(service.id)}" aria-label="删除${esc(service.title)}">删除</button>${service.category==='商品'?'':`<button data-service-edit="${esc(service.id)}">编辑</button>`}</div></div></div></article>`).join('')||`<p class="profile-empty">还没有发布${storefrontFilter}</p>`}
function personalHomepageBody(){return `<div class="homepage-cover"><img src="${esc(profileInfo.cover)}" alt="个人主页背景"></div><div class="homepage-flow"><article class="homepage-guide">${profileAvatar()}<button type="button" class="icon-button homepage-card-share" data-profile-share aria-label="分享主页"><img src="icons/share-network-primary.svg" alt=""></button><h2>${esc(profileInfo.name)}</h2><p class="homepage-role">贵旅出行·文旅推荐官</p><div class="homepage-tags">${businessCardTagsHTML()}</div><p class="homepage-bio">${esc(profileInfo.bio)}</p><div class="homepage-stats"><div><strong>68</strong><span>被关注</span></div><div><strong>37</strong><span>被分享</span></div><div><strong>98.3%</strong><span>好评率</span></div></div></article></div><section class="homepage-store"><div class="homepage-store-heading"><nav class="homepage-filters" role="tablist" aria-label="橱窗分类">${['服务','商品'].map(label=>`<button role="tab" aria-selected="${storefrontFilter===label}" data-storefront-filter="${label}">${label}</button>`).join('')}</nav>${storefrontFilter==='服务'?'<button class="homepage-publish" data-service-new><img src="icons/plus-primary.svg" alt="">发布</button>':''}</div><div class="homepage-products">${storefrontProducts()}</div></section>`}
function openPersonalHomepage(category='服务'){storefrontFilter=category==='商品'?'商品':'服务';profileDetail('个人主页',personalHomepageBody());$('#utility').classList.add('personal-homepage');$('#utility-body').scrollTop=0;syncOverlay()}
function refreshPersonalHomepage(){if($('#utility').open&&$('#utility').classList.contains('personal-homepage')){const scroll=$('#utility-body').scrollTop;$('#utility-body').innerHTML=personalHomepageBody();$('#utility-body').scrollTop=scroll}}
function profileShareText(){return `${profileInfo.name}｜贵旅出行·文旅推荐官\n${profileInfo.bio}\n\n${services.map(s=>`${s.title} · ￥${s.price}/${s.priceUnit||serviceUnit(s.type)}${s.priceFrom?' 起':''}`).join('\n')}`}
async function shareProfile(){const text=profileShareText();if(navigator.share){try{await navigator.share({title:`${profileInfo.name}的个人主页`,text});return}catch(error){if(error.name==='AbortError')return}}profileDetail('分享主页',`<p class="profile-subtitle">复制主页介绍，分享给朋友</p><textarea class="profile-share-text" aria-label="主页分享内容" readonly>${esc(text)}</textarea><button class="profile-primary" data-copy-profile>复制分享内容</button><p class="profile-share-status" role="status"></p>`)}
$('#profile').onclick=()=>switchTab('profile');
function profileDetail(title,body){genderSheet.hidden=true;utility(title,body);$('#utility').classList.add('profile-detail');syncOverlay();}
function imageField(name,label,src){return `<label class="mobile-image-picker ${name==='avatar'?'avatar-picker':name==='cover'?'cover-picker':'service-picker'}"><span class="image-picker-label">${label}</span><span class="image-picker-preview ${src?'':'is-empty'}"><img data-image-preview="${name}" class="${name==='avatar'&&src==='images/avatar.jpg'?'default-avatar':''}" ${src?`src="${esc(src)}"`:''} alt="${label}预览"><span class="image-picker-overlay"><img src="icons/camera.svg" alt=""><span>${name==='avatar'?'更换头像':src?'更换图片':'添加图片'}</span></span></span>${name==='avatar'?'<span class="avatar-camera" aria-hidden="true"><img src="icons/camera.svg" alt=""></span>':''}<input type="file" name="${name}" accept="image/*" aria-label="${name==='avatar'?'更换头像':name==='cover'?'上传自定义背景':'选择服务图片'}"></label>`}
function editProfile(){profileDetail('编辑主页',`<form id="profile-edit-form" class="profile-form">${imageField('avatar','头像',profileInfo.avatar)}<label>名字<input name="name" required maxlength="20" value="${esc(profileInfo.name)}"></label><label>个人简介<textarea name="bio" required maxlength="150" rows="4">${esc(profileInfo.bio)}</textarea></label><section class="cover-editor"><h3>背景图</h3>${imageField('cover','当前背景',profileInfo.cover)}<p class="cover-presets-label">系统背景</p><div class="cover-presets" role="group" aria-label="选择系统背景">${defaultCovers.map(c=>`<button type="button" data-cover-preset="${c.src}" aria-label="选择${c.name}" aria-pressed="${profileInfo.cover===c.src}"><img src="${c.src}" alt="${c.name}"><i aria-hidden="true">✓</i></button>`).join('')}</div></section><button class="profile-primary" type="submit">保存主页</button></form>`)}
function editService(id){const service=services.find(s=>s.id===id),type=service?.type||'日包车',image=service?.image||'';profileDetail(service?'编辑服务':'发布服务',`<form id="service-edit-form" data-id="${service?.id||''}" class="profile-form" novalidate><div class="publish-details"><div class="publish-type-row"><span>服务类型</span><div class="publish-type-options" role="radiogroup" aria-label="服务类型"><label><input type="radio" name="type" value="日包车" ${type==='日包车'?'checked':''}><span>日包车</span></label><label><input type="radio" name="type" value="点对点包车" ${type==='点对点包车'?'checked':''}><span>点对点包车</span></label></div></div><label class="publish-price-row"><span>价格</span><span class="publish-price-input"><b>¥</b><input name="price" type="text" inputmode="decimal" required placeholder="0.00" value="${service?.price||''}" aria-label="价格（元）"><span data-price-unit>/${service?.priceUnit||serviceUnit(type)}</span></span></label></div><div class="publish-content"><label class="mobile-image-picker service-picker publish-image-picker"><span class="image-picker-preview ${image?'':'is-empty'}"><img data-image-preview="image" ${image?`src="${esc(image)}"`:''} alt="服务图片预览"><span class="image-picker-overlay"><img src="icons/plus.svg" alt=""><span>${image?'更换服务图片':'添加服务图片'}</span></span></span><input type="file" name="image" accept="image/*" aria-label="选择服务图片"></label><input class="publish-title" name="title" required maxlength="40" placeholder="填写服务标题" aria-label="服务标题" value="${esc(service?.title||'')}"><textarea class="publish-description" name="content" required maxlength="300" placeholder="介绍服务流程、时长、个人优势等" aria-label="服务内容">${esc(service?.content||'')}</textarea><div class="publish-content-bottom"><label class="publish-location"><img src="icons/map-pin.svg" alt=""><input name="location" maxlength="30" aria-label="服务地" placeholder="服务地，如：贵阳及周边" value="${esc(service?.location||'')}"></label><button type="button" class="service-ai-button" data-service-ai><img src="icons/sparkle.svg" alt="">AI 帮你写</button></div></div><button class="profile-primary publish-submit" type="submit">${service?'保存修改':'发布'}</button></form>`)}
const customerPresentation={
 airport:{avatar:'images/lake.jpg',tags:['机场接送','专车服务','高客单','高复购'],requests:[],preferences:'偏好专车接送，重视准时接驾'},
 contact:{avatar:'images/system-cover-2.jpg',tags:['车站接送','大件行李'],requests:['携带两件大行李，请确认车辆空间','请提前确认贵阳北站南广场碰面位置'],preferences:'暂无历史偏好记录'},
 order:{avatar:'images/landscape.jpg',tags:['机场送机','报价沟通'],requests:['希望将本次接送报价由 ¥240 调整为 ¥220'],preferences:'暂无历史偏好记录'},
 tour:{avatar:'images/system-cover-3.jpg',tags:['亲子出游','老人同行'],requests:['请提前沟通老人和儿童的休息安排','请提前沟通黄果树一日游的用餐安排'],preferences:'暂无历史偏好记录'}
};
const customerRows=tasks.filter(t=>t.customer).map(t=>({id:t.id,name:t.customer,phone:t.phone,description:t.id==='tour'?'亲子出游 · 关注老人儿童需求':t.id==='contact'?'车站接送 · 携带两件大行李':'专车接送 · 提前确认上车位置',gender:({airport:'女',contact:'男',order:'女',tour:'男'}[t.id]||'未录入'),age:'',...(customerPresentation[t.id]||{avatar:'images/landscape.jpg',tags:['出行服务'],requests:[]})}));
const customerRequests=c=>tasks.find(t=>t.id===c.id)?.done?[]:c.requests;
function customerTags(c){return `<span class="customer-tags">${c.tags.map(tag=>`<span>${esc(tag)}</span>`).join('')}</span>`}
function customerListRow(c){const count=customerRequests(c).length;return `<button class="customer-list-row" data-customer-id="${c.id}"><img class="customer-photo" src="${c.avatar}" alt="${esc(c.name)}的头像"><span class="customer-row-copy"><strong>${esc(c.name)}</strong>${customerTags(c)}</span><span class="customer-row-end">${count?`<span class="customer-request-badge" aria-label="${count} 条新诉求">${count}</span>`:''}</span></button>`}
let customerSearchQuery='';
function customerListRows(query=''){const term=query.trim().toLocaleLowerCase();const rows=customerRows.filter(c=>!term||[c.name,c.phone,...c.tags,c.preferences].some(value=>String(value||'').toLocaleLowerCase().includes(term)));return rows.map(customerListRow).join('')||'<p class="customer-search-empty">没有找到相关客户</p>'}
function customerListBody(query=''){return `<label class="customer-search"><span class="customer-search-icon" aria-hidden="true"></span><input type="search" name="customerSearch" aria-label="搜索客户" placeholder="搜索姓名、电话或标签" value="${esc(query)}"></label><div class="customer-list-results">${customerListRows(query)}</div>`}
function openCustomers(){customerSearchQuery='';profileDetail('客户列表',customerListBody())}
function customerDetailBody(c){const requests=customerRequests(c),gender=c.gender||'未录入';return `<div class="customer-detail" data-customer-detail="${esc(c.id)}"><section class="customer-request-card"><div class="customer-request-heading"><img src="icons/sparkle.svg" alt=""><h3>客户诉求</h3></div><p>${requests.length?esc(requests.join('；')+'。'):'暂无待处理诉求'}</p></section><section class="customer-profile-card"><div class="customer-profile-heading"><h3>客户资料</h3><button type="button" data-customer-edit="${esc(c.id)}">编辑</button></div><div class="customer-profile-identity"><img class="customer-photo" src="${esc(c.avatar)}" alt="${esc(c.name)}的头像"><strong>${esc(c.name)}</strong></div><dl><div><dt>性别</dt><dd>${esc(gender)}</dd></div><div><dt>年龄</dt><dd>${c.age?`${esc(c.age)} 岁`:'未录入'}</dd></div><div><dt>电话</dt><dd><a href="tel:${esc(c.phone)}">${esc(maskPhone(c.phone))}</a></dd></div><div><dt>标签</dt><dd>${customerTags(c)}</dd></div><div><dt>历史偏好</dt><dd>${esc(c.preferences||'暂无历史偏好记录')}</dd></div></dl></section></div>`}
function openCustomer(c){profileDetail('客户详情',customerDetailBody(c))}
function editCustomer(c){profileDetail('编辑客户资料',`<form id="customer-edit-form" data-customer-id="${esc(c.id)}" class="profile-form customer-edit-form" novalidate><label>姓名<input name="name" maxlength="20" value="${esc(c.name)}"></label><div class="customer-gender-field"><span>性别</span><input name="gender" type="hidden" value="${esc(c.gender||'未录入')}"><button type="button" data-gender-picker aria-haspopup="dialog"><span data-gender-value>${esc(c.gender||'未录入')}</span><span aria-hidden="true">⌄</span></button></div><label>年龄<input name="age" type="number" inputmode="numeric" min="1" max="120" placeholder="未录入" value="${esc(c.age||'')}"></label><label>电话<input name="phone" type="tel" inputmode="tel" maxlength="20" value="${esc(c.phone)}"></label><label>标签<input name="tags" maxlength="100" value="${esc(c.tags.join('、'))}" placeholder="用顿号分隔"></label><label>历史偏好<textarea name="preferences" rows="4" maxlength="200" placeholder="记录客户出行偏好">${esc(c.preferences==='暂无历史偏好记录'?'':c.preferences||'')}</textarea></label><button class="profile-primary" type="submit">保存</button></form>`)}
const customerDialogueSamples={
 airport:[{role:'customer',text:'航班到龙洞堡机场后，在哪里上车比较方便？'},{role:'ai',text:'可以在 T2 到达层约定出口碰面，我会提前确认航班动态和具体位置。'},{role:'customer',text:'如果航班晚点，接机时间还能调整吗？'},{role:'ai',text:'可以，我会按实际落地时间安排接驾。'}],
 contact:[{role:'customer',text:'明天带孩子和两件大行李坐车方便吗？'},{role:'ai',text:'可以，我会预留行李空间。孩子多大？我也好提前确认安全座椅。'},{role:'customer',text:'孩子 5 岁。路上能增加一个行程点吗？'},{role:'ai',text:'可以，请发我想去的地点，我先核对路线和时间。'},{role:'customer',text:'那明天几点从贵阳北站出发？'},{role:'ai',text:'明天预计 08:30 在南广场碰面，出发前会再和您确认具体位置。'}],
 order:[{role:'customer',text:'这趟送机可以按 220 元吗？'},{role:'ai',text:'我先核对行程与报价，确认后尽快回复您。'},{role:'customer',text:'如果多带一个行李箱，价格会变吗？'},{role:'ai',text:'我会一并确认车辆空间和最终费用，再给您明确答复。'}],
 tour:[{role:'customer',text:'明天带 5 岁的孩子去黄果树方便吗？'},{role:'ai',text:'可以，我会提前准备儿童安全座椅，也会考虑途中休息。'},{role:'customer',text:'中途可以增加一个行程点吗？'},{role:'ai',text:'可以，请告诉我地点，我核对路线后再确认时间安排。'},{role:'customer',text:'明天几点出发？'},{role:'ai',text:'预计早上 08:30 从贵阳观山湖区出发，我会提前确认上车位置。'}]
};
function customerConversation(c){const messages=[...(customerDialogueSamples[c.id]||[]),...((histories.get(c.id)||[]).filter(m=>m.text&&['user','ai'].includes(m.role)).map(m=>({role:m.role==='user'?'guide':'ai',text:m.text})))];profileDetail(c.name,`<div class="customer-conversation"><div class="customer-conversation-feed" role="log" aria-label="${esc(c.name)}的对话记录">${messages.length?`<div class="customer-conversation-date">今天</div>`+messages.map(m=>`<div class="customer-message ${m.role}"><p>${esc(m.text)}</p></div>`).join(''):'<p class="customer-conversation-empty">暂无对话记录</p>'}</div></div>`)}
const systemNotices=[{title:'服务提醒',body:'请在首次出车前完成车辆检查，确认车况、安全带和随车物品。',time:'今天 08:30'},{title:'平台公告',body:'司导服务规范已更新，请留意接驾沟通与行程确认。',time:'昨天 18:00'}];function openSystemNotifications(){profileDetail('系统通知',`<div class="system-notice-list">${systemNotices.map(n=>`<article class="system-notice-card"><div><strong>${esc(n.title)}</strong><time>${esc(n.time)}</time></div><p>${esc(n.body)}</p></article>`).join('')}</div>`)}
function openProfileSettings(){profileDetail('设置',`<div class="profile-settings"><button class="utility-row" data-setting-speech role="switch" aria-checked="${!muted}">语音播报<span class="settings-switch" aria-hidden="true"></span></button></div><button class="profile-logout-button" data-profile-logout>退出登录</button>`)}
const profileOrders=[
 {id:'SD092901',task:'airport',title:'贵旅出行-点对点包车',status:'进行中',placedAt:'2026-09-29 08:12'},
 {id:'SD092902',task:'order',title:'贵旅出行-点对点包车',status:'待付款',placedAt:'2026-09-29 09:35'},
 {id:'SD093001',title:'贵旅出行-日包车',customer:'陈志远',phone:'13800138026',price:1360,status:'待出行',from:'贵阳观山湖希尔顿欢朋酒店',to:'黄果树景区',placedAt:'2026-09-28 18:20'},
 {id:'SD092803',title:'贵旅出行-点对点包车',customer:'赵女士',phone:'13700137053',price:380,status:'退款/售后',from:'贵阳北站',to:'贵阳市区',placedAt:'2026-09-28 10:00'}
];
let orderFilter='全部';
function orderData(o){const t=tasks.find(t=>t.id===o.task);return {...o,customer:t?.customer||o.customer,phone:t?.phone||o.phone,price:o.price??t?.price,from:t?.from||o.from,to:t?.to||o.to}}
function orderFields(o){return `<span class="order-title-row"><strong>${esc(o.title)}</strong><b>${esc(o.status)}</b></span><span class="order-trip-row"><span class="order-trip-fields"><span class="order-field"><span>出发：</span><b>${esc(o.from)}</b></span><span class="order-field"><span>到达：</span><b>${esc(o.to)}</b></span><span class="order-field"><span>下单时间：</span><b>${esc(o.placedAt)}</b></span></span><strong class="order-price">¥${money(o.price)}</strong></span>`}
function orderActions(o){return `<div class="profile-order-actions">${o.status==='待付款'?`<button type="button" data-order-price="${esc(o.id)}">修改价格</button>`:''}<a href="tel:${String(o.phone||'').replace(/[^\d+]/g,'')}" ${o.phone?'':'aria-disabled="true"'}>联系游客</a></div>`}
function ordersBody(){const rows=profileOrders.filter(o=>orderFilter==='全部'||o.status===orderFilter);return `<div class="order-filters" role="tablist" aria-label="订单状态">${['全部','进行中','待付款','待出行','退款/售后'].map(f=>`<button role="tab" aria-selected="${f===orderFilter}" data-order-filter="${f}">${f}</button>`).join('')}</div><div class="profile-order-list">${rows.map(orderData).map(o=>`<article class="profile-order-card"><button type="button" class="profile-order-main" data-order-id="${esc(o.id)}">${orderFields(o)}</button>${orderActions(o)}</article>`).join('')||'<p class="profile-empty">暂无此状态的订单</p>'}</div>`}
function editOrderPrice(id){const o=orderData(profileOrders.find(order=>order.id===id));if(o.status!=='待付款')return;profileDetail('修改价格',`<form id="order-price-form" data-order-id="${esc(id)}" class="profile-form"><p class="profile-subtitle">${esc(o.title)} · ${esc(o.customer)}</p><label>价格（元）<input name="price" type="number" inputmode="decimal" min="0.01" max="100000" step="0.01" required value="${o.price}"></label><button class="profile-primary" type="submit">保存价格</button></form>`)}
const walletBills=[{title:'贵旅出行-日包车',date:'09-28 18:30',amount:680},{title:'贵旅出行-点对点包车',date:'09-28 12:20',amount:260},{title:'提现',date:'09-27 16:00',amount:-1000},{title:'贵旅出行-点对点包车',date:'09-27 11:45',amount:180}];
function openWallet(){profileDetail('钱包',`<div class="wallet-balance"><span>可用余额（元）</span><strong>8,260.00</strong><div><p>待入账<b>¥1,120.00</b></p><p>累计收入<b>¥38,400.00</b></p></div></div><h3 class="wallet-heading" id="wallet-bills-title">账单明细</h3><div class="wallet-bills" aria-labelledby="wallet-bills-title">${walletBills.map(b=>`<div class="wallet-bill"><span class="wallet-bill-icon"><img src="icons/${b.amount>0?'receipt':'wallet'}.svg" alt=""></span><span><strong>${b.title}</strong><small>${b.date}</small></span><b class="${b.amount>0?'income':''}">${b.amount>0?'+':'−'}${money(Math.abs(b.amount))}</b></div>`).join('')}</div>`)}
document.addEventListener('click',async e=>{const el=e.target.closest('button');if(!el)return;
if(el.dataset.coverPreset){const form=$('#profile-edit-form');form.querySelector('[data-image-preview="cover"]').src=el.dataset.coverPreset;form.elements.cover.value='';form.querySelectorAll('[data-cover-preset]').forEach(b=>b.setAttribute('aria-pressed',String(b===el)))}
if(el.hasAttribute('data-profile-home'))openPersonalHomepage();
if(el.hasAttribute('data-profile-edit'))editProfile();
if(el.hasAttribute('data-profile-share'))await shareProfile();
if(el.hasAttribute('data-copy-profile')){const field=$('.profile-share-text'),status=$('.profile-share-status');try{await navigator.clipboard.writeText(field.value);status.textContent='分享内容已复制';el.textContent='已复制'}catch{field.focus();field.select();status.textContent='请长按或使用复制快捷键，复制以上内容'}}
if(el.dataset.profileOrders){orderFilter=el.dataset.profileOrders;profileDetail('订单列表',ordersBody())}
if(el.dataset.storefrontFilter){storefrontFilter=el.dataset.storefrontFilter;refreshPersonalHomepage();$('[data-storefront-filter][aria-selected="true"]').focus({preventScroll:true})}
if(el.dataset.profileService){const service=services.find(s=>s.id===el.dataset.profileService);if(service){if(service.detailImage){showPromotionProductDetail(service);return;}showBusinessServiceDetail({promotion:service.promotion,title:service.id==='scenic'?'按天包车':service.id==='transfer'?'定点包车':service.title,sections:homepageServiceSections[service.id],price:service.price,priceUnit:service.priceUnit||serviceUnit(service.type),priceFrom:service.priceFrom,detailTitle:service.id==='scenic'?'按天包车':service.id==='transfer'?'定点包车':service.type,route:service.location||service.title,details:service.content,pricing:`¥${service.price}/${service.priceUnit||serviceUnit(service.type)}${service.priceFrom?' 起':''}`});const cover=$('.business-service-cover');if(service.image)cover.src=service.image;cover.alt=service.title}}

if(el.dataset.profileRoute){switch(el.dataset.profileRoute){case'tasks':openAllTasks();break;case'customers':openCustomers();break;case'orders':orderFilter='全部';profileDetail('订单列表',ordersBody());break;case'wallet':openWallet();break;case'notifications':openSystemNotifications();break;case'settings':openProfileSettings();break;}}
if(el.hasAttribute('data-service-new'))editService();if(el.dataset.serviceEdit)editService(el.dataset.serviceEdit);
if(el.hasAttribute('data-service-ai')){const form=$('#service-edit-form'),draft=serviceDrafts[form.elements.type.value],preview=form.querySelector('[data-image-preview="image"]');form.elements.title.value=draft.title;form.elements.content.value=draft.content;form.elements.location.value=draft.location;preview.src=draft.image;preview.closest('.image-picker-preview').classList.remove('is-empty');preview.closest('.mobile-image-picker').querySelector('.image-picker-overlay span').textContent='更换服务图片';toast('已填入图片和文案，可继续修改')}
if(el.dataset.serviceDelete){const s=services.find(s=>s.id===el.dataset.serviceDelete);profileDetail('删除服务',`<div class="delete-service"><h3>删除「${esc(s.title)}」？</h3><p>删除后，该服务将从你的橱窗移除。</p><button class="profile-primary danger" data-confirm-service-delete="${s.id}">确认删除</button><button class="profile-secondary" data-profile-cancel>取消</button></div>`)}
if(el.dataset.confirmServiceDelete){services=services.filter(s=>s.id!==el.dataset.confirmServiceDelete);goBack();renderProfile();toast('服务已删除')}
if(el.hasAttribute('data-profile-cancel'))goBack();
if(el.dataset.orderFilter){orderFilter=el.dataset.orderFilter;$('#utility-body').innerHTML=ordersBody();$('[data-order-filter][aria-selected="true"]').focus()}
if(el.dataset.customerId){const c=customerRows.find(c=>c.id===el.dataset.customerId);if(c)openCustomer(c)}
if(el.dataset.customerEdit){const c=customerRows.find(c=>c.id===el.dataset.customerEdit);if(c)editCustomer(c)}
if(el.hasAttribute('data-gender-picker')){const value=$('#customer-edit-form [name="gender"]').value;genderSheet.querySelectorAll('[data-gender-option]').forEach(option=>option.setAttribute('aria-checked',String(option.dataset.genderOption===value)));genderSheet.hidden=false;genderSheet.querySelector('[aria-checked="true"]')?.focus({preventScroll:true})}
if(el.hasAttribute('data-customer-chat')){const id=$('#utility-body [data-customer-detail]')?.dataset.customerDetail,c=customerRows.find(row=>row.id===id);if(c)customerConversation(c)}
if(el.dataset.customerTask){const t=tasks.find(t=>t.id===el.dataset.customerTask);if(t)showTask(t)}
if(el.hasAttribute('data-profile-settings'))openProfileSettings();
if(el.hasAttribute('data-profile-logout'))profileDetail('退出登录','<div class="logout-confirm"><h3>确定退出登录？</h3><p>退出后需要重新登录才能继续使用工作台。</p><button class="profile-primary" data-confirm-logout>退出登录</button><button class="profile-secondary" data-profile-cancel>取消</button></div>');
if(el.hasAttribute('data-confirm-logout'))signOut();
if(el.hasAttribute('data-profile-relogin'))signIn();

if(el.hasAttribute('data-setting-speech')){$('#sound').click();el.setAttribute('aria-checked',String(!muted))}
if(el.dataset.orderId){const o=orderData(profileOrders.find(o=>o.id===el.dataset.orderId));profileDetail('订单详情',`<div class="profile-order-card order-detail">${orderFields(o)}${orderActions(o)}</div>`)}
if(el.dataset.orderPrice)editOrderPrice(el.dataset.orderPrice);

});
$('#utility-body').addEventListener('input',e=>{if(e.target.matches('.customer-search input')){customerSearchQuery=e.target.value;$('#utility-body .customer-list-results').innerHTML=customerListRows(customerSearchQuery);return}if(e.target.matches('#service-edit-form [aria-invalid]'))e.target.removeAttribute('aria-invalid')});
$('#utility-body').addEventListener('change',e=>{const input=e.target;if(input.matches('#service-edit-form input[name="type"]')){input.form.querySelector('[data-price-unit]').textContent='/'+serviceUnit(input.value);return}if(!input.matches('.profile-form input[type="file"]'))return;const file=input.files[0];if(!file)return;if(!file.type.startsWith('image/')||file.size>10*1024*1024){input.value='';toast('请选择 10 MB 以内的图片');return}const preview=input.form.querySelector(`[data-image-preview="${input.name}"]`),url=URL.createObjectURL(file),probe=new Image();probe.onload=()=>{preview.src=url;preview.classList.remove('default-avatar');preview.closest('.image-picker-preview').classList.remove('is-empty');if(input.name==='image')preview.closest('.mobile-image-picker').querySelector('.image-picker-overlay span').textContent='更换服务图片';if(input.name==='cover')input.form.querySelectorAll('[data-cover-preset]').forEach(b=>b.setAttribute('aria-pressed','false'))};probe.onerror=()=>{URL.revokeObjectURL(url);input.value='';toast('图片无法读取，请换一张图片')};probe.src=url;});
$('#utility-body').addEventListener('submit',e=>{const form=e.target;if(form.id==='customer-edit-form'){e.preventDefault();const c=customerRows.find(row=>row.id===form.dataset.customerId),name=form.elements.name.value.trim(),phone=form.elements.phone.value.trim(),age=form.elements.age.value.trim();if(!c)return;if(!name||!phone){toast(!name?'请填写客户姓名':'请填写联系电话');form.elements[!name?'name':'phone'].focus();return}if(age&&(!Number.isInteger(Number(age))||Number(age)<1||Number(age)>120)){toast('请输入有效年龄');form.elements.age.focus();return}c.name=name;c.gender=form.elements.gender.value;c.age=age;c.phone=phone;c.tags=form.elements.tags.value.split(/[、,，]/).map(tag=>tag.trim()).filter(Boolean);c.preferences=form.elements.preferences.value.trim()||'暂无历史偏好记录';const task=tasks.find(t=>t.id===c.id);if(task){task.customer=name;task.phone=phone}goBack();$('#utility-body').innerHTML=customerDetailBody(c);const listState=navigationStack.at(-1);if(listState?.utility?.title==='客户列表')listState.utility.body=customerListBody(customerSearchQuery);toast('客户资料已更新');return}if(form.id==='order-price-form'){e.preventDefault();const order=profileOrders.find(o=>o.id===form.dataset.orderId),price=Number(form.elements.price.value);if(!order||order.status!=='待付款'||!Number.isFinite(price)||price<=0||price>100000){toast('请输入有效价格');return}order.price=price;const task=tasks.find(t=>t.id===order.task);if(task){task.price=price;renderTasks()}profileDetail('订单列表',ordersBody());toast('价格已更新');return}if(!['profile-edit-form','service-edit-form'].includes(form.id))return;e.preventDefault();if(form.id==='service-edit-form'){const input=form.elements.price,raw=input.value.trim(),price=Number(raw);if(!raw||!Number.isFinite(price)||price<=0){input.setAttribute('aria-invalid','true');toast(raw?'请输入有效价格':'请填写价格');input.focus();return}}const fields=new FormData(form);for(const name of form.id==='profile-edit-form'?['name','bio']:['title','content']){if(!fields.get(name).trim()){toast(form.id==='service-edit-form'?(name==='title'?'请填写服务标题':'请填写服务内容'):'请填写完整内容');form.elements[name].focus();return}}
if(form.id==='profile-edit-form'){profileInfo.name=fields.get('name').trim();profileInfo.bio=fields.get('bio').trim();for(const key of ['avatar','cover'])profileInfo[key]=form.querySelector(`[data-image-preview="${key}"]`).getAttribute('src');goBack();renderProfile();toast('主页已更新')}else{const service={id:form.dataset.id||'service-'+Date.now(),type:fields.get('type'),title:fields.get('title').trim(),content:fields.get('content').trim(),location:fields.get('location').trim(),price:Number(fields.get('price')),image:form.querySelector('[data-image-preview="image"]').getAttribute('src')||''};if(!serviceDrafts[service.type]||!Number.isFinite(service.price)||service.price<=0)return;const i=services.findIndex(s=>s.id===service.id);if(i>=0)services[i]=service;else services.unshift(service);goBack();renderProfile();toast(i>=0?'服务已更新':'服务已发布')}});
if(location.hash==='#profile')switchTab('profile');
