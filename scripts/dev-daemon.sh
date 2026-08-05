#!/bin/sh
# 以独立会话（setsid）运行 Next.js 开发服务器守护循环：
# 不属于任何终端的进程组，终端/会话关闭或被清理都不影响；意外退出 2 秒自动重启。
# 用法：sh scripts/dev-daemon.sh   停止：sh scripts/dev-daemon.sh stop

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG=/tmp/gravity-dev.log
PIDFILE=/tmp/gravity-dev.pid

if [ "$1" = "stop" ]; then
  if [ -f "$PIDFILE" ]; then
    kill -- -"$(cat "$PIDFILE")" 2>/dev/null
    rm -f "$PIDFILE"
    echo "守护进程已停止"
  fi
  STALE=$(lsof -nP -tiTCP:3000 -sTCP:LISTEN)
  [ -n "$STALE" ] && kill $STALE 2>/dev/null
  exit 0
fi

if [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
  echo "守护进程已在运行 (pid $(cat "$PIDFILE"))，日志：$LOG"
  exit 0
fi

# 双重 fork + setsid：脱离当前进程组与会话，免疫进程组级别的清理
python3 - "$PROJECT_DIR" "$LOG" "$PIDFILE" <<'PYEOF'
import os, sys

project_dir, log, pidfile = sys.argv[1], sys.argv[2], sys.argv[3]

if os.fork() > 0:
    sys.exit(0)
os.setsid()
if os.fork() > 0:
    os._exit(0)

os.chdir(project_dir)
fd = os.open(log, os.O_WRONLY | os.O_CREAT | os.O_APPEND, 0o644)
os.dup2(fd, 1)
os.dup2(fd, 2)
devnull = os.open(os.devnull, os.O_RDONLY)
os.dup2(devnull, 0)

with open(pidfile, "w") as f:
    f.write(str(os.getpid()))

loop = r'''
while true; do
  STALE=$(lsof -nP -tiTCP:3000 -sTCP:LISTEN)
  [ -n "$STALE" ] && kill $STALE 2>/dev/null && sleep 1
  echo "[dev-daemon] $(date "+%F %T") 启动 next dev"
  npm run dev
  echo "[dev-daemon] $(date "+%F %T") 进程退出，2 秒后重启"
  sleep 2
done
'''
os.execv("/bin/sh", ["/bin/sh", "-c", loop])
PYEOF

sleep 1
echo "守护进程已启动 (pid $(cat "$PIDFILE"))，日志：$LOG"
