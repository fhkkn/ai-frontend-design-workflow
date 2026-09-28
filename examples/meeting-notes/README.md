# 页间 · 会议纪要编辑器

这是一次实际编码、截图、修改和操作验证的教学案例，业务和纪要内容均为虚构。交付级别为可交互原型；没有客户项目或用户研究背书。

## 阅读顺序

1. [需求和方向选择](brief.md)：范围、约束、候选与取舍。
2. [设计规范](design-system.md)：本案例使用的视觉规则。
3. [自查和迭代](review.md)：首版观察、修改理由和前后证据。
4. [验收结果](acceptance.md)：执行过什么、哪些还没有验证。
5. [当前状态](status.md)：下一次工作从哪里开始。

## 运行

从仓库根目录执行：

```sh
python -m http.server 8765 --bind 127.0.0.1 --directory examples/meeting-notes
```

浏览器访问 http://127.0.0.1:8765 查看最终版；访问 http://127.0.0.1:8765/before/ 查看桌面优先的首版基线。比较时建议使用无痕窗口，避免已有本地内容影响截图。两版共享同一来源下的示例存储键。

新建、编辑、搜索和本地保存可用。关闭页面前的未保存提示由浏览器控制。内容仅保存在此浏览器、此来源的 localStorage 中；清理站点数据会丢失记录。示例没有录音上传、转写、账户、云端同步、删除、导出或多人协作。

## 前后截图

| 版本 | 桌面 1440px | 手机 390px |
| --- | --- | --- |
| 首版 | [查看](screenshots/before-desktop.png) | [查看](screenshots/before-mobile.png) |
| 修改后 | [查看](screenshots/after-desktop.png) | [查看](screenshots/after-mobile.png) |

手机首版截图为完整页面截图，图片宽度是溢出后的 760px；实际浏览器视口为 390px。修改后完整页面宽度为 390px。

## 可选的自动验证

运行页面不需要 Node.js。若需要复核自动操作，安装 Node.js、Microsoft Edge，并在案例目录安装验证依赖：

```sh
cd examples/meeting-notes
npm install --no-save --package-lock=false playwright
node verify.cjs
```

验证前应保持上面的静态服务器运行。脚本默认使用已安装的 Edge；可通过 `BROWSER_CHANNEL` 指定本机可用的浏览器渠道，通过 `DEMO_URL` 指定服务地址。脚本使用隔离的浏览器上下文，不读取日常浏览器中的纪要。

脚本会覆盖修改后的两张截图，检查布局、搜索、保存、草稿放弃和存储异常。首次基线保存在 `before/`，用于说明演变过程，不作为推荐实现。
