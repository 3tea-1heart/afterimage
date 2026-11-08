# AFTERIMAGE 程序与 AI 接口 v14

启动本机服务，并在浏览器的“设置”勾选“启用程序 / AI 自动化接口”后保存。编辑器必须保持打开。HTTP 服务仅监听 127.0.0.1；GitHub Pages / EXE 内部页面不运行这个 Node 服务，只保留页面内 API。

## 命令行

在项目根目录使用 Node.js：

```powershell
node tools/afterimage.mjs import "照片.png"
node tools/afterimage.mjs commands "commands.json"
node tools/afterimage.mjs project "作品.json"
node tools/afterimage.mjs png "成片.png"
```

CLI 从你明确指定的路径读取图片或命令文件。图片支持 PNG/JPEG/WebP，CLI 上限 14MB；导出 PNG 长边最多 2400px。会覆盖命令中明确指定的输出文件。CLI 从本机 work/local-api-session.json 读取短期令牌，不要提交或分享该文件。服务器重启后令牌更新；运行旧服务时需先重启服务再使用 v13 接口。

## 批量修图命令

`commands.json` 是最多100条命令的数组：

```json
[
  {"op":"addText","text":"PRIVATE PRESS","name":"标题"},
  {"op":"setCanvas","values":{"width":1200,"height":1200}},
  {"op":"addEffect","type":"rainfall","target":"all","params":{"amount":45,"count":100,"speed":1,"seed":23}}
]
```

| 操作 | 字段 |
| --- | --- |
| addImage | src 为内嵌 PNG/JPEG/WebP Data URL，可选 name |
| addAdjustment | type 为 grain/balance/curves/tone/levels 等效果，可选 params、above（在该图层上方插入）；曲线与色彩平衡初始为中性 |
| addText | text，可选 name；随后从返回的 layers 获得 id |
| setLayer | id、values；位置、尺寸、旋转、透明度、文字、颜色、字体、对齐、蒙版、timing、motion、keyframes、heals、paint、selection、quad、blend、player |
| removeLayer | id；同时删除该图层的效果；拒绝锁定层 |
| setCanvas | values：width、height、duration、background、transparent |
| addEffect | type、params，可选 target；默认选中图层，无选中项时整幅作品 |
| setObject | config；物件配置经 normalizeObjectConfig 规范化 |

`setLayer` 的字体值为 sans-serif / serif / monospace；所有数值遵守工程校验范围。任意命令失败，整批修改不提交。异步导入期间工程发生变化会拒绝提交，避免覆盖用户编辑。可以读取导出的工程查看图层 id 与完整参数结构。

## 页面接口

```js
const project = window.afterimage.getProject();
await window.afterimage.applyCommands([{op:'setLayer',id:project.layers[0].id,values:{rotation:8}}]);
await window.afterimage.importFile(file); // File / Blob
const png = await window.afterimage.exportPNG(); // Blob
```

同窗口、同源 postMessage 仍可用：请求 type=afterimage:commands，携带 requestId、commands；响应 type=afterimage:result，带 result 或 error。

## HTTP 协议

- `POST /api/jobs`：Bearer 令牌，body 为 `{op:"commands",commands:[...]}`、`{op:"project"}` 或 `{op:"png"}`；返回任务 id。
- `GET /api/jobs/:id`：相同 Bearer 令牌，返回 queued/running/done/failed 与 result/error。PNG result.data 为 Data URL。
- 队列最多100项，任务5分钟过期，单次请求上限80MiB。CLI 等待最多60秒。关闭 API 后停止领新任务，队列中的任务可在重新启用后执行；不想继续执行时重启服务清空队列。
- `/api/session` 仅供同源浏览器连接；外部程序通过本机 session 文件获取令牌。校验 Host / Origin，不开放 CORS。服务器没有任意本机路径读取接口，不执行传入脚本。
- 同一服务请仅打开一个启用 API 的编辑器窗口，避免任务被不同工程消费。

接口用于可信任的本机程序和 AI 工具。音频仍为会话资源，不写入工程或无声视频。本版不提供远程部署的账户/权限服务。


## V13 调整、修复与历史

```js
const before = afterimage.getProject();
await afterimage.applyCommands([
  {op:'addAdjustment',type:'grain',above:before.layers[0].id,params:{amount:18,speed:0}},
  {op:'addAdjustment',type:'curves',params:{mid:145}}
]);
const branches = afterimage.history(); // 返回树副本，节点快照采用素材别名
const tabs = afterimage.projects(); // 返回工程 id / 名称与当前工程
await afterimage.refreshPreview(); // 刷新当前预览，返回预览像素尺寸
```

调整图层作为 `layers` 中的 `type:'adjustment'` 存在，效果链 `target` 指向该图层 id，处理下方已合成画面。透明度控制强度，蒙版可限制区域；正常混合保持原有透明度。普通图片的图层效果仍在图层自身上处理。

图片 `heals` 是最多500个非破坏性修复点的数组。每点包括归一化源图 `x/y`、以源图长边归一化的半径 `r`、0–1 `strength`、`mode:'heal'|'clone'`、`auto:true|false`，手动取样时另带归一化 `sx/sy`。修复发生在调色/滤镜之前，预览、PNG和动态导出共用渲染器。处理长边最高4096；这是邻域补片与颜色融合，不是生成式内容识别消除。

工程JSON现在包含 `history:{tree,pool}`，保存所有保留的分支和命名节点；素材由别名去重复；当前画面已经包含的素材以 `{ref:[...字段路径]}` 复用，历史里独有的素材才在pool存入原始Data URL。它可能包含当前画面里已删除的历史图片。其他工程及“最近关闭”工程只进入本机工作区自动保存，不会被混进当前工程文件。内容编辑进入历史；面板切换、缩放视图等操作不占内容撤销步骤。

多个工程的历史、图像、物件设置与视图独立；打开文件会增加标签，关闭标签会保留到最近关闭。工作区存于同一浏览器来源的IndexedDB，清理浏览器数据会清除它；重要内容应另存工程文件。网页端最多同时打开100个工程，工程导入保持70MB上限，历史很多时文件会增大。

## V14 图层编辑扩展

`setLayer.values.quad` 是按左上/右上/右下/左下排列的4组归一化坐标，例如 `[[0.1,0.05],[0.95,0.1],[1,1],[0,0.9]]`。四边形必须凸且不可交叉，每个坐标范围−0.75至1.75；省略时保持原值。通过界面“复位透视”删除该字段。

`selection` 为 `{type:'rect'|'ellipse',x0,y0,x1,y1,invert:false}`，坐标为原图0至1。`paint` 为笔触数组，每项包含 `tool:'paint'|'erase'|'mosaic'`、`radius`（相对原图长边）、`hardness`、`opacity`、`color`、`block`、`points:[{x,y}]`，可附该笔触自己的selection。最多200笔、4096点/笔。

音乐组件保持image图层类型，增加 `player`，含title/artist/theme(cloud/charcoal/rose)/accent/progress/duration/volume/loop，可含内嵌audio。请读取界面创建的组件获取完整结构；音频最大约15MB，不支持HTTP URL。自动化接口仍需设置中明确启用；新字段沿用整批校验与失败回滚。
