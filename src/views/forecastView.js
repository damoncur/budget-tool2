// src/views/forecastView.js

function renderForecastPage(startingBalance, totalMonthlyIncome, totalMonthlyExpenses) {
  const monthlyNet = totalMonthlyIncome - totalMonthlyExpenses;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Budget Manager - Forecast</title>
      <link rel="stylesheet" href="/styles.css" />
    </head>
    <body>
      <nav class="nav-bar">
        <a href="/">Income</a>
        <a href="/expenses">Expenses</a>
        <a href="/assets">Assets</a>
        <a href="/forecast" class="active">Forecast</a>
      </nav>
      <main>
        <h1>Balance Forecast</h1>

        <section class="card">
          <h2>Starting Balance</h2>
          <form method="POST" action="/forecast/starting-balance">
            <div class="form-row">
              <div class="field">
                <label for="startingBalance">Starting Balance ($)</label>
                <input id="startingBalance" name="startingBalance" type="number" step="0.01" min="0" value="${startingBalance.toFixed(2)}" required />
              </div>
            </div>
            <button type="submit">Update Starting Balance</button>
          </form>
        </section>

        <section class="card">
          <h2>Forecast Settings</h2>
          <div class="forecast-controls">
            <div class="field">
              <label for="forecastYears">Forecast Years</label>
              <input id="forecastYears" type="range" min="1" max="10" value="10" />
              <span id="yearsDisplay">10</span>
            </div>
          </div>

          <div class="summary">
            Starting Balance: $${startingBalance.toFixed(2)}
            <span class="summary-separator">|</span>
            Monthly Income: $${totalMonthlyIncome.toFixed(2)}
            <span class="summary-separator">|</span>
            Monthly Expenses: $${totalMonthlyExpenses.toFixed(2)}
            <span class="summary-separator">|</span>
            Monthly Net: <span class="${monthlyNet >= 0 ? 'net-positive' : 'net-negative'}">${monthlyNet < 0 ? '-' : ''}$${Math.abs(monthlyNet).toFixed(2)}</span>
          </div>

          <div id="exhaustionInfo" class="summary" style="margin-top: 8px; display: none;"></div>
        </section>

        <section class="card">
          <h2>Balance Over Time</h2>
          <div class="chart-container">
            <canvas id="forecastChart"></canvas>
          </div>
        </section>
      </main>

      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <script>
        let forecastChart = null;

        function fetchAndRender() {
          const years = document.getElementById('forecastYears').value;
          const startingBalance = ${startingBalance.toFixed(2)};
          fetch('/api/forecast?years=' + years + '&startingBalance=' + startingBalance)
            .then(res => res.json())
            .then(data => renderChart(data))
            .catch(err => console.error('Failed to fetch forecast:', err));
        }

        function renderChart(data) {
          const ctx = document.getElementById('forecastChart').getContext('2d');
          const labels = data.dataPoints.map(dp => dp.yearLabel);
          const balances = data.dataPoints.map(dp => dp.balance);

          // Color each point: green if >= 0, red if < 0
          const pointColors = balances.map(b => b >= 0 ? '#16a34a' : '#dc2626');
          const borderColors = balances.map((b, i) => {
            if (i === 0) return b >= 0 ? '#16a34a' : '#dc2626';
            // Use previous point's color for the segment leading to this point
            return b >= 0 ? '#16a34a' : '#dc2626';
          });

          // Build segment coloring based on balance sign
          const segmentBorderColor = function(ctx) {
            const idx = ctx.p1DataIndex;
            return balances[idx] < 0 ? '#dc2626' : '#2563eb';
          };

          // Show exhaustion info
          const infoEl = document.getElementById('exhaustionInfo');
          if (data.exhaustionMonth !== null) {
            const years = (data.exhaustionMonth / 12).toFixed(1);
            infoEl.innerHTML = '<span class="net-negative">Balance reaches zero at month ' + data.exhaustionMonth + ' (' + years + ' years)</span>';
            infoEl.style.display = 'block';
          } else if (data.monthlyNet >= 0) {
            infoEl.innerHTML = '<span class="net-positive">Balance never reaches zero — income exceeds or equals expenses</span>';
            infoEl.style.display = 'block';
          } else {
            infoEl.style.display = 'none';
          }

          if (forecastChart) {
            forecastChart.destroy();
          }

          // Only show every 12th label (yearly) to keep X-axis clean
          const displayLabels = labels.map((l, i) => i % 12 === 0 ? l : '');

          forecastChart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: displayLabels,
              datasets: [{
                label: 'Projected Balance',
                data: balances,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4,
                fill: false,
                tension: 0,
                segment: {
                  borderColor: segmentBorderColor,
                },
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    title: function(items) {
                      const idx = items[0].dataIndex;
                      return data.dataPoints[idx].yearLabel + ' (Month ' + data.dataPoints[idx].month + ')';
                    },
                    label: function(item) {
                      return 'Balance: $' + item.raw.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    }
                  }
                }
              },
              scales: {
                x: {
                  title: { display: true, text: 'Time' },
                  ticks: {
                    maxTicksLimit: 11,
                    autoSkip: true,
                  }
                },
                y: {
                  title: { display: true, text: 'Balance ($)' },
                  ticks: {
                    callback: function(value) {
                      return '$' + value.toLocaleString();
                    }
                  }
                }
              },
              interaction: {
                intersect: false,
                mode: 'index',
              }
            }
          });

          // Draw zero line annotation if balance crosses zero
          if (data.exhaustionMonth !== null) {
            const zeroLinePlugin = {
              id: 'zeroLine',
              afterDraw: function(chart) {
                const yScale = chart.scales.y;
                const xScale = chart.scales.x;
                const zeroY = yScale.getPixelForValue(0);
                if (zeroY >= yScale.top && zeroY <= yScale.bottom) {
                  const ctx = chart.ctx;
                  ctx.save();
                  ctx.beginPath();
                  ctx.setLineDash([5, 5]);
                  ctx.strokeStyle = '#999';
                  ctx.lineWidth = 1;
                  ctx.moveTo(xScale.left, zeroY);
                  ctx.lineTo(xScale.right, zeroY);
                  ctx.stroke();
                  ctx.restore();
                }
              }
            };
            forecastChart.config.plugins = [zeroLinePlugin];
            forecastChart.update();
          }
        }

        // Event listeners
        const slider = document.getElementById('forecastYears');
        const display = document.getElementById('yearsDisplay');
        slider.addEventListener('input', function() {
          display.textContent = this.value;
          fetchAndRender();
        });

        // Initial render
        fetchAndRender();
      </script>
    </body>
    </html>
  `;
}

module.exports = {
  renderForecastPage,
};
