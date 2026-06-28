# 宝塔 Docker 容器编排部署说明

本文档对应第一阶段部署方式：GitHub Actions 构建 Docker 镜像，服务器通过宝塔 Docker 容器编排拉取镜像运行。

## 1. 准备镜像

推送代码到 GitHub 主分支后，`.github/workflows/docker.yml` 会执行：

```text
npm ci
npm run typecheck
npm run lint
npm run build
docker build
docker push
```

默认镜像：

```text
ghcr.io/xwordsman/nextbuf:latest
ghcr.io/xwordsman/nextbuf:sha-<commit>
```

如果仓库是私有的，需要在服务器上配置 GHCR 拉取权限。

GitHub Actions 默认使用仓库自带的 `GITHUB_TOKEN` 发布 GHCR 镜像，不需要额外配置 PAT。

如果出现 `permission_denied: write_package`，通常说明 `ghcr.io/xwordsman/nextbuf` 这个 package 已经存在，但没有把 `Xwordsman/NextBuf` 仓库授予 Actions 写入权限。处理方式：

```text
GitHub 个人主页 -> Packages -> nextbuf -> Package settings -> Manage Actions access
添加 Xwordsman/NextBuf，并授予 Write 或 Admin 权限
```

如果这个 package 是误创建的，也可以删除该 package 后重新运行 Actions。由当前仓库的 `GITHUB_TOKEN` 首次创建 package 时，GitHub 会自动把 package 关联到当前仓库。

也可以使用 classic PAT 作为备用方案，但这不是默认推荐路径。

## 2. 准备环境变量

复制 `.env.example` 为 `.env`，至少修改：

```text
POSTGRES_PASSWORD
DATABASE_URL
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
```

`NEXTBUF_IMAGE` 默认是 `ghcr.io/xwordsman/nextbuf:latest`，一般不用填写；只有需要切换测试镜像或私有镜像时再覆盖。

`NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` 可用以下命令生成：

```bash
openssl rand -base64 32
```

## 3. 宝塔容器编排

在宝塔面板中：

1. 打开 Docker。
2. 进入容器编排。
3. 新建编排。
4. 粘贴 `docker-compose.yml` 内容。
5. 上传或填写 `.env` 环境变量。
6. 启动编排。

首次启动时，Web 容器会先执行：

```text
npm run db:migrate
```

迁移完成后启动 Next.js 服务。

## 4. 首次安装

容器启动后访问：

```text
http://服务器IP:3050/install
```

填写：

- 网站名称
- 网站网址
- 管理员用户名
- 管理员邮箱
- 管理员密码

安装完成后会进入 `/admin`。

## 5. 后续更新

后续更新流程：

1. 本地提交并推送到 GitHub。
2. GitHub Actions 构建并推送新镜像。
3. 宝塔 Docker 编排中重新拉取镜像。
4. 重启 Web 容器。

数据库数据存储在 Docker volume `postgres_data` 中，重启 Web 容器不会丢失数据。
