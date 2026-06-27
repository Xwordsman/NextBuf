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

## 2. 准备环境变量

复制 `.env.example` 为 `.env`，至少修改：

```text
POSTGRES_PASSWORD
DATABASE_URL
NEXTBUF_IMAGE
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
```

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
http://服务器IP:3000/install
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
