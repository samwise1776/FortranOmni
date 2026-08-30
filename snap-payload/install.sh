#!/bin/bash
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$HOME/.local/share/fortranomni-ultimate"
cp -a "$ROOT"/. "$HOME/.local/share/fortranomni-ultimate/"
mkdir -p "$HOME/.local/bin"
cat > "$HOME/.local/bin/fortranomni" <<'EOF'
#!/bin/bash
exec gjs "$HOME/.local/share/fortranomni-ultimate/app.js"
EOF
chmod +x "$HOME/.local/bin/fortranomni"
echo "Installed. Run: fortranomni"
