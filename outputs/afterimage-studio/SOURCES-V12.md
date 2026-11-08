# V12 资源与实现来源 / 2026-11-08

## 实际随产品分发

- **BoomBox**：Microsoft，CC0，Khronos glTF Sample Assets。原文件 https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/BoomBox/glTF-Binary/BoomBox.glb ，许可说明 https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/BoomBox 。保留原有几何体及 PBR 基色、法线、金属粗糙度、自发光贴图；应用在运行时仅替换显示屏区域的自发光内容为用户封面，并增加扫描线。模型不是 AFTERIMAGE 原创。
- **PageFlip 2.0.7**：MIT，Nodlik，https://github.com/Nodlik/StPageFlip ，发布包 https://www.npmjs.com/package/page-flip 。浏览器发行文件来自 https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.js ，许可证原文在 vendor/PAGE-FLIP-LICENSE。用于独立的多页阅读与编辑视图，页弯曲由该库渲染，并非 Three.js 网格柔体模拟。
- **Three.js 0.180.0**：MIT，https://github.com/mrdoob/three.js/tree/r180 。新增 GLTFLoader、BufferGeometryUtils、RoomEnvironment，仅把模块导入改为本地相对路径；许可证在 vendor/LICENSE。

## 已研究但未引入

- https://polyhaven.com/a/Television_01 ：Gabriel Radić 的 CC0 木壳 CRT，下载镜像 https://threed.site/gallery/vintage-crt-television 和 https://www.innerscene.com/tools/library/3d-parts/vintage-crt-television-3e630b92 。文件请求返回 HTTP 403，本版未下载、未采用，现有 CRT 仍为程序结构。
- https://aizity.com/assets/free-3d-model-download/monitor-ii-3d-model ：署名许可的候选 CRT。连接失败，未分发。
- https://objectifthunes.github.io/three-book-demo/ ：交互结构参考；npm 包标记 UNLICENSED，未复制其源码。

## 新效果与界面

工作台布局、四类循环动态效果、分割时的源时间保留、本机命令队列与 CLI 为本项目实现。没有复制第三方游戏的贴图、Logo 或角色。原有参考图片未改动，也未加入产品包。

## 文件校验

- `assets/boombox.glb` · 10,614,184 bytes · SHA256 `f8b918445ebdd006768232205a62f5182d2208ca57f84c6ccc084943c0bc8f15`
- `vendor/page-flip.js` · 44,058 bytes · SHA256 `bbaca0bbef57a22bb66a3fc69d67baf9a17fb9a9c89ec9ed35e2b91abe4bd1e7`
- `vendor/PAGE-FLIP-LICENSE` · 1,063 bytes · SHA256 `88d7b609a3be5efa2abe8648ddc35d5489579db5e06299545760df45c2c32d66`
- `vendor/GLTFLoader.js` · 119,634 bytes · SHA256 `515e48b60852e33284cae6d0560fda59ad7e1d16956c88f207da5f83470b2bec`
- `vendor/BufferGeometryUtils.js` · 36,986 bytes · SHA256 `f07a335d7603eb09a46536fd8492bcb7ae8ef9c99b9c06e9910b2958f0b87310`
- `vendor/RoomEnvironment.js` · 5,093 bytes · SHA256 `d1883079b621491972d304d0b0737cd7e1ce0947ebf0233f46d900b3af61e4d4`
