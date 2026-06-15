require("dotenv").config();

const express =
  require("express");

const {
  classifyTickets
} = require(
  "./triage.service"
);

const {
  addFeedback
} = require(
  "./feedback.service"
);

const {
  getAccuracyReport
} = require(
  "./accuracy.service"
);

const db = require("./db");

const app = express();

app.use(express.json());

app.post(
  "/triage",
  async (req, res) => {
    try {
      const result =
        await classifyTickets(
          req.body.tickets
        );

      res.json(result);
    } catch (err) {
      res.status(500).json({
        error:
          err.message
      });
    }
  }
);

app.get(
  "/triage/stats",
  (req, res) => {
    const tickets =
      db.prepare(`
      SELECT *
      FROM tickets
      WHERE created_at >=
      datetime('now','-1 day')
    `).all();

    const totalTickets =
      tickets.length;

    const batches =
      new Set(
        tickets.map(
          t => t.batch_id
        )
      );

    const avgTime =
      totalTickets
        ? tickets.reduce(
            (a, b) =>
              a +
              b.processing_time,
            0
          ) / totalTickets
        : 0;

    const distribution =
      {};

    tickets.forEach(t => {
      if (
        !distribution[
          t.category
        ]
      ) {
        distribution[
          t.category
        ] = {
          count: 0
        };
      }

      distribution[
        t.category
      ].count++;
    });

    Object.keys(
      distribution
    ).forEach(k => {
      distribution[
        k
      ].percentage =
        Number(
          (
            (distribution[k]
              .count /
              totalTickets) *
            100
          ).toFixed(2)
        );
    });

    res.json({
      totalTickets,
      totalBatches:
        batches.size,
      avgProcessingTime:
        avgTime,
      estimatedCost: 0,
      distribution
    });
  }
);

app.post(
  "/triage/:id/feedback",
  (req, res) => {
    try {
      const result =
        addFeedback(
          req.params.id,
          req.body
            .corrected_category,
          req.body
            .corrected_priority,
          req.body.reviewer_id
        );

      res.json(result);
    } catch (e) {
      res.status(400).json({
        error:
          e.message
      });
    }
  }
);

app.get(
  "/triage/accuracy",
  (req, res) => {
    res.json(
      getAccuracyReport()
    );
  }
);

app.listen(
  3000,
  () => {
    console.log(
      "Server running on port 3000"
    );
  }
);