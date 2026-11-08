# 物件工坊来源与结构

2026-11-07，V10.17。

- Three.js 固定版本 0.180.0：从 https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js 与 three.core.js 获取，保留 vendor/LICENSE（MIT）。离线本地加载，不依赖 CDN。
- 材质行为参考 https://threejs.org/docs/pages/MeshPhysicalMaterial.html 。采用环境反射、清漆层、透射、虹彩与粗糙度。
- 样机结构参考 https://designsyndrome.com/products/vintage-cd-case-mockup 和 https://designsyndrome.com/products/distressed-cd-case-mockup 。仅研究物件部件与材质层次，未下载商品 PSD 或贴图。
- 卡片、CD 盒及光盘、相框、CRT 的几何结构为本项目程序建模；微划痕、软阴影、柔光箱反射环境由程序生成。无外部模型、HDRI 或未经许可商业素材。
- 封面示例沿用已有 Unsplash demo-photo.jpg，来源与许可见既有来源记录。原始参考照片未修改。

当前使用一个工程级 objectStudio 设置保存正背面图片和参数；二维图层里放入的是静态渲染图片。没有多物件实时场景、独立 HTML 输出、物件视频导出或动态屏幕更新。CRT 按钮目前为造型部件。透明材料为实时光栅近似，不是光线追踪。

## V10.18 / 2026-11-08

新增 object-looks.js 的 12 套原创介质预设，包括 Canvas 印刷版式、有限色调与 CRT 信号模拟。复用原始内容图，不引入新外部贴图、模型或商品资产。UI 与直接操作为本项目编写；角度惯性为数值阻尼，阴影为程序渐变贴图，并非真实物理模拟。
