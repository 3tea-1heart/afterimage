# 余像 AFTERIMAGE — UI 重构记录

2026-10-26。当前实现：暗房工作台。

## 参考与转化
- [Cosmos / Awwwards](https://www.awwwards.com/sites/cosmos)：暗色背景、图像主导、低干扰导航。转化为中央画布与独立专注模式。
- [Readymag Design Workout / Awwwards](https://www.awwwards.com/sites/readymag-design-workout)：创作工具的直接操作与实验感。转化为可即时套用的底片带、效果组合和元素库。
- [Playtype / Awwwards](https://www.awwwards.com/sites/playtype)：鲜明字体尺度。转化为紧凑的大字标、大小文字对比和编号式元信息。

参考用于版式与交互判断；未复制其源代码、品牌或商业素材。Cosmos 的获奖页与展示截图已查看；其余参考来自检索页面描述。

## 已实现
米白品牌页眉、炭黑画布、朱红强调色；左工具轨；底部横向风格档案；可展开网格；右侧效果/图层/画幅分区；专注模式；操作后自动切换对应参数面板；手机单列布局；减少动态效果的系统偏好支持。

保留 24 个处理效果、12 套风格配方、图层、文字与贴片、参数调节、原图对比、撤销/重做、工程保存和图片/WebM 导出。

示例照片：[Unsplash 源图](https://images.unsplash.com/photo-1500530855697-b586d89ba3ee)，[使用许可](https://unsplash.com/license)。示例以图层位置构图，原始像素仍保存在图层源中。

## 验证
浏览器实际操作检查：风格套用、参数展开、专注进出、档案展开/收起、文字添加与即时输入、图层面板联动、原图对比分割线。390px 视口没有页面横向溢出。引擎测试与工程校验沿用前轮验证记录，本轮没有修改滤镜算法。
