// ══ Config ══
var ENVIO_GRATIS_DESDE = 800;
var COSTO_ENVIO = 59;
var WA_NUM = '5212381160056';

// ══ Supabase ══
var SUPABASE_URL = 'https://gcvsiyqjhkzltgjnrzdo.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjdnNpeXFqaGt6bHRnam5yemRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NzI4NTAsImV4cCI6MjA4OTQ0ODg1MH0.TVs1GYMi550A73De3-9ceiu45VswZmbYDJW1oNvcSv0';

function sbFetch(endpoint, method, body) {
  var options = {
    method: method || 'GET',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };
  if (method === 'POST') {
    options.headers['Prefer'] = 'return=representation';
  }
  if (body) {
    options.body = JSON.stringify(body);
  }
  return fetch(SUPABASE_URL + '/rest/v1/' + endpoint, options)
    .then(function(r) {
      if (!r.ok) {
        return r.json().then(function(err) {
          console.error('Supabase error:', err);
          return err;
        });
      }
      return r.json();
    })
    .catch(function(err) {
      console.error('Fetch error:', err);
      return null;
    });
}

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

  // Guardar pedido en Supabase
  sbFetch('pedidos', 'POST', {
    usuaria_id: usuarioActual ? usuarioActual.id : null,
    nombre_cliente: nombre,
    email: email || 'No proporcionado',
    whatsapp: tel,
    direccion: calle,
    ciudad: ciudad,
    estado: estado,
    codigo_postal: cp,
    productos: carrito.map(function(i) {
      return { nombre: i.nombre, precio: i.precio, imagen: i.img };
    }),
    subtotal: subtotal,
    envio: envio,
    total: total,
    metodo_pago: 'SPEI',
    estatus: 'pendiente'
  }).then(function() {
    console.log('Pedido guardado en Supabase');
  }).catch(function(err) {
    console.log('Error guardando pedido:', err);
  });

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
//  AUTH SYSTEM — SUPABASE
// ══════════════════════════════

var usuarioActual = null;

function cargarUsuario() {
  try {
    var data = localStorage.getItem('brite_user');
    if (data) { usuarioActual = JSON.parse(data); actualizarUIUsuario(); }
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

function abrirAuth() {
  document.getElementById('authModal').classList.add('open');
  document.getElementById('authOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  if (usuarioActual) { mostrarFormulario('Perfil'); } else { switchTab('login'); }
}

function cerrarAuth() {
  document.getElementById('authModal').classList.remove('open');
  document.getElementById('authOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function switchTab(tab) {
  var ind = document.getElementById('tabIndicator');
  var tabLogin = document.getElementById('tabLogin');
  var tabReg = document.getElementById('tabRegister');
  if (tab === 'login') {
    mostrarFormulario('Login');
    tabLogin.classList.add('active'); tabReg.classList.remove('active');
    if (ind) ind.classList.remove('right');
  } else {
    mostrarFormulario('Register');
    tabReg.classList.add('active'); tabLogin.classList.remove('active');
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
  var tabs = document.querySelector('.auth-tabs');
  if (tabs) tabs.style.display = nombre === 'Perfil' ? 'none' : 'flex';
}

// ── Iniciar sesión con Supabase ──
function iniciarSesion() {
  var email = document.getElementById('loginEmail').value.trim();
  var pass  = document.getElementById('loginPass').value;
  if (!email || !pass) { mostrarToast('Por favor llena todos los campos'); return; }
  if (!validarEmail(email)) { mostrarToast('Ingresa un correo válido'); return; }

  var btn = document.querySelector('#formLogin .auth-btn');
  if (btn) { btn.disabled = true; btn.querySelector('span').textContent = 'Verificando...'; }

  sbFetch('usuarias?email=eq.' + encodeURIComponent(email) + '&select=*')
    .then(function(data) {
      if (data && data.length > 0) {
        var user = data[0];
        if (user.password_hash === btoa(pass)) {
          guardarUsuario(user);
          cerrarAuth();
          mostrarToast('¡Bienvenida de vuelta, ' + user.nombre.split(' ')[0] + '! ✦');
        } else {
          mostrarToast('Contraseña incorrecta');
        }
      } else {
        mostrarToast('No encontramos esa cuenta');
      }
    })
    .catch(function() { mostrarToast('Error de conexión, intenta de nuevo'); })
    .finally(function() {
      if (btn) { btn.disabled = false; btn.querySelector('span').textContent = 'Entrar'; }
    });
}

// ── Registrar usuaria en Supabase ──
function registrarUsuario() {
  var nombre = document.getElementById('regNombre').value.trim();
  var email  = document.getElementById('regEmail').value.trim();
  var pass   = document.getElementById('regPass').value;
  var wa     = document.getElementById('regWa').value.trim();
  var acepta = document.getElementById('regTerms').checked;

  if (!nombre || !email || !pass) { mostrarToast('Por favor llena los campos obligatorios'); return; }
  if (!validarEmail(email)) { mostrarToast('Ingresa un correo electrónico válido'); return; }
  if (pass.length < 6) { mostrarToast('La contraseña debe tener al menos 6 caracteres'); return; }

  var btn = document.querySelector('#formRegister .auth-btn');
  if (btn) { btn.disabled = true; btn.querySelector('span').textContent = 'Creando cuenta...'; }

  sbFetch('usuarias', 'POST', {
    nombre: nombre,
    email: email,
    password_hash: btoa(pass),
    whatsapp: wa || 'No proporcionado',
    acepta_noticias: acepta,
    dispositivo: /Mobi|Android/i.test(navigator.userAgent) ? 'Móvil' : 'Escritorio'
  }).then(function(data) {
    if (data && data[0]) {
      guardarUsuario(data[0]);
      cerrarAuth();
      mostrarToast('¡Cuenta creada! Bienvenida a BRITE ✦');
    } else if (data && data.code === '23505') {
      mostrarToast('Ese correo ya está registrado');
    } else {
      mostrarToast('Error al crear cuenta, intenta de nuevo');
    }
  }).catch(function() {
    mostrarToast('Error de conexión, intenta de nuevo');
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

// ── Guardar pedido en Supabase ──
function guardarPedidoEnSupabase(datosPedido) {
  sbFetch('pedidos', 'POST', datosPedido)
    .then(function() { console.log('Pedido guardado en Supabase'); })
    .catch(function() { console.log('Error guardando pedido'); });
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

// ══════════════════════════════
//  OPINIONES
// ══════════════════════════════

var opinionFotoBase64 = null;

// Cargar y mostrar opiniones
function cargarOpiniones() {
  sbFetch('opiniones?select=*&order=fecha.desc').then(function(data) {
    var grid = document.getElementById('opinionesGrid');
    if (!grid) return;
    if (!data || !data.length) {
      grid.innerHTML = '<div class="sin-opiniones"><div class="sin-opiniones-icon">✦</div><h4>Sé la primera en opinar</h4><p>Aún no hay opiniones — comparte tu experiencia con BRITE.</p></div>';
      return;
    }
    grid.innerHTML = data.map(function(op) {
      var inicial = (op.nombre || 'B')[0].toUpperCase();
      var fecha = op.fecha ? new Date(op.fecha).toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' }) : '';
      var foto = op.foto_url ? '<img src="' + op.foto_url + '" class="opinion-foto" onclick="abrirZoomUrl(\'' + op.foto_url + '\', \'' + op.nombre + '\')" alt="Foto de ' + op.nombre + '">' : '';
      return '<div class="opinion-card">' +
        '<div class="opinion-header">' +
        '<div class="opinion-avatar">' + inicial + '</div>' +
        '<div><div class="opinion-nombre">' + op.nombre + '</div><div class="opinion-fecha">' + fecha + '</div></div>' +
        '</div>' +
        '<p class="opinion-comentario">"' + op.comentario + '"</p>' +
        foto +
        '<div class="opinion-marca">✦ BRITE</div>' +
        '</div>';
    }).join('');
  }).catch(function() {
    var grid = document.getElementById('opinionesGrid');
    if (grid) grid.innerHTML = '<div class="sin-opiniones"><div class="sin-opiniones-icon">✦</div><h4>Cargando opiniones...</h4></div>';
  });
}

// Preview foto antes de subir
function previewFoto(input) {
  if (!input.files || !input.files[0]) return;
  var file = input.files[0];
  var reader = new FileReader();
  reader.onload = function(e) {
    opinionFotoBase64 = e.target.result;
    var preview = document.getElementById('ofFotoPreview');
    var btn = document.querySelector('.of-foto-btn');
    if (preview) { preview.src = opinionFotoBase64; preview.style.display = 'block'; }
    if (btn) btn.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

// Enviar opinión
function enviarOpinion() {
  var nombre = document.getElementById('opNombre') ? document.getElementById('opNombre').value.trim() : '';
  var comentario = document.getElementById('opComentario') ? document.getElementById('opComentario').value.trim() : '';

  if (!nombre) { mostrarToast('Por favor escribe tu nombre'); return; }
  if (!comentario) { mostrarToast('Por favor escribe tu comentario'); return; }

  var btn = document.querySelector('#opinionForm .btn-primary');
  if (btn) { btn.disabled = true; btn.querySelector('span').textContent = 'Publicando...'; }

  var payload = {
    nombre: nombre,
    comentario: comentario,
    foto_url: opinionFotoBase64 || null,
    usuaria_id: usuarioActual ? usuarioActual.id : null
  };

  sbFetch('opiniones', 'POST', payload).then(function(data) {
    if (data && data[0]) {
      mostrarToast('¡Gracias por tu opinión! ✦');
      document.getElementById('opNombre').value = '';
      document.getElementById('opComentario').value = '';
      opinionFotoBase64 = null;
      var preview = document.getElementById('ofFotoPreview');
      var fotoBtn = document.querySelector('.of-foto-btn');
      if (preview) { preview.src = ''; preview.style.display = 'none'; }
      if (fotoBtn) fotoBtn.style.display = 'inline-flex';
      cargarOpiniones();
    } else {
      mostrarToast('Error al publicar, intenta de nuevo');
    }
  }).catch(function() {
    mostrarToast('Error de conexión, intenta de nuevo');
  }).finally(function() {
    if (btn) { btn.disabled = false; btn.querySelector('span').textContent = 'Publicar opinión'; }
  });
}

// Zoom para fotos de opiniones
function abrirZoomUrl(url, nombre) {
  var modal = document.getElementById('zoomModal');
  var overlay = document.getElementById('zoomOverlay');
  var zoomImg = document.getElementById('zoomImg');
  var zoomNombre = document.getElementById('zoomNombre');
  var zoomPrecio = document.getElementById('zoomPrecio');
  if (!modal) return;
  zoomImg.src = url;
  if (zoomNombre) zoomNombre.textContent = nombre;
  if (zoomPrecio) zoomPrecio.textContent = 'Opinión verificada ✦';
  overlay.classList.add('open');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

// Cargar opiniones al iniciar
document.addEventListener('DOMContentLoaded', function() {
  cargarOpiniones();
});
