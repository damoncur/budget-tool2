function escapeHtml(value) {
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
