function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderHomePage(incomeCategories, totalMonthly) {
  const rows = incomeCategories
    .map(
      (item) => `
              <tr>
                <td>${item.id}</td>
                <td>${escapeHtml(item.name)}</td>
                <td>${escapeHtml(item.typeLabel)}</td>
                <td>$${item.amount.toFixed(2)}</td>
                <td>$${item.monthlyEquivalent.toFixed(2)}</td>
              </tr>`
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Budget Manager - Income</title>
      <link rel="stylesheet" href="/style.css" />
    </head>
    <body>
      <main>
        <h1>Income Manager</h1>
        <nav><a href="/expenses">Manage Expenses →</a></nav>

        <section class="card">
          <h2>Add Income</h2>
          <form action="/income-categories" method="POST">
            <div class="form-row">
              <div class="field">
                <label for="name">Name</label>
                <input id="name" name="name" type="text" placeholder="e.g. Main Job" required />
              </div>

              <div class="field">
                <label for="type">Type</label>
                <select id="type" name="type" required>
                  <option value="biweekly-salary">Biweekly Salary</option>
                  <option value="monthly-deposit">Monthly Deposit (Not Salary)</option>
                </select>
              </div>

              <div class="field">
                <label for="amount">Amount</label>
                <input id="amount" name="amount" type="number" step="0.01" min="0" placeholder="0.00" required />
              </div>
            </div>

            <p class="note">
              Biweekly salary is converted to monthly using 26 pay periods per year.
            </p>

            <button type="submit">Add Income Category</button>
          </form>
        </section>

        <section class="card">
          <h2>Income Categories</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Entered Amount</th>
                <th>Monthly Equivalent</th>
              </tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="5">No income categories added yet.</td></tr>'}
            </tbody>
          </table>

          <div class="summary">Total Monthly Income: $${totalMonthly.toFixed(2)}</div>
        </section>
      </main>
    </body>
    </html>
  `;
}

module.exports = {
  renderHomePage,
};
