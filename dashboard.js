// ============================================================
// THE METRO REPORT — Analytics Dashboard
// dashboard.js  |  Assignment 5  |  Spring 2026
// ============================================================
//
// 
// 
//
// HOW THIS FILE IS ORGANISED
// ─────────────────────────────────────────────────────────────
//  STEP 1 — Load the CSV using PapaParse              (given)
//  STEP 2 — Calculate KPIs and inject into HTML       (TODO)
//  STEP 3A — Draw the Bar Chart                       (TODO)
//  STEP 3B — Draw the Pie / Doughnut Chart            (TODO)
//  STEP 3C — Draw the Line Chart (trend over months)  (TODO)
//  STEP 4  — Toggle between Sessions and Revenue      (TODO)
//  STEP 5  — Build the data table + source filter     (TODO)
// ─────────────────────────────────────────────────────────────
//
// COLOUR PALETTE — use these for your charts so they match the UI
const COLORS = {
  Organic:  "#4f86c6",
  Paid:     "#f59e0b",
  Social:   "#10b981",
  Email:    "#8b5cf6",
  Referral: "#ef4444",
};

// Keep chart instances here so we can update them later (STEP 4)
let barChartInstance  = null;
let pieChartInstance  = null;
let lineChartInstance = null;

// The full dataset — filled when CSV loads
let allData = [];

// Track which metric the bar chart is showing (used in STEP 4)
let currentMetric = "sessions";



// ============================================================
// STEP 1: LOAD THE CSV FILE WITH PAPAPARSE
// ============================================================
// PapaParse.parse() reads "data.csv" and converts each row
// into a JavaScript object. This is provided for you — study
// the result so you understand the shape of each row object.
//
// Each row will look like:
// {
//   month: "January",  source: "Organic",
//   sessions: 4850,    revenue: 9200,
//   bounceRate: 41,    conversionRate: 3.4,
//   pageviews: 14200,  newVisitors: 3100
// }
// Note: dynamicTyping: true converts number strings to actual numbers.
// ============================================================

Papa.parse("data.csv", {
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true,

  complete: function (results) {
    allData = results.data;
    console.log("CSV loaded —", allData.length, "rows");
    console.log("First row sample:", allData[0]);

    // ── Once data is ready, run everything ──
    renderKPIs(allData);
    drawBarChart(allData, "sessions");
    drawPieChart(allData);
    drawLineChart(allData);
    buildTable(allData);
    setupToggle();
    setupFilter();
  },

  error: function (err) {
    console.error("CSV load failed:", err);
    alert("Could not load data.csv. Make sure you are running this through a local server (e.g. Live Server in VS Code), not by opening the file directly.");
  }
});



// ============================================================
// STEP 2: CALCULATE KPIs AND INJECT INTO HTML
// ============================================================
// TODO: Complete this function.
//

// Use .reduce() to calculate:
//   - totalSessions     (sum of all sessions)
//   - totalRevenue      (sum of all revenue)
//   - avgBounceRate     (average of all bounceRate values)
//   - avgCVR            (average of all conversionRate values)
//   - totalPageviews    (sum of all pageviews)
//   - totalNewVisitors  (sum of all newVisitors)
//
// Then use document.getElementById("your-id").textContent to
// put each value into the correct KPI card in index.html.
//
// Remember to:
//   - Format numbers with .toLocaleString()    e.g.  19,250
//   - Prefix revenue with "$"                  e.g.  $46,200
//   - Append "%" to rates                      e.g.  3.5%
//   - Round averages to 1 decimal place with .toFixed(1)
// ============================================================

function renderKPIs(rows) {

  // --- Calculate totals and averages ---
  // TODO: replace null with your .reduce() expressions

  const totalSessions = rows.reduce((sum, row) => sum + row.sessions, 0);
  const totalRevenue = rows.reduce((sum, row) => sum + row.revenue, 0);
  const avgBounceRate = rows.reduce((sum, row) => sum + row.bounceRate, 0) / rows.length;
  const avgCVR = rows.reduce((sum, row) => sum + row.conversionRate, 0) / rows.length;
  const totalPageviews = rows.reduce((sum, row) => sum + row.pageviews, 0);
  const totalNewVisitors = rows.reduce((sum, row) => sum + row.newVisitors, 0);

  



  // --- Inject into HTML ---
  // TODO: use document.getElementById("your-id").textContent = ...
  // Match the ids you added to index.html in TASK 2

  document.getElementById("totalSessions").textContent = totalSessions.toLocaleString();
  document.getElementById("totalRevenue").textContent = "$" + totalRevenue.toLocaleString();
  document.getElementById("avgBounceRate").textContent = avgBounceRate.toFixed(1) + "%";
  document.getElementById("avgCVR").textContent = avgCVR.toFixed(1) + "%";
  document.getElementById("totalPageviews").textContent = totalPageviews.toLocaleString();
  document.getElementById("totalNewVisitors").textContent = totalNewVisitors.toLocaleString();

}



// ============================================================
// STEP 3A: BAR CHART — Sessions or Revenue by Source
// ============================================================
// TODO: Complete this function.
//
// The bar chart shows totals grouped by source (Organic, Paid…).
// The `metric` parameter is either "sessions" or "revenue" —
// use it to decide which field to sum when grouping.
//
// HOW TO GROUP:
//   Loop through `rows`. For each row, add row[metric] to
//   groups[row.source]. (You can reuse the groupBySource pattern
//   from the example, but this time make it work for any metric.)
//
// HOW TO BUILD THE CHART:
//   labels  = Object.keys(groups)           e.g. ["Organic", "Paid"...]
//   values  = labels.map(src => groups[src])
//   colors  = labels.map(src => COLORS[src])
//
// If barChartInstance already exists, call .destroy() before
// creating a new one — otherwise Chart.js draws on top of itself.
//
// Chart options to include:
//   responsive: true
//   plugins.legend.display: false
//   plugins.tooltip showing the value formatted with .toLocaleString()
//   scales.y.beginAtZero: true
//   scales.y.ticks.color: "#94a3b8"
//   scales.x.ticks.color: "#94a3b8"
// ============================================================

function drawBarChart(rows, metric) {

  // TODO: group data by source for the chosen metric
  const groups = {};
  rows.forEach(row => {
    if (!groups[row.source]) {
      groups[row.source] = 0;
    }
    groups[row.source] += row[metric];
  });

  // TODO: build labels, values, colors arrays
  const labels = Object.keys(groups);
  const values = labels.map(src => groups[src]);
  const colors = labels.map(src => COLORS[src]);

  // TODO: destroy old chart if it exists
if (barChartInstance) {
  barChartInstance.destroy();
}
  // TODO: create new Chart on canvas id="barChart"
  const ctx = document.getElementById("barChart").getContext("2d");
  barChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: metric === "sessions" ? "Sessions" : "Revenue ($)",
        data: values,
        backgroundColor: colors,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.parsed.y.toLocaleString();
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: "#94a3b8"
          }
        },
        x: {
          ticks: {
            color: "#94a3b8"
          }
        }
      }
    }
  });
}



// ============================================================
// STEP 3B: PIE / DOUGHNUT CHART — Revenue share by source
// ============================================================
// TODO: Complete this function.
//
// This chart always shows total revenue per source as a doughnut.
// Group `rows` by source, summing revenue.
// Use type: "doughnut" (or "pie" — your choice).
//
// Recommended options:
//   plugins.legend.position: "bottom"
//   plugins.legend.labels.color: "#94a3b8"
//   plugins.tooltip showing "$" + value.toLocaleString()
//
// Destroy pieChartInstance before recreating if it exists.
// ============================================================

function drawPieChart(rows) {

  // TODO
  const groups = {};
  rows.forEach(row => {
    if (!groups[row.source]) {
      groups[row.source] = 0;
    }
    groups[row.source] += row.revenue;
  });

  const labels = Object.keys(groups);
  const values = labels.map(src => groups[src]);
  const colors = labels.map(src => COLORS[src]);

  if (pieChartInstance) {
    pieChartInstance.destroy();
  }

  const ctx = document.getElementById("pieChart").getContext("2d");
  pieChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
        label: "Revenue by Source",
        data: values,
        backgroundColor: colors
      }]
    },
    options: {
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#94a3b8"
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return "$" + context.parsed.toLocaleString();
            }
          }
        }
      }
    }
  });
}




// ============================================================
// STEP 3C: LINE CHART — Monthly sessions trend per source
// ============================================================
// TODO: Complete this function.
//
// This is the most complex chart. It shows how sessions changed
// month-by-month, with one LINE per traffic source.
//
// HOW TO STRUCTURE THE DATA:
//   1. Get the unique months IN ORDER:
//      const months = [...new Set(rows.map(r => r.month))];
//      ["January","February","March","April","May","June"]
//
//   2. Get the unique sources:
//      const sources = Object.keys(COLORS);
//
//   3. For each source, build a dataset:
//      {
//        label: "Organic",
//        data: months.map(m => {
//          const match = rows.find(r => r.month === m && r.source === source);
//          return match ? match.sessions : 0;
//        }),
//        borderColor: COLORS[source],
//        backgroundColor: COLORS[source] + "33",  // 33 = 20% opacity hex
//        tension: 0.4,
//        fill: false,
//      }
//
// Chart options:
//   responsive: true
//   scales.y.beginAtZero: true
//   scales.y.ticks.color: "#94a3b8"
//   scales.x.ticks.color: "#94a3b8"
//   plugins.legend.labels.color: "#94a3b8"
// ============================================================

function drawLineChart(rows) {
  // TODO
  const months = [...new Set(rows.map(r => r.month))];
  const sources = Object.keys(COLORS);
  
  const datasets = sources.map(source => ({
    label: source,
    data: months.map(m => {
      const match = rows.find(r => r.month === m && r.source === source);
      return match ? match.sessions : 0;
    }),
    borderColor: COLORS[source],
    backgroundColor: COLORS[source] + "33",
    tension: 0.4,
    fill: false,
  }));

  if (lineChartInstance) {
    lineChartInstance.destroy();
  }

  const ctx = document.getElementById("lineChart").getContext("2d");
  lineChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: months,
      datasets: datasets,
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: "#94a3b8"
          }
        },
        x: {
          ticks: {
            color: "#94a3b8"
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: "#94a3b8"
          }
        }
      }
    }
  });
}



// ============================================================
// STEP 4: TOGGLE — Switch bar chart between Sessions / Revenue
// ============================================================
// TODO: Complete this function.
//
// In index.html TASK 4, you added two buttons:
//   <button id="btn-sessions">Sessions</button>
//   <button id="btn-revenue">Revenue</button>
//
// Here, add click event listeners to each button.
// When clicked:
//   1. Update currentMetric ("sessions" or "revenue")
//   2. Call drawBarChart(allData, currentMetric) to redraw
//   3. Update document.getElementById("bar-chart-title").textContent
//      to say either "Sessions by Traffic Source"
//      or "Revenue by Traffic Source ($)"
//   4. Toggle an "active" CSS class on the buttons so the
//      selected one looks highlighted
// ============================================================

function setupToggle() {


  // TODO]
  document.getElementById("btn-sessions").addEventListener("click", ()=>{
    currentMetric = "sessions";
    drawBarChart(allData, currentMetric);
    document.getElementById("bar-chart-title").textContentv= "Sessions by Traffic Source";
    document.getElementById("btn-sessions").classList.add("active"); 
  })
}



// ============================================================
// STEP 5: DATA TABLE + SOURCE FILTER
// ============================================================
// TODO: Complete both functions below.
//
// buildTable(rows):
//   - Get the <tbody id="tableBody"> element
//   - Loop through `rows`
//   - For each row, create a <tr> with <td> cells for:
//       month, source, sessions (toLocaleString),
//       "$" + revenue (toLocaleString),
//       bounceRate + "%", conversionRate + "%",
//       pageviews (toLocaleString), newVisitors (toLocaleString)
//   - Set tableBody.innerHTML to your built rows
//
// setupFilter():
//   - In index.html TASK 5B, you added a <select id="sourceFilter">
//     with <option> values: "All", "Organic", "Paid", "Social", "Email", "Referral"
//   - Add a "change" event listener to the select
//   - When it changes, filter allData and call buildTable() with filtered rows
//   - If value is "All", pass allData unchanged
// ============================================================

function buildTable(rows) {

  // TODO
 const tablebody = document.getElementById("tableBody");
 let tableHTML = "";
 rows.forEach(row => {
  tableHTML += '<tr>';
  tableHTML += '<td>' + row.month + '<td>';
  tableHTML += '<td>' + row.source + '<td>';
  tableHTML += '<td>' + row.sessions.toLocaleString() + '<td>';
  tableHTML += '<td>$' + row.revenue.toLocaleString() + '<td>';
  tableHTML += '<td>' + row.bounceRate + '%<td>';
  tableHTML += '<td>' + row.conversionRate + '%<td>';
  tableHTML += '<td>' + row.pageviews.toLocaleString() + '<td>';
  tableHTML += '<td>' + row.newVisitors.toLocaleString() + '<td>';
  tableHTML += '</tr>';
 });
 tablebody.innerHTML = tableHTML; 
}

function setupFilter() {

  // TODO
 document.getElementById("sourceFilter").addEventListener("change", (e)=>{
  const value = e.target.value;
  if (value === "All") {
    buildTable(allData);
  } else {
    const filteredData = allData.filter(row => row.source === value);
    buildTable(filteredData);
  }
 });
}

