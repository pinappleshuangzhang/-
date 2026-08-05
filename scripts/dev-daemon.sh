#!/bin/sh
# 以守护方式运行 Next.js 开发服务器：脱离终端会话存活，意外退出后 2 秒自动重启。
# 用法：sh scripts/dev-daemon.sh   （停止：kill $(cat /tmp/gravity-dev.pid) ）

cd "$(dirname "$0")/.." || exit 1
LOG=/tmp/gravity-dev.log
PIDFILE=/tmp/gravity-dev.pid

# 已在运行则不重复启动
if [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
  echo "守护进程已在运行 (pid $(cat "$PIDFILE"))，日志：$LOG"
  exit 0
fi

nohup sh -c '
  while true; do
    # 清理占用 3000 端口的残留进程，避免重启循环空转
    STALE=$(lsof -nP -tiTCP:3000 -sTCP:LISTEN)
    [ -n "$STALE" ] && kill $STALE 2>/dev/null && sleep 1
    echo "[dev-daemon] $(date "+%F %T") 启动 next dev"
    npm run dev
    echo "[dev-daemon] $(date "+%F %T") 进程退出，2 秒后重启"
    sleep 2
  done
' >> "$LOG" 2>&1 &

echo $! > "$PIDFILE"
echo "守护进程已启动 (pid $!)，日志：$LOG"
