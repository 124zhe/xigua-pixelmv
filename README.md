# Xigua PixelMV

把歌曲制作成有故事、有动作、有逐字歌词的像素音乐 MV。

这是一个面向 Codex 等支持 `SKILL.md` 的 AI 编程助手的技能包，包含分镜方法、视觉与动作规范、可编辑示例引擎、透明动作图集，以及工程生成和视频检查脚本。

![像素 MV 示例画面](assets/approved-demo/poster.png)

## 能做什么

- 根据歌词设计有隐喻、有因果的连续事件，让重复副歌产生新的变化。
- 制作大头短身的像素动漫人物，用完整姿态、道具状态和接触锚点组织动作。
- 编排运镜、场景转场、音乐落点和逐字跳动歌词。
- 使用 HyperFrames 与 Remotion 完成动画精修、预览和导出。
- 检查最终 MP4 的时长、尺寸、帧率、音轨、完整解码，以及原曲对齐情况。

## 安装到 Codex

在 PowerShell 中执行以下命令，将技能安装到用户技能目录。

```powershell
git clone https://github.com/124zhe/xigua-pixelmv.git "$env:USERPROFILE\.codex\skills\xigua-pixelmv"
```

macOS / Linux 可使用以下命令。

```bash
git clone https://github.com/124zhe/xigua-pixelmv.git "${CODEX_HOME:-$HOME/.codex}/skills/xigua-pixelmv"
```

已存在同名目录时，先备份自己的改动，再选择更新或安装位置。安装后在新会话中调用 `$xigua-pixelmv`。

其他支持技能文件的助手，可将整个仓库目录放入其技能目录。

## 使用示例

把音频和歌词文件交给助手，并按需求调用。

```text
使用 $xigua-pixelmv，根据这首歌制作 30 秒像素音乐 MV demo。
先设计两到三个有因果联系的场景，保留原词和原唱时间，
沿用示例的大头短身像素小人风格，交付带原曲的可播放 MP4。
```

```text
使用 $xigua-pixelmv，继续现有 MV 工程。
沿用已经确认的人物、歌词时间轴和画幅，检查全片道具辨识、
手脚接触、物体去向与转场，修正后导出新版本。
```

入口文件是 [SKILL.md](SKILL.md)。助手会按当前任务读取分镜、视觉、制作和检查参考。

## 本地依赖

| 用途 | 依赖 |
| --- | --- |
| 读取技能与设计分镜 | 支持技能文件的 AI 助手 |
| 生成新人物和动作图集 | 可用的图像生成工具 |
| 运行辅助脚本 | Python 3，使用标准库 |
| 提取音频与检查成片 | FFmpeg 和 ffprobe |
| 复现随附样片工程 | 本地 GSAP 运行库、中文字体、对应版本的原曲文件 |
| 预览与渲染随附样片 | HyperFrames |
| 新 MV 动画精修 | HyperFrames、Remotion，按技能中的分工使用 |

通过各工具的官方渠道安装依赖，并在助手环境中提供相应工具或技能。历史样片的版本信息见 [实例记录](references/approved-demo.md)，新项目使用自己的实际环境和依赖版本。

## 复现 30.6 秒样片

随附示例使用《如果是我》原录音的 **46.50–77.10 秒**，包括纸船、影子和抓取机两个相连场景，输出规格为 1920×1080、24 fps。使用相同录音版本可保持现有歌词与动作时间一致。

从仓库根目录运行，传入本地文件和一个新建或为空的输出目录。

```powershell
python scripts/materialize_demo.py --audio "ORIGINAL.mp3" --font "CHINESE_FONT.ttf" --gsap "gsap.min.js" --output "demo-project"
```

脚本会校验基准素材哈希，提取原曲选段，并生成 HyperFrames 工程。需要指定 FFmpeg 路径时，添加 `--ffmpeg "PATH_TO_FFMPEG"`。

按照目标环境的 HyperFrames 工作流预览和渲染生成的工程。命令参考与检查方法见 [制作与检查](references/production.md)。制作新歌时，为新录音建立歌词时间轴、分镜和动作编排。

![样片分镜总览](assets/approved-demo/contact-sheet.jpg)

## 检查导出视频

```powershell
python scripts/verify_video.py "OUTPUT.mp4" --duration 30.6 --width 1920 --height 1080 --fps 24 --source-audio "ORIGINAL.mp3" --source-start 46.5 --frames-dir "qa/frames" --report "qa/report.json"
```

两个脚本均支持 `--help`。音频相关性检查适用于保留原音的导出，混音项目应按自己的音频目标验收。技术检查后，仍需正常速度观看实际 MP4，核对动作、歌词、转场和听感。

## 文件结构

```text
SKILL.md                       技能入口
agents/openai.yaml             技能显示信息
references/                    分镜、视觉、制作和实例参考
assets/approved-demo/          动作图集、示例引擎、预览图和历史检查记录
scripts/materialize_demo.py    根据本地依赖生成样片工程
scripts/verify_video.py        检查实际导出的 MP4
```

## 许可证与素材

本项目的代码、文档及原创像素素材采用 [MIT License](LICENSE)。示例涉及的歌曲、歌词，以及使用者提供的字体和第三方运行库，适用各自权利人与项目的许可。具体范围见 [第三方内容说明](THIRD_PARTY_NOTICES.md)。
