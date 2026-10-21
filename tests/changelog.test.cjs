const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const date = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(new Date());

test('真实 Git 提交流程：日志同次提交、中文说明生成、历史保留与同日去重', () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'driver-changelog-'));
  const run = (...args) => spawnSync('git', args, { cwd: repo, encoding: 'utf8' });
  const stage = () => assert.equal(run('add', '.').status, 0);
  const commit = (...args) => run('commit', ...args);
  const write = (name, text) => fs.writeFileSync(path.join(repo, name), text);
  try {
    assert.equal(run('init').status, 0);
    run('config', 'user.name', '测试'); run('config', 'user.email', 'test@example.invalid');
    fs.cpSync(path.join(root, '.githooks'), path.join(repo, '.githooks'), { recursive: true });
    fs.mkdirSync(path.join(repo, 'scripts'));
    fs.copyFileSync(path.join(root, 'scripts/changelog.cjs'), path.join(repo, 'scripts/changelog.cjs'));
    const installed = spawnSync(process.execPath, ['scripts/changelog.cjs', 'install'], { cwd: repo, encoding: 'utf8' });
    assert.equal(installed.status, 0, installed.stderr);
    const base = `# 更新日志\n\n## ${date}\n\n### 【新增功能】\n\n- 任务页面：支持查看任务时间线。\n`;
    write('CHANGELOG.md', base); write('app.js', '// initial'); stage();
    const first = commit('--no-edit');
    assert.equal(first.status, 0, first.stderr + first.stdout);
    assert.match(run('log', '-1', '--format=%s').stdout, /^更新：任务页面：支持查看任务时间线/);
    assert.match(run('show', '--name-only', '--format=', 'HEAD').stdout, /CHANGELOG.md/);

    write('app.js', '// updated'); stage();
    assert.notEqual(commit('-m', '更新任务页面').status, 0, '缺少同次日志应拒绝');
    write('CHANGELOG.md', base + '\n- 任务页面：增加语音取消操作。\n');
    assert.notEqual(commit('-m', '更新任务页面').status, 0, '只更新工作区日志仍应拒绝');
    stage();
    assert.notEqual(commit('-m', 'Update voice').status, 0, '英文普通提交应拒绝');
    assert.equal(commit('-m', '优化任务语音取消交互').status, 0);
    assert.match(run('log', '-1', '--format=%s').stdout, /优化任务语音取消交互/);
    const saved = fs.readFileSync(path.join(repo, 'CHANGELOG.md'), 'utf8');

    write('CHANGELOG.md', saved.replace('支持查看任务时间线', '支持尚未实现的功能') + '\n- 我的页面：调整入口。\n'); stage();
    assert.notEqual(commit('-m', '调整我的页面').status, 0, '改写历史应拒绝');
    write('CHANGELOG.md', saved + '\n- 任务页面：增加语音取消操作。\n'); stage();
    assert.notEqual(commit('-m', '重复记录').status, 0, '同日重复应拒绝');
    write('CHANGELOG.md', saved + `\n## ${date}\n\n### 【视觉调整】\n\n- 我的页面：调整背景。\n`); stage();
    assert.notEqual(commit('-m', '重复日期').status, 0, '同日重复日期应拒绝');
    write('CHANGELOG.md', saved + '\n### 【视觉调整】\n'); stage();
    assert.notEqual(commit('-m', '空分类').status, 0, '空分类应拒绝');
    write('CHANGELOG.md', saved + '\n### 【视觉调整】\n\n- 我的页面：调整背景。\n'); stage();
    const valid = commit('--no-edit');
    assert.equal(valid.status, 0, valid.stderr + valid.stdout);
    assert.match(run('log', '-1', '--format=%s').stdout, /^更新：我的页面：调整背景/);
  } finally { fs.rmSync(repo, { recursive: true, force: true }); }
});
