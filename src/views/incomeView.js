// src/views/incomeView.js

function escapeHtml(value) {
  const str = String(value);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderHomePage(incomeCategories, totalMonthlyIncome, totalMonthlyExpenses) {
  const netMonthly = totalMonthlyIncome - totalMonthlyExpenses;
  const rows = incomeCategories
    .map(
      (item) => `
      <tr>
        <td>${item.id}</td>
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.typeLabel)}</td>
        <td>$${item.amount.toFixed(2)}</td>
        <td>$${item.monthlyEquivalent.toFixed(2)}</td>
        <td class="actions">
          <a href="/income-categories/${item.id}/edit" class="btn btn-edit">Edit</a>
          <form method="POST" action="/income-categories/${item.id}/delete" style="display:inline">
            <button type="submit" class="btn btn-delete" onclick="return confirm('Delete this income category?')">Delete</button>
          </form>
        </td>
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
      <link rel="stylesheet" href="/styles.css" />
    </head>
    <body>
      <nav class="nav-bar">
        <a href="/" class="active">Income</a>
        <a href="/expenses">Expenses</a>
      </nav>
      <main>
        <h1>Monthly Income</h1>

        <section class="card">
          <h2>Add Income Category</h2>
          <form method="POST" action="/income-categories">
            <div class="form-row">
              <div class="field">
                <label for="name">Category Name</label>
                <input id="name" name="name" type="text" placeholder="e.g. Main Job" required />
              </div>

              <div class="field">
                <label for="type">Income Type</label>
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
                <th data-sortable>ID</th>
                <th data-sortable>Name</th>
                <th data-sortable>Type</th>
                <th data-sortable>Entered Amount</th>
                <th data-sortable>Monthly Equivalent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="6">No income categories added yet.</td></tr>'}
            </tbody>
          </table>

          <div class="summary">
            Total Monthly Income: $${totalMonthlyIncome.toFixed(2)}
            <span class="summary-separator">|</span>
            Total Monthly Expenses: $${totalMonthlyExpenses.toFixed(2)}
            <span class="summary-separator">|</span>
            Net Monthly: <span class="${netMonthly >= 0 ? 'net-positive' : 'net-negative'}">$${netMonthly.toFixed(2)}</span>
          </div>
        </section>
      </main>
      <script src="/sort.js"></script>
    </body>
    </html>
  `;
}

function renderEditIncomePage(item) {
  const biweeklySelected = item.type === 'biweekly-salary' ? ' selected' : '';
  const monthlySelected = item.type === 'monthly-deposit' ? ' selected' : '';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Budget Manager - Edit Income</title>
      <link rel="stylesheet" href="/styles.css" />
    </head>
    <body>
      <nav class="nav-bar">
        <a href="/" class="active">Income</a>
        <a href="/expenses">Expenses</a>
      </nav>
      <main>
        <h1>Edit Income Category</h1>

        <section class="card">
          <form method="POST" action="/income-categories/${item.id}/edit">
            <div class="form-row">
              <div class="field">
                <label for="name">Category Name</label>
                <input id="name" name="name" type="text" value="${escapeHtml(item.name)}" required />
              </div>

              <div class="field">
                <label for="type">Income Type</label>
                <select id="type" name="type" required>
                  <option value="biweekly-salary"${biweeklySelected}>Biweekly Salary</option>
                  <option value="monthly-deposit"${monthlySelected}>Monthly Deposit (Not Salary)</option>
                </select>
              </div>

              <div class="field">
                <label for="amount">Amount</label>
                <input id="amount" name="amount" type="number" step="0.01" min="0" value="${item.amount.toFixed(2)}" required />
              </div>
            </div>

            <button type="submit">Save Changes</button>
            <a href="/" class="btn btn-cancel">Cancel</a>
          </form>
        </section>
      </main>
    </body>
    </html>
  `;
}

module.exports = {
  renderHomePage,
  renderEditIncomePage,
};
