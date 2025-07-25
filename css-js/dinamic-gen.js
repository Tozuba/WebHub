// Función para saber si está activado el modo bajo consumo
function isLowDataMode() {
  return localStorage.getItem('lowDataMode') === 'true';
}
// dinamic-gen.js
// Generador dinámico de secciones a partir de archivos JSON de contenido

const paginaActual = document.body.getAttribute('data-pagina');
console.log('Página actual:', paginaActual);

// Plantillas preestablecidas
const templates = {
  
  'carrusel': (data) => {
    let indicators = data.items.map((_, i) => `
      <button type="button" data-bs-target="#${data.id}" data-bs-slide-to="${i}"${i === 0 ? ' class="active" aria-current="true"' : ''} aria-label="${data.items[i].titulo}"></button>
    `).join('');
    let items = data.items.map((item, i) => `
      <div class="carousel-item${i === 0 ? ' active' : ''}">
        <img src="${item.imagen}" class="d-block w-100" alt="${item.titulo}">
        <div class="carousel-caption d-none d-md-block">
          <h5>${item.titulo}</h5>
          <p>${item.descripcion}</p>
        </div>
      </div>
    `).join('');
    return `
      <section class="container seccion-carrusel my-4">
        <div id="${data.id}" class="carousel slide" data-bs-ride="carousel">
          <div class="carousel-indicators">
            ${indicators}
          </div>
          <div class="carousel-inner">
            ${items}
          </div>
          <button class="carousel-control-prev" type="button" data-bs-target="#${data.id}" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Anterior</span>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#${data.id}" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Siguiente</span>
          </button>
        </div>
      </section>
    `;
  },
  'texto': (data) => {
    return `
      <section class="container seccion-texto my-4">
        <h2>${data.titulo}</h2>
        <p>${data.contenido}</p>
      </section>
    `;
  },
  'calendario': async (data) => {
    const hoy = new Date();
    const year = data.year || hoy.getFullYear();
    const month = data.month != null ? data.month : hoy.getMonth();
    const currentHtml = paginaActual;
    const eventosPath = pageToEventosJson[currentHtml] || `eventos/${currentHtml.replace('.html','')}.json`;
    let eventos = [];
    try {
      const response = await fetch(eventosPath);
      if (response.ok) {
        eventos = await response.json();
      }
    } catch (e) {}
    const diasMes = new Date(year, month + 1, 0).getDate();
    const primerDia = new Date(year, month, 1).getDay();
    const colores = {
      consejo:   { bg: "#ffc0cb", color: "#222", texto: "Consejo" },
      misas:     { bg: "#2e7d32", color: "#fff", texto: "Misas" },
      vacaciones:{ bg: "#b3e5fc", color: "#222", texto: "Vacaciones" },
      semanasanta:{ bg: "#e1bee7", color: "#222", texto: "Semana Santa" },
      suspension:{ bg: "#bdbdbd", color: "#222", texto: "Suspensión" },
      cursodocente:{ bg: "#ffd54f", color: "#222", texto: "Curso Docente" },
      evento:     { bg: "#90caf9", color: "#222", texto: "Evento" },
      default:   { bg: "#fff", color: "#222", texto: "" }
    };
    // Agrupa eventos por día
    const eventosPorDia = {};
    (eventos || []).forEach(ev => {
      const [y, m, d] = ev.fecha.split('-');
      const fechaLocal = new Date(Number(y), Number(m) - 1, Number(d));
      if (fechaLocal.getFullYear() === year && fechaLocal.getMonth() === month) {
        const dia = fechaLocal.getDate();
        eventosPorDia[dia] = ev.eventos || [];
      }
    });
    let celdas = [];
    for (let i = 0; i < primerDia; i++) {
      // Casillas de relleno al inicio: gris neutro
      celdas.push('<td class="cal-celda" style="background:#e5e5e5;"></td>');
    }
    for (let dia = 1; dia <= diasMes; dia++) {
      const eventosDia = eventosPorDia[dia] || [];
      let tipo = eventosDia.length ? eventosDia[0].tipo : "default";
      const { bg, color } = colores[tipo] || colores.default;
      let tituloEvento = eventosDia.length ? eventosDia[0].titulo : "";
      if (eventosDia.length > 1) tituloEvento += " + más...";
      let dataEvento = eventosDia.length ? `data-eventos='${JSON.stringify(eventosDia).replace(/'/g, "&#39;")}'` : '';
      // Determinar el día de la semana (0=Domingo, 6=Sábado)
      const diaSemana = (primerDia + dia - 1) % 7;
      let fondo = "#fff";
      if (diaSemana === 0 || diaSemana === 6) fondo = "#f2f2f2"; // Domingo o Sábado
      // Ya no cambiamos el fondo a "transparent" si hay evento, solo agregamos el bloque estilizado dentro
      celdas.push(`
        <td class="cal-celda" style="background:${fondo};cursor:${eventosDia.length ? 'pointer' : 'default'};" ${dataEvento}>
          <div class="cal-dia-num"><strong>${dia}</strong></div>
          ${eventosDia.length ? `
            <div class="cal-celda-evento" style="background:${bg};color:${color};border-radius:1em;padding:0.4em 0.5em;margin:0.5em 0.2em 0.2em 0.2em;transition:box-shadow 0.2s;">
              <span style="font-weight:bold;">${tituloEvento}</span>
            </div>
          ` : ''}
        </td>
      `);
    }
    while (celdas.length % 7 !== 0) {
      // Casillas de relleno al final: gris neutro
      celdas.push('<td class="cal-celda" style="background:#e5e5e5;"></td>');
    }
    let filas = '';
    for (let i = 0; i < celdas.length; i += 7) {
      filas += `<tr>${celdas.slice(i, i + 7).join('')}</tr>`;
    }
    const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    const dias = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
    const leyenda = [
      { tipo: "consejo", texto: "Consejo", bg: colores.consejo.bg, color: colores.consejo.color },
      { tipo: "misas", texto: "Misas", bg: colores.misas.bg, color: colores.misas.color },
      { tipo: "vacaciones", texto: "Vacaciones", bg: colores.vacaciones.bg, color: colores.vacaciones.color },
      { tipo: "semanasanta", texto: "Semana Santa", bg: colores.semanasanta.bg, color: colores.semanasanta.color },
      { tipo: "suspension", texto: "Suspensión", bg: colores.suspension.bg, color: colores.suspension.color },
      { tipo: "cursodocente", texto: "Curso Docente", bg: colores.cursodocente.bg, color: colores.cursodocente.color },
      { tipo: "evento", texto: "Evento", bg: colores.evento.bg, color: colores.evento.color }
    ].map(l => `<span class="cal-leyenda-item" style="background:${l.bg};color:${l.color};">${l.texto}</span>`).join('');
    // Modal para mostrar eventos
    const modalHtml = `
      <div class="modal fade" id="modalEventosDia" tabindex="-1" aria-labelledby="modalEventosDiaLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="modalEventosDiaLabel">Eventos del día</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body" id="modalEventosDiaBody"></div>
          </div>
        </div>
      </div>
    `;
    setTimeout(() => {
      if (!document.getElementById('modalEventosDia')) {
        document.body.insertAdjacentHTML('beforeend', modalHtml);
      }
      document.querySelectorAll('.cal-celda[data-eventos]').forEach(td => {
        td.addEventListener('click', function() {
          const eventos = JSON.parse(this.getAttribute('data-eventos').replace(/&#39;/g, "'"));
          // Obtener el día de la celda
          const dia = this.querySelector('.cal-dia-num strong')?.textContent || '';
          // Obtener mes y año actuales
          const fecha = `${dia} de ${meses[month]} ${year}`;
          let html = eventos.map(ev => {
            const tipo = ev.tipo || "evento";
            const color = colores[tipo]?.bg || "#eee";
            return `
              <div style="border-left:6px solid ${color};padding-left:0.7em;margin-bottom:0.7em;">
                <div style="font-weight:bold;">${ev.titulo}</div>
                <div style="font-size:0.97em;color:#555;">${ev.horario ? 'Horario: ' + ev.horario : ''}</div>
                <div style="font-size:0.95em;color:#888;">Tipo: ${colores[tipo]?.texto || tipo}</div>
              </div>
            `;
          }).join('');
          // Cambia el título del modal para incluir la fecha
          document.getElementById('modalEventosDiaLabel').textContent = `Eventos del día ${fecha}`;
          document.getElementById('modalEventosDiaBody').innerHTML = html;
          const modal = new bootstrap.Modal(document.getElementById('modalEventosDia'));
          modal.show();
        });
      });
    }, 100);
    return `
      <section class="container seccion-calendario my-4">
        <h2>Calendario de ${meses[month]} ${year}</h2>
        ${data.detalle ? `<div class="calendario-detalle mb-2">${data.detalle}</div>` : ''}
        <div class="calendario-leyenda mb-2">${leyenda}</div>
        <div class="calendario-scroll">
          <table class="table table-bordered text-center align-middle mb-0 cal-table">
            <thead class="table-light">
              <tr>${dias.map(d => `<th>${d}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${filas}
            </tbody>
          </table>
        </div>
      </section>
    `;
  },
  'imagenTexto': (data) => {
    return `
      <section class="container seccion-imagen-texto my-4" style="background:${data.fondo || '#fff'};">
        <div class="row align-items-center">
          <div class="col-md-5 text-center mb-3 mb-md-0">
            <img src="${data.imagen}" alt="${data.titulo}" class="img-fluid rounded shadow" style="max-height:260px;">
          </div>
          <div class="col-md-7 text-center">
            <h2 class="mb-3">${data.titulo}</h2>
            <p class="mb-0 text-muted" style="font-size:1.15em; text-align: justify;">${data.texto}</p>
          </div>
        </div>
      </section>
    `;
  },
  'imagenTextoDer': (data) => {
    return `
      <section class="container seccion-imagen-texto my-4" style="background:${data.fondo || '#fff'};">
        <div class="row align-items-center flex-row-reverse">
          <div class="col-md-5 text-center mb-3 mb-md-0">
            <img src="${data.imagen}" alt="${data.titulo}" class="img-fluid rounded shadow" style="max-height:260px;">
          </div>
          <div class="col-md-7 text-center">
            <h2 class="mb-3">${data.titulo}</h2>
            <p class="mb-0" style="font-size:1.15em; text-align: justify;">${data.texto}</p>
          </div>
        </div>
      </section>
    `;
  },
  'imagenArriba': (data) => {
    return `
      <section class="container seccion-imagen-arriba my-4" style="background:${data.fondo || '#fff'};">
        <div class="text-center">
          <img src="${data.imagen}" alt="${data.titulo}" class="img-fluid rounded shadow mb-3" style="max-height:260px;">
          <h2 class="mb-3">${data.titulo}</h2>
          <p class="mb-0" style="font-size:1.15em;">${data.texto}</p>
        </div>
      </section>
    `;
  },
  'tema': (data) => {
    // Aplica fondo degradado o imagen al body
    let style = '';
    if (data.imagen) {
      style = `
        body {
          background: linear-gradient(0deg, ${data.color1}, ${data.color2}),
                      url('${data.imagen}') center center / cover no-repeat fixed;
          background-blend-mode: overlay;
        }
      `;
    } else {
      style = `
        body {
          background: linear-gradient(0deg, ${data.color1}, ${data.color2});
        }
      `;
    }
    // Elimina estilos previos de tema si existen
    let old = document.getElementById('tema-style');
    if (old) old.remove();
    // Inserta el nuevo estilo
    const s = document.createElement('style');
    s.id = 'tema-style';
    s.innerHTML = style;
    document.head.appendChild(s);
    return ''; // No renderiza HTML visible
  },
  'videoArriba': (data) => {
    let videoHtml = '';
    // Mostrar imagen solo si está en modo ahorro de datos o bajo consumo
    const dataSaver = (navigator.connection && navigator.connection.saveData) || isLowDataMode();
    if (data.imagenAlternativa && dataSaver) {
      videoHtml = `
        <img src="${data.imagenAlternativa}" alt="${data.titulo}" class="img-fluid rounded shadow mb-3" style="width:100%;max-width:900px;aspect-ratio:3/1;object-fit:cover;">
      `;
    } else if (data.video.includes('youtube.com') || data.video.includes('youtu.be')) {
      // Extraer ID de YouTube
      let videoId = '';
      if (data.video.includes('youtu.be/')) {
        videoId = data.video.split('youtu.be/')[1].split(/[?&]/)[0];
      } else {
        const match = data.video.match(/v=([^&]+)/);
        videoId = match ? match[1] : '';
      }
      videoHtml = `
        <div class="mb-3" style="width:100%;max-width:900px;aspect-ratio:3/1;margin:auto;">
          <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}" 
            title="${data.titulo}" allow="autoplay" allowfullscreen
            style="width:100%;height:100%;border-radius:12px;object-fit:cover;">
          </iframe>
        </div>
      `;
    } else {
      // Video local con fallback a imagen alternativa solo si el video falla
      videoHtml = `
        <div style="width:100%;max-width:900px;aspect-ratio:3/1;margin:auto;position:relative;">
          <video class="w-100 mb-3" autoplay loop muted playsinline poster="${data.imagenAlternativa || ''}" 
            style="width:100%;height:100%;border-radius:12px;object-fit:cover;aspect-ratio:3/1;"
            onerror="this.style.display='none';this.parentNode.querySelector('.video-fallback-img').style.display='block';">
            <source src="${data.video}" type="video/mp4">
            Tu navegador no soporta la reproducción de video.
          </video>
          ${data.imagenAlternativa ? `<img src="${data.imagenAlternativa}" alt="${data.titulo}" class="img-fluid rounded shadow mb-3 video-fallback-img" style="display:none;width:100%;height:100%;max-width:900px;aspect-ratio:3/1;object-fit:cover;position:absolute;top:0;left:0;">` : ''}
        </div>
      `;
    }
    return `
      <section class="container seccion-video-arriba my-4" style="background:${data.fondo || '#fff'};">
        <div class="text-center">
          ${videoHtml}
          <h2 class="mb-3 animated-title">${data.titulo}</h2>
          <p class="mb-0" style="font-size:1.15em;">${data.texto}</p>
        </div>
      </section>
    `;
  },
  'videoFondo': (data) => {
  // Elimina cualquier fondo de video anterior
  const oldBg = document.getElementById('video-fondo-bg');
  if (oldBg) oldBg.remove();

  // Determina si se debe mostrar la imagen alternativa (modo ahorro de datos)
  const dataSaver = (navigator.connection && navigator.connection.saveData) || isLowDataMode();

  // Crea el contenedor del fondo
  let fondoHtml = '';
  if (dataSaver && data.imagenAlternativa) {
    fondoHtml = `
      <div id="video-fondo-bg" style="position:fixed;z-index:-1;top:0;left:0;width:100vw;height:100vh;overflow:hidden;pointer-events:none;">
        <img src="${data.imagenAlternativa}" alt="Fondo" style="width:100vw;height:100vh;object-fit:cover;object-position:center;filter:brightness(1);">
      </div>
    `;
  } else {
    fondoHtml = `
      <div id="video-fondo-bg" style="position:fixed;z-index:-1;top:0;left:0;width:100vw;height:100vh;overflow:hidden;pointer-events:none;">
        <video autoplay loop muted playsinline
          style="width:100vw;height:100vh;object-fit:cover;object-position:center;filter:brightness(1);" tabindex="-1">
          <source src="${data.video}" type="video/mp4">
        </video>
        ${data.imagenAlternativa ? `<img src="${data.imagenAlternativa}" alt="Fondo" style="display:none;">` : ''}
      </div>
    `;
  }

  // Inserta el fondo al inicio del body
  document.body.insertAdjacentHTML('afterbegin', fondoHtml);

  // Opcional: puedes devolver un string vacío porque no se renderiza nada visible en la sección
  return '';
  },
  'principal': (data) => {
    // data.titulo, data.imagen, data.fondo, data.colorTexto
    const fondo = typeof data.fondo === 'string' && data.fondo.trim() !== '' ? `background:${data.fondo};` : '';
    return `
      <section class="container seccion-principal my-4" style="${fondo}">
        <div class="text-center">
          <h1 class="mb-3"  style="margin-top:4.5rem; color:${data.colorTexto || '#222'};">${data.titulo}</h1>
          <img src="${data.imagen}" alt="${data.titulo}" class="img-fluid rounded shadow mb-3" style="max-width:340px;">
          ${data.texto ? `<p class="mb-0" style="font-size:1.15em;color:${data.colorTexto || '#222'};">${data.texto}</p>` : ''}
        </div>
      </section>
    `;
  },
  'tituloPagina': (data) => {
  // data.titulo, data.fondo, data.colorTexto, data.opacidad
  const opacidad = data.opacidad || '0.5';
  const fondo = data.fondo || `0, 51, 102`;
  const colorTexto = data.colorTexto || '#fff';
  const opacidadTexto = data.opacidadTexto || '0.5';
  return `
    <section class="container-fluid seccion-titulo-pagina my-0" style="margin-top:0rem;">
      <div style="
        background-color: rgba(${fondo},${opacidad});
        color: ${colorTexto};
        border-radius: 1.2em;
        padding: 2.2rem 1.2rem 1.2rem 1.2rem;
        text-align: center;
        max-width: 900px;
        margin: auto;
        margin-top:2rem;
      ">
        <h1 style="margin:0;font-size:${data.tamFuente}; opacity:${opacidadTexto}">${data.titulo}</h1>
      </div>
    </section>
  `;
},
'noticiasSpot': (data) => {
  // Bootstrap Carousel con duración personalizada por video
  const carruselId = data.id || 'noticiasSpot-' + Math.random().toString(36).substr(2, 8);
  const videos = Array.isArray(data.videos) ? data.videos : [];
  if (videos.length === 0) return '';

  // Indicadores Bootstrap
  let indicators = videos.map((_, i) => `
    <button type="button" data-bs-target="#${carruselId}" data-bs-slide-to="${i}"${i === 0 ? ' class="active" aria-current="true"' : ''} aria-label="Spot ${i + 1}"></button>
  `).join('');

  // Items del carrusel
  let items = videos.map((vid, i) => `
    <div class="carousel-item${i === 0 ? ' active' : ''}">
      <a href="${vid.ruta || '#'}" target="_blank">
        <video 
          class="d-block w-100 noticias-spot-video" 
          src="${vid.src}" 
          poster="${vid.imagenAlternativa || ''}" 
          style="aspect-ratio:16/9;object-fit:cover;border-radius:12px;cursor:pointer;"
          muted
          playsinline
          preload="auto"
          ${i === 0 ? 'autoplay' : ''}
        ></video>
      </a>
    </div>
  `).join('');

  // Script para controlar la duración de cada video y avanzar el carrusel automáticamente
  const script = `
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        var carrusel = document.getElementById('${carruselId}');
        if (!carrusel) return;
        var carouselInstance = bootstrap.Carousel.getOrCreateInstance(carrusel);
        var videos = carrusel.querySelectorAll('.noticias-spot-video');
        var durations = ${JSON.stringify(videos.map(v => v.duracion || 10))};
        let idx = 0;
        let timer = null;

        function playActiveVideo() {
          videos.forEach((video, i) => {
            video.pause();
            video.currentTime = 0;
            if (i === idx) {
              video.play();
            }
          });
        }

        function scheduleNext() {
          clearTimeout(timer);
          timer = setTimeout(function() {
            idx = (idx + 1) % videos.length;
            carouselInstance.to(idx);
          }, durations[idx] * 1000);
        }

        carrusel.addEventListener('slid.bs.carousel', function(e) {
          idx = Array.from(carrusel.querySelectorAll('.carousel-item')).findIndex(item => item.classList.contains('active'));
          playActiveVideo();
          scheduleNext();
        });

        // Iniciar el primer video y timer
        playActiveVideo();
        scheduleNext();
      });
    </script>
  `;

  return `
   <div class="container px-4 py-5" id="custom-cards"> 
   <h2 class="pb-2 border-bottom">Custom cards</h2> 
   <div class="row row-cols-1 row-cols-lg-3 align-items-stretch g-4 py-5"> 
   <div class="col"> 
   <div class="card card-cover h-100 overflow-hidden text-bg-dark rounded-4 shadow-lg" style="background-image: url('unsplash-photo-1.jpg');"> 
   <div class="d-flex flex-column h-100 p-5 pb-3 text-white text-shadow-1">
    <h3 class="pt-5 mt-5 mb-4 display-6 lh-1 fw-bold">Short title, long jacket</h3>
     <ul class="d-flex list-unstyled mt-auto"> <li class="me-auto"> <img src="https://github.com/twbs.png" alt="Bootstrap" width="32" height="32" class="rounded-circle border border-white"> </li> <li class="d-flex align-items-center me-3">
      <svg class="bi me-2" width="1em" height="1em" role="img" aria-label="Location"><use xlink:href="#geo-fill"></use></svg> <small>Earth</small> </li> <li class="d-flex align-items-center"> <svg class="bi me-2" width="1em" height="1em" role="img" aria-label="Duration"><use xlink:href="#calendar3"></use></svg> <small>3d</small> </li> </ul> </div> </div> </div> <div class="col"> <div class="card card-cover h-100 overflow-hidden text-bg-dark rounded-4 shadow-lg" style="background-image: url('unsplash-photo-2.jpg');"> <div class="d-flex flex-column h-100 p-5 pb-3 text-white text-shadow-1"> <h3 class="pt-5 mt-5 mb-4 display-6 lh-1 fw-bold">Much longer title that wraps to multiple lines</h3> <ul class="d-flex list-unstyled mt-auto"> <li class="me-auto"> <img src="https://github.com/twbs.png" alt="Bootstrap" width="32" height="32" class="rounded-circle border border-white"> </li> <li class="d-flex align-items-center me-3"> <svg class="bi me-2" width="1em" height="1em" role="img" aria-label="Location"><use xlink:href="#geo-fill"></use></svg> <small>Pakistan</small> </li> <li class="d-flex align-items-center"> <svg class="bi me-2" width="1em" height="1em" role="img" aria-label="Duration"><use xlink:href="#calendar3"></use></svg> <small>4d</small> </li> </ul> </div> </div> </div> <div class="col"> <div class="card card-cover h-100 overflow-hidden text-bg-dark rounded-4 shadow-lg" style="background-image: url('unsplash-photo-3.jpg');"> <div class="d-flex flex-column h-100 p-5 pb-3 text-shadow-1"> <h3 class="pt-5 mt-5 mb-4 display-6 lh-1 fw-bold">Another longer title belongs here</h3> <ul class="d-flex list-unstyled mt-auto"> <li class="me-auto"> <img src="https://github.com/twbs.png" alt="Bootstrap" width="32" height="32" class="rounded-circle border border-white"> </li> <li class="d-flex align-items-center me-3"> <svg class="bi me-2" width="1em" height="1em" role="img" aria-label="Location"><use xlink:href="#geo-fill"></use></svg> <small>California</small> </li> <li class="d-flex align-items-center"> <svg class="bi me-2" width="1em" height="1em" role="img" aria-label="Duration"><use xlink:href="#calendar3"></use></svg> <small>5d</small> </li> </ul> </div> </div> </div> </div> </div>
  `;
},
'textoFondoFull': (data) => {
  // data.texto, data.fondo, data.colorTexto, data.fuente
  return `
    <section class="seccion-texto-fondo-full d-flex align-items-center justify-content-center" 
      style="
        width: 100vw;
        min-height: 35vh;
        background: ${data.fondo || '#222'};
        color: ${data.colorTexto || '#fff'};
        font-family: ${data.fuente || 'inherit'};
        padding: 3rem 1rem;
        margin-left: calc(-50vw + 50%);
        margin-right: calc(-50vw + 50%);
        box-sizing: border-box;
        text-align: center;
      ">
      <div style="width:100%;max-width:900px;margin:auto;">
        <p style="font-size:1.5em;margin:0;">${data.texto || ''}</p>
      </div>
    </section>
  `;
},
'customCards': (data) => {
  // data.titulo, data.items: [{ imagen, titulo, texto, fondo, colorTexto }]
  return `
    <section class="container px-4 py-5" id="custom-cards">
      ${data.titulo ? `<h2 class="pb-2  text-center ">${data.titulo}</h2>` : ''}
      <div class="row row-cols-1 row-cols-lg-3 align-items-stretch g-4 py-5">
        ${data.items.map(item => `
          <div class="col">
            <a href="${item.ruta || '#'}" ${item.ruta ? '"' : ''} style="text-decoration:none;">
              <div class="card card-cover h-100 overflow-hidden rounded-4 shadow-lg"
                  style="background: ${item.fondo || '#222'} url('${item.imagen}') center center/cover no-repeat;">
                <div class="d-flex flex-column h-100 p-5 pb-3"
                  style="color: ${item.colorTexto || '#fff'}; text-shadow: 1px 1px 4px #000;">
                  <h3 class="pt-5 mt-5 mb-4 display-6 lh-1 fw-bold">${item.titulo || ''}</h3>
                  <p class="mb-4">${item.texto || ''}</p>
                  ${item.avatar ? `
                    <ul class="d-flex list-unstyled mt-auto">
                      <li class="me-auto">
                        <img src="${item.avatar}" alt="Avatar" width="32" height="32" class="rounded-circle border border-white">
                      </li>
                    </ul>
                  ` : ''}
                </div>
              </div>
            </a>
          </div>
        `).join('')}
      </div>
    </section>
  `;
},
'customCards4': (data) => {
  // data.titulo, data.fondo, data.colorTitulo, data.items: [{ imagen, titulo, texto, fondo, colorTexto, avatar, ruta }]
  return `
    <section class=" seccion-texto-fondo-full px-4 py-5" id="custom-cards4" style="background:${data.fondo || '#fff'};">
      ${data.titulo ? `
        <h2 class="pb-2  text-center"
            style="color:${data.colorTitulo || '#222'}; text-shadow: 0px 0px 2px #fff; background: 2px solid #333; padding: 10px;">
          ${data.titulo}
        </h2>
      ` : ''}
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 align-items-stretch g-4 py-3">
        ${data.items.map(item => `
          <div class="col">
            <a href="${item.ruta || '#'}" ${item.ruta ? '"' : ''} style="text-decoration:none;">
              <div class="card card-cover h-100 overflow-hidden rounded-4 shadow-lg"
                style="background: ${item.fondo || '#222'} url('${item.imagen}') center center/cover no-repeat;">
                <div class="d-flex flex-column h-100 p-4 pb-3"
                  style="color: ${item.colorTexto || '#fff'}; text-shadow: 0px 0px 8px #000;">
                  <h3 class="pt-4 mt-3 mb-3 display-6 lh-1 fw-bold">${item.titulo || ''}</h3>
                  <p class="mb-3">${item.texto || ''}</p>
                  ${item.avatar ? `
                    <ul class="d-flex list-unstyled mt-auto">
                      <li class="me-auto">
                        <img src="${item.avatar}" alt="Avatar" width="32" height="32" class="rounded-circle border border-white">
                      </li>
                    </ul>
                  ` : ''}
                </div>
              </div>
            </a>
          </div>
        `).join('')}
      </div>
    </section>
  `;
},
'customCards3': (data) => {
  // data.titulo, data.fondo, data.colorTitulo, data.items: [{ imagen, titulo, texto, fondo, colorTexto, avatar, ruta }]
  return `
    <section class="container px-4 py-5" id="custom-cards3" style="background:${data.fondo || '#fff'};">
      ${data.titulo ? `
        <h2 class="pb-2 border-bottom text-center"
            style="color:${data.colorTitulo || '#222'};">
          ${data.titulo}
        </h2>
      ` : ''}
      <div class="row row-cols-1 row-cols-md-3 align-items-stretch g-4 py-3">
        ${data.items.map(item => `
          <div class="col">
            <a href="${item.ruta || '#'}" ${item.ruta ? '"' : ''} style="text-decoration:none;">
              <div class="card h-100 overflow-hidden rounded-4 shadow-lg d-flex flex-column align-items-center justify-content-center"
                style="background: ${item.fondo || '#fff'};">
                <img src="${item.imagen}" alt="${item.titulo}" class="img-fluid my-4" style="max-width:160px;max-height:160px;object-fit:contain;display:block;margin:auto;">
                <div class="d-flex flex-column align-items-center px-3 pb-3 w-100"
                  style="color: ${item.colorTexto || '#222'};">
                  <h3 class="mb-2 text-center fw-bold">${item.titulo || ''}</h3>
                  <p class="mb-2 text-center">${item.texto || ''}</p>
                  ${item.avatar ? `
                    <img src="${item.avatar}" alt="Avatar" width="32" height="32" class="rounded-circle border border-white mt-2">
                  ` : ''}
                </div>
              </div>
            </a>
          </div>
        `).join('')}
      </div>
    </section>
  `;
},
'videoLoop': (data) => {
  // data.video (ruta del video), data.imagenAlternativa (poster), data.fondo (opcional)
  return `
    <section class="container-fluid px-0" style="background:${data.fondo || 'transparent'};">
      <div style="width:100%;max-width:1200px;margin:auto;aspect-ratio:16/9;overflow:hidden;border-radius:16px;">
        <video 
          src="${data.video}" 
          poster="${data.imagenAlternativa || ''}" 
          autoplay 
          loop 
          muted 
          playsinline 
          style="width:100%;height:100%;object-fit:cover;pointer-events:none;user-select:none;display:block;"
          tabindex="-1"
        ></video>
      </div>
    </section>
  `;
},
'piePagina': (data) => {
  // data.imagen, data.titulo, data.texto, data.fondo, data.colorTexto, data.fuente, data.alt
  return `
    <section class="container seccion-pie-pagina my-4" style="background:${data.fondo || '#222'};color:${data.colorTexto || '#fff'};font-family:${data.fuente || 'inherit'}; border-radius: 12px; padding: 2rem;">
      <div class="text-center py-4">
        ${data.imagen ? `<img src="${data.imagen}" alt="${data.alt || data.titulo || 'Pie de página'}" class="img-fluid rounded mb-3" style="max-height:120px;">` : ''}
        ${data.titulo ? `<h2 class="mb-3">${data.titulo}</h2>` : ''}
        ${data.texto ? `<p class="mb-0" style="font-size:1.15em;">${data.texto}</p>` : ''}
      </div>
    </section>
  `;
},
'tituloPagina': (data) => {
  // data.titulo, data.fondo, data.colorTexto, data.bordeColor, data.bordeRadio, data.tamFuente, data.fuente
  const fondo = data.fondo || '#13294a'; // azul institucional por defecto
  const colorTexto = data.colorTexto || '#fff';
  const bordeColor = data.bordeColor || '#fff';
  const bordeRadio = data.bordeRadio || '1.2em';
  const tamFuente = data.tamFuente || '2.8em';
  const fuente = data.fuente || 'Calibri, Arial, sans-serif';
  return `
    <section class="container-fluid seccion-titulo-pagina my-0" style="margin-top:0rem;">
      <div style="
        background: ${fondo};
        color: ${colorTexto};
        border-radius: ${bordeRadio};
        border: 3px solid ${bordeColor};
        padding: 2.2rem 1.2rem 1.2rem 1.2rem;
        text-align: center;
        max-width: 900px;
        margin: auto;
        margin-top:2rem;
        font-family: ${fuente};
      ">
        <h1 style="margin:0;font-size:${tamFuente};">${data.titulo}</h1>
      </div>
    </section>
  `;
},
'videoArribaTitulo': (data) => {
    let videoHtml = '';
    // Mostrar imagen solo si está en modo ahorro de datos o bajo consumo
    const dataSaver = (navigator.connection && navigator.connection.saveData) || isLowDataMode();
    if (data.imagenAlternativa && dataSaver) {
      videoHtml = `
        <img src="${data.imagenAlternativa}" alt="${data.titulo}" class="img-fluid rounded mb-3" style="width:100%;max-width:900px;aspect-ratio:3/1;object-fit:cover;">
      `;
    } else if (data.video.includes('youtube.com') || data.video.includes('youtu.be')) {
      // Extraer ID de YouTube
      let videoId = '';
      if (data.video.includes('youtu.be/')) {
        videoId = data.video.split('youtu.be/')[1].split(/[?&]/)[0];
      } else {
        const match = data.video.match(/v=([^&]+)/);
        videoId = match ? match[1] : '';
      }
      videoHtml = `
        <div class="mb-3" style="width:100%;max-width:900px;aspect-ratio:3/1;margin:auto;">
          <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}" 
            title="${data.titulo}" allow="autoplay" allowfullscreen
            style="width:100%;height:100%;border-radius:12px;object-fit:cover;">
          </iframe>
        </div>
      `;
    } else {
      // Video local con fallback a imagen alternativa solo si el video falla
      videoHtml = `
        <div style="width:100%;max-width:900px;aspect-ratio:3/1;margin:auto;position:relative;">
          <video class="w-100 mb-3" autoplay loop muted playsinline poster="${data.imagenAlternativa || ''}" 
            style="width:100%;height:100%;border-radius:12px;object-fit:cover;aspect-ratio:3/1;"
            onerror="this.style.display='none';this.parentNode.querySelector('.video-fallback-img').style.display='block';">
            <source src="${data.video}" type="video/mp4">
            Tu navegador no soporta la reproducción de video.
          </video>
          ${data.imagenAlternativa ? `<img src="${data.imagenAlternativa}" alt="${data.titulo}" class="img-fluid rounded shadow mb-3 video-fallback-img" style="display:none;width:100%;height:100%;max-width:900px;aspect-ratio:3/1;object-fit:cover;position:absolute;top:0;left:0;">` : ''}
        </div>
      `;
    }
    return `
      <section class="container seccion-video-arriba-titulo my-4" style="background:${data.fondo || '#fff'};">
        <div class="text-center">
          ${videoHtml}
          
        </div>
      </section>
    `;
  },
  'imagenTextoLista': (data) => {
    return `
      <section class="container seccion-imagen-texto my-4" style="background:${data.fondo || '#fff'};">
        <div class="row align-items-center">
          <div class="col-md-5 text-center mb-3 mb-md-0">
            <img src="${data.imagen}" alt="${data.titulo}" class="img-fluid rounded shadow" style="max-height:260px;">
          </div>
          <div class="col-md-7 text-center">
            <h2 class="mb-3">${data.titulo}</h2>
            <style>
              .seccion-imagen-texto ul {
                list-style-type: disc;
                padding-left: 1.5em;
                text-align: left;
              }
            </style>
            <p class="mb-0 text-muted" style="font-size:1.15em; text-align:right;">${data.texto}</p>
          </div>
        </div>
      </section>
    `;
  },

  'noticias': (data) => {
  // data.noticias: [{ id, titulo, items: [{ tipo, texto, imagen, video, fondo, colorTexto, alineacion, controles }] }]
  // Si hay ?id=... en la URL, muestra esa noticia, si no, muestra la lista
  const urlParams = new URLSearchParams(window.location.search);
  const noticiaId = urlParams.get('id');
  let html = '';

  if (!noticiaId) {
    // Lista de noticias
    html += `
      <section class="container seccion-lista-noticias my-4">
        <h2 class="text-center mb-4" style="background:${data.fondoTitulo || '#13294a'};color:${data.colorTitulo || '#fff'};border-radius:1em;padding:1em;font-family:Calibri,Arial,sans-serif;">
          ${data.titulo || 'Noticias'}
        </h2>
        <div class="list-group">
          ${data.noticias.map(n => `
            <a href="?id=${n.id}" class="list-group-item list-group-item-action" style="font-size:1.2em;">
              ${n.titulo}
            </a>
          `).join('')}
        </div>
      </section>
    `;
  } else {
    // Mostrar noticia seleccionada
    const noticia = data.noticias.find(n => n.id == noticiaId);
    if (!noticia) {
      html += `<div class="container my-5"><div class="alert alert-warning">Noticia no encontrada.</div></div>`;
    } else {
      html += `
        <section class="container seccion-noticia my-4">
          <h2 class="text-center mb-4" style="background:${noticia.fondoTitulo || '#13294a'};color:${noticia.colorTitulo || '#fff'};border-radius:1em;padding:1em;font-family:Calibri,Arial,sans-serif;">
            ${noticia.titulo}
          </h2>
          ${noticia.items.map(item => {
            if (item.tipo === 'texto') {
              return `
                <div class="mb-4" style="background:${item.fondo || '#f5f5f5'};color:${item.colorTexto || '#222'};border-radius:1em;padding:1.2em;text-align:${item.alineacion || 'justify'};">
                  <p style="margin:0;font-size:1.15em;">${item.texto}</p>
                </div>
              `;
            }
            if (item.tipo === 'imagen') {
              return `
                <div class="mb-4 text-center" style="background:${item.fondo || 'transparent'};border-radius:1em;padding:1em;">
                  <img src="${item.imagen}" alt="${item.texto || noticia.titulo}" class="img-fluid rounded shadow" style="max-width:100%;max-height:400px;">
                  ${item.texto ? `<p class="mt-2" style="color:${item.colorTexto || '#222'};">${item.texto}</p>` : ''}
                </div>
              `;
            }
            if (item.tipo === 'video') {
              return `
                <div class="mb-4 text-center" style="background:${item.fondo || 'transparent'};border-radius:1em;padding:1em;">
                  <video src="${item.video}" ${item.controles ? 'controls' : ''} autoplay muted playsinline style="width:100%;max-width:600px;border-radius:1em;"></video>
                  ${item.texto ? `<p class="mt-2" style="color:${item.colorTexto || '#222'};">${item.texto}</p>` : ''}
                </div>
              `;
            }
            return '';
          }).join('')}
          <div class="mt-4 text-center">
            <a href="${window.location.pathname}" class="btn btn-secondary">Volver a la lista de noticias</a>
          </div>
        </section>
      `;
    }
  }
  return html;
},
  // Puedes agregar más plantillas aquí
};

// Esto debe estar en tu dinamic-gen.js o en un archivo JS que se cargue en la página
fetch('contenido/noticias.json')
  .then(res => res.json())
  .then(data => {
    // Si el JSON es un array, recorre y busca el tipo 'noticias'
    const noticiasData = Array.isArray(data) ? data.find(d => d.tipo === 'noticias') : data;
    if (noticiasData) {
      document.getElementById('secciones-dinamicas').innerHTML = templates.noticias(noticiasData);
    }
  });

// Función para cargar JSON y renderizar secciones
async function renderSectionsFromJSON(jsonPath, containerSelector) {
  try {
    const response = await fetch(jsonPath);
    const sections = await response.json();
    const container = document.querySelector(containerSelector);
    if (!container) return;
    let html = '';
    for (const section of sections) {
      if (templates[section.tipo]) {
        const result = templates[section.tipo](section);
        if (result instanceof Promise) {
          html += await result;
        } else {
          html += result;
        }
      }
    }
    container.innerHTML = html;
    // Efecto de aparición para las secciones
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('seccion-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    container.querySelectorAll('section').forEach(section => {
      section.classList.add('seccion-animada');
      observer.observe(section);
    });
  } catch (e) {
    console.error('Error cargando secciones dinámicas:', e);
  }
}
// Estilos para el efecto de aparición
const styleAnim = document.createElement('style');
styleAnim.innerHTML = `
  .seccion-animada {
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.7s cubic-bezier(.4,0,.2,1), transform 0.7s cubic-bezier(.4,0,.2,1);
  }
  .seccion-visible {
    opacity: 1;
    transform: none;
  }
`;
document.head.appendChild(styleAnim);

// Generar secciones dinámicas según el nombre del HTML
const pageToJson = {
  'index.html': 'contenido/index.json',
  'noticias.html': 'contenido/noticias.json',
  'preescolar.html': 'contenido/preescolar.json',
  'primaria.html': 'contenido/primaria.json',
  'secundaria.html': 'contenido/secundaria.json',
  'bachillerato.html': 'contenido/bachillerato.json',
  'idiomas.html': 'contenido/idiomas.json',
  'escueladeportiva.html': 'contenido/escueladeportiva.json',
  'pastoral.html': 'contenido/pastoral.json'
};

// Vincular HTML con JSON de eventos
const pageToEventosJson = {
  'index.html': 'eventos/index.json',
  'noticias.html': 'eventos/noticias.json',
  'preescolar.html': 'eventos/preescolar.json',
  'primaria.html': 'eventos/primaria.json',
  'secundaria.html': 'eventos/secundaria.json',
  'bachillerato.html': 'eventos/bachillerato.json',
  'idiomas.html': 'eventos/idiomas.json',
  'escueladeportiva.html': 'eventos/escueladeportiva.json',
  'pastoral.html': 'eventos/pastoral.json'
};

const currentPage = paginaActual;
if (pageToJson[currentPage]) {
  document.addEventListener('DOMContentLoaded', () => {
    renderSectionsFromJSON(pageToJson[currentPage], '#secciones-dinamicas');
  });
}

// Cargar datos comunes (navbar y footer) desde comun.json
document.addEventListener('DOMContentLoaded', () => {
  fetch('contenido/comun.json')
    .then(res => res.json())
    .then(data => {
      // Navbar
      if (data.navbar && Array.isArray(data.navbar.enlaces)) {
        const navUl = document.querySelector('.navbar-nav');
        if (navUl) {
          navUl.innerHTML = '';
          // Función recursiva para menús jerárquicos y desplegables
          function renderMenu(enlaces, isDropdown = false) {
            return enlaces.map(enlace => {
              if (enlace.submenu && Array.isArray(enlace.submenu)) {
                // Menú desplegable
                const dropdownId = 'dropdown-' + Math.random().toString(36).substr(2, 9);
                return `
                  <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="${dropdownId}" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                      ${enlace.texto}
                    </a>
                    <ul class="dropdown-menu" aria-labelledby="${dropdownId}">
                      ${renderMenu(enlace.submenu, true)}
                    </ul>
                  </li>
                `;
              } else {
                // Enlace normal
                return `<li class="nav-item">
                  <a class="nav-link${enlace.activo ? ' active' : ''}" href="${enlace.href}">${enlace.texto}</a>
                </li>`;
              }
            }).join('');
          }
          navUl.innerHTML = renderMenu(data.navbar.enlaces);
        }
        // Agregar opción de bajo consumo de datos a la barra de navegación
        if (navUl && !document.getElementById('low-data-toggle')) {
          const li = document.createElement('li');
          li.className = 'nav-item ms-2';
          li.innerHTML = `
            <div class="form-check form-switch mt-2" title="Activa el modo rápido para cargar más rápido, Ahorro de datos (más rápido), Menos efectos, más agilidad">
              <input class="form-check-input" type="checkbox" id="low-data-toggle" title="Activa el modo rápido para cargar más rápido, Ahorro de datos (más rápido), Menos efectos, más agilidad">
              <label class="form-check-label" for="low-data-toggle" style="font-size:0.95em; color: white;">
                ⚡ Modo rápido
              </label>
            </div>
          `;
          navUl.appendChild(li);
          // Estado inicial desde localStorage
          const lowData = localStorage.getItem('lowDataMode') === 'true';
          document.getElementById('low-data-toggle').checked = lowData;
          // Evento para guardar preferencia
          document.getElementById('low-data-toggle').addEventListener('change', function() {
            localStorage.setItem('lowDataMode', this.checked ? 'true' : 'false');
            location.reload();
          });
        }
        // Marca la página actual como activa
        const links = document.querySelectorAll('.navbar-nav .nav-link');
        links.forEach(link => {
          if (paginaActual.endsWith(link.getAttribute('href'))) {
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
          }
        });
      }
      // Footer
      if (data.footer) {
        const footer = document.querySelector('footer');
        if (footer) {
          footer.innerHTML = data.footer.texto || '';
        }
      }
    });
});

// Función para agregar calendario dinámicamente según el mes actual y el archivo de eventos correspondiente
async function renderCalendarSection(containerSelector) {
  const currentPage = paginaActual.replace('.html', '');
  const eventosPath = `eventos/${currentPage}.json`;
  try {
    const response = await fetch(eventosPath);
    if (!response.ok) return;
    const eventos = await response.json();
    const hoy = new Date();
    const data = {
      year: hoy.getFullYear(),
      month: hoy.getMonth(),
      eventos
    };
    const container = document.querySelector(containerSelector);
    if (container && templates['calendario']) {
      container.innerHTML += templates['calendario'](data);
    }
  } catch (e) {
    // No mostrar error si no hay calendario
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderCalendarSection('#calendario-test');
});

/* Agrega estilos para simetría */
const style = document.createElement('style');
style.innerHTML = `
  .cal-celda {
    vertical-align: middle !important;
    text-align: center;
    min-width: 90px;
    height: 70px;
  }
  .cal-table {
    width: 100%;
    table-layout: fixed;
  }
`;
document.head.appendChild(style);
