// script.js
// Define la fecha objetivo (año, mes (0-11), día, hora, minuto, segundo)
const fechaObjetivo = new Date('2025-03-26T23:59:59');

function actualizarContador() {
  const ahora = new Date();
  const diferencia = fechaObjetivo - ahora;

  // Cálculos para días, horas, minutos y segundos
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
  const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

  // Actualiza el HTML
  document.getElementById('dias').textContent = String(dias).padStart(2, '0');
  document.getElementById('horas').textContent = String(horas).padStart(2, '0');
  document.getElementById('minutos').textContent = String(minutos).padStart(2, '0');
  document.getElementById('segundos').textContent = String(segundos).padStart(2, '0');

  // Si la cuenta regresiva termina
  if (diferencia < 0) {
    clearInterval(intervalo);
    document.getElementById('contador').innerHTML = "¡Tiempo terminado!";
  }
}

// Actualiza el contador cada segundo
const intervalo = setInterval(actualizarContador, 1000);

// Ejecuta la función una vez al cargar la página
actualizarContador();