import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import axios from 'axios';
import express from 'express';
import { z } from 'zod';
import cors from 'cors';
import { Request, Response } from 'express';

// 定义 IP 信息接口
interface IPInfo {
  ip: string;
  country_code: string;
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  asn: string;
  asn_organization: string;
  organization: string;
}

// 创建 MCP 服务器
const server = new McpServer({
  name: 'ip-geolocation',
  version: '1.0.0',
  description: '提供 IP 地址归属地查询功能'
});

// IP 查询函数
async function queryIp(ip?: string): Promise<string> {
  try {
    // 构建 API URL
    const url = ip 
      ? `https://api.ip.sb/geoip/${ip}`
      : 'https://api.ip.sb/geoip';
    
    // 发送请求获取 IP 信息
    const response = await axios.get<IPInfo>(url, {
      headers: {
        'User-Agent': 'MCP-IP-Geolocation-Server/1.0'
      }
    });
    
    // 格式化返回结果
    const data = response.data;
    return `
IP 地址: ${data.ip}
国家/地区: ${data.country} (${data.country_code})
省/州: ${data.region}
城市: ${data.city}
经纬度: ${data.latitude}, ${data.longitude}
时区: ${data.timezone}
ASN: ${data.asn}
组织: ${data.asn_organization || data.organization}
    `.trim();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return `无法找到 IP 地址 "${ip}" 的信息`;
      }
      return `查询失败: ${error.message}`;
    }
    return `发生错误: ${error instanceof Error ? error.message : String(error)}`;
  }
}

// 添加 IP 查询工具
server.tool(
  'query-ip',
  {
    ip: z.string().optional().describe('要查询的 IP 地址，如果不提供则查询当前客户端 IP')
  },
  async ({ ip }) => {
    const result = await queryIp(ip);
    return {
      content: [{ type: 'text', text: result }]
    };
  }
);

// 存储活跃的 SSE 连接
let transport: SSEServerTransport;

// 启动服务器
async function main() {
  const app = express();
  const port = 3000;

  // 添加中间件
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })); // 启用 CORS，允许所有来源

  // MCP SSE 端点
  app.get('/sse', async (_req, res) =>{ 
    console.log("New SSE connection received");
    transport = new SSEServerTransport("/message", res);
    await server.connect(transport);

  });

  // MCP 消息端点
  app.post('/message', async function(req: Request, res: Response) {
    console.log("Received message", req.body.message);
    await transport.handlePostMessage(req, res);
  });


  // 健康检查端点
  app.get('/', function(req: Request, res: Response) {
    res.json({
      status: 'ok',
      server: 'ip-geolocation',
      version: '1.0.0'
    });
  });


  app.listen(port, () => {
    console.log(`MCP 服务器已启动，监听端口 ${port}`);
    console.log(`MCP SSE 端点: http://localhost:${port}/sse`);
    console.log(`MCP 消息端点: http://localhost:${port}/message`);
  });
}

main().catch(error => {
  console.error('服务器启动失败:', error);
  process.exit(1);
});