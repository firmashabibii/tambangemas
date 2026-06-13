/**
 * components.js — Custom A-Frame Components
 * D4 TRPL · Politeknik WBI
 */

// ─────────────────────────────────────────────
// 1. spinner — memutar objek terus di sumbu X/Y/Z
// ─────────────────────────────────────────────
AFRAME.registerComponent("spinner", {
  schema: {
    speed: { type: "number", default: 1 },
    axis: { type: "string", default: "y" },
  },
  tick: function (time, dt) {
    const r = (this.data.speed * dt) / 1000;
    if (this.data.axis === "x") this.el.object3D.rotation.x += r;
    if (this.data.axis === "y") this.el.object3D.rotation.y += r;
    if (this.data.axis === "z") this.el.object3D.rotation.z += r;
  },
});

// ─────────────────────────────────────────────
// 2. hover-color — ganti warna saat di-hover
// ─────────────────────────────────────────────
AFRAME.registerComponent("hover-color", {
  schema: {
    hoverColor: { type: "color", default: "#FFD166" },
    originalColor: { type: "color", default: "#FFFFFF" },
  },
  init: function () {
    const el = this.el;
    const data = this.data;
    el.addEventListener("mouseenter", () =>
      el.setAttribute("color", data.hoverColor)
    );
    el.addEventListener("mouseleave", () =>
      el.setAttribute("color", data.originalColor)
    );
  },
});

// ─────────────────────────────────────────────
// 3. float — objek melayang naik-turun
// ─────────────────────────────────────────────
AFRAME.registerComponent("float", {
  schema: {
    amplitude: { type: "number", default: 0.2 },
    speed: { type: "number", default: 1 },
  },
  init: function () {
    this.baseY = this.el.object3D.position.y;
  },
  tick: function (time) {
    this.el.object3D.position.y =
      this.baseY + Math.sin(time * 0.001 * this.data.speed) * this.data.amplitude;
  },
});

// ─────────────────────────────────────────────
// 4. pulse — objek berdenyut (scale in-out)
// ─────────────────────────────────────────────
AFRAME.registerComponent("pulse", {
  schema: {
    speed: { type: "number", default: 1 },
    intensity: { type: "number", default: 1.2 },
  },
  init: function () {
    this.baseScale = this.el.object3D.scale.clone();
  },
  tick: function (time) {
    const s = 1 + (Math.sin(time * 0.002 * this.data.speed) * 0.5 + 0.5) * (this.data.intensity - 1);
    this.el.object3D.scale.set(
      this.baseScale.x * s,
      this.baseScale.y * s,
      this.baseScale.z * s
    );
  },
});

// ─────────────────────────────────────────────
// 5. look-at-camera — entitas selalu menghadap kamera
// ─────────────────────────────────────────────
AFRAME.registerComponent("look-at-camera", {
  init: function () {
    this.cam = document.querySelector("[camera]") || document.querySelector("a-camera");
    this.targetPos = new THREE.Vector3();
  },
  tick: function () {
    if (!this.cam) return;
    this.cam.object3D.getWorldPosition(this.targetPos);
    this.el.object3D.lookAt(this.targetPos);
  },
});

// ─────────────────────────────────────────────
// 6. toggle-visible — klik untuk toggle visibility elemen lain
// ─────────────────────────────────────────────
AFRAME.registerComponent("toggle-visible", {
  schema: {
    target: { type: "selector" },
  },
  init: function () {
    this.el.addEventListener("click", () => {
      if (!this.data.target) return;
      const v = this.data.target.getAttribute("visible");
      this.data.target.setAttribute("visible", !v);
    });
  },
});

// ─────────────────────────────────────────────
// 7. click-sound — putar audio saat diklik
// ─────────────────────────────────────────────
AFRAME.registerComponent("click-sound", {
  schema: {
    src: { type: "selector" },
  },
  init: function () {
    this.el.addEventListener("click", () => {
      if (this.data.src) {
        this.data.src.currentTime = 0;
        this.data.src.play().catch(() => { });
      }
    });
  },
});

// ─────────────────────────────────────────────
// 8. gold-particles — efek partikel emas saat objek diklik
// ─────────────────────────────────────────────
AFRAME.registerComponent("gold-particles", {
  init: function () {
    this.el.addEventListener("click", () => {
      const colors = ["#FFD700", "#DAA520", "#FFF8DC"];

      for (let i = 0; i < 20; i++) {
        const p = document.createElement("a-box");
        p.setAttribute("scale", "0.1 0.1 0.1");
        p.setAttribute("color", colors[Math.floor(Math.random() * colors.length)]);

        const x = (Math.random() - 0.5) * 4;
        const y = Math.random() * 3 + 1;
        const z = (Math.random() - 0.5) * 4;

        p.setAttribute("animation__pos", `property: position; to: ${x} ${y} ${z}; dur: 800; easing: easeOutCirc`);
        p.setAttribute("animation__scale", `property: scale; to: 0 0 0; dur: 800; easing: easeInQuad`);

        this.el.appendChild(p);
        setTimeout(() => p.remove(), 800);
      }
    });
  }
});

console.log(
  "[components.js] Loaded: spinner, hover-color, float, pulse, look-at-camera, toggle-visible, click-sound, gold-particles"
);

// ─────────────────────────────────────────────
// 9. Font lokal Override (Sesuai Request Lo)
// ─────────────────────────────────────────────
(function () {
  const LOCAL_FONT = "assets/fonts/Roboto-msdf.json";

  function applyLocalFont() {
    document.querySelectorAll("a-text, [text]").forEach((el) => {
      const f = el.getAttribute("font");
      if (!f || /cdn\.aframe\.io/.test(f) || f === "roboto") {
        el.setAttribute("text", "font", LOCAL_FONT);
        el.setAttribute("text", "fontImage", "assets/fonts/Roboto-msdf.png");
      }
    });
  }

  function initFont() {
    const scene = document.querySelector('a-scene');
    if (!scene) return;

    if (scene.hasLoaded) {
      applyLocalFont();
    } else {
      scene.addEventListener('loaded', applyLocalFont);
    }
  }

  // Triknya di sini: Pastikan HTML kelar dimuat dulu, baru jalankan initFont
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFont);
  } else {
    initFont();
  }
})();