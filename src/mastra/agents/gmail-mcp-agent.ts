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
  return new Agent({
    name: 'Dynamic Gmail MCP Agent',
    instructions: `You are a helpful Gmail assistant powered by Klavis MCP tools. You can read, send, and search emails, and perform other Gmail-related tasks securely.\n\nIf a user has not yet authorized Gmail access, guide them through the authorization process:\n- Clearly inform the user that authorization is required to access their Gmail account.\n- Provide a secure, clickable OAuth URL for Gmail authorization.\n- Explain that this link can be opened directly in the playground or UI, and that the process is secure and uses their own Google account.\n- After authorization, confirm that the user can proceed with Gmail actions.\n\nAlways be clear, friendly, and proactive in helping users complete the Gmail authorization flow.`,
    model: openai('gpt-4o-mini'),
    tools,
  });
};

