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

function renderHomePage(incomeCategories, totalMonthlyIncome, totalMonthlyExpenses, groupAssets, totalGroupAssets) {
  const netMonthly = totalMonthlyIncome - totalMonthlyExpenses;
  const incomeRows = incomeCategories
    .map(
      (item) => {
        const isAssetWithdrawal = item.type === 'asset-withdrawal';
        const enteredAmount = isAssetWithdrawal
          ? `$${item.amount.toFixed(2)}/${item.withdrawalFrequency} (from $${item.assetValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} asset)`
          : `$${item.amount.toFixed(2)}`;
        let durationText = '';
        if (isAssetWithdrawal) {
          if (item.durationMonths === Infinity || item.durationMonths === null || item.durationMonths === undefined) {
            durationText = 'Indefinite (growth exceeds withdrawal)';
          } else {
            const years = (item.durationMonths / 12).toFixed(1);
            durationText = `${item.durationMonths} months (${years} yrs)`;
          }
        }
        const rateDetails = isAssetWithdrawal
          ? `<div class="rate-details">Growth: ${(item.growthRate * 100).toFixed(1)}% | Withdrawal: ${(item.withdrawalRate * 100).toFixed(1)}% | Net: ${(item.netRate * 100).toFixed(1)}% | Duration: ${durationText}</div>`
          : '';
        return `
      <tr>
        <td>${item.id}</td>
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.typeLabel)}</td>
        <td>${enteredAmount}</td>
        <td>$${item.monthlyEquivalent.toFixed(2)}${rateDetails}</td>
        <td class="actions">
          <a href="/income-categories/${item.id}/edit" class="btn btn-edit">Edit</a>
          <form method="POST" action="/income-categories/${item.id}/delete" style="display:inline">
            <button type="submit" class="btn btn-delete" onclick="return confirm('Delete this income category?')">Delete</button>
          </form>
        </td>
      </tr>`;
      }
    )
    .join('');

  const assetRows = groupAssets
    .map(
      (item) => `
      <tr class="asset-row">
        <td>${item.id}</td>
        <td>${escapeHtml(item.name)}</td>
        <td>Group Asset</td>
        <td>$${item.currentValue.toFixed(2)}</td>
        <td>-</td>
        <td class="actions">
          <a href="/assets" class="btn btn-edit">View</a>
        </td>
      </tr>`
    )
    .join('');

  const rows = incomeRows + assetRows;

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
        <a href="/assets">Assets</a>
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
                  <option value="quarterly-deposit">Quarterly Deposit</option>
                  <option value="yearly-deposit">Yearly Deposit</option>
                  <option value="asset-withdrawal">Asset Withdrawal</option>
                </select>
              </div>

              <div class="field">
                <label for="amount">Amount</label>
                <input id="amount" name="amount" type="number" step="0.01" min="0" placeholder="0.00" required />
              </div>
            </div>

            <div id="asset-fields" style="display:none;">
              <div class="form-row">
                <div class="field">
                  <label for="assetValue">Asset Value</label>
                  <input id="assetValue" name="assetValue" type="number" step="0.01" min="0" placeholder="0.00" />
                </div>
                <div class="field">
                  <label for="growthRate">Annual Growth Rate (%)</label>
                  <input id="growthRate" name="growthRate" type="number" step="0.01" min="0" placeholder="7.0" />
                </div>
                <div class="field">
                  <label for="withdrawalFrequency">Withdrawal Frequency</label>
                  <select id="withdrawalFrequency" name="withdrawalFrequency">
                    <option value="monthly">Monthly</option>
                    <option value="biweekly">Biweekly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
            </div>

            <p class="note">
              Biweekly salary uses 26 pay periods/year. Quarterly is divided by 3. Yearly is divided by 12.
              For asset withdrawals, the withdrawal rate, net rate, and duration are calculated automatically.
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
            Net Monthly: <span class="${netMonthly >= 0 ? 'net-positive' : 'net-negative'}">${netMonthly < 0 ? '-' : ''}$${Math.abs(netMonthly).toFixed(2)}</span>
            <span class="summary-separator">|</span>
            Group Assets: $${totalGroupAssets.toFixed(2)}
          </div>
        </section>
      </main>
      <script src="/sort.js"></script>
      <script>
        const typeSelect = document.getElementById('type');
        const assetFields = document.getElementById('asset-fields');
        const amountLabel = document.querySelector('label[for="amount"]');
        if (typeSelect && assetFields && amountLabel) {
          typeSelect.addEventListener('change', function() {
            if (this.value === 'asset-withdrawal') {
              assetFields.style.display = 'block';
              amountLabel.textContent = 'Withdrawal Amount';
            } else {
              assetFields.style.display = 'none';
              amountLabel.textContent = 'Amount';
            }
          });
        }
      </script>
    </body>
    </html>
  `;
}

function renderEditIncomePage(item) {
  const biweeklySelected = item.type === 'biweekly-salary' ? ' selected' : '';
  const monthlySelected = item.type === 'monthly-deposit' ? ' selected' : '';
  const quarterlySelected = item.type === 'quarterly-deposit' ? ' selected' : '';
  const yearlySelected = item.type === 'yearly-deposit' ? ' selected' : '';
  const assetWithdrawalSelected = item.type === 'asset-withdrawal' ? ' selected' : '';
  const isAssetWithdrawal = item.type === 'asset-withdrawal';
  const amountLabel = isAssetWithdrawal ? 'Withdrawal Amount' : 'Amount';
  const assetFieldsDisplay = isAssetWithdrawal ? 'block' : 'none';
  const assetValue = isAssetWithdrawal ? item.assetValue.toFixed(2) : '';
  const growthRate = isAssetWithdrawal ? (item.growthRate * 100).toFixed(2) : '';
  const freqMonthlySelected = isAssetWithdrawal && item.withdrawalFrequency === 'monthly' ? ' selected' : '';
  const freqBiweeklySelected = isAssetWithdrawal && item.withdrawalFrequency === 'biweekly' ? ' selected' : '';
  const freqQuarterlySelected = isAssetWithdrawal && item.withdrawalFrequency === 'quarterly' ? ' selected' : '';
  const freqYearlySelected = isAssetWithdrawal && item.withdrawalFrequency === 'yearly' ? ' selected' : '';

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
        <a href="/assets">Assets</a>
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
                  <option value="quarterly-deposit"${quarterlySelected}>Quarterly Deposit</option>
                  <option value="yearly-deposit"${yearlySelected}>Yearly Deposit</option>
                  <option value="asset-withdrawal"${assetWithdrawalSelected}>Asset Withdrawal</option>
                </select>
              </div>

              <div class="field">
                <label for="amount">${amountLabel}</label>
                <input id="amount" name="amount" type="number" step="0.01" min="0" value="${item.amount.toFixed(2)}" required />
              </div>
            </div>

            <div id="asset-fields" style="display:${assetFieldsDisplay};">
              <div class="form-row">
                <div class="field">
                  <label for="assetValue">Asset Value</label>
                  <input id="assetValue" name="assetValue" type="number" step="0.01" min="0" value="${assetValue}" placeholder="0.00" />
                </div>
                <div class="field">
                  <label for="growthRate">Annual Growth Rate (%)</label>
                  <input id="growthRate" name="growthRate" type="number" step="0.01" min="0" value="${growthRate}" placeholder="7.0" />
                </div>
                <div class="field">
                  <label for="withdrawalFrequency">Withdrawal Frequency</label>
                  <select id="withdrawalFrequency" name="withdrawalFrequency">
                    <option value="monthly"${freqMonthlySelected}>Monthly</option>
                    <option value="biweekly"${freqBiweeklySelected}>Biweekly</option>
                    <option value="quarterly"${freqQuarterlySelected}>Quarterly</option>
                    <option value="yearly"${freqYearlySelected}>Yearly</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="submit">Save Changes</button>
            <a href="/" class="btn btn-cancel">Cancel</a>
          </form>
        </section>
      </main>
      <script>
        const typeSelect = document.getElementById('type');
        const assetFields = document.getElementById('asset-fields');
        const amountLabel = document.querySelector('label[for="amount"]');
        if (typeSelect && assetFields && amountLabel) {
          typeSelect.addEventListener('change', function() {
            if (this.value === 'asset-withdrawal') {
              assetFields.style.display = 'block';
              amountLabel.textContent = 'Withdrawal Amount';
            } else {
              assetFields.style.display = 'none';
              amountLabel.textContent = 'Amount';
            }
          });
        }
      </script>
    </body>
    </html>
  `;
}

module.exports = {
  renderHomePage,
  renderEditIncomePage,
};
