/* Shared pure URL and matching logic. No network requests. */
(function (root) {
  'use strict';
  const TYPES = ['page', 'host', 'domain'];
  const LABELS = { page: '仅此页面', host: '当前子域名', domain: '整个网站' };
  function parseUrl(input) {
    const text = String(input ?? '').trim();
    if (!text || /\s/.test(text) || text.includes('*')) throw new Error('请输入有效的网址或域名，不要包含空格或通配符。');
    const explicitScheme = /^[a-z][a-z\d+.-]*:/i.test(text);
    const url = new URL(explicitScheme ? text : 'https://' + text.replace(/^\/\//, ''));
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('仅支持不含账号密码的 HTTP / HTTPS 地址。');
    url.hostname = url.hostname.replace(/\.$/, '');
    const info = root.tldts.parse(url.hostname, { allowPrivateDomains: true });
    if (!info.isIp && (!info.domain || !/^[a-z\d.-]+$/i.test(url.hostname))) throw new Error('请输入完整网站域名，例如 example.com，而不是公共后缀。');
    url.hash = '';
    return url;
  }
  function normalizeUrl(input) { return parseUrl(input).href; }
  function makeRule(type, input) {
    if (!TYPES.includes(type)) throw new Error('未知的屏蔽范围。');
    const url = parseUrl(input);
    const info = root.tldts.parse(url.hostname, { allowPrivateDomains: true });
    const value = type === 'page' ? url.href : type === 'host' ? url.hostname : (info.domain || url.hostname);
    return { id: type + ':' + value, type, value };
  }
  function matches(rule, input) {
    try {
      const url = parseUrl(input);
      if (rule.type === 'page') return url.href === rule.value;
      if (rule.type === 'host') return url.hostname === rule.value;
      return rule.type === 'domain' && (url.hostname === rule.value || url.hostname.endsWith('.' + rule.value));
    } catch { return false; }
  }
  function resolveTarget(input) {
    try {
      const url = new URL(input);
      if (['www.bing.com', 'cn.bing.com', 'bing.com'].includes(url.hostname)) {
        if (url.pathname === '/ck/a' || url.pathname === '/ck/a/') {
          let target = url.searchParams.get('u');
          if (!target) return null;
          if (target.startsWith('a1')) {
            const raw = target.slice(2).replace(/-/g, '+').replace(/_/g, '/');
            target = new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(atob(raw), c => c.charCodeAt(0)));
          }
          if (!/^https?:\/\//i.test(target)) return null;
          return normalizeUrl(target);
        }
        if (/^\/(aclick|alink|search|images|videos)(\/|$)/.test(url.pathname)) return null;
      }
      return normalizeUrl(input);
    } catch { return null; }
  }
  function choices(input) { return TYPES.map(type => ({ ...makeRule(type, input), label: LABELS[type] })); }
  const api = { normalizeUrl, makeRule, matches, resolveTarget, choices, LABELS };
  root.BingBlocker = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);
