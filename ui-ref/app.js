/* ===========================
   MERIDIAN — JavaScript
   =========================== */

(function() {
  'use strict';

  // ————————————————————————
  // DATA
  // ————————————————————————
  const spendingCategories = [
    { name: 'Housing', amount: 2100, color: '#C4704B' },
    { name: 'Food & Dining', amount: 780, color: '#7A8B6F' },
    { name: 'Transportation', amount: 520, color: '#C4A04B' },
    { name: 'Shopping', amount: 440, color: '#8B6F5C' },
    { name: 'Utilities', amount: 280, color: '#A3B398' },
    { name: 'Health', amount: 220, color: '#B85C5C' },
    { name: 'Entertainment', amount: 180, color: '#E8A988' },
    { name: 'Other', amount: 380, color: '#9B9590' },
  ];

  const trendMonths = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
  const trendData = {
    'Housing':        [2100, 2100, 2100, 2100, 2100, 2100],
    'Food & Dining':  [650, 720, 810, 890, 750, 780],
    'Transportation': [480, 510, 490, 560, 530, 520],
  };

  const activityItems = [
    { merchant: 'Whole Foods', amount: 87.32, category: 'Groceries', time: '2 hours ago', color: '#7A8B6F' },
    { merchant: 'Shell Gas', amount: 52.10, category: 'Transportation', time: 'Yesterday', color: '#C4A04B' },
    { merchant: 'Netflix', amount: 17.99, category: 'Subscriptions', time: '2 days ago', color: '#E8A988' },
    { merchant: 'Transfer to Savings', amount: 500.00, category: 'Savings', time: '3 days ago', color: '#A3B398' },
    { merchant: 'Chipotle', amount: 14.25, category: 'Dining', time: '3 days ago', color: '#C4704B' },
    { merchant: 'Amazon', amount: 43.99, category: 'Shopping', time: '4 days ago', color: '#8B6F5C' },
    { merchant: 'Starbucks', amount: 6.75, category: 'Coffee', time: '5 days ago', color: '#C4704B' },
    { merchant: 'Trader Joe\'s', amount: 62.40, category: 'Groceries', time: '5 days ago', color: '#7A8B6F' },
    { merchant: 'Uber', amount: 18.50, category: 'Transportation', time: '6 days ago', color: '#C4A04B' },
    { merchant: 'Target', amount: 34.20, category: 'Shopping', time: '6 days ago', color: '#8B6F5C' },
  ];

  const upcomingBills = [
    { name: 'Rent', amount: 2100, date: 'Feb 27' },
    { name: 'Car Insurance', amount: 145, date: 'Feb 28' },
    { name: 'Spotify', amount: 10.99, date: 'Mar 1' },
    { name: 'Gym', amount: 49.99, date: 'Mar 1' },
  ];

  const commandAnswers = {
    'dining': 'You spent <strong>$780</strong> on Food & Dining this month across 24 transactions. That\'s up 4% from last month ($750). Your most frequent spot is Chipotle with 8 visits.',
    'starbucks': 'You spent <strong>$47.25</strong> on Starbucks this month across 7 visits. That\'s <strong>$6.75 per visit</strong> on average. Down from $52.50 last month.',
    'savings': 'Your savings rate is <strong>28%</strong> this month — you\'re saving $1,820 of your $6,500 income. You\'re on a 12-week streak of saving $500+/week.',
    'subscription': 'Your active subscriptions total <strong>$78.97/month</strong>: Netflix ($17.99), Spotify ($10.99), Gym ($49.99). That\'s $947.64/year.',
    'project': 'Based on your 6-month average, next month\'s projected spending is <strong>$5,340</strong>. Housing ($2,100) and Food ($780) remain your largest categories. Expect a slight increase in Transportation due to rising gas prices.',
    'default': 'I found information about your finances. Try asking about dining, savings rate, subscriptions, or spending projections for specific insights.'
  };

  // ————————————————————————
  // MONEY MAP
  // ————————————————————————
  function buildMoneyMap() {
    const container = document.getElementById('moneyMap');
    if (!container) return;

    const grandTotal = 245000 + 170000 + 98200 + 46000 + 38500 + 22000 + 15200 + 280000 + 12000 + 3400;

    function pct(val) {
      return ((val / grandTotal) * 100).toFixed(1);
    }

    function fmt(val) {
      if (val < 0) return '-$' + Math.abs(val).toLocaleString();
      return '$' + val.toLocaleString();
    }

    // Build a well-proportioned treemap using hard-coded layout
    // Each row groups items of similar scale for clear visibility
    container.innerHTML = `
      <div class="map-row" style="height: 140px;">
        <div class="map-block" style="flex: 59; background: #5E7352; color: #fff;">
          <span class="block-name">401k</span>
          <span class="block-amount">${fmt(245000)}</span>
          <span class="block-pct">${pct(245000)}%</span>
        </div>
        <div class="map-block" style="flex: 41; background: #8B6F5C; color: #fff;">
          <span class="block-name">Home Equity</span>
          <span class="block-amount">${fmt(170000)}</span>
          <span class="block-pct">${pct(170000)}%</span>
        </div>
      </div>
      <div class="map-row" style="height: 90px;">
        <div class="map-block" style="flex: 54; background: #C4704B; color: #fff;">
          <span class="block-name">Brokerage</span>
          <span class="block-amount">${fmt(98200)}</span>
          <span class="block-pct">${pct(98200)}%</span>
        </div>
        <div class="map-block" style="flex: 25; background: #C4A04B; color: #fff;">
          <span class="block-name">Roth IRA</span>
          <span class="block-amount">${fmt(46000)}</span>
          <span class="block-pct">${pct(46000)}%</span>
        </div>
        <div class="map-block" style="flex: 21; background: #A3B398; color: #2C2825;">
          <span class="block-name">High-Yield Savings</span>
          <span class="block-amount">${fmt(38500)}</span>
          <span class="block-pct">${pct(38500)}%</span>
        </div>
      </div>
      <div class="map-row" style="height: 82px;">
        <div class="map-block" style="flex: 59; background: #7A8B6F; color: #fff;">
          <span class="block-name">Emergency Fund</span>
          <span class="block-amount">${fmt(22000)}</span>
          <span class="block-pct">${pct(22000)}%</span>
        </div>
        <div class="map-block" style="flex: 41; background: #E8A988; color: #2C2825;">
          <span class="block-name">Checking</span>
          <span class="block-amount">${fmt(15200)}</span>
          <span class="block-pct">${pct(15200)}%</span>
        </div>
      </div>
      <div class="debt-row-label">Debt</div>
      <div class="map-row" style="height: 80px;">
        <div class="map-block debt-block" style="flex: 60; background: #B85C5C; color: #fff;">
          <span class="block-name">Mortgage</span>
          <span class="block-amount">${fmt(-280000)}</span>
          <span class="block-pct">${pct(280000)}%</span>
        </div>
        <div class="map-block debt-block" style="flex: 22; background: #D49090; color: #fff;">
          <span class="block-name">Student Loans</span>
          <span class="block-amount">${fmt(-12000)}</span>
          <span class="block-pct">${pct(12000)}%</span>
        </div>
        <div class="map-block debt-block" style="flex: 18; background: #C98A8A; color: #fff;">
          <span class="block-name">Credit Cards</span>
          <span class="block-amount">${fmt(-3400)}</span>
          <span class="block-pct">${pct(3400)}%</span>
        </div>
      </div>
    `;
  }

  // ————————————————————————
  // DONUT CHART (Chart.js)
  // ————————————————————————
  function buildDonutChart() {
    const ctx = document.getElementById('donutChart');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: spendingCategories.map(c => c.name),
        datasets: [{
          data: spendingCategories.map(c => c.amount),
          backgroundColor: spendingCategories.map(c => c.color),
          borderWidth: 2,
          borderColor: '#FFFFFF',
          hoverBorderWidth: 3,
          hoverOffset: 6,
        }]
      },
      options: {
        cutout: '68%',
        responsive: false,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#2C2825',
            titleFont: { family: 'Inter', size: 12 },
            bodyFont: { family: 'Inter', size: 12 },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: function(ctx) {
                return ' $' + ctx.raw.toLocaleString();
              }
            }
          }
        },
        animation: {
          animateRotate: true,
          duration: 1200,
          easing: 'easeOutQuart',
        },
        onClick: function(e, elements) {
          if (elements.length > 0) {
            const idx = elements[0].index;
            highlightLegendItem(idx);
          }
        }
      }
    });

    const legendEl = document.getElementById('donutLegend');
    spendingCategories.forEach((cat, i) => {
      const item = document.createElement('div');
      item.className = 'legend-item';
      item.setAttribute('data-index', i);
      item.innerHTML = `
        <span class="legend-dot" style="background: ${cat.color}"></span>
        <span>${cat.name}</span>
        <span class="legend-amount">$${cat.amount.toLocaleString()}</span>
      `;
      item.addEventListener('click', () => {
        highlightLegendItem(i);
        const meta = chart.getDatasetMeta(0);
        meta.data.forEach((arc, j) => {
          if (j === i) {
            arc.options.offset = arc.options.offset === 12 ? 0 : 12;
          } else {
            arc.options.offset = 0;
          }
        });
        chart.update();
      });
      legendEl.appendChild(item);
    });

    function highlightLegendItem(idx) {
      document.querySelectorAll('.legend-item').forEach((el, i) => {
        el.classList.toggle('active', i === idx);
      });
    }
  }

  // ————————————————————————
  // TRENDS LINE CHART
  // ————————————————————————
  function buildTrendsChart() {
    const ctx = document.getElementById('trendsChart');
    if (!ctx) return;

    const colors = ['#C4704B', '#7A8B6F', '#C4A04B'];
    const categories = Object.keys(trendData);

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: trendMonths,
        datasets: categories.map((cat, i) => ({
          label: cat,
          data: trendData[cat],
          borderColor: colors[i],
          backgroundColor: 'transparent',
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: colors[i],
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 6,
          tension: 0.35,
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 20,
              font: { family: 'Inter', size: 11 },
              color: '#6B6560',
            }
          },
          tooltip: {
            backgroundColor: '#2C2825',
            titleFont: { family: 'Inter', size: 12 },
            bodyFont: { family: 'Inter', size: 12 },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: function(ctx) {
                return ' ' + ctx.dataset.label + ': $' + ctx.raw.toLocaleString();
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Inter', size: 11 }, color: '#9B9590' },
            border: { display: false },
          },
          y: {
            grid: { color: '#F3F0EC', drawBorder: false },
            ticks: {
              font: { family: 'Inter', size: 11 },
              color: '#9B9590',
              callback: function(val) { return '$' + val.toLocaleString(); },
              maxTicksLimit: 5,
            },
            border: { display: false },
            beginAtZero: false,
            suggestedMin: 400,
          }
        },
        animation: { duration: 1000, easing: 'easeOutQuart' }
      }
    });
  }

  // ————————————————————————
  // ACTIVITY FEED
  // ————————————————————————
  function buildActivityFeed() {
    const container = document.getElementById('activityFeed');
    if (!container) return;

    activityItems.forEach(item => {
      const el = document.createElement('div');
      el.className = 'activity-item';
      el.innerHTML = `
        <span class="activity-dot" style="background: ${item.color}"></span>
        <div class="activity-info">
          <div class="activity-merchant">${item.merchant}</div>
          <div class="activity-category">${item.category}</div>
        </div>
        <div class="activity-right">
          <div class="activity-amount">$${item.amount.toFixed(2)}</div>
          <div class="activity-time">${item.time}</div>
        </div>
      `;
      container.appendChild(el);
    });
  }

  // ————————————————————————
  // UPCOMING BILLS
  // ————————————————————————
  function buildBillsList() {
    const container = document.getElementById('billsList');
    if (!container) return;

    const calendarSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;

    upcomingBills.forEach(bill => {
      const el = document.createElement('div');
      el.className = 'bill-item';
      const formattedAmount = bill.amount % 1 !== 0
        ? '$' + bill.amount.toFixed(2)
        : '$' + bill.amount.toLocaleString();
      el.innerHTML = `
        <div class="bill-icon">${calendarSvg}</div>
        <div class="bill-info">
          <div class="bill-name">${bill.name}</div>
          <div class="bill-date">${bill.date}</div>
        </div>
        <div class="bill-amount">${formattedAmount}</div>
      `;
      container.appendChild(el);
    });
  }

  // ————————————————————————
  // SAVINGS STREAKS
  // ————————————————————————
  function buildStreakDots() {
    const container = document.getElementById('streakDots');
    if (!container) return;

    for (let i = 0; i < 16; i++) {
      const dot = document.createElement('span');
      dot.className = 'streak-dot' + (i < 12 ? ' filled' : '');
      container.appendChild(dot);
    }
  }

  // ————————————————————————
  // COMMAND BAR
  // ————————————————————————
  function initCommandBar() {
    const trigger = document.getElementById('commandBarTrigger');
    const overlay = document.getElementById('commandModal');
    const input = document.getElementById('commandInput');
    const suggestions = document.getElementById('commandSuggestions');
    const answerEl = document.getElementById('commandAnswer');

    function openModal() {
      overlay.classList.add('open');
      setTimeout(() => input.focus(), 100);
    }

    function closeModal() {
      overlay.classList.remove('open');
      input.value = '';
      suggestions.style.display = '';
      answerEl.style.display = 'none';
    }

    trigger.addEventListener('click', openModal);

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', function(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (overlay.classList.contains('open')) closeModal();
        else openModal();
      }
      if (e.key === 'Escape') closeModal();
    });

    document.querySelectorAll('.suggestion-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const query = this.getAttribute('data-query');
        input.value = query;
        processQuery(query);
      });
    });

    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && input.value.trim()) {
        processQuery(input.value.trim());
      }
    });

    function processQuery(query) {
      const q = query.toLowerCase();
      let answer = commandAnswers['default'];

      if (q.includes('dining') || q.includes('food') || q.includes('restaurant')) {
        answer = commandAnswers['dining'];
      } else if (q.includes('starbucks') || q.includes('coffee')) {
        answer = commandAnswers['starbucks'];
      } else if (q.includes('savings') || q.includes('saving rate')) {
        answer = commandAnswers['savings'];
      } else if (q.includes('subscription') || q.includes('netflix') || q.includes('spotify')) {
        answer = commandAnswers['subscription'];
      } else if (q.includes('project') || q.includes('next month') || q.includes('forecast') || q.includes('spending')) {
        answer = commandAnswers['project'];
      }

      suggestions.style.display = 'none';
      answerEl.style.display = 'block';
      answerEl.innerHTML = `<div class="answer-card">${answer}</div>`;
    }
  }

  // ————————————————————————
  // INIT
  // ————————————————————————
  document.addEventListener('DOMContentLoaded', function() {
    buildMoneyMap();
    buildDonutChart();
    buildTrendsChart();
    buildActivityFeed();
    buildBillsList();
    buildStreakDots();
    initCommandBar();
  });

})();
