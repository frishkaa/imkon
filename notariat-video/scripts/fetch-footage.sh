#!/usr/bin/env bash
# Скачивает стоковые клипы Mixkit (бесплатная лицензия Mixkit Stock Video Free License)
# и нарезает их в public/footage/*.mp4 (1920×1080, 30 fps) по списку scripts/shots.txt.
set -euo pipefail
cd "$(dirname "$0")/.."
CACHE=.cache/mixkit
mkdir -p "$CACHE" public/footage

grep -v '^#' scripts/shots.txt | while read -r name id ss dur spd; do
  [ -z "${name:-}" ] && continue
  src="$CACHE/$id.mp4"
  if ! ffprobe -v error "$src" >/dev/null 2>&1; then
    for q in 1080 720; do
      curl -sfL -m 300 -o "$src" "https://assets.mixkit.co/videos/$id/$id-$q.mp4" && ffprobe -v error "$src" >/dev/null 2>&1 && break
    done
  fi
  ffmpeg -nostdin -loglevel error -y -ss "$ss" -t "$dur" -i "$src" -an \
    -vf "setpts=PTS/$spd,scale=1920:1080:flags=lanczos,fps=30,format=yuv420p" \
    -c:v libx264 -preset veryfast -crf 20 -g 15 "public/footage/$name.mp4"
  echo "ok $name"
done
