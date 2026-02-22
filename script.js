/* ── BOOT ── */
const BL = [
    '> HALO OS v2.0 — BOOTING...',
    '> LOADING FLIGHT CONTROLLER... OK',
    '> CALIBRATING IMU... OK',
    '> GPS LOCK — 14 SATELLITES',
    '> TELEMETRY LINK ESTABLISHED',
    '> DISASTER MGMT MISSION — LOADED',
    '> TEAM HALO — ALL SYSTEMS NOMINAL',
    '> INITIATING INTERFACE... ✓'
];
const bEl   = document.getElementById('boot-term');
const bFill = document.getElementById('boot-fill');
const bPct  = document.getElementById('boot-pct');
const bDiv  = document.getElementById('boot');
let bp = 0, bli = 0;

const blt = setInterval(() => {
    if (bli < BL.length) { bEl.innerHTML += BL[bli++] + '<br>'; bEl.scrollTop = 9999; }
}, 220);

const bbt = setInterval(() => {
    bp += 2;
    bFill.style.width = bp + '%';
    bPct.textContent  = bp + '%';
    if (bp >= 100) {
        clearInterval(bbt); clearInterval(blt);
        setTimeout(() => {
            bDiv.style.transition = 'opacity .5s';
            bDiv.style.opacity    = '0';
            setTimeout(() => { bDiv.style.display = 'none'; startSite(); }, 500);
        }, 300);
    }
}, 30);

/* ── CURSOR ── */
const curEl = document.getElementById('cur');
document.addEventListener('mousemove', e => {
    curEl.style.left = e.clientX + 'px';
    curEl.style.top  = e.clientY + 'px';
});

/* ── BG CANVAS ── */
const bgC   = document.getElementById('bg-canvas');
const bgCtx = bgC.getContext('2d');

function resizeBg() { bgC.width = window.innerWidth; bgC.height = window.innerHeight; }
resizeBg();
window.addEventListener('resize', resizeBg);

function drawBg(t) {
    const W = bgC.width, H = bgC.height;
    bgCtx.clearRect(0, 0, W, H);
    const sp = t * .0009;
    [[W*.1,H*.28],[W*.28,H*.21],[W*.52,H*.17],[W*.7,H*.27],[W*.91,H*.19]].forEach(([sx, sy], i) => {
        const a = .12 + Math.sin(sp + i * 1.3) * .1;
        bgCtx.fillStyle = `rgba(255,220,50,${a})`;
        bgCtx.save();
        bgCtx.translate(sx, sy);
        bgCtx.rotate(sp * 1.5 + i);
        const r2 = 3 + Math.sin(sp + i) * .5;
        bgCtx.beginPath();
        for (let p = 0; p < 8; p++) {
            const pr2  = p % 2 === 0 ? r2 : r2 * .4;
            const ang2 = (p * Math.PI / 4) - Math.PI / 2;
            p === 0
                ? bgCtx.moveTo(Math.cos(ang2) * pr2, Math.sin(ang2) * pr2)
                : bgCtx.lineTo(Math.cos(ang2) * pr2, Math.sin(ang2) * pr2);
        }
        bgCtx.closePath();
        bgCtx.fill();
        bgCtx.restore();
    });
}

/* ── SCORE ── */
let score = 0;
const ksEl = document.createElement('style');
ksEl.textContent = '@keyframes popupFloat{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-54px) scale(1.2)}}';
document.head.appendChild(ksEl);

function addScore(n, x, y) {
    score += n;
    document.getElementById('hud-score').textContent = 'SCORE: ' + score;
    const el = document.createElement('div');
    el.textContent = '+' + n;
    el.style.cssText = `position:fixed;left:${x}px;top:${y}px;font-family:'Press Start 2P',monospace;
        font-size:11px;color:#7a5000;text-shadow:0 0 8px rgba(255,180,0,.6);pointer-events:none;z-index:99995;
        animation:popupFloat .9s ease-out forwards;`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 900);
}

function spawnBurst(x, y) {
    const cols = ['#0a3a99','#ffcc00','#00c8e0','#00c853','#fff','#4db8ff'];
    for (let i = 0; i < 8; i++) {
        const a  = (i / 8) * Math.PI * 2;
        const d  = 26 + Math.random() * 44;
        const sz = 3  + Math.random() * 4;
        const p  = document.createElement('div');
        p.style.cssText = `position:fixed;width:${sz}px;height:${sz}px;background:${cols[i % cols.length]};
            left:${x}px;top:${y}px;pointer-events:none;z-index:99994;transform:translate(-50%,-50%);
            transition:left .55s ease-out,top .55s ease-out,opacity .55s;`;
        document.body.appendChild(p);
        requestAnimationFrame(() => {
            p.style.left    = (x + Math.cos(a) * d) + 'px';
            p.style.top     = (y + Math.sin(a) * d) + 'px';
            p.style.opacity = '0';
        });
        setTimeout(() => p.remove(), 600);
    }
}

document.addEventListener('click', e => {
    if (e.target.closest('#boot')) return;
    spawnBurst(e.clientX, e.clientY);
    addScore(5, e.clientX, e.clientY - 28);
});

/* ── SCROLL HANDLER ── */
let mx = 0, my = 0;

function onScroll() {
    const sy   = window.scrollY;
    const maxS = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const pctS = sy / maxS;
    document.getElementById('hud-fill').style.width    = (pctS * 100) + '%';
    document.getElementById('hud-mission').style.display = pctS > .05 ? 'block' : 'none';
    document.querySelectorAll('.pipe').forEach((d, i) => {
        d.style.transform = `translateY(${sy * [.18, .12][i]}px)`;
    });
    checkReveal();
}

function checkReveal() {
    document.querySelectorAll('.sr:not(.vis)').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 50) el.classList.add('vis');
    });
}

/* ── ANIMATION LOOP ── */
function loop(t) {
    drawBg(t);
    const drone = document.querySelector('.hero-drone-wrap');
    if (drone) drone.style.transform = `translateX(${mx * 8}px) translateY(${my * 6}px)`;
    requestAnimationFrame(loop);
}

/* ── INIT ── */
function startSite() {
    requestAnimationFrame(loop);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('mousemove', e => {
        mx = (e.clientX / window.innerWidth  - .5) * 2;
        my = (e.clientY / window.innerHeight - .5) * 2;
    });
    setTimeout(checkReveal, 100);
    document.querySelectorAll('.logo-card,.score-item,.contact-card').forEach(el => {
        el.addEventListener('mouseenter', () => {
            score += 2;
            document.getElementById('hud-score').textContent = 'SCORE: ' + score;
        });
    });
}

/* ── HAMBURGER ── */
document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('nav-links').classList.toggle('open');
});

/* ── KONAMI CODE ── */
const KONA = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let ki = 0;
document.addEventListener('keydown', e => {
    ki = e.key === KONA[ki] ? ki + 1 : 0;
    if (ki === KONA.length) {
        ki = 0;
        score += 9999;
        document.getElementById('hud-score').textContent = 'SCORE: ' + score;
        for (let i = 0; i < 24; i++)
            setTimeout(() => spawnBurst(Math.random() * window.innerWidth, Math.random() * window.innerHeight), i * 60);
        const k = document.createElement('div');
        k.style.cssText = `position:fixed;top:40%;left:50%;transform:translate(-50%,-50%);
            font-family:'Press Start 2P',monospace;font-size:13px;color:#ffcc00;
            text-shadow:0 0 20px #ffcc00;z-index:99999;text-align:center;line-height:2;pointer-events:none;`;
        k.innerHTML = '★ CHEAT CODE ACTIVATED ★<br><span style="font-size:9px;color:#0a3a99">+9999 SCORE · HALO MODE!</span>';
        document.body.appendChild(k);
        setTimeout(() => k.remove(), 3000);
    }
});