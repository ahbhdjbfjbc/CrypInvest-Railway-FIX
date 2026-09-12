#!/data/data/com.termux/files/usr/bin/bash
set -e
pkg update -y
pkg upgrade -y
pkg install -y nodejs unzip nano tmux
termux-setup-storage || true
mkdir -p "$HOME/crypinvest"
cat <<'TXT'

CrypInvest phone setup prepared.
1) Put CrypInvest-Termux-Ready-Relaxed-Full-Audit.zip in ~/storage/downloads/
2) If an older copy is running, stop it first with Ctrl+C in its terminal (or stop its tmux session).
3) Back up the old folder: mv ~/crypinvest ~/crypinvest-old-$(date +%Y%m%d-%H%M)
4) mkdir -p ~/crypinvest && unzip ~/storage/downloads/CrypInvest-Termux-Ready-Relaxed-Full-Audit.zip -d ~/crypinvest
5) cd ~/crypinvest/CrypInvest-GitHub-Ready-Fixed
6) npm install --omit=dev
7) cp .env.example .env && nano .env
8) Set MONGODB_URI and a JWT_SECRET of at least 32 random characters. Leave REQUIRE_ADMIN_2FA=false unless you intentionally enable admin 2FA.
9) Set BOOTSTRAP_ADMIN_NAME, BOOTSTRAP_ADMIN_EMAIL and a strong BOOTSTRAP_ADMIN_PASSWORD (12+ chars), then run: npm run bootstrap:admin
10) Remove the bootstrap password from .env after the one-time bootstrap.
11) Run: npm run preflight
12) Run: npm run db:smoke
13) Start: npm start
14) Open http://127.0.0.1:3000 in Chrome

For a long-running session:
  termux-wake-lock
  tmux
  npm start
Detach with Ctrl+B then D; return with: tmux attach
TXT
