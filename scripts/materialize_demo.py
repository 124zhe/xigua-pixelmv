#!/usr/bin/env python3
"""Reproduce the accepted 30.6-second demo with explicitly supplied local dependencies."""
import argparse
import hashlib
import html
import json
from pathlib import Path
import shutil
import subprocess
import wave


def local_file(value, label):
    p = Path(value).expanduser().resolve()
    if not p.is_file():
        raise SystemExit(f'{label} is not a file: {p}')
    return p


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--audio', required=True, help='Original full 如果是我 recording; not an arbitrary new song')
    parser.add_argument('--ffmpeg', default='ffmpeg', help='FFmpeg executable, preferably a verified modern version')
    parser.add_argument('--font', required=True, help='Local Chinese font (.ttc/.ttf/.otf/.woff/.woff2)')
    parser.add_argument('--gsap', required=True, help='Local gsap.min.js runtime')
    parser.add_argument('--output', required=True, help='New or empty HyperFrames project directory')
    args = parser.parse_args()
    audio = local_file(args.audio, 'Audio')
    font = local_file(args.font, 'Font')
    gsap = local_file(args.gsap, 'GSAP')
    ffmpeg = shutil.which(args.ffmpeg)
    if not ffmpeg:
        raise SystemExit('FFmpeg was not found; provide --ffmpeg with a local executable.')
    if font.suffix.lower() not in {'.ttc', '.ttf', '.otf', '.woff', '.woff2'}:
        raise SystemExit('Unsupported font extension.')
    output = Path(args.output).expanduser().resolve()
    if output.exists() and (not output.is_dir() or any(output.iterdir())):
        raise SystemExit(f'Refusing to overwrite a non-empty destination: {output}')
    base = Path(__file__).resolve().parents[1] / 'assets' / 'approved-demo'
    manifest = json.loads((base / 'manifest.json').read_text(encoding='utf8'))
    for name in ['engine.js', 'boat-atlas.png', 'people-atlas.png', 'lyrics-motion.js']:
        source = base / name
        expected = manifest['files'][name]['sha256']
        if hashlib.sha256(source.read_bytes()).hexdigest() != expected:
            raise SystemExit(f'Bundled baseline integrity mismatch: {name}')
    assets = output / 'assets'
    assets.mkdir(parents=True, exist_ok=True)
    shutil.copy2(base / 'engine.js', output / 'engine.js')
    for name in ['boat-atlas.png', 'people-atlas.png', 'lyrics-motion.js']:
        shutil.copy2(base / name, assets / name)
    font_name = 'music-cn' + font.suffix.lower()
    shutil.copy2(font, assets / font_name)
    shutil.copy2(gsap, assets / 'gsap.min.js')
    excerpt = assets / 'excerpt.wav'
    subprocess.run([ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-ss', '46.5',
                    '-i', str(audio), '-t', '30.6', '-c:a', 'pcm_s16le', str(excerpt)], check=True)
    with wave.open(str(excerpt), 'rb') as wav:
        actual = wav.getnframes() / wav.getframerate()
    if abs(actual - 30.6) > .02:
        raise SystemExit(f'Incomplete audio excerpt: {actual:.3f}s; expected 30.6s. Check source recording.')
    engine = (base / 'engine.js').read_text(encoding='utf8').replace('</script', '<\\/script')
    page = '''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<style>*{margin:0;box-sizing:border-box}html,body{width:100%;height:100%;overflow:hidden;background:#111529}
@font-face{font-family:MVChinese;src:url('assets/FONT_FILE')}
#night-unsent{position:relative;width:100%;height:100%;overflow:hidden}
canvas{width:100%;height:100%;display:block;image-rendering:pixelated}</style>
<script src="assets/gsap.min.js"></script><script src="assets/lyrics-motion.js"></script></head>
<body><div id="night-unsent" data-composition-id="night-unsent" data-width="1920" data-height="1080" data-duration="30.6" data-fps="24">
<canvas id="picture" width="1920" height="1080" data-layout-allow-overflow aria-label="如果是我：纸船、影子和抓取机"></canvas>
<audio id="original-song-excerpt" class="clip" src="assets/excerpt.wav" data-start="0" data-duration="30.6" data-track-index="10" data-volume="1"></audio>
</div><script>ENGINE_SOURCE</script></body></html>'''
    page = page.replace('FONT_FILE', html.escape(font_name, quote=True)).replace('ENGINE_SOURCE', engine)
    (output / 'index.html').write_text(page, encoding='utf8')
    (output / 'hyperframes.json').write_text(json.dumps({'authoringSkill': 'general-video', 'paths': {'assets': 'assets'}}, indent=2), encoding='utf8')
    (output / 'BRIEF.md').write_text('---\nworkflow: general-video\nflow: automation\nstoryboard: yes\n---\n'
        '# 已认可像素动画基准复现\n《如果是我》原曲 46.50–77.10；30.6 秒、1080p、24fps。'
        '沿用 xigua-pixelmv 保存的两幕、20 个整姿动作和 8 句字级时间轴。'
        '本工程是复现基准，不代表为新歌完成了新的创意。\n', encoding='utf8')
    (output / 'STORYBOARD.md').write_text((base.parents[1] / 'references' / 'approved-demo.md').read_text(encoding='utf8'), encoding='utf8')
    print(json.dumps({'ok': True, 'project': str(output), 'duration': actual,
                      'next': 'Run HyperFrames check, inspect snapshots, then render within the user-authorized scope.'}, ensure_ascii=False))


if __name__ == '__main__':
    main()
