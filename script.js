/**
 * Interactive Network / Constellation Mesh Effect
 * Similar to the subtle 3D poly-network seen in the Omdena reference
 */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Nav Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const mainNav = document.getElementById('mainNav');

  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      mainNav.classList.toggle('active');
    });
  }

  // Mobile Dropdown Click Handler
  const dropdowns = document.querySelectorAll('.has-dropdown');
  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    if (toggle) {
      toggle.addEventListener('click', (e) => {
        if (window.innerWidth <= 868) {
          e.preventDefault();
          dropdown.classList.toggle('open');
        }
      });
    }
  });

  // ==========================================
  // Handle Consultation Form Submission to Backend API
  // ==========================================
  const consultationForm = document.getElementById('consultationForm');
  if (consultationForm) {
    consultationForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = consultationForm.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';

      const formData = {
        clientType: document.getElementById('clientType')?.value || '',
        clientName: document.getElementById('clientName')?.value || '',
        clientContact: document.getElementById('clientContact')?.value || '',
        clientEmail: document.getElementById('clientEmail')?.value || '',
        problemDescription: document.getElementById('problemDescription')?.value || '',
        expectedOutcome: document.getElementById('expectedOutcome')?.value || ''
      };

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span>Mengirimkan Data...</span>';
        }

        const response = await fetch('/api/consultations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          alert('Terima kasih! Formulir konsultasi Anda berhasil terkirim ke database kami. Tim Solusin akan segera menghubungi Anda.');
          consultationForm.reset();
        } else {
          alert(result.message || 'Terjadi kesalahan saat mengirim formulir.');
        }
      } catch (error) {
        console.error('Submission error:', error);
        alert('Gagal terhubung ke server backend. Pastikan Anda membuka melalui http://localhost:3000');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      }
    });
  }

  // ==========================================
  // Background Interactive Network Canvas
  // ==========================================
  initCanvasEffect();
});

function initCanvasEffect() {
  const canvas = document.getElementById('network-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let nodes = [];
  let mouse = { x: null, y: null, radius: 160 };

  // Fixed nodes matching the polygonal constellation layout in reference screenshot
  // plus some subtle floating particles
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initNodes();
  }

  function initNodes() {
    nodes = [];
    
    // Create reference-like geometric polygon points in the hero right-side space
    const basePoints = [
      { rx: 0.28, ry: 0.35, vx: 0.05, vy: 0.03, size: 4 },
      { rx: 0.58, ry: 0.32, vx: -0.04, vy: 0.02, size: 5 },
      { rx: 0.81, ry: 0.51, vx: 0.03, vy: -0.04, size: 4 },
      { rx: 0.82, ry: 0.72, vx: -0.03, vy: 0.03, size: 4 },
      { rx: 0.60, ry: 0.85, vx: 0.04, vy: -0.03, size: 4 },
      { rx: 0.39, ry: 0.75, vx: -0.05, vy: -0.04, size: 4 },
      { rx: 0.59, ry: 0.46, vx: 0.02, vy: 0.05, size: 3.5 },
      { rx: 0.38, ry: 0.60, vx: 0.04, vy: -0.02, size: 3 }
    ];

    // Responsive scaling
    nodes = basePoints.map((pt) => ({
      x: pt.rx * width,
      y: pt.ry * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      origX: pt.rx * width,
      origY: pt.ry * height,
      size: pt.size
    }));

    // Add extra subtle connecting particles
    const extraCount = width < 768 ? 6 : 14;
    for (let i = 0; i < extraCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        origX: Math.random() * width,
        origY: Math.random() * height,
        size: 2.5
      });
    }
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Read colors from CSS custom properties for dynamic theming
    const computed = getComputedStyle(document.documentElement);
    const accent1 = computed.getPropertyValue('--color-accent-1').trim() || '#818cf8';

    // Update & draw nodes
    for (let i = 0; i < nodes.length; i++) {
      const p = nodes[i];

      // Subtle float animation
      p.x += p.vx;
      p.y += p.vy;

      // Bounce around original bounding radius
      if (Math.hypot(p.x - p.origX, p.y - p.origY) > 40) {
        p.vx *= -1;
        p.vy *= -1;
      }

      // Mouse subtle interaction
      if (mouse.x !== null) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.x -= (dx / dist) * force * 1.5;
          p.y -= (dy / dist) * force * 1.5;
        }
      }

      // Draw node dot with glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.shadowBlur = 10;
      ctx.shadowColor = accent1;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Connect nodes with dashed / subtle lines like in the reference
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]); // dashed constellation line

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.hypot(dx, dy);
        const maxDist = width < 768 ? 160 : 250;

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.35;
          ctx.strokeStyle = `rgba(168, 140, 255, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    ctx.setLineDash([]); // reset dash

    requestAnimationFrame(render);
  }

  // Mouse move listener
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', resize);

  resize();
  render();
}

