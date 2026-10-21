# 头像名片与服务对话 QA

说明：以下为历史验证记录，文中提及的 `qa/` 截图已于 2026-10-21 清理，不再随仓库保存；测试与文字验证结论保留。

- Source visual truth: `/Users/pengpeng/Desktop/截屏2026-10-12 20.58.25.png` (177 × 62 button crop); `/var/folders/_9/rrf9h00s75l4hl88c1qbdkvr0000gn/T/TemporaryItems/NSIRD_screencaptureui_QY2fVQ/截屏2026-10-12 21.02.40.png` (282 × 279 card crop).
- Implementation: `qa/avatar-business-card-final.png`, `qa/avatar-business-card-phone.png`, `qa/qingyan-service-preview.png`.
- Combined comparison: `qa/avatar-reference-comparison.png`. Reference and implementation card placed side by side; 358 CSS px implementation card normalized to 282 px reference width. Source screenshot density is unspecified, treated as 1×. Browser screenshot 1280 × 720 at 1×, phone content 390 × 684 CSS px. Earlier check used a 490 × 792 viewport.
- State: generated personal card with untouched shortcut actions; service preview after three conversational answers.

## Findings
No remaining actionable P0/P1/P2 differences. Same source avatar and waterfall photography are reused from the tourist project. Card retains layered scenery, floating circular portrait, centered identity, brand role, colored tags and translucent rounded profile panel. Buttons are white pills with the standard Phosphor northeast arrow. Current driver name, two previously requested tags and polished longer bio intentionally replace the reference's sample content.

## Comparison history
- P2: fixed 844px phone canvas extended below shorter desktop windows. Added a max-height to the business-card conversation at desktop widths. Recaptured at 1280 × 720; persistent header and input are both visible, and the conversation scrolls independently.
- Final combined comparison checks typography, spacing, color, source photo quality and copy. No further blocking drift. Card height adapts to the longer bio; this is an intentional content accommodation.

## Interaction verification
- Input click prefills introduction; AI requests a personal portrait after 5s, example portrait and card follow at 5s intervals.
- Add service stays in conversation and asks about route/capacity, then price/inclusions, then booking/process/amenities.
- All three answers prefill on click and remain editable. Replies arrive asynchronously after 5s.
- Service preview includes user-provided text and numeric price, with add/edit controls.
- Add to card inserts the service once; completed shortcuts disappear and the next reply confirms the addition without repeating the identity card.
- Node VM checks: 5000ms timers, invalid-price retry, custom 280-yuan price preserved, edit retains draft data. JS syntax check passed; browser console errors: none.

## Follow-up polish
None required. Prototype data remains in memory as in the existing application.

final result: passed

## Latest annotation verification
- Removed composer focus ring and text-input outline; computed focus outline is `none`, while the existing light composer shadow remains.
- Shortcuts disappear after selecting the next action or beginning a new text answer, and remain hidden when reopening the conversation.
- Conversation service preview and My storefront now share `serviceCardMarkup` and responsive card styles. Preview is a horizontal image/text/price card; clicking it opens route, fees and booking details.
- Saved service appears once in My storefront. The reply is exactly “已添加到名片主页”; only the original identity preview remains in conversation history.
- Fresh next-step shortcuts remain available below the successful confirmation until another answer begins.
- Verified full conversation through actual 5-second timers at 490 × 792 viewport, including opening/closing details and visiting My storefront. Console errors: none. JavaScript syntax checks passed.
- Updated screenshots: `qa/service-summary-preview.png`, `qa/service-added-confirmation.png`.
