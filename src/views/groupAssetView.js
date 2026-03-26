// src/views/groupAssetView.js

function escapeHtml(value) {
  const str = String(value);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderProjectionResults(projection) {
  if (!projection) return '';

  const { monthlyWithdrawal, projections } = projection;
  const scenarios = ['conservative', 'average', 'aggressive'];

  const resultRows = scenarios
    .map((key) => {
      const p = projections[key];
      const duration = p.neverDepletes
        ? '<span class="net-positive">Never depletes</span>'
        : `${p.years} year${p.years !== 1 ? 's' : ''}${p.remainingMonths > 0 ? `, ${p.remainingMonths} month${p.remainingMonths !== 1 ? 's' : ''}` : ''}`;
      const ratePercent = (p.rate * 100).toFixed(0);
      return `
        <tr>
          <td>${p.label} (${ratePercent}%)</td>
          <td>${duration}</td>
          <td>${p.neverDepletes ? '-' : p.months}</td>
        </tr>`;
    })
    .join('');

  return `
        <section class="card">
          <h2>Projection Results</h2>
          <p>With a monthly withdrawal of <strong>$${monthlyWithdrawal.toFixed(2)}</strong>:</p>
          <table>
            <thead>
              <tr>
                <th>Growth Scenario</th>
                <th>Duration</th>
                <th>Total Months</th>
              </tr>
            </thead>
            <tbody>
              ${resultRows}
            </tbody>
          </table>
        </section>`;
}

function renderAssetsPage(groupAssets, totalValue, projection) {
  const rows = groupAssets
    .map(
      (item) => `
      <tr>
        <td>${item.id}</td>
        <td>${escapeHtml(item.name)}</td>
        <td>$${item.currentValue.toFixed(2)}</td>
        <td class="actions">
          <a href="/group-assets/${item.id}/edit" class="btn btn-edit">Edit</a>
          <form method="POST" action="/group-assets/${item.id}/delete" style="display:inline">
            <button type="submit" class="btn btn-delete" onclick="return confirm('Delete this asset?')">Delete</button>
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
      <title>Budget Manager - Group Assets</title>
      <link rel="stylesheet" href="/styles.css" />
    </head>
    <body>
      <nav class="nav-bar">
        <a href="/">Income</a>
        <a href="/expenses">Expenses</a>
        <a href="/assets" class="active">Assets</a>
      </nav>
      <main>
        <h1>Group Assets</h1>

        <section class="card">
          <h2>Add Asset</h2>
          <form method="POST" action="/group-assets">
            <div class="form-row">
              <div class="field">
                <label for="name">Asset Name</label>
                <input id="name" name="name" type="text" placeholder="e.g. 401k - Employer" required />
              </div>

              <div class="field">
                <label for="currentValue">Current Value</label>
                <input id="currentValue" name="currentValue" type="number" step="0.01" min="0" placeholder="0.00" required />
              </div>
            </div>

            <p class="note">
              Track the current value of group assets such as 401k accounts, pensions, and other investment balances.
            </p>

            <button type="submit">Add Asset</button>
          </form>
        </section>

        <section class="card">
          <h2>Asset Holdings</h2>
          <table>
            <thead>
              <tr>
                <th data-sortable>ID</th>
                <th data-sortable>Name</th>
                <th data-sortable>Current Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="4">No group assets added yet.</td></tr>'}
            </tbody>
          </table>

          <div class="summary">Total Asset Value: $${totalValue.toFixed(2)}</div>
        </section>

        <section class="card">
          <h2>Withdrawal Projection</h2>
          <form method="POST" action="/assets/projection">
            <div class="form-row">
              <div class="field">
                <label for="monthlyWithdrawal">Monthly Withdrawal Amount</label>
                <input id="monthlyWithdrawal" name="monthlyWithdrawal" type="number" step="0.01" min="0" placeholder="0.00" value="${projection ? projection.monthlyWithdrawal.toFixed(2) : ''}" required />
              </div>
            </div>

            <p class="note">
              Calculate how long your total assets ($${totalValue.toFixed(2)}) will last at three growth rates:
              Conservative (3%), Average (6%), Aggressive (10%).
            </p>

            <button type="submit">Calculate Projection</button>
          </form>
        </section>

        ${renderProjectionResults(projection)}
      </main>
      <script src="/sort.js"></script>
    </body>
    </html>
  `;
}

function renderEditAssetPage(item) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Budget Manager - Edit Asset</title>
      <link rel="stylesheet" href="/styles.css" />
    </head>
    <body>
      <nav class="nav-bar">
        <a href="/">Income</a>
        <a href="/expenses">Expenses</a>
        <a href="/assets" class="active">Assets</a>
      </nav>
      <main>
        <h1>Edit Group Asset</h1>

        <section class="card">
          <form method="POST" action="/group-assets/${item.id}/edit">
            <div class="form-row">
              <div class="field">
                <label for="name">Asset Name</label>
                <input id="name" name="name" type="text" value="${escapeHtml(item.name)}" required />
              </div>

              <div class="field">
                <label for="currentValue">Current Value</label>
                <input id="currentValue" name="currentValue" type="number" step="0.01" min="0" value="${item.currentValue.toFixed(2)}" required />
              </div>
            </div>

            <button type="submit">Save Changes</button>
            <a href="/assets" class="btn btn-cancel">Cancel</a>
          </form>
        </section>
      </main>
    </body>
    </html>
  `;
}

module.exports = {
  renderAssetsPage,
  renderEditAssetPage,
};
