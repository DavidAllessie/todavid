// Secure proxy for Anthropic API — keeps your API key server-side
// Never expose your API key in client-side HTML!
 
exports.handler = async function (event) {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
 
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "ANTHROPIC_API_KEY environment variable not set" }),
    };
  }
 
  try {
    const body = JSON.parse(event.body);
 
    // Build headers — add MCP beta header when MCP servers are used
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    };
    if (body.mcp_servers && body.mcp_servers.length > 0) {
      headers["anthropic-beta"] = "mcp-client-2025-04-04";
    }
 
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
 
    const data = await response.json();
 
    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
