#!/usr/bin/env bash
# 单向镜像推送：把 SOURCE 的全部分支与标签 fast-forward 推到 TARGET。GitHub 与 CNB 两侧各跑一份，合起来就是双向同步。
#
# 设计约束（不要改成 --force / --mirror）：
#   - 只做 fast-forward：另一侧有独立提交时 push 被拒、脚本非 0 退出，由 CI 报警，人工合并后再推一次即可；
#   - 不传播删除：TARGET 上多出来的分支 / 标签不会被删；
#   - 幂等：没有新引用时 git 输出 Everything up-to-date，另一侧不会产生新的 push 事件，双向配置不会形成触发循环。
#
# 凭据一律走 http.extraHeader，不拼进 URL：git 报错时会原样打印远端 URL，拼进去会把令牌泄露到 CI 日志。
#
# 环境变量：
#   SOURCE_URL   源仓库 HTTPS 地址（不含凭据），如 https://cnb.cool/wpush/wpush-blog
#   SOURCE_AUTH  源仓库 Basic 凭据 user:token；公开仓库可留空
#   TARGET_URL   目标仓库 HTTPS 地址（不含凭据）
#   TARGET_AUTH  目标仓库 Basic 凭据 user:token（GitHub 用 x-access-token:<PAT>，CNB 用 cnb:<访问令牌>）
set -euo pipefail

: "${SOURCE_URL:?SOURCE_URL 未设置}"
: "${TARGET_URL:?TARGET_URL 未设置}"
: "${TARGET_AUTH:?TARGET_AUTH 未设置}"

auth_header() { # $1 = user:token → -c http.extraHeader=Authorization: Basic xxx
  [ -n "${1:-}" ] || return 0
  printf 'http.extraHeader=Authorization: Basic %s' "$(printf '%s' "$1" | base64 | tr -d '\n')"
}

work="$(mktemp -d "${TMPDIR:-/tmp}/mirror-push.XXXXXX")" # 显式模板：macOS 的 mktemp -d 不看 TMPDIR
trap 'rm -rf "$work"' EXIT

echo "== fetch ${SOURCE_URL}"
src_hdr="$(auth_header "${SOURCE_AUTH:-}")"
if [ -n "$src_hdr" ]; then
  git -c "$src_hdr" clone --quiet --bare "$SOURCE_URL" "$work/repo"
else
  git clone --quiet --bare "$SOURCE_URL" "$work/repo"
fi
cd "$work/repo"

echo "== refs to push"
git for-each-ref --format='  %(refname:short) %(objectname:short)' refs/heads refs/tags

echo "== push -> ${TARGET_URL}"
git -c "$(auth_header "$TARGET_AUTH")" push --no-verify "$TARGET_URL" \
  'refs/heads/*:refs/heads/*' \
  'refs/tags/*:refs/tags/*'
