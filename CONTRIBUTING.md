# 贡献指南 / Contributing

欢迎提交 Bug、文档修正和代码改进。Issue 和 PR 可使用中文或英文。

## 报告问题

请附上浏览器名称与版本、扩展版本、使用的 Bing 域名、复现步骤、预期行为和实际行为。网址、搜索词、截图及控制台输出请先脱敏，使用 `example.com` 等占位域名代替私人信息。不要上传完整浏览器配置或个人黑名单。

涉及数据泄露或安全漏洞的问题请先阅读 [SECURITY.md](SECURITY.md)，不要直接公开攻击细节。

## 本地开发

1. Fork 并克隆仓库，在新分支上修改。
2. 使用 Node.js 22 或更新的受支持版本，执行 `npm ci`。
3. 执行 `npx playwright install chromium`；Linux 环境如缺系统依赖，使用 `--with-deps`。
4. 在浏览器扩展管理页加载项目根目录。修改后重新加载扩展，并刷新 Bing 页面。
5. 执行 `npm test`。新增行为或修复匹配错误时，请提供相应回归测试。

扩展使用原生 JavaScript、HTML、CSS，不需要打包步骤。保留本地运行、最小权限和不上传规则的设计。提交前使用 `git diff --check` 检查空白问题，不提交 `node_modules/`、个人规则或测试截图。

## Pull request

- 说明解决的问题、行为变化和验证方法。
- UI 调整附上使用示例数据的截图，并检查工具栏弹窗和管理页。
- 更新依赖时同步 `package-lock.json`；更新 tldts 时，将其 `dist/index.umd.min.js` 与许可证同步到 `vendor/`，更新第三方声明并运行完整测试。
- 将改动限制在一个明确问题内；较大的功能改动先通过 Issue 讨论。

提交贡献即表示你有权提供这些内容，并同意以本项目的 MIT 许可证发布该贡献。第三方素材需标注来源并保留其许可证。

## English summary

Use an isolated branch, Node.js 22+, `npm ci`, `npx playwright install chromium`, and `npm test`. Describe the problem, behavior change, and validation in each PR. Add regression tests for functional changes and sanitized screenshots for UI changes. Keep permissions minimal, avoid remote code or telemetry, and update vendored files and notices alongside dependency upgrades. Contributions are provided under the project's MIT license.
