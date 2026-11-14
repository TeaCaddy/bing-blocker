(() => {
  'use strict';
  if (location.pathname !== '/search') return;
  const B = BingBlocker;
  let rules = [], scheduled = false, activeDialog;
  const observer = new MutationObserver(schedule);
  const observe = () => observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['href', 'class'] });
  function target(row) { return B.resolveTarget(row.querySelector('h2 a[href]')?.href); }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => { scheduled = false; scan(); }, 60);
  }
  function scan() {
    observer.disconnect();
    try {
      document.querySelectorAll('#b_results > .b_algo').forEach(row => {
        const url = target(row);
        row.classList.toggle('bb-hidden', !!url && rules.some(r => B.matches(r, url)));
        let button = row.querySelector('.bb-trigger');
        if (!url) { button?.remove(); return; }
        if (!button) {
          button = document.createElement('button');
          button.type = 'button'; button.className = 'bb-trigger'; button.textContent = '屏蔽';
          button.setAttribute('aria-haspopup', 'dialog');
          button.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); openMenu(row, button); });
          row.querySelector('h2').after(button);
        }
      });
    } finally { observe(); }
  }
  function openMenu(row, trigger) {
    const url = target(row);
    if (!url) return;
    activeDialog?.remove();
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = `dialog{box-sizing:border-box;border:1px solid #dce3ef;border-radius:22px;padding:28px;width:460px;max-width:calc(100vw - 32px);color:#17312c;background:#fff;font:14px/1.6 system-ui,sans-serif;box-shadow:0 20px 70px #10204430}dialog::backdrop{background:#162c2855;backdrop-filter:blur(3px)}h2{font-size:22px;letter-spacing:-.5px;margin:0 0 10px}p{color:#667389;margin:0 0 18px}button{font:inherit;cursor:pointer}.scope{display:block;width:100%;text-align:left;border:1px solid #dfe8e3;border-radius:12px;background:#fbfcfb;padding:15px;margin:10px 0;color:#17312c}.scope:hover{border-color:#18836d;background:#eff8f3}.scope span{display:block;font-size:12px;color:#64776f;overflow-wrap:anywhere}.cancel{float:right;background:transparent;border:0;padding:6px 12px;color:#53627c}.error{color:#a12626;margin:8px 0}button:focus-visible{outline:2px solid #18836d;outline-offset:2px}`;
    const dialog = document.createElement('dialog');
    dialog.setAttribute('aria-label', '选择屏蔽范围');
    const title = document.createElement('h2'); title.textContent = '屏蔽这条结果';
    const help = document.createElement('p'); help.textContent = '选择范围后立即隐藏，可在扩展的黑名单管理中撤销。';
    const error = document.createElement('div'); error.className = 'error'; error.setAttribute('role', 'status');
    dialog.append(title, help);
    B.choices(url).forEach(rule => {
      const button = document.createElement('button'); button.className = 'scope'; button.textContent = rule.label;
      const detail = document.createElement('span'); detail.textContent = rule.value + (rule.type === 'domain' ? '（含所有子域名）' : ''); button.append(detail);
      button.addEventListener('click', async () => {
        button.disabled = true;
        try {
          const result = await chrome.runtime.sendMessage({ action: 'add', rule });
          if (!result?.ok) throw new Error(result?.error || '保存失败，请重试。');
          dialog.close();
        } catch (e) { error.textContent = e.message; button.disabled = false; }
      });
      dialog.append(button);
    });
    const cancel = document.createElement('button'); cancel.className = 'cancel'; cancel.textContent = '取消'; cancel.onclick = () => dialog.close();
    dialog.append(error, cancel); shadow.append(style, dialog); document.body.append(host); activeDialog = host;
    dialog.addEventListener('close', () => { host.remove(); if (trigger.isConnected) trigger.focus(); });
    dialog.showModal();
  }
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.rules) { rules = changes.rules.newValue || []; schedule(); }
  });
  chrome.storage.local.get({ rules: [] }).then(data => { rules = data.rules; scan(); }).catch(console.error);
})();
