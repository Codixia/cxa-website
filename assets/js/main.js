const yearLabel = document.getElementById("year");
if (yearLabel) {
  yearLabel.textContent = new Date().getFullYear();
}

const canvas = document.getElementById("constellation");
const ctx = canvas.getContext("2d");
const particles = [];
let width;
let height;
let dpr;
let animationFrameId;
const maxDistance = 180;
const targetParticleCount = 92;
const pointer = { x: null, y: null };
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function resizeCanvas() {
  dpr = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}

function createParticle() {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6,
    radius: Math.random() * 2.4 + 0.6,
  };
}

function populateParticles() {
  particles.length = 0;
  const count = prefersReducedMotion.matches ? 40 : targetParticleCount;
  for (let i = 0; i < count; i += 1) {
    particles.push(createParticle());
  }
}

function updateParticles() {
  particles.forEach((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x > width || particle.x < 0) {
      particle.vx *= -1;
    }
    if (particle.y > height || particle.y < 0) {
      particle.vy *= -1;
    }
  });
}

function drawParticles() {
  ctx.clearRect(0, 0, width, height);

  particles.forEach((particle, index) => {
    ctx.beginPath();
    ctx.fillStyle = "rgba(180, 205, 255, 0.65)";
    ctx.shadowColor = "rgba(127, 85, 255, 0.35)";
    ctx.shadowBlur = 12;
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    for (let j = index + 1; j < particles.length; j += 1) {
      const neighbour = particles[j];
      const dx = particle.x - neighbour.x;
      const dy = particle.y - neighbour.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < maxDistance) {
        const opacity = 1 - distance / maxDistance;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(120, 175, 255, ${opacity * 0.55})`;
        ctx.lineWidth = 1;
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(neighbour.x, neighbour.y);
        ctx.stroke();
      }
    }

    if (pointer.x !== null && pointer.y !== null) {
      const dx = particle.x - pointer.x;
      const dy = particle.y - pointer.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < maxDistance) {
        const opacity = 1 - distance / maxDistance;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 77, 206, ${opacity * 0.35})`;
        ctx.lineWidth = 1;
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(pointer.x, pointer.y);
        ctx.stroke();
      }
    }
  });
}

function render() {
  updateParticles();
  drawParticles();
  animationFrameId = requestAnimationFrame(render);
}

function startAnimation() {
  if (prefersReducedMotion.matches) {
    ctx.clearRect(0, 0, width, height);
    return;
  }
  cancelAnimationFrame(animationFrameId);
  animationFrameId = requestAnimationFrame(render);
}

function handlePointerMove(event) {
  const touch = event.touches ? event.touches[0] : event;
  pointer.x = touch.clientX;
  pointer.y = touch.clientY;
}

function resetPointer() {
  pointer.x = null;
  pointer.y = null;
}

resizeCanvas();
populateParticles();
startAnimation();

window.addEventListener("resize", () => {
  resizeCanvas();
  populateParticles();
  startAnimation();
});

window.addEventListener("mousemove", handlePointerMove);
window.addEventListener("touchmove", handlePointerMove, { passive: true });
window.addEventListener("mouseleave", resetPointer);
window.addEventListener("touchend", resetPointer);

prefersReducedMotion.addEventListener("change", () => {
  populateParticles();
  startAnimation();
});
