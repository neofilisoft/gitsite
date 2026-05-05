// GitSite – script.js
// All interactive features: star, track, branch selector, code menu, dropdowns, language bar, etc.

'use strict';

/* ========== STATE ========== */
const state = {
  starred: false,
  tracking: false,
  starCount: 925,
  trackCount: 265,
  currentBranch: 'main',
  cloneMode: 'https',
  aboutEditing: false,
  buildsOpen: false,
};

/* ========== UTILS ========== */
function showToast(msg, duration = 2800) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

function closeAllDropdowns(except) {
  const menus = ['branchMenu', 'addFileMenu', 'codeMenu'];
  menus.forEach(id => {
    if (id !== except) {
      const el = document.getElementById(id);
      if (el) el.classList.remove('open');
    }
  });
}

/* ========== NAVBAR HAMBURGER ========== */
function initHamburger() {
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    menu.classList.toggle('open');
  });
}

/* ========== TABS ========== */
function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const name = tab.dataset.tab;
      if (name !== 'code') {
        showToast(`${capitalize(name)} – coming soon`);
      }
    });
  });
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ========== STAR ========== */
function toggleStar() {
  state.starred = !state.starred;
  state.starCount += state.starred ? 1 : -1;

  const btn = document.getElementById('starBtn');
  const countEl = document.getElementById('starCount');
  const statEl = document.getElementById('statStars');

  if (btn) btn.classList.toggle('starred', state.starred);
  const displayCount = state.starCount >= 1000
    ? (state.starCount / 1000).toFixed(2).replace(/\.?0+$/, '') + 'k'
    : state.starCount;
  if (countEl) countEl.textContent = displayCount;
  if (statEl) statEl.textContent = state.starCount;

  showToast(state.starred ? '⭐ Repository starred!' : 'Star removed');
}

/* ========== TRACK ========== */
function toggleTrack() {
  state.tracking = !state.tracking;
  state.trackCount += state.tracking ? 1 : -1;

  const btn = document.getElementById('trackBtn');
  const countEl = document.getElementById('trackCount');
  const statEl = document.getElementById('statTrackers');
  const textNode = btn ? Array.from(btn.childNodes).find(n => n.nodeType === 3) : null;

  if (btn) btn.classList.toggle('tracking', state.tracking);
  if (textNode) textNode.textContent = state.tracking ? ' Tracking ' : ' Track ';
  if (countEl) countEl.textContent = state.trackCount;
  if (statEl) statEl.textContent = state.trackCount;

  showToast(state.tracking ? '👁 Now tracking this repo' : 'Tracking removed');
}

/* ========== BRANCH MENU ========== */
function toggleBranchMenu() {
  closeAllDropdowns('branchMenu');
  const menu = document.getElementById('branchMenu');
  if (menu) menu.classList.toggle('open');
}

function selectBranch(name) {
  state.currentBranch = name;
  const label = document.getElementById('currentBranch');
  if (label) label.textContent = name;

  // Update active state
  document.querySelectorAll('.branch-item').forEach(item => {
    const isActive = item.textContent.trim() === name;
    item.classList.toggle('active', isActive);
  });

  const menu = document.getElementById('branchMenu');
  if (menu) menu.classList.remove('open');
  showToast(`Switched to: ${name}`);
}

function filterBranches(query) {
  const q = query.toLowerCase();
  document.querySelectorAll('.branch-item').forEach(item => {
    const text = item.textContent.trim().toLowerCase();
    item.style.display = text.includes(q) ? '' : 'none';
  });
}

/* ========== ADD FILE MENU ========== */
function toggleAddFile() {
  closeAllDropdowns('addFileMenu');
  const menu = document.getElementById('addFileMenu');
  if (menu) menu.classList.toggle('open');
}

/* ========== CODE MENU ========== */
function toggleCodeMenu() {
  closeAllDropdowns('codeMenu');
  const menu = document.getElementById('codeMenu');
  if (menu) menu.classList.toggle('open');
}

function switchClone(mode) {
  state.cloneMode = mode;
  const input = document.getElementById('cloneUrl');
  const httpsTab = document.getElementById('httpsTab');
  const sshTab = document.getElementById('sshTab');

  if (mode === 'https') {
    if (input) input.value = 'https://projects.blender.org/blender/blender.git';
    if (httpsTab) httpsTab.classList.add('active');
    if (sshTab) sshTab.classList.remove('active');
  } else {
    if (input) input.value = 'git@projects.blender.org:blender/blender.git';
    if (httpsTab) httpsTab.classList.remove('active');
    if (sshTab) sshTab.classList.add('active');
  }
}

function copyCloneUrl() {
  const input = document.getElementById('cloneUrl');
  if (!input) return;
  navigator.clipboard.writeText(input.value)
    .then(() => showToast('Clone URL copied!'))
    .catch(() => {
      input.select();
      document.execCommand('copy');
      showToast('Clone URL copied!');
    });
}

function openWithEditor(editor) {
  const repoUrl = 'https://projects.blender.org/blender/blender.git';
  const uris = {
    vscode: `vscode://vscode.git/clone?url=${encodeURIComponent(repoUrl)}`,
    vscodium: `vscodium://vscode.git/clone?url=${encodeURIComponent(repoUrl)}`,
    cursor: `cursor://vscode.git/clone?url=${encodeURIComponent(repoUrl)}`,
  };
  const uri = uris[editor];
  if (uri) {
    window.location.href = uri;
    showToast(`Opening with ${capitalize(editor)}…`);
  }
  const menu = document.getElementById('codeMenu');
  if (menu) menu.classList.remove('open');
}

function downloadSource(type) {
  const branch = state.currentBranch;
  const baseName = `blender-${branch}`;
  const filename = type === 'zip' ? `${baseName}.zip` : `${baseName}.tar.gz`;
  showToast(`Preparing download: ${filename}`);
  // Simulate download trigger
  const a = document.createElement('a');
  a.href = `https://projects.blender.org/blender/blender/archive/${branch}.${type === 'zip' ? 'zip' : 'tar.gz'}`;
  a.download = filename;
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  const menu = document.getElementById('codeMenu');
  if (menu) menu.classList.remove('open');
}

/* ========== ABOUT EDIT ========== */
function toggleAboutEdit() {
  state.aboutEditing = !state.aboutEditing;
  const display = document.getElementById('aboutDisplay');
  const edit = document.getElementById('aboutEdit');
  if (display) display.style.display = state.aboutEditing ? 'none' : '';
  if (edit) edit.style.display = state.aboutEditing ? '' : 'none';
}

function saveAbout() {
  const text = document.getElementById('aboutTextarea')?.value || '';
  const url = document.getElementById('aboutUrl')?.value || '';

  const display = document.getElementById('aboutDisplay');
  if (display) {
    const p = display.querySelector('.about-text');
    const link = display.querySelector('.about-url');
    if (p) p.textContent = text;
    if (link) {
      link.href = url;
      link.lastChild.textContent = url.replace(/^https?:\/\//, '');
    }
  }
  toggleAboutEdit();
  showToast('About updated!');
}

/* ========== BUILDS ========== */
function toggleBuilds() {
  state.buildsOpen = !state.buildsOpen;
  const list = document.getElementById('buildsList');
  if (list) list.style.display = state.buildsOpen ? '' : 'none';
}

function simulateDownload(e, filename) {
  e.preventDefault();
  showToast(`Downloading ${filename}…`);
}

/* ========== FORK / MODAL ========== */
function showForkNotice() {
  const overlay = document.getElementById('overlay');
  const modal = document.getElementById('forkModal');
  if (overlay) overlay.classList.add('open');
  if (modal) modal.classList.add('open');
}

function closeOverlay() {
  document.querySelectorAll('.overlay').forEach(el => el.classList.remove('open'));
  document.querySelectorAll('.modal').forEach(el => el.classList.remove('open'));
}

function confirmFork() {
  closeOverlay();
  showToast('Forked! Redirecting to your fork…');
}

function showNotice(msg) {
  showToast(`${msg} – coming soon`);
}

/* ========== LANGUAGES ========== */
const LANGUAGES = [
  { name: 'C++',    pct: 79.5, color: '#f34b7d' },
  { name: 'Python', pct: 15.1, color: '#3572A5' },
  { name: 'C',      pct:  1.7, color: '#555555' },
  { name: 'GLSL',   pct:  1.6, color: '#5686a5' },
  { name: 'CMake',  pct:  1.2, color: '#DA3434' },
  { name: 'Other',  pct:  0.9, color: '#8b949e' },
];

function renderLanguages() {
  const bar = document.getElementById('langBar');
  const list = document.getElementById('langList');
  if (!bar || !list) return;

  bar.innerHTML = LANGUAGES.map(l =>
    `<div class="lang-seg" style="width:${l.pct}%;background:${l.color};" title="${l.name} ${l.pct}%"></div>`
  ).join('');

  list.innerHTML = LANGUAGES.map(l =>
    `<div class="lang-row">
      <div class="lang-dot" style="background:${l.color};"></div>
      <span class="lang-name">${l.name}</span>
      <span class="lang-pct">${l.pct}%</span>
    </div>`
  ).join('');
}

/* ========== GLOBAL CLOSE ========== */
function initGlobalClose() {
  document.addEventListener('click', e => {
    // Close branch menu if click outside
    const branchWrap = document.getElementById('branchDropdown');
    if (branchWrap && !branchWrap.contains(e.target)) {
      document.getElementById('branchMenu')?.classList.remove('open');
    }
    // Close add file menu
    const addFileWrap = document.getElementById('addFileWrap');
    if (addFileWrap && !addFileWrap.contains(e.target)) {
      document.getElementById('addFileMenu')?.classList.remove('open');
    }
    // Close code menu
    const codeWrap = document.getElementById('codeWrap');
    if (codeWrap && !codeWrap.contains(e.target)) {
      document.getElementById('codeMenu')?.classList.remove('open');
    }
  });

  // Escape key closes menus & modals
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeAllDropdowns(null);
      closeOverlay();
    }
  });
}

/* ========== INIT ========== */
document.addEventListener('DOMContentLoaded', () => {
  initHamburger();
  initTabs();
  renderLanguages();
  initGlobalClose();
});
