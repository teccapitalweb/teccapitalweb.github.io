// ══ Menú móvil ══
function toggleMenu() {
  var menu = document.getElementById('mobileMenu');
  menu.classList.toggle('open');
}

// ══ Header al hacer scroll ══
window.addEventListener('scroll', function () {
  var header = document.getElementById('header');
  if (window.scrollY > 40) {
    header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.08)';
  } else {
    header.style.boxShadow = 'none';
  }
});

// ══ Cerrar menú al hacer clic fuera ══
document.addEventListener('click', function (e) {
  var menu = document.getElementById('mobileMenu');
  var btn = document.querySelector('.nav-menu-btn');
  if (menu.classList.contains('open') && !menu.contains(e.target) && !btn.contains(e.target)) {
    menu.classList.remove('open');
  }
});

// ══ Animación de entrada al hacer scroll ══
var observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.step, .cat-item, .product-card, .prop-item').forEach(function (el) {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// ══ Formulario de pedido → WhatsApp ══
function enviarPedido(e) {
  e.preventDefault();
  var nombre    = document.getElementById('nombre').value;
  var telefono  = document.getElementById('telefono').value;
  var email     = document.getElementById('email').value;
  var prenda    = document.getElementById('prenda').value;
  var direccion = document.getElementById('direccion').value;
  var ciudad    = document.getElementById('ciudad').value;
  var estado    = document.getElementById('estado').value;
  var cp        = document.getElementById('cp').value;
  var notas     = document.getElementById('notas').value;

  var msg = '🛍 *Nuevo pedido BRITE*\n\n'
    + '*Nombre:* ' + nombre + '\n'
    + '*WhatsApp/Tel:* ' + telefono + '\n'
    + (email ? '*Email:* ' + email + '\n' : '')
    + '\n*Prenda deseada:* ' + prenda + '\n'
    + '\n📦 *Datos de envío:*\n'
    + direccion + '\n'
    + ciudad + ', ' + estado + ' CP ' + cp + '\n'
    + (notas ? '\n*Notas:* ' + notas : '');

  var url = 'https://wa.me/5212381160056?text=' + encodeURIComponent(msg);
  window.open(url, '_blank');
}
