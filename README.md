# Bing 屏蔽助手

Chrome / Edge 等 Chromium 浏览器的轻量扩展。支持在 Bing 普通网页搜索结果旁选择屏蔽范围，也可以手动添加规则。

## v1.1.0 界面更新

- 青绿色配色，更新弹窗、黑名单管理页、空状态和搜索结果屏蔽按钮。
- 新增搜索减号图标，提供 16、32、48、128 像素版本，用于工具栏和扩展管理页。
- 用不同颜色区分单页、子域名和整个网站规则，优化焦点与悬停样式。
- 原有 7 项自动化测试全部通过，并检查了管理页和弹窗截图。

**从旧版更新：** 将新版 ZIP 解压后的文件覆盖到原先加载的扩展文件夹，保留相同路径；在扩展管理页点击“重新加载”，再刷新 Bing 页面。无需卸载旧扩展，这样可保留已有黑名单。源码已迁移至 `E:\Projects\bing-blocker`。如果之前从其他目录加载，为保留黑名单，可将新版文件复制回原加载路径再重新加载。

## 安装

1. 将 ZIP 解压到一个长期保留的文件夹。已有 `bing-blocker` 文件夹则无需解压。
2. Chrome 地址栏输入 `chrome://extensions`；Edge 输入 `edge://extensions`。
3. 开启“开发者模式”，点击“加载已解压的扩展程序”。
4. 选择包含 `manifest.json` 的 **bing-blocker 文件夹**，不要选择 ZIP 或它的上级目录。
5. 刷新已经打开的 Bing 搜索页。在浏览器扩展菜单中将“Bing 屏蔽助手”固定，方便管理。

加载后请保留此文件夹。更新代码后，在扩展管理页点击扩展卡片上的重新加载按钮，再刷新 Bing 页面。

## 使用

搜索结果标题下面会出现“屏蔽”按钮。点击后有三个选项：

| 选项 | 示例 | 范围 |
|---|---|---|
| 仅此页面 | `https://blog.example.com/a?q=1` | 精确网址，忽略 `#` 锚点，保留查询参数；HTTP 与 HTTPS 分开 |
| 当前子域名 | `blog.example.com` | 仅此主机名；不含 `x.blog.example.com` 或其他子域名 |
| 整个网站 | `example.com` | 此域名与全部子域名 |

命中后整条结果直接消失，不留占位。翻页、动态加载和刷新后继续过滤。

点击浏览器工具栏扩展入口，可手动输入网址或域名、选择范围并添加。点击“管理黑名单”，可以搜索和删除规则。删除后，当前已打开的 Bing 搜索页会恢复不再被其他规则屏蔽的结果。重叠规则必须全部删除后才会恢复。

不带协议的手动地址默认补全为 `https://`，单页规则请核对预览。`com.cn` 等公共后缀不能作为规则；`foo.github.io` 之类独立托管站点会按各自网站处理，避免一次屏蔽整个托管平台。

## 范围与隐私

- 支持 HTTPS 下的 `www.bing.com/search` 和 `cn.bing.com/search` 普通网页结果。
- 首版不处理图片、视频、AI 回答、广告和其他特殊卡片；不自动补足被隐藏后的结果数量。
- 支持常见 Bing `/ck/a` 编码跳转链接。不能确定目标的网址不会猜测屏蔽。
- 只申请 `storage` 权限，内容脚本仅在上述 Bing 搜索地址运行。无需账号，无服务器，不上传黑名单或搜索记录。
- 规则保存在当前浏览器配置的本地扩展存储中，不在设备间同步；卸载扩展会移除其本地数据。
- Bing 页面结构若发生变化，可能需要更新扩展的结果选择器。

## 验证

在独立 Chromium 158 测试配置中实际加载 Manifest V3 扩展，7 个自动化测试全部通过，包括三种范围、管理页面、弹窗添加、删除恢复、动态结果、链接更换、刷新保留和 12 次并发保存。

2026-11-14 对真实 `www.bing.com` 和 `cn.bing.com` 各执行了一次搜索验证：各识别 10 个结果按钮，点击“仅此页面”后成功隐藏 1 条结果。这是当前页面结构的抽样验证，不代表所有地区、账号和 Bing 实验版本均已覆盖。

## 文件与依赖

- `manifest.json`：扩展声明。
- `core.js`：网址归一化、跳转解析与规则匹配。
- `background.js`：串行保存和删除规则，避免多标签页写入覆盖。
- `content.js` / `content.css`：搜索结果按钮、范围对话框和过滤。
- `popup.html` / `options.html` / `ui.js` / `ui.css`：弹窗与黑名单管理。
- `vendor/tldts.js`：本地打包的域名解析库，运行时无需下载依赖。

参考：[Chrome 内容脚本](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)、[Chrome 本地存储 API](https://developer.chrome.com/docs/extensions/reference/api/storage)、[Playwright 扩展测试](https://playwright.dev/docs/chrome-extensions)。

## 开发与测试

项目根目录可直接加载为扩展。使用 Node.js 20 或更新版本：

```sh
npm ci
npx playwright install chromium
npm test
```

测试覆盖网址匹配和真实 Chromium 扩展交互。测试截图保存在已忽略的 `tests/artifacts/` 中，测试使用独立浏览器配置。
