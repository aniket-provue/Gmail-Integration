// Utility for managing user-specific Gmail MCP server instances
// In-memory store for demo

import { KlavisClient, Klavis } from 'klavis';
import axios from 'axios';

interface UserMcpInstance {
  userId: string;
  serverUrl: string;
  instanceId: string;
  oauthUrl: string;
  authorized: boolean;
}

const userMcpInstances = new Map<string, UserMcpInstance>();

const KLAVIS_API_KEY = process.env.KLAVIS_API_KEY!; // Set this in your .env

const klavisClient = new KlavisClient({ apiKey: process.env.KLAVIS_API_KEY! });

async function createKlavisGmailMcpInstance(userId: string): Promise<Omit<UserMcpInstance, 'authorized'>> {
  const gmailServer = await klavisClient.mcpServer.createServerInstance({
    serverName: Klavis.McpServerName.Gmail,
    userId,
    platformName: 'integrations-gmail', // or your app name
  });
  // Construct white-labeled OAuth URL
  const oauthUrl = `https://api.klavis.ai/oauth/gmail/authorize?instance_id=${gmailServer.instanceId}&client_id=${process.env.GOOGLE_CLIENT_ID}`;
  return {
    userId,
    serverUrl: gmailServer.serverUrl || '',
    instanceId: gmailServer.instanceId || '',
    oauthUrl,
  };
}

// Get or create a user's Gmail MCP instance, and return info
export async function getOrCreateUserGmailMcpInstance(userId: string): Promise<UserMcpInstance> {
  let instance = userMcpInstances.get(userId);
  if (!instance) {
    const created = await createKlavisGmailMcpInstance(userId);
    instance = { ...created, authorized: false };
    userMcpInstances.set(userId, instance);
  }
  return instance;
}

// Mark user as authorized after OAuth callback
export function markUserAuthorized(userId: string) {
  const instance = userMcpInstances.get(userId);
  if (instance) {
    instance.authorized = true;
  }
}

// Check if user has authorized their Gmail MCP instance
export function userHasAuthorized(userId: string): boolean {
  const instance = userMcpInstances.get(userId);
  return !!instance && instance.authorized;
}

// Get the user's serverUrl (throws if not found)
export function getUserServerUrl(userId: string): string {
  const instance = userMcpInstances.get(userId);
  if (!instance || !instance.authorized) throw new Error('User not authorized or instance not found');
  return instance.serverUrl;
}

// Wait for MCP server to be ready after OAuth
export async function waitForMcpServerReady(serverUrl: string, timeoutMs = 15000): Promise<void> {
  const start = Date.now();
  let healthUrl = serverUrl;
  try {
    const url = new URL(serverUrl);
    url.pathname = url.pathname.replace(/\/$/, '') + '/health';
    healthUrl = url.toString();
  } catch (e) {
    // fallback: just append /health
    healthUrl = serverUrl.replace(/\/$/, '') + '/health';
  }
  console.log('[DEBUG] Health check URL:', healthUrl);
  while (Date.now() - start < timeoutMs) {
    try {
      await axios.get(healthUrl);
      return;
    } catch (e) {
      await new Promise(res => setTimeout(res, 1000));
    }
  }
  throw new Error('MCP server not ready after OAuth');
} 