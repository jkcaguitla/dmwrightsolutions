/* DMWright Solutions — front-end behaviour (no dependencies). */
(function () {
	'use strict';

	var doc = document.documentElement;
	var body = document.body;

	/* ---------- Header: scrolled state + mobile nav ---------- */
	var header = document.getElementById('site-header');
	var toggle = document.querySelector('.nav-toggle');
	var nav = document.getElementById('site-nav');

	function setNavTop() {
		if (!header) return;
		var rect = header.getBoundingClientRect();
		doc.style.setProperty('--nav-top', Math.max(0, rect.bottom) + 'px');
	}

	function onScroll() {
		if (header) header.classList.toggle('is-scrolled', window.scrollY > 10);
	}
	window.addEventListener('scroll', onScroll, { passive: true });
	onScroll();

	function closeNav() {
		body.classList.remove('nav-open');
		if (toggle) toggle.setAttribute('aria-expanded', 'false');
	}

	if (toggle && nav) {
		toggle.addEventListener('click', function () {
			setNavTop();
			var open = body.classList.toggle('nav-open');
			toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
			if (open) {
				var first = nav.querySelector('a');
				if (first) first.focus({ preventScroll: true });
			}
		});
		nav.addEventListener('click', function (e) {
			var a = e.target.closest('a');
			if (a && a.getAttribute('href') && a.getAttribute('href').indexOf('#') !== -1) closeNav();
		});
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && body.classList.contains('nav-open')) {
				closeNav();
				toggle.focus();
			}
		});
		window.addEventListener('resize', function () {
			if (window.innerWidth > 1080) closeNav();
			setNavTop();
		});
	}

	/* ---------- Reveal on scroll ---------- */
	var reveals = document.querySelectorAll('.reveal');
	if ('IntersectionObserver' in window && reveals.length) {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-visible');
					io.unobserve(entry.target);
				}
			});
		}, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
		reveals.forEach(function (el) { io.observe(el); });
	} else {
		reveals.forEach(function (el) { el.classList.add('is-visible'); });
	}

	/* ---------- Project filters ---------- */
	document.querySelectorAll('[data-filter-bar]').forEach(function (bar) {
		var grid = bar.nextElementSibling;
		if (!grid || !grid.hasAttribute('data-filter-grid')) return;
		var buttons = bar.querySelectorAll('[data-filter]');

		function apply(filter) {
			buttons.forEach(function (b) {
				var on = b.getAttribute('data-filter') === filter;
				b.classList.toggle('is-active', on);
				b.setAttribute('aria-pressed', on ? 'true' : 'false');
			});
			grid.querySelectorAll('.project-card').forEach(function (card) {
				var show = filter === '*' || card.getAttribute('data-type') === filter;
				card.hidden = !show;
				if (show) card.classList.add('is-visible');
			});
		}
		buttons.forEach(function (b) {
			b.addEventListener('click', function () {
				var f = b.getAttribute('data-filter');
				apply(f);
				if (window.history && history.replaceState) {
					var url = new URL(window.location.href);
					if (f === '*') url.searchParams.delete('type'); else url.searchParams.set('type', f);
					history.replaceState(null, '', url.toString());
				}
			});
		});
		var initial = new URLSearchParams(window.location.search).get('type');
		if (initial && bar.querySelector('[data-filter="' + initial.replace(/[^a-z0-9-]/gi, '') + '"]')) apply(initial);
	});

	/* ---------- Before / after sliders ---------- */
	document.querySelectorAll('[data-ba]').forEach(function (ba) {
		var range = ba.querySelector('input[type=range]');
		if (!range) return;
		function set(v) { ba.style.setProperty('--pos', v + '%'); }
		range.addEventListener('input', function () { set(range.value); });
		set(range.value);
	});

	/* ---------- Lightbox ---------- */
	var lb = document.getElementById('lightbox');
	if (lb) {
		var lbImg = lb.querySelector('img');
		var lbCount = lb.querySelector('.lightbox__count');
		var items = [];
		var index = 0;
		var lastFocus = null;

		function show(i) {
			index = (i + items.length) % items.length;
			var a = items[index];
			lbImg.src = a.getAttribute('href');
			var thumb = a.querySelector('img');
			lbImg.alt = thumb ? thumb.alt : '';
			lbCount.textContent = (index + 1) + ' / ' + items.length;
			// Preload neighbour.
			if (items.length > 1) { var n = new Image(); n.src = items[(index + 1) % items.length].getAttribute('href'); }
		}
		function open(group, i) {
			items = group;
			lastFocus = document.activeElement;
			lb.hidden = false;
			lb.classList.add('is-open');
			body.style.overflow = 'hidden';
			lb.querySelector('.lightbox__prev').hidden = items.length < 2;
			lb.querySelector('.lightbox__next').hidden = items.length < 2;
			show(i);
			lb.querySelector('.lightbox__close').focus();
		}
		function close() {
			lb.classList.remove('is-open');
			lb.hidden = true;
			body.style.overflow = '';
			lbImg.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
			if (lastFocus) lastFocus.focus();
		}

		function groupFor(link) {
			var container = link.closest('[data-lightbox], .wp-block-gallery, .gallery');
			if (!container) return [link];
			return Array.prototype.filter.call(container.querySelectorAll('a[href]'), function (a) {
				return /\.(jpe?g|png|webp|gif|avif)(\?.*)?$/i.test(a.getAttribute('href'));
			});
		}

		document.addEventListener('click', function (e) {
			var a = e.target.closest('[data-lightbox] a, .entry-content .wp-block-gallery a, .entry-content .gallery a, .entry-content a.lightbox-link');
			if (!a || !/\.(jpe?g|png|webp|gif|avif)(\?.*)?$/i.test(a.getAttribute('href') || '')) return;
			e.preventDefault();
			var group = groupFor(a);
			open(group, Math.max(0, group.indexOf(a)));
		});
		lb.querySelector('.lightbox__close').addEventListener('click', close);
		lb.querySelector('.lightbox__prev').addEventListener('click', function () { show(index - 1); });
		lb.querySelector('.lightbox__next').addEventListener('click', function () { show(index + 1); });
		lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
		document.addEventListener('keydown', function (e) {
			if (!lb.classList.contains('is-open')) return;
			if (e.key === 'Escape') close();
			if (e.key === 'ArrowLeft') show(index - 1);
			if (e.key === 'ArrowRight') show(index + 1);
			if (e.key === 'Tab') { // simple focus trap
				var f = lb.querySelectorAll('button:not([hidden])');
				var first = f[0], last = f[f.length - 1];
				if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
				else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
			}
		});
		// Swipe on touch devices.
		var sx = null;
		lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
		lb.addEventListener('touchend', function (e) {
			if (sx === null) return;
			var dx = e.changedTouches[0].clientX - sx;
			if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
			sx = null;
		});
	}

	/* ---------- Consultation form: client-side validation ---------- */
	document.querySelectorAll('[data-consult-form]').forEach(function (form) {
		function fieldError(input, msg) {
			var wrap = input.closest('.field');
			if (!wrap) return;
			var existing = wrap.querySelector('.field__error');
			if (existing) existing.remove();
			wrap.classList.toggle('has-error', !!msg);
			if (msg) {
				var p = document.createElement('p');
				p.className = 'field__error';
				p.textContent = msg;
				wrap.appendChild(p);
			}
		}
		function validate(input) {
			if (input.type === 'radio') {
				var group = form.querySelectorAll('input[name="' + input.name + '"]');
				var any = Array.prototype.some.call(group, function (r) { return r.checked; });
				fieldError(input, input.required && !any ? 'Please choose an option.' : '');
				return !input.required || any;
			}
			var v = input.value.trim();
			var msg = '';
			if (input.required && !v) msg = 'This field is required.';
			else if (input.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'Please enter a valid email address.';
			else if (input.type === 'tel' && v && v.replace(/\D/g, '').length < 10) msg = 'Please enter a valid phone number.';
			fieldError(input, msg);
			return !msg;
		}
		form.querySelectorAll('input[required], textarea[required]').forEach(function (input) {
			input.addEventListener(input.type === 'radio' ? 'change' : 'blur', function () { validate(input); });
		});
		form.addEventListener('submit', function (e) {
			var ok = true, firstBad = null, seen = {};
			form.querySelectorAll('input[required], textarea[required]').forEach(function (input) {
				if (input.type === 'radio') { if (seen[input.name]) return; seen[input.name] = 1; }
				if (!validate(input)) { ok = false; if (!firstBad) firstBad = input; }
			});
			if (!ok) {
				e.preventDefault();
				firstBad.focus();
				return;
			}
			var btn = form.querySelector('[type=submit]');
			if (btn) { btn.disabled = true; btn.style.opacity = '.7'; btn.firstChild.textContent = 'Sending… '; }
		});
	});

	// Bring success/error message into view after redirect.
	var notice = document.querySelector('[data-focus]');
	if (notice) {
		setTimeout(function () { notice.focus({ preventScroll: true }); notice.scrollIntoView({ block: 'center' }); }, 120);
	}
})();
