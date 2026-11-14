importScripts('vendor/tldts.js', 'core.js');
let queue = Promise.resolve();
chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if (sender.id !== chrome.runtime.id || !['add', 'remove'].includes(message?.action)) return;
  queue = queue.catch(() => {}).then(async () => {
    const data = await chrome.storage.local.get({ rules: [] });
    let rules = data.rules;
    if (message.action === 'add') {
      const rule = BingBlocker.makeRule(message.rule?.type, message.rule?.value);
      const exists = rules.some(r => r.id === rule.id);
      if (!exists) {
        rules.push(rule);
        await chrome.storage.local.set({ rules });
      }
      return { ok: true, exists };
    }
    if (typeof message.id !== 'string') throw new Error('无效规则。');
    rules = rules.filter(r => r.id !== message.id);
    await chrome.storage.local.set({ rules });
    return { ok: true };
  });
  queue.then(reply, e => reply({ ok: false, error: e.message }));
  return true;
});
