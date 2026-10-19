/*!
 * MY ERA — 몽콕 · 삼수이포 지도 인포 사이트
 * 지도 위 점 → 탑승권 → 절취선 뜯기 → 창 (성향표 / 페어 / 캐릭터 목록 / 글)
 * 내용은 data.js 에서 고칩니다.
 */
(function () {
  'use strict';

  var D = window.ERA || {};

  /* 편집 모드 (주소에 ?edit): 고치던 내용은 이 브라우저에 임시 저장 */
  var EDIT = /[?&]edit(?:=|&|$)/.test(location.search);
  var DRAFT = 'era-draft:' + location.host + location.pathname;
  var ORIGINAL = JSON.stringify(D);
  if (EDIT) {
    try {
      var draft = JSON.parse(localStorage.getItem(DRAFT) || 'null');
      if (draft && draft.base === ORIGINAL && draft.data) D = draft.data;
    } catch (x) {}
  }
  var site = D.site || {};

  /* ------------------------------------------------------------------
   * 유틸
   * ------------------------------------------------------------------ */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // 직접 쓴 긴 글: HTML은 그대로 두고 줄바꿈만 <br>로
  function rich(s) { return String(s == null ? '' : s).replace(/\[\[(.+?)\]\]/g, '<mark>$1</mark>').replace(/\r?\n/g, '<br>'); }
  /* 편집 모드에서는 글자마다 data.js 의 어느 칸인지 적어 둔다 (평소에는 그냥 글자) */
  function ed(path, v) { return EDIT ? '<span data-k="' + path + '">' + esc(v) + '</span>' : esc(v); }
  function edr(path, v) { return EDIT ? '<span data-k="' + path + '" data-rich>' + rich(v) + '</span>' : rich(v); }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function clamp(v, a, b) { v = parseFloat(v); if (!isFinite(v)) v = a; return Math.max(a, Math.min(b, v)); }
  function px(v) { return v.toFixed(1) + 'px'; }
  function pad3(n) { n = String(n); while (n.length < 3) n = '0' + n; return n; }
  function merge(a, b) {
    var o = {}, k;
    for (k in a || {}) o[k] = a[k];
    for (k in b || {}) o[k] = b[k];
    return o;
  }
  /* 앞에서부터 color 가 있는 것 */
  function colorOf() {
    for (var i = 0; i < arguments.length; i++) if (arguments[i] && arguments[i].color) return arguments[i].color;
    return site.color || '#a7bfe3';
  }
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var PLANE_PATH = 'M22 12c0-.8-.7-1.4-1.6-1.4H15L10.2 3H8l2.6 7.6H5.8L4 8.2H2.4l1.2 3.8-1.2 3.8H4l1.8-2.4h4.8L8 21h2.2l4.8-7.6h5.4c.9 0 1.6-.6 1.6-1.4z';
  function plane() { return '<svg class="plane" viewBox="0 0 24 24" aria-hidden="true"><path d="' + PLANE_PATH + '"/></svg>'; }
  var PERSON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9" r="3.6"/><path d="M5 20c.8-3.6 3.6-5.6 7-5.6s6.2 2 7 5.6"/></svg>';
  var GO = '<svg class="go" viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 6.5 5.5 5.5-5.5 5.5"/></svg>';
  var FLAME = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12.5 2C13.5 5.5 18 8.2 18 13.6A6 6 0 0 1 6 13.6C6 10.6 6.6 8.4 7.6 6.6 8.2 8.8 9.2 10 10.6 10.6 9.8 7.6 10.6 4.6 12.5 2ZM12 19.4a2.6 2.6 0 0 0 2.6-2.6c0-1.6-1.2-2.6-2-3.8-.6 1.4-1.6 2-2.4 2.8a2.6 2.6 0 0 0 1.8 3.6Z"/></svg>';
  var MAP_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4.5 4.5 6v13.5L9 18l6 1.5 4.5-1.5V4.5L15 6 9 4.5ZM9 4.5V18M15 6v13.5"/></svg>';
  // 메뉴 아이콘 (전체 지도와 같은 선 아이콘). 점마다 icon: "me" | "heart" | "link" | "note"
  var ICONS = {
    me: '<path d="M12 12a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2ZM5 19.5c.9-3.4 3.6-5.2 7-5.2s6.1 1.8 7 5.2"/>',
    heart: '<path d="M12 19s-7-4.3-7-9.4A3.9 3.9 0 0 1 12 7.4a3.9 3.9 0 0 1 7 2.2C19 14.7 12 19 12 19Z"/>',
    link: '<path d="M10.2 13.8a3.4 3.4 0 0 0 4.8 0l3-3a3.4 3.4 0 0 0-4.8-4.8l-1 1"/><path d="M13.8 10.2a3.4 3.4 0 0 0-4.8 0l-3 3a3.4 3.4 0 0 0 4.8 4.8l1-1"/>',
    note: '<path d="M6.5 4.5h8l3 3v12h-11z"/><path d="M9 11h6M9 14.5h6"/>'
  };
  function iconOf(p) {
    var k = p.icon || { profile: 'me', pairs: 'heart', captcha: 'link' }[p.type] || 'note';
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[k] || ICONS.note) + '</svg>';
  }
  var EN = { profile: 'PROFILE', pairs: 'PAIRS', chars: 'CHARACTERS', note: 'NOTE', captcha: 'ARE YOU HUMAN?' };

  /* 점 = 창 */
  arr(D.pages).forEach(function (p, i) { if (p) p._k = 'pages.' + i; });
  var pages = arr(D.pages).filter(function (p) { return p && p.type; });
  pages.forEach(function (p, i) { p.id = String(p.id || 'page' + (i + 1)); });
  function pageById(id) {
    for (var i = 0; i < pages.length; i++) if (pages[i].id === id) return pages[i];
    return null;
  }

  var box = $('#box');
  var view = '';          // '' | 'ticket' | 'card' | 'win'

  // 왼쪽 위 지명: site.sub 가 "auto"(또는 비어 있으면) 지금 보고 있는 동네 이름
  var AUTO_SUB = !site.sub || site.sub === 'auto';
  $('#brand-sub').textContent = AUTO_SUB ? '' : site.sub;
  $('.brand').hidden = false;
  if (site.title) document.title = site.title;

  /* ------------------------------------------------------------------
   * 지도 (몽콕 ~ 삼수이포)
   * ------------------------------------------------------------------ */
  var TILES = {
    osm: {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
    },
    esri: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors'
    }
  };
  var tilesPref = TILES[site.tiles] ? site.tiles : 'osm';
  var CENTER = L.latLng(22.3246, 114.1668);   // 프린스 에드워드 (몽콕과 삼수이포 사이)

  var map = L.map('map', {
    center: CENTER,
    zoom: 16,
    minZoom: 14,
    maxZoom: 19,
    zoomControl: false,
    maxBounds: L.latLngBounds([22.296, 114.136], [22.354, 114.199]),
    maxBoundsViscosity: 0.8
  });
  map.attributionControl.setPrefix(false);
  var tiles = L.tileLayer(TILES[tilesPref].url, { maxZoom: 19, attribution: TILES[tilesPref].attribution }).addTo(map);
  var tileErrors = 0, switched = false;
  tiles.on('tileerror', function () {
    if (switched || ++tileErrors < 4) return;
    switched = true;
    var other = tilesPref === 'osm' ? 'esri' : 'osm';
    map.attributionControl.removeAttribution(TILES[tilesPref].attribution);
    map.attributionControl.addAttribution(TILES[other].attribution);
    tilesPref = other;
    tiles.setUrl(TILES[other].url);
  });

  function llOf(p) {
    var a = parseFloat(p && p.lat), b = parseFloat(p && p.lng);
    return isFinite(a) && isFinite(b) ? L.latLng(a, b) : null;
  }
  /* 좌표를 안 적은 점은 몽콕~삼수이포 안에 흩뿌린다 (아이디가 같으면 늘 같은 자리) */
  function scatter(p, taken) {
    var r = rng(p.id), first = null;
    for (var t = 0; t < 60; t++) {
      var ang = r() * Math.PI * 2, dist = 90 + r() * 520;   // 가운데서 90~610m
      var ll = L.latLng(CENTER.lat + Math.sin(ang) * dist / 111000, CENTER.lng + Math.cos(ang) * dist / 102700);
      if (!first) first = ll;
      if (taken.every(function (q) { return q.distanceTo(ll) > 200; })) return ll;
    }
    return first;
  }
  var placed = [];
  pages.forEach(function (p) { p._ll = llOf(p); if (p._ll) placed.push(p._ll); });
  pages.forEach(function (p) { if (!p._ll) { p._ll = scatter(p, placed); placed.push(p._ll); } });

  /* 지금 보고 있는 동네 */
  var PLACES = [
    [22.3193, 114.1694, '旺角', 'Mong Kok'], [22.3245, 114.1683, '太子', 'Prince Edward'],
    [22.3307, 114.1622, '深水埗', 'Sham Shui Po'], [22.3322, 114.1700, '石硤尾', 'Shek Kip Mei'],
    [22.3212, 114.1608, '大角咀', 'Tai Kok Tsui'], [22.3129, 114.1707, '油麻地', 'Yau Ma Tei'],
    [22.3049, 114.1717, '佐敦', 'Jordan'], [22.2988, 114.1722, '尖沙咀', 'Tsim Sha Tsui'],
    [22.3157, 114.1820, '何文田', 'Ho Man Tin'], [22.3245, 114.1790, '嘉道理山', 'Kadoorie Hill'],
    [22.3368, 114.1765, '九龍塘', 'Kowloon Tong'], [22.3365, 114.1565, '長沙灣', 'Cheung Sha Wan'],
    [22.3375, 114.1480, '荔枝角', 'Lai Chi Kok'], [22.3045, 114.1615, '西九龍', 'West Kowloon'],
    [22.3045, 114.1840, '紅磡', 'Hung Hom'], [22.3285, 114.1910, '九龍城', 'Kowloon City']
  ];
  var brandSub = $('#brand-sub');
  function where() {
    var c = map.getCenter(), best = null, bd = Infinity;
    PLACES.forEach(function (q) { var d = c.distanceTo(L.latLng(q[0], q[1])); if (d < bd) { bd = d; best = q; } });
    var t = best && bd < 1600 ? best[2] + '  ' + best[3] + ' · Kowloon' : 'Kowloon, Hong Kong';
    if (brandSub.textContent === t) return;
    brandSub.textContent = t;
    brandSub.classList.remove('is-swap');
    void brandSub.offsetWidth;
    brandSub.classList.add('is-swap');
  }
  if (AUTO_SUB) { map.on('moveend', where); where(); }

  /* 지도 위 점 — 누르면 탑승권 */
  function pw(p) { return Math.round(parseFloat(p.pinWidth) || 36); }
  pages.forEach(function (p, i) {
    var label = p.label || p.id;
    var m = L.marker(p._ll, {
      keyboard: true,
      riseOnHover: true,
      icon: (p.pin || site.pin) ? L.divIcon({
        className: 'spot is-pin',
        html: '<span class="pin" style="--dl:' + (-(i * 0.9)).toFixed(1) + 's"><img src="' + esc(p.pin || site.pin) + '" alt="" draggable="false"></span>',
        iconSize: [pw(p), pw(p)],
        iconAnchor: [pw(p) / 2, pw(p) * 0.9]
      }) : L.divIcon({
        className: 'spot',
        html: '<i style="--c:' + esc(site.dot || colorOf(p)) + '"></i>',
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      })
    }).addTo(map).on('click', function () { openPage(p); })
      .on('mouseover', function () { xpStatus('http://' + DOMAIN + '/#' + p.id); })
      .on('mouseout', function () { xpStatus(); });
    m.getElement().setAttribute('aria-label', label);
  });

  /* 점이 모두 보이게. 위 이름표 · 아래 플레이어에 가리지 않도록 그만큼 비운다 */
  function fitAll(animate) {
    if (!placed.length) return;
    var brand = $('.brand'), pl = $('#player');
    var top = brand.offsetTop + brand.offsetHeight + 28;
    var bottom = (pl.hidden ? 0 : pl.offsetHeight + 16) + 44;
    map.fitBounds(L.latLngBounds(placed), {
      paddingTopLeft: [56, top], paddingBottomRight: [56, bottom], maxZoom: 16, animate: !!animate
    });
  }

  /* 메뉴에서 고르면 그 점으로 날아가서 티켓 */
  function go(p) {
    if (!p) return;
    var done = false;
    function open() { if (!done) { done = true; openPage(p); } }
    var zoom = Math.max(map.getZoom(), 16);
    if (reduced) { map.setView(p._ll, zoom, { animate: false }); open(); return; }
    map.once('moveend', open);
    setTimeout(open, 1100);
    map.flyTo(p._ll, zoom, { duration: 0.8 });
  }

  /* ------------------------------------------------------------------
   * 덮개 · 메뉴
   * ------------------------------------------------------------------ */
  var scrim = $('#scrim');
  function setScrim(mode) {
    scrim.hidden = !mode;
    scrim.classList.toggle('is-dark', mode === 'dark' || mode === 'solid');
    scrim.classList.toggle('is-solid', mode === 'solid');
    scrim.classList.toggle('is-dim', mode === 'dim');
  }

  var menu = $('#menu');
  var menuToggle = $('#menu-toggle');
  var menuList = $('#menu-list');
  menuList.innerHTML = pages.map(function (p, i) {
    return '<button type="button" class="menu-item" data-go="' + esc(p.id) + '" style="--d:' + (i * 0.04).toFixed(2) + 's">' +
      '<span>' + esc(p.label || p.id) + '</span>' + iconOf(p) + '</button>';
  }).join('') +
    '<button type="button" class="menu-item" data-fit style="--d:' + (pages.length * 0.04).toFixed(2) + 's"><span>전체 지도</span>' + MAP_ICON + '</button>';

  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  }
  menuToggle.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menuList.addEventListener('click', function (ev) {
    var b = ev.target.closest('.menu-item');
    if (!b) return;
    setMenu(false);
    if (b.hasAttribute('data-fit')) fitAll(true);
    else go(pageById(b.getAttribute('data-go')));
  });

  /* ------------------------------------------------------------------
   * 체크인 카드 — 페어 점을 누르면 탑승권 대신 뜬다.
   * 카드를 누르면 도장이 쾅 찍히고, 카드가 그대로 펴지면서 페어 창이 된다
   * ------------------------------------------------------------------ */
  var lab = D.label;
  var tag = $('#tag');
  var cardHint = $('#card-hint');
  var cardClose = $('#card-close');
  var tagNo = 0;
  var stamped = false;

  function today() {
    var d = new Date(), M = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return (d.getDate() < 10 ? '0' : '') + d.getDate() + ' ' + M[d.getMonth()] + ' ' + d.getFullYear();
  }
  /* 빨간 고무도장: 두 겹 원 + 둥글게 휜 글씨 + 가운데 날짜.
     오래된 도장처럼: 테두리가 살짝 출렁이고, 가장자리가 거칠고, 하얀 티와 잉크 얼룩이 있다 */
  function stampSvg(top, date) {
    var f = 'font-family="Roboto Condensed,Arial Narrow,sans-serif" font-weight="700" fill="currentColor"';
    return '<svg viewBox="0 0 200 200">' +
      '<defs>' +
        '<filter id="tag-ink" x="-6%" y="-6%" width="112%" height="112%" color-interpolation-filters="sRGB">' +
          '<feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4" result="w"/>' +
          '<feDisplacementMap in="SourceGraphic" in2="w" scale="5" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
          '<feTurbulence type="fractalNoise" baseFrequency=".6" numOctaves="1" seed="8" result="w2"/>' +
          '<feDisplacementMap in="d" in2="w2" scale="1.6" xChannelSelector="R" yChannelSelector="G" result="d2"/>' +
          '<feTurbulence type="fractalNoise" baseFrequency=".42" numOctaves="1" seed="21" result="s"/>' +
          '<feColorMatrix in="s" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -14 9.5" result="sA"/>' +
          '<feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="2" seed="13" result="p"/>' +
          '<feColorMatrix in="p" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.8 1.85" result="pA"/>' +
          '<feComposite in="sA" in2="pA" operator="arithmetic" k1="1" result="mask"/>' +
          '<feComposite in="d2" in2="mask" operator="in"/>' +
        '</filter>' +
        '<path id="tag-arc-t" d="M37 100a63 63 0 0 1 126 0"/>' +
        '<path id="tag-arc-b" d="M24 100a76 76 0 0 0 152 0"/>' +
      '</defs>' +
      '<g filter="url(#tag-ink)">' +
        '<circle cx="100" cy="100" r="93" fill="none" stroke="currentColor" stroke-width="6"/>' +
        '<circle cx="100" cy="100" r="82" fill="none" stroke="currentColor" stroke-width="2"/>' +
        '<text ' + f + ' font-size="19" letter-spacing="2.5"><textPath href="#tag-arc-t" startOffset="50%" text-anchor="middle">' + esc(top) + '</textPath></text>' +
        '<text ' + f + ' font-size="16" letter-spacing="4"><textPath href="#tag-arc-b" startOffset="50%" text-anchor="middle">HONGKONG</textPath></text>' +
        '<path d="M34 82H166M34 120H166" stroke="currentColor" stroke-width="2.5"/>' +
        '<text ' + f + ' x="100" y="110" font-size="25" text-anchor="middle" letter-spacing="1">' + esc(date || today()) + '</text>' +
      '</g></svg>';
  }

  function hasCard(p) { return !!(p && p.card === 'label' && lab && lab.src); }

  /* 점 자리에서 작게 시작해 가운데로 */
  function fromDot(p) {
    var pt = map.latLngToContainerPoint(p._ll), bw = box.clientWidth, bh = box.clientHeight;
    tag.style.setProperty('--rx', (pt.x - bw / 2).toFixed(1) + 'px');
    tag.style.setProperty('--ry', (pt.y - bh / 2).toFixed(1) + 'px');
    tag.style.setProperty('--rs', '0.04');
  }
  function openCard(p) {
    if (view || morphing) return;
    setMenu(false);
    closeWin(true);
    audio();
    var my = ++tagNo;
    cur = p;
    stamped = false;
    view = 'card';
    box.classList.add('is-card');
    xpSync();
    setScrim('dark');
    fromDot(p);
    tag.classList.remove('is-open', 'is-stamped', 'is-press');
    tag.classList.add('no-anim');
    tag.hidden = false;
    void tag.offsetWidth;
    tag.classList.remove('no-anim');
    tag.classList.add('is-open');
    cardClose.hidden = false;
    try { tag.focus({ preventScroll: true }); } catch (x) {}
  }
  function closeCard() {
    if (view !== 'card' || stamped) return;
    var my = ++tagNo;
    view = '';
    setScrim('');
    setTimeout(xpSync, 0);
    box.classList.remove('is-card');
    cardHint.hidden = true;
    cardClose.hidden = true;
    if (cur) fromDot(cur);
    cur = null;
    tag.classList.remove('is-open', 'is-press');
    setTimeout(function () { if (my === tagNo) tag.hidden = true; }, reduced ? 0 : 450);
  }
  /* 카드 누름 → 도장 쾅 → 잠깐 보여 주고 → 페어 창으로 */
  function stampCard() {
    if (view !== 'card' || stamped) return;
    stamped = true;
    var my = tagNo, p = cur;
    cardHint.hidden = true;
    cardClose.hidden = true;
    tag.classList.add('is-stamped');
    setTimeout(function () { if (my === tagNo) thud(0.9); }, reduced ? 0 : 140);
    setTimeout(function () {
      if (my !== tagNo) return;
      var r = tag.getBoundingClientRect();
      morphFrom(r, getComputedStyle($('.tag-in', tag)).borderTopLeftRadius, p, function () {
        tag.hidden = true;
        tag.classList.remove('is-open', 'is-stamped', 'is-press');
        box.classList.remove('is-card');
        stamped = false;
      });
    }, reduced ? 0 : 900);
  }

  if (lab && lab.src) {
    $('.tag-img', tag).src = lab.src;
    if (lab.stamp) $('#tag-stamp').innerHTML = stampSvg(lab.stamp, lab.date);
    tag.addEventListener('pointerdown', function (ev) {
      if (view === 'card' && !stamped && (!ev.button || ev.button === 0)) tag.classList.add('is-press');
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (t) {
      tag.addEventListener(t, function () { tag.classList.remove('is-press'); });
    });
    tag.addEventListener('click', function (ev) {
      if (ev.target.closest('.tag-x')) { closeCard(); return; }   // 창 제목줄의 X
      audio(); stampCard();
    });
    cardHint.addEventListener('click', function () { audio(); stampCard(); });
    cardClose.addEventListener('click', closeCard);
  }

  /* ------------------------------------------------------------------
   * 탑승권
   * ------------------------------------------------------------------ */
  var stage = $('#stage');
  var holder = $('#tk-holder');
  var cur = null;         // 지금 펼친 티켓의 점
  var torn = false;
  var ticketNo = 0;       // 티켓을 새로 열 때마다 +1 (늦게 도착한 타이머 무시용)
  var morphing = false;
  var PULL = 80;          // 이만큼(px) 끌어내리면 뜯긴다

  function endpoint(x) {
    x = x || {};
    return { code: x.code || '', name: x.name || '', en: x.en || '', big: x.big || '', small: x.small || '' };
  }
  /* 출발지 = ticket.from (없으면 passenger = 나), 도착지 = 그 점 */
  function ticketOf(p) {
    var t = p.ticket || {};
    var from = endpoint(merge(site.passenger, t.from));
    var to = endpoint(t.to || { code: p.code || 'HKG', name: p.label || '' });
    var info = arr(t.info).length ? arr(t.info) : [['Passenger', from.name]];
    return {
      from: from,
      to: to,
      flight: t.flight || '',
      badge: t.badge || '',
      strip: arr(t.strip).slice(0, 4),
      info: info.slice(0, 3)
    };
  }

  /* 같은 아이디면 늘 같은 바코드 · 같은 자리 */
  function rng(str) {
    var a = 7;
    str = String(str);
    for (var i = 0; i < str.length; i++) a = Math.imul(a ^ str.charCodeAt(i), 2654435761) + 1 | 0;
    return function () {
      a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function barcode(seed) {
    var r = rng(seed), H = 66, x = 0, end = 0, out = '';
    var bars = [1, 1, 1, 2, 2, 3, 4], gaps = [1, 1, 2, 2, 3];
    for (;;) {
      var w = bars[Math.floor(r() * bars.length)];
      if (x + w > 280) break;
      out += '<rect x="' + x + '" width="' + w + '" height="' + H + '"/>';
      end = x + w;
      x = end + gaps[Math.floor(r() * gaps.length)];
    }
    return '<svg class="tk-bar" viewBox="0 0 ' + end + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true">' + out + '</svg>';
  }

  function endHtml(p, isTo, k) {
    return '<div class="tk-end' + (isTo ? ' is-to' : '') + '">' +
      '<b class="tk-code">' + (ed(k + '.code', p.code) || '&nbsp;') + '</b>' +
      '<span class="tk-place">' + ed(k + '.name', p.name) + (p.en || EDIT ? '<br><em>' + ed(k + '.en', p.en) + '</em>' : '') + '</span>' +
      '<strong class="tk-time">' + ed(k + '.big', p.big) + '</strong>' +
      '<small class="tk-date">' + ed(k + '.small', p.small) + '</small>' +
    '</div>';
  }
  function dl(cls, rows, k) {
    if (!rows.length) return '';
    return '<dl class="' + cls + '">' + rows.map(function (r, i) {
      r = arr(r);
      return '<div><dt>' + ed(k + '.' + i + '.0', r[0]) + '</dt><dd>' + ed(k + '.' + i + '.1', r[1]) + '</dd></div>';
    }).join('') + '</dl>';
  }
  function ticketHtml(p) {
    var t = ticketOf(p), k = p._tk || p._k + '.ticket';
    return '<div class="tk" style="--c:' + esc(colorOf(p)) + '">' +
      '<div class="tk-main">' +
        '<div class="tk-route"><span>From</span><i class="o"></i><i class="d"></i>' + plane() + '<i class="d"></i><i class="o is-fill"></i><span>To</span></div>' +
        '<div class="tk-ends">' +
          endHtml(t.from, false, (p.ticket || {}).from ? k + '.from' : 'site.passenger') +
          '<div class="tk-mid">' +
            (t.flight || EDIT ? '<span class="tk-flight">' + ed(k + '.flight', t.flight) + '</span>' : '') +
            (t.badge ? '<span class="tk-badge">' + ed(k + '.badge', t.badge) + '</span>' : '') +
          '</div>' +
          endHtml(t.to, true, k + '.to') +
        '</div>' +
        dl('tk-strip', t.strip, k + '.strip') +
        dl('tk-info', t.info, k + '.info') +
      '</div>' +
      '<div class="tk-stub" tabindex="0" role="button" aria-label="절취선을 뜯어서 열기">' + barcode(p.id) + '</div>' +
    '</div>';
  }

  /* 지도 점: 체크인 카드가 있으면 카드, 아니면 점에서 창이 바로 펴진다 */
  function openPage(p) {
    if (!p || morphing || view) return;
    if (hasCard(p)) { openCard(p); return; }
    setMenu(false);
    var b = box.getBoundingClientRect(), pt = map.latLngToContainerPoint(p._ll);
    morphFrom({ left: b.left + pt.x - 7, top: b.top + pt.y - 7, width: 14, height: 14 }, '50%', p, function () {});
  }

  /* 오프닝 탑승권: 들어오면 먼저 뜨고, 뜯으면 지도로 */
  var opening = D.opening && D.opening.ticket ? D.opening : null;
  var OPEN_KEY = 'era-boarded:' + location.host;
  function openTicket(p) {
    if (!p || morphing) return;
    setMenu(false);
    closeWin(true);
    ticketNo++;
    cur = p;
    torn = false;
    tearYs = null;
    tearMax = 0;
    holder.innerHTML = ticketHtml(p);
    editable(holder);
    stage.classList.remove('is-leaving', 'is-out');
    stage.hidden = false;
    setScrim('solid');               // 오프닝: 지도는 가리고 탑승권만
    box.classList.add('is-ticket');
    view = 'ticket';
    xpSync();
    fitTicket();
    bindTicket();
  }
  function closeTicket(instant) {
    if (stage.hidden) return;
    ticketNo++;
    cur = null;
    box.classList.remove('is-ticket');
    if (view === 'ticket') { view = ''; setScrim(''); }
    if (instant || reduced) { stage.hidden = true; holder.innerHTML = ''; return; }
    stage.classList.add('is-out');
    var my = ticketNo;
    setTimeout(function () {
      if (my !== ticketNo) return;
      stage.hidden = true;
      stage.classList.remove('is-out');
      holder.innerHTML = '';
    }, 220);
  }

  /* 박스가 작으면 티켓을 줄인다 */
  function fitTicket() {
    if (stage.hidden) return;
    holder.style.setProperty('--s', 1);
    var s = Math.min(1, (stage.clientHeight - 36) / holder.offsetHeight, (stage.clientWidth - 28) / holder.offsetWidth);
    holder.style.setProperty('--s', Math.max(0.5, s).toFixed(3));
  }

  /* 바코드 부분을 잡아끌면 절취선을 따라 왼쪽부터 찢어진다 (그냥 눌러도 뜯긴다) */
  function bindTicket() {
    var tk = $('.tk', holder), stub = $('.tk-stub', holder);
    var drag = null;
    function setP(p) { tk.style.setProperty('--p', p.toFixed(3)); crack(p); }
    holder._setP = setP;

    stub.addEventListener('pointerdown', function (ev) {
      if (torn || (ev.button && ev.button !== 0)) return;
      audio();
      drag = { x: ev.clientX, y: ev.clientY, t: Date.now(), moved: 0 };
      tk.classList.add('is-touched');
      tk.classList.remove('is-snap');
      try { stub.setPointerCapture(ev.pointerId); } catch (x) {}
      ev.preventDefault();
    });
    stub.addEventListener('pointermove', function (ev) {
      if (!drag || torn) return;
      // 아래로 당기거나, 절취선을 따라 오른쪽으로 쭉 그어도 찢어진다
      var dy = ev.clientY - drag.y, dx = ev.clientX - drag.x;
      drag.moved = Math.max(drag.moved, Math.abs(dy), Math.abs(dx));
      var p = clamp(Math.max(dy / PULL, dx / (stub.getBoundingClientRect().width * 0.8)), 0, 1);
      setP(p);
      if (p >= 1) { drag = null; tear(); }
    });
    function release() {
      if (!drag || torn) return;
      var click = drag.moved < 6 && Date.now() - drag.t < 600;
      drag = null;
      if (click) { autoTear(); return; }
      tk.classList.add('is-snap');
      setP(0);
    }
    stub.addEventListener('pointerup', release);
    stub.addEventListener('pointercancel', release);
    stub.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'ArrowDown') { ev.preventDefault(); autoTear(); }
    });
  }

  function autoTear() {
    var tk = $('.tk', holder);
    if (torn || !tk) return;
    audio();
    tk.classList.add('is-touched');
    tk.classList.remove('is-snap');
    if (reduced) { tear(); return; }
    var my = ticketNo, p0 = parseFloat(tk.style.getPropertyValue('--p')) || 0, t0 = performance.now();
    (function step(now) {
      if (torn || my !== ticketNo) return;
      var k = Math.min(1, (now - t0) / 320);
      holder._setP(p0 + (1 - p0) * k * k);
      if (k < 1) requestAnimationFrame(step); else tear();
    })(t0);
  }

  /* 찢긴 가장자리: 절취선 구멍(5px 간격)을 따라 반달 모양으로 뜯기고, 위·아래 조각이 꼭 맞물린다 */
  var tearYs = null, tearMax = 0;
  function perforation(W) {
    var n = Math.round(W / 1.25), ys = [], y = 2.4, first = 16 + 10 + 2.5;   // 첫 구멍 = 홈(16) + 여백(10) + 반 칸
    for (var i = 0; i <= n; i++) {
      var x = W * i / n, m = (((x - first) % 5) + 5) % 5, d = Math.min(m, 5 - m);
      y = clamp(y + (Math.random() - 0.5) * 0.9, 1.4, 3.4);
      ys.push(clamp(y + (d < 1.5 ? (1.5 - d) * 1.2 : 0) + (Math.random() - 0.5) * 0.7, 0.3, 5.4));
    }
    return ys;
  }
  /* p(0~1)만큼 왼쪽부터 찢는다. 찢긴 쪽은 틈이 벌어지고, 점선도 그만큼 사라진다 */
  function crack(p, done) {
    var main = $('.tk-main', holder), stub = $('.tk-stub', holder);
    if (!main || !stub) return;
    tearMax = Math.max(tearMax, p);
    var W = main.offsetWidth, H = main.offsetHeight, cx = done ? W + 1 : tearMax * W;
    if (!tearYs) tearYs = perforation(W);
    var n = tearYs.length - 1, a = ['0 0', W + 'px 0'], b = [];
    for (var j = n; j >= 0; j--) { var x = W * j / n; a.push(px(x) + ' ' + px(x <= cx ? H - tearYs[j] : H)); }
    for (var k = 0; k <= n; k++) {
      var x2 = W * k / n, gap = done ? 0 : Math.min(5, (cx - x2) * 0.035);
      b.push(px(x2) + ' ' + px(x2 <= cx ? 6 - tearYs[k] + gap : 5));
    }
    b.push(W + 'px 100%', '0 100%');
    main.style.clipPath = 'polygon(' + a.join(',') + ')';
    stub.style.clipPath = 'polygon(' + b.join(',') + ')';
    main.style.setProperty('--cut', Math.max(0, cx - 26).toFixed(1) + 'px');
  }

  function tear() {
    var tk = $('.tk', holder);
    if (torn || !tk) return;
    torn = true;
    var main = $('.tk-main', tk), stub = $('.tk-stub', tk);
    var from = getComputedStyle(stub).transform;
    tk.classList.add('is-torn');
    crack(1, true);
    rip();
    if (navigator.vibrate) { try { navigator.vibrate(14); } catch (x) {} }
    stage.classList.add('is-leaving');
    if (stub.animate) {
      stub.animate([
        { transform: from && from !== 'none' ? from : 'none', opacity: 1 },
        { transform: 'translate(-18px, 360px) rotate(-18deg)', opacity: 0 }
      ], { duration: reduced ? 1 : 720, easing: 'cubic-bezier(.5,0,.85,.4)', fill: 'forwards' });
      main.animate([{ transform: 'none' }, { transform: 'translateY(-6px)' }, { transform: 'none' }], { duration: reduced ? 1 : 340, easing: 'ease-out' });
    } else {
      stub.style.visibility = 'hidden';
    }
    var my = ticketNo;
    setTimeout(function () { if (my === ticketNo) arrive(); }, reduced ? 0 : 430);
  }

  /* 뜯고 나면: 남은 티켓이 날아가고, 어둠이 걷히고, 지도가 살짝 다가온다 (착륙) */
  function arrive() {
    var main = $('.tk-main', holder);
    try { sessionStorage.setItem(OPEN_KEY, '1'); } catch (x) {}
    view = '';
    xpSync();
    cur = null;
    if (main && main.animate) {
      main.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(-70px) scale(.94)', opacity: 0 }],
        { duration: reduced ? 1 : 520, easing: 'cubic-bezier(.5,0,.75,0)', fill: 'forwards' });
    }
    scrim.classList.add('is-fading');
    setTimeout(function () {
      stage.hidden = true;
      stage.classList.remove('is-leaving');
      holder.innerHTML = '';
      box.classList.remove('is-ticket');
      if (!view) setScrim('');
      scrim.classList.remove('is-fading');
      fitAll(true);
    }, reduced ? 0 : 560);
  }
  /* 종이(r 자리)가 창 크기로 펴지고, 다 펴지면 창 내용이 올라온다 */
  function morphFrom(r, rad0, p, cleanup) {
    var b = box.getBoundingClientRect();
    showWin({ p: p, kind: 'page' }, { hold: true });
    var w = win.getBoundingClientRect();
    var rad = getComputedStyle(win).borderTopLeftRadius;
    var done = function () {
      morphing = false;
      cleanup();
      win.classList.remove('is-hold');
      enter();
    };
    setScrim('dim');
    if (!box.animate) { done(); return; }
    morphing = true;
    var ghost = document.createElement('div');
    ghost.className = 'ghost';
    box.appendChild(ghost);
    ghost.animate([
      { left: px(r.left - b.left), top: px(r.top - b.top), width: px(r.width), height: px(r.height), borderRadius: rad0, opacity: 0 },
      { offset: 0.2, opacity: 1 },
      { left: px(w.left - b.left), top: px(w.top - b.top), width: px(w.width), height: px(w.height), borderRadius: rad, opacity: 1 }
    ], { duration: reduced ? 1 : 560, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' }).onfinish = function () {
      done();
      setTimeout(function () { ghost.remove(); }, 120);
    };
  }

  /* 종이 찢는 소리 (파일 없이 만든다) */
  var actx = null;
  function audio() {
    if (site.sound === false) return;
    try {
      if (!actx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        actx = new AC();
      }
      if (actx.state === 'suspended') actx.resume();
    } catch (x) { actx = null; }
  }
  function rip() {
    if (!actx || site.sound === false) return;
    try {
      var ctx = actx, dur = 0.34, n = Math.floor(ctx.sampleRate * dur);
      var buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < n; i++) {
        var grain = Math.random() < 0.015 ? 1 : 0.3 + 0.4 * Math.random();   // 섬유가 툭툭 끊기는 느낌
        d[i] = (Math.random() * 2 - 1) * grain * Math.pow(1 - i / n, 1.6);
      }
      var src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain(), now = ctx.currentTime;
      src.buffer = buf;
      bp.type = 'bandpass';
      bp.Q.value = 0.9;
      bp.frequency.setValueAtTime(1500, now);
      bp.frequency.exponentialRampToValueAtTime(4200, now + dur);
      g.gain.value = 0.5;
      src.connect(bp);
      bp.connect(g);
      g.connect(ctx.destination);
      src.start(now);
    } catch (x) {}
  }

  /* 탁 — 도장 · 스티커 붙는 소리 */
  function thud(vol) {
    if (!actx || site.sound === false) return;
    try {
      var ctx = actx, now = ctx.currentTime;
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(150, now);
      o.frequency.exponentialRampToValueAtTime(48, now + 0.16);
      g.gain.setValueAtTime(vol, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(now);
      o.stop(now + 0.24);
      // 종이에 닿는 짧은 탁
      var n = Math.floor(ctx.sampleRate * 0.04), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
      var src = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g2 = ctx.createGain();
      src.buffer = buf;
      hp.type = 'highpass';
      hp.frequency.value = 900;
      g2.gain.value = vol * 0.5;
      src.connect(hp);
      hp.connect(g2);
      g2.connect(ctx.destination);
      src.start(now);
    } catch (x) {}
  }

  /* ------------------------------------------------------------------
   * 창 — 그리는 부품
   * ------------------------------------------------------------------ */
  /* 칸 제목은 한 줄로만 (영문 작은 글씨) */
  function sec(en, ko, inner) {
    return '<section class="sec"><h3 class="sec-t">' + esc(en) + '</h3>' + inner + '</section>';
  }
  function photo(d) {
    d = d || {};
    return '<span class="photo">' + (d.photo ? '<img src="' + esc(d.photo) + '" alt="" loading="lazy">' : PERSON) + '</span>';
  }
  function chips(list, plain, k) {
    list = arr(list);
    if (!list.filter(Boolean).length) return '';
    return '<div class="chips' + (plain ? ' is-plain' : '') + '">' + list.map(function (c, i) {
      return c ? '<span class="chip">' + (k ? ed(k + '.' + i, String(c).replace(/^#/, '')) : esc(String(c).replace(/^#/, ''))) + '</span>' : '';
    }).join('') + '</div>';
  }
  function songBtn(song) {
    if (!song || !song.id) return '';
    return '<button type="button" class="song" data-song="' + esc(song.id) + '" data-title="' + esc(song.title || '') + '">' +
      '<i><svg class="i-play" viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z"/></svg>' +
      '<svg class="i-pause" viewBox="0 0 24 24"><path d="M8.5 6v12M15.5 6v12"/></svg></i>' +
      '<span>' + esc(song.title || '테마곡') + '</span><span class="eq" aria-hidden="true"><b></b><b></b><b></b></span></button>';
  }
  function heatHtml(v) {
    if (v == null || v === '') return '';
    var n = clamp(v, 0, 5), h = '';
    for (var i = 1; i <= 5; i++) h += '<i' + (i <= n ? ' class="is-on"' : '') + '>' + FLAME + '</i>';
    return '<span class="heat" role="img" aria-label="버닝 ' + n + ' / 5">' + h + '</span>';
  }
  /* toggle: 제목을 누르면 펼쳐지는 칸 (성향표) */
  function notesHtml(list, k, toggle) {
    return arr(list).map(function (n, i) {
      n = arr(n);
      if (toggle) return '<details class="tg"' + (EDIT ? ' open' : '') + '><summary><em>' + esc(n[2] || '') + '</em><span>' + ed(k + '.' + i + '.0', n[0] || '') + '</span><i aria-hidden="true"></i></summary>' +
        '<div class="tg-in"><div class="prose">' + edr(k + '.' + i + '.1', n[1]) + '</div></div></details>';
      return '<section class="sec"><h3 class="sec-t">' + ed(k + '.' + i + '.0', n[0] || n[2] || 'NOTE') + '</h3>' +
        '<div class="prose">' + edr(k + '.' + i + '.1', n[1]) + '</div></section>';
    }).join('');
  }
  function headHtml(p, n) {
    return '<div class="page-head">' +
      '<span class="page-en">' + (p.en ? ed(p._k + '.en', p.en) : esc(EN[p.type] || '')) + (n ? ' · ' + pad3(n) : '') + '</span>' +
      '<h2 class="sr" id="win-title">' + esc(p.label || '') + '</h2>' +
    '</div>';
  }

  /* 성향 슬라이더: [왼쪽, 오른쪽, 0~100] */
  function traitsHtml(list, k) {
    return '<div class="traits">' + arr(list).map(function (t, i) {
      t = arr(t);
      var v = clamp(t[2] == null ? 50 : t[2], 0, 100);
      return '<div class="trait' + (v < 50 ? ' is-l' : v > 50 ? ' is-r' : '') + '" data-v="' + v + '">' +
        '<span class="trait-l">' + ed(k + '.' + i + '.0', t[0]) + '</span>' +
        '<span class="trait-bar" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + v + '" aria-label="' + esc(t[0] + ' – ' + t[1]) + '">' +
          '<i class="trait-fill" style="left:50%;width:0"></i><i class="trait-knob" style="left:50%"></i></span>' +
        '<span class="trait-r">' + ed(k + '.' + i + '.1', t[1]) + '</span></div>';
    }).join('') + '</div>';
  }

  /* 호불호: [항목, "O" / "△" / "X"] */
  function checksHtml(list, k) {
    return '<div class="checks">' + arr(list).map(function (c, i) {
      c = arr(c);
      var m = String(c[1] == null ? '' : c[1]).trim(), k = m.toLowerCase(), cls = '';
      if (/^(o|○|◯|yes|가능)$/.test(k)) { cls = ' is-o'; m = 'O'; }
      else if (/^(△|세모|~|\?|애매)$/.test(k)) { cls = ' is-t'; m = '△'; }
      else if (/^(x|✕|×|no|불가)$/.test(k)) { cls = ' is-x'; m = 'X'; }
      return '<div class="check' + cls + '"><span>' + ed(k + '.' + i + '.0', c[0]) + '</span><b>' + ed(k + '.' + i + '.1', m) + '</b></div>';
    }).join('') + '</div>';
  }

  /* 성향표: 질서-중립-혼돈 × 선-중립-악 */
  var ALIGN = [
    ['LG', '질서 선'], ['NG', '중립 선'], ['CG', '혼돈 선'],
    ['LN', '질서 중립'], ['N', '중립'], ['CN', '혼돈 중립'],
    ['LE', '질서 악'], ['NE', '중립 악'], ['CE', '혼돈 악']
  ];
  var ALIGN_NAMES = {
    '질서선': 'LG', '중립선': 'NG', '혼돈선': 'CG', '질서중립': 'LN', '중립': 'N', '순수중립': 'N', '진중립': 'N',
    '혼돈중립': 'CN', '질서악': 'LE', '중립악': 'NE', '혼돈악': 'CE',
    lawfulgood: 'LG', neutralgood: 'NG', chaoticgood: 'CG', lawfulneutral: 'LN', neutral: 'N', trueneutral: 'N',
    chaoticneutral: 'CN', lawfulevil: 'LE', neutralevil: 'NE', chaoticevil: 'CE', tn: 'N'
  };
  function alignHtml(v) {
    var key = String(v).toLowerCase().replace(/[\s_\-·]/g, '');
    var on = ALIGN_NAMES[key] || key.toUpperCase();
    if (!ALIGN.some(function (a) { return a[0] === on; })) return chips([v], true);
    return '<div class="align">' + ALIGN.map(function (a) {
      return '<div' + (a[0] === on ? ' class="is-on"' : '') + '><small>' + a[0] + '</small>' + a[1] + '</div>';
    }).join('') + '</div>';
  }

  /* 능력치: [이름, 0~5] */
  function statsHtml(list, k) {
    return '<div class="stats">' + arr(list).map(function (s, i) {
      s = arr(s);
      var v = clamp(s[1], 0, 5), dots = '';
      for (var i = 1; i <= 5; i++) dots += '<i' + (i <= v ? ' class="is-on"' : '') + '></i>';
      return '<div class="stat"><span class="stat-n">' + ed(k + '.' + i + '.0', s[0]) + '</span><span class="stat-v" role="img" aria-label="' + v + ' / 5">' + dots + '</span></div>';
    }).join('') + '</div>';
  }

  /* ------------------------------------------------------------------
   * 창 — 종류별
   * ------------------------------------------------------------------ */
  /* 성향표 (내 성향표 · 캐릭터 자세히 보기 공통) */
  function sheetHtml(d, o) {
    o = o || {};
    var k = o.k;
    // 이름도 사진도 없는 성향표는 큰 프로필 없이 제목만
    if (!o.char && !d.name && !d.photo) return headHtml(d) + chips(d.keywords, false, k + '.keywords') + songBtn(d.song) + sheetRest(d, k);
    var h = '<div class="hero">' + photo(d) +
      '<div class="hero-txt">' +
        (d.head && !o.char ? '<span class="hero-code">' + ed(k + '.head', d.head) + '</span>' : o.tag ? '<span class="hero-code">' + esc(o.tag) + '</span>' : '') +
        '<h2 class="hero-name" id="win-title">' + (d.link && !EDIT ? '<a href="' + esc(d.link) + '" target="_blank" rel="noopener">' + esc(d.name || '') + '</a>' : ed(k + '.name', d.name || '')) + '</h2>' +
        (d.en || EDIT ? '<span class="hero-en">' + ed(k + '.en', d.en) + '</span>' : '') +
        (o.char && (d.work || EDIT) ? '<span class="hero-work">' + ed(k + '.work', d.work) + '</span>' : '') +
        (o.char ? heatHtml(d.heat) : '') +
        (d.quote || EDIT ? '<p class="hero-quote">“' + ed(k + '.quote', d.quote) + '”</p>' : '') +
        (!o.char && d.intro ? '<p class="hero-intro">' + edr(k + '.intro', d.intro) + '</p>' : '') +
        (o.char && (d.note || EDIT) ? '<p class="hero-note">' + ed(k + '.note', d.note) + '</p>' : '') +
        chips(d.keywords, false, k + '.keywords') + songBtn(d.song) +
      '</div></div>';
    return h + sheetRest(d, k);
  }
  function sheetRest(d, k) {
    var h = '';
    if (arr(d.basics).length) {
      h += sec('BASIC', '기본 정보', '<dl class="facts">' + arr(d.basics).map(function (r, i) {
        r = arr(r);
        return '<div><dt>' + ed(k + '.basics.' + i + '.0', r[0]) + '</dt><dd>' + ed(k + '.basics.' + i + '.1', r[1]) + '</dd></div>';
      }).join('') + '</dl>');
    }
    if (arr(d.traits).length) h += sec('TRAITS', '성향', traitsHtml(d.traits, k + '.traits'));
    if (arr(d.checks).length) h += sec('CHECK', '호불호', checksHtml(d.checks, k + '.checks'));
    if (d.alignment) h += sec('ALIGNMENT', '성향표', alignHtml(d.alignment));
    if (arr(d.stats).length) h += sec('STATS', '능력치', statsHtml(d.stats, k + '.stats'));
    var likes = arr(d.likes), dislikes = arr(d.dislikes);
    if (likes.length || dislikes.length) {
      h += '<div class="sec-row">' +
        (likes.length ? sec('LIKE', '좋아하는 것', chips(likes, true, k + '.likes')) : '') +
        (dislikes.length ? sec('DISLIKE', '싫어하는 것', chips(dislikes, true, k + '.dislikes')) : '') +
      '</div>';
    }
    if (d.about || EDIT) h += sec('ABOUT', '소개', '<div class="prose">' + edr(k + '.about', d.about) + '</div>');
    h += notesHtml(d.notes, k + '.notes', d.type === 'profile');
    return h;
  }

  /* 페어 목록 */
  function pairsHtml(p) {
    var list = arr(p.pairs);
    if (!list.length) return headHtml(p) + '<div class="empty">아직 없어요</div>';
    return headHtml(p, list.length) + '<div class="pcs">' + list.map(function (q, i) {
      q = q || {};
      var a = q.a || {}, b = q.b || {}, k = p._k + '.pairs.' + i;
      return '<div role="button" tabindex="0" class="pc" data-pair="' + i + '" style="--c:' + esc(colorOf(q, p)) + '">' +
        '<span class="pc-photos">' + photo(a) + photo(b) + '</span>' +
        '<span class="pc-body">' +
          '<span class="pc-route"><b>' + esc(a.code || a.name || '') + '</b>' + plane() + '<b>' + esc(b.code || b.name || '') + '</b>' +
            (q.badge ? '<span class="tk-badge">' + ed(k + '.badge', q.badge) + '</span>' : '') + '</span>' +
          '<strong class="pc-title">' + ed(k + '.title', q.title || '') + '</strong>' +
          '<span class="pc-sub">' + esc([q.work, [a.name, b.name].filter(Boolean).join(' × ')].filter(Boolean).join(' · ')) + '</span>' +
          (q.tagline || EDIT ? '<span class="pc-tag">' + ed(k + '.tagline', q.tagline) + '</span>' : '') +
        '</span>' +
        (q.badge ? '<span class="tk-badge">' + ed(k + '.badge', q.badge) + '</span>' : '') +
        GO + '</div>';
    }).join('') + '</div>';
  }

  /* 페어 자세히 */
  function whoHtml(x, k, w) {
    x = x || {};
    var pic = x.photo ? photo(x) : '';
    if (pic && w && x.about && !EDIT) pic = '<button type="button" class="who-pic" data-who="' + w + '" aria-expanded="false">' + pic + '<span class="who-tap">PROFILE <b>+</b></span></button>';
    return '<div class="who">' + pic +
      (x.code || EDIT ? '<span class="who-code">' + ed(k + '.code', x.code) + '</span>' : '') +
      '<span class="who-name">' + ed(k + '.name', x.name || '') + '</span>' +
      (arr(x.tags).length ? '<ul class="wt">' + arr(x.tags).map(function (t, j) { return '<li><i></i><span>' + ed(k + '.tags.' + j, t) + '</span></li>'; }).join('') + '</ul>' : '') +
    '</div>';
  }
  function pairHtml(q, k) {
    q = q || {};
    var a = q.a || {}, b = q.b || {}, h = '';
    function who(k) { return k === 'a' ? a.name || '' : k === 'b' ? b.name || '' : k || ''; }
    h += '<div class="duo-title"><h2 id="win-title">' + ed(k + '.title', q.title || '') + '</h2>' +
      (q.work || EDIT ? '<span class="duo-work">' + ed(k + '.work', q.work) + '</span>' : '') +
      (q.tagline || EDIT ? '<p>' + ed(k + '.tagline', q.tagline) + '</p>' : '') + chips(q.keywords, false, k + '.keywords') + songBtn(q.song) + '</div>';
    h += '<div class="duo">' + whoHtml(a, k + '.a', 'a') +
      '<div class="duo-mid">' +
        (q.flight || EDIT ? '<span class="duo-flight">' + ed(k + '.flight', q.flight) + '</span>' : '') +
        '<span class="duo-line"><i class="o"></i><i class="d"></i>' + plane() + '<i class="d"></i><i class="o is-fill"></i></span>' +
        (q.badge ? '<span class="tk-badge">' + ed(k + '.badge', q.badge) + '</span>' : '') +
      '</div>' + whoHtml(b, k + '.b', 'b') + '</div>';
    // 두 사람 소개글: 이름 바로 아래 양쪽 단
    // 사진을 누르면 아래로 펼쳐진다 (토글)
    if (a.about || b.about || EDIT) {
      h += '<div class="dp-wrap' + (EDIT ? ' is-open is-edit' : '') + '" data-on=""><div class="dp-in">' + ['a', 'b'].map(function (w) {
        var x = w === 'a' ? a : b;
        return '<div class="dp is-' + w + '"><span class="dp-n">' + esc(x.code || x.name || '') + '<small>' + esc(x.name || '') + '</small></span><p>' + edr(k + '.' + w + '.about', x.about) + '</p></div>';
      }).join('') + '</div></div>';
    }

    var views = arr(q.views);
    if (views.length) {
      h += sec('TO EACH OTHER', '서로에게', '<div class="views">' + views.map(function (v, i) {
        v = v || {};
        var other = v.who === 'a' ? 'b' : v.who === 'b' ? 'a' : '';
        return '<article class="view"><div class="view-h"><b>' + esc(who(v.who)) + '</b>' + plane() +
          (other ? '<b>' + esc(who(other)) + '</b>' : '') + '</div>' +
          (v.call || EDIT ? '<p class="view-call">“' + ed(k + '.views.' + i + '.call', v.call) + '”</p>' : '') +
          (v.text || EDIT ? '<p class="view-text">' + edr(k + '.views.' + i + '.text', v.text) + '</p>' : '') + '</article>';
      }).join('') + '</div>');
    }
    var meters = arr(q.meters);
    if (meters.length) {
      h += sec('METER', '관계 수치', '<div class="meters">' + meters.map(function (m, i) {
        m = arr(m);
        var v = clamp(m[1], 0, 100);
        return '<div class="meter" data-v="' + v + '"><span class="meter-n">' + ed(k + '.meters.' + i + '.0', m[0]) + '</span>' +
          '<span class="meter-bar"><i style="width:0"></i></span><span class="meter-v">' + Math.round(v) + '</span></div>';
      }).join('') + '</div>');
    }
    var tl = arr(q.timeline);
    if (tl.length) {
      h += sec('TIMELINE', '연표', '<ol class="tl">' + tl.map(function (r, i) {
        r = arr(r);
        return '<li><time>' + ed(k + '.timeline.' + i + '.0', r[0]) + '</time><p>' + edr(k + '.timeline.' + i + '.1', r[1]) + '</p></li>';
      }).join('') + '</ol>');
    }
    var qs = arr(q.quotes);
    if (qs.length) {
      h += '<div class="quotes chat' + (EDIT || reduced ? ' is-shown' : '') + '">' + qs.map(function (x, i) {
        x = arr(x);
        return '<blockquote class="quote is-' + (x[0] === 'b' ? 'b' : 'a') + '"><cite>' + esc(who(x[0])) + '</cite>' +
          '<p><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="say">' + edr(k + '.quotes.' + i + '.1', x[1]) + '</span></p></blockquote>';
      }).join('') + '</div>';
    }
    var story = arr(q.story);
    if (story.length) {
      h += sec('STORY', '', (q.storyTitle ? '<h4 class="story-t">' + esc(q.storyTitle) + '</h4>' : '') + '<ol class="story">' + story.map(function (c, i) {
        c = c || {};
        var kk = k + '.story.' + i;
        return '<li class="ch"><span class="ch-n">' + ('0' + (i + 1)).slice(-2) + '</span><div class="ch-b">' +
          (c.when || EDIT ? '<small class="ch-when">' + ed(kk + '.when', c.when) + '</small>' : '') +
          '<h4 class="ch-t">' + ed(kk + '.title', c.title || '') + '</h4>' +
          (c.text || EDIT ? '<p class="ch-text">' + edr(kk + '.text', c.text) + '</p>' : '') +
          arr(c.notes).map(function (n, j) {
            n = arr(n);
            return '<div class="ch-note"><b>' + ed(kk + '.notes.' + j + '.0', n[0] || '') + '</b><p>' + edr(kk + '.notes.' + j + '.1', n[1]) + '</p></div>';
          }).join('') +
        '</div></li>';
      }).join('') + '</ol>');
    }
    if (q.about || EDIT) h += sec('ABOUT', '소개', '<div class="prose">' + edr(k + '.about', q.about) + '</div>');
    h += notesHtml(q.notes, k + '.notes');
    return h;
  }

  /* 캐릭터 목록 (증명사진 카드) */
  var MORE = ['quote', 'about', 'basics', 'traits', 'checks', 'alignment', 'stats', 'likes', 'dislikes', 'notes', 'song'];
  function hasMore(c) {
    return MORE.some(function (k) { var v = c[k]; return Array.isArray(v) ? v.length : !!v; });
  }
  function charsHtml(p) {
    var list = arr(p.chars), label = p.en || EN.chars;
    if (!list.length) return headHtml(p) + '<div class="empty">아직 없어요</div>';
    return headHtml(p, list.length) + '<div class="ids">' + list.map(function (c, i) {
      c = c || {};
      var more = hasMore(c), k = p._k + '.chars.' + i;
      return '<div' + (more ? ' role="button" tabindex="0" data-char="' + i + '"' : '') + ' class="idc' + (more ? ' is-more' : '') + '" style="--c:' + esc(colorOf(c, p)) + '">' +
        '<span class="idc-top"><span>' + esc(label) + '</span><span>No. ' + pad3(i + 1) + '</span><i class="idc-hole"></i></span>' +
        '<span class="idc-main">' + photo(c) +
          '<span class="idc-info">' +
            '<span class="idc-label">NAME</span>' +
            '<strong class="idc-name">' + ed(k + '.name', c.name || '') + '</strong>' +
            (c.work || EDIT ? '<span class="idc-work">' + ed(k + '.work', c.work) + '</span>' : c.en ? '<span class="idc-work">' + esc(c.en) + '</span>' : '') +
            heatHtml(c.heat) +
            (c.note || EDIT ? '<span class="idc-note">' + ed(k + '.note', c.note) + '</span>' : '') +
            '<span class="idc-foot"><i class="idc-bar"></i><em>' + (c.since || EDIT ? 'since ' + ed(k + '.since', c.since) : '') + '</em></span>' +
          '</span>' +
        '</span></div>';
    }).join('') + '</div>';
  }

  /* 글 */
  function noteHtml(p) {
    return headHtml(p) + (p.text || EDIT ? '<div class="prose">' + edr(p._k + '.text', p.text) + '</div>' : '') + notesHtml(p.notes, p._k + '.notes');
  }

  /* ------------------------------------------------------------------
   * 창 — 열고 닫기
   *   v = { p: 점, kind: 'page' | 'pair' | 'char', i: 몇 번째 }
   * ------------------------------------------------------------------ */
  var win = $('#win');
  var winBody = $('#win-body');
  var winRoute = $('#win-route');
  var winBack = $('#win-back');
  var winCur = null;
  var stack = [];         // 창 안에서 옮겨 다닌 기록 (뒤로가기)

  function itemOf(v) {
    return v.kind === 'pair' ? arr(v.p.pairs)[v.i] || {} : v.kind === 'char' ? arr(v.p.chars)[v.i] || {} : null;
  }
  function routeHtml(v) {
    var t = ticketOf(v.p), from = t.from, to = t.to, item = itemOf(v);
    if (v.kind === 'pair') { from = item.a || {}; to = item.b || {}; }
    if (v.kind === 'char') to = item;
    return '<small>FROM</small><i class="o"></i><b>' + esc(from.code || from.name || '') + '</b><i class="d"></i>' + plane() +
      '<i class="d"></i><b>' + esc(to.code || to.name || '') + '</b><i class="o is-fill"></i><small>TO</small>';
  }
  /* 창 제목줄에 보이는 파일 이름 (점마다 file: "..." 로 바꿀 수 있어요) */
  function fileName(v) {
    var it = itemOf(v);
    if (it) return it.file || (it.title || it.name || 'untitled') + '.png';
    return v.p.file || { profile: 'me.txt', pairs: 'pairs', captcha: 'link' }[v.p.type] || (v.p.label || v.p.id) + '.txt';
  }
  function bodyHtml(v) {
    var p = v.p;
    if (v.kind === 'pair') return pairHtml(itemOf(v), p._k + '.pairs.' + v.i);
    if (v.kind === 'char') return sheetHtml(itemOf(v), { char: true, k: p._k + '.chars.' + v.i, tag: (p.en || EN.chars) + ' · No. ' + pad3(v.i + 1) });
    if (p.type === 'profile') return sheetHtml(p, { k: p._k, tag: p.head || ticketOf(p).from.code + ' · PASSENGER' });
    if (p.type === 'pairs') return pairsHtml(p);
    if (p.type === 'chars') return charsHtml(p);
    if (p.type === 'captcha') return capHtml(p);
    return noteHtml(p);
  }

  function showWin(v, opts) {
    opts = opts || {};
    if (opts.push && winCur) stack.push(winCur);
    else if (!opts.back) stack = [];
    winCur = v;
    var wasHidden = win.hidden;
    win.style.setProperty('--c', colorOf(itemOf(v), v.p));
    win.classList.toggle('is-mini', v.p.type === 'captcha' && v.kind === 'page');
    winRoute.innerHTML = '<span class="win-file">' + esc(fileName(v)) + '</span>';
    winBody.innerHTML = bodyHtml(v);
    if (v.p.type === 'captcha') capInit();
    editable(winBody);
    winBody.scrollTop = 0;
    winBack.hidden = !stack.length;
    win.hidden = false;
    win.classList.remove('is-out');
    win.classList.toggle('is-hold', !!opts.hold);
    box.classList.add('is-win');
    view = 'win';
    setHash(v.p.id + (v.kind === 'page' ? '' : '/' + (v.i + 1)));
    markSongs();
    if (!opts.hold) {
      if (wasHidden) setScrim('dim');
      enter();
    }
  }
  /* 창 내용이 차례로 올라오고, 슬라이더·막대가 제자리로 간다 */
  function enter() {
    win.classList.remove('is-enter');
    void win.offsetWidth;
    win.classList.add('is-enter');
    requestAnimationFrame(function () { requestAnimationFrame(settle); });
    try { win.focus({ preventScroll: true }); } catch (x) {}
  }
  /* 대사 말풍선: 화면에 들어오면 한 줄씩 (… 치는 중 → 말) */
  function chatIn() {
    $$('.chat:not(.is-shown):not(.is-watch)', winBody).forEach(function (c) {
      c.classList.add('is-watch');
      function play() {
        c.classList.add('is-shown');
        $$('.quote', c).forEach(function (q, i) {
          setTimeout(function () { q.classList.add('is-typing'); }, i * 1100);
          setTimeout(function () { q.classList.remove('is-typing'); q.classList.add('is-in'); }, i * 1100 + 750);
        });
      }
      if (!('IntersectionObserver' in window)) { play(); return; }
      var io = new IntersectionObserver(function (es) {
        if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); play(); }
      }, { root: winBody, threshold: 0.35 });
      io.observe(c);
    });
  }
  function settle() {
    chatIn();
    $$('.trait', winBody).forEach(function (el) {
      var v = +el.getAttribute('data-v'), f = $('.trait-fill', el);
      $('.trait-knob', el).style.left = v + '%';
      f.style.left = Math.min(50, v) + '%';
      f.style.width = Math.abs(v - 50) + '%';
    });
    $$('.meter', winBody).forEach(function (el) {
      $('.meter-bar i', el).style.width = el.getAttribute('data-v') + '%';
    });
  }
  function closeWin(instant) {
    if (win.hidden) return;
    stack = [];
    winCur = null;
    box.classList.remove('is-win');
    setHash('');
    if (view === 'win') { view = ''; setScrim(''); }
    if (instant || reduced) {
      win.hidden = true;
      win.classList.remove('is-enter', 'is-hold', 'is-out');
      return;
    }
    win.classList.add('is-out');
    setTimeout(function () {
      if (!win.classList.contains('is-out')) return;
      win.hidden = true;
      win.classList.remove('is-out', 'is-enter');
    }, 200);
  }
  function back() {
    var prev = stack.pop();
    if (prev) showWin(prev, { back: true });
  }
  winBack.addEventListener('click', back);
  $('#win-close').addEventListener('click', function () { if (!morphing) closeWin(); });
  winBody.addEventListener('keydown', function (ev) {
    var t = ev.target;
    if ((ev.key === 'Enter' || ev.key === ' ') && t.matches && t.matches('[data-pair],[data-char]')) { ev.preventDefault(); t.click(); }
  });
  winBody.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter' && ev.target.classList && ev.target.classList.contains('cap-in')) {
      var go = $('.cap-go', winBody);
      if (go) { ev.preventDefault(); go.click(); }
    }
  });
  winBody.addEventListener('click', function (ev) {
    if (capClick(ev)) return;
    var wp = ev.target.closest('[data-who]');
    if (wp) {
      var wrap = $('.dp-wrap', winBody), w = wp.getAttribute('data-who'), on = wrap.getAttribute('data-on') === w;
      wrap.setAttribute('data-on', on ? '' : w);
      wrap.classList.toggle('is-open', !on);
      $$('[data-who]', winBody).forEach(function (x) { var me = !on && x === wp; x.classList.toggle('is-on', me); x.setAttribute('aria-expanded', me); });
      return;
    }
    var mo = ev.target.closest('[data-more]');
    if (mo) { var da = mo.closest('.da'); da.classList.toggle('is-clip'); mo.textContent = da.classList.contains('is-clip') ? 'more' : 'close'; return; }
    var t = ev.target.closest('[data-pair],[data-char]');
    if (t && winCur) {
      var isPair = t.hasAttribute('data-pair');
      showWin({ p: winCur.p, kind: isPair ? 'pair' : 'char', i: +t.getAttribute(isPair ? 'data-pair' : 'data-char') }, { push: true });
      return;
    }
    var sg = ev.target.closest('[data-song]');
    if (sg) toggleTrack({ id: sg.getAttribute('data-song'), title: sg.getAttribute('data-title') });
  });

  /* ------------------------------------------------------------------
   * 연결 (CAPTCHA 기믹) — 다른 홈으로 가는 문. 작은 창 하나
   *   ⟳ 를 누르면 옆 홈으로 넘어가고, Verify 를 누르면 그 홈이 새 탭으로
   * ------------------------------------------------------------------ */
  var capTimer = null;
  function hostOf(u) { return String(u || '').replace(/^https?:\/\//, '').replace(/\/$/, ''); }
  function shown(l) { return (l && l.label) || hostOf(l && l.url); }
  function capLinks(p) { return arr(p && p.links).filter(function (l) { return l && l.url; }); }
  function capHtml(p) {
    var list = capLinks(p);
    if (!list.length) return headHtml(p) + '<div class="empty">아직 없어요</div>';
    var first = list[0];
    function btn(act, label, svg) { return '<button type="button" class="sm-b" data-cap="' + act + '" aria-label="' + label + '"><svg viewBox="0 0 16 16">' + svg + '</svg></button>'; }
    return '<h2 class="sr" id="win-title">' + esc(p.label || '') + '</h2>' +
      '<div class="cap" data-i="0">' +
        '<p class="sm-h">' + esc(p.ask || 'Enter the following:') + '</p>' +
        '<div class="cap-view"><div class="cap-track">' + list.map(function (l, i) {
          var w = arr(l.words).length ? arr(l.words) : [shown(l)];
          return '<canvas class="cap-art" width="300" height="150" aria-hidden="' + (i ? 'true' : 'false') + '" data-words="' + esc(JSON.stringify(w)) + '" data-seed="' + esc(l.url + i) + '"></canvas>';
        }).join('') + '</div></div>' +
        '<div class="sm-bot">' +
          '<div class="sm-l"><label class="sm-lab" for="cap-in">' + esc(p.answerLabel || 'Your Answer') + '</label>' +
            '<input id="cap-in" class="cap-in" type="text" spellcheck="false" autocomplete="off" value=""></div>' +
          '<div class="sm-r"><span class="sm-logo"><b>208</b>media</span>' +
            '<span class="sm-btns">' +
              btn('next', '다른 홈 (새 문제)', '<path d="M12.6 8a4.6 4.6 0 1 1-1.35-3.25"/><path d="M12.4 2.6v2.8H9.6"/>') +
              btn('audio', '음악 듣기', '<path class="f" d="M2.8 6.2h2.2L8.2 3.6v8.8L5 9.8H2.8z"/><path d="M10.3 6a2.6 2.6 0 0 1 0 4M12 4.4a5 5 0 0 1 0 7.2"/>') +
              btn('info', '도움말', '<path d="M6 6.1a2 2 0 1 1 2.8 1.8c-.55.27-.8.7-.8 1.3v.4"/><path d="M8 11.6v.4"/>') +
            '</span></div>' +
        '</div>' +
        '<p class="cap-help" hidden>' + esc(p.help || '⟳ 를 누르면 다른 홈으로 넘어가요. 확인을 누르면 그 홈이 열려요.') + '</p>' +
      '</div>' +
      '<div class="cap-end">' +
        '<span class="cap-to"><span class="cap-dots">' + list.map(function (l, i) { return '<i' + (i ? '' : ' class="on"') + '></i>'; }).join('') + '</span>' +
          '<b data-cap-to>' + esc(shown(first)) + '</b></span>' +
        '<a class="cap-go" data-cap="go" href="' + esc(first.url) + '" target="_blank" rel="noopener">' + esc(p.verify || '확인') + '</a>' +
      '</div>';
  }
  /* 자글자글한 글자 그림 (점묘 + 잡티) */
  function grain(cv) {
    var W = cv.width, H = cv.height, r = rng(cv.getAttribute('data-seed'));
    var words = [];
    try { words = JSON.parse(cv.getAttribute('data-words')) || []; } catch (x) {}
    function layer(draw) {
      var c = document.createElement('canvas');
      c.width = W; c.height = H;
      var g = c.getContext('2d');
      draw(g);
      return g.getImageData(0, 0, W, H).data;
    }
    var text = layer(function (g) {
      g.fillStyle = '#000';
      g.textBaseline = 'middle';
      var n = words.length || 1, lh = (H - 14) / n;
      words.forEach(function (w, li) {
        var chars = Array.from(String(w));
        var size = Math.min(lh * (n > 1 ? 0.86 : 0.78), W * 1.45 / Math.max(3.2, chars.length));
        g.font = '900 ' + size.toFixed(1) + 'px Georgia, "Times New Roman", Pretendard, serif';
        var ws = chars.map(function (c) { return g.measureText(c).width * 0.84; });
        var total = ws.reduce(function (a, b) { return a + b; }, 0);
        var x = (W - total) / 2 + (r() - 0.5) * W * 0.08, y = H / 2 + (li - (n - 1) / 2) * lh * 0.94 + (r() - 0.5) * 4;
        chars.forEach(function (c, i) {
          g.save();
          g.translate(x + ws[i] / 2, y + (r() - 0.5) * size * 0.16);
          g.rotate((r() - 0.5) * 0.55);
          g.scale(0.82 + r() * 0.36, 0.9 + r() * 0.24);
          g.fillText(c, -ws[i] / 2 / 0.84, 0);
          g.restore();
          x += ws[i];
        });
      });
    });
    var shape = layer(function (g) {
      g.strokeStyle = '#000';
      for (var i = 0; i < 3; i++) {
        g.lineWidth = 7 + r() * 14;
        g.beginPath();
        g.arc(r() * W, r() * H, 30 + r() * 70, r() * 6, r() * 6 + 2 + r() * 3);
        g.stroke();
      }
      g.lineWidth = 3 + r() * 3;
      g.beginPath();
      g.moveTo(-10, H * (0.3 + r() * 0.4));
      g.bezierCurveTo(W * 0.3, r() * H, W * 0.7, r() * H, W + 10, H * (0.3 + r() * 0.4));
      g.stroke();
    });
    var out = cv.getContext('2d'), img = out.createImageData(W, H), d = img.data;
    var INK = [58, 56, 74], GHOST = [150, 144, 178], PAPER = [214, 210, 232], SPECK = [190, 185, 214];
    for (var i = 0; i < W * H; i++) {
      var a = text[i * 4 + 3] / 255, s = shape[i * 4 + 3] / 255, col;
      if (r() < a * 0.9 - 0.03) col = INK;
      else if (r() < s * 0.5) col = GHOST;
      else col = r() < 0.04 ? SPECK : PAPER;
      d[i * 4] = col[0]; d[i * 4 + 1] = col[1]; d[i * 4 + 2] = col[2]; d[i * 4 + 3] = 255;
    }
    out.putImageData(img, 0, 0);
  }
  function capInit() {
    var cap = $('.cap', winBody);
    if (!cap) return;
    $$('.cap-art', cap).forEach(grain);
    // 글꼴이 늦게 오면 한 번 더
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (cap.isConnected) $$('.cap-art', cap).forEach(grain); });
    setTimeout(function () { if (cap.isConnected) capType(cap); }, reduced ? 0 : 650);
  }
  function capType(cap) {
    var list = capLinks(winCur && winCur.p);
    var i = +cap.getAttribute('data-i'), l = list[i] || {}, input = $('.cap-in', cap);
    clearInterval(capTimer);
    var text = String(l.answer || ''), n = 0;
    input.value = '';
    if (reduced) { input.value = text; return; }
    capTimer = setInterval(function () {
      if (!input.isConnected) { clearInterval(capTimer); return; }
      input.value = text.slice(0, ++n);
      if (n >= text.length) clearInterval(capTimer);
    }, 65);
  }
  function capClick(ev) {
    var b = ev.target.closest('[data-cap]'), cap = b && $('.cap', winBody);
    if (!b || !cap) return false;
    var act = b.getAttribute('data-cap'), list = capLinks(winCur && winCur.p);
    if (act === 'next') {
      var i = (+cap.getAttribute('data-i') + 1) % list.length;
      cap.setAttribute('data-i', i);
      cap.style.setProperty('--i', i);
      $$('.cap-art', cap).forEach(function (c, j) { c.setAttribute('aria-hidden', j === i ? 'false' : 'true'); });
      $$('.cap-dots i', winBody).forEach(function (d, j) { d.classList.toggle('on', j === i); });
      $('[data-cap-to]', winBody).textContent = shown(list[i]);
      $('.cap-go', winBody).href = list[i].url;
      cap.classList.remove('is-ok');
      b.classList.remove('is-spin'); void b.offsetWidth; b.classList.add('is-spin');
      capType(cap);
      return true;
    }
    if (act === 'audio') { if (playing || intent) pause(); else play(); return true; }
    if (act === 'info') { var h = $('.cap-help', cap); h.hidden = !h.hidden; return true; }
    if (act === 'go') { cap.classList.add('is-ok'); return false; }   // 새 탭은 그대로 열리게
    return true;
  }

  /* 주소 끝 #아이디 (또는 #아이디/번호) 로 바로 열기. 글 안에 <a href="#pairs/1"> 처럼 링크도 됨 */
  function setHash(id) {
    if (!window.history || !history.replaceState) return;
    try { history.replaceState(null, '', location.pathname + location.search + (id ? '#' + encodeURIComponent(id).replace(/%2F/g, '/') : '')); } catch (x) {}
    xpSync();
  }
  function fromHash() {
    var parts = decodeURIComponent(location.hash.replace(/^#/, '')).split('/');
    var p = parts[0] && pageById(parts[0]);
    if (!p || morphing) return;
    var n = parseInt(parts[1], 10) - 1, v = { p: p, kind: 'page' };
    if (n >= 0 && p.type === 'pairs' && arr(p.pairs)[n]) v = { p: p, kind: 'pair', i: n };
    if (n >= 0 && p.type === 'chars' && arr(p.chars)[n]) v = { p: p, kind: 'char', i: n };
    if (winCur && winCur.p === v.p && winCur.kind === v.kind && winCur.i === v.i) return;
    closeTicket(true);
    showWin(v, { push: !win.hidden });
  }
  window.addEventListener('hashchange', fromHash);

  scrim.addEventListener('click', function () {
    if (morphing) return;
    if (view === 'win') closeWin();
    else if (view === 'card') closeCard();
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.target && ev.target.isContentEditable) return;
    if (view === 'ticket' && ev.key === 'Enter') { autoTear(); return; }
    if (ev.key !== 'Escape' || morphing) return;
    if (menu.classList.contains('is-open')) setMenu(false);
    else if (view === 'ticket') autoTear();
    else if (view === 'win') { if (stack.length) back(); else closeWin(); }
    else if (view === 'card') closeCard();
  });
  window.addEventListener('resize', function () {
    map.invalidateSize();
    fitTicket();
  });

  /* ------------------------------------------------------------------
   * 음악 (YouTube) — 왼쪽 아래 플레이어 + 창 안의 테마곡 버튼
   * ------------------------------------------------------------------ */
  var songs = arr(D.playlist).filter(function (s) { return s && s.id; });
  var player = $('#player');
  var playBtn = $('#play');
  var pTitle = $('#player-title');
  var idx = 0, intent = false, playing = false, yt = null, ready = false, ytStarted = false;
  player.hidden = !songs.length;

  function markSongs() {
    var id = songs.length ? songs[idx].id : '';
    $$('[data-song]').forEach(function (b) {
      var on = b.getAttribute('data-song') === id && (playing || intent);
      b.classList.toggle('is-playing', on);
      b.setAttribute('aria-label', (on ? '일시정지: ' : '재생: ') + (b.getAttribute('data-title') || '테마곡'));
    });
  }
  function paint() {
    markSongs();
    if (!songs.length) return;
    var title = songs[idx].title || '';
    player.classList.toggle('is-playing', playing);
    playBtn.setAttribute('aria-label', playing ? '일시정지' : '재생');
    if (pTitle.textContent !== title) {
      pTitle.textContent = title;
      player.classList.toggle('is-long', pTitle.scrollWidth > pTitle.parentNode.clientWidth + 2);
    }
  }
  function cue(i) {
    if (!songs.length) return;
    intent = true;
    idx = (i + songs.length) % songs.length;
    if (ready) yt.loadVideoById(songs[idx].id); else startYT();
    paint();
  }
  function play() {
    if (!songs.length) return;
    intent = true;
    if (!ready) { startYT(); paint(); return; }
    var st = yt.getPlayerState();
    if (st === 2 || st === 5 || st === -1) yt.playVideo(); else yt.loadVideoById(songs[idx].id);
    paint();
  }
  function pause() {
    intent = false;
    playing = false;
    if (ready) yt.pauseVideo();
    paint();
  }
  /* 창의 테마곡 버튼: 지금 곡이면 재생/정지, 아니면 그 곡으로 */
  function toggleTrack(t) {
    if (!t || !t.id) return;
    var i = -1;
    songs.forEach(function (s, n) { if (i < 0 && s.id === t.id) i = n; });
    if (i > -1 && i === idx) { if (playing || intent) pause(); else play(); return; }
    if (i < 0) { songs.push({ id: t.id, title: t.title }); i = songs.length - 1; }
    player.hidden = false;
    cue(i);
  }

  playBtn.addEventListener('click', function () { if (playing || intent) pause(); else play(); });
  $('#next').addEventListener('click', function () { cue(idx + 1); });
  $('#prev').addEventListener('click', function () {
    cue(ready && yt.getCurrentTime && yt.getCurrentTime() > 4 ? idx : idx - 1);
  });
  paint();

  function startYT() {
    if (ytStarted) return;
    ytStarted = true;
    var prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      if (typeof prevReady === 'function') prevReady();
      makePlayer();
    };
    var sc = document.createElement('script');
    sc.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(sc);
  }
  function makePlayer() {
    var opts = {
      width: '2',
      height: '2',
      playerVars: { autoplay: 0, controls: 0, disablekb: 1, playsinline: 1, rel: 0 },
      events: {
        onReady: function () {
          ready = true;
          try { yt.setVolume(40); } catch (x) {}
          // 준비되는 사이에 누른 곡이 있으면 그 곡부터
          if (intent && songs.length) { try { yt.loadVideoById(songs[idx].id); } catch (x) {} }
        },
        onStateChange: function (ev) {
          if (ev.data === 1) { playing = true; if (!intent) yt.pauseVideo(); }
          else if (ev.data === 0) { playing = false; if (intent) { cue(idx + 1); return; } }
          else if (ev.data === 2) { playing = false; }
          paint();
        },
        onError: function () { if (intent) cue(idx + 1); }
      }
    };
    if (songs.length) opts.videoId = songs[idx].id;
    yt = new YT.Player('yt', opts);
  }
  // 모바일은 누르는 순간 재생해야 해서 미리 불러 둔다
  function hasSong(x) { return !!(x && x.song && x.song.id); }
  var anySong = songs.length || pages.some(function (p) {
    return hasSong(p) || arr(p.pairs).some(hasSong) || arr(p.chars).some(hasSong);
  });
  if (anySong) startYT();

  /* 들어오자마자 음악: 브라우저가 소리 자동재생을 막아서, 처음 누르는 순간(탑승권 뜯기 등) 바로 튼다 */
  if (songs.length && site.autoplay !== false && !EDIT) {
    var kick = function () {
      document.removeEventListener('pointerdown', kick, true);
      document.removeEventListener('keydown', kick, true);
      if (!playing && !intent) play();
    };
    document.addEventListener('pointerdown', kick, true);
    document.addEventListener('keydown', kick, true);
  }

  /* ------------------------------------------------------------------
   * 창 바깥 배경 — 사진 위에 한자 · 병음 · 단어가 둥둥 (넓은 화면에서만)
   * ------------------------------------------------------------------ */
  (function backdrop() {
    var B = D.backdrop;
    if (!B) return;
    var bd = document.createElement('div');
    bd.className = 'bd';
    if (B.photo) {
      bd.style.backgroundImage = 'url("' + String(B.photo).replace(/"/g, '%22') + '")';
      try { document.documentElement.style.setProperty('--bd-photo', 'url("' + new URL(B.photo, location.href).href + '")'); } catch (x) {}   // 오프닝 뒤 배경에도
    }
    var words = arr(B.words).filter(function (w) { return arr(w)[0]; });
    var half = Math.ceil(words.length / 2), r = rng('208');
    var h = '';
    words.forEach(function (w, i) {
      w = arr(w);
      var side = i < half ? 'l' : 'r', n = side === 'l' ? i : i - half, cnt = side === 'l' ? half : words.length - half;
      var y = 5 + (n + 0.5) * (84 / cnt) + (r() - 0.5) * 4;
      var x = 0.08 + r() * 0.42;
      var kind = ['up', 'down', 'side', 'vert'][Math.floor(r() * 4)];
      var chip = w[2] ? '<span class="bd-chip' + (r() < 0.3 ? ' is-v' : '') + '">' + esc(w[2]) + '</span>' : '';
      h += '<button type="button" class="bd-w is-' + kind + ' is-' + side + '" style="--x:' + x.toFixed(2) + ';--y:' + y.toFixed(1) + '%;--d:' + (-r() * 6).toFixed(2) + 's" data-say="' + esc(w[0]) + '" title="' + esc(w[1] || '') + '">' +
        '<b>' + esc(w[0]) + '</b><small>' + esc(w[1] || '') + '</small>' + chip + '</button>';
    });
    if (B.center) {
      h += '<button type="button" class="bd-angel" data-say="' + esc(B.center) + '">' +
        '<svg class="bd-wing" viewBox="0 0 70 80" aria-hidden="true"><path d="M66 46C52 18 22 4 4 10c8 4 4 9 0 13 9 2 6 8 2 12 9 1 7 8 4 12 9-1 9 6 7 11 12-3 30-6 49-12Z"/><path d="M58 40C44 26 28 18 14 17M54 46C40 36 26 32 12 31M50 51C38 46 26 45 15 46"/></svg>' +
        '<svg class="bd-wing is-r" viewBox="0 0 70 80" aria-hidden="true"><path d="M66 46C52 18 22 4 4 10c8 4 4 9 0 13 9 2 6 8 2 12 9 1 7 8 4 12 9-1 9 6 7 11 12-3 30-6 49-12Z"/><path d="M58 40C44 26 28 18 14 17M54 46C40 36 26 32 12 31M50 51C38 46 26 45 15 46"/></svg>' +
        (site.pin ? '<img src="' + esc(site.pin) + '" alt="">' : '') + '<span class="bd-chip">' + esc(B.center) + '</span></button>';
    }
    bd.innerHTML = h;
    document.body.insertBefore(bd, document.body.firstChild);
    document.documentElement.classList.add('has-bd');
    // 누르면 광둥어로 읽기 (지원하는 브라우저만)
    bd.addEventListener('click', function (ev) {
      var t = ev.target.closest('[data-say]');
      if (!t) return;
      t.classList.remove('is-pop'); void t.offsetWidth; t.classList.add('is-pop');
      try {
        var u = new SpeechSynthesisUtterance(t.getAttribute('data-say'));
        u.lang = 'zh-HK'; u.rate = 0.8;
        speechSynthesis.cancel(); speechSynthesis.speak(u);
      } catch (x) {}
    });
  })();

  /* ------------------------------------------------------------------
   * 옛 브라우저 창 — 제목줄 · 주소창 · 상태줄 · 버튼
   * ------------------------------------------------------------------ */
  var DOMAIN = site.domain || '208with.me';
  var xpT = $('#xp-t'), xpUrl = $('#xp-url'), xpSt = $('#xp-st-t'), xpTask = $('#xp-task-t');
  function xpLabel() {
    var v = winCur;
    if (view === 'ticket') return '';
    if (view === 'card' && cur) return cur.label || '';
    if (!v) return '';
    var it = itemOf(v);
    return (it && (it.title || it.code || it.name)) || v.p.label || '';
  }
  function xpSync() {
    if (!xpT) return;
    var name = site.title || '208 with me', label = xpLabel();
    var t = (label ? label + ' - ' : '') + name;
    xpT.textContent = t;
    if (xpTask) xpTask.textContent = t;
    xpUrl.textContent = 'http://' + DOMAIN + '/' + (location.hash || '');
    xpStatus();
  }
  function xpStatus(text) {
    if (!xpSt) return;
    xpSt.textContent = text || (view === 'ticket' ? 'Opening page http://' + DOMAIN + '/ ... tear the ticket' : 'Done');
  }
  $$('[data-xp]').forEach(function (b) {
    b.addEventListener('click', function () {
      var a = b.getAttribute('data-xp');
      if (a === 'back') { if (view === 'win') { if (stack.length) back(); else closeWin(); } else if (view === 'card') closeCard(); }
      else if (a === 'stop') { if (view === 'win') closeWin(); else if (view === 'card') closeCard(); }
      else if (a === 'refresh') location.reload();
      else if (a === 'home') { if (view === 'win') closeWin(); if (view === 'card') closeCard(); setMenu(false); fitAll(true); }
      else if (a === 'fav' || a === 'search') { if (view !== 'ticket') setMenu(!menu.classList.contains('is-open')); }
      else if (a === 'music') { if (playing || intent) pause(); else play(); }
      else if (a === 'max') { $('#app').classList.toggle('is-max'); setTimeout(function () { map.invalidateSize(); fitTicket(); }, 60); }
      else if (a === 'min') { var x = $('#xp'); x.classList.remove('is-min'); void x.offsetWidth; x.classList.add('is-min'); }
      else if (a === 'close') { if (view === 'win') closeWin(); else if (view === 'card') closeCard(); }
    });
  });
  // 시계: 지금 홍콩 시간
  (function tick() {
    var c = $('#xp-clock');
    if (!c) return;
    try { c.textContent = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Hong_Kong' }); } catch (x) {}
    setTimeout(tick, 30000);
  })();
  xpSync();

  /* ------------------------------------------------------------------
   * 편집 모드 — 208with.me/?edit
   *   점선 글자를 눌러 바로 고치고, 위 막대의 [data.js 저장]으로 내려받기.
   *   고치던 내용은 이 브라우저에 임시 저장 (새로고침해도 남음)
   * ------------------------------------------------------------------ */
  var PLAIN = (function () {
    var t = document.createElement('span');
    try { t.contentEditable = 'plaintext-only'; } catch (x) {}
    return t.contentEditable === 'plaintext-only' ? 'plaintext-only' : 'true';
  })();
  function editable(root) {
    if (!EDIT) return;
    $$('[data-k]', root).forEach(function (el) {
      el.contentEditable = el.hasAttribute('data-rich') ? 'true' : PLAIN;
      el.spellcheck = false;
    });
  }
  function setPath(path, val) {
    var ks = path.split('.'), o = D;
    for (var i = 0; i < ks.length - 1; i++) {
      if (o[ks[i]] == null || typeof o[ks[i]] !== 'object') o[ks[i]] = /^\d+$/.test(ks[i + 1]) ? [] : {};
      o = o[ks[i]];
    }
    o[ks[ks.length - 1]] = val;
  }
  function clean(k, v) { return k.charAt(0) === '_' ? undefined : v; }
  /* 서식 있는 칸: 줄바꿈은 \n 으로, 나머지 HTML(굵게 · 링크)은 그대로 */
  function fromRich(el) {
    return el.innerHTML
      .replace(/<div><br><\/div>/gi, '\n').replace(/<div>/gi, '\n').replace(/<\/div>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n').replace(/&nbsp;/g, ' ').replace(/\n+$/, '');
  }
  /* data.js 로 다시 쓰기 (사람이 읽기 좋게) */
  function key(k) { return /^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k); }
  function toJS(v, ind) {
    var pad = ind + '  ';
    if (Array.isArray(v)) {
      if (!v.length) return '[]';
      var flat = v.every(function (x) { return x === null || typeof x !== 'object' || (Array.isArray(x) && x.every(function (y) { return y === null || typeof y !== 'object'; })); });
      var one = '[' + v.map(function (x) { return toJS(x, pad); }).join(', ') + ']';
      if (flat && one.length + ind.length < 110) return one;
      return '[\n' + v.map(function (x) { return pad + toJS(x, pad); }).join(',\n') + '\n' + ind + ']';
    }
    if (v && typeof v === 'object') {
      var ks = Object.keys(v).filter(function (k) { return k.charAt(0) !== '_' && v[k] !== undefined; });
      if (!ks.length) return '{}';
      var line = '{ ' + ks.map(function (k) { return key(k) + ': ' + toJS(v[k], pad); }).join(', ') + ' }';
      if (line.length + ind.length < 100 && ks.every(function (k) { return v[k] === null || typeof v[k] !== 'object'; })) return line;
      return '{\n' + ks.map(function (k) { return pad + key(k) + ': ' + toJS(v[k], pad); }).join(',\n') + '\n' + ind + '}';
    }
    return JSON.stringify(v);
  }
  function dataJs() {
    return '/* ==========================================================================\n' +
      '   MY ERA — 내용 파일 (편집 모드에서 저장함 · ' + new Date().toISOString().slice(0, 10) + ')\n' +
      '   칸 설명은 README.md 에 있어요. 사이트에서 고치려면 주소 끝에 ?edit\n' +
      '   ========================================================================== */\n' +
      'window.ERA = ' + toJS(D, '') + ';\n';
  }
  var draftTimer = 0;
  function saveDraft() {
    clearTimeout(draftTimer);
    draftTimer = setTimeout(function () {
      try { localStorage.setItem(DRAFT, JSON.stringify({ base: ORIGINAL, data: JSON.parse(JSON.stringify(D, clean)) })); } catch (x) {}
      var st = $('#edit-state');
      if (st) st.textContent = '고친 내용 임시 저장됨';
    }, 300);
  }
  function download(name, text) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/javascript;charset=utf-8' }));
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  if (EDIT) {
    document.documentElement.classList.add('is-edit');
    var bar = document.createElement('div');
    bar.className = 'edit-bar';
    bar.innerHTML = '<b>편집 모드</b><span id="edit-state">점선 글자를 눌러 고치세요</span>' +
      '<button type="button" data-act="opening">탑승권</button>' +
      '<button type="button" data-act="reset">되돌리기</button>' +
      '<button type="button" data-act="save" class="is-main">data.js 저장</button>';
    document.body.appendChild(bar);
    bar.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-act]');
      if (!b) return;
      var act = b.getAttribute('data-act');
      if (act === 'save') {
        download('data.js', dataJs());
        $('#edit-state').textContent = '저장했어요 → GitHub의 data.js 를 이 파일로 바꾸면 사이트에 반영';
      }
      if (act === 'reset' && window.confirm('고친 내용을 모두 지우고 원래 data.js 로 되돌릴까요?')) {
        try { localStorage.removeItem(DRAFT); } catch (x) {}
        location.reload();
      }
      if (act === 'opening' && opening && !morphing && view !== 'ticket') {
        closeWin(true);
        if (view === 'card') closeCard();
        openTicket({ id: 'opening', label: '', ticket: opening.ticket, _tk: 'opening.ticket' });
      }
    });
    // 왼쪽 위 지명도
    if (!AUTO_SUB) {
      $('#brand-sub').setAttribute('data-k', 'site.sub');
      editable($('.brand'));
    }
    // 고치면 바로 data 에 반영 (같은 칸이 화면에 두 번 있으면 같이 바뀜)
    document.addEventListener('input', function (ev) {
      var el = ev.target.closest && ev.target.closest('[data-k]');
      if (!el) return;
      var k = el.getAttribute('data-k'), rich = el.hasAttribute('data-rich');
      var v = rich ? fromRich(el) : el.textContent;
      setPath(k, v);
      $$('[data-k="' + k + '"]').forEach(function (o) { if (o !== el) { if (rich) o.innerHTML = el.innerHTML; else o.textContent = v; } });
      var m = /^pages\.(\d+)\.label$/.exec(k);
      if (m) {
        var pg = D.pages[+m[1]], mi = pg && $('.menu-item[data-go="' + pg.id + '"] span');
        if (mi) mi.textContent = v;
      }
      saveDraft();
    });
    // 글자를 누르면 고치기만 (카드 열기 · 티켓 뜯기 같은 동작은 안 함)
    document.addEventListener('click', function (ev) {
      var el = ev.target.closest && ev.target.closest('[data-k]');
      if (!el) return;
      ev.stopPropagation();
      if (ev.target.closest('a')) ev.preventDefault();   // 글 안의 링크도 이동하지 않고 고치기만
    }, true);
    document.addEventListener('keydown', function (ev) {
      var el = ev.target;
      if (!el || !el.isContentEditable) return;
      if (ev.key === 'Escape' || (ev.key === 'Enter' && !el.hasAttribute('data-rich'))) { ev.preventDefault(); el.blur(); }
    }, true);
    // 붙여 넣을 때는 글자만
    document.addEventListener('paste', function (ev) {
      var el = ev.target.closest && ev.target.closest('[data-k]');
      if (!el) return;
      ev.preventDefault();
      var t = (ev.clipboardData || window.clipboardData).getData('text');
      document.execCommand('insertText', false, el.hasAttribute('data-rich') ? t : t.replace(/\s*\n\s*/g, ' '));
    });
  }

  /* ------------------------------------------------------------------
   * 시작
   * ------------------------------------------------------------------ */
  fitAll(false);
  var deep = pageById(decodeURIComponent(location.hash.replace(/^#/, '')).split('/')[0]);
  var seen = false;
  try { seen = !!sessionStorage.getItem(OPEN_KEY); } catch (x) {}
  if (deep) fromHash();
  else if (opening && (EDIT || (opening.show !== 'off' && !(opening.show !== 'always' && seen)))) {
    // 착륙하는 느낌이 나게 한 단계 멀리서 시작
    map.setZoom(map.getZoom() - 1, { animate: false });
    openTicket({ id: 'opening', label: '', ticket: opening.ticket, _tk: 'opening.ticket' });
  }
})();
