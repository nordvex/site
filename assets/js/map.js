/* Карта дворов: Leaflet + тёмные тайлы CARTO */
(function () {
  'use strict';

  var data = window.DVOR_DATA ? window.DVOR_DATA.yards : [];
  var listEl = document.getElementById('yard-list');
  var selectEl = document.getElementById('district-filter');
  var freeOnlyEl = document.getElementById('free-only');
  var mapEl = document.getElementById('yard-map');
  if (!listEl) return;

  var map = null;
  var markers = {};
  var activeId = null;
  var state = { district: 'all', freeOnly: false };

  /* ---------- фильтры ---------- */
  var districts = [];
  data.forEach(function (y) {
    if (districts.indexOf(y.district) === -1) districts.push(y.district);
  });
  if (selectEl) {
    districts.forEach(function (d) {
      var o = document.createElement('option');
      o.value = d;
      o.textContent = d;
      selectEl.appendChild(o);
    });
  }

  function filtered() {
    return data.filter(function (y) {
      if (state.district !== 'all' && y.district !== state.district) return false;
      if (state.freeOnly && y.free === 0) return false;
      return true;
    });
  }

  function freeClass(free) {
    if (free === 0) return 'is-none';
    if (free <= 2) return 'is-low';
    return '';
  }

  function pinClass(free) {
    if (free === 0) return 'pin pin--violet';
    if (free <= 2) return 'pin pin--amber';
    return 'pin';
  }

  /* ---------- список ---------- */
  function renderList() {
    listEl.innerHTML = '';
    var items = filtered();

    if (!items.length) {
      var empty = document.createElement('li');
      empty.className = 'map-note';
      empty.textContent = 'Ничего не найдено. Измените фильтры.';
      listEl.appendChild(empty);
      return;
    }

    items.forEach(function (y) {
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'yard' + (y.id === activeId ? ' is-active' : '');
      btn.dataset.id = y.id;

      var freeLabel = y.free === 0 ? 'занято' : y.free + ' из ' + y.total;
      btn.innerHTML =
        '<span class="yard__name">' + y.name + '</span>' +
        '<span class="yard__free ' + freeClass(y.free) + '">' + freeLabel + '</span>' +
        '<span class="yard__meta">' + y.address + ' · ' + y.updated + ' с назад</span>';

      btn.addEventListener('click', function () {
        focusYard(y.id, true);
      });

      li.appendChild(btn);
      listEl.appendChild(li);
    });
  }

  /* ---------- карта ---------- */
  function popupHtml(y) {
    var freeText = y.free === 0
      ? '<span class="popup-free" style="color:#B79CFF">свободных мест нет</span>'
      : '<span class="popup-free">' + y.free + ' из ' + y.total + ' свободно</span>';
    return '<b>' + y.name + '</b>' + freeText +
      '<div class="popup-muted">' + y.address + '<br>обновлено ' + y.updated + ' с назад</div>';
  }

  function initMap() {
    if (typeof L === 'undefined' || !mapEl) {
      if (mapEl) {
        mapEl.innerHTML = '<div style="display:grid;place-items:center;height:100%;padding:24px;text-align:center;color:#9BB0C0;font:14px Manrope,sans-serif">' +
          'Карта недоступна без интернета — список дворов работает.<br>Leaflet не загрузился.</div>';
      }
      return;
    }

    map = L.map(mapEl, {
      center: [55.7515, 37.6120],
      zoom: 12,
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: false
    });

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16
    }).addTo(map);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
      opacity: .9
    }).addTo(map);

    map.on('click', function () { map.scrollWheelZoom.enable(); });
    map.on('mouseout', function () { map.scrollWheelZoom.disable(); });

    data.forEach(function (y) {
      var icon = L.divIcon({
        className: 'pin-wrap',
        html: '<div class="' + pinClass(y.free) + '">' + y.free + '</div>',
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -22]
      });

      var m = L.marker([y.lat, y.lng], { icon: icon, title: y.name })
        .bindPopup(popupHtml(y), { closeButton: true })
        .on('click', function () {
          setActive(y.id, false);
        });

      markers[y.id] = m;
    });

    syncMarkers();
  }

  function syncMarkers() {
    if (!map) return;
    var visible = {};
    filtered().forEach(function (y) { visible[y.id] = true; });

    data.forEach(function (y) {
      var m = markers[y.id];
      if (!m) return;
      if (visible[y.id]) {
        if (!map.hasLayer(m)) m.addTo(map);
      } else if (map.hasLayer(m)) {
        map.removeLayer(m);
      }
    });
  }

  function setActive(id, scroll) {
    activeId = id;
    renderList();
    if (!map) return;
    var y = data.filter(function (x) { return x.id === id; })[0];
    if (!y) return;
    var m = markers[id];
    if (m && map.hasLayer(m)) {
      map.flyTo([y.lat, y.lng], 15, { duration: .7 });
      m.openPopup();
    }
    if (scroll) {
      var el = listEl.querySelector('[data-id="' + id + '"]');
      if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  /* focusYard — вызывается из списка */
  function focusYard(id, fromList) {
    setActive(id, false);
    if (!map) return;
    var y = data.filter(function (x) { return x.id === id; })[0];
    if (!y) return;
    map.flyTo([y.lat, y.lng], 15, { duration: .7 });
    if (markers[id]) markers[id].openPopup();
    if (!fromList) {
      var el = listEl.querySelector('[data-id="' + id + '"]');
      if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  if (selectEl) {
    selectEl.addEventListener('change', function () {
      state.district = this.value;
      renderList();
      syncMarkers();
    });
  }
  if (freeOnlyEl) {
    freeOnlyEl.addEventListener('change', function () {
      state.freeOnly = this.checked;
      renderList();
      syncMarkers();
    });
  }

  renderList();
  initMap();
})();