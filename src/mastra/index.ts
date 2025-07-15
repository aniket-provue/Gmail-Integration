
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { gmailMcpAgent } from './agents/gmail-mcp-agent';

const agent = await gmailMcpAgent();
import {
  getOrCreateUserGmailMcpInstance,
  userHasAuthorized,
  getUserServerUrl,
} from './agents/gmail-mcp-user';

// Example: handle a user Gmail request with dynamic MCP logic
export async function handleUserGmailRequest(userId: string, userPrompt: string) {
  // 1. Get or create the user's MCP instance
  const instance = await getOrCreateUserGmailMcpInstance(userId);
  // 2. If not authorized, return OAuth URL for redirect
  if (!userHasAuthorized(userId)) {
    return { oauthUrl: instance.oauthUrl, needsAuth: true };
  }
  // 3. Create agent with user-specific serverUrl
  const agent = await gmailMcpAgent();
  // 4. Use agent to handle the prompt (stream/generate)
  const response = await agent.stream(userPrompt);
  // 5. Return response
  return { response, needsAuth: false };
}


export const mastra = new Mastra({
  workflows: {},
  agents: { agent }, // Only synchronous agents here
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
