'use strict';

$(function () {

  const recFrameRates = [120, 60, 30, 24];
  const frameRates = [120, 60, 30, 15, 8, 4, 2, 1];

  function sort(list, descending) {
    return list.sort(function (a, b) { return descending ? b - a : a - b });
  }

  function getQuickMotionRates(recFrameRates, frameRates) {
    const results = [];
    for (const recFrameRate of recFrameRates) {
      for (const frameRate of frameRates) {
        if (recFrameRate >= frameRate) {
          const rate = recFrameRate / frameRate;
          if (!results.includes(rate)) {
            results.push(rate);
          }
        }
      }
    }
    return sort(results, true);
  }

  function getSlowMotionRates(recFrameRates, frameRates) {
    const results = [];
    for (const frameRate of frameRates) {
      for (const recFrameRate of recFrameRates) {
        if (frameRate >= recFrameRate) {
          const rate = frameRate / recFrameRate;
          if (!results.includes(rate)) {
            results.push(rate);
          }
        }
      }
    }
    return sort(results, true);
  }

  function getQuickMotionFrameRates(rate, recFrameRates, frameRates) {
    const results = [];
    for (const recFrameRate of recFrameRates) {
      for (const frameRate of frameRates) {
        if (recFrameRate / frameRate === rate) {
          results.push({
            'recFrameRate': recFrameRate,
            'frameRate': frameRate,
          });
        }
      }
    }
    return results;
  }

  function getSlowMotionFrameRates(rate, recFrameRates, frameRates) {
    const results = [];
    for (const frameRate of frameRates) {
      for (const recFrameRate of recFrameRates) {
        if (frameRate / recFrameRate === rate) {
          results.push({
            'recFrameRate': recFrameRate,
            'frameRate': frameRate,
          });
        }
      }
    }
    return results;
  }

  function generateTableRows(table) {
    let html = '';
    for (const item of table) {
      html += `<tr>
    <td>${item['realTime']}</td>
    <td>${item['rate']}x</td>
    <td>${item['playbackTime']}</td>
    <td>`;
      for (const frameRate of item['frameRates']) {
        html += `${frameRate['recFrameRate']}p / ${frameRate['frameRate']}fps<br>`;
      }
      html += '</td></tr>';
    }
    return html;
  }

  function toMilliseconds(time) {
    const date = new Date(0);
    date.setUTCHours(parseInt($(`.${time}.hours`).val()));
    date.setUTCMinutes(parseInt($(`.${time}.minutes`).val()));
    date.setUTCSeconds(parseInt($(`.${time}.seconds`).val()));
    return date.getTime();
  }

  function toTimeString(milliseconds) {
    const date = new Date(milliseconds);
    return [
      Math.floor(date.getTime() / 3600000).toString().padStart(2, '0'),
      date.getUTCMinutes().toString().padStart(2, '0'),
      date.getUTCSeconds().toString().padStart(2, '0')
    ].join(':');
  }

  function generateQuickMotionTable(quickMotionRates) {
    const time = $('input[name="time"]:checked').val();
    const milliseconds = toMilliseconds(time);
    let realTime = '';
    let playbackTime = '';
    const table = [];
    for (const rate of quickMotionRates) {
      const compatibleFrameRates = getQuickMotionFrameRates(rate, recFrameRates, frameRates);
      if (time === 'realTime') {
        realTime = toTimeString(milliseconds);
        playbackTime = toTimeString(milliseconds / rate);
      }
      else if (time === 'playbackTime') {
        realTime = toTimeString(milliseconds * rate);
        playbackTime = toTimeString(milliseconds);
      }
      table.push({
        realTime: realTime,
        rate: rate,
        playbackTime: playbackTime,
        frameRates: compatibleFrameRates
      });
    }

    let html = generateTableRows(table);
    $('.quickMotion tbody').html(html);

    return html;
  }

  function generateSlowMotionTable(slowMotionRates) {
    const time = $('input[name="time"]:checked').val();
    const milliseconds = toMilliseconds(time);
    let realTime = '';
    let playbackTime = '';
    const table = [];
    for (const rate of slowMotionRates) {
      const compatibleFrameRates = getSlowMotionFrameRates(rate, recFrameRates, frameRates);
      if (time === 'realTime') {
        realTime = toTimeString(milliseconds);
        playbackTime = toTimeString(milliseconds * rate);
      }
      else if (time === 'playbackTime') {
        realTime = toTimeString(milliseconds / rate);
        playbackTime = toTimeString(milliseconds);
      }
      table.push({
        realTime: realTime,
        rate: rate,
        playbackTime: playbackTime,
        frameRates: compatibleFrameRates
      });
    }

    let html = generateTableRows(table);
    $('.slowMotion tbody').html(html);

    return html;
  }

  function init() {
    const quickMotionRates = getQuickMotionRates(recFrameRates, frameRates);
    const slowMotionRates = getSlowMotionRates(recFrameRates, frameRates);

    generateQuickMotionTable(quickMotionRates);
    generateSlowMotionTable(slowMotionRates);

    const table = $('input[name="motion"]:checked').val();
    $('.motions').hide();
    $(`.motions.${table}`).show();
  }

  $('input').on('keydown', function (event) {
    const valid = ['e', '-', '.'];
    if (valid.includes(event.key)) { event.preventDefault(); }
  });

  $('input').on('input change focus click', function (event) {
    if (this.value === '') { this.value = 0; }
    if (this.type === 'number') { this.value = parseInt(this.value); }
    $(this).closest('tr').find('input[type="radio"]').prop('checked', true);
    init();
  });

  init();

});
