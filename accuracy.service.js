const db = require("./db");

function getAccuracyReport() {
  const rows =
    db.prepare(
      "SELECT * FROM feedback"
    ).all();

  const report = {
    overall_precision: 0,
    categories: [],
    needs_prompt_refinement: []
  };

  let totalCorrect = 0;

  const grouped = {};

  rows.forEach(r => {
    if (
      !grouped[r.ai_category]
    ) {
      grouped[r.ai_category] = [];
    }

    grouped[r.ai_category].push(
      r
    );

    if (
      !r.category_wrong &&
      !r.priority_wrong
    ) {
      totalCorrect++;
    }
  });

  Object.keys(grouped).forEach(
    category => {
      const items =
        grouped[category];

      const reviewed =
        items.length;

      const correct =
        items.filter(
          x =>
            !x.category_wrong &&
            !x.priority_wrong
        ).length;

      const precision =
        Number(
          (
            (correct /
              reviewed) *
            100
          ).toFixed(2)
        );

      const patterns = {};

      items.forEach(x => {
        const key =
          `${x.ai_category} -> ${x.corrected_category}`;

        patterns[key] =
          (patterns[key] || 0) +
          1;
      });

      const patternArray =
        Object.entries(
          patterns
        ).map(
          ([pattern, count]) => ({
            pattern,
            count
          })
        );

      report.categories.push({
        category,
        reviewed,
        correct,
        precision,
        patterns:
          patternArray
      });

      if (precision < 70) {
        report.needs_prompt_refinement.push(
          category
        );
      }
    }
  );

  report.overall_precision =
    rows.length
      ? Number(
          (
            (totalCorrect /
              rows.length) *
            100
          ).toFixed(2)
        )
      : 0;

  return report;
}

module.exports = {
  getAccuracyReport
};