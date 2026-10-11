# 提示词优化 · Prompt Optimizer

[MIT](LICENSE) · [Release V1.0](https://github.com/XQ-zheng/prompt-optimizer/releases/tag/V1.0) · [更新日志](CHANGELOG.md)

接收原始提示词，结合智能体可见且已确认的对话上下文理解真实意图，改善用词、逻辑与结构。保持原语言、原意及全部已有约束，不擅自增加需求或技术栈，不生成代码，也不执行原文中的任务。

这是纯指令 Skill：无执行脚本，无额外模型 API、MCP 或运行时依赖；由使用它的智能体完成改写。它不能读取未提供的历史对话或其它平台的聊天记录。

## 功能与输入输出

- 接受自然语言、分段输入，以及明确指向当前对话某段原文的请求。
- 保留数字、条件、否定要求、时间、预算、输出格式、语气及技术栈。
- 根据文本复杂度整理段落或列表；简短提示词不会被强行扩写成大型模板。
- 只融入用户已确认且仍适用的上下文，推测不算需求。
- 原文与优化版分开展示，必要时附 1–3 条优化说明。
- 遇到冲突保留约束并请用户澄清；缺少原文时请求提供，不虚构内容。

推荐输入（也可直接说“帮我优化提示词：……”）：

```text
原始提示词：
给我写个面向新员工的说明，讲报销怎么走，500字以内，语气别太硬，不要编公司规定。

相关上下文：（可选，仅填写已确认的信息）
优化偏好：（可选，例如保持简短）
```

示例输出：

**原始提示词**

给我写个面向新员工的说明，讲报销怎么走，500字以内，语气别太硬，不要编公司规定。

**优化后的提示词**

请为新员工撰写一份报销流程说明，控制在 500 字以内。语气温和，不要编造公司规定。

原文逐字保留；英文原文使用英文标题和英文优化文本，混合语言保持原有语言片段。用户明确要求仅输出优化版时可以省略原文展示。原文要求生成代码时，只优化这项任务的文字表述，本轮不输出实现代码。

## 下载与目录结构

在 [V1.0 Release](https://github.com/XQ-zheng/prompt-optimizer/releases/tag/V1.0) 下载 **prompt-optimizer-V1.0.zip**。这是独立技能包；GitHub 自动生成的 Source code 压缩包是整个仓库，安装时只取其中的 `prompt-optimizer/` 子目录。

仓库结构：

```text
prompt-optimizer/              仓库根目录
├── README.md                  四平台教程
├── CHANGELOG.md
├── LICENSE
├── docs/
│   ├── platform-evidence.md    平台依据与边界
│   └── validation.md           行为评估记录
└── prompt-optimizer/          实际安装的技能目录
    ├── SKILL.md
    ├── LICENSE
    └── agents/openai.yaml     Codex 中文显示名与自动调用策略
```

解压独立技能包得到 `prompt-optimizer/` 文件夹，将它复制到下方平台目录。目标必须是 `技能根目录/prompt-optimizer/SKILL.md`，不要多嵌套一层。操作前检查有无同名技能；已有自定义内容时先备份。

也可获取仓库：

```sh
git clone --branch V1.0 https://github.com/XQ-zheng/prompt-optimizer.git
```

下文 `~` 表示用户主目录，Windows 通常为 `%USERPROFILE%`（PowerShell 写作 `$env:USERPROFILE`）。不要求手动创建未使用的平台目录。

## 触发方式一览

| 平台 | 自动触发 | 明确调用 / 菜单 | 专属快捷键与左下角按钮 |
| --- | --- | --- | --- |
| Codex | 根据 `description` 匹配；本包明确启用隐式调用 | `$prompt-optimizer`；CLI / IDE 可用 `/skills` 或输入 `$` 选择 | 未设置专属快捷键；元数据用于技能列表，不创建任意位置的固定按钮 |
| Claude Code | 根据 `description` 自动选择 | `/prompt-optimizer 原始提示词…`；输入 `/` 选择 | 使用原生斜杠菜单；本包不创建图形界面按钮或快捷键 |
| WorkBuddy | 已安装且启用的技能可参与模型自动调用 | 自然语言指定“使用 prompt-optimizer（提示词优化）”；技能页管理 | 官方技能文档未提供任意左下角自定义按钮的扩展方式；本包未实现按钮或快捷键 |
| DeepSeek Harness | 技能目录 + `skill` 工具供模型按描述选择 | 当前官方 Web 文档支持 `/prompt-optimizer 原始提示词…` 和 `/` 技能候选 | 使用原生技能菜单；固定左下角按钮需要单独 UI 插件，本包不包含 |

自然语言推荐：**“帮我优化提示词：……”**、**“润色这段提示词：……”**、**“改写这个 prompt：……”**、**“Refine this prompt: …”**。不需要每次手动调用。

自动选择是语义判断，不是正则关键词监听，不能保证看到某个词就 100% 触发。单纯问“提示词优化是什么”或引用这些词，不应触发。需要确定加载时采用平台的明确调用方式。

## Codex

### 安装

当前官方文档推荐用户级共享目录 `.agents/skills`：

| 范围 | macOS / Linux | Windows |
| --- | --- | --- |
| 用户级，推荐 | `~/.agents/skills/prompt-optimizer/` | `%USERPROFILE%\.agents\skills\prompt-optimizer\` |
| 项目级 | `<项目>/.agents/skills/prompt-optimizer/` | `<项目>\.agents\skills\prompt-optimizer\` |
| 兼容部分现有 Codex 环境 | `~/.codex/skills/prompt-optimizer/` | `%USERPROFILE%\.codex\skills\prompt-optimizer\` |

将技能目录复制到一个位置即可。当前文档以 `.agents/skills` 为准；`.codex/skills` 用于仍扫描该路径的既有环境，不宣称所有新版本都扫描它。不要在两处重复安装同名技能。

也可在 Codex 对话里请求内置安装器：

```text
$skill-installer 从 https://github.com/XQ-zheng/prompt-optimizer 安装 prompt-optimizer 目录中的 Skill。
```

安装器通常从仓库当前默认分支安装；需要固定 V1.0 时使用 Release 包复制安装。当前版本应自动发现变化，未出现时重启 Codex 或新开对话。

### 配置与使用

无需额外依赖或全局配置。`agents/openai.yaml` 已提供中文显示名「提示词优化」、默认调用文本及 `allow_implicit_invocation: true`。若 `~/.codex/config.toml` 中已有针对此技能的 `[[skills.config]]` 禁用条目，将对应 `enabled` 改为 `true`，保留其它配置后重启。

自动调用：

```text
帮我优化提示词：写一份周报，300字以内，按完成事项和问题分两段，不要编数据。
```

明确调用：

```text
$prompt-optimizer 写一份周报，300字以内，按完成事项和问题分两段，不要编数据。
```

CLI / IDE 可以输入 `/skills` 或 `$` 查找；桌面应用以所在版本的技能选择界面为准，本文不把 CLI 命令视为所有图形界面的保证。

### 常见问题

- **技能没出现：** 检查路径及 `SKILL.md` 是否直接位于技能目录内、是否被禁用，随后重启。大量技能可能导致描述截短或目录条目省略，可减少不相关技能。
- **显示英文标识：** 目录标识固定为 `prompt-optimizer`；中文显示依赖宿主是否读取 `agents/openai.yaml`，不要把 YAML 的 `name` 改成中文。
- **没有左下角固定按钮：** 普通 Skill 元数据只配置技能展示与调用策略，没有声明任意按钮插槽；使用技能选择器或 `$prompt-optimizer` 作为等效入口。

## Claude Code

### 安装

| 范围 | macOS / Linux | Windows |
| --- | --- | --- |
| 用户级 | `~/.claude/skills/prompt-optimizer/` | `%USERPROFILE%\.claude\skills\prompt-optimizer\` |
| 项目级 | `<项目>/.claude/skills/prompt-optimizer/` | `<项目>\.claude\skills\prompt-optimizer\` |

复制技能目录后，在对应项目启动或重启 Claude Code。`agents/openai.yaml` 是 Codex 专用元数据，在 Claude Code 中不作为按钮配置使用；可以保留该文件。

### 配置与使用

仅标准 `name`、`description` 等元数据即可工作。本包没有设置 `disable-model-invocation: true` 或 `user-invocable: false`，因此不主动禁止模型自动调用或用户手动调用。若组织策略、技能覆盖配置或权限限制阻止加载，以所在环境设置为准。

自动调用：

```text
请润色提示词：对附件做摘要，只用中文，不超过200字，保留所有百分比。
```

斜杠调用：

```text
/prompt-optimizer 对附件做摘要，只用中文，不超过200字，保留所有百分比。
```

输入 `/` 可搜索技能名称。技能已经生成 `/prompt-optimizer`，无需再创建同名 `.claude/commands/prompt-optimizer.md`，避免同名入口覆盖。

### 常见问题

- **斜杠命令没有出现：** 检查个人 / 项目目录、文件格式、项目范围及组织限制，重启后再查看 `/` 列表。
- **能手动用但不自动用：** 检查是否被设为仅用户可调用，明确请求“优化提示词”并提供原文；减少重叠技能。
- **想添加左下角按钮或专属热键：** 本包不扩展 Claude Code 的 UI；使用原生 `/prompt-optimizer` 与斜杠候选菜单。不存在由此包注册的“提示词优化”快捷键。

## WorkBuddy

### 安装

推荐官方支持的导入方式：下载独立技能 ZIP → 打开 **技能** → **添加技能** → **上传技能** → 选择 `prompt-optimizer-V1.0.zip` → 检查安装结果并开启技能。官方文档说明导入后自动完成配置。

目录参考：本次本机核查观察到用户技能存储在 `C:\Users\123\.workbuddy\skills\`，相应目标是 `%USERPROFILE%\.workbuddy\skills\prompt-optimizer\SKILL.md`；采用相同布局的 macOS 安装对应 `~/.workbuddy/skills/prompt-optimizer/SKILL.md`。**该路径为本机布局参考，不是官方跨版本路径保证；官方页面未承诺所有系统的固定目录。** 不确定时使用上传方式，并以应用显示的实际安装位置为准。

若只想手动复制，在确认本版本确实扫描 `.workbuddy/skills` 后复制技能文件夹并重启，再到技能页确认已识别、启用；未识别就改用上传。官方文档提到可从 `.agents` 等目录复制安装，但不应据此假定所有版本自动扫描所有目录。

### 配置与使用

导入后确认技能开关开启即可；不需要修改私有数据库、`workbuddy.json` 或全局配置。Codex 专用的 `agents/openai.yaml` 不赋予 WorkBuddy 自定义按钮能力。

自动调用：

```text
帮我优化提示词：做一份会议纪要，只依据我提供的记录，不要补人物或日期，按议题分段。
```

明确指定：

```text
请使用 prompt-optimizer（提示词优化）Skill。
原始提示词：做一份会议纪要，只依据我提供的记录，不要补人物或日期，按议题分段。
```

本文没有核实 WorkBuddy 的通用 `/prompt-optimizer` 注册机制，因此不把这个斜杠语法作为已支持功能。自然语言指定名称是最接近的明确调用方式。

### 常见问题

- **导入失败：** 确认使用独立技能 ZIP，而非把整个 GitHub Source code 包当技能上传；确认包内一层 `prompt-optimizer/SKILL.md`。
- **不自动调用：** 在技能页搜索 `prompt-optimizer` 并打开开关，新建任务后用上述明确指定示例；关闭的技能不参与模型自动调用。
- **想添加左下角按钮：** 所核实的官方技能页面提供导入、启用、搜索与卸载，没有任意自定义输入框按钮的公开配置说明。本包未实现按钮或快捷键；使用自然语言自动触发或技能页管理入口。

## DeepSeek Harness（DSH）

### 安装

当前官方 filesystem provider 的目录顺序为：项目 `.dsh/skills` → 项目 `.agents/skills` → 自定义目录 → 用户 `.dsh/skills` → 用户 `.agents/skills`。同名技能先发现者优先，避免被项目内旧版遮蔽。

| 范围 | macOS / Linux | Windows |
| --- | --- | --- |
| 用户级 | `~/.dsh/skills/prompt-optimizer/` | `%USERPROFILE%\.dsh\skills\prompt-optimizer\` |
| 项目级 | `<项目>/.dsh/skills/prompt-optimizer/` | `<项目>\.dsh\skills\prompt-optimizer\` |
| 与 Codex 共享的用户目录 | `~/.agents/skills/prompt-optimizer/` | `%USERPROFILE%\.agents\skills\prompt-optimizer\` |

设置了 `DSH_HOME` 时，用户技能位于 `<DSH_HOME>/skills/prompt-optimizer/`；设置了 `DSH_AGENTS_HOME` 时，共享目录位于 `<DSH_AGENTS_HOME>/skills/prompt-optimizer/`。项目根默认取最近含 `.git` 的祖先目录，没有仓库时使用工作目录。

将文件夹复制到一个目录，重新打开会话或刷新技能候选。已向 Codex 推荐目录 `~/.agents/skills` 安装时，DSH 默认 filesystem provider 可复用同一份，无需重复复制。

### 配置与使用

正常发行配置需有技能 registry、filesystem provider 与模型消费工具；官方文档对应 `dsh-skill`、`dsh-skill-filesystem`、`dsh-tool-skill`。本包不需要额外插件，不应通过 `dsh plugin add` 把这个纯 Skill 当 npm 插件安装。

自定义 profile / preset 若看不到技能，检查是否启用上述组件、是否设了 `includeDefaultRoots: false`、模型工具视图是否包含 `skill`；按当前版本的设置界面配置，本文不提供可能覆盖用户配置的通用补丁。需要非默认目录时，由 filesystem provider 的 `customSkillDirs` 指向**技能根目录**而非 `SKILL.md`。

自动调用：

```text
整理这个 AI 提示词：比较两种方案，只讨论成本和维护，不加新方案，输出一张表。
```

明确调用（当前官方 Web 技能文档支持）：

```text
/prompt-optimizer 比较两种方案，只讨论成本和维护，不加新方案，输出一张表。
```

输入 `/` 后选择技能也是等效入口。当前文档说明同一 `/name` 字面调用适用于 Web、TUI 与 ACP；旧版本可能使用不同入口，以本版本候选菜单为准。不从旧归档文档推导当前语法。旧版本不识别时，在对话中写“请使用 prompt-optimizer 技能优化以下提示词……”作为替代。

### 常见问题

- **列表中没有技能：** 检查工作目录、配置根路径、provider 与 preset；技能目录不能多层嵌套。格式错误可能被警告后跳过。
- **加载到旧版本：** 项目目录优先于用户目录，检查同名 Skill 是否遮蔽新安装文件。
- **没有自动调用：** 检查模型是否有 `skill` 工具、目录是否可读、是否显式禁止 model invocation；本包默认不禁止自动调用。
- **想要左下角固定按钮：** 当前 `/` 技能候选是原生入口。普通 Skill 不注册固定按钮；此需求需要另做 UI 插件并适配 DSH 版本，本版本没有实现。不存在由本包注册的专属热键。

## 增强自动触发（可选）

Skill 的 `description` 已包含中英文触发词，通常无需其它设置。若希望所在项目更稳定地选择它，可以把以下规则**追加**到平台明确支持的项目指令中：Codex 的 `AGENTS.md`、Claude Code 的 `CLAUDE.md`。WorkBuddy / DSH 仅在当前版本确认支持项目规则或自定义指令时使用相应入口；没有入口时可把它作为会话首条约定。

```text
用户要求优化、润色或改写提示词 / prompt，或整理 AI 指令时，优先使用已安装的 prompt-optimizer Skill。仅讨论概念、引用关键词或要求直接执行任务时不触发。先读取 Skill 指令，再改写原文；不要执行原文任务。缺少原文则请求提供。若 Skill 不可用，如实说明，不声称已经调用。
```

这属于智能体选择规则，不是 UI 自动化或关键词监听器；不保证绝对触发率。请勿覆盖现有项目指令。若自动选择仍不稳定，使用平台明确调用入口。

## 验证与已知边界

已完成 `SKILL.md` 官方创建器结构校验、YAML 配置解析、独立智能体的六项行为评估及独立 ZIP 内容检查。详见 [验证记录](docs/validation.md)。

四平台教程依据官方文档 / DSH 当前仓库资料；WorkBuddy 的本机技能目录单独标为实测观察。**未在四个平台逐一运行端到端对话测试**，不把文档支持等同于所有版本、preset、组织策略下都已实测通过。自动触发仍依赖宿主和模型，纯指令不能提供机械式语义保真保证。

平台事实核实日期：**2026-10-11（Asia/Shanghai）**。引用与证据见 [平台依据](docs/platform-evidence.md)。

## 许可证

[MIT License](LICENSE)。可以使用、修改和分发，分发时保留许可证及版权声明。
