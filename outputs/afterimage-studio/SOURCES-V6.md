# V6 研究与实现记录 · 2026-10-28

## 已实现

当前 50 种参数化效果、60 种配方。本轮保留工作目录已有的 V5 扩展（44 效果、44 配方），新增 6 种效果和 16 种配方。不是下载商用预设：新增算法为独立 Canvas 实现，没有复制以下库的源码或艺术素材。

新增效果：留银冲洗、三色渐变映射、等高线印相、彩窗拼块、织物印花、循环干涉色膜。留银与色膜属于风格模拟，非物理精确模拟。

展厅增加大图试映、原图切换、前后款切换、持久收藏与收藏筛选。使用不同宽度和留白的图像编排、橙色衬线标题、深色试映空间；保留海报/索引视图、明暗切换与联系表导出。

## 本轮成功读取的资料

| 来源 | 研究用途 | 本轮采用情况 |
|---|---|---|
| [Active Theory / Awwwards](https://www.awwwards.com/sites/active-theory) | 黑白基底、非常规导航的历史案例；该页为 2013 年荣誉提名 | 作为展示层与操作层分工的参考；未声称复刻其交互 |
| [PixiJS Filters](https://github.com/pixijs/filters) | 社区滤镜集合，MIT | 滤镜组织和参数设计参考，未作为依赖 |
| [PixiJS 官方效果目录](https://pixijs.io/filters/docs/) | 渐变映射、排线、CRT、光晕、浮雕、拖影、反射等参数 | 建立下方候选库；现有相似效果独立实现 |
| [postprocessing](https://github.com/pmndrs/postprocessing) | Three.js 后处理组合，Zlib | 后续 GPU 架构候选，当前仍为 Canvas |
| [LYGIA](https://github.com/patriciogonzalezvivo/lygia) | 多着色语言的模块化图形库 | 后续图形模块研究候选；未引入，采用代码前需逐文件检查授权 |
| [GLSL Color Spaces](https://github.com/tobspr/GLSL-Color-Spaces) | 颜色空间转换 | 后续颜色计算研究候选，未引入 |
| [Color Names](https://github.com/meodai/color-names) | 人工整理颜色名称 | 调色板命名候选，未引入数据 |

## 收集到的下一批效果方向（尚未实现）

以下是从 PixiJS 官方效果目录整理的候选，不计入当前 50 种效果：

| 效果方向 | 可封装的成品 | 关键参数 |
|---|---|---|
| TiltShift | 微缩城市 / 桌面模型 | 清晰带位置、宽度、模糊 |
| Reflection | 水面倒影 / 镜湖封面 | 水位、波幅、波长、时间 |
| Godray | 林间光束 / 舞台烟光 | 方向、中心、强度、时间 |
| Bevel | 压边字 / 塑料贴纸 | 厚度、光向、阴影 |
| Outline | 描边剪贴 / 表情包贴纸 | 厚度、颜色、透明度 |
| BulgePinch | 泡泡透镜 / 凹面海报 | 中心、半径、强度 |
| Shockwave | 冲击波 / 水滴传播 | 中心、半径、速度、亮度 |
| MultiColorReplace | 局部换色 / 限定色刊物 | 原色、目标色、容差 |
| ColorMap | LUT 影调包 | 查找表、混合、采样方式 |
| SimplexNoise | 云雾遮罩 / 有机溶解 | 尺度、偏移、阈值 |
| OldFilm scratch | 划痕电影 / 老投影 | 划痕密度、宽度、运动 |
| RadialBlur | 旋转拖影 / 眩晕封面 | 中心、旋转角、半径 |

## 研究与交付边界

Exa 的两次搜索及 GitHub 插件搜索均返回工具不可用，没有得到搜索结果，不能称为完成 Exa 深度调研。直接读取 GitHub 与官方文档取得了上述资料。Awwwards 多数项目页及分类页超时；Lusion、Unseen 等仅沿用此前参考，不冒充本轮已重新审阅。Sites 插件同样返回工具不可用，因此本轮未更新线上版。

效果检查 81/81、隔离界面逻辑检查 20/20 通过。效果联系表由真实处理管线生成并检查；当前没有可用浏览器控制工具，未完成最终浏览器视觉和触摸验收。
