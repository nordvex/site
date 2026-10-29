/* ДворОнлайн — интерактив */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- хедер ---------- */
  var header = document.getElementById('header');
  var onScroll = function () {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- мобильное меню ---------- */
  var burger = document.querySelector('.burger');
  var mobileMenu = document.getElementById('mobile-menu');

  function closeMenu() {
    if (!burger || !mobileMenu) return;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
    mobileMenu.hidden = true;
  }

  if (burger && mobileMenu) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      burger.setAttribute('aria-label', open ? 'Открыть меню' : 'Закрыть меню');
      mobileMenu.hidden = open;
    });

    mobileMenu.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1040) closeMenu();
    });
  }

  /* ---------- появление при скролле ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: .14, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- счётчики ---------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (reduceMotion) {
      el.textContent = target.toLocaleString('ru-RU');
      return;
    }
    var duration = 1200;
    var start = performance.now();
    function tick(now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString('ru-RU');
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        cio.unobserve(entry.target);
      });
    }, { threshold: .5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- переключение периода оплаты ---------- */
  var billingBtns = Array.prototype.slice.call(document.querySelectorAll('[data-billing]'));
  billingBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var period = btn.getAttribute('data-billing');
      billingBtns.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });

      Array.prototype.forEach.call(document.querySelectorAll('.plan'), function (plan) {
        var sum = plan.querySelector('.plan__sum');
        var per = plan.querySelector('[data-per]');
        if (!sum) return;
        var value = sum.getAttribute(period === 'year' ? 'data-price-year' : 'data-price-month');
        if (value === null) return;
        sum.textContent = value;
        if (per) {
          if (period === 'year') {
            per.textContent = value === '0' ? 'навсегда' : 'в месяц при оплате за год';
          } else {
            per.textContent = value === '0' ? 'навсегда' : 'в месяц';
          }
        }
      });
    });
  });

  /* ---------- демонстрация YOLO ---------- */
  var visionStage = document.querySelector('.vision__stage');
  var visionBtns = Array.prototype.slice.call(document.querySelectorAll('[data-vision]'));
  visionBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var mode = btn.getAttribute('data-vision');
      visionBtns.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      if (visionStage) visionStage.setAttribute('data-mode', mode);
    });
  });

  /* ---------- табы установки ---------- */
  var tabBtns = Array.prototype.slice.call(document.querySelectorAll('[data-tab]'));
  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-tab');
      tabBtns.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', String(active));
        var panel = document.getElementById('panel-' + b.getAttribute('data-tab'));
        if (panel) {
          panel.classList.toggle('is-active', active);
          panel.hidden = !active;
        }
      });
      var panel = document.getElementById('panel-' + key);
      if (panel) panel.hidden = false;
    });
  });

  /* ---------- таймеры «обновлено N секунд назад» ---------- */
  var visionTime = document.getElementById('vision-time');
  var visionSeconds = 15;

  setInterval(function () {
    if (visionTime) {
      visionSeconds = visionSeconds >= 29 ? 1 : visionSeconds + 1;
      visionTime.textContent = visionSeconds + ' сек назад';
    }
  }, 1000);

  /* ---------- тост ---------- */
  var toastEl = document.getElementById('toast');
  var toastTimer = null;
  function toast(message) {
    if (!toastEl) return;
    toastEl.querySelector('.toast__text').textContent = message;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 4200);
  }

  /* ---------- модалки ---------- */
  var MODAL_CONTENT = {
    login: {
      title: 'Вход в личный кабинет',
      html:
        '<p class="muted" style="margin-bottom:16px">Демо-режим: авторизация не подключена.</p>' +
        '<div class="field"><label for="m-email">Email</label><input id="m-email" type="email" placeholder="you@mail.ru" autocomplete="email"></div>' +
        '<div class="field"><label for="m-pass">Пароль</label><input id="m-pass" type="password" placeholder="••••••••" autocomplete="current-password"></div>' +
        '<button class="btn btn-primary btn-block" type="button" data-toast="Демо-режим: вход не подключён">Войти</button>' +
        '<p class="muted" style="margin-top:14px">Забыли пароль? В прототипе восстановление не реализовано.</p>'
    },
    checkout: {
      title: 'Подключение тарифа',
      html:
        '<p class="muted" style="margin-bottom:16px">Оплата не подключена — это заглушка формы.</p>' +
        '<div class="field"><label for="c-name">Имя</label><input id="c-name" type="text" placeholder="Имя"></div>' +
        '<div class="field"><label for="c-contact">Email или Telegram</label><input id="c-contact" type="text" placeholder="you@mail.ru"></div>' +
        '<div class="field"><label for="c-yard">Адрес двора</label><input id="c-yard" type="text" placeholder="Улица, дом"></div>' +
        '<button class="btn btn-primary btn-block" type="button" data-toast="Заявка сохранена локально (демо)">Отправить заявку</button>'
    },
    privacy: {
      title: 'Политика обработки данных',
      html:
        '<p class="muted">Текст-заглушка. Замените на юридический документ перед публикацией.</p>' +
        '<h3>1. Общие положения</h3><p>Настоящая политика описывает, как сервис «ДворОнлайн» обрабатывает данные посетителей сайта. В демо-версии данные форм никуда не отправляются.</p>' +
        '<h3>2. Какие данные собираются</h3><ul><li>контактные данные, которые вы указываете в формах;</li><li>обезличенная статистика посещений;</li><li>технические данные камер — без распознавания лиц и номеров.</li></ul>' +
        '<h3>3. Видеоданные</h3><p>Сервис анализирует положение транспортных средств. Биометрия не используется, кадры не публикуются.</p>' +
        '<h3>4. Контакты</h3><p>По вопросам обработки данных: info@dvoronline.ru (заглушка).</p>'
    },
    offer: {
      title: 'Публичная оферта',
      html:
        '<p class="muted">Текст-заглушка. Замените на юридический документ перед публикацией.</p>' +
        '<h3>1. Предмет</h3><p>Исполнитель предоставляет доступ к информации о свободных парковочных местах на условиях подписки.</p>' +
        '<h3>2. Стоимость</h3><p>Тарифы указаны на сайте и являются демонстрационными. Оплата в прототипе не проводится.</p>' +
        '<h3>3. Ответственность</h3><p>Данные носят информационный характер. Решение о парковке принимает водитель.</p>' +
        '<h3>4. Реквизиты</h3><p>ИП «Заглушка», ИНН 000000000000, ОГРНИП 000000000000000.</p>'
    },
    requisites: {
      title: 'Реквизиты',
      html:
        '<p class="muted">Демо-данные, замените на реальные.</p>' +
        '<ul><li>ИП «Заглушка»</li><li>ИНН 000000000000</li><li>ОГРНИП 000000000000000</li><li>Адрес: Москва, Пресненская наб., 12</li><li>Email: info@dvoronline.ru</li></ul>' +
        '<p class="muted">Сайт является прототипом, коммерческая деятельность не ведётся.</p>'
    }
  };

  var modalRoot = document.getElementById('modal-root');
  var modalTitle = document.getElementById('modal-title');
  var modalBody = document.getElementById('modal-body');
  var lastFocused = null;

  function openModal(key) {
    var content = MODAL_CONTENT[key];
    if (!content || !modalRoot) return;
    lastFocused = document.activeElement;
    modalTitle.textContent = content.title;
    modalBody.innerHTML = content.html;
    modalRoot.hidden = false;
    document.body.style.overflow = 'hidden';
    var closeBtn = modalRoot.querySelector('.modal__close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modalRoot || modalRoot.hidden) return;
    modalRoot.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-modal]');
    if (opener) {
      e.preventDefault();
      openModal(opener.getAttribute('data-modal'));
      return;
    }
    if (e.target.closest('[data-close]')) {
      closeModal();
      return;
    }
    var toastBtn = e.target.closest('[data-toast]');
    if (toastBtn) {
      toast(toastBtn.getAttribute('data-toast'));
      closeModal();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeModal();
      closeMenu();
    }
  });

  /* ---------- формы ---------- */
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = contactForm.querySelector('#cf-name');
      var contact = contactForm.querySelector('#cf-email');
      var agree = contactForm.querySelector('.check input');
      var valid = true;

      [name, contact].forEach(function (input) {
        if (!input) return;
        var empty = !input.value.trim();
        input.style.borderColor = empty ? 'rgba(255,90,90,.65)' : '';
        if (empty) valid = false;
      });

      if (agree && !agree.checked) {
        valid = false;
        toast('Подтвердите согласие с политикой данных');
        return;
      }
      if (!valid) {
        toast('Заполните имя и контакт');
        return;
      }

      toast('Демо-режим: заявка не отправлена на сервер');
      contactForm.reset();
    });
  }

  /* ---------- текущее время в «камере» ---------- */
  var hudTime = document.querySelector('.hud-time');
  if (hudTime) {
    setInterval(function () {
      var d = new Date();
      hudTime.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()]
        .map(function (n) { return String(n).padStart(2, '0'); }).join(':');
    }, 1000);
  }
})();