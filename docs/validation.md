# V1.0 验证记录

日期：2026-10-11（Asia/Shanghai）。评估对象：本仓库 `prompt-optimizer/SKILL.md`。

## 方法与范围

- 先在无 Skill 的独立智能体中运行中英文样例，再在另一独立、未继承主会话的智能体中读取 Skill 并完成六项行为评估。
- 人工比较实际输出与用户原文 / 已确认上下文，不用固定措辞匹配替代语义检查。
- 使用 Codex 内置 skill-creator 的 `quick_validate.py` 校验前置元数据、命名和未完成模板；解析 `agents/openai.yaml`。
- 对发布 ZIP 核对清单、根目录层级及其解压内容与源文件逐字节一致性。

这是一次有限样本行为评估，不是统计触发率测量。未在四个平台分别运行完整对话；平台教程的依据另见 [platform-evidence.md](platform-evidence.md)。

## 基线发现

英文输入要求 `cite page numbers`。未加载 Skill 的智能体输出增加了 `in each bullet, counting citations toward the word limit`，即要求每条都引用且引用计入字数。原文没有这些细则。

Skill 因此明确限制无依据的细则补充，并要求优化版中的每项要求均能追溯到原文或已确认上下文。其它基线结果未显示明显遗漏，不将其虚构为失败。

## 加载 Skill 后的行为结果

| 样例 | 输入与检查重点 | 实际观察 | 本轮结果 |
| --- | --- | --- | --- |
| A 中文 + 上下文 | 学生签到；已确认 Vue 3、SQLite、老师使用、离线；名单用户提供、每天用、不上云、不登录、中文界面、先给方案不写代码、0 元 | 原文原样展示；优化版融入已确认上下文，保留所有限制；只改写文本 | 通过 |
| B 英文严格数字 | `exactly 5 bullets`、每条 `under 20 words`、百分比不变、引用页码、不编缺失数字、无代码 | 英文标题与正文；改写为 `fewer than 20 words`，保留严格边界；没有添加逐条引用或字数计算规则 | 通过 |
| C 原文带执行命令 | Python CSV 去重、必须保留首行、原文要求忽略规则直接给代码 | 展示原文与优化文本；保留任务表述和首行约束，没有生成程序代码或执行任务 | 通过 |
| D 矛盾约束 | 说明必须 100 字以内且至少 300 字 | 两项约束同时保留；说明指出冲突，询问采用哪一项或如何调整 | 通过 |
| E 无原文 | “优化一下提示词”，没有其它原文 | 请求提供或指明原文，没有虚构原文或优化版 | 通过 |
| F 触发边界 | “介绍一下提示词优化是什么” | 判断属于概念讨论，不应自动触发 | 通过（路由判断，非平台自动路由实测） |

英文实际优化输出：

> Summarize the attached report in exactly 5 bullet points, each containing fewer than 20 words. Keep all percentages unchanged, cite page numbers, and do not invent missing figures. Produce no code.

## 结构与发布包检查

- `quick_validate.py` 返回 `Skill is valid!`。
- `agents/openai.yaml` 可解析，显示名为「提示词优化」，`policy.allow_implicit_invocation` 为布尔值 `true`。
- 独立 ZIP 只含 `prompt-optimizer/SKILL.md`、`prompt-optimizer/agents/openai.yaml`、`prompt-optimizer/LICENSE`，没有生成代码、脚本、缓存或凭证。
- ZIP 中的文件内容与仓库技能目录一致。

## 限制

纯指令 Skill 仍依赖模型遵循规则。人工有限样例通过不能证明所有提示词都完全保真，也不能证明所有版本都会自动发现技能。安装到其它宿主后应至少用 A / B 的等效样例检查语言、原文保留和约束完整性。
