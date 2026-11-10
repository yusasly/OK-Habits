(() => {
  'use strict';

  /* ---------- Constantes ---------- */
  const CLAVE = 'okhabits.v1';
  const CLAVE_AJUSTES = 'okhabits.ajustes.v1';
  const ICONOS = [
    ['droplet-fill', 'Gota de agua'], ['cup-hot-fill', 'Taza caliente'], ['book-fill', 'Libro'],
    ['bicycle', 'Bicicleta'], ['heart-pulse-fill', 'Salud'], ['moon-stars-fill', 'Dormir'],
    ['sun-fill', 'Sol'], ['music-note-beamed', 'Música'], ['basket-fill', 'Canasta'],
    ['trophy-fill', 'Trofeo'], ['alarm-fill', 'Alarma'], ['lightbulb-fill', 'Idea'],
    ['tree-fill', 'Árbol'], ['flower1', 'Flor'], ['camera-fill', 'Cámara'],
    ['headphones', 'Audífonos'], ['mortarboard-fill', 'Estudio'], ['palette-fill', 'Arte'],
    ['brush-fill', 'Pincel'], ['house-fill', 'Casa'], ['cup-straw', 'Bebida'],
    ['egg-fried', 'Comida'], ['person-walking', 'Caminar'], ['gift-fill', 'Regalo']
  ];
  // Colores disponibles: son los colores de tema de Bootstrap (clases utilitarias *-subtle / *-emphasis)
  const COLORES = [
    ['primary', 'Azul'], ['success', 'Verde'], ['danger', 'Rojo'],
    ['warning', 'Ámbar'], ['info', 'Cian'], ['secondary', 'Gris']
  ];
  const TEMAS = ['light', 'dark', 'auto'];
  const TAMANOS = [100, 125, 150, 175];
  const FUENTE_DISLEXIA = '"OpenDyslexic", "Lexend", "Atkinson Hyperlegible", Verdana, "Comic Sans MS", sans-serif';
  const VARS_CONTRASTE = [
    '--bs-body-color', '--bs-emphasis-color', '--bs-secondary-text-emphasis',
    '--bs-primary-text-emphasis', '--bs-border-color'
  ];
  const VISTAS = {
    habitos:    { titulo: 'Empieza con un hábito', sub: 'Marca cada hábito cuando lo completes hoy.' },
    racha:      { titulo: 'Tu racha',              sub: 'Días seguidos cumpliendo tus hábitos.' },
    calendario: { titulo: 'Tu calendario',         sub: 'Toca un día para marcar o desmarcar tus hábitos.' },
    config:     { titulo: 'Configuración',         sub: 'Personaliza la app y administra tus datos.' }
  };

  /* ---------- Utilidades ---------- */
  const $ = id => document.getElementById(id);
  const pad = n => String(n).padStart(2, '0');
  const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const aFecha = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12); };
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const plural = n => (n === 1 ? 'día' : 'días');
  const nombreMes = d => `${d.toLocaleDateString('es-MX', { month: 'long' })} ${d.getFullYear()}`;
  const iconoValido = c => typeof c === 'string' && /^[a-z0-9-]+$/.test(c);
  const colorValido = c => COLORES.some(([v]) => v === c);
  const nuevoId = () => `h${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  function el(tag, cls, attrs) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (attrs) Object.keys(attrs).forEach(k => e.setAttribute(k, attrs[k]));
    return e;
  }
  function icono(clase, extra) {
    return el('i', `bi bi-${clase}${extra ? ' ' + extra : ''}`, { 'aria-hidden': 'true' });
  }
  function circuloIcono(h, extra) {
    const c = colorValido(h.color) ? h.color : 'primary';
    const s = el('span', `d-flex align-items-center justify-content-center rounded-circle bg-${c}-subtle text-${c}-emphasis lh-1 flex-shrink-0 ${extra}`);
    s.appendChild(icono(iconoValido(h.icono) ? h.icono : 'star'));
    return s;
  }

  /* ---------- Persistencia y validación de datos ---------- */
  function leer(clave) {
    try {
      const raw = localStorage.getItem(clave);
      return raw === null ? null : JSON.parse(raw);
    } catch (e) { return null; }
  }
  function escribir(clave, valor) {
    try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) { /* almacenamiento no disponible */ }
  }

  const porDefecto = () => [{ id: 'agua', nombre: 'Tomar agua', icono: 'droplet-fill', color: 'info', dias: [] }];

  function sanearHabitos(lista) {
    const ids = new Set();
    const salida = [];
    lista.forEach(h => {
      if (!h || typeof h !== 'object') return;
      const nombre = typeof h.nombre === 'string' ? h.nombre.replace(/\s+/g, ' ').trim().slice(0, 60) : '';
      if (!nombre) return;
      let id = typeof h.id === 'string' && /^[\w-]{1,40}$/.test(h.id) ? h.id : nuevoId();
      while (ids.has(id)) id = nuevoId();
      ids.add(id);
      const dias = Array.isArray(h.dias)
        ? [...new Set(h.dias.filter(d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)))]
        : [];
      salida.push({
        id, nombre,
        icono: iconoValido(h.icono) ? h.icono : 'star',
        color: colorValido(h.color) ? h.color : 'primary',
        dias
      });
    });
    return salida;
  }

  function sanearAjustes(a) {
    const base = { tema: 'auto', tamano: 100, contraste: false, dislexia: false };
    if (!a || typeof a !== 'object') return base;
    return {
      tema: TEMAS.includes(a.tema) ? a.tema : base.tema,
      tamano: TAMANOS.includes(Number(a.tamano)) ? Number(a.tamano) : base.tamano,
      contraste: a.contraste === true,
      dislexia: a.dislexia === true
    };
  }

  const datosGuardados = leer(CLAVE);
  let habitos = Array.isArray(datosGuardados) ? sanearHabitos(datosGuardados) : porDefecto();
  let ajustes = sanearAjustes(leer(CLAVE_AJUSTES));
  const guardar = () => escribir(CLAVE, habitos);
  const guardarAjustes = () => escribir(CLAVE_AJUSTES, ajustes);
  guardar();

  /* ---------- Referencias al DOM ---------- */
  const raiz = document.documentElement;
  const barra = $('barra');
  const lista = $('lista'), vacio = $('vacio'), resumen = $('resumen');
  const titulo = $('titulo'), subtitulo = $('subtitulo'), estado = $('estado');
  const secciones = document.querySelectorAll('section[data-vista]');
  const enlaces = document.querySelectorAll('#menu [data-ir]');
  const menuEl = $('menu');
  const modalEl = $('modalHabito');
  const modal = new bootstrap.Modal(modalEl);
  const modalDiaEl = $('modalDia');
  const modalDia = new bootstrap.Modal(modalDiaEl);
  const form = $('formHabito'), inputNombre = $('nombreHabito'), fbNombre = $('fbNombre');
  const btnIcono = $('btnIcono'), panelIconos = $('panelIconos'), gridIconos = $('gridIconos');
  const gridColores = $('gridColores');
  const iconoPrev = $('iconoPrev'), errIcono = $('errIcono');
  const btnEliminar = $('btnEliminar');

  let vistaActual = 'habitos';
  let diaActual = fmt(new Date());
  let mesVisible = new Date(); mesVisible.setDate(1);
  let editandoId = null, iconoSel = null, colorSel = 'primary', confirmandoEliminar = false;
  let enfocarTitulo = false;

  const anunciar = msg => { estado.textContent = ''; estado.textContent = msg; };

  /* ---------- Tema y accesibilidad ---------- */
  const mqOscuro = window.matchMedia('(prefers-color-scheme: dark)');

  function aplicarAjustes() {
    const oscuro = ajustes.tema === 'dark' || (ajustes.tema === 'auto' && mqOscuro.matches);
    const tema = oscuro ? 'dark' : 'light';
    raiz.setAttribute('data-bs-theme', tema);
    barra.setAttribute('data-bs-theme', tema);

    // Miopía / baja visión: escala todo el texto (Bootstrap usa rem)
    raiz.style.fontSize = ajustes.tamano === 100 ? '' : `${ajustes.tamano}%`;

    // Alto contraste: texto y bordes en blanco o negro puro, y letra más gruesa
    const maximo = oscuro ? '#ffffff' : '#000000';
    VARS_CONTRASTE.forEach(v => {
      if (ajustes.contraste) raiz.style.setProperty(v, maximo); else raiz.style.removeProperty(v);
    });
    if (ajustes.contraste) raiz.style.setProperty('--bs-body-font-weight', '500');
    else raiz.style.removeProperty('--bs-body-font-weight');

    // Dislexia: fuente legible y más espacio entre letras, palabras y líneas
    if (ajustes.dislexia) {
      raiz.style.setProperty('--bs-body-font-family', FUENTE_DISLEXIA);
      raiz.style.setProperty('--bs-body-line-height', '1.8');
      raiz.style.letterSpacing = '0.05em';
      raiz.style.wordSpacing = '0.16em';
    } else {
      raiz.style.removeProperty('--bs-body-font-family');
      raiz.style.removeProperty('--bs-body-line-height');
      raiz.style.letterSpacing = '';
      raiz.style.wordSpacing = '';
    }
  }

  function sincronizarControles() {
    $('selTema').value = ajustes.tema;
    $('selTamano').value = String(ajustes.tamano);
    $('swContraste').checked = ajustes.contraste;
    $('swDislexia').checked = ajustes.dislexia;
  }

  function cambiarAjustes() { guardarAjustes(); aplicarAjustes(); }

  $('selTema').addEventListener('change', e => {
    ajustes.tema = TEMAS.includes(e.target.value) ? e.target.value : 'auto';
    cambiarAjustes();
  });
  $('selTamano').addEventListener('change', e => {
    const n = Number(e.target.value);
    ajustes.tamano = TAMANOS.includes(n) ? n : 100;
    cambiarAjustes();
  });
  $('swContraste').addEventListener('change', e => { ajustes.contraste = e.target.checked; cambiarAjustes(); });
  $('swDislexia').addEventListener('change', e => { ajustes.dislexia = e.target.checked; cambiarAjustes(); });

  const alCambiarSistema = () => { if (ajustes.tema === 'auto') aplicarAjustes(); };
  if (mqOscuro.addEventListener) mqOscuro.addEventListener('change', alCambiarSistema);
  else if (mqOscuro.addListener) mqOscuro.addListener(alCambiarSistema);

  sincronizarControles();
  aplicarAjustes();

  /* ---------- Rachas ---------- */
  function rachaActual(set) {
    const d = new Date(); d.setHours(12, 0, 0, 0);
    if (!set.has(fmt(d))) d.setDate(d.getDate() - 1);
    let n = 0;
    while (set.has(fmt(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function mejorRacha(set) {
    let mejor = 0, act = 0, prev = null;
    [...set].sort().forEach(s => {
      const f = aFecha(s);
      act = prev && Math.round((f - prev) / 864e5) === 1 ? act + 1 : 1;
      if (act > mejor) mejor = act;
      prev = f;
    });
    return mejor;
  }
  const todosLosDias = () => new Set(habitos.flatMap(h => h.dias));

  function alternarDia(h, clave, marcado) {
    const i = h.dias.indexOf(clave);
    if (marcado) { if (i === -1) h.dias.push(clave); }
    else if (i !== -1) h.dias.splice(i, 1);
    guardar();
  }

  /* ---------- Tarjetas de hábitos ---------- */
  function aplicarEstado(card, chk, hecho, color) {
    card.className = 'card h-100 shadow-sm rounded-4 position-relative mx-1 border border-2 ' +
      (hecho ? 'border-success bg-success-subtle' : `border-${color}-subtle`);
    chk.className = 'form-check-input fs-3 m-0 flex-shrink-0' + (hecho ? ' bg-success border-success' : '');
  }

  function crearTarjeta(h) {
    const hoy = fmt(new Date());
    const hecho = h.dias.includes(hoy);
    const col = el('div', 'col-12 col-md-6');
    const card = el('div');
    const body = el('div', 'card-body d-flex align-items-center gap-3');

    const circulo = circuloIcono(h, 'p-3 fs-4');

    const idChk = `chk-${h.id}`;
    const label = el('label', 'flex-grow-1 fw-semibold fs-5 mb-0 text-break stretched-link', { for: idChk });
    label.textContent = h.nombre;

    const btnEd = el('button', 'btn bg-body-secondary text-body rounded-circle lh-1 p-2 position-relative z-2 flex-shrink-0', {
      type: 'button', 'data-accion': 'editar', 'data-id': h.id, 'aria-label': `Editar hábito ${h.nombre}`
    });
    btnEd.appendChild(icono('pencil'));

    const chk = el('input', '', { type: 'checkbox', id: idChk, 'data-accion': 'marcar', 'data-id': h.id });
    chk.checked = hecho;

    aplicarEstado(card, chk, hecho, h.color);
    body.append(circulo, label, btnEd, chk);
    card.appendChild(body);
    col.appendChild(card);
    return col;
  }

  function render() {
    lista.replaceChildren();
    habitos.forEach(h => lista.appendChild(crearTarjeta(h)));
    vacio.classList.toggle('d-none', habitos.length > 0);
    actualizarResumen();
  }

  function actualizarResumen() {
    const hoy = fmt(new Date());
    const hechos = habitos.filter(h => h.dias.includes(hoy)).length;
    const fecha = cap(new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }));
    resumen.textContent = habitos.length
      ? `${fecha} · ${hechos} de ${habitos.length} completados`
      : fecha;
    const r = rachaActual(todosLosDias());
    $('rachaHome').textContent = r;
    $('unidadHome').textContent = plural(r);
    $('mesHome').textContent = nombreMes(new Date());
  }

  lista.addEventListener('change', e => {
    const chk = e.target.closest('input[data-accion="marcar"]');
    if (!chk) return;
    const h = habitos.find(x => x.id === chk.dataset.id);
    if (!h) return;
    alternarDia(h, fmt(new Date()), chk.checked);
    aplicarEstado(chk.closest('.card'), chk, chk.checked, h.color);
    actualizarResumen();
    anunciar(`${h.nombre}: ${chk.checked ? 'completado' : 'pendiente'}`);
  });

  lista.addEventListener('click', e => {
    const b = e.target.closest('button[data-accion="editar"]');
    if (b) abrirModal(b.dataset.id);
  });

  /* ---------- Vista Racha ---------- */
  function renderRacha() {
    const r = rachaActual(todosLosDias());
    const mejor = mejorRacha(todosLosDias());
    $('rachaNum').textContent = r;
    $('rachaUnidad').textContent = plural(r);
    $('mejorNum').textContent = `${mejor} ${plural(mejor)}`;
    const ul = $('listaRacha');
    ul.replaceChildren();
    if (!habitos.length) {
      const li = el('li', 'list-group-item bg-transparent px-0 text-secondary-emphasis');
      li.textContent = 'Todavía no hay hábitos.';
      ul.appendChild(li);
      return;
    }
    habitos.forEach(h => {
      const n = rachaActual(new Set(h.dias));
      const li = el('li', 'list-group-item bg-transparent d-flex align-items-center gap-3 px-0');
      const nom = el('span', 'flex-grow-1 text-break');
      nom.textContent = h.nombre;
      const b = el('span', `badge ${n ? 'text-bg-success' : 'text-bg-secondary'}`);
      b.textContent = `${n} ${plural(n)}`;
      li.append(circuloIcono(h, 'p-2'), nom, b);
      ul.appendChild(li);
    });
  }

  /* ---------- Vista Calendario (interactivo) ---------- */
  function pintarDia(btn, clave, n) {
    const total = habitos.length;
    const hoy = fmt(new Date());
    const estadoDia = total && n === total ? 'btn-success'
      : n > 0 ? 'bg-success-subtle text-success-emphasis'
      : 'bg-body-secondary text-body';
    btn.className = `btn btn-sm w-100 py-2 px-0 ${estadoDia}${clave === hoy ? ' border border-2 border-primary' : ''}`;
    const cuando = aFecha(clave).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' });
    btn.setAttribute('aria-label',
      `${cuando}: ${n} de ${total} hábitos completados${clave > hoy ? '. Día futuro, no editable' : '. Toca para editar'}`);
  }

  const contarDia = clave => habitos.filter(h => h.dias.includes(clave)).length;

  function renderCalendario() {
    const y = mesVisible.getFullYear(), m = mesVisible.getMonth();
    $('mesTitulo').textContent = nombreMes(mesVisible);
    const hoy = fmt(new Date());
    const primero = new Date(y, m, 1).getDay();
    const total = new Date(y, m + 1, 0).getDate();
    const cal = $('cal');
    cal.replaceChildren();

    const cab = el('div', 'row g-1 mb-1 text-center fw-semibold');
    [['D', 'Domingo'], ['L', 'Lunes'], ['M', 'Martes'], ['M', 'Miércoles'], ['J', 'Jueves'], ['V', 'Viernes'], ['S', 'Sábado']]
      .forEach(([corto, largo]) => {
        const c = el('div', 'col');
        const a = el('span', '', { 'aria-hidden': 'true' }); a.textContent = corto;
        const b = el('span', 'visually-hidden'); b.textContent = largo;
        c.append(a, b);
        cab.appendChild(c);
      });
    cal.appendChild(cab);

    let dia = 1;
    for (let semana = 0; dia <= total; semana++) {
      const fila = el('div', 'row g-1 mb-1');
      for (let c = 0; c < 7; c++) {
        const col = el('div', 'col');
        if (!((semana === 0 && c < primero) || dia > total)) {
          const clave = `${y}-${pad(m + 1)}-${pad(dia)}`;
          const b = el('button', '', { type: 'button', 'data-fecha': clave });
          b.textContent = dia;
          if (clave === hoy) b.setAttribute('aria-current', 'date');
          if (clave > hoy) b.disabled = true;
          pintarDia(b, clave, contarDia(clave));
          col.appendChild(b);
          dia++;
        }
        fila.appendChild(col);
      }
      cal.appendChild(fila);
    }
  }

  $('cal').addEventListener('click', e => {
    const b = e.target.closest('button[data-fecha]');
    if (b && !b.disabled) abrirDia(b.dataset.fecha);
  });
  $('mesAnterior').addEventListener('click', () => { mesVisible.setMonth(mesVisible.getMonth() - 1); renderCalendario(); });
  $('mesSiguiente').addEventListener('click', () => { mesVisible.setMonth(mesVisible.getMonth() + 1); renderCalendario(); });

  /* ---------- Modal de edición de un día ---------- */
  let diaEditando = null;

  function resumenDia() {
    $('resumenDia').textContent = habitos.length
      ? `${contarDia(diaEditando)} de ${habitos.length} hábitos completados`
      : '';
  }

  function abrirDia(clave) {
    diaEditando = clave;
    $('modalDiaTitulo').textContent = cap(aFecha(clave).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }));
    const ul = $('listaDia');
    ul.replaceChildren();
    if (!habitos.length) {
      const li = el('li', 'list-group-item bg-transparent px-0 text-secondary-emphasis');
      li.textContent = 'No hay hábitos para editar. Crea uno desde Hábitos.';
      ul.appendChild(li);
    }
    habitos.forEach(h => {
      const hecho = h.dias.includes(clave);
      const li = el('li', 'list-group-item bg-transparent d-flex align-items-center gap-3 px-0 position-relative');
      const idChk = `dia-${h.id}`;
      const label = el('label', 'flex-grow-1 fw-semibold mb-0 text-break stretched-link', { for: idChk });
      label.textContent = h.nombre;
      const chk = el('input', `form-check-input fs-3 m-0 flex-shrink-0${hecho ? ' bg-success border-success' : ''}`,
        { type: 'checkbox', id: idChk, 'data-id': h.id });
      chk.checked = hecho;
      li.append(circuloIcono(h, 'p-2 fs-5'), label, chk);
      ul.appendChild(li);
    });
    resumenDia();
    modalDia.show();
  }

  $('listaDia').addEventListener('change', e => {
    const chk = e.target.closest('input[data-id]');
    if (!chk || !diaEditando) return;
    const h = habitos.find(x => x.id === chk.dataset.id);
    if (!h) return;
    alternarDia(h, diaEditando, chk.checked);
    chk.className = `form-check-input fs-3 m-0 flex-shrink-0${chk.checked ? ' bg-success border-success' : ''}`;
    resumenDia();
    const btn = $('cal').querySelector(`button[data-fecha="${diaEditando}"]`);
    if (btn) pintarDia(btn, diaEditando, contarDia(diaEditando));
    render();
    anunciar(`${h.nombre}: ${chk.checked ? 'completado' : 'pendiente'}`);
  });

  /* ---------- Navegación entre vistas ---------- */
  function mostrarVista(nombre) {
    if (!VISTAS[nombre]) nombre = 'habitos';
    vistaActual = nombre;
    secciones.forEach(s => s.classList.toggle('d-none', s.dataset.vista !== nombre));
    enlaces.forEach(a => {
      if (!a.classList.contains('nav-link')) return;
      const act = a.dataset.ir === nombre;
      a.classList.toggle('active', act);
      if (act) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    titulo.textContent = VISTAS[nombre].titulo;
    subtitulo.textContent = VISTAS[nombre].sub;
    document.title = nombre === 'habitos' ? 'OK Habits' : `${VISTAS[nombre].titulo} · OK Habits`;
    if (nombre === 'racha') renderRacha();
    if (nombre === 'calendario') { mesVisible = new Date(); mesVisible.setDate(1); renderCalendario(); }
    try { history.replaceState(null, '', '#' + nombre); } catch (e) { /* ignorar */ }
  }

  document.addEventListener('click', e => {
    const a = e.target.closest('[data-ir]');
    if (!a) return;
    e.preventDefault();
    mostrarVista(a.dataset.ir);
    if (a.closest('#menu')) {
      enfocarTitulo = true;
      bootstrap.Offcanvas.getOrCreateInstance(menuEl).hide();
    } else {
      window.scrollTo(0, 0);
      titulo.focus();
    }
  });
  menuEl.addEventListener('hidden.bs.offcanvas', () => {
    if (enfocarTitulo) { enfocarTitulo = false; window.scrollTo(0, 0); titulo.focus(); }
  });

  /* ---------- Modal de hábito: íconos y colores ---------- */
  function actualizarPrev() {
    iconoPrev.className = `bi bi-${iconoSel || 'emoji-smile'} me-2 text-${colorSel}-emphasis`;
  }

  ICONOS.forEach(([clase, nombre]) => {
    const col = el('div', 'col');
    const b = el('button', 'btn bg-body-secondary text-body border w-100 fs-4 lh-1 py-2', {
      type: 'button', 'data-icono': clase, 'aria-label': nombre, 'aria-pressed': 'false', title: nombre
    });
    b.appendChild(icono(clase));
    col.appendChild(b);
    gridIconos.appendChild(col);
  });

  function elegirIcono(clase) {
    iconoSel = clase;
    gridIconos.querySelectorAll('button').forEach(b => {
      const act = b.dataset.icono === clase;
      b.className = `btn ${act ? 'btn-primary' : 'bg-body-secondary text-body border'} w-100 fs-4 lh-1 py-2`;
      b.setAttribute('aria-pressed', String(act));
    });
    if (clase) errIcono.classList.add('d-none');
    actualizarPrev();
  }

  gridIconos.addEventListener('click', e => {
    const b = e.target.closest('button[data-icono]');
    if (!b) return;
    elegirIcono(b.dataset.icono);
    bootstrap.Collapse.getOrCreateInstance(panelIconos, { toggle: false }).hide();
  });

  COLORES.forEach(([valor, nombre]) => {
    const b = el('button', `btn btn-${valor} rounded-circle fs-4 lh-1 p-2`, {
      type: 'button', 'data-color': valor, 'aria-label': nombre, 'aria-pressed': 'false', title: nombre
    });
    b.appendChild(icono('check-lg', 'opacity-0'));
    gridColores.appendChild(b);
  });

  function elegirColor(valor) {
    colorSel = colorValido(valor) ? valor : 'primary';
    gridColores.querySelectorAll('button').forEach(b => {
      const act = b.dataset.color === colorSel;
      b.setAttribute('aria-pressed', String(act));
      b.firstChild.className = `bi bi-check-lg${act ? '' : ' opacity-0'}`;
    });
    actualizarPrev();
  }

  gridColores.addEventListener('click', e => {
    const b = e.target.closest('button[data-color]');
    if (b) elegirColor(b.dataset.color);
  });

  /* ---------- Modal de hábito: abrir, validar y guardar ---------- */
  function resetEliminar() {
    confirmandoEliminar = false;
    btnEliminar.textContent = 'Eliminar hábito';
    btnEliminar.className = 'btn border border-danger text-danger-emphasis d-none';
  }

  function abrirModal(id) {
    editandoId = id || null;
    const h = id ? habitos.find(x => x.id === id) : null;
    if (id && !h) return;
    $('modalTitulo').textContent = h ? 'Editar hábito' : 'Nuevo hábito';
    inputNombre.value = h ? h.nombre : '';
    inputNombre.setCustomValidity('');
    form.classList.remove('was-validated');
    elegirIcono(h ? h.icono : null);
    elegirColor(h ? h.color : 'primary');
    errIcono.classList.add('d-none');
    resetEliminar();
    btnEliminar.classList.toggle('d-none', !h);
    panelIconos.classList.remove('show');
    btnIcono.classList.add('collapsed');
    btnIcono.setAttribute('aria-expanded', 'false');
    modal.show();
  }

  $('btnNuevo').addEventListener('click', () => abrirModal(null));
  modalEl.addEventListener('shown.bs.modal', () => inputNombre.focus());
  inputNombre.addEventListener('input', () => { inputNombre.setCustomValidity(''); });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const nombre = inputNombre.value.replace(/\s+/g, ' ').trim();
    let error = '';
    if (!nombre) error = 'Escribe el nombre de tu hábito.';
    else if (nombre.length < 3) error = 'Usa al menos 3 caracteres.';
    else if (habitos.some(h => h.id !== editandoId && h.nombre.toLowerCase() === nombre.toLowerCase())) {
      error = 'Ya tienes un hábito con ese nombre.';
    }
    inputNombre.setCustomValidity(error);
    fbNombre.textContent = error;
    const iconoOk = Boolean(iconoSel);
    errIcono.classList.toggle('d-none', iconoOk);
    form.classList.add('was-validated');
    if (!form.checkValidity() || !iconoOk) return;

    if (editandoId) {
      const h = habitos.find(x => x.id === editandoId);
      if (h) { h.nombre = nombre; h.icono = iconoSel; h.color = colorSel; }
      anunciar(`Hábito actualizado: ${nombre}`);
    } else {
      habitos.push({ id: nuevoId(), nombre, icono: iconoSel, color: colorSel, dias: [] });
      anunciar(`Hábito agregado: ${nombre}`);
    }
    guardar();
    render();
    modal.hide();
  });

  btnEliminar.addEventListener('click', () => {
    if (!confirmandoEliminar) {
      confirmandoEliminar = true;
      btnEliminar.textContent = 'Confirmar eliminación';
      btnEliminar.className = 'btn btn-danger';
      return;
    }
    habitos = habitos.filter(h => h.id !== editandoId);
    guardar();
    render();
    modal.hide();
    anunciar('Hábito eliminado');
  });

  /* ---------- Configuración: importar / exportar JSON ---------- */
  function aviso(tipo, texto, botones) {
    const cont = $('avisoDatos');
    cont.replaceChildren();
    cont.classList.remove('d-none');
    const caja = el('div', `alert alert-${tipo} mb-0`);
    const p = el('p', botones && botones.length ? 'mb-2' : 'mb-0');
    p.textContent = texto;
    caja.appendChild(p);
    if (botones && botones.length) {
      const fila = el('div', 'd-flex flex-wrap gap-2');
      botones.forEach(([txt, cls, fn]) => {
        const b = el('button', `btn btn-sm ${cls}`, { type: 'button' });
        b.textContent = txt;
        b.addEventListener('click', fn);
        fila.appendChild(b);
      });
      caja.appendChild(fila);
    }
    cont.appendChild(caja);
  }

  $('btnExportar').addEventListener('click', () => {
    const datos = { app: 'OK Habits', version: 1, exportado: new Date().toISOString(), habitos, ajustes };
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = el('a', '', { href: url, download: `ok-habits-${fmt(new Date())}.json` });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    aviso('success', 'Archivo exportado. Búscalo en tu carpeta de descargas.');
  });

  const archivo = $('archivoImport');
  archivo.addEventListener('change', () => {
    const f = archivo.files[0];
    if (!f) return;
    if (f.size > 1048576) {
      aviso('danger', 'El archivo es demasiado grande (máximo 1 MB).');
      archivo.value = '';
      return;
    }
    f.text().then(txt => {
      let datos;
      try { datos = JSON.parse(txt); } catch (e) { aviso('danger', 'El archivo no es un JSON válido.'); return; }
      const entrada = Array.isArray(datos) ? datos : (datos && Array.isArray(datos.habitos) ? datos.habitos : null);
      if (!entrada) { aviso('danger', 'No se encontró una lista de hábitos en el archivo.'); return; }
      const nuevos = sanearHabitos(entrada);
      if (entrada.length && !nuevos.length) { aviso('danger', 'Ningún hábito del archivo es válido.'); return; }
      const nuevosAjustes = datos && !Array.isArray(datos) && datos.ajustes ? sanearAjustes(datos.ajustes) : null;
      aviso('warning',
        `Se importarán ${nuevos.length} hábito(s) y se reemplazarán tus datos actuales. ¿Continuar?`,
        [
          ['Reemplazar datos', 'btn-danger', () => {
            habitos = nuevos;
            guardar();
            if (nuevosAjustes) { ajustes = nuevosAjustes; guardarAjustes(); sincronizarControles(); aplicarAjustes(); }
            render();
            aviso('success', `Datos importados: ${nuevos.length} hábito(s).`);
          }],
          ['Cancelar', 'btn-secondary', () => aviso('secondary', 'Importación cancelada.')]
        ]);
    }).catch(() => aviso('danger', 'No se pudo leer el archivo.'))
      .finally(() => { archivo.value = ''; });
  });

  /* ---------- Configuración: restablecer ---------- */
  const btnReset = $('btnReset');
  let temporizadorReset = null;
  function normalizarReset() {
    btnReset.textContent = 'Restablecer aplicación';
    btnReset.className = 'btn border border-danger text-danger-emphasis';
  }
  btnReset.addEventListener('click', () => {
    if (btnReset.classList.contains('btn-danger')) {
      clearTimeout(temporizadorReset);
      habitos = porDefecto();
      guardar();
      render();
      normalizarReset();
      anunciar('Aplicación restablecida');
      return;
    }
    btnReset.textContent = 'Toca de nuevo para confirmar';
    btnReset.className = 'btn btn-danger';
    temporizadorReset = setTimeout(normalizarReset, 5000);
  });

  /* ---------- Cambio de día con la pestaña abierta ---------- */
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && fmt(new Date()) !== diaActual) {
      diaActual = fmt(new Date());
      render();
      if (vistaActual === 'racha') renderRacha();
      if (vistaActual === 'calendario') renderCalendario();
    }
  });

  /* ---------- Arranque ---------- */
  [modalEl, modalDiaEl].forEach(m => {
  m.addEventListener('hide.bs.modal', () => {
    if (m.contains(document.activeElement)) document.activeElement.blur();
  });
});

modalEl.addEventListener('hidden.bs.modal', () => {
  const editar = editandoId && lista.querySelector(`button[data-accion="editar"][data-id="${editandoId}"]`);
  (editar || $('btnNuevo')).focus();
});

modalDiaEl.addEventListener('hidden.bs.modal', () => {
  const dia = diaEditando && $('cal').querySelector(`button[data-fecha="${diaEditando}"]`);
  if (dia) dia.focus();
});
  render();
  mostrarVista(location.hash.replace('#', ''));
})();
