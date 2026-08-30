#!/bin/bash
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$HOME/.local/share/forutils-ultimate"
cp -a "$ROOT"/. "$HOME/.local/share/forutils-ultimate/"
mkdir -p "$HOME/.local/bin"
cat > "$HOME/.local/bin/forutils" <<'EOF'
#!/bin/bash
exec gjs "$HOME/.local/share/forutils-ultimate/app.js"
EOF
chmod +x "$HOME/.local/bin/forutils"
echo "Installed. Run: forutils"
