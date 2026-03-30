// Client-side table sorting
(function () {
  'use strict';

  function sortTable(table, colIndex, direction) {
    var tbody = table.querySelector('tbody');
    var rows = Array.from(tbody.querySelectorAll('tr'));

    // Check if empty state row
    if (rows.length === 1 && rows[0].querySelectorAll('td').length === 1) {
      return;
    }

    rows.sort(function (a, b) {
      var cellA = a.querySelectorAll('td')[colIndex];
      var cellB = b.querySelectorAll('td')[colIndex];
      if (!cellA || !cellB) return 0;

      var textA = cellA.textContent.trim();
      var textB = cellB.textContent.trim();

      // Strip $ for numeric comparison
      var numA = parseFloat(textA.replace(/^\$/, ''));
      var numB = parseFloat(textB.replace(/^\$/, ''));

      var result;
      if (!isNaN(numA) && !isNaN(numB)) {
        result = numA - numB;
      } else {
        result = textA.localeCompare(textB);
      }

      return direction === 'asc' ? result : -result;
    });

    rows.forEach(function (row) {
      tbody.appendChild(row);
    });
  }

  function initSortableHeaders() {
    var headers = document.querySelectorAll('th[data-sortable]');

    headers.forEach(function (th) {
      // Add initial arrow indicator
      var arrow = document.createElement('span');
      arrow.className = 'sort-arrow';
      arrow.textContent = ' \u2195';
      th.appendChild(arrow);

      th.addEventListener('click', function () {
        var table = th.closest('table');
        var colIndex = Array.from(th.parentNode.children).indexOf(th);
        var currentDir = th.getAttribute('data-sort-dir');
        var newDir = currentDir === 'asc' ? 'desc' : 'asc';

        // Reset all headers in this table
        var allHeaders = table.querySelectorAll('th[data-sortable]');
        allHeaders.forEach(function (h) {
          h.removeAttribute('data-sort-dir');
          h.classList.remove('sort-asc', 'sort-desc');
          var a = h.querySelector('.sort-arrow');
          if (a) a.textContent = ' \u2195';
        });

        // Set active sort
        th.setAttribute('data-sort-dir', newDir);
        th.classList.add(newDir === 'asc' ? 'sort-asc' : 'sort-desc');
        var activeArrow = th.querySelector('.sort-arrow');
        if (activeArrow) {
          activeArrow.textContent = newDir === 'asc' ? ' \u25B2' : ' \u25BC';
        }

        sortTable(table, colIndex, newDir);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSortableHeaders);
  } else {
    initSortableHeaders();
  }
})();
