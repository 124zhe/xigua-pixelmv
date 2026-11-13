#!/usr/bin/env python3
"""Verify a local pixel-MV export. Technical checks do not replace visual review."""
import argparse
from array import array
from fractions import Fraction
import json
import math
from pathlib import Path
import shutil
import subprocess
import sys


def correlation(a, b):
    n = min(len(a), len(b))
    if n < 1600:
        raise ValueError('Not enough decoded audio for correlation.')
    ma, mb = math.fsum(a[:n]) / n, math.fsum(b[:n]) / n
    va = math.fsum((x-ma)**2 for x in a[:n])
    vb = math.fsum((x-mb)**2 for x in b[:n])
    if va <= 1e-12 or vb <= 1e-12:
        raise ValueError('Silent or constant audio cannot prove source alignment.')
    cov = math.fsum((x-ma)*(y-mb) for x, y in zip(a[:n], b[:n]))
    return cov / math.sqrt(va*vb)


def pcm(ffmpeg, source, start, duration):
    raw = subprocess.check_output([ffmpeg, '-v', 'error', '-ss', str(start), '-i', str(source),
        '-t', str(duration), '-vn', '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'])
    values = array('f'); values.frombytes(raw)
    if sys.byteorder != 'little':
        values.byteswap()
    return values


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('video', type=Path)
    parser.add_argument('--ffmpeg', default='ffmpeg')
    parser.add_argument('--ffprobe', default='ffprobe')
    parser.add_argument('--duration', type=float, required=True)
    parser.add_argument('--width', type=int, default=1920)
    parser.add_argument('--height', type=int, default=1080)
    parser.add_argument('--fps', type=float, default=24)
    parser.add_argument('--source-audio', type=Path)
    parser.add_argument('--source-start', type=float, default=0)
    parser.add_argument('--min-correlation', type=float, default=.98)
    parser.add_argument('--frames-dir', type=Path)
    parser.add_argument('--times', help='Comma-separated sample seconds; default samples across the clip')
    parser.add_argument('--report', type=Path, required=True)
    args = parser.parse_args()
    if args.duration <= 0 or args.fps <= 0 or args.width <= 0 or args.height <= 0:
        parser.error('Duration, fps and dimensions must be positive.')
    if args.source_start < 0:
        parser.error('Source start must be nonnegative.')
    ffmpeg, ffprobe = shutil.which(args.ffmpeg), shutil.which(args.ffprobe)
    if not ffmpeg or not ffprobe:
        parser.error('Provide local FFmpeg and ffprobe executables.')
    if not args.video.is_file() or (args.source_audio and not args.source_audio.is_file()):
        parser.error('Input video/source audio file does not exist.')
    if args.report.resolve() in {args.video.resolve(), args.source_audio.resolve() if args.source_audio else None}:
        parser.error('Report path must differ from media inputs.')
    report = {'file': args.video.name, 'ok': False, 'checks': {},
              'visual_review': 'required: inspect decoded frames and play the actual MP4'}
    errors = []
    try:
        data = json.loads(subprocess.check_output([ffprobe, '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(args.video)], encoding='utf8'))
        video = next((s for s in data['streams'] if s['codec_type'] == 'video'), None)
        audio = next((s for s in data['streams'] if s['codec_type'] == 'audio'), None)
        if video is None:
            raise ValueError('No video stream.')
        duration = float(data['format']['duration'])
        fps = float(Fraction(video.get('avg_frame_rate', video['r_frame_rate'])))
        report.update(duration=duration, resolution=[video['width'], video['height']], fps=fps, audio_codec=audio.get('codec_name') if audio else None)
        checks = report['checks']
        checks['duration'] = abs(duration-args.duration) <= max(2/args.fps, .05)
        checks['dimensions'] = [video['width'], video['height']] == [args.width, args.height]
        checks['fps'] = abs(fps-args.fps) < .001
        checks['audio_present'] = audio is not None
        subprocess.run([ffmpeg, '-v', 'error', '-xerror', '-i', str(args.video), '-f', 'null', '-'], check=True, capture_output=True)
        checks['full_decode'] = True
        if args.source_audio:
            corr = correlation(pcm(ffmpeg, args.source_audio, args.source_start, args.duration), pcm(ffmpeg, args.video, 0, args.duration))
            report['audio_correlation'] = corr
            checks['original_audio_alignment'] = corr >= args.min_correlation
        else:
            report['original_audio_alignment'] = 'skipped: no source audio supplied'
        if args.frames_dir:
            args.frames_dir.mkdir(parents=True, exist_ok=True)
            times = [float(x) for x in args.times.split(',')] if args.times else [args.duration*f for f in [.02, .18, .4, .52, .8, .9, .97]]
            if any(not 0 <= t < duration for t in times):
                raise ValueError('Sample times must be inside the video duration.')
            report['sample_frames'] = []
            for i, t in enumerate(times):
                dest = args.frames_dir / f'frame-{i:02}-{t:.3f}s.png'
                subprocess.run([ffmpeg, '-v', 'error', '-y', '-ss', str(t), '-i', str(args.video), '-frames:v', '1', str(dest)], check=True, capture_output=True)
                report['sample_frames'].append(str(dest))
        errors.extend(name for name, passed in checks.items() if not passed)
    except (ValueError, KeyError, subprocess.CalledProcessError, OSError) as exc:
        errors.append(str(exc))
    report['errors'] = errors
    report['ok'] = not errors
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf8')
    print(json.dumps(report, ensure_ascii=False))
    return 0 if report['ok'] else 1


if __name__ == '__main__':
    sys.exit(main())
