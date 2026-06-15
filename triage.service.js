const axios = require("axios");
const db = require("./db");

async function classifyTickets(tickets) {
  const start = Date.now();

  const prompt = `
You are a support ticket classifier.

Categories:
Billing
Technical
Account
Feature Request
Other

Priorities:
Low
Medium
High
Critical

Assigned Teams:
Billing Team
Engineering
Customer Success
Product

Return ONLY JSON array.

For each ticket return:

id
category
priority
assigned_team
summary
confidence

Tickets:
${JSON.stringify(tickets)}
`;

  const response = await axios.post(
    "https://api.anthropic.com/v1/messages",
    {
      model: "claude-3-5-sonnet-latest",
      max_tokens: 3000,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    },
    {
      headers: {
        "x-api-key": process.env.CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      }
    }
  );

  const result = JSON.parse(
    response.data.content[0].text
  );

  const processingTime =
    Date.now() - start;

  const batchId =
    Date.now().toString();

  const insert =
    db.prepare(`
    INSERT OR REPLACE INTO tickets
    (
      id,
      description,
      category,
      priority,
      assigned_team,
      summary,
      confidence,
      input_tokens,
      output_tokens,
      processing_time,
      batch_id
    )
    VALUES
    (?,?,?,?,?,?,?,?,?,?,?)
  `);

  result.forEach(ticket => {
    const original =
      tickets.find(
        t => t.id === ticket.id
      );

    insert.run(
      ticket.id,
      original.description,
      ticket.category,
      ticket.priority,
      ticket.assigned_team,
      ticket.summary,
      ticket.confidence,
      response.data.usage.input_tokens,
      response.data.usage.output_tokens,
      processingTime,
      batchId
    );
  });

  return result;
}

module.exports = {
  classifyTickets
};