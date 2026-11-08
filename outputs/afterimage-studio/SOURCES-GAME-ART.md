# V10.16 游戏美术方向与实现记录

2026-11-07。使用 Exa 与 GitHub 搜索。所有新增算法和贴纸为独立 Canvas / 图层实现，未下载或打包游戏贴图、角色、原版着色器或第三方仓库代码。

- Balatro 卡牌材质： https://balatrowiki.org/w/Jokers （社区资料，版本命名参考）。银箔 / 虹彩 / 多彩分别实现镜面光带、衍射色带、色谱混合。哑光为自定义补充，并非声称游戏存在此版本。排除逆向游戏源码作为实现来源。
- Disco Elysium 美术访谈： https://www.youtube.com/watch?v=-eUtrUW2QVU 。从艺术家讨论的边缘层次、色彩和肖像表现提炼方向性断色，算法不能复现人物心理或绘画构图；命名为“张力肖像”而非原画复刻。
- Stuffo 开发者： https://www.hapatus.com/ 。提取像素块、有限色板、阶梯动画方向；没有使用游戏角色。
- Bonfire Peaks 官方： https://www.bonfirepeaks.com/ 与 https://draknek.itch.io/bonfire-peaks 。参考体素块面、暮色与篝火意象。当前是二维照片伪体素浮雕，不包含深度估计或真实 3D。
- 更多卡面交互研究： https://github.com/simeydotme/pokemon-cards-css 。仅参考材质分层思路，未复用代码、商标、卡图或贴图。

新增 8 效果、14 配方、6 类组合贴纸。动态参数表示每个工程周期内的整数圈数，0 为冻结；效果时间采用现有片段局部时间机制。贴纸通过图层 motion / animate 接入时间轴，机器人是静态可拆分像素图层。

验证：22 组效果 / 配方检查，含动态前后差异、周期首尾一致、透明背景保持；生成并人工查看效果联系表。未完成真实人像效果评审、浏览器全流程、EXE / APK 重新打包或公开发布。
