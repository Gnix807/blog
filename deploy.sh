#!/usr/bin/env bash
# 博客一键部署脚本
# 用法：在服务器项目目录下执行  bash deploy.sh
set -euo pipefail

# ── 配置 ─────────────────────────────────────
# 1Panel 网站的运行目录（nginx 实际读取的地方）
SITE_DIR="/opt/1panel/www/sites/blog.gnix807.top/index"
# 项目目录（脚本所在目录）
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# ─────────────────────────────────────────────

cd "$REPO_DIR"

echo "==> [1/4] 拉取最新代码"
git pull

echo "==> [2/4] 安装依赖"
pnpm install --frozen-lockfile

echo "==> [3/4] 构建静态站点"
pnpm generate

echo "==> [4/4] 部署到 $SITE_DIR"
if [ ! -d "$SITE_DIR" ]; then
	echo "错误：目标目录不存在：$SITE_DIR" >&2
	exit 1
fi
rm -rf "${SITE_DIR:?}"/*
cp -r "$REPO_DIR/.output/public/." "$SITE_DIR/"

echo "==> 完成！已部署 $(find "$SITE_DIR" -type f | wc -l) 个文件"
