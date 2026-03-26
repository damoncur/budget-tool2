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

function renderAssetsPage(groupAssets, totalValue) {
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
