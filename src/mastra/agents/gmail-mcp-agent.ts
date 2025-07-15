import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';
import { MCPClient } from '@mastra/mcp';
import { KlavisClient } from 'klavis';

/**
 * Dynamically creates a Gmail MCP Agent with tools from a Klavis-hosted server.
 * This function is reusable and returns a fresh Agent every time it's called.
 */
export const gmailMcpAgent = async (): Promise<Agent> => {
  const klavis = new KlavisClient({ apiKey: process.env.KLAVIS_API_KEY! });

  // Step 1: Create a new Gmail MCP server instance
  const instance = await klavis.mcpServer.createServerInstance({
    serverName: "Gmail",
    userId: "test-user", // Use a unique ID per user
    platformName: 'mastra-gmail-agent',
  });

  // Construct white-labeled OAuth URL
  const oauthUrl = `https://api.klavis.ai/oauth/gmail/authorize?instance_id=${instance.instanceId}&client_id=${process.env.GOOGLE_CLIENT_ID}`;
  console.log('[Gmail MCP Agent] Authorize at:', oauthUrl);

  // Step 2: Initialize the MCP client for this specific instance
  const mcpClient = new MCPClient({
    servers: {
      gmail: {
        url: new URL(instance.serverUrl),
        requestInit: {
          headers: {
            Authorization: `Bearer ${process.env.KLAVIS_API_KEY!}`,
          },
        },
      },
    },
  });

  // Step 3: Get the tools from this server
  const tools = await mcpClient.getTools();

  // Step 4: Create and return the Agent
  const isAuthenticated = Boolean(oauthUrl === undefined || oauthUrl === null || oauthUrl === ''); // Example logic, replace with your actual auth check
  const instructions = isAuthenticated
    ? `You are a secure Klavis Gmail agent. You have access to Gmail tools: read, send, search emails, and manage labels. Gmail is authenticated and all operations are ready to use. Your access is private and protected.`
    : `You are a secure Klavis Gmail agent with access to Gmail tools (read, send, search, manage labels), but authentication is required. For your privacy and security, please log in using this secure link: ${oauthUrl}`;
  return new Agent({
    name: 'Dynamic Gmail MCP Agent',
    instructions,
    model: openai('gpt-4o-mini'),
    tools,
  });
};

