const image = document.getElementById('zoomable-image');
const zoomInButton = document.getElementById('zoom-in');
const zoomOutButton = document.getElementById('zoom-out');
const goBackButton = document.getElementById('go-back');

let scale = 1;

zoomInButton.addEventListener('click', () => {
  scale += 0.1;
  image.style.transform = `scale(${scale})`;
});

zoomOutButton.addEventListener('click', () => {
  scale -= 0.1;
  image.style.transform = `scale(${scale})`;
});

goBackButton.addEventListener('click', () => {
  window.history.back();
});