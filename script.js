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
