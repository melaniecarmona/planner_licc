// Créditos oficiales de cada ramo
const creditos = {
  'iic1103': 10,
  'iic1001': 5,
  'mat1107': 10,
  'mat1207': 10,
  'fil2001': 10,
  'iic1253': 10,
  'iic2233': 10,
  'iic2343': 10,
  'mat1610': 10,
  'teologico': 10,
  'iic2133': 10,
  'iic2413': 10,
  'mat1620': 10,
  'mat1203': 10,
  'ofg1': 10,
  'eyp1025': 10,
  'iic2143': 10,
  'iic2224': 10,
  'iic2333': 10,
  'ofg2': 10,
  'iic2560': 10,
  'iic2214': 10,
  'iic2513': 10,
  'ciencias': 10,
  'ofg3': 10,
  'iic2613': 10,
  'iic2283': 10,
  'iic2531': 10,
  'eti1001': 10,
  'ofg4': 10,
  'iic2523': 10,
  'iic2182': 10,
  'opt1': 10,
  'opt2': 10,
  'ofg5': 10,
  'iic2001': 5,
  'iic2164': 10,
  'opt3': 10,
  'opt4': 10,
  'opt5': 10,
  'ofg6': 10
};

// Prerrequisitos de cada ramo (ramos que deben estar aprobados para desbloquear este)
const prerequisitos = {
  'iic1253': [],
  'iic2233': ['iic1103'],
  'mat1610': ['mat1107'],
  'iic2133': ['iic1253', 'iic2233'],
  'iic2413': ['iic1253', 'iic2233'],
  'mat1620': ['mat1610'],
  'mat1203': ['mat1207'],
  'eyp1025': ['iic1253', 'mat1620'],
  'iic2143': ['iic2413'],
  'iic2224': ['iic1253', 'iic2133'],
  'iic2333': ['iic2343'],
  'iic2560': ['iic2343', 'iic2224'],
  'iic2214': ['iic1253'],
  'iic2513': ['iic2143'],
  'iic2613': ['eyp1025', 'iic2233'],
  'iic2283': ['iic2133'],
  'iic2531': [],
  'eti1001': ['iic2143', 'iic2513'],
  'iic2523': ['iic2333'],
  'iic2182': ['iic2513'],
  'iic2001': ['iic2143'],
  'iic2164': ['eti1001', 'iic2182', 'iic2531']
};

function obtenerAprobados() {
  const data = localStorage.getItem('mallaAprobados');
  return data ? JSON.parse(data) : [];
}

function guardarAprobados(aprobados) {
  localStorage.setItem('mallaAprobados', JSON.stringify(aprobados));
}

function calcularCreditosAprobados() {
  const aprobados = obtenerAprobados();
  return aprobados.reduce((sum, ramo) => sum + (creditos[ramo] || 0), 0);
}

function actualizarCreditos() {
  const total = calcularCreditosAprobados();
  const creditosElem = document.getElementById('creditos');
  if (creditosElem) creditosElem.textContent = `Créditos aprobados: ${total}`;
}

function actualizarDesbloqueos() {
  const aprobados = obtenerAprobados();
  for (const [destino, reqs] of Object.entries(prerequisitos)) {
    const elem = document.getElementById(destino);
    if (!elem) continue;
    let puedeDesbloquear = reqs.every(r => aprobados.includes(r));
    if (destino === 'iic1253') {
      puedeDesbloquear = aprobados.includes('mat1207') && aprobados.includes('iic1001') ||
      aprobados.includes('mat1203');
    }
    if (destino === 'iic2531') {
      puedeDesbloquear = aprobados.includes('iic2333') || aprobados.includes('iic2133');
    }
    if (!elem.classList.contains('aprobado')) {
      if (puedeDesbloquear) elem.classList.remove('bloqueado');
      else elem.classList.add('bloqueado');
    } else {
      elem.classList.remove('bloqueado');
    }
  }
}

function aprobar(e) {
  const ramo = e.currentTarget;
  if (ramo.classList.contains('bloqueado')) return;
  ramo.classList.toggle('aprobado');
  const aprobados = obtenerAprobados();
  if (ramo.classList.contains('aprobado')) {
    if (!aprobados.includes(ramo.id)) aprobados.push(ramo.id);
  } else {
    const idx = aprobados.indexOf(ramo.id);
    if (idx > -1) aprobados.splice(idx, 1);
  }
  guardarAprobados(aprobados);
  actualizarDesbloqueos();
  actualizarCreditos();
}

let ramoArrastrado = null;

function arrastrar(e) {
  ramoArrastrado = e.target;
  e.dataTransfer.effectAllowed = 'move';
}

function permitirSoltar(e) {
  e.preventDefault(); // Necesario para permitir soltar
  e.dataTransfer.dropEffect = 'move';
}

function soltar(e) {
  e.preventDefault();
  if (ramoArrastrado && e.currentTarget.classList.contains('semestre')) {
    e.currentTarget.appendChild(ramoArrastrado);
    actualizarDesbloqueos();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const todosRamos = document.querySelectorAll('.ramo');
  const aprobados = obtenerAprobados();
  todosRamos.forEach(ramo => {
    if (aprobados.includes(ramo.id)) ramo.classList.add('aprobado');
    ramo.addEventListener('click', aprobar);
    ramo.setAttribute('draggable', true);
    ramo.addEventListener('dragstart', arrastrar);
  });

  document.querySelectorAll('.semestre').forEach(sem => {
    sem.addEventListener('dragover', permitirSoltar);
    sem.addEventListener('drop', soltar);
  });

  actualizarDesbloqueos();
  actualizarCreditos();

  document.getElementById('agregar-semestre').addEventListener('click', crearSemestre);
});


function getElementoDespues(container, y) {
  const elementos = [...container.querySelectorAll('.ramo:not(.dragging)')];
  return elementos.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function soltar(e) {
  e.preventDefault();
  const contenedor = e.currentTarget;

  if (!ramoArrastrado || !contenedor.classList.contains('semestre')) return;

  const afterElement = getElementoDespues(contenedor, e.clientY);
  if (afterElement == null) {
    contenedor.appendChild(ramoArrastrado);
  } else {
    contenedor.insertBefore(ramoArrastrado, afterElement);
  }

  actualizarDesbloqueos();
}

window.addEventListener('dragend', () => {
  if (ramoArrastrado) ramoArrastrado.classList.remove('dragging');
});

let numeroSemestre = 9;

function crearSemestre() {
  const malla = document.querySelector('.malla-grid');
  const nuevoSem = document.createElement('div');
  nuevoSem.className = 'semestre';
  nuevoSem.id = `sem${numeroSemestre}`;

  nuevoSem.innerHTML = `<h2>${numeroSemestre}° Semestre</h2>`;
  malla.appendChild(nuevoSem);

  // Habilitar como zona de drop
  nuevoSem.addEventListener('dragover', permitirSoltar);
  nuevoSem.addEventListener('drop', soltar);

  numeroSemestre++;
}
