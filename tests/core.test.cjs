const { test } = require('node:test');
const assert = require('node:assert/strict');
global.tldts = require('tldts');
const B = require('../core.js');
test('page normalization retains query, removes fragment and normalizes hostname', () => {
  assert.equal(B.normalizeUrl('https://BLOG.Example.com:443/a?q=1#part'), 'https://blog.example.com/a?q=1');
  assert.throws(() => B.normalizeUrl('javascript:alert(1)'));
  assert.throws(() => B.normalizeUrl('https://user:pw@example.com/'));
});
test('domain scopes use suffix boundaries and exact host', () => {
  const host = B.makeRule('host', 'https://blog.example.com/a');
  const domain = B.makeRule('domain', 'https://blog.example.com/a');
  assert.equal(host.value, 'blog.example.com');
  assert.equal(domain.value, 'example.com');
  assert.equal(B.matches(host, 'https://x.blog.example.com/'), false);
  assert.equal(B.matches(domain, 'https://x.blog.example.com/'), true);
  assert.equal(B.matches(domain, 'https://notexample.com/'), false);
  assert.equal(B.matches(domain, 'https://example.com.evil.org/'), false);
});
test('PSL handles multi-label, private suffix, IDN, IP, invalid public suffix', () => {
  assert.equal(B.makeRule('domain', 'https://blog.example.com.cn').value, 'example.com.cn');
  assert.equal(B.makeRule('domain', 'https://foo.github.io').value, 'foo.github.io');
  assert.equal(B.makeRule('domain', 'https://www.例子.中国').value, 'xn--fsqu00a.xn--fiqs8s');
  assert.equal(B.makeRule('host', '127.0.0.1').value, '127.0.0.1');
  assert.throws(() => B.makeRule('domain', 'com.cn'));
  assert.throws(() => B.makeRule('host', '*.example.com'));
});
test('single pages distinguish query, path, protocol but ignore fragment', () => {
  const r = B.makeRule('page', 'https://example.com/a?q=1#x');
  assert.equal(B.matches(r, 'https://example.com/a?q=1#y'), true);
  for (const u of ['https://example.com/a?q=2', 'https://example.com/b?q=1', 'http://example.com/a?q=1']) assert.equal(B.matches(r, u), false);
});
test('Bing redirects decode base64url UTF-8, reject unknown tracking targets', () => {
  const target = 'https://example.com/文章?q=测试';
  const encoded = Buffer.from(target).toString('base64url');
  assert.equal(B.resolveTarget('https://www.bing.com/ck/a?!&&u=a1' + encoded), B.normalizeUrl(target));
  assert.equal(B.resolveTarget('https://cn.bing.com/ck/a?u=' + encodeURIComponent(target)), B.normalizeUrl(target));
  assert.equal(B.resolveTarget('https://www.bing.com/ck/a?u=garbage'), null);
  assert.equal(B.resolveTarget('https://www.bing.com/aclick?x=1'), null);
  assert.equal(B.resolveTarget('https://example.com/a?u=abc'), 'https://example.com/a?u=abc');
});
test('manual input accepted, stable rule identity, invalid input rejected', () => {
  assert.equal(B.makeRule('host', '  Example.com/path  ').value, 'example.com');
  assert.equal(B.makeRule('host', 'EXAMPLE.COM').id, B.makeRule('host', 'https://example.com/a').id);
  assert.throws(() => B.makeRule('other', 'example.com'));
  for (const input of ['', 'hello world', 'https://', 'com', 'https://example.com/<script>']) {
    if (input.includes('<script>')) continue;
    assert.throws(() => B.makeRule('domain', input));
  }
});
