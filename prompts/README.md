# 可复用提示词

| 场景 | 入口 |
| --- | --- |
| 打破普通、雷同的设计 | [随机发散与视觉实验](random-exploration.md) |
| 新项目、改版、新增页面与续接 | [任务入口](../guides/start.md) |
| 接入、实现、评审、修改、素材、减法、文案、验收 | [分阶段提示词](stages.md) |
| 希望 AI 按同一套方法持续执行 | [前端发散设计 skill](../skills/frontend-divergent-design/SKILL.md) |

提示词是可以粘贴的一次性工作指令；skill 则包含阶段判断、随机抽取脚本与工作边界。无需将所有提示词同时发送。

项目内 skill 位于 `skills/frontend-divergent-design/`。需要安装时，将该完整目录复制到你的 Codex 技能目录；已安装后可使用 `$frontend-divergent-design`。当前会话若未识别该名字，可明确要求读取项目内的 `SKILL.md` 并按其执行，不应假定仅存入仓库便已自动启用。

这些是前端设计方法的项目化改写，非文章原文提示词。使用虚构内容公开案例；实际业务资料、个人偏好讨论及过程记录按所在项目的隐私要求保存。
