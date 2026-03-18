// ══ Config ══
var ENVIO_GRATIS_DESDE = 800;
var COSTO_ENVIO = 59;
var WA_NUM = '5212381160056';

// ══ Estado ══
var carrito = [];

// ══ Menú móvil ══
function toggleMenu() {
  var menu = document.getElementById('mobileMenu');
  menu.classList.toggle('open');
}

// ══ Header scroll ══
window.addEventListener('scroll', function () {
  var header = document.getElementById('header');
  if (window.scrollY > 40) {
    header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.08)';
  } else {
    header.style.boxShadow = 'none';
  }
});

document.addEventListener('click', function (e) {
  var menu = document.getElementById('mobileMenu');
  var btn = document.querySelector('.nav-menu-btn');
  if (menu && menu.classList.contains('open') && !menu.contains(e.target) && btn && !btn.contains(e.target)) {
    menu.classList.remove('open');
  }
});

// ══ Animación scroll ══
var observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach(function (el) {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// ══════════════
//  CARRITO
// ══════════════

function agregarCarrito(nombre, precio, img) {
  var existe = carrito.find(function(i) { return i.nombre === nombre; });
  if (existe) { mostrarToast('Esta prenda ya está en tu carrito'); return; }
  carrito.push({ nombre: nombre, precio: precio, img: img });
  actualizarCarritoUI();
  mostrarToast('Agregado al carrito');
  abrirCarrito();
}

function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  actualizarCarritoUI();
}

function actualizarCarritoUI() {
  var count = carrito.length;
  var el = document.getElementById('carritoCount');
  if (el) { el.textContent = count; el.style.display = count > 0 ? 'flex' : 'none'; }
  renderCarritoItems();
}

function renderCarritoItems() {
  var container = document.getElementById('carritoItems');
  var footer = document.getElementById('carritoFooter');
  if (!container) return;

  if (carrito.length === 0) {
    container.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío</p>';
    if (footer) footer.style.display = 'none';
    return;
  }

  var subtotal = carrito.reduce(function(s, i) { return s + i.precio; }, 0);
  var envio = subtotal >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO;
  var falta = ENVIO_GRATIS_DESDE - subtotal;

  container.innerHTML = carrito.map(function(item, idx) {
    return '<div class="carrito-item">'
      + '<img src="' + item.img + '">'
      + '<div class="carrito-item-info">'
      + '<p class="ci-nombre">' + item.nombre + '</p>'
      + '<p class="ci-precio">$' + item.precio.toLocaleString('es-MX') + ' MXN</p>'
      + '</div>'
      + '<button class="ci-eliminar" onclick="eliminarDelCarrito(' + idx + ')">✕</button>'
      + '</div>';
  }).join('');

  var subtotalEl = document.getElementById('carritoSubtotal');
  var msgEl = document.getElementById('carritoEnvioMsg');
  if (subtotalEl) subtotalEl.textContent = '$' + subtotal.toLocaleString('es-MX') + ' MXN';
  if (msgEl) {
    msgEl.innerHTML = envio === 0
      ? '<span class="envio-gratis">✓ Envío gratis incluido</span>'
      : 'Agrega $' + falta.toLocaleString('es-MX') + ' más para envío gratis';
  }
  if (footer) footer.style.display = 'block';
}

function abrirCarrito() {
  document.getElementById('carritoPanel').classList.add('open');
  document.getElementById('carritoOverlay').classList.add('open');
  renderCarritoItems();
}

function cerrarCarrito() {
  document.getElementById('carritoPanel').classList.remove('open');
  document.getElementById('carritoOverlay').classList.remove('open');
}

// ══ Toast ══
function mostrarToast(msg) {
  var t = document.getElementById('brite-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'brite-toast';
    t.className = 'brite-toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, 2200);
}

// ══════════════
//  CHECKOUT
// ══════════════

function iniciarCheckout() {
  if (carrito.length === 0) return;
  cerrarCarrito();
  document.getElementById('checkoutModal').classList.add('open');
  document.getElementById('checkoutOverlay').classList.add('open');
  mostrarPaso(1);
}

function cerrarCheckout() {
  document.getElementById('checkoutModal').classList.remove('open');
  document.getElementById('checkoutOverlay').classList.remove('open');
}

function mostrarPaso(n) {
  [1,2,3].forEach(function(i) {
    var paso = document.getElementById('checkout-paso' + i);
    var ind  = document.getElementById('step-ind-' + i);
    if (paso) paso.style.display = i === n ? 'block' : 'none';
    if (ind) {
      ind.classList.toggle('active', i === n);
      ind.classList.toggle('done', i < n);
    }
  });
}

function irPaso1() { mostrarPaso(1); }

function irPaso2() {
  var campos = ['ch-nombre','ch-tel','ch-calle','ch-ciudad','ch-estado','ch-cp'];
  var etiquetas = ['Nombre','WhatsApp','Calle','Ciudad','Estado','CP'];
  for (var i = 0; i < campos.length; i++) {
    var el = document.getElementById(campos[i]);
    if (!el || !el.value.trim()) {
      mostrarToast('Por favor llena: ' + etiquetas[i]);
      if (el) el.focus();
      return;
    }
  }

  var subtotal = carrito.reduce(function(s, i) { return s + i.precio; }, 0);
  var envio = subtotal >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO;
  var total = subtotal + envio;

  document.getElementById('ch-resumen-items').innerHTML = carrito.map(function(item) {
    return '<div class="ch-res-item">'
      + '<img src="' + item.img + '">'
      + '<span>' + item.nombre + '</span>'
      + '<span>$' + item.precio.toLocaleString('es-MX') + '</span>'
      + '</div>';
  }).join('');

  document.getElementById('ch-res-subtotal').textContent = '$' + subtotal.toLocaleString('es-MX') + ' MXN';
  document.getElementById('ch-res-envio').textContent = envio === 0 ? 'GRATIS' : '$' + envio + ' MXN';
  document.getElementById('ch-res-total').textContent = '$' + total.toLocaleString('es-MX') + ' MXN';

  var infoEl = document.getElementById('ch-envio-info');
  if (infoEl) {
    infoEl.innerHTML = envio === 0
      ? '<span class="envio-gratis">✓ Tu pedido califica para envío gratis</span>'
      : 'Agrega $' + (ENVIO_GRATIS_DESDE - subtotal) + ' MXN más para envío gratis.';
  }
  mostrarPaso(2);
}

function irPaso3() { mostrarPaso(3); }

function confirmarPedido() {
  var nombre = document.getElementById('ch-nombre').value.trim();
  var tel    = document.getElementById('ch-tel').value.trim();
  var email  = document.getElementById('ch-email').value.trim();
  var calle  = document.getElementById('ch-calle').value.trim();
  var ciudad = document.getElementById('ch-ciudad').value.trim();
  var estado = document.getElementById('ch-estado').value.trim();
  var cp     = document.getElementById('ch-cp').value.trim();

  var subtotal = carrito.reduce(function(s, i) { return s + i.precio; }, 0);
  var envio = subtotal >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO;
  var total = subtotal + envio;

  var prendas = carrito.map(function(i) {
    return '  • ' + i.nombre + ' — $' + i.precio.toLocaleString('es-MX') + ' MXN';
  }).join('\n');

  var msg = '🛍 *NUEVO PEDIDO BRITE*\n\n'
    + '👤 *Cliente:* ' + nombre + '\n'
    + '📱 *WhatsApp:* ' + tel + '\n'
    + (email ? '📧 *Email:* ' + email + '\n' : '')
    + '\n🛒 *Prendas pedidas:*\n' + prendas
    + '\n\n💰 Subtotal: $' + subtotal.toLocaleString('es-MX') + ' MXN'
    + '\n🚚 Envío: ' + (envio === 0 ? 'GRATIS' : '$' + envio + ' MXN')
    + '\n✅ *TOTAL: $' + total.toLocaleString('es-MX') + ' MXN*'
    + '\n\n📦 *Dirección de envío:*\n'
    + calle + '\n' + ciudad + ', ' + estado + ', CP ' + cp
    + '\n\n💳 Pago: Transferencia SPEI'
    + '\n\n_(Favor de enviar datos bancarios para realizar el pago)_';

  window.open('https://wa.me/' + WA_NUM + '?text=' + encodeURIComponent(msg), '_blank');
  cerrarCheckout();
  carrito = [];
  actualizarCarritoUI();
  mostrarToast('¡Pedido confirmado! Revisa tu WhatsApp');
}

// ══ Formulario manual ══
function enviarPedido(e) {
  e.preventDefault();
  var msg = '🛍 *Pedido BRITE*\n\n'
    + '*Nombre:* ' + document.getElementById('nombre').value + '\n'
    + '*Tel:* ' + document.getElementById('telefono').value + '\n'
    + '*Prenda:* ' + document.getElementById('prenda').value + '\n'
    + '*Dirección:* ' + document.getElementById('direccion').value + ', '
    + document.getElementById('ciudad').value + ', '
    + document.getElementById('estado').value + ' CP '
    + document.getElementById('cp').value;
  var notas = document.getElementById('notas').value;
  if (notas) msg += '\n*Notas:* ' + notas;
  window.open('https://wa.me/' + WA_NUM + '?text=' + encodeURIComponent(msg), '_blank');
}

// ══════════════════════════════
//  BÚSQUEDA + FILTROS
// ══════════════════════════════

var filtroActivo = 'todos';

function setFiltro(btn) {
  filtroActivo = btn.getAttribute('data-filtro');
  document.querySelectorAll('.filtro-btn').forEach(function(b) {
    b.classList.toggle('active', b === btn);
  });
  filtrarProductos();
}

function filtrarProductos() {
  var query = (document.getElementById('searchInput').value || '').toLowerCase().trim();
  var clearBtn = document.getElementById('searchClear');
  if (clearBtn) clearBtn.style.display = query ? 'block' : 'none';

  var cards = document.querySelectorAll('.product-card[data-cat]');
  var visibles = 0;

  cards.forEach(function(card) {
    var cat = card.getAttribute('data-cat') || '';
    var nombre = card.getAttribute('data-nombre') || '';
    var matchCat = filtroActivo === 'todos' || cat === filtroActivo;
    var matchQuery = !query || nombre.includes(query);
    var visible = matchCat && matchQuery;
    card.style.display = visible ? '' : 'none';
    card.style.opacity = visible ? '1' : '0';
    if (visible) visibles++;
  });

  // Ocultar títulos de sección si no hay tarjetas visibles en esa sección
  document.querySelectorAll('.cat-section-title').forEach(function(title) {
    var next = title.nextElementSibling;
    var tieneVisibles = false;
    if (next) {
      next.querySelectorAll('.product-card[data-cat]').forEach(function(c) {
        if (c.style.display !== 'none') tieneVisibles = true;
      });
    }
    title.style.display = tieneVisibles ? '' : 'none';
  });

  var resEl = document.getElementById('filtroResultado');
  if (resEl) {
    if (query || filtroActivo !== 'todos') {
      resEl.textContent = visibles === 0 ? 'No se encontraron prendas' : visibles + ' prenda' + (visibles === 1 ? '' : 's') + ' encontrada' + (visibles === 1 ? '' : 's');
    } else {
      resEl.textContent = '';
    }
  }
}

function limpiarBusqueda() {
  var input = document.getElementById('searchInput');
  if (input) { input.value = ''; input.focus(); }
  filtrarProductos();
}

// ══════════════════════════════
//  ZOOM GALERÍA
// ══════════════════════════════

function abrirZoom(img) {
  var modal = document.getElementById('zoomModal');
  var overlay = document.getElementById('zoomOverlay');
  var zoomImg = document.getElementById('zoomImg');
  var zoomNombre = document.getElementById('zoomNombre');
  var zoomPrecio = document.getElementById('zoomPrecio');
  if (!modal) return;

  var card = img.closest('.product-card');
  var nombre = card ? card.querySelector('.product-name') : null;
  var precio = card ? card.querySelector('.product-price') : null;

  zoomImg.src = img.src;
  zoomImg.alt = img.alt;
  if (zoomNombre) zoomNombre.textContent = nombre ? nombre.textContent : '';
  if (zoomPrecio) zoomPrecio.textContent = precio ? precio.textContent : '';

  overlay.classList.add('open');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function cerrarZoom() {
  var modal = document.getElementById('zoomModal');
  var overlay = document.getElementById('zoomOverlay');
  if (modal) modal.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// Cerrar zoom con ESC
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    cerrarZoom();
    cerrarCheckout();
    cerrarCarrito();
  }
});

// ══════════════════════════════
//  ANIMACIONES MEJORADAS SCROLL
// ══════════════════════════════

// Stagger animation para product cards en grupos
var staggerObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      var siblings = entry.target.parentElement.querySelectorAll('.product-card');
      siblings.forEach(function(card, i) {
        setTimeout(function() {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, i * 80);
      });
      staggerObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.05 });

document.querySelectorAll('.product-grid').forEach(function(grid) {
  var first = grid.querySelector('.product-card');
  if (first) {
    grid.querySelectorAll('.product-card').forEach(function(card) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(28px)';
      card.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
    });
    staggerObserver.observe(first);
  }
});

// Animación para secciones completas
var sectionObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      sectionObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.cat-item, .step, .pago-card, .prop-item').forEach(function(el) {
  el.classList.add('anim-ready');
  sectionObserver.observe(el);
});

// ══ BOUNCE ANIMACIÓN CARRITO ══
function bounceCarritoIcon() {
  var count = document.getElementById('carritoCount');
  if (!count) return;
  count.classList.remove('bounce');
  void count.offsetWidth; // reflow
  count.classList.add('bounce');
  setTimeout(function() { count.classList.remove('bounce'); }, 400);
}

// Patch agregarCarrito para bounce
var _agregarOriginal = agregarCarrito;
agregarCarrito = function(nombre, precio, img) {
  _agregarOriginal(nombre, precio, img);
  bounceCarritoIcon();
};

// ══ EMPTY STATE EN BUSCADOR ══
function mostrarEmptyState(visible) {
  var el = document.getElementById('emptyState');
  if (el) el.classList.toggle('visible', visible);
}

// Patch filtrarProductos para empty state
var _filtrarOriginal = filtrarProductos;
filtrarProductos = function() {
  _filtrarOriginal();
  var cards = document.querySelectorAll('.product-card[data-cat]');
  var visibles = 0;
  cards.forEach(function(c) { if (c.style.display !== 'none') visibles++; });
  mostrarEmptyState(visibles === 0);
};

// ══ SMOOTH SCROLL CON OFFSET NAVBAR ══
document.querySelectorAll('a[href^="#"]').forEach(function(link) {
  link.addEventListener('click', function(e) {
    var target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    var navH = document.getElementById('header').offsetHeight;
    var top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
    window.scrollTo({ top: top, behavior: 'smooth' });
  });
});

// ══════════════════════════════
//  AUTH SYSTEM — LOGIN / SIGNUP
// ══════════════════════════════

// Estado del usuario (localStorage para persistencia)
var usuarioActual = null;

function cargarUsuario() {
  try {
    var data = localStorage.getItem('brite_user');
    if (data) {
      usuarioActual = JSON.parse(data);
      actualizarUIUsuario();
    }
  } catch(e) {}
}

function guardarUsuario(user) {
  usuarioActual = user;
  localStorage.setItem('brite_user', JSON.stringify(user));
  actualizarUIUsuario();
}

function actualizarUIUsuario() {
  var dot = document.getElementById('userDot');
  if (dot) dot.style.display = usuarioActual ? 'block' : 'none';
}

// Abrir / cerrar modal
function abrirAuth() {
  var modal = document.getElementById('authModal');
  var overlay = document.getElementById('authOverlay');
  modal.classList.add('open');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  if (usuarioActual) {
    mostrarFormulario('Perfil');
  } else {
    switchTab('login');
  }
}

function cerrarAuth() {
  document.getElementById('authModal').classList.remove('open');
  document.getElementById('authOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// Tabs
function switchTab(tab) {
  var ind = document.getElementById('tabIndicator');
  var tabLogin = document.getElementById('tabLogin');
  var tabReg = document.getElementById('tabRegister');

  if (tab === 'login') {
    mostrarFormulario('Login');
    tabLogin.classList.add('active');
    tabReg.classList.remove('active');
    if (ind) ind.classList.remove('right');
  } else {
    mostrarFormulario('Register');
    tabReg.classList.add('active');
    tabLogin.classList.remove('active');
    if (ind) ind.classList.add('right');
  }
}

function mostrarFormulario(nombre) {
  ['formLogin','formRegister','formPerfil'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  var target = document.getElementById('form' + nombre);
  if (target) target.style.display = 'block';

  // Actualizar perfil si está logueado
  if (nombre === 'Perfil' && usuarioActual) {
    var initial = (usuarioActual.nombre || 'B')[0].toUpperCase();
    var avatarEl = document.getElementById('perfilAvatar');
    var nombreEl = document.getElementById('perfilNombre');
    var emailEl  = document.getElementById('perfilEmail');
    var pedidosEl = document.getElementById('perfilPedidos');
    var carritoEl = document.getElementById('perfilCarrito');
    if (avatarEl) avatarEl.textContent = initial;
    if (nombreEl) nombreEl.textContent = '¡Hola, ' + usuarioActual.nombre.split(' ')[0] + '!';
    if (emailEl)  emailEl.textContent  = usuarioActual.email;
    if (pedidosEl) pedidosEl.textContent = usuarioActual.pedidos || 0;
    if (carritoEl) carritoEl.textContent = carrito.length;
  }

  // Ocultar tabs si es perfil
  var tabs = document.querySelector('.auth-tabs');
  if (tabs) tabs.style.display = nombre === 'Perfil' ? 'none' : 'flex';
}

// Iniciar sesión
function iniciarSesion() {
  var email = document.getElementById('loginEmail').value.trim();
  var pass  = document.getElementById('loginPass').value;

  if (!email || !pass) { mostrarToast('Por favor llena todos los campos'); return; }
  if (!validarEmail(email)) { mostrarToast('Ingresa un correo válido'); return; }

  // Verificar si existe en localStorage
  var usuarios = JSON.parse(localStorage.getItem('brite_usuarios') || '[]');
  var user = usuarios.find(function(u) { return u.email === email && u.pass === btoa(pass); });

  if (user) {
    guardarUsuario(user);
    cerrarAuth();
    mostrarToast('¡Bienvenida de vuelta, ' + user.nombre.split(' ')[0] + '! ✦');
  } else {
    mostrarToast('Correo o contraseña incorrectos');
    var wrap = document.querySelector('#formLogin .auth-input-wrap:last-of-type');
    if (wrap) { wrap.style.borderColor = '#E53935'; setTimeout(function() { wrap.style.borderColor = ''; }, 1500); }
  }
}

// ══ Google Sheets API ══
var SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwPxN7qRp2ZuUDZg5q4D2EY0MMZojDIl-IXUCcxGAGooGnwfBRlRdRlN0YjMo0xOYTyqA/exec';

// Registrar usuario
function registrarUsuario() {
  var nombre = document.getElementById('regNombre').value.trim();
  var email  = document.getElementById('regEmail').value.trim();
  var pass   = document.getElementById('regPass').value;
  var wa     = document.getElementById('regWa').value.trim();
  var acepta = document.getElementById('regTerms').checked;

  if (!nombre || !email || !pass) { mostrarToast('Por favor llena los campos obligatorios'); return; }
  if (!validarEmail(email)) { mostrarToast('Ingresa un correo electrónico válido'); return; }
  if (pass.length < 6) { mostrarToast('La contraseña debe tener al menos 6 caracteres'); return; }

  // Verificar si ya existe localmente
  var usuarios = JSON.parse(localStorage.getItem('brite_usuarios') || '[]');
  if (usuarios.find(function(u) { return u.email === email; })) {
    mostrarToast('Ese correo ya está registrado'); return;
  }

  // Deshabilitar botón mientras procesa
  var btn = document.querySelector('#formRegister .auth-btn');
  if (btn) { btn.disabled = true; btn.querySelector('span').textContent = 'Creando cuenta...'; }

  // Guardar en Google Sheets
  var payload = {
    fecha: new Date().toLocaleString('es-MX'),
    nombre: nombre,
    correo: email,
    whatsapp: wa || 'No proporcionado',
    acepta_noticias: acepta ? 'Sí' : 'No',
    dispositivo: /Mobi|Android/i.test(navigator.userAgent) ? 'Móvil' : 'Escritorio'
  };

  fetch(SHEETS_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(function() {
    // Guardar también localmente
    var nuevoUsuario = {
      nombre: nombre, email: email,
      pass: btoa(pass), wa: wa,
      pedidos: 0,
      fechaRegistro: new Date().toLocaleDateString('es-MX')
    };
    usuarios.push(nuevoUsuario);
    localStorage.setItem('brite_usuarios', JSON.stringify(usuarios));
    guardarUsuario(nuevoUsuario);
    cerrarAuth();
    mostrarToast('¡Cuenta creada! Bienvenida a BRITE ✦');
  }).catch(function() {
    // Si falla el fetch, guardar solo localmente
    var nuevoUsuario = {
      nombre: nombre, email: email,
      pass: btoa(pass), wa: wa,
      pedidos: 0,
      fechaRegistro: new Date().toLocaleDateString('es-MX')
    };
    usuarios.push(nuevoUsuario);
    localStorage.setItem('brite_usuarios', JSON.stringify(usuarios));
    guardarUsuario(nuevoUsuario);
    cerrarAuth();
    mostrarToast('¡Cuenta creada! Bienvenida a BRITE ✦');
  }).finally(function() {
    if (btn) { btn.disabled = false; btn.querySelector('span').textContent = 'Crear mi cuenta'; }
  });
}

// Cerrar sesión
function cerrarSesion() {
  usuarioActual = null;
  localStorage.removeItem('brite_user');
  actualizarUIUsuario();
  cerrarAuth();
  mostrarToast('Sesión cerrada. ¡Hasta pronto!');
}

// Fortaleza contraseña
document.addEventListener('DOMContentLoaded', function() {
  cargarUsuario();
  var passInput = document.getElementById('regPass');
  if (passInput) {
    passInput.addEventListener('input', function() {
      var val = this.value;
      var bar  = document.getElementById('passBar');
      var hint = document.getElementById('passHint');
      if (!bar || !hint) return;
      var score = 0;
      if (val.length >= 6) score++;
      if (val.length >= 10) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;
      var colors = ['#E53935','#FF9800','#FFC107','#4CAF50','#00BCD4'];
      var labels = ['Muy débil','Débil','Regular','Buena','Excelente'];
      bar.style.width = (score * 20) + '%';
      bar.style.background = colors[score - 1] || 'transparent';
      hint.textContent = score > 0 ? labels[score - 1] : '';
      hint.style.color = colors[score - 1] || 'transparent';
    });
  }
});

// Mostrar/ocultar contraseña
function togglePassword(id, btn) {
  var input = document.getElementById(id);
  if (!input) return;
  var isText = input.type === 'text';
  input.type = isText ? 'password' : 'text';
  btn.style.color = isText ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)';
}

// Validar email
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
