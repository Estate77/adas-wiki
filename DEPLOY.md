# ADAS-Wiki 部署状态

## 当前可访问地址

| 地址 | 类型 | 状态 |
|------|------|------|
| http://localhost:4173/ | 本地访问 | ✅ 正在运行（端口 4173 已被 Vite preview 占用） |
| https://clever-spiders-camp.loca.lt/ | 公开访问（loca.lt 隧道） | ✅ 正在运行，已验证 HTML/JS/CSS 全部可访问 |

> **重要说明**：以上公开地址依赖本机服务和隧道进程持续运行，会话结束或机器重启后失效。需真正 7×24 永久在线请按下方「方案 A/B/C」任选其一操作。

---

## 为什么无法实现"完全无人值守永久公网部署"？

我已尝试并排除了所有无需用户操作即可永久部署的方案：

| 方案 | 结果 | 原因 |
|------|------|------|
| Surge.sh 自动注册 | ❌ | `surge.surge.sh/token` API 返回 500 内部错误 |
| GitHub Pages 自动启用 | ❌ | `actions/configure-pages` 报 `administration` 权限不足；GITHUB_TOKEN 不具备该权限，必须由仓库所有者手动在 Settings → Pages 启用 |
| Vercel 自动部署 | ❌ | 需 Vercel 账户 Token |
| Netlify 自动部署 | ❌ | 需 Netlify 账户 Token |
| Cloudflare Pages 自动部署 | ❌ | 需 Cloudflare API Token |
| 阿里云/腾讯云 OSS 静态托管 | ❌ | 需 AccessKey/SecretKey |
| Cloudflare Tunnel 自动建站 | ❌ | npx cloudflared 二进制无法从 GitHub releases 镜像下载（网络受限） |
| localtunnel / loca.lt 隧道 | ✅ | 已成功！但 URL 仅在隧道运行期间有效 |

---

## 用户需做的最小操作（任选其一即可让网站永久在线）

### 方案 A：启用 GitHub Pages（最简单，1 次点击）

项目代码已配置好 GitHub Pages 工作流。只需在 GitHub 仓库页点一下启用：

1. 打开 https://github.com/Estate77/adas-wiki/settings/pages
2. **Source** 选择 `GitHub Actions`
3. 等 1-2 分钟后访问：https://estate77.github.io/adas-wiki/

### 方案 B：连接 Vercel 已有项目

项目 Vercel ID 已绑定：`prj_l0SvoDvU7QYDF4bun4CDhCDmcqMD`

1. 打开 https://vercel.com/dashboard
2. 找到 `adas-wiki` 项目
3. 确认是连接到这个 GitHub 仓库的最新代码
4. 触发重新部署即可

### 方案 C：用 Surge CLI（10 秒搞定）

本地有 `surge.sh` CLI 但 Token API 临时故障。等服务恢复后：

```bash
npx surge frontend/dist adas-wiki-永久子域名.surge.sh
```

按提示输入一次邮箱+密码，之后 `surge` 凭据已存在 `~/.netrc`，后续可脚本化。

---

## 验证当前公开地址

```bash
curl -H "bypass-tunnel-reminder: true" -I https://clever-spiders-camp.loca.lt/
curl -H "bypass-tunnel-reminder: true" -I https://clever-spiders-camp.loca.lt/assets/index-Bv4ueaiO.js
curl -H "bypass-tunnel-reminder: true" -I https://clever-spiders-camp.loca.lt/assets/index-Bwv8Iph_.css
```

> ⚠️ 浏览器首次访问 loca.lt 会显示 "Click to continue" 中转页，是 loca.lt 强制要求，**点击一下**后即可正常访问。这是 loca.lt 的机制，不是我们的 Bug。
