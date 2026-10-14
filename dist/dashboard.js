// Dashboard charts use task records and illustrative monthly business metrics.
const dashboardState = { customer: 'channels' };
const dashboardColor = 'var(--board-accent)';

function dashboardKpi(label, value, unit = '') {
  return `<div class="board-kpi"><span>${label}</span><strong>${value}<small>${unit}</small></strong></div>`;
}

function dashboardLegend(items, withValues = false) {
  return `<div class="board-legend${withValues ? ' board-legend-values' : ''}">${items.map(item => `<span><i style="--series:${item.color}"></i>${item.label}${withValues ? `<b>${item.value}</b>` : ''}</span>`).join('')}</div>`;
}

// Use a shared zero baseline. Segment gaps sit inside their allocated height,
// so they never inflate the value or turn a zero into a visible bar.
function dashboardBars(columns, maximum, unit, className = '') {
  return `<div class="board-bars ${className}" style="--columns:${columns.length}">${columns.map(column => {
    let bottom = 0;
    const total = column.parts.reduce((sum, part) => sum + part.value, 0);
    const description = column.parts.filter(part => part.value).map(part => `${part.label} ${part.value.toLocaleString()}${unit}`).join('，') || `0${unit}`;
    const blocks = column.parts.map(part => {
      const start = bottom;
      bottom += part.value / maximum * 100;
      return part.value > 0 ? `<span class="board-bar-piece" style="bottom:${start}%;height:${part.value / maximum * 100}%;--series:${part.color}"></span>` : '';
    }).join('');
    return `<div class="board-bar" role="img" aria-label="${esc(column.label + '，' + description)}"><span class="board-bar-track"><b class="board-bar-value" style="bottom:${total / maximum * 100}%">${total.toLocaleString()}</b>${blocks}</span><span class="board-bar-label">${column.label}</span></div>`;
  }).join('')}</div>`;
}

function dashboardTaskMetrics(data) {
  const done = data.all.filter(task => task.done).length;
  const series = [
    { label: '及时完成', value: data.timely.length, color: dashboardColor },
    { label: '逾期任务', value: data.late.length, color: dashboardColor },
    { label: '待办任务', value: data.all.length - done - data.late.length, color: dashboardColor },
    { label: '逾期完成', value: done - data.timely.length, color: dashboardColor }
  ];
  const category = task => task.id === 'prepare' || !task.customer ? 0 : task.id === 'contact' || task.id === 'order' ? 2 : 1;
  const status = task => task.done ? (data.timely.includes(task) ? 0 : 3) : taskState(task) === '逾期' ? 1 : 2;
  const columns = ['出车准备', '接送服务', '订单沟通'].map((label, index) => ({
    label,
    parts: series.map((part, state) => ({ ...part, value: data.all.filter(task => category(task) === index && status(task) === state).length }))
  }));
  const maximum = Math.max(1, ...columns.map(column => column.parts.reduce((sum, part) => sum + part.value, 0))) * 1.2;
  return `<div class="board-stat-pair">${dashboardKpi('任务总数', data.all.length, '项')}${dashboardKpi('完成率', data.all.length ? Math.round(done / data.all.length * 100) : 0, '%')}</div><div class="board-visual board-task-visual">${dashboardBars(columns, maximum, '项', 'board-task-bars')}${dashboardLegend(series.filter((part, index) => index < 3 || part.value), true)}</div>`;
}

function dashboardToggle(type, options, selected) {
  return `<div class="board-chart-toggle" role="group" aria-label="${type === 'customer' ? '客户分析维度' : '营收图表类型'}">${options.map(([key, label]) => `<button type="button" data-board-view="${type}" data-board-value="${key}" aria-pressed="${key === selected}">${label}</button>`).join('')}</div>`;
}

function dashboardCustomerPanel() {
  const items = businessMetrics[dashboardState.customer];
  const total = items.reduce((sum, item) => sum + item[1], 0);
  const columns = items.map(([label, value]) => ({ label, parts: [{ label, value, color: dashboardColor }] }));
  const leading = items.reduce((best, item) => item[1] > best[1] ? item : best, items[0]);
  return `${dashboardToggle('customer', [['channels', '渠道来源'], ['segments', '客群分布']], dashboardState.customer)}${dashboardBars(columns, Math.max(1, ...items.map(item => item[1])) * 1.18, '位', 'board-customer-bars')}<p class="board-chart-detail" aria-live="polite">${leading[0]}占比最高 · ${Math.round(leading[1] / total * 100)}%</p>`;
}

function dashboardCustomerMetrics() {
  const data = businessMetrics;
  return `<div class="board-stat-pair">${dashboardKpi('客户总数', data.customers, '位')}${dashboardKpi('客户转化率', metricPercent(data.convertedCustomers, data.customers), '%')}</div><div class="board-visual board-customer-viz">${dashboardCustomerPanel()}</div>`;
}

function dashboardRevenuePanel() {
  const data = businessMetrics;
  const columns = data.revenue.map(([name, value]) => {
    const label = name === '其它' ? '其他' : name;
    return { label, parts: [{ label, value, color: dashboardColor }] };
  });
  return `${dashboardBars(columns, Math.max(1, ...data.revenue.map(([, value]) => value)) * 1.25, '元', 'board-revenue-bars')}`;
}

function dashboardOrderMetrics() {
  const data = businessMetrics;
  const total = data.revenue.reduce((sum, item) => sum + item[1], 0);
  const complaintRate = Number.isFinite(data.complaintRate) ? data.complaintRate : '—';
  return `<div class="board-visual board-order-visual"><div class="board-summary">${dashboardKpi('本月营收', `¥${total.toLocaleString()}`)}</div><div class="board-revenue-viz">${dashboardRevenuePanel()}</div></div><div class="board-stat-pair board-order-stats">${dashboardKpi('订单转化率', metricPercent(data.orders, data.inquiries), '%')}${dashboardKpi('客诉率', complaintRate, '%')}</div>`;
}

document.addEventListener('click', event => {
  const view = event.target.closest('#review [data-board-view]');
  if (view) {
    const type = view.dataset.boardView, value = view.dataset.boardValue;
    if (dashboardState[type] === value) return;
    dashboardState[type] = value;
    const panel = document.querySelector('.board-customer-viz');
    panel.innerHTML = dashboardCustomerPanel();
    document.querySelector(`[data-board-view="${type}"][data-board-value="${value}"]`).focus({ preventScroll: true });
  }
});
