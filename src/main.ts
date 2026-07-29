const app = document.getElementById('app');
if (!app) {
  throw new Error('#app root element missing from index.html');
}

const heading = document.createElement('h1');
heading.textContent = 'Dark Horizon — Cyberpunk Tactics (Vertical Slice v1)';
app.appendChild(heading);

const canvas = document.createElement('canvas');
canvas.id = 'game-canvas';
canvas.width = 960;
canvas.height = 640;
canvas.style.border = '1px solid #333';
app.appendChild(canvas);

const ctx = canvas.getContext('2d');
if (ctx) {
  ctx.fillStyle = '#0a0a12';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#00ffc8';
  ctx.font = '16px monospace';
  ctx.fillText('Booting...', 16, 32);
}
