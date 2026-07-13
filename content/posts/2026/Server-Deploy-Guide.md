---
title: 雨云 + 1Panel 服务器部署实战
description: 从购买服务器、安装 1Panel 面板，到创建网站、配置 HTTPS、设置 Git 自动部署——一台 Debian 服务器的完整上手记录。
date: 2026-07-13 00:00:00
updated: 2026-07-13 00:00:00
image:
categories: [技术]
tags: [服务器, 1Panel, 雨云, 部署, Linux]
---

# 雨云 + 1Panel 服务器部署实战

## 前言

不管是搭博客、跑项目、还是放 API，总得有个地方跑。虚拟主机太受限，大厂云太贵，几经对比选了**雨云**的 VPS + **1Panel** 面板——价格适中、国产面板上手快、社区活跃。这篇文章记一下从买机器到部署上线的完整流程。

::alert{type="info"}
本文以 **Debian 12** 为例。雨云默认提供的就是 Debian，如果你用 Ubuntu 或其他发行版，命令基本通用。
::

## 为什么选雨云 + 1Panel

简单说：**够用、便宜、不折腾**。

- **价格**：入门配置几十块一个月，跑个人博客 + 几个小服务绰绰有余
- **1Panel**：国产开源面板，和应用商店一键安装、文件管理、HTTPS 证书自动续期都做得不错。相比于手敲 nginx 配置和 Let's Encrypt 命令，省了不少时间
- **社区**：官方论坛活跃、QQ 群有人解答、生态在快速成长

对个人开发者来说，这套组合比阿里云 + 宝塔的性价比高不少，也比纯命令行多了个可视化管理界面，不至于改个配置还要现查 nginx 语法。

## 第一步：买机器 + 初始设置

雨云官网 [www.rainyun.com](https://www.rainyun.com) 直接选 VPS。建议：

- **系统**：Debian 12（稳定性好、包新）
- **配置**：1 核 2G 起，跑博客 + Nginx ✅，如果想跑数据库或 Docker 建议上 2 核 4G
- **带宽**：按流量计费，个人博客通常够用

购买后登录 SSH：

```bash
ssh root@你的服务器IP
```

::alert{type="warning"}
**第一件事**——改密码和更新系统：
```bash
passwd
apt update && apt upgrade -y
```
::

## 第二步：安装 1Panel

一行命令完成安装：

```bash
curl -sSL https://resource.fit2cloud.com/1panel/package/quick_start.sh -o quick_start.sh && bash quick_start.sh
```

安装过程会提示设置**面板端口**和**管理员密码**。记好，别丢了。

安装完成后浏览器打开 `http://你的IP:面板端口`，输入刚才设的账号密码，就看到 1Panel 主界面了。

## 第三步：创建网站

这是最核心的操作，也是 1Panel 比命令行方便的地方。

**3.1 新建站点**：左侧「网站」→ 右上角「创建网站」→ 类型选**静态网站**，填你的域名，端口默认 80。

**3.2 上传文件**：1Panel 自带文件管理器，可以把你的网站文件上传到站点根目录。如果你是用 `pnpm generate` 构建的静态站，产物的 `.output/public/` 整个文件夹扔进去就行。

::alert{type="tip"}
**小技巧**：与其每次手动上传，不如在服务器上 pull Git 仓库、在服务器构建、用软链接或拷贝指向 1Panel 的站点目录。我现在的部署流程就是一条命令——本地 `git push`，服务器 `bash deploy.sh` 自动拉代码 + 构建 + 拷贝。详见我的博客搭建记录。
::

**3.3 伪静态**：静态网站关键一步。文章页（如 `/2026/some-article`）在 Nginx 下直接访问会 404，因为 Nginx 不知道 `some-article` 对应的是 `some-article/index.html`。在站点「配置文件」里加上这段：

```nginx
location / {
    try_files $uri $uri.html $uri/ /404.html;
}
```

保存后 1Panel 自动 reload，文章页就能正常访问了。

**3.4 HTTPS**：站点 → HTTPS → 申请 Let's Encrypt 证书（选 acme 账户）→ 一键申请。然后打开「强制 HTTPS」。

::alert{type="warning"}
**注意**：Let's Encrypt 要求域名 DNS 已解析到你的服务器 IP。如果 DNS 还没配好就去申请证书会失败——先配好 DNS 解析、等几分钟生效后再操作。
::

## 第四步：安装运行时环境

如果你的项目需要 Node，1Panel 的应用商店可以直接装。或者在命令行安装：

```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs
sudo corepack enable
corepack prepare pnpm@11.8.0 --activate
```

上面的命令会装 Node 24 + 启用 pnpm（`package.json` 锁定的版本是 11.8.0）。

::alert{type="tip"}
**为什么不用 Docker**：对于个人博客这种小项目，Docker 的镜像和管理开销比直接跑 Node 更大。静态站甚至不需要 Node 进程——构建完就是一堆 HTML，Nginx 直出。如果项目复杂、环境依赖多，再考虑 Docker 也不迟。
::

## 第五步：配置 Git 自动化部署

手动上传太累，用 Git 做自动化部署才是最舒服的。流程分两步：

**5.1 服务器上 Clone 仓库**

```bash
cd /opt
git clone https://github.com/你的用户名/你的仓库.git my-site
cd my-site
pnpm install
```

**5.2 写一个部署脚本 `deploy.sh`**

```bash
#!/usr/bin/env bash
set -euo pipefail
cd /opt/my-site
git pull
pnpm install --frozen-lockfile
npx nuxi generate
rm -rf /opt/1panel/www/sites/你的域名/index/*
cp -r .output/public/. /opt/1panel/www/sites/你的域名/index/
echo "部署完成"
```

以后更新博客只需要：

```bash
cd /opt/my-site && bash deploy.sh
```

一条命令，拉代码 → 构建 → 拷贝到站点目录，全程自动化。

## 第六步：监控和维护

1Panel 面板自带**系统监控**（CPU、内存、磁盘、网络），日常看一眼就行。另外几个好习惯：

- **定期 `apt update`**：系统安全补丁
- **看 nginx 日志**：1Panel 站点详情里能看到访问日志和错误日志
- **备份**：1Panel 有定时备份功能，可以把站点文件和数据库（如果有）定期备份到远程

## 常见问题

**Q：域名解析后访问还是默认页？**

检查 1Panel 站点根目录下是否真的替换成了你的文件。1Panel 创建站点时会自动生成一个 `index.html`（「恭喜，站点创建成功」），必须删掉或覆盖它。

**Q：Let's Encrypt 证书申请失败？**

最常见的原因：域名 DNS 还没指向服务器。`ping 你的域名` 确认 IP 是否正确。另外 `.env` 等敏感文件不要放在网站根目录可公开访问的位置。

**Q：静态站文章页刷新 404？**

就是你忘了配那个 `try_files $uri $uri.html $uri/ /404.html`。每篇静态文章都是一个文件夹（里面有 `index.html`），Nginx 不知道自动去找，必须靠 `try_files` 兜底。

**Q：服务器内存不够？**

1 核 2G 跑 Nginx + 几个静态站完全够。如果装了很多服务，关掉不用的 Docker 容器、减少不必要的进程。1Panel 面板本身开销很小。

## 成本参考（月均）

::card-list
- **雨云 VPS（1核2G）**：~¥30/月
- **域名**：~¥30/年（≈ ¥2.5/月）
- **DNS + CDN**：Cloudflare 免费计划
- **总计**：约 ¥35/月
::

按一杯奶茶的价格一个月，得到一个完全自主可控的服务器——性价比非常高。

## 写在最后

从完全不会 Linux 到能自己搭服务器、配 Nginx、写部署脚本，其实并没有想象中那么难。1Panel 这个工具大大降低了上手门槛，面板操作 + 命令行互补是很好的组合。

如果你也在考虑把自己的项目从 Vercel/Netlify 搬到自己的服务器上，希望这篇能帮你快速上手。

::quote
拥有一台自己的服务器，就像在互联网上有了自己的房子。你可以决定上面跑什么、怎么跑、什么时候搬走——完全的自由。
::
