#!/usr/bin/env bash
# Concatena os vídeos da obra em um timelapse de ~60s.
# Requer: ffmpeg no PATH.
# Uso: bash tools/timelapse.sh
set -euo pipefail

cd "$(dirname "$0")/.."

OUT="assets/video/obra-timelapse.mp4"
LIST="$(mktemp)"
trap 'rm -f "$LIST"' EXIT

# Lista os vídeos da obra na ordem numérica
for f in assets/video/obra-video-*.mp4; do
  printf "file '%s'\n" "$(realpath "$f")" >> "$LIST"
done

# 1. Concatena preservando qualidade
CONCAT="$(mktemp).mp4"
ffmpeg -y -f concat -safe 0 -i "$LIST" -c copy "$CONCAT" 2>/dev/null

# 2. Acelera 8x + reduz áudio (silencia)
ffmpeg -y -i "$CONCAT" -filter:v "setpts=PTS/8" -an -movflags +faststart -crf 24 "$OUT" 2>&1 | tail -5

DURATION=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$OUT" 2>/dev/null | cut -d. -f1)
echo ""
echo "gerado $OUT · ${DURATION}s"
rm -f "$CONCAT"
