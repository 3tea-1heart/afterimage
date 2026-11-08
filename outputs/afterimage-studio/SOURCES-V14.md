# V14 研究与实现来源 · 2026-11-09

本轮通过 Exa 定向检索作者文章、GitHub 与 Awwwards。下面记录实际采用的设计原则；新代码为本项目独立实现，未打包这些网站的商业贴图、演示源码或第三方预设。

| 来源 | 采用的原则与实现边界 |
| --- | --- |
| [Codrops / WebGL Distortion Hover Effects](https://tympanus.net/codrops/2018/04/10/webgl-distortion-hover-effects/) | 位移应改变图像内容。游动折射镜使用局部逆向采样和柔边色散；本项目实现为 Canvas，不冒称 WebGL。 |
| [Codrops / Liquid Distortion Effects](https://tympanus.net/codrops/2017/10/10/liquid-distortion-effects/) | 连贯的运动场与克制的图像变形；光帘和镜片保持原图结构。没有复制示例代码。 |
| [Codrops / Progressively Enhanced WebGL Lens Refraction](https://tympanus.net/codrops/2023/10/10/progressively-enhanced-webgl-lens-refraction/) | 镜片与底图建立关系，而不是漂浮装饰；实现局部折射和可定位中心。没有实现真实光线追踪。 |
| [Codrops / Fake 3D Image Effect](https://tympanus.net/codrops/2019/02/20/how-to-create-a-fake-3d-image-effect-with-webgl/) | 真实深度视差需要深度图。当前没有将亮度假装为场景深度；深度图视差保留待办。 |
| [Nico Martin / Neumorphism Audio Player](https://dev.to/nicomartin/neumorphism-audio-player-4coa) | 中间明度底色、成对明暗阴影、凹入进度槽。采用原创 Canvas 音乐播放卡与实际 HTMLAudio 控制；音频只保存在本机工程中。 |
| [Awwwards / Polaroid I-2 Camera Setting Explore Tool](https://www.awwwards.com/inspiration/camera-setting-explore-tool-polaroid-i-2) | 控制有明确位置、状态和反馈；四角直接拖动、工具选择与快捷键。 |
| [Awwwards / Photoscoper](https://www.awwwards.com/sites/photoscoper) | 用中性色层次和图像主导的舞台组织工具，而非大面积装饰；本项目新增5套配色、可选布局与密度。 |
| [Awwwards / Minimal websites](https://www.awwwards.com/websites/minimal/) | 对齐、留白和清晰层级。参考原则，不复制具体站点页面。 |

新增四种摄影动态：游动折射镜、窗光流帘、高光呼吸光轨、放映机微动。高光光轨来自输入照片的亮度提取；四者均支持整数圈数循环、选中图层作用域和统一渲染导出。没有新增随机粒子来冒充摄影增强。
