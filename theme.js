/**
 * Theme switcher (dark / light)
 * - Urutan prioritas: pilihan tersimpan -> preferensi sistem -> dark
 * - Dimuat di <head> agar tema terpasang sebelum halaman tampil (tanpa kedip)
 */
(function () {
  var KEY = 'solusin-theme';
  var root = document.documentElement;

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function systemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light' : 'dark';
  }

  function apply(theme) {
    if (theme === 'light') root.setAttribute('data-theme', 'light');
    else root.setAttribute('data-theme', 'dark');

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f6f7fb' : '#070913');

    var btn = document.getElementById('themeToggle');
    if (btn) {
      var toLight = theme !== 'light';
      btn.setAttribute('aria-label', toLight ? 'Ganti ke mode terang' : 'Ganti ke mode gelap');
      btn.setAttribute('title', toLight ? 'Mode terang' : 'Mode gelap');
    }
  }

  // Terapkan secepat mungkin
  apply(stored() || systemTheme());

  document.addEventListener('DOMContentLoaded', function () {
    apply(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

    var btn = document.getElementById('themeToggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        root.classList.add('theme-transition');
        apply(next);
        try { localStorage.setItem(KEY, next); } catch (e) {}
        window.setTimeout(function () { root.classList.remove('theme-transition'); }, 350);
      });
    }
  });

  // Ikuti perubahan tema sistem selama pengguna belum memilih manual
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: light)');
    var onChange = function () { if (!stored()) apply(systemTheme()); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }
})();
