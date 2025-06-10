const unwantedTitles = [
  'news',
  'guidance and regulation',
  'research and statistics',
  'policy papers and consultations',
  'transparency',
  'environment and countryside',
  'change your cookie settings',
  'disabled people',
  'view cookies'
];
const visaPriorityTitles = [
  'visas and immigration',
  'childcare and parenting',
  'check if you need a uk visa',
  'visa to pass through the uk in transit',
  'get an electronic travel authorisation (eta) to visit the uk',
  'visit the uk as a standard visitor',
  'marriage visitor visa',
  'visit the uk in a chinese tour group',
  'working, jobs and pensions'
];

function getCategory(title) {
  const lc = title.toLowerCase();

  // 🎯 Priority label
  if (lc.includes('visas and immigration')) return 'List Of Visa';
  // Visa categories
  if (lc.includes('skilled worker') || lc.includes('work')) return 'Work Visa';
  if (lc.includes('visit') || lc.includes('tourist')) return 'Visit Visa';
  if (lc.includes('study') || lc.includes('student')) return 'Study Visa';
  if (lc.includes('family') || lc.includes('spouse') || lc.includes('child')) return 'Family Visa';

  // 🧩 Meaningful non-visa categories
  if (lc.includes('benefits')) return 'Benefits & Welfare';
  if (lc.includes('births, death') || lc.includes('marriages') || lc.includes('care')) return 'Life Events';
  if (lc.includes('business and self-employed')) return 'Business & Self‑Employment';
  if (lc.includes('citizenship') || lc.includes('living in the uk')) return 'Citizenship & Residency';
  if (lc.includes('crime') || lc.includes('justice') || lc.includes('law')) return 'Crime & Courts';
  if (lc.includes('driving') || lc.includes('transport')) return 'Driving & Transport';
  if (lc.includes('education') || lc.includes('learning')) return 'Education & Learning';
  if (lc.includes('employing people')) return 'Employing Staff';
  if (lc.includes('housing') || lc.includes('local services')) return 'Housing & Local Services';
  if (lc.includes('money') || lc.includes('tax')) return 'Money & Taxes';
  if (lc.includes('passports') || lc.includes('living abroad')) return 'Passports & Travel';
  if (lc.includes('departments')) return 'Government Departments';
  if (lc.includes('visa to pass through the uk in transit')) return 'Transit Visa';
  // Fallback
  return 'Other';
}



function isNotUnwantedTitle(v) {
  const title = v.title.toLowerCase();
  return !unwantedTitles.includes(title);
}

let activeCategory = 'All';
let searchQuery = '';

function getCategoryIcon(category) {
  switch (category) {
    case 'Work Visa': return '💼';
    case 'Visit Visa': return '🧳';
    case 'Study Visa': return '📚';
    case 'Family Visa': return '👨‍👩‍👧‍👦';
    default: return '🧾';
  }
}

function renderVisas() {
  const container = document.getElementById('visa-grid');
  const visasToShow = allVisas.filter(v => {
    const matchCat = activeCategory === 'All' || v.category === activeCategory;
    const matchSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  if (visasToShow.length === 0) {
    container.innerHTML = `<div class="no-results">❌ No visas found. Try a different keyword or category.</div>`;
    return;
  }

  container.innerHTML = visasToShow.map(v => `
    <div class="row-card ${visaPriorityTitles.includes(v.title.toLowerCase()) ? 'priority-visa' : ''}" data-cat="${v.category}">
      <div class="category-heading">
  ${getCategoryIcon(v.category)} ${v.category}
  ${visaPriorityTitles.includes(v.title.toLowerCase()) ? '<span class="tag">Top Visa</span>' : ''}
</div>
      <div class="row-line">
        <span class="visa-title">${v.title}</span>
        <a class="btn" href="${v.url}" target="_blank">View Details</a>
      </div>
    </div>
  `).join('');
}



function renderFilterButtons(categories) {
  const buttonBox = document.getElementById('filter-buttons');
  const allCats = ['All', ...new Set(categories)];
  buttonBox.innerHTML = allCats.map(cat => `
    <button class="filter-btn" data-cat="${cat}">${cat}</button>
  `).join('');

  const buttons = buttonBox.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.cat;
      renderVisas();

    });
  });

  buttons[0].classList.add('active'); // Set "All" as default
}

async function loadVisas() {
  const res = await fetch('https://uk-visa-backend.onrender.com/api/visas');
  const rawVisas = await res.json();

  allVisas = rawVisas
    .filter(isNotUnwantedTitle)
    .map(v => ({ ...v, category: getCategory(v.title) }))
    .sort((a, b) => {
  const aIndex = visaPriorityTitles.indexOf(a.title.toLowerCase());
  const bIndex = visaPriorityTitles.indexOf(b.title.toLowerCase());

  if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
  if (aIndex !== -1) return -1;
  if (bIndex !== -1) return 1;

  return a.category.localeCompare(b.category); // fallback by category
});


  const categories = allVisas.map(v => v.category);
  renderFilterButtons(categories);
  renderVisas();
  document.getElementById('searchInput').addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderVisas();
});

}

loadVisas();
