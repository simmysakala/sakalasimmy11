/* simeon sakala - ICT251 Activity 3
   Features: 1) contact form validation and preview (compulsory)
             2) gallery viewer  3) theme switch  4) mobile navigation
             5) project search/filter and expandable details (extras)
             6) study hours calculator (extra) */
'use strict';

// Lets the CSS know JavaScript is running, so the mobile menu can collapse safely.
document.documentElement.classList.add('js');

/* ---------- Helper: shorter element lookup ---------- */
function byId(id) { return document.getElementById(id); }

/* ---------- Feature 1: contact form validation and preview ---------- */
const form = byId('contact-form');
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Shows or clears an error message next to a field.
function setError(fieldId, message) {
  const field = byId(fieldId);
  byId(fieldId + '-error').textContent = message;
  field.classList.toggle('invalid', message !== '');
  if (message) { field.setAttribute('aria-invalid', 'true'); }
  else { field.removeAttribute('aria-invalid'); }
}

// Checks all three fields. Returns the clean values, or null when something is wrong.
function validateContact() {
  const name = byId('name').value.trim();
  const email = byId('email').value.trim();
  const message = byId('message').value.trim();
  let firstBad = null;
  const problems = [
    ['name', name === '' ? 'Enter your name. Spaces alone are not accepted.' : ''],
    ['email', email === '' ? 'Enter your email address.' : (!emailPattern.test(email) ? 'Enter an email like name@example.com.' : '')],
    ['message', message === '' ? 'Write a message. Spaces alone are not accepted.' : '']
  ];
  problems.forEach(function (item) {
    setError(item[0], item[1]);
    if (item[1] && !firstBad) { firstBad = item[0]; }
  });
  if (firstBad) { byId(firstBad).focus(); return null; }
  return { name: name, email: email, message: message };
}

if (form) {
  form.addEventListener('submit', function (event) {
    event.preventDefault(); // keep everything in the browser
    const preview = byId('form-preview');
    const data = validateContact();
    if (!data) { preview.hidden = true; return; }
    // textContent keeps user text from being treated as HTML
    byId('preview-name').textContent = data.name;
    byId('preview-email').textContent = data.email;
    byId('preview-message').textContent = data.message;
    preview.hidden = false;
    preview.scrollIntoView({ block: 'nearest' });
  });
}

/* ---------- Feature 2: gallery viewer ---------- */
const slides = Array.from(document.querySelectorAll('#gallery .slide'));
const prevBtn = byId('prev-photo');
const nextBtn = byId('next-photo');
let currentSlide = 0;

// Shows one photo with its caption; disables the buttons at the first and last photo.
function showSlide(index) {
  currentSlide = Math.max(0, Math.min(index, slides.length - 1));
  slides.forEach(function (slide, i) { slide.hidden = i !== currentSlide; });
  byId('photo-count').textContent = 'Photo ' + (currentSlide + 1) + ' of ' + slides.length;
  prevBtn.disabled = currentSlide === 0;
  nextBtn.disabled = currentSlide === slides.length - 1;
}

if (slides.length) {
  prevBtn.addEventListener('click', function () { showSlide(currentSlide - 1); });
  nextBtn.addEventListener('click', function () { showSlide(currentSlide + 1); });
  showSlide(0);
}

/* ---------- Feature 3: theme switch (saved in the browser) ---------- */
const themeBtn = byId('theme-toggle');

// Applies the light or dark theme and updates the button text and state.
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const dark = theme === 'dark';
  themeBtn.setAttribute('aria-pressed', String(dark));
  themeBtn.textContent = dark ? 'Light mode' : 'Dark mode';
}

let savedTheme = 'light';
try { savedTheme = localStorage.getItem('theme') || 'light'; } catch (e) { /* storage blocked: use light */ }
applyTheme(savedTheme);

themeBtn.addEventListener('click', function () {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
});

/* ---------- Feature 4: mobile navigation ---------- */
const navBtn = byId('nav-toggle');
const nav = byId('site-nav');

// Opens or closes the menu and keeps the button label and aria state in step.
function setMenu(open) {
  nav.classList.toggle('open', open);
  navBtn.setAttribute('aria-expanded', String(open));
  navBtn.textContent = open ? 'Close' : 'Menu';
}

navBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
nav.querySelectorAll('a').forEach(function (link) {
  link.addEventListener('click', function () { setMenu(false); });
});
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); navBtn.focus(); }
});

/* ---------- Extra: project filter and expandable details ---------- */
const projects = Array.from(document.querySelectorAll('.project'));
const searchBox = byId('project-search');
const filterMsg = byId('filter-message');

// Shows only projects whose title or keywords contain the search text.
function filterProjects() {
  const term = searchBox.value.trim().toLowerCase();
  let shown = 0;
  projects.forEach(function (project) {
    const text = (project.querySelector('h3').textContent + ' ' + project.dataset.keywords).toLowerCase();
    const match = term === '' || text.includes(term);
    project.hidden = !match;
    if (match) { shown += 1; }
  });
  if (shown === 0) {
    filterMsg.textContent = 'No projects match "' + searchBox.value.trim() + '". Press Reset to see all projects.';
    filterMsg.classList.add('bad');
  } else {
    filterMsg.textContent = term === '' ? '' : 'Showing ' + shown + ' of ' + projects.length + ' projects.';
    filterMsg.classList.remove('bad');
  }
}

searchBox.addEventListener('input', filterProjects);
byId('filter-reset').addEventListener('click', function () {
  searchBox.value = '';
  filterProjects();
  searchBox.focus();
});

// Opens or closes a project's details and updates the button text.
document.querySelectorAll('.toggle-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    const panel = byId(btn.getAttribute('aria-controls'));
    const open = btn.getAttribute('aria-expanded') === 'true';
    panel.hidden = open;
    btn.setAttribute('aria-expanded', String(!open));
    btn.textContent = open ? 'Show details' : 'Hide details';
  });
});

/* ---------- Extra: study hours calculator ---------- */
byId('hours-form').addEventListener('submit', function (event) {
  event.preventDefault();
  const out = byId('hours-result');
  const hoursText = byId('hours-day').value.trim();
  const daysText = byId('days-week').value.trim();
  const hours = Number(hoursText);
  const days = Number(daysText);
  out.classList.add('bad');
  if (hoursText === '' || daysText === '') { out.textContent = 'Fill in both boxes.'; return; }
  if (Number.isNaN(hours) || Number.isNaN(days)) { out.textContent = 'Use numbers only, for example 2.5 and 5.'; return; }
  if (hours < 0) { out.textContent = 'Hours per day cannot be negative.'; return; }
  if (hours > 24) { out.textContent = 'A day has only 24 hours. Enter 24 or fewer.'; return; }
  if (!Number.isInteger(days) || days < 1 || days > 7) { out.textContent = 'Days per week must be a whole number from 1 to 7.'; return; }
  out.classList.remove('bad');
  out.textContent = 'You plan to study ' + (hours * days) + ' hours each week.';
});
