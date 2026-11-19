#!/usr/bin/env bash
# Re-installs the Stake Engine Claude Code skills into ~/.claude/skills.
# Cloud containers are ephemeral, so run this at the start of a new session.
set -euo pipefail
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$HOME/.claude/skills"
git clone --depth 1 https://github.com/egorfedorov/Slot-Casino-Game-Developer-Skills-for-Stake-Engine.git "$TMP/a"
git clone --depth 1 https://github.com/ReSkin-Games/stake-engine-skills.git "$TMP/b"
for d in "$TMP"/a/*/ "$TMP"/b/stake-math-sdk/ "$TMP"/b/stake-web-sdk/; do
  n="$(basename "$d")"
  rm -rf "$HOME/.claude/skills/$n"
  cp -R "$d" "$HOME/.claude/skills/$n"
  echo "installed $n"
done
echo "Done. Start a new Claude Code session to load the skills."
