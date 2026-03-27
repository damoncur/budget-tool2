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

function renderHomePage(incomeCategories, totalMonthlyIncome, totalMonthlyExpenses, groupAssets, totalGroupAssets, bigTicketExpenses = [], fixedTermExpenses = [], totalMonthlyFixedTermExpenses = 0) {
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
          if (item.durationMonths === Infinity || item.depleted === false) {
            durationText = '<span class="duration-indefinite">Indefinite (growth exceeds withdrawal)</span>';
          } else if (item.durationMonths === null || item.durationMonths === undefined) {
            durationText = 'N/A (edit to calculate)';
          } else {
            const years = (item.durationMonths / 12).toFixed(1);
            durationText = `<span class="duration-finite">${item.durationMonths} months (${years} yrs)</span>`;
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

        ${renderBigTicketSection(incomeCategories, bigTicketExpenses, totalMonthlyIncome)}

        ${renderFixedTermExpenseSection(fixedTermExpenses, totalMonthlyFixedTermExpenses)}

        <section class="card">
          <h2>Monthly Summary</h2>
          <div class="summary">
            Total Monthly Income: $${totalMonthlyIncome.toFixed(2)}<br/>
            Total Monthly Expenses: -$${totalMonthlyExpenses.toFixed(2)}<br/>
            Total Fixed-Term Expenses: -$${totalMonthlyFixedTermExpenses.toFixed(2)}<br/>
            <strong>Net Monthly: <span class="${(totalMonthlyIncome - totalMonthlyExpenses - totalMonthlyFixedTermExpenses) >= 0 ? 'net-positive' : 'net-negative'}">${(totalMonthlyIncome - totalMonthlyExpenses - totalMonthlyFixedTermExpenses) < 0 ? '-' : ''}$${Math.abs(totalMonthlyIncome - totalMonthlyExpenses - totalMonthlyFixedTermExpenses).toFixed(2)}</span></strong>
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

function renderBigTicketSection(incomeCategories, bigTicketExpenses, totalMonthlyIncome) {
  const assetWithdrawalItems = incomeCategories.filter(i => i.type === 'asset-withdrawal');

  const assetOptions = assetWithdrawalItems
    .map(item => `<option value="${item.id}">${escapeHtml(item.name)} ($${item.assetValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</option>`)
    .join('\n                        ');

  const expenseRows = bigTicketExpenses
    .map(expense => {
      const fundedByAsset = expense.fundedByAssetId
        ? incomeCategories.find(i => i.id === expense.fundedByAssetId)
        : null;
      const fundedByText = fundedByAsset
        ? `<span class="expense-funded">Funded from ${escapeHtml(fundedByAsset.name)}</span>`
        : 'Save from income';
      const monthlySetAsideText = expense.monthlySetAside !== null
        ? `$${expense.monthlySetAside.toFixed(2)}/mo`
        : `<span class="expense-funded">Funded from asset</span>`;
      const monthsUntilDue = expense.monthsUntilDue > 0 ? expense.monthsUntilDue : 'Past due';
      return `
      <tr>
        <td>${escapeHtml(expense.name)}</td>
        <td>$${expense.cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td>${escapeHtml(expense.targetDate)}</td>
        <td>${monthsUntilDue}</td>
        <td>${fundedByText}</td>
        <td>${monthlySetAsideText}</td>
        <td class="actions">
          <form method="POST" action="/big-ticket-expenses/${expense.id}/delete" style="display:inline">
            <button type="submit" class="btn btn-delete" onclick="return confirm('Delete this big ticket expense?')">Delete</button>
          </form>
        </td>
      </tr>`;
    })
    .join('');

  // Calculate total monthly set-aside for unfunded expenses
  const totalMonthlySetAside = bigTicketExpenses
    .filter(e => e.monthlySetAside !== null)
    .reduce((sum, e) => sum + e.monthlySetAside, 0);

  const remainingAfterSetAsides = totalMonthlyIncome - totalMonthlySetAside;

  // Build asset projection summaries
  const assetSummaries = assetWithdrawalItems
    .map(asset => {
      const linkedCount = bigTicketExpenses.filter(e => e.fundedByAssetId === asset.id).length;
      let durationText;
      if (asset.durationMonths === Infinity || asset.depleted === false) {
        durationText = '<span class="duration-indefinite">Indefinite</span>';
      } else if (asset.durationMonths != null) {
        const years = (asset.durationMonths / 12).toFixed(1);
        durationText = `<span class="duration-finite">${asset.durationMonths} months (${years} yrs)</span>`;
      } else {
        durationText = 'N/A';
      }
      return `<div class="asset-projection-summary">${escapeHtml(asset.name)}: ${durationText} (${linkedCount} linked expense${linkedCount !== 1 ? 's' : ''})</div>`;
    })
    .join('');

  return `
        <section class="card">
          <h2>Big Ticket Expenses</h2>
          <form method="POST" action="/big-ticket-expenses">
            <div class="form-row">
              <div class="field">
                <label for="expense-name">Expense Name</label>
                <input id="expense-name" name="name" type="text" placeholder="e.g. New Roof" required />
              </div>
              <div class="field">
                <label for="expense-cost">Estimated Cost</label>
                <input id="expense-cost" name="cost" type="number" step="0.01" min="0" placeholder="0.00" required />
              </div>
              <div class="field">
                <label for="expense-target">Target Date (YYYY-MM)</label>
                <input id="expense-target" name="targetDate" type="month" required />
              </div>
              <div class="field">
                <label for="expense-asset">Fund From Asset</label>
                <select id="expense-asset" name="fundedByAssetId">
                  <option value="">None (save from income)</option>
                  ${assetOptions}
                </select>
              </div>
            </div>
            <button type="submit">Add Big Ticket Expense</button>
          </form>

          <table>
            <thead>
              <tr>
                <th data-sortable>Name</th>
                <th data-sortable>Cost</th>
                <th data-sortable>Target Date</th>
                <th data-sortable>Months Until Due</th>
                <th>Funded By</th>
                <th data-sortable>Monthly Set-Aside</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${expenseRows || '<tr><td colspan="7">No big ticket expenses added yet.</td></tr>'}
            </tbody>
          </table>

          <div class="summary">
            Total Monthly Income: $${totalMonthlyIncome.toFixed(2)}
            <span class="summary-separator">|</span>
            Total Monthly Set-Aside (unfunded expenses): $${totalMonthlySetAside.toFixed(2)}
            <span class="summary-separator">|</span>
            Remaining After Set-Asides: <span class="${remainingAfterSetAsides >= 0 ? 'net-positive' : 'net-negative'}">${remainingAfterSetAsides < 0 ? '-' : ''}$${Math.abs(remainingAfterSetAsides).toFixed(2)}</span>
          </div>

          ${assetSummaries ? `<div class="summary" style="margin-top: 8px;">${assetSummaries}</div>` : ''}
        </section>`;
}

function renderFixedTermExpenseSection(fixedTermExpenses, totalMonthlyFixedTermExpenses) {
  const expenseRows = fixedTermExpenses
    .map(
      (item) => `
      <tr class="${item.matured ? 'matured' : ''}">
        <td>${item.id}</td>
        <td>${escapeHtml(item.name)}</td>
        <td>$${item.monthlyPayment.toFixed(2)}</td>
        <td>${item.startDate}</td>
        <td>${item.totalPayments}</td>
        <td>${item.paymentsMade}</td>
        <td>${item.paymentsRemaining}</td>
        <td>$${item.remainingCost.toFixed(2)}</td>
        <td>${item.matured ? 'Matured' : item.maturityDate}</td>
      </tr>`
    )
    .join('');

  return `
        <section class="card">
          <h2>Fixed-Term Expenses</h2>
          <form method="POST" action="/fixed-term-expenses">
            <div class="form-row">
              <div class="field">
                <label for="expense-name">Name</label>
                <input id="expense-name" name="name" type="text" placeholder="e.g. Car Lease" required />
              </div>
              <div class="field">
                <label for="expense-payment">Monthly Payment</label>
                <input id="expense-payment" name="monthlyPayment" type="number" step="0.01" min="0.01" placeholder="0.00" required />
              </div>
              <div class="field">
                <label for="expense-total">Total Payments</label>
                <input id="expense-total" name="totalPayments" type="number" min="1" step="1" placeholder="36" required />
              </div>
              <div class="field">
                <label for="expense-start">Start Date</label>
                <input id="expense-start" name="startDate" type="month" required />
              </div>
            </div>
            <button type="submit">Add Fixed-Term Expense</button>
          </form>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Monthly Payment</th>
                <th>Start Date</th>
                <th>Total Payments</th>
                <th>Payments Made</th>
                <th>Remaining</th>
                <th>Remaining Cost</th>
                <th>Matures</th>
              </tr>
            </thead>
            <tbody>
              ${expenseRows || '<tr><td colspan="9">No fixed-term expenses added yet.</td></tr>'}
            </tbody>
          </table>
          <div class="summary">Total Active Monthly Expenses: $${totalMonthlyFixedTermExpenses.toFixed(2)}</div>
        </section>`;
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
