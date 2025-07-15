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

  console.log('[Gmail MCP Agent] Authorize at:', instance.oauthUrl);

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
  return new Agent({
    name: 'Dynamic Gmail MCP Agent',
    instructions: `You are a Gmail assistant using Klavis MCP tools. Handle requests like reading, sending, searching emails, etc.`,
    model: openai('gpt-4o-mini'),
    tools,
  });
};

