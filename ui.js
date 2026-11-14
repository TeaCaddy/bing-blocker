'use strict';
const B = BingBlocker;
const input = document.querySelector('#input'), scope = document.querySelector('#scope'), status = document.querySelector('#status');
let rules = [];
function feedback(text, error = false) { status.textContent = text; status.classList.toggle('error', error); }
function preview() {
  let text = '输入地址后显示实际屏蔽范围。';
  if (input.value.trim()) {
    try { const rule = B.makeRule(scope.value, input.value); text = '将屏蔽：' + rule.value + (rule.type === 'domain' ? ' 及其所有子域名' : ''); }
    catch { text = '请输入完整的网址或域名。'; }
  }
  document.querySelector('#preview').textContent = text;
}
input.addEventListener('input', preview); scope.addEventListener('change', preview);
document.querySelector('#add-form').addEventListener('submit', async e => {
  e.preventDefault();
  const button = e.currentTarget.querySelector('button'); button.disabled = true;
  try {
    const rule = B.makeRule(scope.value, input.value);
    const result = await chrome.runtime.sendMessage({ action: 'add', rule });
    if (!result?.ok) throw new Error(result?.error || '保存失败。');
    feedback(result.exists ? '这条规则已存在。' : '已添加：' + rule.value);
    input.value = ''; preview();
  } catch (e) { feedback(e.message, true); }
  finally { button.disabled = false; }
});
document.querySelector('#manage')?.addEventListener('click', () => chrome.runtime.openOptionsPage());
function render() {
  const container = document.querySelector('#rules'); if (!container) return;
  const term = document.querySelector('#search').value.trim().toLowerCase();
  const visible = rules.filter(r => (r.id + ' ' + B.LABELS[r.type]).toLowerCase().includes(term));
  document.querySelector('#count').textContent = `${rules.length} 条规则`;
  container.replaceChildren();
  if (!visible.length) { const empty = document.createElement('p'); empty.className = 'empty'; empty.textContent = rules.length ? '没有找到匹配的规则。' : '还没有屏蔽规则。在左侧添加，或在 Bing 结果旁点击“屏蔽”。'; container.append(empty); }
  visible.forEach(rule => {
    const row = document.createElement('div'); row.className = 'rule';
    const info = document.createElement('div'); info.className = 'rule-info';
    const badge = document.createElement('span'); badge.className = 'badge badge-' + rule.type; badge.textContent = B.LABELS[rule.type];
    const value = document.createElement('div'); value.className = 'rule-value'; value.textContent = rule.value;
    info.append(badge, value);
    const button = document.createElement('button'); button.className = 'delete'; button.textContent = '删除'; button.setAttribute('aria-label', '删除规则');
    button.onclick = async () => {
      button.disabled = true;
      try { const r = await chrome.runtime.sendMessage({ action: 'remove', id: rule.id }); if (!r?.ok) throw new Error(r?.error || '删除失败。'); feedback('已删除：' + rule.value); }
      catch (e) { feedback(e.message, true); button.disabled = false; }
    };
    row.append(info, button); container.append(row);
  });
}
document.querySelector('#search')?.addEventListener('input', render);
chrome.storage.onChanged.addListener((changes, area) => { if (area === 'local' && changes.rules) { rules = changes.rules.newValue || []; render(); } });
chrome.storage.local.get({ rules: [] }).then(data => { rules = data.rules; render(); }).catch(e => feedback(e.message, true));
