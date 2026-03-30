// src/views/expenseView.js

function escapeHtml(value) {
  const str = String(value);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderExpensePage(expenseCategories, totalMonthly, expenseTypes) {
  const rows = expenseCategories
    .map(
      (item) => {
        const monthlyDisplay = item.monthlyAmount !== undefined ? item.monthlyAmount : item.monthlyEquivalent;
        const termInfo = item.type === 'fixed-term' && item.termMonths
          ? `${item.remainingMonths} of ${item.termMonths} months remaining`
          : 'Ongoing';
        const totalRemaining = item.type === 'fixed-term' && item.totalRemaining !== null
          ? `$${item.totalRemaining.toFixed(2)}`
          : '\u2014';
        return `
      <tr>
        <td>${item.id}</td>
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.typeLabel)}</td>
        <td>$${monthlyDisplay.toFixed(2)}</td>
        <td>${termInfo}</td>
        <td>${totalRemaining}</td>
        <td class="actions">
          <a href="/expense-categories/${item.id}/edit" class="btn btn-edit">Edit</a>
          <form method="POST" action="/expense-categories/${item.id}/delete" style="display:inline">
            <button type="submit" class="btn btn-delete" onclick="return confirm('Delete this expense category?')">Delete</button>
          </form>
        </td>
      </tr>`;
      }
    )
    .join('');

  const typeOptions = expenseTypes
    .map(
      (t) =>
        `<option value="${escapeHtml(t.value)}">${escapeHtml(t.label)}</option>`
    )
    .join('\n                  ');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Budget Manager - Expenses</title>
      <link rel="stylesheet" href="/styles.css" />
    </head>
    <body>
      <nav class="nav-bar">
        <a href="/">Income</a>
        <a href="/expenses" class="active">Expenses</a>
        <a href="/assets">Assets</a>
        <a href="/forecast">Forecast</a>
      </nav>
      <main>
        <h1>Monthly Expenses</h1>

        <section class="card">
          <h2>Add Expense Category</h2>
          <form method="POST" action="/expense-categories">
            <div class="form-row">
              <div class="field">
                <label for="name">Category Name</label>
                <input id="name" name="name" type="text" placeholder="e.g. Rent" required />
              </div>

              <div class="field">
                <label for="type">Expense Type</label>
                <select id="type" name="type" required>
                  ${typeOptions}
                </select>
              </div>

              <div class="field">
                <label for="amount">Amount / Monthly Payment</label>
                <input id="amount" name="amount" type="number" step="0.01" min="0" placeholder="0.00" required />
              </div>
            </div>

            <div id="fixed-term-fields" style="display:none;">
              <div class="form-row">
                <div class="field">
                  <label for="termMonths">Term Months</label>
                  <input id="termMonths" name="termMonths" type="number" min="1" step="1" placeholder="e.g. 36" />
                </div>
                <div class="field">
                  <label for="remainingMonths">Remaining Months</label>
                  <input id="remainingMonths" name="remainingMonths" type="number" min="0" step="1" placeholder="e.g. 24" />
                </div>
              </div>
            </div>

            <p class="note">
              All amounts are converted to their monthly equivalent for budgeting.
              Term Months and Remaining Months are only used for Fixed Term expenses.
            </p>

            <button type="submit">Add Expense Category</button>
          </form>
        </section>

        <section class="card">
          <h2>Expense Categories</h2>
          <table>
            <thead>
              <tr>
                <th data-sortable>ID</th>
                <th data-sortable>Name</th>
                <th data-sortable>Type</th>
                <th data-sortable>Monthly Amount</th>
                <th data-sortable>Term Info</th>
                <th data-sortable>Total Remaining</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="7">No expense categories added yet.</td></tr>'}
            </tbody>
          </table>

          <div class="summary">Total Monthly Expenses: $${totalMonthly.toFixed(2)}</div>
        </section>
      </main>
      <script src="/sort.js"></script>
      <script>
        const typeSelect = document.getElementById('type');
        const fixedTermFields = document.getElementById('fixed-term-fields');
        if (typeSelect && fixedTermFields) {
          typeSelect.addEventListener('change', function() {
            fixedTermFields.style.display = this.value === 'fixed-term' ? 'block' : 'none';
          });
        }
      </script>
    </body>
    </html>
  `;
}

function renderEditExpensePage(item, expenseTypes) {
  const typeOptions = expenseTypes
    .map(
      (t) =>
        `<option value="${escapeHtml(t.value)}"${t.value === item.type ? ' selected' : ''}>${escapeHtml(t.label)}</option>`
    )
    .join('\n                  ');

  const isFixedTerm = item.type === 'fixed-term';
  const termMonthsValue = isFixedTerm && item.termMonths ? item.termMonths : '';
  const remainingMonthsValue = isFixedTerm && item.remainingMonths !== null && item.remainingMonths !== undefined ? item.remainingMonths : '';
  const fixedTermDisplay = isFixedTerm ? 'block' : 'none';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Budget Manager - Edit Expense</title>
      <link rel="stylesheet" href="/styles.css" />
    </head>
    <body>
      <nav class="nav-bar">
        <a href="/">Income</a>
        <a href="/expenses" class="active">Expenses</a>
        <a href="/assets">Assets</a>
        <a href="/forecast">Forecast</a>
      </nav>
      <main>
        <h1>Edit Expense Category</h1>

        <section class="card">
          <form method="POST" action="/expense-categories/${item.id}/edit">
            <div class="form-row">
              <div class="field">
                <label for="name">Category Name</label>
                <input id="name" name="name" type="text" value="${escapeHtml(item.name)}" required />
              </div>

              <div class="field">
                <label for="type">Expense Type</label>
                <select id="type" name="type" required>
                  ${typeOptions}
                </select>
              </div>

              <div class="field">
                <label for="amount">Amount / Monthly Payment</label>
                <input id="amount" name="amount" type="number" step="0.01" min="0" value="${item.amount.toFixed(2)}" required />
              </div>
            </div>

            <div id="fixed-term-fields" style="display:${fixedTermDisplay};">
              <div class="form-row">
                <div class="field">
                  <label for="termMonths">Term Months</label>
                  <input id="termMonths" name="termMonths" type="number" min="1" step="1" value="${termMonthsValue}" />
                </div>
                <div class="field">
                  <label for="remainingMonths">Remaining Months</label>
                  <input id="remainingMonths" name="remainingMonths" type="number" min="0" step="1" value="${remainingMonthsValue}" />
                </div>
              </div>
            </div>

            <button type="submit">Save Changes</button>
            <a href="/expenses" class="btn btn-cancel">Cancel</a>
          </form>
        </section>
      </main>
      <script>
        const typeSelect = document.getElementById('type');
        const fixedTermFields = document.getElementById('fixed-term-fields');
        if (typeSelect && fixedTermFields) {
          typeSelect.addEventListener('change', function() {
            fixedTermFields.style.display = this.value === 'fixed-term' ? 'block' : 'none';
          });
        }
      </script>
    </body>
    </html>
  `;
}

module.exports = {
  renderExpensePage,
  renderEditExpensePage,
};
