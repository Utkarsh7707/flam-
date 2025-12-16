
const settings = {
    step: 0.012,
    tangentStep: 0.11,
    tangentLength: 38,
    springK: 0.048,
    damping: 0.86,
    pointRadius: 6
};

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let w = 0;
let h = 0;

const mouse = {
    x: 0,
    y: 0,
    active: false
};

const pts = {
    a: { x: 0, y: 0 },
    d: { x: 0, y: 0 },
    b: { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 },
    c: { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 }
};

function resizeCanvas() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    initPoints();
}

function initPoints() {
    pts.a.x = w * 0.1;
    pts.a.y = h * 0.5;

    pts.d.x = w * 0.9;
    pts.d.y = h * 0.5;

    pts.b.x = w * 0.33;
    pts.b.y = h * 0.5;
    pts.b.vx = 0;
    pts.b.vy = 0;
    pts.b.tx = pts.b.x;
    pts.b.ty = pts.b.y;

    pts.c.x = w * 0.66;
    pts.c.y = h * 0.5;
    pts.c.vx = 0;
    pts.c.vy = 0;
    pts.c.tx = pts.c.x;
    pts.c.ty = pts.c.y;
}

window.addEventListener('resize', resizeCanvas);

window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
});

window.addEventListener('mouseleave', () => {
    mouse.active = false;
});

function bezierPoint(t, p0, p1, p2, p3) {
    const mt = 1 - t;
    const mt2 = mt * mt;
    const t2 = t * t;

    const x =
        mt2 * mt * p0.x +
        3 * mt2 * t * p1.x +
        3 * mt * t2 * p2.x +
        t2 * t * p3.x;

    const y =
        mt2 * mt * p0.y +
        3 * mt2 * t * p1.y +
        3 * mt * t2 * p2.y +
        t2 * t * p3.y;

    return { x, y };
}

function bezierTangent(t, p0, p1, p2, p3) {
    const mt = 1 - t;

    const dx =
        3 * mt * mt * (p1.x - p0.x) +
        6 * mt * t * (p2.x - p1.x) +
        3 * t * t * (p3.x - p2.x);

    const dy =
        3 * mt * mt * (p1.y - p0.y) +
        6 * mt * t * (p2.y - p1.y) +
        3 * t * t * (p3.y - p2.y);

    return { x: dx, y: dy };
}

function normalizeVec(x, y) {
    const len = Math.sqrt(x * x + y * y) || 1;
    return { x: x / len, y: y / len };
}

function springStep(p) {
    const ax = -settings.springK * (p.x - p.tx);
    const ay = -settings.springK * (p.y - p.ty);

    p.vx += ax;
    p.vy += ay;

    p.vx *= settings.damping;
    p.vy *= settings.damping;

    p.x += p.vx;
    p.y += p.vy;
}

function update() {
    if (mouse.active) {
        pts.b.tx = mouse.x - 100;
        pts.b.ty = mouse.y;
        pts.c.tx = mouse.x + 100;
        pts.c.ty = mouse.y;
    } else {
        pts.b.tx = w * 0.33;
        pts.b.ty = h * 0.5;
        pts.c.tx = w * 0.66;
        pts.c.ty = h * 0.5;
    }

    springStep(pts.b);
    springStep(pts.c);
}

function drawBezier() {
    ctx.beginPath();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.5;

    const start = bezierPoint(0, pts.a, pts.b, pts.c, pts.d);
    ctx.moveTo(start.x, start.y);

    for (let t = 0; t <= 1; t += settings.step) {
        const p = bezierPoint(t, pts.a, pts.b, pts.c, pts.d);
        ctx.lineTo(p.x, p.y);
    }

    ctx.lineTo(pts.d.x, pts.d.y);
    ctx.stroke();
}

function drawTangents() {
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.4;

    for (let t = 0; t <= 1; t += settings.tangentStep) {
        const p = bezierPoint(t, pts.a, pts.b, pts.c, pts.d);
        const d = bezierTangent(t, pts.a, pts.b, pts.c, pts.d);
        const n = normalizeVec(d.x, d.y);

        const hl = settings.tangentLength * 0.5;

        ctx.beginPath();
        ctx.moveTo(p.x - n.x * hl, p.y - n.y * hl);
        ctx.lineTo(p.x + n.x * hl, p.y + n.y * hl);
        ctx.stroke();
    }
}

function drawHandles() {
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(pts.a.x, pts.a.y);
    ctx.lineTo(pts.b.x, pts.b.y);
    ctx.lineTo(pts.c.x, pts.c.y);
    ctx.lineTo(pts.d.x, pts.d.y);
    ctx.stroke();

    ctx.setLineDash([]);

    const all = [pts.a, pts.b, pts.c, pts.d];

    all.forEach((p, i) => {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(p.x, p.y, settings.pointRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fca5a5';
        ctx.beginPath();
        ctx.arc(p.x, p.y, settings.pointRadius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1e293b';
        ctx.font = '11px system-ui, sans-serif';
        ctx.fillText('P' + i, p.x + 10, p.y - 10);
    });
}

function loop() {
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, w, h);

    update();
    drawHandles();
    drawBezier();
    drawTangents();

    requestAnimationFrame(loop);
}

resizeCanvas();
loop();

