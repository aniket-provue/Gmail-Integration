# Gmail Integration Project

This project demonstrates how to integrate Gmail using Klavis MCP and Mastra agents. It provides a dynamic agent setup for Gmail automation and management, with user-specific server instances managed in-memory (for demo purposes).

---

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Project Structure](#project-structure)
- [Running the Agent](#running-the-agent)
- [Gmail Authorization](#gmail-authorization)
- [Troubleshooting](#troubleshooting)
- [Notes](#notes)

---

## Prerequisites
- **Node.js** (v16 or later recommended)
- **npm** (comes with Node.js) or **yarn**
- Access to [Klavis](https://klavis.ai/) and a valid **KLAVIS_API_KEY**

---

## Installation
1. **Clone the repository:**
   ```sh
   git clone https://github.com/aniket-provue/Gmail-Integration.git
   cd Gmail-Integration/integrations
   ```
2. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```

---

## Environment Setup
1. **Create a `.env` file** in the `integrations` directory (same level as `package.json`).
2. **Add the following variables:**
   ```env
   KLAVIS_API_KEY=your_klavis_api_key_here
   APP_USER_ID=your_test_user_id_here
   ```
   - Replace `your_klavis_api_key_here` with your actual Klavis API key.
   - Replace `your_test_user_id_here` with a unique user ID (any string for testing).

---

## Project Structure
- `src/mastra/agents/gmail-mcp-user.ts`: Manages user-specific Gmail MCP server instances (in-memory).
- `src/mastra/agents/gmail-mcp-agent.ts`: Dynamically creates a Gmail MCP Agent using Klavis.
- `src/mastra/cli-gmail-test.ts`: (If present) CLI entry point for testing the agent.
- `src/mastra/tools/` and `src/mastra/workflows/`: Additional tools and workflows.

---

## Running the Agent
1. **Run the CLI test script (if available):**
   ```sh
   npx ts-node src/mastra/cli-gmail-test.ts
   ```
   Or, check your `package.json` for available scripts:
   ```sh
   npm run start
   # or
   npm run dev
   ```
2. **Follow the console output.** You should see a message like:
   ```
   [Gmail MCP Agent] Authorize at: https://klavis.ai/oauth/...
   ```

---

## Gmail Authorization
1. **Open the provided OAuth URL** in your browser.
2. **Complete the Gmail OAuth flow** to authorize the agent.
3. **After authorization**, the agent will be able to access Gmail features via Klavis MCP.

---

## Troubleshooting
- **Dependencies not found:** Run `npm install` again.
- **TypeScript errors:** Ensure TypeScript is installed (`npm install -g typescript`).
- **Environment variables not loaded:** Double-check your `.env` file and variable names.
- **In-memory storage:** User state is lost on server restart; re-authorization will be required.

---

## Notes
- **Security:** Never commit your `.env` file or API keys to GitHub.
- **Persistence:** For production, replace the in-memory store in `gmail-mcp-user.ts` with a database.
- **Customization:** Extend the agent or add new tools/workflows as needed.

---

**For questions or issues, please open an issue on the repository or contact the maintainer.** 