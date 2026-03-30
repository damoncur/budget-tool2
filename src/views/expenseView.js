function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderExpensesPage(expenseCategories, totalMonthly) {
  const rows = expenseCategories
    .map((item) => {
      const rowClass = item.isComplete ? ' class="completed"' : '';
      const startDate = item.startDate || '\u2014';
      const term = item.termMonths != null ? item.termMonths : '\u2014';
      const remaining = item.remainingPayments != null ? item.remainingPayments : '\u2014';
      const totalRemaining = item.totalRemaining != null ? `$${item.totalRemaining.toFixed(2)}` : '\u2014';
      const status = item.isComplete ? 'Complete' : 'Active';

      return `
              <tr${rowClass}>
                <td>${item.id}</td>
                <td>${escapeHtml(item.name)}</td>
                <td>${escapeHtml(item.typeLabel)}</td>
                <td>$${item.monthlyAmount.toFixed(2)}</td>
                <td>${escapeHtml(startDate)}</td>
                <td>${escapeHtml(String(term))}</td>
                <td>${escapeHtml(String(remaining))}</td>
                <td>${totalRemaining}</td>
                <td>${status}</td>
              </tr>`;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Budget Manager - Expenses</title>
      <link rel="stylesheet" href="/style.css" />
      <style>
        tr.completed td {
          color: #999;
          text-decoration: line-through;
        }
      </style>
    </head>
    <body>
      <main>
        <h1>Expense Manager</h1>
        <nav><a href="/">← Back to Income</a></nav>

        <section class="card">
          <h2>Add Expense</h2>
          <form action="/expense-categories" method="POST">
            <div class="form-row">
              <div class="field">
                <label for="name">Name</label>
                <input id="name" name="name" type="text" placeholder="e.g. Rent" required />
              </div>

              <div class="field">
                <label for="type">Type</label>
                <select id="type" name="type" required>
                  <option value="monthly">Monthly</option>
                  <option value="fixed-term">Fixed Term</option>
                </select>
              </div>

              <div class="field">
                <label for="amount">Monthly Amount</label>
                <input id="amount" name="amount" type="number" step="0.01" min="0" placeholder="0.00" required />
              </div>

              <div class="field">
                <label for="startDate">Start Date</label>
                <input id="startDate" name="startDate" type="date" />
                <small>Only for Fixed Term expenses</small>
              </div>

              <div class="field">
                <label for="termMonths">Term Length (Months)</label>
                <input id="termMonths" name="termMonths" type="number" min="1" placeholder="e.g. 60" />
                <small>Only for Fixed Term expenses</small>
              </div>
            </div>

            <p class="note">
              Fixed Term expenses track remaining payments automatically from the start date and term length.
              There is no need to enter remaining months — they are calculated for you.
            </p>

            <button type="submit">Add Expense</button>
          </form>
        </section>

        <section class="card">
          <h2>Expense Categories</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Monthly Amount</th>
                <th>Start Date</th>
                <th>Term</th>
                <th>Remaining Payments</th>
                <th>Total Remaining</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="9">No expense categories added yet.</td></tr>'}
            </tbody>
          </table>

          <div class="summary">Total Monthly Expenses (Active): $${totalMonthly.toFixed(2)}</div>
        </section>
      </main>
    </body>
    </html>
  `;
}

module.exports = {
  renderExpensesPage,
};
