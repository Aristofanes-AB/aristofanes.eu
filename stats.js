/* Besöksstatistik för aristofanes.eu via GoatCounter (inga cookies).
   Räknar: vilka delar av startsidan som visas, klick på viktiga knappar
   och skickade kontaktformulär. Märks inte för besökaren. */
(function () {
  var lang = document.documentElement.lang === 'en' ? 'EN' : 'SV';
  var queue = [];

  function deliver(item) {
    var gc = window.goatcounter;
    if (gc && gc.count) {
      try { gc.count(item); } catch (e) {}
      return true;
    }
    return false;
  }

  function push(item) {
    queue.push(item);
    if (window.goatcounter && window.goatcounter.count) queue.splice(0).forEach(deliver);
  }

  // Händelse (klick, visad del, formulär)
  function send(name) {
    var path = lang + ' · ' + name;
    push({ path: path, title: path, event: true });
  }

  // Sidvisning med läsbart namn, t.ex. "SV · Startsida"
  var meta = document.querySelector('meta[name="gc-page"]');
  var pageName = lang + ' · ' + (meta ? meta.getAttribute('content') : (location.pathname || '/'));
  push({ path: pageName, title: document.title, event: false });

  // Skicka det som väntat på att GoatCounter ska laddas
  var tries = 0;
  var timer = setInterval(function () {
    tries++;
    if (window.goatcounter && window.goatcounter.count) {
      clearInterval(timer);
      queue.splice(0).forEach(deliver);
    } else if (tries > 30) {
      clearInterval(timer);
    }
  }, 500);

  // 1. Vilka delar av startsidan som visas (en gång per sidvisning)
  var sections = [
    ['#tjanster', 'Startsida · Tjänster visad'],
    ['.why', 'Startsida · Varför Aristofanes visad'],
    ['#kontakt', 'Startsida · Kontakt visad']
  ];
  if ('IntersectionObserver' in window && document.querySelector('#tjanster')) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var el = e.target;
        if (e.isIntersecting) {
          // Räknas bara om delen syns minst 1 sekund (inte när man scrollar förbi)
          el._gcTimer = setTimeout(function () {
            io.unobserve(el);
            send(el.getAttribute('data-gc-section'));
          }, 1000);
        } else if (el._gcTimer) {
          clearTimeout(el._gcTimer);
        }
      });
    }, { rootMargin: '0px 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) {
      var el = document.querySelector(s[0]);
      if (el) { el.setAttribute('data-gc-section', s[1]); io.observe(el); }
    });
  }

  // 2. Klick på viktiga knappar och länkar
  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-gc]') : null;
    if (el) send('Klick · ' + el.getAttribute('data-gc'));
  }, true);

  // 3. Skickade kontaktformulär
  var form = document.querySelector('form[action*="formsubmit"]');
  if (form) {
    form.addEventListener('submit', function (ev) {
      if (form.getAttribute('data-gc-sent')) return;
      ev.preventDefault();
      form.setAttribute('data-gc-sent', '1');
      send('Kontaktformulär skickat');
      setTimeout(function () { form.submit(); }, 400);
    });
  }
})();
