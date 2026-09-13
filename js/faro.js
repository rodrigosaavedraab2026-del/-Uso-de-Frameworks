/* ============================================================
   El Faro — Lógica del sitio (JavaScript externo)
   Autor: Rodrigo Saavedra Ábalos — PRO301 AIEP

   Buenas prácticas aplicadas (recomendaciones del docente):
   - Sin manejadores "inline" (onclick/onerror): todo se enlaza
     con addEventListener desde este archivo.
   - Elemento de fecha-hora identificado con un id único (#fecha-hora).
   - Manejo de error de imágenes centralizado aquí.
   - Formularios accesibles: validación, mensajes asociados al campo
     (aria-describedby) y gestión del foco al primer error.
   - Contadores con singularización gramatical (1 artículo / 2 artículos).
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  activarMenuResponsivo();
  iniciarReloj();
  activarManejoDeImagenes();
  activarFormularioContacto();
  activarFormularioArticulo();
  actualizarContadores();
});

/* ------------------------------------------------------------
   MENÚ RESPONSIVO (navbar-burger de Bulma)
   ------------------------------------------------------------ */
function activarMenuResponsivo() {
  const burgers = document.querySelectorAll('.navbar-burger');
  burgers.forEach(function (burger) {
    burger.addEventListener('click', function () {
      const target = document.getElementById(burger.dataset.target);
      burger.classList.toggle('is-active');
      if (target) target.classList.toggle('is-active');
    });
  });
}

/* ------------------------------------------------------------
   RELOJ EN VIVO
   ------------------------------------------------------------
   Se actualiza cada segundo sobre el elemento único #fecha-hora.

   Zona horaria: se usa la zona horaria local del navegador de la
   persona usuaria (la que tenga configurada su sistema operativo).
   No se fija una zona fija para que la hora mostrada coincida con
   la del dispositivo desde donde se visita el sitio.

   Formato: se emplea Intl.DateTimeFormat con configuración regional
   'es-CL' (español de Chile). La fecha se muestra en formato largo
   (día de la semana, día, mes y año) y la hora en formato de 24 h
   con horas, minutos y segundos.
   ------------------------------------------------------------ */
function iniciarReloj() {
  const contenedor = document.getElementById('fecha-hora');
  if (!contenedor) return; // la página puede no tener reloj

  const opciones = {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  };
  const formateador = new Intl.DateTimeFormat('es-CL', opciones);

  function tick() {
    const ahora = new Date();
    const texto = formateador.format(ahora);
    // Primera letra en mayúscula (es-CL entrega el día en minúscula)
    contenedor.textContent = texto.charAt(0).toUpperCase() + texto.slice(1);
    // Atributo datetime en formato ISO 8601 (buena práctica semántica de <time>)
    if (contenedor.tagName === 'TIME') {
      contenedor.setAttribute('datetime', ahora.toISOString());
    }
  }

  tick();                 // muestra de inmediato
  setInterval(tick, 1000); // actualiza cada segundo
}

/* ------------------------------------------------------------
   MANEJO DE ERROR DE IMÁGENES (sin onerror inline)
   ------------------------------------------------------------
   Si una imagen no carga, se reemplaza por una imagen alternativa
   (placeholder) definida aquí, en la lógica externa.
   ------------------------------------------------------------ */
function activarManejoDeImagenes() {
  // Imagen de respaldo propia (media/sin-imagen.svg). Se define aquí, en la
  // lógica externa, en lugar de usar el atributo onerror en cada <img>.
  const IMAGEN_ALTERNATIVA = 'media/sin-imagen.svg';

  function aplicarFallback(img) {
    if (img.dataset.fallbackAplicado) return; // evita bucle
    img.dataset.fallbackAplicado = 'true';
    img.src = IMAGEN_ALTERNATIVA;
  }

  document.querySelectorAll('img').forEach(function (img) {
    // 1) Enlaza el manejador para errores futuros (sin onerror inline)
    img.addEventListener('error', function () {
      aplicarFallback(img);
    });
    // 2) Cubre las imágenes que ya terminaron de cargar y fallaron
    //    antes de que se registrara el listener (complete + sin ancho real)
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) {
      aplicarFallback(img);
    }
  });
}

/* ------------------------------------------------------------
   UTILIDAD: singularización gramatical de contadores
   ------------------------------------------------------------ */
function textoCantidad(n, singular, plural) {
  return n + ' ' + (n === 1 ? singular : plural);
}

/* ------------------------------------------------------------
   CONTADORES POR SECCIÓN
   ------------------------------------------------------------
   Cuenta las tarjetas de artículo dentro de cada bloque marcado
   con [data-seccion] y muestra el total en su [data-contador],
   respetando singular/plural.
   ------------------------------------------------------------ */
function actualizarContadores() {
  document.querySelectorAll('[data-seccion]').forEach(function (bloque) {
    const total = bloque.querySelectorAll('.card-articulo').length;
    const nombre = bloque.getAttribute('data-seccion');
    // El contador puede estar dentro del bloque o asociado por data-contador="<seccion>"
    let salida = bloque.querySelector('[data-contador]');
    if (!salida) {
      salida = document.querySelector('[data-contador="' + nombre + '"]');
    }
    if (salida) {
      salida.textContent = textoCantidad(total, 'artículo', 'artículos');
    }
  });
}

/* ------------------------------------------------------------
   VALIDACIÓN ACCESIBLE (utilidades comunes)
   ------------------------------------------------------------ */
function mostrarError(campo, ayudaId, mensaje) {
  const ayuda = document.getElementById(ayudaId);
  campo.classList.add('is-danger');
  campo.setAttribute('aria-invalid', 'true');
  if (ayuda) {
    ayuda.textContent = mensaje;
    ayuda.classList.remove('is-hidden');
  }
}

function limpiarError(campo, ayudaId) {
  const ayuda = document.getElementById(ayudaId);
  campo.classList.remove('is-danger');
  campo.removeAttribute('aria-invalid');
  if (ayuda) {
    ayuda.textContent = '';
    ayuda.classList.add('is-hidden');
  }
}

function esCorreoValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

function mostrarMensaje(cajaId, texto, tipo) {
  const caja = document.getElementById(cajaId);
  if (!caja) return;
  caja.textContent = texto;
  caja.className = 'notification ' + tipo; // is-success / is-danger
  caja.classList.remove('is-hidden');
  caja.setAttribute('role', 'status');
}

/* ------------------------------------------------------------
   FORMULARIO DE CONTACTO
   ------------------------------------------------------------ */
function activarFormularioContacto() {
  const form = document.getElementById('form-contacto');
  if (!form) return;

  form.addEventListener('submit', function (evento) {
    evento.preventDefault();

    const nombre = document.getElementById('contacto-nombre');
    const correo = document.getElementById('contacto-correo');
    const mensaje = document.getElementById('contacto-mensaje');
    let primerError = null;

    // Nombre
    if (nombre.value.trim() === '') {
      mostrarError(nombre, 'ayuda-contacto-nombre', 'Ingresa tu nombre.');
      primerError = primerError || nombre;
    } else {
      limpiarError(nombre, 'ayuda-contacto-nombre');
    }

    // Correo
    if (!esCorreoValido(correo.value.trim())) {
      mostrarError(correo, 'ayuda-contacto-correo', 'Ingresa un correo válido.');
      primerError = primerError || correo;
    } else {
      limpiarError(correo, 'ayuda-contacto-correo');
    }

    // Mensaje
    if (mensaje.value.trim() === '') {
      mostrarError(mensaje, 'ayuda-contacto-mensaje', 'Escribe tu mensaje.');
      primerError = primerError || mensaje;
    } else {
      limpiarError(mensaje, 'ayuda-contacto-mensaje');
    }

    if (primerError) {
      // Gestión del foco: llevar al primer campo con error
      primerError.focus();
      mostrarMensaje('mensaje-contacto',
        'Revisa los campos marcados en rojo.', 'is-danger');
      return;
    }

    // Éxito: mensaje visible y limpieza del formulario
    mostrarMensaje('mensaje-contacto',
      '¡Gracias! Tu mensaje fue enviado correctamente.', 'is-success');
    form.reset();
    nombre.focus();
  });
}

/* ------------------------------------------------------------
   FORMULARIO DE PUBLICACIÓN DE ARTÍCULO (página noticias)
   ------------------------------------------------------------
   Agrega dinámicamente una tarjeta con animación y actualiza el
   contador de la sección.
   ------------------------------------------------------------ */
function activarFormularioArticulo() {
  const form = document.getElementById('form-articulo');
  if (!form) return;

  form.addEventListener('submit', function (evento) {
    evento.preventDefault();

    const titulo = document.getElementById('articulo-titulo');
    const categoria = document.getElementById('articulo-categoria');
    let primerError = null;

    if (titulo.value.trim() === '') {
      mostrarError(titulo, 'ayuda-articulo-titulo', 'Ingresa un título.');
      primerError = primerError || titulo;
    } else {
      limpiarError(titulo, 'ayuda-articulo-titulo');
    }

    if (primerError) {
      primerError.focus();
      mostrarMensaje('mensaje-articulo',
        'Completa el título para publicar.', 'is-danger');
      return;
    }

    // Crear tarjeta nueva
    const grilla = document.getElementById('grilla-articulos');
    const col = document.createElement('div');
    col.className = 'column is-one-quarter';
    col.innerHTML =
      '<div class="card card-articulo animar-entrada">' +
        '<div class="card-content">' +
          '<span class="tag is-primary is-light mb-2">' +
            escaparHTML(categoria.value) + '</span>' +
          '<p class="title is-6">' + escaparHTML(titulo.value) + '</p>' +
          '<p class="subtitle is-7 has-text-grey">Recién publicado</p>' +
        '</div>' +
      '</div>';
    grilla.prepend(col);

    actualizarContadores();
    mostrarMensaje('mensaje-articulo',
      'Artículo publicado correctamente.', 'is-success');
    form.reset();
    titulo.focus();
  });
}

/* Evita inyección de HTML al insertar texto del usuario */
function escaparHTML(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}
