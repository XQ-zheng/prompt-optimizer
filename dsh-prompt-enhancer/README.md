# DSH 输入框「增强提示」插件

在 DeepSeek Harness Web 输入框右侧的原生 `conversation.input.right` 插槽添加「增强提示」按钮，不替换 DSH 的发送按钮或编辑器。输入草稿 → 点击增强 → 对照预览 → 点击「替换草稿」。不需要发送 `/prompt-optimizer`，也不会自动发送任务。

这是 `prompt-optimizer` 的独立配套 UI 插件，使用相同的保真编辑原则；按钮直接进行一次无工具的模型编辑调用，不通过 Skill 工具执行原文。纯 `SKILL.md` 不具备注册按钮的能力。其他智能体与 Codex 默认预处理设置均不受影响。

## 安装与配置

已实测 DSH **0.1.0-rc.6** 的 Web 版，Node.js 22+。更早或更晚版本须核对插槽和 `apiProxy` / `llm` API。本版本限本机 `http://127.0.0.1:<端口>` 或 `http://localhost:<端口>` 页面；不支持远程反向代理、`0.0.0.0` 绑定、Electron / TUI / ACP 输入框。

1. 从 [V1.2 Release](https://github.com/XQ-zheng/prompt-optimizer/releases/tag/V1.2) 下载 `dsh-prompt-enhancer-1.2.0.tgz`，放入本地目录。
2. 在该目录打开终端，使用 DSH 原生插件管理安装：

   ```sh
   dsh plugin --profile web add ./dsh-prompt-enhancer-1.2.0.tgz
   ```

   Windows PowerShell 也可使用此相对路径。若文件不在当前目录，改用完整路径并加引号。
3. 停止自己正在运行的 DSH Web 进程（先等待任务结束），再运行 `dsh web`。刷新浏览器页面。
4. 在 DSH 选择一个可用模型，打开普通会话并输入文字。输入框内会出现「增强提示」，空草稿时禁用。

无需配置额外 API Key。调用沿用**点击时当前会话选中的 provider / model / reasoning effort**，凭据由 DSH 服务端解析，不传给浏览器。此调用会使用相应模型的额度或计费；不会启动代理任务，不执行文件工具，也不会把优化结果写进会话历史。

默认用户配置位置：Windows `%USERPROFILE%\.dsh\profiles\web\package.json`，macOS/Linux `~/.dsh/profiles/web/package.json`；`DSH_HOME` 自定义时以其路径为准。原生管理器负责添加依赖和 bundle 条目，包通常在该 profile 的 `node_modules` 下；pnpm 实际存储布局由安装器决定，不要手改其内部目录。

源码开发安装：

```sh
git clone https://github.com/XQ-zheng/prompt-optimizer.git
cd prompt-optimizer/dsh-prompt-enhancer
npm ci
npm test
npm run build
```

随后执行 `dsh plugin --profile web add "link:<该插件目录的绝对路径>"`。将占位符换成实际路径，例如 Windows `link:C:/projects/prompt-optimizer/dsh-prompt-enhancer` 或 Unix `link:/home/me/prompt-optimizer/dsh-prompt-enhancer`。使用 link 时保留源码目录及其中的依赖，不要移动后仍沿用旧链接。发布包已含构建产物，无需自行构建。

## 使用

在输入框输入：

```text
给我写个面向新员工的说明，讲报销怎么走，500字以内，语气别太硬，不要编公司规定。
```

点击「增强提示」，预览分别显示原始文本和优化文本，例如：

```text
请写一份面向新员工的说明，讲清报销怎么走，500字以内。
语气别太硬，不要编造公司规定。
```

- **替换草稿**：核对后替换输入框文字，仍需自己点击 DSH 发送按钮。
- **取消 / Esc**：关闭预览，保留原草稿。生成期间「取消优化」会中止 HTTP 请求并通知服务端取消调用。
- **重新优化**：按当前草稿重新生成。可在预览中取消勾选「结合本会话用户消息」后重试；切换此选项只影响下一次生成，不会改变已显示的结果。

默认参考当前会话中的全部**用户文字消息**，用于理解指代和既有约束；不采用模型建议、工具输出、插件注入、其他会话或附件内容作为用户要求。模型负责判断旧约束是否仍适用；这是语义编辑，预览确认仍然必要。历史 JSON 超过 64 KiB 时拒绝请求并提示，不静默截断；用户可取消上下文选项后重新优化。

输入草稿最多 16384 UTF-16 字符；输出最多 8192 tokens / 32768 字符。90 秒超时、空输出、异常结束、截断或工具调用结果均不会用于替换。草稿改变（包括改动后撤销）、正在提交或切换会话时拒绝旧结果覆盖。

原有图片附件保持在输入框中，优化模型只看到文字。含文件/技能引用芯片的草稿暂时禁用增强，因为整段替换无法保证芯片语义与位置；不把芯片悄悄转换成文本，也不删除附件。普通手写路径文字仍可优化。

## 常见问题

**找不到按钮**：确认安装的是本插件 `.tgz` 而非纯技能 ZIP，使用 `web` profile，重新启动服务并刷新浏览器。检查插件加载错误及 DSH API 版本。无会话时不会显示可操作的按钮。

**按钮灰色**：先打开普通会话并输入非空文字；移除引用芯片后再试，或结束命令输入/提交状态。子智能体会话暂不支持。

**调用失败**：在 DSH 原生模型选择器确认模型可用与额度充足；不要把 API Key 填进前端。失败后草稿保持原样。

**使用远程访问 / HTTPS / 桌面 Electron**：本版本仅支持本机 Web。服务器接口主动拒绝其他绑定与来源；不会宣称这些场景已适配。

**为什么不是输入后自动弹出按钮**：按钮是原生输入框内的常驻操作，空草稿时禁用，输入后可点击。不自动改写或发送，避免意外调用模型。没有新增快捷键；Esc 仅用于关闭预览。

**回退 / 卸载**：运行 `dsh plugin --profile web remove dsh-prompt-enhancer`，重启 DSH 并刷新页面。保留既有 Skill 与其他插件，不覆盖配置文件。旧 V1.0 / V1.1 Release 保留。

## 开发与接口

- `src/client.jsx`：原生按钮、对照预览、取消和会话/草稿保护；通过公开 `inputActions.setDraft` 写回，永不调用 `submit`。
- `src/index.mjs`：`POST /api/prompt-enhancer/optimize`，服务端使用 `apiProxy.sessions.models` 获取选中模型，再通过 `llm.stream` 进行无工具编辑。
- 输入 JSON：`{ "sessionId": "已打开的会话ID", "draft": "原文", "includeContext": true }`。
- 成功输出 JSON：`{ "optimized": "优化文本", "provider": "...", "model": "...", "contextMessages": 0 }`；失败为 `{ "error": "简短原因" }`。
- 请求必须来自本机同源页面，`Content-Type: application/json`，`X-DSH-Prompt-Enhancer: 1`；不允许跨站/任意 Host。每个会话同时最多一项优化，全局最多三项。
- 客户端注册由 DSH module loader 管理，卸载时注销插槽；服务端卸载时取消活动调用。无需修改 DSH 上游源码。

运行 `npm test` 进行 10 项核心与真实 HTTP handler 测试；它们使用可控模型流夹具，不消耗真实模型额度。实机浏览器验证范围见 [验证记录](../docs/dsh-validation.md)。

[MIT](LICENSE)。
