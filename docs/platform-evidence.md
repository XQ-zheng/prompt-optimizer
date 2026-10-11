# 平台依据与范围

核实日期：2026-10-11（Asia/Shanghai）。只记录支持教程关键主张的证据；未把搜索摘要当完整页面，也未把归档设计说明当现行命令保证。

| 平台 | 实际读取的来源 | 支持的主张 | 证据边界 |
| --- | --- | --- | --- |
| Codex | [Build skills](https://learn.chatgpt.com/docs/build-skills)，由 `developers.openai.com/codex/build-skills` 官方地址跳转 | 用户 / 项目 `.agents/skills`、按描述隐式选择、CLI / IDE 的 `$` 和 `/skills`、`openai.yaml`、`skills.config` | 文档未给出任意位置固定按钮注册字段；本机另存在 `.codex/skills` 兼容目录 |
| Claude Code | [Skills](https://code.claude.com/docs/en/skills) | `.claude/skills`、`/skill-name`、按描述自动选择、默认调用策略、旧 commands 合并为 skills | 本包不实现 UI 扩展，不设独立热键 |
| WorkBuddy | [官方技能页面](https://www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Skills-Market) | 添加技能 / 上传技能、导入后自动配置、关闭后不参与模型自动调用、从 `.agents` 等目录复制安装 | 页面未承诺跨系统固定存储路径、通用自定义斜杠调用或任意输入框按钮注册 |
| WorkBuddy 本机观察 | 本机 `C:\Users\123\.workbuddy\skills\` 及其中的有效 `SKILL.md` | 本机技能存储布局 | 只观察目录，未向 WorkBuddy 导入或运行此 Skill；macOS 等效路径是布局参考 |
| DSH | [Skill subsystem](https://github.com/deepseek-ai/deepseek-harness/blob/d743267388641bc76f17c45ce8b4c231aed1d32c/docs/subsystems/skills.md) | 技能 registry / provider / consumer、默认目录顺序、调用策略 | 自定义 profile / preset 可改变发现范围 |
| DSH | [Filesystem provider](https://github.com/deepseek-ai/deepseek-harness/blob/d743267388641bc76f17c45ce8b4c231aed1d32c/packages/skill/skill-filesystem/README.md) | 直接子目录 `SKILL.md`、`DSH_HOME`、`DSH_AGENTS_HOME`、`customSkillDirs`、项目根与目录优先级 | 不是所有历史版本的路径保证 |
| DSH | [Web skill UI](https://github.com/deepseek-ai/deepseek-harness/blob/d743267388641bc76f17c45ce8b4c231aed1d32c/packages/client/ui-skill/README.md) | `/` 候选及直接 `/name`，文档说明 Web / TUI / ACP 一致；同名宿主命令优先 | 使用当前文档，没有采用旧归档 `/skill:name` 作为当前入口 |
| DSH | [Web commands UI](https://github.com/deepseek-ai/deepseek-harness/blob/d743267388641bc76f17c45ce8b4c231aed1d32c/packages/client/ui-commands/README.md) | 原生 `/` / `+` 菜单属于宿主 UI，客户端扩展需插件 API | 技能 Markdown 本身不注册固定按钮 |

“本包未实现按钮”是实现事实；“未核实公开扩展入口”只表示上述来源不建立该能力，不断言平台永远无法支持插件。今后平台变更，应更新教程与验证范围后再发布版本。
