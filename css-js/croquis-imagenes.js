const lugares = document.querySelectorAll('.menu-lateral li');
const imagenPrincipal = document.getElementById('imagen-principal');

lugares.forEach(lugar => {
  lugar.addEventListener('click', () => {
    const nombreLugar = lugar.getAttribute('data-lugar');
    imagenPrincipal.src = nombreLugar + '.jpg';
  });
});