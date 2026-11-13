# 制作与检查

## 已验证的素材生成方式

使用内置图像生成工具生成透明动作图集，后续由本地时间轴合成。图集是动画素材，不是完成的动画。若只完成图片，应准确说明状态并继续制作已授权的视频。

先生成同一角色的主动作组，检查后将其作为第二张图集的身份和画风参考。每张图要求：明确行列、宽裕边距、完整头手脚、同一尺寸与朝向、脚底/船底一致；不要让模型直接给整屏小尺寸全景帧。

### 主动作图集提示模板

> Create a transparent production sprite atlas for an ORIGINAL 16-bit pixel animation MV. Exactly [count] whole-character sprites in [columns] columns × [rows] rows, equal cells and generous margins, no labels. Same character identity and costume in every cell: [identity]. Cute large head, short body and limbs, small simple eyes, deliberate chunky square pixel clusters, limited flat colors, hard readable edges, no painterly gradients or realistic strands. Lock the [feet / boat keel / seat] baseline and camera. Depict these complete connected poses: [ordered actions including anticipation, contact, exertion, release]. Hands must grip the same prop. No clipping, duplicated props or environmental background. Preserve true transparency.

### 配套姿态提示模板

> Match the reference character's identity, proportions, palette and pixel density. Treat the supplied image as a style/identity reference. Create [layout] complete transparent sprites: [poses and full-body directions]. Keep feet and hands within cells, maintain consistent scale and clear contact gestures. Include [support characters / prop states] only where required by the storyboard.

生成结果不一定严格落在理想网格上。先查看原图和各动作，再取透明主体包围盒，给每帧单独的锚点。不要直接对所有 atlas 均分：本例第一张的桨尖越过四等分边界，第二张的影子足底跨过三等分边界，自动切格会截断或串进隔壁人物。

## 图集使用与时间轴

基准 `engine.js` 中 `boats` / `people` 每项采用 `[sx, sy, sw, sh, anchorX, anchorY]`。裁切用于正确提取素材，不重新画或变形人物。利用完整姿态切换保留手脚结构，再让道具、位置、镜头连续变化。

场景逻辑位置按 960×540，输出 1920×1080。所有采样都由传入时间计算；随机装饰使用固定种子函数，不依赖真实时钟或输入状态。GSAP 注册键与根 `data-composition-id` 相同。

### 首帧与异步资源的坑

这次实际排除了“第一个检查帧仍停在 t=0，漏显示首句字幕”的问题。可靠方式：

1. 同步构建并注册**完整但暂停**的时间轴，时钟状态可以先接收 seek。
2. 图片/字体未就绪时，绘图函数先返回。
3. 显式加载要用的中文字体和图片；完成后按**当前 `renderClock.t`** 绘图，不重置成 0。
4. 使用 `lazy:false`，再检查首个带人声的实际导出帧。

`document.fonts.ready` 本身不一定已经请求尚未使用的字体；基准使用 `document.fonts.load('900 32px MVChinese')`。注册在图片加载之后会错过早期 seek 的环境，应特别检查，不能仅因后面的截图正常就通过。

中文画布字体使用随工程可用的本地字体；不要只写系统字体名然后假定渲染机都有。人物素材、字体和 GSAP 必须进入项目，不能仅依赖生成缓存目录。

## 镜头与设备状态

船底、脚底、绳端和抓爪在相同世界坐标中计算；相机变换应用于同一场景，字幕独立保持阅读位置。相机变焦时出现细线，检查相邻像素填充在非整数缩放下是否出现缝隙；不要模糊整幅画面来掩盖。

本例金币堆在抓取动作开始时散到脚边，操纵杆回到可触及位置，避免挡住后续手部表演。这是“次动作给主动作让位”的实际修正。

### 冲击力试放与复核

从分镜计划的高潮或情绪转折检查效果，并带上前后镜头，不能只截最热闹的一帧：

- 正常速度看主动作是否醒目、力量来源与结果是否清楚；准备、爆发与停顿是否有区别；同一镜头的多层反馈是否围绕一个事件。
- 暂停关键姿态看剪影、尺度与视觉重心；以最终播放尺寸确认道具结构、手部接触和歌词仍可辨认。需要近景却素材不足时补生成，不能靠放大模糊块补力度。
- 合音乐检查落点与演唱、段落变化的关系，再看高潮前后是否有强弱对比；连锁动作与余势用连续帧检查。少量强镜头不能替代已有的全片审查，冲击之后的杂线、遮挡和物体去向仍要在编码成片中核对。

分别记录已检查的片段和观察结论。技术通过不能自动判定视觉有冲击力，艺术接受仍以实际观看反馈为准。

### 杂线定位与修复复核

杂线检查单独于主体动作检查进行。按镜头扫查整个画面，记录异常的时码、位置和截图；重点看镜头开头／结尾、换姿、物体移开后、相机移动和转场结束时。

先区分素材残边与绘制残留：前者检查透明边界、裁切框和邻格内容；后者检查路径是否正确开始／闭合、裁切与变换是否恢复、旧元素是否按时退出，以及缩放接缝。不能未查来源就把线条当成“设计”。

修复后检查该线出现前、出现中、消失后的连续帧，并正常速度播放对应片段；对相同绘制函数或素材在其他镜头的复用位置一并检查。最后从重新导出的 MP4 确认杂线已消失、原本有用的结构仍在，不能只查看修改后的代码或单张缩略总览。逐段记录覆盖范围，不把大量离散抽帧等同于完整连续观看。

## HyperFrames 与 Remotion 联合精修

针对本类 MV 的精修，让两个框架承担实际工作。可沿用确定性场景函数，以原曲绝对时间作为共同输入：HyperFrames 运行整片合成，Remotion 用当前帧／fps 驱动画面、提供运动曲线和接触片段预览；也可按已有项目结构安排等效分工，不必重写全部已认可场景。

- 共用素材、裁切元数据、接触锚点和歌词时间，避免两份工程越改越不一致。先确定准备、触物、承重、释放、落定和结果停留的时刻，再调缓动与弹性；把连锁起动与支持层的延迟写进共同时间轴，保持换姿、道具、镜头和文字的主次。平滑不等于接触正确。
- 从本轮最容易出错的接物、递物、折纸或搬运中选重点片段实际渲染并播放复核；单独打开 Studio 或写一个未使用的组件不算完成优化。
- 在记录中写清哪个框架负责运动、预览和最终导出，以及实际完成哪些渲染。只用 Remotion 渲染过重点片段时，不声称另行导出了 Remotion 全片。
- 工程交付时保留实际使用的代码、素材与依赖版本。若当前环境无法使用其中一个框架，明确记录缺项与替代结果，不伪装成双框架完成。

## 音频与渲染

原曲剪辑对齐句尾和音乐停顿，不改词、不换唱法。纯画面 demo 默认保持原音；如增加 SFX 或混音，应单独说明，不再用“完全相同波形”作为验收目标。

使用目标环境当前的 HyperFrames 流程。示例命令（先解析本地可用的 CLI 和 FFmpeg，不照抄旧机器缓存路径）：

```text
hyperframes check PROJECT --at 0.6,5.5,12.8,15.6,24.8,29.8 --snapshots --json
hyperframes preview PROJECT --background --no-open
hyperframes render PROJECT --fps 24 --quality delivery --workers 2 --gpu --browser-gpu --strict --no-best-effort --output OUTPUT.mp4
```

本次 Windows 使用 FFmpeg 7.1；旧 4.3.1 曾不能处理渲染音频使用的 `setts` 路径。优先用已验证的新版本，并把 `HYPERFRAMES_FFMPEG_PATH` 指向它。显卡选项仅在设备支持时使用。最终记录真实 capture 路径与 GPU 状态，不能凭选项推断硬件已使用。

用量查询若返回未知就记录未知，不虚构额度。下载注册组件失败不能记成已安装；先确认现有功能，必要时本地实现。本例硬币遮幅转场为本地实现。

## 辅助脚本

### 复现基准

```text
python materialize_demo.py --audio ORIGINAL.mp3 --ffmpeg FFMPEG --font CHINESE_FONT.ttc --gsap gsap.min.js --output NEW_PROJECT
```

只复现已认可的《如果是我》段落。目录必须新建或为空，不覆盖现有工程。音频、GSAP、字体由调用方提供。路径以结构化参数传递，无 shell 拼接。

### 验证成片

```text
python verify_video.py VIDEO.mp4 --ffmpeg FFMPEG --ffprobe FFPROBE --duration 30.6 --width 1920 --height 1080 --fps 24 --source-audio ORIGINAL.mp3 --source-start 46.5 --frames-dir QA_DIRECTORY --report REPORT.json
```

仅使用 Python 标准库、FFmpeg/ffprobe。检查流与完整解码，抽取关键帧；提供原音时验证相同截取的相关性。`--min-correlation` 默认 0.98，仅适用于原音不变、无额外混音。没有提供原音时明确跳过该项，不能标成已通过。

## 视觉与播放验收

1. 按整片时间轴逐段审查。用户指出的几处是线索，不是缺陷清单；每段检查道具能否辨认、动作前因后果、手脚接触、物体去向、遮挡、字幕与转场，并另做全画面杂线与残留检查。已清楚且认可的段落可以保留，不为凑修改量重做。
2. 在最终播放尺寸看全景，再以原尺寸看关键操作帧。图集不清楚就重生成，裁切／比例不对就修素材映射，时序／接触有问题就修动画；不要把所有问题都归为缓动不够顺。
3. 对接物、传递、折叠、剪切、搬运及转场边界看短间隔连续帧，覆盖动作前、触物、承重、松手、动作后。必要时先静音检查因果，再带原音看节奏。
4. 检查**最终编码 MP4**，不是只看网页 Canvas。完整解码，验证尺寸／时长／fps、音轨和原曲对齐；从成片跨全曲抽帧，关键动作加密。抽帧数量由时长和风险决定，不机械复用上一项目的数量。
5. 用真实播放器检查播放、暂停、seek 和首尾。交付后保留新版本预览；确认它确实加载了本轮 MP4。
6. 保存逐段问题与修正记录，必要时提供同一时码的修改前后对照；写清抽帧、播放复核与未检查的范围。抽样通过不等于逐帧看完，Canvas 内的道具辨识、穿模与接触也不由 DOM 布局检查保证。

授权的成片已完成后再报告；不要拿关键帧、动作图集、技术 QA 或“已开始生成”冒充已完成的视频。用户的创意接受与技术验证分别留证据。
