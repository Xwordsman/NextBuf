# NextBuf 社区产品与架构草案

## 1. 产品定位

NextBuf 是一个轻量现代社区系统，不以复刻传统 Discuz 论坛为目标，而是面向高频使用、长期沉淀、易部署和易治理的社区产品。

核心方向：

- 信息结构接近 V2EX：节点清晰、列表高效、内容优先。
- 视觉体验接近 Discourse：排版大方、交互现代、权限治理明确。
- 部署方式接近 new-api、sub2api 等开源项目：使用 Docker Compose 在宝塔面板等环境中快速部署。
- 前台与后台一体化：同一个 Next.js 应用内提供社区前台与运营后台。

第一阶段不追求大而全，而是优先完成社区的基本闭环：

- 用户注册、登录、资料页
- 节点浏览、发帖、回复
- 通知、点赞、收藏
- 举报、审核、封禁
- 信任等级与权限策略
- 基础后台运营能力

暂不优先实现：

- 插件市场（但插件系统架构需要提前规划）
- 积分商城
- 复杂勋章体系
- 复杂多模板皮肤市场（但主题系统架构需要提前规划）
- 复杂门户页
- 大型私信/群聊系统

## 2. 技术栈

初步技术栈：

- Next.js 16.2.9
- TypeScript
- Tailwind CSS
- shadcn/ui
- PostgreSQL
- Redis
- Drizzle ORM 或 Prisma

推荐优先考虑 Drizzle ORM。原因是社区产品后期会有大量列表查询、聚合查询、索引优化和性能调优需求，Drizzle 更贴近 SQL，长期可控性更强。

## 3. 部署模型

默认部署目标是简单、稳定、容易被普通站长理解。

基础容器：

```text
web       Next.js 应用，包含前台、后台和 API
postgres  主数据库
redis     缓存、限流、会话、轻任务队列
```

可选组件：

```text
nginx     反向代理，可由宝塔面板提供
worker    异步任务处理，后期拆分
search    独立搜索服务，后期接入 Meilisearch / Typesense
storage   对象存储，后期接入 S3 / R2 / MinIO
```

第一版可以不拆 worker，但代码层面应预留任务队列抽象，避免后期重构成本过高。

代码交付与服务器部署采用以下路径：

```text
本地开发 -> 推送 GitHub -> GitHub Actions 构建 Docker 镜像 -> 推送镜像仓库 -> 宝塔 Docker 容器编排拉取运行
```

部署设计原则：

- 仓库内提供 `Dockerfile`、`docker-compose.yml`、`.env.example` 和部署说明。
- GitHub Actions 负责依赖安装、类型检查、测试、构建和 Docker 镜像发布。
- 镜像标签至少包含 `latest`、Git commit SHA，后期可增加语义化版本标签。
- 服务器不在本地构建源码，只通过宝塔面板的 Docker 容器编排拉取镜像运行。
- 生产环境配置通过 `.env` 注入，不将密钥、数据库密码、Redis 密码写入仓库。
- 数据库迁移需要设计为可重复、可追踪、可回滚或至少可安全重试。
- 镜像仓库可优先考虑 GitHub Container Registry，也可以后期兼容 Docker Hub。

## 4. 首次安装与站点初始化

NextBuf 需要提供首次使用安装界面。虽然部署方式不同于传统 PHP 程序，但站长第一次启动容器后，仍然应有一个清晰的初始化流程，用于创建站点基础信息和第一个管理员账号。

首次访问规则：

- 系统启动后检查是否已初始化。
- 未初始化时，访问前台、后台和大部分 API 都应跳转到 `/install`。
- 已初始化后，`/install` 不再开放普通访问，避免重复安装和安全风险。
- 初始化状态应存储在数据库的站点设置中，而不是仅依赖本地文件。
- 如果数据库未连接或迁移未完成，安装页应给出明确错误提示。

安装界面至少包含：

- 网站名称
- 网站网址
- 管理员用户名
- 管理员邮箱
- 管理员密码
- 确认管理员密码

可选配置：

- 网站简介
- 默认语言
- 默认时区
- 是否允许开放注册
- 邮件服务配置提示
- 对象存储配置提示

安装流程建议：

```text
检查环境 -> 检查数据库 -> 执行迁移 -> 填写站点信息 -> 创建管理员 -> 写入初始化状态 -> 跳转后台
```

安全原则：

- 安装接口只能在未初始化状态下执行。
- 管理员密码必须满足基础强度要求，并使用安全哈希存储。
- 安装完成后生成基础站点设置和默认主题配置。
- 安装过程不得在日志中输出管理员密码、数据库密码等敏感信息。
- 如果初始化过程中失败，应允许安全重试，避免出现半初始化状态。

相关数据建议：

```text
site_settings
id
site_name
site_url
site_description
active_theme_id
allow_registration
installed_at
created_at
updated_at
```

## 5. 界面风格

NextBuf 的界面方向：

```text
V2EX 的信息效率 + Discourse 的现代感和秩序感
```

设计关键词：

```text
清爽、克制、高频、可信、内容优先
```

视觉原则：

- 背景使用浅灰白，避免纯白刺眼。
- 内容区使用白色面板和轻边框，少用重阴影。
- 圆角控制在 6px-8px。
- 字体优先考虑系统字体、Noto Sans SC、Inter。
- 主色低饱和，避免大面积紫色、蓝色或渐变。
- 图标使用 Lucide，保持克制。
- 动效只用于 hover、展开、通知、编辑器等必要场景。

首页结构建议：

```text
顶部导航：
NextBuf / 节点 / 最新 / 热门 / 搜索 / 发帖 / 用户菜单

主体：
左侧主列表：主题流
右侧边栏：登录状态、热门节点、社区统计、公告、活跃用户

主题项：
头像 / 标题 / 节点 / 作者 / 回复数 / 最后回复时间
```

帖子详情页可以更接近 Discourse：

- 正文阅读区更舒展。
- 回复之间使用轻分隔。
- 右侧可提供楼层、时间线或热门回复导航。
- 底部或浮动区域提供回复编辑器。
- 楼主、版主、可信用户等身份使用轻量 badge。

后台不建议使用传统 admin template 的重侧边栏风格，而应与前台共享视觉语言，同时提高信息密度。

后台核心页面：

- 审核台
- 举报列表
- 用户管理
- 节点管理
- 权限策略
- 内容搜索
- 系统设置

## 6. 节点体系

NextBuf 使用“节点”作为公开概念，不使用 Discuz 式“板块”概念。

节点采用两层结构：

```text
一级节点
  二级节点
```

一级节点和二级节点都叫节点，也都可以发帖。

示例：

```text
AI
  OpenAI API
  本地模型
  Prompt
  AI 工具

技术
  Next.js
  Node.js
  数据库
  部署运维

官方
  公告
  反馈
  更新日志
```

### 6.1 一级节点

一级节点由官方创建，代表社区的信息骨架。

一级节点特点：

- 可以发帖。
- 可以聚合展示自身和子节点内容。
- 数量应保持克制，建议控制在 6-10 个。
- 不应由普通用户自由创建。

适合发到一级节点的内容：

- 泛讨论
- 跨主题内容
- 趋势、观点、新闻
- 暂时无法明确归类的问题

### 6.2 二级节点

二级节点是更具体的讨论空间，可以由官方创建，也可以由用户申请。

二级节点特点：

- 可以发帖。
- 归属于某个一级节点。
- 适合更明确的问题、经验和沉淀内容。
- 可通过申请、审核、试运行、转正的方式自然扩展。

用户申请二级节点时，可填写：

- 节点名称
- 节点 slug
- 所属一级节点
- 节点简介
- 为什么需要这个节点
- 预计讨论范围
- 是否愿意参与维护

### 6.3 节点状态

节点建议包含状态字段：

```text
draft      草稿
pending    申请中
trial      试运行
active     正式
archived   归档
hidden     隐藏
```

用户申请通过后，可以先进入试运行状态。

试运行转正式的参考条件：

- 30 天内达到一定主题数量。
- 有多个不同用户参与。
- 内容边界清晰。
- 没有严重违规。
- 有用户愿意协助维护。

### 6.4 节点访问与列表规则

访问一级节点时，默认展示：

```text
一级节点自身主题 + 所有二级节点主题
```

页面顶部提供筛选：

```text
全部 / 只看本节点 / 子节点 A / 子节点 B / 子节点 C
```

主题列表中显示真实发布节点。

示例：

```text
[OpenAI API] gpt-4.1 和 gpt-4o 的选择问题
[AI] 这两年 AI 产品的趋势讨论
[本地模型] Qwen 本地部署显存问题
```

### 6.5 发帖节点选择

发帖时使用分组式节点选择器：

```text
AI
  发到 AI
  OpenAI API
  本地模型
  Prompt
  AI 工具
```

如果用户选择一级节点，显示轻提示：

```text
适合泛讨论和跨主题内容；具体问题建议选择更精确的子节点。
```

后期可根据标题和正文推荐更合适的节点。

### 6.6 不做三级节点

NextBuf 最多支持两级节点。更细的分类交给标签。

推荐结构：

```text
节点 -> 子节点 -> 标签
```

避免结构：

```text
板块 -> 子板块 -> 子子板块
```

三级结构会增加导航成本，也会使产品逐渐接近传统论坛。

## 7. 标签体系

标签用于补充节点，不替代节点。

节点解决“内容属于哪个空间”，标签解决“内容有哪些主题特征”。

示例：

```text
节点：OpenAI API
标签：计费、模型选择、函数调用、部署
```

标签策略：

- 第一版可以允许用户选择已有标签。
- 管理员可以合并、重命名、禁用标签。
- 后期可根据内容自动推荐标签。
- 标签不应承担权限边界，权限边界应主要由节点决定。

## 8. 信任等级与权限

NextBuf 学习 Discourse 的信任等级思路，但保持克制。

信任等级代表用户可信程度，角色代表管理职责。

建议等级：

```text
L0 新用户
L1 成员
L2 活跃成员
L3 可信成员
L4 协作者
```

管理角色：

```text
Moderator 版主
Admin      管理员
```

等级和角色不混用。

### 8.1 等级用途

信任等级可影响：

- 发帖频率限制
- 回复频率限制
- 链接数量限制
- 图片上传权限
- 举报权重
- 是否可申请节点
- 是否可参与节点维护
- 是否触发更宽松的审核策略

### 8.2 UI 表达

等级不应像传统论坛那样到处展示。

推荐：

- 用户资料页显示完整等级。
- 主题和回复中只显示轻量 badge。
- 管理身份和社区信任分开显示。
- 不做夸张头衔、等级图标和积分炫耀。

## 9. 权限策略

节点可以配置不同发帖策略。

建议字段：

```text
open          所有人可发
trusted       达到指定等级可发
moderated     发帖后需审核
admin_only    仅官方可发
closed        不可发帖
```

示例：

```text
AI：open
技术：open
官方：admin_only
公告：admin_only
反馈：open
交易合作：trusted
```

权限不应写死在代码中，应做成可配置策略。

## 10. 数据模型草案

### 10.1 nodes

```text
id
parent_id
name
slug
description
level
posting_mode
status
sort_order
created_by
created_at
updated_at
```

说明：

- `parent_id` 为空表示一级节点。
- `parent_id` 不为空表示二级节点。
- `posting_mode` 控制是否可发帖以及发帖门槛。
- `status` 控制节点生命周期。

### 10.2 posts

```text
id
node_id
root_node_id
author_id
title
content
status
reply_count
like_count
last_reply_at
last_reply_user_id
created_at
updated_at
```

说明：

- `node_id` 是实际发布节点。
- `root_node_id` 是所属一级节点。
- 保存 `root_node_id` 可以提高一级节点聚合查询性能。

### 10.3 replies

```text
id
post_id
author_id
content
status
like_count
created_at
updated_at
```

### 10.4 users

```text
id
username
email
password_hash
avatar_url
bio
trust_level
role
status
created_at
updated_at
```

### 10.5 tags

```text
id
name
slug
description
status
created_at
updated_at
```

### 10.6 post_tags

```text
post_id
tag_id
```

## 11. 性能与数据负载

社区属于高频产品，数据会持续增长。第一版就应避免明显的性能陷阱。

### 11.1 列表查询

高频列表：

- 首页最新主题
- 热门主题
- 一级节点聚合主题
- 二级节点主题
- 用户主题
- 用户回复

建议：

- 主题列表使用 `last_reply_at` 排序。
- 避免深度 offset 分页，后期使用 cursor pagination。
- 高频列表加合理索引。
- 首页和热门列表可使用 Redis 缓存。

### 11.2 推荐索引

示例索引：

```text
posts(root_node_id, last_reply_at)
posts(node_id, last_reply_at)
posts(author_id, created_at)
replies(post_id, created_at)
replies(author_id, created_at)
notifications(user_id, read_at, created_at)
```

### 11.3 缓存策略

Redis 可用于：

- 首页主题缓存
- 热门节点缓存
- 用户通知计数
- 在线状态
- 发帖限流
- 登录会话
- 防刷策略

计数类字段可以先同步更新，后期改为异步聚合。

### 11.4 搜索

第一版可以使用 PostgreSQL 全文搜索。

后期数据增长后，可接入：

- Meilisearch
- Typesense
- OpenSearch

搜索服务应通过异步任务同步，避免发帖流程阻塞。

### 11.5 附件与图片

不建议将附件和图片存入数据库。

第一版可使用本地挂载目录，后期支持：

- S3
- Cloudflare R2
- MinIO
- 其他对象存储

## 12. 后台范围

后台与前台同属一个 Next.js 应用，建议路径为：

```text
/admin
```

第一版后台页面：

- 数据概览
- 待审核内容
- 举报管理
- 用户管理
- 节点管理
- 标签管理
- 帖子管理
- 回复管理
- 权限与信任等级配置
- 系统设置

后台重点不是普通 CRUD，而是社区治理。

治理能力包括：

- 内容隐藏
- 内容恢复
- 用户禁言
- 用户封禁
- 举报处理
- 节点申请审核
- 试运行节点转正
- 低活跃节点归档

## 13. 主题系统规划

主题系统是 NextBuf 的长期基础能力。第一阶段不开发复杂主题市场和多模板皮肤，但项目结构、样式变量和组件边界需要从一开始为主题系统留出空间。

主题系统目标：

- 允许站长在后台切换站点主题。
- 支持浅色、深色，以及后期自定义品牌色。
- 支持主题配置导入、导出和版本管理。
- 支持不同主题覆盖颜色、字体、圆角、间距、组件密度等视觉参数。
- 尽量避免主题直接修改业务逻辑。
- 保持前台、后台共享同一套基础设计语言，但允许后台有更高信息密度。

第一阶段建议实现方式：

- 使用 CSS variables 作为主题 token 基础。
- Tailwind 与 shadcn/ui 读取统一 CSS variables。
- 默认内置一个官方主题，例如 `nextbuf-default`。
- 主题配置先以内置代码和数据库配置结合的方式存在，后期再开放上传和安装。
- 页面和组件避免写死颜色值，统一使用语义化 token。

主题可配置范围建议：

```text
color.background
color.foreground
color.panel
color.border
color.muted
color.primary
color.danger
color.success
radius.base
radius.control
font.sans
density.content
density.admin
```

不建议主题系统第一版支持：

- 任意执行脚本
- 任意覆盖 React 组件
- 在线编辑复杂模板文件
- 每个节点单独使用完全不同主题
- 破坏后台治理体验的深度皮肤化

长期可扩展方向：

- 主题包 manifest，例如 `theme.json`。
- 主题预览和回滚。
- 主题资源管理，例如 logo、favicon、封面图。
- 主题市场或主题导入功能。
- 针对移动端和桌面端的独立密度配置。

主题配置草案：

```text
themes
id
name
slug
version
description
author
status
config
created_at
updated_at

site_settings
active_theme_id
```

## 14. 插件系统规划

插件系统是 NextBuf 的长期扩展能力。第一阶段不开发插件市场，也不允许插件深度侵入核心流程，但核心模块需要提前定义扩展点，避免后期所有能力都只能硬编码到主应用里。

插件系统目标：

- 允许站长按需启用和禁用扩展能力。
- 支持官方插件、社区插件和私有插件。
- 支持插件声明自身能力、版本、依赖、权限和配置项。
- 支持后台统一管理插件状态与配置。
- 插件不能绕过核心权限、审核、数据安全和审计机制。

第一阶段规划原则：

- 暂不实现动态安装第三方代码。
- 可以先实现“内置插件式模块”，用统一 manifest 和配置方式管理。
- 核心业务通过明确的 service、event、hook 边界暴露扩展点。
- 数据库表和配置模型提前预留插件元数据。
- 插件相关代码与核心业务保持边界，避免散落在页面和 API 中。

插件 manifest 草案：

```text
id
name
slug
version
description
author
homepage
min_nextbuf_version
permissions
hooks
settings_schema
enabled_by_default
```

插件状态数据模型草案：

```text
plugins
id
slug
name
version
status
source
config
installed_at
updated_at
```

建议预留的扩展点：

```text
user.registered
user.login
post.beforeCreate
post.afterCreate
post.beforePublish
post.afterPublish
reply.afterCreate
report.created
moderation.resolved
notification.beforeSend
search.indexPost
admin.navItems
settings.sections
```

插件权限类型建议：

```text
read:user
read:post
write:post
read:report
write:notification
write:admin_nav
access:settings
```

适合作为后期官方插件的能力：

- OAuth 登录
- 邮件通知
- Webhook
- 对象存储
- 第三方搜索
- 反垃圾策略
- 数据备份
- 统计分析
- 内容导入导出

插件系统安全原则：

- 默认禁用未知来源插件。
- 插件安装、启用、禁用、配置修改需要管理员权限。
- 插件权限必须显式声明。
- 插件不能直接绕过核心数据库访问层修改敏感数据。
- 插件触发的关键行为需要写入审计日志。
- 对外请求类插件需要支持超时、重试和失败隔离。

长期可扩展方向：

- 插件市场
- 插件签名
- 插件版本升级
- 插件依赖检查
- 插件 CLI
- 插件沙箱或独立 worker
- 插件贡献的后台页面和设置页面
- 插件贡献的主题 token 或轻量前台组件

## 15. 第一阶段里程碑

### M1：基础社区闭环

- 首次安装与站点初始化
- 用户注册登录
- 节点浏览
- 发帖
- 回复
- 帖子列表
- 帖子详情
- 基础后台

### M2：治理闭环

- 举报
- 审核
- 封禁
- 信任等级
- 节点申请
- 节点试运行

### M3：体验增强

- 通知
- 收藏
- 点赞
- 搜索
- 热门主题
- 用户资料页

### M4：性能与部署增强

- Docker Compose
- Redis 缓存
- 限流
- 数据库索引优化
- 备份恢复文档
- 对象存储支持

## 16. 当前关键决策

已确定倾向：

- 使用 Next.js + shadcn/ui + Tailwind CSS。
- 使用 PostgreSQL + Redis。
- 前台后台一体化。
- 不走传统 Discuz 板块路线。
- 使用“节点”作为核心组织方式。
- 一级节点和二级节点都叫节点，也都可以发帖。
- 一级节点由官方创建。
- 二级节点可以由用户申请。
- 最多两级节点，更细分类交给标签。
- 学习 Discourse 的信任等级，但不做复杂积分炫耀。
- 代码推送到 GitHub 后，由 GitHub Actions 构建 Docker 镜像。
- 服务器通过宝塔 Docker 容器编排拉取镜像运行。
- 第一次启动时提供 `/install` 安装界面，用于填写网站信息并创建第一个管理员。
- 主题系统和插件系统需要提前规划架构边界，但不在第一阶段完整实现市场化能力。

待进一步确定：

- ORM 最终选择 Drizzle 还是 Prisma。
- 登录方式是否首发支持 OAuth。
- 编辑器使用 Markdown 还是富文本。
- 首页默认排序逻辑。
- 节点申请的具体门槛。
- 信任等级升级条件。
- 是否第一版内置邮件服务。
- Docker 镜像仓库最终使用 GitHub Container Registry 还是 Docker Hub。
- 插件系统第一版是否只做内置插件式模块。
- 主题系统第一版是否只开放后台切换和基础 token 配置。
- 安装向导第一版是否包含邮件服务和对象存储的配置入口。
