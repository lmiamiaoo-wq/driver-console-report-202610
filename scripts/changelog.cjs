#!/usr/bin/env node
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const git = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const today = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(new Date());
const categories = new Set(['【新增功能】', '【交互优化】', '【视觉调整】', '【问题修复】']);
function stagedLog() {
  try { return git('show', ':CHANGELOG.md'); }
  catch { throw new Error('请先更新并暂存 CHANGELOG.md，再与项目改动一起提交。'); }
}
function previousLog() {
  try { return git('show', 'HEAD:CHANGELOG.md'); } catch { return ''; }
}
function additions() {
  return git('diff', '--cached', '--no-ext-diff', '--no-renames', '--unified=0', '--', 'CHANGELOG.md')
    .split('\n').filter(line => line.startsWith('+') && !line.startsWith('+++')).map(line => line.slice(1));
}
function check() {
  if (!git('diff', '--cached', '--name-only').trim()) return;
  const current = stagedLog(), old = previousLog();
  const lines = current.split('\n');
  // 旧日志中的每一行均必须按原顺序保留，允许向同日分类插入新记录。
  let cursor = 0;
  for (const line of old.trimEnd().split('\n').filter(() => old.length)) {
    while (cursor < lines.length && lines[cursor] !== line) cursor++;
    if (cursor === lines.length) throw new Error('旧日志不得删除或改写；请保留历史并追加记录。');
    cursor++;
  }
  const dates = new Set();
  let date = '', category = '', lastDate = '9999-99-99', entries = 0;
  let sectionCategories = new Set(), bullets = new Set();
  const added = additions().filter(line => line.startsWith('- '));
  let newToday = false;
  function closeCategory() {
    if (category && !entries) throw new Error('请省略空分类。');
  }
  for (const line of lines) {
    if (line.startsWith('## ')) {
      closeCategory();
      date = line.slice(3).trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || dates.has(date) || date > lastDate || date > today())
        throw new Error('日期须为 YYYY-MM-DD、最新在前，且同一天只能有一个标题，不得使用未来日期。');
      dates.add(date); lastDate = date; category = ''; sectionCategories = new Set(); bullets = new Set();
    } else if (line.startsWith('### ')) {
      closeCategory(); category = line.slice(4).trim(); entries = 0;
      if (!date || !categories.has(category) || sectionCategories.has(category)) throw new Error('分类无效或同日分类重复。');
      sectionCategories.add(category);
    } else if (line.startsWith('- ')) {
      if (!date || !category || !/^- [^：\n]+：\S.*[\u3400-\u9fff]/u.test(line))
        throw new Error('每条日志须用中文描述，格式为“- 页面或模块：具体变化。”');
      const normalized = line.replace(/\s+/g, '');
      if (bullets.has(normalized)) throw new Error('同一天有重复记录，请合并去重。');
      bullets.add(normalized); entries++;
      if (date === today() && added.includes(line)) newToday = true;
    }
  }
  closeCategory();
  if (!newToday) throw new Error('请将本次实际 Diff 整理为今天的新日志条目，并暂存 CHANGELOG.md。');
}
function message() {
  check();
  const first = additions().find(line => line.startsWith('- '));
  if (!first) throw new Error('没有已暂存的新增日志可用于生成提交说明。');
  const text = first.slice(2).split(/[；。]/u)[0];
  return `更新：${Array.from(text).slice(0, 60).join('')}`;
}
function main() {
  const [command, path] = process.argv.slice(2);
  if (command === 'install') {
    let existing = '';
    try { existing = git('config', '--get', 'core.hooksPath').trim(); } catch {}
    if (existing && existing !== '.githooks') throw new Error(`已配置 Hooks 路径 ${existing}，请先整合，不覆盖原设置。`);
    const hooks = git('rev-parse', '--git-path', 'hooks').trim();
    const legacy = fs.existsSync(hooks) ? fs.readdirSync(hooks).filter(name => !name.endsWith('.sample') && fs.statSync(`${hooks}/${name}`).isFile()) : [];
    if (!existing && legacy.length) throw new Error(`发现已有 Hooks：${legacy.join('、')}，请先整合。`);
    for (const name of ['pre-commit', 'prepare-commit-msg', 'commit-msg']) fs.chmodSync(`.githooks/${name}`, 0o755);
    git('config', '--local', 'core.hooksPath', '.githooks');
    console.log('已启用本仓库中文日志与提交检查。');
  } else if (command === 'check') { check(); console.log('更新日志检查通过。'); }
  else if (command === 'message') console.log(message());
  else if (command === 'prepare') fs.writeFileSync(path, `${message()}\n`);
  else if (command === 'commit-message') {
    const title = fs.readFileSync(path, 'utf8').split('\n').find(line => line.trim() && !line.startsWith('#')) || '';
    if (!/^(Merge |Revert |fixup! |squash! )/.test(title) && !/[\u3400-\u9fff]/u.test(title)) throw new Error('请使用简洁的中文 Git Commit Message。');
  } else throw new Error('用法：node scripts/changelog.cjs install|check|message|prepare|commit-message');
}
try { main(); } catch (error) { console.error(`更新日志检查失败：${error.message}`); process.exitCode = 1; }
