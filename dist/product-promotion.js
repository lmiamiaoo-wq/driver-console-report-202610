// Product promotion is a local conversation flow; selections belong to each chat.
function isProductPromotionRequest(text){return /让更多人推广我的产品|推广我的(?:产品|商品)/.test(text);}
function promotionCatalog(){
 return services.map(service=>({
  id:service.id,name:service.title,price:service.price,unit:service.priceUnit||serviceUnit(service.type)
 }));
}
function promotionPrice(product){return `¥${Number(product.price).toLocaleString('zh-CN')}/${product.unit}`;}
function startProductPromotion(text){
 rememberPage();
 if(open)closeChat();
 conversationPage=true;applyPageSurface('ai',false);aiTask=null;
 const owner={id:'promotion-'+Date.now(),type:'产品推广',title:'让更多人推广我的产品',date:new Date().toLocaleString('zh-CN',{hour12:false}),messages:[{role:'user',text}],promotion:{products:promotionCatalog(),selected:[],confirmed:false}};
 reviewConversation=owner;reviewConversations.push(owner);
 queueAIReply(owner.messages,'可以通过**云码通**让更多人推广你的产品，成交后按商品成交价的 **7%** 支付销售佣金。\n选择下方想推广的商品或服务，可以多选。',owner,false,{kind:'promotion-options'});
 $('#input').value='';updateSend();renderAI();updateHeader();
}
function promotionSelectionCard(owner){
 const state=owner?.promotion;if(!state)return '';
 return `<form class="promotion-products" data-promotion-owner="${esc(owner.id)}" aria-label="选择推广商品">
  <div class="promotion-products-heading"><h3>推广商品</h3><span data-promotion-count>已选 ${state.selected.length} 件</span></div>
  <div class="promotion-product-list">${state.products.map(product=>`<label class="promotion-product"><input type="checkbox" name="product" value="${esc(product.id)}" ${state.selected.includes(product.id)?'checked':''} ${state.confirmed?'disabled':''}><span class="promotion-product-copy"><strong>${esc(product.name)}</strong><span>${esc(promotionPrice(product))}</span></span></label>`).join('')}</div>
  <button class="promotion-confirm" type="submit" ${state.confirmed||!state.selected.length?'disabled':''}>${state.confirmed?'已确认':'确认'}</button>
 </form>`;
}
function confirmPromotion(owner){
 const state=owner?.promotion;if(!state||state.confirmed)return;
 const selected=state.products.filter(product=>state.selected.includes(product.id));if(!selected.length)return;
 // Mark existing storefront entries so promotion never creates duplicate cards.
 for(const product of selected){
  const existing=services.find(item=>item.id===product.id);
  if(existing)existing.promotion={channel:'云码通',commissionRate:0.07};
 }
 refreshPersonalHomepage();
 state.confirmed=true;
 conversationScrollState(owner).following=true;
 const list=selected.map((product,index)=>`${index+1}. ${product.name} · ${promotionPrice(product)}`).join('\n');
 queueAIReply(owner.messages,`已为你确认通过**云码通**推广以下 ${selected.length} 项商品／服务，销售佣金为商品成交价的 **7%**。\n${list}\n已将主页中的原商品／服务设为推广商品，可前往主页查看。`,owner,false,{kind:'promotion-summary'});
 renderAI();
}
function promotionHomepageShortcut(){return '<div class="agent-card-shortcuts promotion-home-shortcut"><button type="button" data-promotion-home>去个人主页<img src="icons/arrow-up-right.svg" alt=""></button></div>';}
document.addEventListener('click',event=>{
 if(event.target.closest('[data-promotion-home]'))openPersonalHomepage(reviewConversation?.promotion?.selected.some(id=>services.some(service=>service.id===id&&(service.category||'服务')==='服务'))?'服务':'商品');
});
document.addEventListener('change',event=>{
 const input=event.target,form=input.closest('.promotion-products');if(!form||input.name!=='product')return;
 const owner=reviewConversation,state=owner?.promotion;
 if(!state||owner.id!==form.dataset.promotionOwner||state.confirmed)return;
 state.selected=[...form.querySelectorAll('input[name="product"]:checked')].map(control=>control.value);
 form.querySelector('[data-promotion-count]').textContent=`已选 ${state.selected.length} 件`;
 form.querySelector('[type="submit"]').disabled=!state.selected.length;
});
document.addEventListener('submit',event=>{
 const form=event.target;if(!form.matches('.promotion-products'))return;
 event.preventDefault();
 if(activeTab==='ai'&&!open&&reviewConversation?.id===form.dataset.promotionOwner)confirmPromotion(reviewConversation);
});

function promotionCredit(product){
 if(!product.promotion)return '';
 return `<section class="promotion-route-credit"><p class="promotion-credit-partner"><span class="promotion-credit-icon" aria-hidden="true"></span><span>与${esc(product.promotion.channel)}共创 销售佣金为商品成交价${Number((product.promotion.commissionRate*100).toFixed(2))}%</span></p></section>`;
}

function showPromotionProductDetail(product){
 utility('商品详情',`<article class="business-transfer-detail promotion-route-detail"><img class="promotion-route-long-image" src="${esc(product.detailImage)}" alt="${esc(product.title)}：完整行程与服务详情" width="${product.detailWidth||750}" height="${product.detailHeight||13691}">${promotionCredit(product)}</article>`);
 $('#utility').classList.add('profile-detail','business-service-detail');$('#utility-body').scrollTop=0;$('#utility-close').focus();
}
