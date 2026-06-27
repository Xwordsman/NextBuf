# NextBuf

NextBuf 是一个轻量现代社区系统。第一阶段目标是先让项目跑起来：安装向导、管理员、节点、发帖、回复、基础后台、Docker 和 GitHub Actions。

## 本地开发

安装依赖：

```bash
npm install
```

准备环境变量：

```bash
cp .env.example .env
```

启动 PostgreSQL 和 Redis：

```bash
docker compose up -d postgres redis
```

执行迁移：

```bash
npm run db:migrate
```

启动开发服务：

```bash
npm run dev
```

访问 [http://localhost:3000/install](http://localhost:3000/install) 完成首次安装。

## 常用命令

```bash
npm run typecheck
npm run lint
npm run build
npm run smoke
npm run db:generate
npm run db:migrate
```

## Docker

本地构建并完整启动：

```bash
docker build -t nextbuf:local .
docker compose up -d
```

Web 容器启动时会自动执行数据库迁移，然后启动 Next.js。

Compose 默认暴露宿主机端口 `3050`，访问 [http://localhost:3050/install](http://localhost:3050/install) 完成首次安装。

## 部署

推送到 GitHub 后，GitHub Actions 会构建并推送 Docker 镜像。服务器可通过宝塔 Docker 容器编排拉取镜像运行。

详见 [宝塔 Docker 容器编排部署说明](docs/baota-docker-deployment.md)。
