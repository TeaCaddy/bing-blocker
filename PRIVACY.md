# 隐私说明 / Privacy

适用版本：1.1.0。更新日期：2026-11-14。

## 访问与保存的数据

内容脚本在 `www.bing.com` 和 `cn.bing.com` 的 HTTPS 搜索页读取普通结果的目标链接，用于生成屏蔽选项并判断是否隐藏结果。扩展不保存搜索历史或页面正文。

本地保存的数据只有屏蔽规则：类型、匹配值和据此生成的规则 ID。单页规则包含网址路径与查询参数，因此可能包含敏感信息；添加前请检查实际范围。

规则使用 `chrome.storage.local`，不使用浏览器同步存储。本项目没有后端服务、分析统计、广告追踪或规则上传。运行所需脚本和域名解析数据均随扩展打包，扩展本身不主动发送网络请求。Bing 和浏览器自身的网络行为不由本扩展控制。

## 权限

- `storage`：保存和监听规则变化。
- 两个 Bing 搜索地址上的内容脚本：读取结果链接、显示屏蔽按钮及调整结果显示。

不申请其他网站的读取权限、浏览历史、Cookie、剪贴板或下载权限。

## 删除与反馈

可在黑名单管理中逐条删除规则。卸载扩展会删除其本地扩展存储；没有服务器端副本。提交 Issue、截图或日志属于你主动向 GitHub 分享的信息，请提前移除个人网址、查询参数和黑名单。

## English summary

The extension reads result links on the two supported Bing search hosts and stores only blocking rules in local extension storage. Page rules retain query parameters, which may contain sensitive information. It does not store browsing/search history, use sync storage, send telemetry, upload rules, or load remote scripts. Delete individual rules in the manager or uninstall to remove extension data. Sanitize any information you voluntarily share on GitHub.
