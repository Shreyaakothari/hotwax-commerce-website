#!/bin/bash
# Upload theme files to HubSpot (the live site) with safety checks.
#
#   scripts/hs-deploy.sh <file> [<file> ...]
#
# Paths are relative to the repo root and must sit inside hotwax-theme/ or
# HotWax_2021/. For each file:
#   1. The live copy is fetched from HubSpot. If it differs from the version
#      this branch started from (the file at the merge-base with main, or the
#      branch's first commit that touched it), someone changed it in HubSpot
#      since: the upload stops, so their edit is not overwritten.
#      Pass --new for a file that does not exist on HubSpot yet.
#   2. The file is uploaded.
#   3. The live copy is fetched again and must match the local file exactly.
# Every upload is logged to scripts/hs-deploy.log.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG="$ROOT/scripts/hs-deploy.log"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

NEW=0
FILES=()
for a in "$@"; do
  case "$a" in
    --new) NEW=1 ;;
    *) FILES+=("$a") ;;
  esac
done
[ ${#FILES[@]} -gt 0 ] || { echo "usage: scripts/hs-deploy.sh [--new] <file> [<file> ...]"; exit 2; }

cd "$ROOT"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
[ -z "$(git status --porcelain -- "${FILES[@]}")" ] || { echo "STOP: commit these files first:"; git status --short -- "${FILES[@]}"; exit 1; }

# The version of a file this branch started from
base_version() {
  local f="$1" base
  base="$(git merge-base HEAD origin/main 2>/dev/null || true)"
  if [ -n "$base" ] && git cat-file -e "$base:$f" 2>/dev/null; then
    git show "$base:$f"; return
  fi
  local first
  first="$(git log --reverse --format=%H -- "$f" | head -1)"
  if [ -n "$first" ] && git cat-file -e "$first~1:$f" 2>/dev/null; then git show "$first~1:$f"; else git show "$first:$f"; fi
}

for f in "${FILES[@]}"; do
  case "$f" in
    hotwax-theme/*|HotWax_2021/*) ;;
    *) echo "STOP: $f is outside hotwax-theme/ and HotWax_2021/"; exit 1 ;;
  esac
  [ -f "$f" ] || { echo "STOP: $f not found"; exit 1; }

  live="$TMP/live.$$"
  rm -f "$live"
  if hs cms fetch "$f" "$live" >/dev/null 2>&1 && [ -f "$live" ]; then
    if ! cmp -s "$live" "$f"; then
      if [ "$NEW" = 1 ]; then echo "STOP: $f already exists on HubSpot; drop --new"; exit 1; fi
      if ! base_version "$f" | cmp -s - "$live"; then
        echo "STOP: $f was changed in HubSpot after this branch was made."
        echo "      Fetch it, merge the change into the branch, commit, then deploy again."
        exit 1
      fi
    else
      echo "skip: $f is already live"; continue
    fi
  elif [ "$NEW" != 1 ]; then
    echo "STOP: could not fetch $f from HubSpot (new file? pass --new)"; exit 1
  fi

  hs cms upload "$f" "$f" >/dev/null
  rm -f "$live"
  hs cms fetch "$f" "$live" >/dev/null 2>&1
  if cmp -s "$live" "$f"; then
    echo "live: $f"
    printf '%s\t%s\t%s\t%s\n' "$(date -u +%FT%TZ)" "$BRANCH" "$(git rev-parse --short HEAD)" "$f" >> "$LOG"
  else
    echo "WARNING: $f uploaded but the live copy does not match. Check it."; exit 1
  fi
done
