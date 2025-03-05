# MCP Server IP 归属地查询服务器

这是一个基于 Model Context Protocol (MCP) 的服务器，提供 IP 地址归属地查询功能。它使用 [ip.sb](https://ip.sb/api/) 的 API 来获取 IP 地址的详细地理位置信息。

## 功能特点

- 查询指定 IP 地址的归属地信息
- 如果不指定 IP 地址，则查询当前客户端的 IP 信息
- 通过 HTTP SSE 方式提供数据传输
- 符合 MCP 协议标准

## 安装

```bash
# 克隆仓库
git clone https://github.com/yourusername/mcp-server-ip.git
cd mcp-server-ip

# 安装依赖
npm install

# 构建项目
npm run build
```

## 使用方法

### 启动服务器

```bash
npm start
```

服务器将在 http://localhost:3000 上启动，并通过 SSE 提供 MCP 服务。

### 开发模式

```bash
npm run dev
```

### 与 Claude Desktop 集成

1. 在项目下创建 `.cursor/mcp.json`：

2. 添加服务器配置：

```json
{
  "mcpServers": {
    "sample-project-server": {
      "url": "http://localhost:3000/sse"
    }
  }
}
```

## API 说明

### query-ip

查询指定 IP 地址的归属地信息。

**参数**:

- `ip` (可选): 要查询的 IP 地址。如果不提供，则查询当前客户端的 IP。

**返回**:
返回包含以下信息的文本：

- IP 地址
- 国家/地区
- 省/州
- 城市
- 经纬度
- 时区
- ASN
- 组织

## 参考

- [MCP 协议](https://www.anthropic.com/news/model-context-protocol)
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Claude MCP](https://docs.cursor.com/context/model-context-protocol)
- [ip.sb](https://ip.sb/api/)
