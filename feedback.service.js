const db = require("./db");

function addFeedback(
  ticketId,
  correctedCategory,
  correctedPriority,
  reviewerId
) {
  const ticket =
    db.prepare(
      "SELECT * FROM tickets WHERE id=?"
    ).get(ticketId);

  if (!ticket) {
    throw new Error(
      "Ticket not found"
    );
  }

  const exists =
    db.prepare(
      "SELECT * FROM feedback WHERE ticket_id=?"
    ).get(ticketId);

  if (exists) {
    throw new Error(
      "Feedback already exists"
    );
  }

  const categoryWrong =
    ticket.category !==
    correctedCategory
      ? 1
      : 0;

  const priorityWrong =
    ticket.priority !==
    correctedPriority
      ? 1
      : 0;

  db.prepare(`
    INSERT INTO feedback
    (
      ticket_id,
      ai_category,
      ai_priority,
      corrected_category,
      corrected_priority,
      reviewer_id,
      category_wrong,
      priority_wrong
    )
    VALUES
    (?,?,?,?,?,?,?,?)
  `).run(
    ticketId,
    ticket.category,
    ticket.priority,
    correctedCategory,
    correctedPriority,
    reviewerId,
    categoryWrong,
    priorityWrong
  );

  return {
    message:
      "Feedback submitted successfully"
  };
}

module.exports = {
  addFeedback
};  