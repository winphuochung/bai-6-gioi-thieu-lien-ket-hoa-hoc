/* ==========================================================================
   APP.JS - LOGIC HỌC LIỆU SỐ TƯƠNG TÁC KHTN 7
   Bài 6: Giới thiệu về liên kết hóa học
   ========================================================================== */

const STORAGE_KEYS = {
  STUDENT: 'khtn7_bai6_student',
  GAS_URL: 'khtn7_bai6_gas_url',
  PROGRESS: 'khtn7_bai6_progress'
};

// Mặc định URL Google Apps Script (Giáo viên có thể cập nhật trực tiếp tại đây hoặc trên giao diện)
const DEFAULT_GAS_WEB_APP_URL = '';

const state = {
  studentName: '',
  studentClass: '',
  xp: 0,
  completedMilestones: new Set(),
  highlightOuterOnly: false,
  currentSimMolecule: 'NaCl',
  isSimBonded: false,
  examStartTime: Date.now(),
  isExamSubmitted: false
};

/* ==========================================================================
   1. BỘ DỮ LIỆU MÔ HÌNH NGUYÊN TỬ SVG (BÁM SÁT HÌNH 6.1 -> 6.6 SGK)
   ========================================================================== */
function createAtomSVG(label, chargeText, shells, options = {}) {
  const {
    isIon = false,
    ionSign = '',
    highlightOuter = false,
    nucleusColor = '#DC2626',
    size = 195
  } = options;

  const radii = [36, 58, 80];
  let ringsSvg = '';
  let electronsSvg = '';

  shells.forEach((count, shellIdx) => {
    const r = radii[shellIdx] || 84;
    const isOuterShell = shellIdx === shells.length - 1;
    const dimInner = highlightOuter && !isOuterShell;
    const strokeColor = isOuterShell && highlightOuter ? '#F59E0B' : '#0284C7';
    const strokeWidth = isOuterShell && highlightOuter ? '2.6' : '1.6';
    const opacity = dimInner ? '0.28' : '1';

    ringsSvg += `<circle cx="100" cy="100" r="${r}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" opacity="${opacity}" />`;

    const spinClass = shellIdx % 2 === 0 ? 'orbit-spin' : 'orbit-spin-reverse';
    let shellDots = '';

    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count - Math.PI / 2;
      const ex = (100 + r * Math.cos(angle)).toFixed(1);
      const ey = (100 + r * Math.sin(angle)).toFixed(1);
      const dotColor = isOuterShell ? '#F59E0B' : '#0284C7';
      const dotStroke = isOuterShell ? '#78350F' : '#FFFFFF';
      const dotRadius = isOuterShell ? 6 : 5;

      shellDots += `<circle cx="${ex}" cy="${ey}" r="${dotRadius}" fill="${dotColor}" stroke="${dotStroke}" stroke-width="1.5" opacity="${opacity}" />`;
    }

    electronsSvg += `<g class="${spinClass}">${shellDots}</g>`;
  });

  const bracketSvg = isIon
    ? `
      <path d="M 18 20 L 10 20 L 10 180 L 18 180" fill="none" stroke="#0C4A6E" stroke-width="2.2" />
      <path d="M 182 20 L 190 20 L 190 180 L 182 180" fill="none" stroke="#0C4A6E" stroke-width="2.2" />
      <text x="193" y="26" font-size="15" font-weight="900" fill="#DC2626">${ionSign}</text>
    `
    : '';

  return `
    <svg viewBox="0 0 210 205" width="${size}" height="${size}" role="img" aria-label="Mô hình nguyên tử ${label}">
      ${bracketSvg}
      ${ringsSvg}
      ${electronsSvg}
      <circle cx="100" cy="100" r="18" fill="${nucleusColor}" stroke="#7F1D1D" stroke-width="2" />
      <text x="100" y="105" text-anchor="middle" fill="#FFFFFF" font-size="12" font-weight="800">${chargeText}</text>
    </svg>
  `;
}

function createCovalentBondedSVG(molType) {
  if (molType === 'H2') {
    return `
      <svg viewBox="0 0 320 190" width="300" height="180" role="img" aria-label="Mô hình phân tử H2 dùng chung 1 cặp electron">
        <circle cx="115" cy="95" r="56" fill="rgba(2, 132, 199, 0.06)" stroke="#0284C7" stroke-width="2" />
        <circle cx="205" cy="95" r="56" fill="rgba(2, 132, 199, 0.06)" stroke="#0284C7" stroke-width="2" />
        <rect x="144" y="65" width="32" height="60" rx="8" fill="rgba(245, 158, 11, 0.2)" stroke="#F59E0B" stroke-dasharray="4 2" stroke-width="2" />
        <circle cx="115" cy="95" r="16" fill="#DC2626" />
        <text x="115" y="100" text-anchor="middle" fill="#FFF" font-size="12" font-weight="800">+1</text>
        <circle cx="205" cy="95" r="16" fill="#DC2626" />
        <text x="205" y="100" text-anchor="middle" fill="#FFF" font-size="12" font-weight="800">+1</text>
        <!-- Cặp electron dùng chung -->
        <circle cx="160" cy="83" r="6.5" fill="#F59E0B" stroke="#78350F" stroke-width="1.5" />
        <circle cx="160" cy="107" r="6.5" fill="#0284C7" stroke="#0C4A6E" stroke-width="1.5" />
        <text x="160" y="25" text-anchor="middle" fill="#B45309" font-size="13" font-weight="800">1 cặp electron dùng chung (2e)</text>
        <text x="160" y="176" text-anchor="middle" fill="#0C4A6E" font-size="14" font-weight="800">Phân tử Hydrogen (H<tspan dy="4" font-size="10">2</tspan><tspan dy="-4">) - Đạt 2e giống He</tspan></text>
      </svg>
    `;
  }

  if (molType === 'O2') {
    return `
      <svg viewBox="0 0 360 210" width="335" height="195" role="img" aria-label="Mô hình phân tử O2 dùng chung 2 cặp electron">
        <!-- Lớp trong 2e và lớp ngoài giao nhau -->
        <circle cx="125" cy="105" r="34" fill="none" stroke="#94A3B8" stroke-width="1.5" />
        <circle cx="235" cy="105" r="34" fill="none" stroke="#94A3B8" stroke-width="1.5" />
        <circle cx="125" cy="105" r="68" fill="rgba(2, 132, 199, 0.05)" stroke="#0284C7" stroke-width="2.2" />
        <circle cx="235" cy="105" r="68" fill="rgba(2, 132, 199, 0.05)" stroke="#0284C7" stroke-width="2.2" />
        <rect x="162" y="64" width="36" height="82" rx="8" fill="rgba(245, 158, 11, 0.22)" stroke="#F59E0B" stroke-dasharray="4 2" stroke-width="2" />
        <!-- 2e lớp trong của mỗi O -->
        <circle cx="125" cy="71" r="4.5" fill="#64748B" />
        <circle cx="125" cy="139" r="4.5" fill="#64748B" />
        <circle cx="235" cy="71" r="4.5" fill="#64748B" />
        <circle cx="235" cy="139" r="4.5" fill="#64748B" />
        <!-- Hạt nhân +8 -->
        <circle cx="125" cy="105" r="17" fill="#DC2626" />
        <text x="125" y="110" text-anchor="middle" fill="#FFF" font-size="12" font-weight="800">+8</text>
        <circle cx="235" cy="105" r="17" fill="#DC2626" />
        <text x="235" y="110" text-anchor="middle" fill="#FFF" font-size="12" font-weight="800">+8</text>
        <!-- 2 cặp electron dùng chung (4e ở vùng giao) -->
        <circle cx="173" cy="84" r="6" fill="#F59E0B" stroke="#78350F" stroke-width="1.5" />
        <circle cx="187" cy="84" r="6" fill="#0284C7" stroke="#0C4A6E" stroke-width="1.5" />
        <circle cx="173" cy="126" r="6" fill="#F59E0B" stroke="#78350F" stroke-width="1.5" />
        <circle cx="187" cy="126" r="6" fill="#0284C7" stroke="#0C4A6E" stroke-width="1.5" />
        <!-- 4e riêng lớp ngoài của O trái -->
        <circle cx="125" cy="37" r="5.5" fill="#0284C7" />
        <circle cx="125" cy="173" r="5.5" fill="#0284C7" />
        <circle cx="60" cy="88" r="5.5" fill="#0284C7" />
        <circle cx="60" cy="122" r="5.5" fill="#0284C7" />
        <!-- 4e riêng lớp ngoài của O phải -->
        <circle cx="235" cy="37" r="5.5" fill="#0284C7" />
        <circle cx="235" cy="173" r="5.5" fill="#0284C7" />
        <circle cx="300" cy="88" r="5.5" fill="#0284C7" />
        <circle cx="300" cy="122" r="5.5" fill="#0284C7" />
        <text x="180" y="22" text-anchor="middle" fill="#B45309" font-size="13" font-weight="800">Hai cặp electron dùng chung (4e)</text>
        <text x="180" y="198" text-anchor="middle" fill="#0C4A6E" font-size="14" font-weight="800">Phân tử Oxygen (O<tspan dy="4" font-size="10">2</tspan><tspan dy="-4">) - Mỗi O đạt 8e giống Ne</tspan></text>
      </svg>
    `;
  }

  if (molType === 'Cl2') {
    const inner8Angles = [0, 45, 90, 135, 180, 225, 270, 315];
    const leftInner8 = inner8Angles.map((deg) => {
      const rad = (deg * Math.PI) / 180;
      return `<circle cx="${(125 + 45 * Math.cos(rad)).toFixed(1)}" cy="${(108 + 45 * Math.sin(rad)).toFixed(1)}" r="4" fill="#64748B" opacity="0.65" />`;
    }).join('');
    const rightInner8 = inner8Angles.map((deg) => {
      const rad = (deg * Math.PI) / 180;
      return `<circle cx="${(235 + 45 * Math.cos(rad)).toFixed(1)}" cy="${(108 + 45 * Math.sin(rad)).toFixed(1)}" r="4" fill="#64748B" opacity="0.65" />`;
    }).join('');

    return `
      <svg viewBox="0 0 360 220" width="340" height="205" role="img" aria-label="Mô hình phân tử Cl2 dùng chung 1 cặp electron">
        <!-- Lớp 1 (2e) và Lớp 2 (8e) của 2 nguyên tử Cl -->
        <circle cx="125" cy="108" r="25" fill="none" stroke="#CBD5E1" stroke-width="1.3" />
        <circle cx="125" cy="108" r="45" fill="none" stroke="#94A3B8" stroke-width="1.4" />
        <circle cx="235" cy="108" r="25" fill="none" stroke="#CBD5E1" stroke-width="1.3" />
        <circle cx="235" cy="108" r="45" fill="none" stroke="#94A3B8" stroke-width="1.4" />
        <!-- Lớp 3 ngoài cùng (r=68) giao nhau -->
        <circle cx="125" cy="108" r="68" fill="rgba(2, 132, 199, 0.05)" stroke="#0284C7" stroke-width="2.2" />
        <circle cx="235" cy="108" r="68" fill="rgba(2, 132, 199, 0.05)" stroke="#0284C7" stroke-width="2.2" />
        <!-- Khung đánh dấu 1 cặp electron dùng chung -->
        <rect x="162" y="80" width="36" height="56" rx="8" fill="rgba(245, 158, 11, 0.22)" stroke="#F59E0B" stroke-dasharray="4 2" stroke-width="2" />
        <!-- Electron lớp 1 (2e) & lớp 2 (8e) -->
        <circle cx="125" cy="83" r="3.8" fill="#64748B" opacity="0.65" />
        <circle cx="125" cy="133" r="3.8" fill="#64748B" opacity="0.65" />
        <circle cx="235" cy="83" r="3.8" fill="#64748B" opacity="0.65" />
        <circle cx="235" cy="133" r="3.8" fill="#64748B" opacity="0.65" />
        ${leftInner8}
        ${rightInner8}
        <!-- Hạt nhân +17 -->
        <circle cx="125" cy="108" r="16" fill="#DC2626" />
        <text x="125" y="113" text-anchor="middle" fill="#FFF" font-size="11" font-weight="800">+17</text>
        <circle cx="235" cy="108" r="16" fill="#DC2626" />
        <text x="235" y="113" text-anchor="middle" fill="#FFF" font-size="11" font-weight="800">+17</text>
        <!-- 1 cặp electron dùng chung (2e ở vùng giao) -->
        <circle cx="173" cy="108" r="6" fill="#F59E0B" stroke="#78350F" stroke-width="1.5" />
        <circle cx="187" cy="108" r="6" fill="#0284C7" stroke="#0C4A6E" stroke-width="1.5" />
        <!-- 6e riêng lớp ngoài của Cl trái (3 cặp) -->
        <circle cx="115" cy="41" r="5.5" fill="#0284C7" />
        <circle cx="135" cy="41" r="5.5" fill="#0284C7" />
        <circle cx="115" cy="175" r="5.5" fill="#0284C7" />
        <circle cx="135" cy="175" r="5.5" fill="#0284C7" />
        <circle cx="58" cy="98" r="5.5" fill="#0284C7" />
        <circle cx="58" cy="118" r="5.5" fill="#0284C7" />
        <!-- 6e riêng lớp ngoài của Cl phải (3 cặp) -->
        <circle cx="225" cy="41" r="5.5" fill="#0284C7" />
        <circle cx="245" cy="41" r="5.5" fill="#0284C7" />
        <circle cx="225" cy="175" r="5.5" fill="#0284C7" />
        <circle cx="245" cy="175" r="5.5" fill="#0284C7" />
        <circle cx="302" cy="98" r="5.5" fill="#0284C7" />
        <circle cx="302" cy="118" r="5.5" fill="#0284C7" />
        <text x="180" y="22" text-anchor="middle" fill="#B45309" font-size="13" font-weight="800">1 cặp electron dùng chung (2e)</text>
        <text x="180" y="206" text-anchor="middle" fill="#0C4A6E" font-size="13.5" font-weight="800">Phân tử Chlorine (Cl<tspan dy="4" font-size="10">2</tspan><tspan dy="-4">) - Mỗi Cl đạt 8e giống Ar</tspan></text>
      </svg>
    `;
  }

  if (molType === 'N2') {
    return `
      <svg viewBox="0 0 360 220" width="340" height="205" role="img" aria-label="Mô hình phân tử N2 dùng chung 3 cặp electron">
        <!-- Lớp trong 2e và lớp ngoài (r=68) giao nhau -->
        <circle cx="125" cy="108" r="34" fill="none" stroke="#94A3B8" stroke-width="1.5" />
        <circle cx="235" cy="108" r="34" fill="none" stroke="#94A3B8" stroke-width="1.5" />
        <circle cx="125" cy="108" r="68" fill="rgba(2, 132, 199, 0.05)" stroke="#0284C7" stroke-width="2.2" />
        <circle cx="235" cy="108" r="68" fill="rgba(2, 132, 199, 0.05)" stroke="#0284C7" stroke-width="2.2" />
        <rect x="161" y="62" width="38" height="92" rx="8" fill="rgba(245, 158, 11, 0.22)" stroke="#F59E0B" stroke-dasharray="4 2" stroke-width="2" />
        <!-- 2e lớp trong của mỗi N -->
        <circle cx="125" cy="74" r="4.5" fill="#64748B" />
        <circle cx="125" cy="142" r="4.5" fill="#64748B" />
        <circle cx="235" cy="74" r="4.5" fill="#64748B" />
        <circle cx="235" cy="142" r="4.5" fill="#64748B" />
        <!-- Hạt nhân +7 -->
        <circle cx="125" cy="108" r="17" fill="#DC2626" />
        <text x="125" y="113" text-anchor="middle" fill="#FFF" font-size="12" font-weight="800">+7</text>
        <circle cx="235" cy="108" r="17" fill="#DC2626" />
        <text x="235" y="113" text-anchor="middle" fill="#FFF" font-size="12" font-weight="800">+7</text>
        <!-- 3 cặp electron dùng chung (6e ở vùng giao) -->
        <circle cx="173" cy="80" r="5.8" fill="#F59E0B" stroke="#78350F" stroke-width="1.5" />
        <circle cx="187" cy="80" r="5.8" fill="#0284C7" stroke="#0C4A6E" stroke-width="1.5" />
        <circle cx="173" cy="108" r="5.8" fill="#F59E0B" stroke="#78350F" stroke-width="1.5" />
        <circle cx="187" cy="108" r="5.8" fill="#0284C7" stroke="#0C4A6E" stroke-width="1.5" />
        <circle cx="173" cy="136" r="5.8" fill="#F59E0B" stroke="#78350F" stroke-width="1.5" />
        <circle cx="187" cy="136" r="5.8" fill="#0284C7" stroke="#0C4A6E" stroke-width="1.5" />
        <!-- 2e riêng lớp ngoài của N trái -->
        <circle cx="58" cy="96" r="5.5" fill="#0284C7" />
        <circle cx="58" cy="120" r="5.5" fill="#0284C7" />
        <!-- 2e riêng lớp ngoài của N phải -->
        <circle cx="302" cy="96" r="5.5" fill="#0284C7" />
        <circle cx="302" cy="120" r="5.5" fill="#0284C7" />
        <text x="180" y="22" text-anchor="middle" fill="#B45309" font-size="13" font-weight="800">Ba cặp electron dùng chung (6e)</text>
        <text x="180" y="206" text-anchor="middle" fill="#0C4A6E" font-size="13.5" font-weight="800">Phân tử Nitrogen (N<tspan dy="4" font-size="10">2</tspan><tspan dy="-4">) - Mỗi N đạt 8e giống Ne</tspan></text>
      </svg>
    `;
  }

  if (molType === 'CO2') {
    return `
      <svg viewBox="0 0 460 225" width="420" height="205" role="img" aria-label="Mô hình phân tử CO2 với 2 vùng dùng chung electron">
        <!-- Lớp trong (r=30) của O trái, C giữa, O phải -->
        <circle cx="115" cy="110" r="30" fill="none" stroke="#94A3B8" stroke-width="1.4" />
        <circle cx="230" cy="110" r="30" fill="none" stroke="#94A3B8" stroke-width="1.4" />
        <circle cx="345" cy="110" r="30" fill="none" stroke="#94A3B8" stroke-width="1.4" />
        <!-- Lớp ngoài (r=64) giao nhau đôi một -->
        <circle cx="115" cy="110" r="64" fill="rgba(2, 132, 199, 0.05)" stroke="#0284C7" stroke-width="2.1" />
        <circle cx="230" cy="110" r="64" fill="rgba(245, 158, 11, 0.06)" stroke="#F59E0B" stroke-width="2.2" />
        <circle cx="345" cy="110" r="64" fill="rgba(2, 132, 199, 0.05)" stroke="#0284C7" stroke-width="2.1" />
        <!-- Khung vùng giao trái (2 cặp e) và phải (2 cặp e) -->
        <rect x="155" y="72" width="35" height="76" rx="7" fill="rgba(245, 158, 11, 0.2)" stroke="#F59E0B" stroke-dasharray="4 2" stroke-width="1.8" />
        <rect x="270" y="72" width="35" height="76" rx="7" fill="rgba(245, 158, 11, 0.2)" stroke="#F59E0B" stroke-dasharray="4 2" stroke-width="1.8" />
        <!-- 2e lớp trong của O trái, C giữa, O phải -->
        <circle cx="115" cy="80" r="4" fill="#64748B" />
        <circle cx="115" cy="140" r="4" fill="#64748B" />
        <circle cx="230" cy="80" r="4" fill="#64748B" />
        <circle cx="230" cy="140" r="4" fill="#64748B" />
        <circle cx="345" cy="80" r="4" fill="#64748B" />
        <circle cx="345" cy="140" r="4" fill="#64748B" />
        <!-- Hạt nhân O (+8), C (+6), O (+8) -->
        <circle cx="115" cy="110" r="16" fill="#DC2626" />
        <text x="115" y="115" text-anchor="middle" fill="#FFF" font-size="11.5" font-weight="800">+8</text>
        <circle cx="230" cy="110" r="16" fill="#B45309" />
        <text x="230" y="115" text-anchor="middle" fill="#FFF" font-size="11.5" font-weight="800">+6</text>
        <circle cx="345" cy="110" r="16" fill="#DC2626" />
        <text x="345" y="115" text-anchor="middle" fill="#FFF" font-size="11.5" font-weight="800">+8</text>
        <!-- 2 cặp e dùng chung giữa O trái và C -->
        <circle cx="166" cy="90" r="5.5" fill="#0284C7" stroke="#0C4A6E" stroke-width="1.4" />
        <circle cx="179" cy="90" r="5.5" fill="#F59E0B" stroke="#78350F" stroke-width="1.4" />
        <circle cx="166" cy="130" r="5.5" fill="#0284C7" stroke="#0C4A6E" stroke-width="1.4" />
        <circle cx="179" cy="130" r="5.5" fill="#F59E0B" stroke="#78350F" stroke-width="1.4" />
        <!-- 2 cặp e dùng chung giữa C và O phải -->
        <circle cx="281" cy="90" r="5.5" fill="#F59E0B" stroke="#78350F" stroke-width="1.4" />
        <circle cx="294" cy="90" r="5.5" fill="#0284C7" stroke="#0C4A6E" stroke-width="1.4" />
        <circle cx="281" cy="130" r="5.5" fill="#F59E0B" stroke="#78350F" stroke-width="1.4" />
        <circle cx="294" cy="130" r="5.5" fill="#0284C7" stroke="#0C4A6E" stroke-width="1.4" />
        <!-- 4e riêng lớp ngoài của O trái -->
        <circle cx="103" cy="47" r="5.2" fill="#0284C7" />
        <circle cx="123" cy="47" r="5.2" fill="#0284C7" />
        <circle cx="103" cy="173" r="5.2" fill="#0284C7" />
        <circle cx="123" cy="173" r="5.2" fill="#0284C7" />
        <!-- 4e riêng lớp ngoài của O phải -->
        <circle cx="337" cy="47" r="5.2" fill="#0284C7" />
        <circle cx="357" cy="47" r="5.2" fill="#0284C7" />
        <circle cx="337" cy="173" r="5.2" fill="#0284C7" />
        <circle cx="357" cy="173" r="5.2" fill="#0284C7" />
        <text x="230" y="22" text-anchor="middle" fill="#B45309" font-size="13" font-weight="800">Mỗi liên kết C=O có 2 cặp e dùng chung (Tổng 4 cặp e chung)</text>
        <text x="230" y="210" text-anchor="middle" fill="#0C4A6E" font-size="13.5" font-weight="800">Phân tử CO<tspan dy="4" font-size="10">2</tspan><tspan dy="-4">: C và hai nguyên tử O đều đạt 8e giống Ne</tspan></text>
      </svg>
    `;
  }

  if (molType === 'NH3') {
    return `
      <svg viewBox="0 0 400 250" width="360" height="225" role="img" aria-label="Mô hình phân tử NH3 với 3 cặp electron dùng chung">
        <!-- Nguyên tử N ở giữa (cx=200, cy=105, r1=30, r2=62) -->
        <circle cx="200" cy="105" r="30" fill="none" stroke="#94A3B8" stroke-width="1.4" />
        <circle cx="200" cy="105" r="62" fill="rgba(2, 132, 199, 0.06)" stroke="#0284C7" stroke-width="2.2" />
        <!-- 3 nguyên tử H (trái, phải, dưới) -->
        <circle cx="110" cy="110" r="38" fill="rgba(245, 158, 11, 0.08)" stroke="#F59E0B" stroke-width="2" />
        <circle cx="290" cy="110" r="38" fill="rgba(245, 158, 11, 0.08)" stroke="#F59E0B" stroke-width="2" />
        <circle cx="200" cy="190" r="38" fill="rgba(245, 158, 11, 0.08)" stroke="#F59E0B" stroke-width="2" />
        <!-- 2e lớp trong của N -->
        <circle cx="170" cy="105" r="4" fill="#64748B" />
        <circle cx="230" cy="105" r="4" fill="#64748B" />
        <!-- Hạt nhân N (+7) và 3 hạt nhân H (+1) -->
        <circle cx="200" cy="105" r="16" fill="#DC2626" />
        <text x="200" y="110" text-anchor="middle" fill="#FFF" font-size="11.5" font-weight="800">+7</text>
        <circle cx="110" cy="110" r="13" fill="#DC2626" />
        <text x="110" y="114" text-anchor="middle" fill="#FFF" font-size="10.5" font-weight="800">+1</text>
        <circle cx="290" cy="110" r="13" fill="#DC2626" />
        <text x="290" y="114" text-anchor="middle" fill="#FFF" font-size="10.5" font-weight="800">+1</text>
        <circle cx="200" cy="190" r="13" fill="#DC2626" />
        <text x="200" y="194" text-anchor="middle" fill="#FFF" font-size="10.5" font-weight="800">+1</text>
        <!-- Cặp e dùng chung 1 (N - H trái) -->
        <circle cx="143" cy="100" r="5.8" fill="#F59E0B" stroke="#78350F" stroke-width="1.4" />
        <circle cx="143" cy="116" r="5.8" fill="#0284C7" stroke="#0C4A6E" stroke-width="1.4" />
        <!-- Cặp e dùng chung 2 (N - H phải) -->
        <circle cx="257" cy="100" r="5.8" fill="#F59E0B" stroke="#78350F" stroke-width="1.4" />
        <circle cx="257" cy="116" r="5.8" fill="#0284C7" stroke="#0C4A6E" stroke-width="1.4" />
        <!-- Cặp e dùng chung 3 (N - H dưới) -->
        <circle cx="191" cy="160" r="5.8" fill="#F59E0B" stroke="#78350F" stroke-width="1.4" />
        <circle cx="209" cy="160" r="5.8" fill="#0284C7" stroke="#0C4A6E" stroke-width="1.4" />
        <!-- 1 cặp e riêng (2e) ở đỉnh trên của N -->
        <circle cx="190" cy="44" r="5.5" fill="#0284C7" />
        <circle cx="210" cy="44" r="5.5" fill="#0284C7" />
        <text x="200" y="20" text-anchor="middle" fill="#0C4A6E" font-size="13" font-weight="800">Phân tử Ammonia (NH<tspan dy="4" font-size="10">3</tspan><tspan dy="-4">): 3 cặp electron dùng chung</tspan></text>
        <text x="200" y="242" text-anchor="middle" fill="#B45309" font-size="13" font-weight="800">N đạt 8e (giống Ne) • Mỗi nguyên tử H đạt 2e (giống He)</text>
      </svg>
    `;
  }

  // H2O (Hình 6.6)
  return `
    <svg viewBox="0 0 380 220" width="350" height="205" role="img" aria-label="Mô hình phân tử nước H2O">
      <!-- O ở giữa, 2 nguyên tử H ở hai bên dưới -->
      <circle cx="190" cy="95" r="34" fill="none" stroke="#94A3B8" stroke-width="1.5" />
      <circle cx="190" cy="95" r="68" fill="rgba(2, 132, 199, 0.06)" stroke="#0284C7" stroke-width="2.2" />
      <!-- 2 nguyên tử H -->
      <circle cx="105" cy="145" r="42" fill="rgba(245, 158, 11, 0.08)" stroke="#F59E0B" stroke-width="2" />
      <circle cx="275" cy="145" r="42" fill="rgba(245, 158, 11, 0.08)" stroke="#F59E0B" stroke-width="2" />
      <!-- Hạt nhân O (+8) và 2 hạt nhân H (+1) -->
      <circle cx="190" cy="95" r="17" fill="#DC2626" />
      <text x="190" y="100" text-anchor="middle" fill="#FFF" font-size="12" font-weight="800">+8</text>
      <circle cx="105" cy="145" r="14" fill="#DC2626" />
      <text x="105" y="150" text-anchor="middle" fill="#FFF" font-size="11" font-weight="800">+1</text>
      <circle cx="275" cy="145" r="14" fill="#DC2626" />
      <text x="275" y="150" text-anchor="middle" fill="#FFF" font-size="11" font-weight="800">+1</text>
      <!-- Cặp e dùng chung trái (O - H) -->
      <circle cx="135" cy="118" r="6" fill="#F59E0B" stroke="#78350F" stroke-width="1.5" />
      <circle cx="145" cy="132" r="6" fill="#0284C7" stroke="#0C4A6E" stroke-width="1.5" />
      <!-- Cặp e dùng chung phải (O - H) -->
      <circle cx="245" cy="118" r="6" fill="#F59E0B" stroke="#78350F" stroke-width="1.5" />
      <circle cx="235" cy="132" r="6" fill="#0284C7" stroke="#0C4A6E" stroke-width="1.5" />
      <!-- 4e còn lại ở lớp ngoài của O -->
      <circle cx="176" cy="28" r="5.5" fill="#0284C7" />
      <circle cx="204" cy="28" r="5.5" fill="#0284C7" />
      <circle cx="178" cy="162" r="5.5" fill="#0284C7" />
      <circle cx="202" cy="162" r="5.5" fill="#0284C7" />
      <text x="190" y="18" text-anchor="middle" fill="#0C4A6E" font-size="13" font-weight="800">Phân tử Nước (H<tspan dy="4" font-size="10">2</tspan><tspan dy="-4">O): 2 cặp electron dùng chung</tspan></text>
      <text x="190" y="208" text-anchor="middle" fill="#B45309" font-size="13" font-weight="800">O đạt 8e (giống Ne) • Mỗi H đạt 2e (giống He)</text>
    </svg>
  `;
}

/* ==========================================================================
   2. DỮ LIỆU MÔ PHỎNG TƯƠNG TÁC (SECTION 3)
   ========================================================================== */
const SIMULATOR_DATA = {
  NaCl: {
    typeBadge: 'Liên kết Ion • Cho và Nhận Electron (Hình 6.2)',
    title: 'Hình 6.2: Sự hình thành liên kết ion trong phân tử muối ăn (NaCl)',
    actionLabel: '⚡ Chuyển 1 electron từ Na sang Cl',
    beforeDesc: `
      <strong>Trạng thái trước liên kết:</strong><br/>
      • Nguyên tử <strong>Sodium (Na, +11)</strong> có 3 lớp electron (2, 8, 1) &rarr; có <strong>1 electron</strong> ở lớp ngoài cùng (chưa bền).<br/>
      • Nguyên tử <strong>Chlorine (Cl, +17)</strong> có 3 lớp electron (2, 8, 7) &rarr; có <strong>7 electron</strong> ở lớp ngoài cùng (chưa bền).<br/>
      👉 <em>Hãy nhấn nút <strong>"Chuyển 1 electron từ Na sang Cl"</strong> để xem điều kỳ diệu xảy ra!</em>
    `,
    afterDesc: `
      <strong>✅ Đã hình thành Liên kết Ion trong phân tử NaCl:</strong><br/>
      • Nguyên tử <strong>Na</strong> nhường 1 electron ở lớp ngoài cùng cho nguyên tử Cl để tạo thành <strong>ion dương Na⁺</strong> (2, 8) có vỏ bền vững giống khí hiếm <strong>Ne</strong>.<br/>
      • Nguyên tử <strong>Cl</strong> nhận 1 electron của Na vào lớp ngoài cùng để tạo thành <strong>ion âm Cl⁻</strong> (2, 8, 8) có vỏ bền vững giống khí hiếm <strong>Ar</strong>.<br/>
      • Hai ion <strong>Na⁺</strong> và <strong>Cl⁻</strong> mang điện tích trái dấu hút nhau tạo thành liên kết ion trong phân tử muối ăn!
    `
  },
  MgO: {
    typeBadge: 'Liên kết Ion • Cho và Nhận 2 Electron (Hình 6.3)',
    title: 'Hình 6.3: Sự hình thành liên kết ion trong phân tử magnesium oxide (MgO)',
    actionLabel: '⚡ Chuyển 2 electron từ Mg sang O',
    beforeDesc: `
      <strong>Trạng thái trước liên kết:</strong><br/>
      • Nguyên tử <strong>Magnesium (Mg, +12)</strong> có 3 lớp electron (2, 8, 2) &rarr; có <strong>2 electron</strong> ở lớp ngoài cùng.<br/>
      • Nguyên tử <strong>Oxygen (O, +8)</strong> có 2 lớp electron (2, 6) &rarr; có <strong>6 electron</strong> ở lớp ngoài cùng.<br/>
      👉 <em>Hãy nhấn nút <strong>"Chuyển 2 electron từ Mg sang O"</strong> để tạo liên kết ion!</em>
    `,
    afterDesc: `
      <strong>✅ Đã hình thành Liên kết Ion trong phân tử MgO:</strong><br/>
      • Nguyên tử <strong>Mg</strong> đã <strong>nhường 2 electron</strong> ở lớp ngoài cùng cho nguyên tử O để tạo thành <strong>ion dương Mg²⁺</strong> (2, 8) có vỏ bền vững giống khí hiếm <strong>Ne</strong>.<br/>
      • Nguyên tử <strong>O</strong> nhận 2 electron từ Mg để tạo thành <strong>ion âm O²⁻</strong> (2, 8) cũng có vỏ bền vững giống khí hiếm <strong>Ne</strong>.<br/>
      • Hai ion trái dấu <strong>Mg²⁺</strong> và <strong>O²⁻</strong> hút nhau tạo nên phân tử <strong>MgO</strong>!
    `
  },
  H2: {
    typeBadge: 'Liên kết Cộng hóa trị trong đơn chất (Hình 6.4)',
    title: 'Hình 6.4: Sự hình thành liên kết cộng hóa trị trong phân tử Hydrogen (H₂)',
    actionLabel: '🤝 Góp chung 1 cặp electron giữa 2 nguyên tử H',
    beforeDesc: `
      <strong>Trạng thái trước liên kết:</strong><br/>
      • Mỗi nguyên tử <strong>Hydrogen (H, +1)</strong> chỉ có <strong>1 electron</strong> ở lớp ngoài cùng, chưa đạt cấu trúc bền vững (2e) của khí hiếm Helium (He).<br/>
      👉 <em>Nhấn nút <strong>"Góp chung 1 cặp electron"</strong> để hai nguyên tử H liên kết với nhau!</em>
    `,
    afterDesc: `
      <strong>✅ Đã hình thành Liên kết Cộng hóa trị trong phân tử H₂:</strong><br/>
      • Mỗi nguyên tử <strong>H</strong> góp chung <strong>1 electron</strong> tạo thành <strong>một cặp electron dùng chung</strong>.<br/>
      • Nhờ cặp electron dùng chung này, mỗi nguyên tử H trong phân tử H₂ đều có <strong>2 electron</strong> ở lớp vỏ, đạt cấu trúc bền vững của khí hiếm <strong>He</strong>!
    `
  },
  O2: {
    typeBadge: 'Liên kết Cộng hóa trị trong đơn chất (Hình 6.5)',
    title: 'Hình 6.5: Sự hình thành liên kết cộng hóa trị trong phân tử Oxygen (O₂)',
    actionLabel: '🤝 Góp chung 2 cặp electron giữa 2 nguyên tử O',
    beforeDesc: `
      <strong>Trạng thái trước liên kết:</strong><br/>
      • Mỗi nguyên tử <strong>Oxygen (O, +8)</strong> có <strong>6 electron</strong> ở lớp ngoài cùng (thiếu 2 electron để đạt 8e như khí hiếm Ne).<br/>
      👉 <em>Nhấn nút <strong>"Góp chung 2 cặp electron"</strong> để xem sự hình thành phân tử O₂!</em>
    `,
    afterDesc: `
      <strong>✅ Đã hình thành Liên kết Cộng hóa trị trong phân tử O₂:</strong><br/>
      • Hai nguyên tử <strong>O</strong> liên kết với nhau bằng cách mỗi nguyên tử O góp chung <strong>2 electron</strong> tạo thành <strong>hai cặp electron dùng chung</strong>.<br/>
      • Sau khi liên kết, mỗi nguyên tử O đều có <strong>8 electron</strong> ở lớp ngoài cùng, bền vững giống khí hiếm <strong>Ne</strong>!
    `
  },
  H2O: {
    typeBadge: 'Liên kết Cộng hóa trị trong hợp chất (Hình 6.6)',
    title: 'Hình 6.6: Sự hình thành liên kết cộng hóa trị trong phân tử Nước (H₂O)',
    actionLabel: '🤝 Góp chung electron giữa 1 nguyên tử O và 2 nguyên tử H',
    beforeDesc: `
      <strong>Trạng thái trước liên kết:</strong><br/>
      • Nguyên tử <strong>O (+8)</strong> có 6 electron lớp ngoài cùng (cần thêm 2e để đạt 8e).<br/>
      • Hai nguyên tử <strong>H (+1)</strong> mỗi nguyên tử có 1 electron lớp ngoài cùng (cần thêm 1e để đạt 2e).<br/>
      👉 <em>Nhấn nút <strong>"Góp chung electron"</strong> để tạo phân tử nước H₂O!</em>
    `,
    afterDesc: `
      <strong>✅ Đã hình thành Liên kết Cộng hóa trị trong phân tử Nước (H₂O):</strong><br/>
      • Nguyên tử <strong>O</strong> góp chung với mỗi nguyên tử <strong>H</strong> một electron tạo thành <strong>2 cặp electron dùng chung</strong> (mỗi liên kết O–H có 1 cặp electron dùng chung).<br/>
      • Sau liên kết: Lớp vỏ của nguyên tử <strong>O</strong> có <strong>8 electron</strong> giống khí hiếm <strong>Neon (Ne)</strong>; lớp vỏ của mỗi nguyên tử <strong>H</strong> có <strong>2 electron</strong> giống khí hiếm <strong>Helium (He)</strong>!
    `
  }
};

const EXTENDED_MOLECULES = {
  Cl2: {
    title: 'Sự hình thành liên kết cộng hóa trị trong phân tử Khí Chlorine (Cl₂)',
    sharedBadge: '1 cặp electron dùng chung (2e)',
    formulaBadge: 'Công thức cấu tạo: Cl – Cl',
    nobleBadge: 'Đạt vỏ 8e giống khí hiếm Argon (Ar)',
    arrowLabel: 'Góp chung 1 cặp e',
    content: `
      • <strong>Trước khi liên kết:</strong> Mỗi nguyên tử <strong>Chlorine (Cl, +17)</strong> có 3 lớp electron (2, 8, 7) với <strong>7 electron</strong> ở lớp ngoài cùng (thiếu 1e để đạt 8e giống khí hiếm <strong>Ar</strong>).<br/>
      • <strong>Quá trình hình thành liên kết:</strong> Hai nguyên tử Cl liên kết với nhau bằng cách mỗi nguyên tử Cl <strong>góp chung 1 electron</strong> tạo thành <strong>1 cặp electron dùng chung</strong>.<br/>
      • <strong>Sau khi liên kết:</strong> Trong phân tử <strong>Cl₂</strong>, mỗi nguyên tử Cl đều có <strong>8 electron</strong> ở lớp ngoài cùng (6e riêng + 2e dùng chung), bền vững giống khí hiếm <strong>Argon (Ar)</strong>.
    `
  },
  N2: {
    title: 'Sự hình thành liên kết cộng hóa trị trong phân tử Khí Nitrogen (N₂)',
    sharedBadge: '3 cặp electron dùng chung (6e)',
    formulaBadge: 'Công thức cấu tạo: N ≡ N',
    nobleBadge: 'Đạt vỏ 8e giống khí hiếm Neon (Ne)',
    arrowLabel: 'Góp chung 3 cặp e',
    content: `
      • <strong>Trước khi liên kết:</strong> Mỗi nguyên tử <strong>Nitrogen (N, +7)</strong> có 2 lớp electron (2, 5) với <strong>5 electron</strong> ở lớp ngoài cùng (thiếu 3e để đạt 8e giống khí hiếm <strong>Ne</strong>).<br/>
      • <strong>Quá trình hình thành liên kết:</strong> Hai nguyên tử N liên kết với nhau bằng cách mỗi nguyên tử N <strong>góp chung 3 electron</strong> tạo thành <strong>3 cặp electron dùng chung</strong> (6e ở vùng giao nhau).<br/>
      • <strong>Sau khi liên kết:</strong> Trong phân tử <strong>N₂</strong>, mỗi nguyên tử N đều có <strong>8 electron</strong> ở lớp ngoài cùng (2e riêng + 6e dùng chung), bền vững giống khí hiếm <strong>Neon (Ne)</strong>.
    `
  },
  CO2: {
    title: 'Sự hình thành liên kết cộng hóa trị trong phân tử Carbon dioxide (CO₂)',
    sharedBadge: '4 cặp electron dùng chung (2 cặp mỗi liên kết C=O)',
    formulaBadge: 'Công thức cấu tạo: O = C = O',
    nobleBadge: 'C và hai O đều đạt vỏ 8e giống Neon (Ne)',
    arrowLabel: 'C góp 2e với mỗi O',
    content: `
      • <strong>Trước khi liên kết:</strong> Nguyên tử <strong>Carbon (C, +6)</strong> có <strong>4 electron</strong> lớp ngoài cùng (2, 4); mỗi nguyên tử <strong>Oxygen (O, +8)</strong> có <strong>6 electron</strong> lớp ngoài cùng (2, 6).<br/>
      • <strong>Quá trình hình thành liên kết:</strong> Nguyên tử C ở giữa góp chung <strong>2 electron với mỗi nguyên tử O</strong> (mỗi nguyên tử O cũng góp 2e với C), tạo thành <strong>2 cặp electron dùng chung ở mỗi bên</strong> (tổng cộng 4 cặp e dùng chung).<br/>
      • <strong>Sau khi liên kết:</strong> Trong phân tử <strong>CO₂</strong>, cả nguyên tử C và hai nguyên tử O đều đạt lớp vỏ <strong>8 electron</strong> bền vững giống khí hiếm <strong>Neon (Ne)</strong>.
    `
  },
  NH3: {
    title: 'Sự hình thành liên kết cộng hóa trị trong phân tử Ammonia (NH₃)',
    sharedBadge: '3 cặp electron dùng chung (mỗi liên kết N–H 1 cặp)',
    formulaBadge: 'Công thức cấu tạo: H – N(H) – H',
    nobleBadge: 'N đạt 8e (giống Ne) • Mỗi H đạt 2e (giống He)',
    arrowLabel: 'N góp 1e với mỗi H',
    content: `
      • <strong>Trước khi liên kết:</strong> Nguyên tử <strong>Nitrogen (N, +7)</strong> có <strong>5 electron</strong> lớp ngoài cùng (2, 5); mỗi nguyên tử <strong>Hydrogen (H, +1)</strong> có <strong>1 electron</strong> lớp ngoài cùng.<br/>
      • <strong>Quá trình hình thành liên kết:</strong> Một nguyên tử N liên kết với 3 nguyên tử H bằng cách nguyên tử N <strong>góp chung 1 electron với mỗi nguyên tử H</strong> tạo thành <strong>3 cặp electron dùng chung</strong> (còn 1 cặp e riêng trên N).<br/>
      • <strong>Sau khi liên kết:</strong> Trong phân tử <strong>NH₃</strong>, nguyên tử N đạt <strong>8 electron</strong> lớp ngoài cùng (giống <strong>Ne</strong>), còn mỗi nguyên tử H đạt <strong>2 electron</strong> (giống <strong>He</strong>).
    `
  }
};

/* ==========================================================================
   3. DỮ LIỆU 3 HOẠT ĐỘNG TƯƠNG TÁC THỰC HÀNH (SECTION 4)
   ========================================================================== */
const PRACTICE_ACT1 = [
  {
    id: 'a1_1',
    prompt: 'Khi tạo thành phân tử muối ăn (NaCl), nguyên tử Na (có 1e lớp ngoài cùng) sẽ làm gì?',
    options: ['Nhường 1 electron', 'Nhận 1 electron', 'Góp chung 1 electron'],
    correct: 'Nhường 1 electron',
    hint: 'Na là kim loại có 1e lớp ngoài cùng (2,8,1), nhường 1e sẽ đạt ngay lớp vỏ 8e của Ne!'
  },
  {
    id: 'a1_2',
    prompt: 'Khi tạo phân tử magnesium oxide (MgO), nguyên tử Mg (có 2e lớp ngoài cùng) sẽ làm gì?',
    options: ['Nhường 2 electron', 'Nhận 2 electron', 'Dùng chung 2 cặp e'],
    correct: 'Nhường 2 electron',
    hint: 'Quan sát Hình 6.3 SGK: Mg (2,8,2) nhường 2e cho O để tạo ion dương Mg²⁺.'
  },
  {
    id: 'a1_3',
    prompt: 'Khi tạo phân tử oxygen (O₂), mỗi nguyên tử O (có 6e lớp ngoài cùng) sẽ làm gì?',
    options: ['Nhường 2 electron', 'Góp chung 2 electron', 'Góp chung 1 electron'],
    correct: 'Góp chung 2 electron',
    hint: 'Quan sát Hình 6.5 SGK: Mỗi nguyên tử O góp chung 2e tạo thành hai cặp electron dùng chung.'
  },
  {
    id: 'a1_4',
    prompt: 'Khi tạo phân tử nước (H₂O), nguyên tử O đã liên kết với 2 nguyên tử H như thế nào?',
    options: ['O nhường 2e cho 2 nguyên tử H', 'O góp chung với mỗi H 1 electron', 'O nhận 2e từ 2 nguyên tử H'],
    correct: 'O góp chung với mỗi H 1 electron',
    hint: 'Quan sát Hình 6.6 SGK: Nguyên tử O góp chung với mỗi nguyên tử H 1 electron tạo cặp e dùng chung.'
  }
];

const PRACTICE_ACT2 = [
  {
    id: 'a2_1',
    text: 'Là chất rắn ở điều kiện thường, khó bay hơi, khó nóng chảy, tan trong nước tạo dung dịch dẫn điện.',
    correct: 'Hợp chất Ion',
    hint: 'Đây là tính chất đặc trưng của các hợp chất ion như muối ăn (NaCl).'
  },
  {
    id: 'a2_2',
    text: 'Thường có nhiệt độ nóng chảy và nhiệt độ sôi thấp (dễ nóng chảy, dễ bay hơi).',
    correct: 'Chất Cộng hóa trị',
    hint: 'Các chất cộng hóa trị (như nước, đường ăn, CO₂) thường có nhiệt độ nóng chảy và nhiệt độ sôi thấp.'
  },
  {
    id: 'a2_3',
    text: 'Nhóm các chất: Muối ăn (NaCl), Magnesium oxide (MgO).',
    correct: 'Hợp chất Ion',
    hint: 'NaCl và MgO được tạo nên từ lực hút giữa các ion trái dấu (Na⁺Cl⁻, Mg²⁺O²⁻).'
  },
  {
    id: 'a2_4',
    text: 'Nhóm các chất: Nước (H₂O), đường ăn, khí oxygen (O₂), carbon dioxide (CO₂), ammonia (NH₃).',
    correct: 'Chất Cộng hóa trị',
    hint: 'Các chất này chỉ chứa liên kết cộng hóa trị (dùng chung cặp electron).'
  }
];

const PRACTICE_ACT3 = [
  {
    id: 'a3_1',
    text: 'Ion dương Na⁺ (trong phân tử NaCl) và Mg²⁺ (trong phân tử MgO) có lớp vỏ giống khí hiếm nào?',
    correct: 'Ne (Neon)',
    hint: 'Na (11e) nhường 1e còn 10e; Mg (12e) nhường 2e còn 10e (2, 8) giống hệt khí hiếm Ne (+10)!'
  },
  {
    id: 'a3_2',
    text: 'Ion âm Cl⁻ (trong phân tử NaCl) có lớp vỏ 18 electron (2, 8, 8) giống khí hiếm nào?',
    correct: 'Ar (Argon)',
    hint: 'Cl (17e) nhận thêm 1e thành Cl⁻ có 18e (2, 8, 8) giống khí hiếm Argon (+18).'
  },
  {
    id: 'a3_3',
    text: 'Mỗi nguyên tử Hydrogen (H) trong phân tử H₂ và H₂O sau khi góp chung electron có vỏ giống khí hiếm nào?',
    correct: 'He (Helium)',
    hint: 'Sau khi dùng chung 1 cặp electron (2e), nguyên tử H có 2e ở lớp vỏ giống khí hiếm Helium (+2).'
  },
  {
    id: 'a3_4',
    text: 'Nguyên tử Oxygen (O) trong phân tử H₂O và O₂ sau khi dùng chung electron có vỏ giống khí hiếm nào?',
    correct: 'Ne (Neon)',
    hint: 'O có 2 lớp electron (2, 8) sau khi dùng chung electron, giống hệt vỏ nguyên tử khí hiếm Neon (+10).'
  }
];

/* ==========================================================================
   4. NGÂN HÀNG ĐỀ KIỂM TRA 45 CÂU - THANG ĐIỂM 100
      - Phần I: 10 câu Nhiều lựa chọn (2đ/câu = 20đ)
      - Phần II: 10 câu Đúng/Sai (2đ/câu = 20đ)
      - Phần III: 10 câu Ghép cột (2đ/câu = 20đ)
      - Phần IV: 10 câu Trả lời ngắn (2đ/câu = 20đ)
      - Phần V: 5 câu Tự luận (4đ/câu = 20đ)
   ========================================================================== */

// PHẦN I: TRẮC NGHIỆM NHIỀU LỰA CHỌN (10 câu × 2đ = 20đ)
const EXAM_MCQ = [
  {
    id: 'mcq1',
    q: 'Câu 1: Ở điều kiện thường, nguyên tử của các nguyên tố nào sau đây tồn tại dưới dạng đơn nguyên tử bền vững?',
    options: [
      'A. Các nguyên tố kim loại (Na, Mg).',
      'B. Các nguyên tố khí hiếm (He, Ne, Ar).',
      'C. Các nguyên tố phi kim (H, O, Cl).',
      'D. Tất cả các nguyên tố trong bảng tuần hoàn.'
    ],
    ans: 1,
    exp: 'Theo SGK tr.34: Ở điều kiện thường, chỉ có các khí hiếm (He, Ne, Ar,...) tồn tại dưới dạng đơn nguyên tử bền vững.'
  },
  {
    id: 'mcq2',
    q: 'Câu 2: Lớp electron ngoài cùng của nguyên tử khí hiếm Neon (Ne) và Argon (Ar) chứa bao nhiêu electron?',
    options: ['A. 2 electron.', 'B. 6 electron.', 'C. 8 electron.', 'D. 10 electron.'],
    ans: 2,
    exp: 'Lớp electron ngoài cùng của các khí hiếm chứa 8 electron (trừ He chứa 2 electron).'
  },
  {
    id: 'mcq3',
    q: 'Câu 3: Vì sao khí Helium (He) được sử dụng để bơm vào khinh khí cầu thay thế cho khí Hydrogen (H₂)?',
    options: [
      'A. Vì Helium nặng hơn không khí.',
      'B. Vì Helium trơ, rất khó cháy hay nổ, còn Hydrogen dễ gây cháy nổ.',
      'C. Vì Helium có 8 electron ở lớp ngoài cùng.',
      'D. Vì Helium là hợp chất cộng hóa trị.'
    ],
    ans: 1,
    exp: 'Theo mục Em có biết (SGK tr.34): Helium trơ, rất khó cháy hay nổ nên an toàn hơn Hydrogen.'
  },
  {
    id: 'mcq4',
    q: 'Câu 4: Khi nguyên tử trung hòa về điện nhường hoặc nhận electron, nó trở thành phần tử mang điện gọi là gì?',
    options: ['A. Phân tử.', 'B. Hạt nhân.', 'C. Ion.', 'D. Khí hiếm.'],
    ans: 2,
    exp: 'Theo SGK tr.35: Khi nguyên tử nhường hay nhận electron, nó trở thành phần tử mang điện gọi là ion.'
  },
  {
    id: 'mcq5',
    q: 'Câu 5: Khi hình thành liên kết ion trong phân tử muối ăn (NaCl), sự di chuyển electron diễn ra như thế nào?',
    options: [
      'A. Nguyên tử Cl nhường 1 electron cho nguyên tử Na.',
      'B. Nguyên tử Na nhường 1 electron ở lớp ngoài cùng cho nguyên tử Cl.',
      'C. Nguyên tử Na và Cl góp chung 1 cặp electron.',
      'D. Nguyên tử Na nhường 2 electron cho nguyên tử Cl.'
    ],
    ans: 1,
    exp: 'Theo Hình 6.2 SGK: Nguyên tử Na nhường 1 electron lớp ngoài cùng cho nguyên tử Cl tạo Na⁺ và Cl⁻.'
  },
  {
    id: 'mcq6',
    q: 'Câu 6: Trong sự hình thành phân tử magnesium oxide (MgO), nguyên tử Mg đã nhường bao nhiêu electron cho nguyên tử O?',
    options: ['A. Nhường 1 electron.', 'B. Nhường 2 electron.', 'C. Nhận 2 electron.', 'D. Góp chung 2 electron.'],
    ans: 1,
    exp: 'Theo Hình 6.3 SGK: Nguyên tử Mg (2,8,2) nhường 2 electron lớp ngoài cùng cho nguyên tử O tạo ion Mg²⁺ và O²⁻.'
  },
  {
    id: 'mcq7',
    q: 'Câu 7: Liên kết cộng hóa trị là liên kết được hình thành theo nguyên tắc nào?',
    options: [
      'A. Lực hút tĩnh điện giữa các ion mang điện tích trái dấu.',
      'B. Được tạo nên giữa hai nguyên tử bằng một hay nhiều cặp electron dùng chung.',
      'C. Nguyên tử kim loại nhường electron cho nguyên tử phi kim.',
      'D. Các nguyên tử khí hiếm tự kết hợp với nhau.'
    ],
    ans: 1,
    exp: 'Theo SGK tr.36: Liên kết cộng hóa trị là liên kết được tạo nên giữa hai nguyên tử bằng một hay nhiều cặp electron dùng chung.'
  },
  {
    id: 'mcq8',
    q: 'Câu 8: Trong phân tử oxygen (O₂), giữa hai nguyên tử oxygen có bao nhiêu cặp electron dùng chung?',
    options: ['A. 1 cặp electron dùng chung.', 'B. 2 cặp electron dùng chung.', 'C. 3 cặp electron dùng chung.', 'D. 4 cặp electron dùng chung.'],
    ans: 1,
    exp: 'Theo Hình 6.5 SGK: Mỗi nguyên tử O góp chung 2 electron tạo thành hai cặp electron dùng chung.'
  },
  {
    id: 'mcq9',
    q: 'Câu 9: Dãy các chất nào sau đây đều là chất cộng hóa trị (chỉ chứa liên kết cộng hóa trị)?',
    options: [
      'A. NaCl, MgO, H₂O.',
      'B. H₂, O₂, H₂O, CO₂, NH₃, đường ăn.',
      'C. NaCl, H₂, O₂, MgO.',
      'D. MgO, CO₂, muối ăn.'
    ],
    ans: 1,
    exp: 'Theo SGK tr.37: H₂, O₂, H₂O, NH₃, CO₂, đường ăn đều là các chất cộng hóa trị.'
  },
  {
    id: 'mcq10',
    q: 'Câu 10: Tính chất nào sau đây là của hợp chất ion (như muối ăn NaCl)?',
    options: [
      'A. Là chất khí ở điều kiện thường, dễ bay hơi.',
      'B. Có nhiệt độ nóng chảy và nhiệt độ sôi rất thấp.',
      'C. Là chất rắn ở điều kiện thường, khó bay hơi, khó nóng chảy, tan trong nước tạo dung dịch dẫn được điện.',
      'D. Không tan trong nước và dễ nóng chảy như nước đá.'
    ],
    ans: 2,
    exp: 'Theo SGK tr.35: Hợp chất ion là chất rắn ở điều kiện thường, khó bay hơi, khó nóng chảy và khi tan trong nước tạo dung dịch dẫn điện.'
  }
];

// PHẦN II: TRẮC NGHIỆM ĐÚNG / SAI (10 câu × 2đ = 20đ)
const EXAM_TF = [
  {
    id: 'tf1',
    q: 'Câu 1: Nguyên tử khí hiếm Helium (He) có 8 electron ở lớp ngoài cùng.',
    ans: false,
    exp: 'Sai. Nguyên tử Helium (He) chỉ có 1 lớp electron với 2 electron ở lớp ngoài cùng.'
  },
  {
    id: 'tf2',
    q: 'Câu 2: Nguyên tử của các nguyên tố khác có xu hướng tham gia liên kết hóa học để đạt được lớp electron ngoài cùng giống khí hiếm bằng cách nhường, nhận hay dùng chung các electron.',
    ans: true,
    exp: 'Đúng (Theo nội dung mục I SGK trang 34).'
  },
  {
    id: 'tf3',
    q: 'Câu 3: Khi kim loại tác dụng với phi kim, nguyên tử kim loại nhận electron để trở thành ion âm.',
    ans: false,
    exp: 'Sai. Khi kim loại tác dụng với phi kim, nguyên tử kim loại nhường electron để trở thành ion dương.'
  },
  {
    id: 'tf4',
    q: 'Câu 4: Liên kết ion là liên kết được hình thành bởi lực hút giữa các ion mang điện tích trái dấu.',
    ans: true,
    exp: 'Đúng (Khái niệm Liên kết ion SGK trang 35).'
  },
  {
    id: 'tf5',
    q: 'Câu 5: Trong phân tử muối ăn (NaCl), ion Na⁺ có lớp vỏ electron bền vững giống vỏ nguyên tử khí hiếm Argon (Ar).',
    ans: false,
    exp: 'Sai. Ion Na⁺ (2, 8) có vỏ bền vững giống khí hiếm Neon (Ne); còn ion Cl⁻ (2, 8, 8) mới giống khí hiếm Argon (Ar).'
  },
  {
    id: 'tf6',
    q: 'Câu 6: Khi hình thành phân tử hydrogen (H₂), hai nguyên tử H đã liên kết với nhau bằng cách mỗi nguyên tử H góp chung 1 electron tạo thành một cặp electron dùng chung.',
    ans: true,
    exp: 'Đúng (Theo Hình 6.4 SGK trang 36).'
  },
  {
    id: 'tf7',
    q: 'Câu 7: Trong phân tử nước (H₂O), sau khi liên kết với hai nguyên tử H bằng cách dùng chung electron, lớp vỏ của nguyên tử O giống với lớp vỏ của khí hiếm Neon (Ne).',
    ans: true,
    exp: 'Đúng. Nguyên tử O có 8 electron ở lớp ngoài cùng giống khí hiếm Ne.'
  },
  {
    id: 'tf8',
    q: 'Câu 8: Các chất cộng hóa trị chỉ có thể tồn tại ở thể khí hoặc thể lỏng, không thể ở thể rắn.',
    ans: false,
    exp: 'Sai. Theo SGK tr.37: Các chất cộng hóa trị có thể là chất khí, chất lỏng hay chất rắn (ví dụ: đường ăn là chất rắn).'
  },
  {
    id: 'tf9',
    q: 'Câu 9: Các chất cộng hóa trị thường có nhiệt độ nóng chảy và nhiệt độ sôi thấp.',
    ans: true,
    exp: 'Đúng (Theo nội dung SGK trang 37).'
  },
  {
    id: 'tf10',
    q: 'Câu 10: Trong phân tử magnesium oxide (MgO), ion dương được tạo thành là Mg²⁺ và ion âm được tạo thành là O²⁻.',
    ans: true,
    exp: 'Đúng (Theo Hình 6.3 SGK trang 35).'
  }
];

// PHẦN III: TRẮC NGHIỆM GHÉP CỘT (10 câu × 2đ = 20đ)
const EXAM_MATCH = [
  {
    id: 'm1',
    colA: '1. Khí hiếm Helium (He)',
    ans: 'Có 2 electron ở lớp ngoài cùng, trơ, dùng bơm khinh khí cầu.',
    exp: 'He (+2) có 2e lớp ngoài cùng, rất khó cháy nổ.'
  },
  {
    id: 'm2',
    colA: '2. Khí hiếm Neon (Ne) và Argon (Ar)',
    ans: 'Đều có 8 electron ở lớp electron ngoài cùng bền vững.',
    exp: 'Ne (2,8) và Ar (2,8,8) đều có 8e lớp ngoài cùng.'
  },
  {
    id: 'm3',
    colA: '3. Nguyên tử Sodium (Na) khi tạo phân tử NaCl',
    ans: 'Nhường 1 electron ở lớp ngoài cùng để tạo thành ion dương Na⁺.',
    exp: 'Na (2,8,1) nhường 1e tạo thành ion Na⁺ (2,8).'
  },
  {
    id: 'm4',
    colA: '4. Nguyên tử Chlorine (Cl) khi tạo phân tử NaCl',
    ans: 'Nhận 1 electron vào lớp ngoài cùng để tạo thành ion âm Cl⁻.',
    exp: 'Cl (2,8,7) nhận 1e tạo thành ion Cl⁻ (2,8,8).'
  },
  {
    id: 'm5',
    colA: '5. Nguyên tử Magnesium (Mg) khi tạo phân tử MgO',
    ans: 'Nhường 2 electron ở lớp ngoài cùng để tạo thành ion dương Mg²⁺.',
    exp: 'Mg (2,8,2) nhường 2e cho O tạo ion Mg²⁺.'
  },
  {
    id: 'm6',
    colA: '6. Phân tử Hydrogen (H₂)',
    ans: 'Hai nguyên tử H góp chung 1 cặp electron để đạt vỏ giống khí hiếm He.',
    exp: 'Mỗi nguyên tử H góp 1e tạo 1 cặp electron dùng chung.'
  },
  {
    id: 'm7',
    colA: '7. Phân tử Oxygen (O₂)',
    ans: 'Hai nguyên tử O góp chung 2 cặp electron để đạt vỏ giống khí hiếm Ne.',
    exp: 'Mỗi nguyên tử O góp 2e tạo 2 cặp electron dùng chung.'
  },
  {
    id: 'm8',
    colA: '8. Phân tử Nước (H₂O)',
    ans: 'Nguyên tử O góp chung với mỗi nguyên tử H một electron tạo 2 cặp e dùng chung.',
    exp: 'Hình 6.6 SGK: O góp chung 1e với mỗi nguyên tử H.'
  },
  {
    id: 'm9',
    colA: '9. Hợp chất ion (như muối ăn NaCl)',
    ans: 'Chất rắn ở điều kiện thường, khó nóng chảy, tan trong nước tạo dung dịch dẫn điện.',
    exp: 'Tính chất đặc trưng của hợp chất ion (SGK tr.35).'
  },
  {
    id: 'm10',
    colA: '10. Chất cộng hóa trị (như nước đá, đường ăn)',
    ans: 'Thường có nhiệt độ nóng chảy và nhiệt độ sôi thấp.',
    exp: 'Tính chất đặc trưng của chất cộng hóa trị (SGK tr.37).'
  }
];

// PHẦN IV: TRẮC NGHIỆM TRẢ LỜI NGẮN (10 câu × 2đ = 20đ)
const EXAM_SHORT = [
  {
    id: 'sh1',
    q: 'Câu 1: Số electron ở lớp ngoài cùng của nguyên tử khí hiếm Helium (He) là bao nhiêu? (Chỉ điền số)',
    accepted: ['2', '2e', '2 electron'],
    displayAns: '2',
    exp: 'Helium (He) có 2 electron ở lớp ngoài cùng.'
  },
  {
    id: 'sh2',
    q: 'Câu 2: Số electron ở lớp ngoài cùng của nguyên tử khí hiếm Neon (Ne) và Argon (Ar) là bao nhiêu? (Chỉ điền số)',
    accepted: ['8', '8e', '8 electron'],
    displayAns: '8',
    exp: 'Ne và Ar đều có 8 electron ở lớp ngoài cùng.'
  },
  {
    id: 'sh3',
    q: 'Câu 3: Khi tạo thành phân tử NaCl, nguyên tử Na nhường mấy electron cho nguyên tử Cl? (Chỉ điền số)',
    accepted: ['1', '1e', '1 electron'],
    displayAns: '1',
    exp: 'Nguyên tử Na nhường 1 electron lớp ngoài cùng cho Cl.'
  },
  {
    id: 'sh4',
    q: 'Câu 4: Khi tạo thành phân tử MgO, nguyên tử Mg đã nhường bao nhiêu electron cho nguyên tử O? (Chỉ điền số)',
    accepted: ['2', '2e', '2 electron'],
    displayAns: '2',
    exp: 'Theo Hình 6.3 SGK: Nguyên tử Mg nhường 2 electron cho nguyên tử O.'
  },
  {
    id: 'sh5',
    q: 'Câu 5: Ion dương Na⁺ có lớp vỏ electron bền vững giống vỏ nguyên tử khí hiếm nào? (Điền kí hiệu hóa học, ví dụ: He, Ne, Ar)',
    accepted: ['ne', 'neon'],
    displayAns: 'Ne',
    exp: 'Ion Na⁺ có 10 electron (2, 8) giống vỏ nguyên tử khí hiếm Neon (Ne).'
  },
  {
    id: 'sh6',
    q: 'Câu 6: Ion âm Cl⁻ có lớp vỏ electron bền vững giống vỏ nguyên tử khí hiếm nào? (Điền kí hiệu hóa học, ví dụ: He, Ne, Ar)',
    accepted: ['ar', 'argon'],
    displayAns: 'Ar',
    exp: 'Ion Cl⁻ có 18 electron (2, 8, 8) giống vỏ nguyên tử khí hiếm Argon (Ar).'
  },
  {
    id: 'sh7',
    q: 'Câu 7: Trong phân tử hydrogen (H₂), có bao nhiêu cặp electron dùng chung giữa hai nguyên tử H? (Chỉ điền số)',
    accepted: ['1', '1 cap', '1 cặp'],
    displayAns: '1',
    exp: 'Hai nguyên tử H góp chung tạo thành 1 cặp electron dùng chung.'
  },
  {
    id: 'sh8',
    q: 'Câu 8: Trong phân tử oxygen (O₂), có bao nhiêu cặp electron dùng chung giữa hai nguyên tử O? (Chỉ điền số)',
    accepted: ['2', '2 cap', '2 cặp'],
    displayAns: '2',
    exp: 'Hai nguyên tử O góp chung tạo thành 2 cặp electron dùng chung.'
  },
  {
    id: 'sh9',
    q: 'Câu 9: Sau khi tạo thành liên kết cộng hóa trị trong phân tử H₂ và O₂, nguyên tử O có bao nhiêu electron ở lớp ngoài cùng? (Chỉ điền số)',
    accepted: ['8', '8e', '8 electron'],
    displayAns: '8',
    exp: 'Sau khi tạo liên kết cộng hóa trị, nguyên tử O đạt 8 electron ở lớp ngoài cùng giống khí hiếm Ne.'
  },
  {
    id: 'sh10',
    q: 'Câu 10: Trong phân tử ammonia (NH₃), một nguyên tử N đã liên kết với bao nhiêu nguyên tử H? (Chỉ điền số)',
    accepted: ['3', '3 nguyen tu', '3 nguyên tử'],
    displayAns: '3',
    exp: 'Phân tử ammonia (NH₃) gồm 1 nguyên tử N liên kết với 3 nguyên tử H.'
  }
];

// PHẦN V: TỰ LUẬN (5 câu × 4 điểm = 20 điểm) - Chấm tự động theo nhóm ý chuẩn (Keyword Rubrics)
const EXAM_ESSAY = [
  {
    id: 'es1',
    q: 'Câu 1 (4 điểm): Quan sát Hình 6.2 (SGK trang 35), em hãy so sánh số electron ở lớp ngoài cùng của nguyên tử Na, Cl trước khi liên kết với ion Na⁺, Cl⁻ sau khi tạo thành liên kết ion.',
    placeholder: 'Gợi ý: Nêu số electron lớp ngoài cùng của nguyên tử Na, Cl ban đầu và của ion Na+, Cl- sau khi nhường/nhận electron...',
    rubrics: [
      { keywords: ['1', 'na'], desc: 'Nêu được nguyên tử Na có 1e lớp ngoài cùng' },
      { keywords: ['7', 'cl'], desc: 'Nêu được nguyên tử Cl có 7e lớp ngoài cùng' },
      { keywords: ['8', 'bền vững', 'khí hiếm', 'ne', 'ar'], desc: 'Chỉ ra được ion Na⁺ và Cl⁻ đều có 8e ở lớp ngoài cùng bền vững giống khí hiếm (Ne, Ar)' },
      { keywords: ['nhường', 'nhận', 'ion'], desc: 'Giải thích được do Na nhường 1e và Cl nhận 1e' }
    ],
    modelAnswer: 'Trước khi liên kết: Nguyên tử Na có 1 electron lớp ngoài cùng, nguyên tử Cl có 7 electron lớp ngoài cùng (chưa bền vững). Sau khi Na nhường 1e và Cl nhận 1e: Cả hai ion Na⁺ (2, 8) và Cl⁻ (2, 8, 8) đều có 8 electron ở lớp ngoài cùng, đạt cấu trúc bền vững giống khí hiếm Ne và Ar.'
  },
  {
    id: 'es2',
    q: 'Câu 2 (4 điểm): Quan sát Hình 6.3 (SGK trang 35), em hãy mô tả sự hình thành liên kết ion trong phân tử magnesium oxide (MgO) và cho biết nguyên tử Mg đã nhường hay nhận bao nhiêu electron.',
    placeholder: 'Gợi ý: Nguyên tử Mg nhường mấy electron tạo ion gì? Nguyên tử O nhận mấy electron tạo ion gì? Hai ion liên kết với nhau như thế nào?...',
    rubrics: [
      { keywords: ['nhường 2', 'nhường hai', 'cho 2'], desc: 'Nêu đúng nguyên tử Mg đã nhường 2 electron ở lớp ngoài cùng' },
      { keywords: ['mg2+', 'ion dương'], desc: 'Nêu được Mg trở thành ion dương Mg²⁺ (vỏ giống Ne)' },
      { keywords: ['nhận 2', 'nhận hai', 'o2-', 'ion âm'], desc: 'Nêu được nguyên tử O nhận 2 electron trở thành ion âm O²⁻ (vỏ giống Ne)' },
      { keywords: ['hút nhau', 'trái dấu', 'ngược dấu', 'liên kết ion'], desc: 'Nêu được hai ion Mg²⁺ và O²⁻ mang điện tích trái dấu hút nhau tạo liên kết ion trong MgO' }
    ],
    modelAnswer: 'Khi hình thành phân tử MgO: Nguyên tử Mg (có 2e lớp ngoài cùng) đã nhường 2 electron cho nguyên tử O để tạo thành ion dương Mg²⁺ (có 8e lớp ngoài cùng giống khí hiếm Ne). Nguyên tử O (có 6e lớp ngoài cùng) nhận 2 electron của Mg tạo thành ion âm O²⁻ (cũng có 8e lớp ngoài cùng giống Ne). Hai ion Mg²⁺ và O²⁻ mang điện tích trái dấu hút nhau tạo thành liên kết ion trong phân tử MgO.'
  },
  {
    id: 'es3',
    q: 'Câu 3 (4 điểm): Em hãy mô tả sự hình thành liên kết cộng hóa trị trong phân tử khí chlorine (Cl₂) và khí nitrogen (N₂) (Câu hỏi SGK trang 36).',
    placeholder: 'Gợi ý: Mỗi nguyên tử Cl có mấy e lớp ngoài cùng, góp chung mấy e? Mỗi nguyên tử N có mấy e lớp ngoài cùng, góp chung mấy e?...',
    rubrics: [
      { keywords: ['cl', '7', '1'], desc: 'Nêu được mỗi nguyên tử Cl (7e lớp ngoài) góp chung 1 electron tạo 1 cặp e dùng chung trong Cl₂' },
      { keywords: ['n', '5', '3'], desc: 'Nêu được mỗi nguyên tử N (5e lớp ngoài) góp chung 3 electron tạo 3 cặp e dùng chung trong N₂' },
      { keywords: ['góp chung', 'dùng chung', 'cặp electron'], desc: 'Sử dụng đúng thuật ngữ góp chung / cặp electron dùng chung' },
      { keywords: ['8', 'khí hiếm', 'ar', 'ne'], desc: 'Nêu được sau liên kết mỗi nguyên tử đều đạt 8e lớp ngoài cùng giống khí hiếm (Ar với Cl₂, Ne với N₂)' }
    ],
    modelAnswer: '• Phân tử Cl₂: Mỗi nguyên tử Cl có 7e lớp ngoài cùng, hai nguyên tử Cl liên kết với nhau bằng cách mỗi nguyên tử góp chung 1 electron tạo thành 1 cặp electron dùng chung (đạt 8e giống khí hiếm Ar).\n• Phân tử N₂: Mỗi nguyên tử N có 5e lớp ngoài cùng, hai nguyên tử N liên kết với nhau bằng cách mỗi nguyên tử góp chung 3 electron tạo thành 3 cặp electron dùng chung (đạt 8e giống khí hiếm Ne).'
  },
  {
    id: 'es4',
    q: 'Câu 4 (4 điểm): Em hãy mô tả sự hình thành liên kết cộng hóa trị trong phân tử carbon dioxide (CO₂) và phân tử ammonia (NH₃) (Câu hỏi SGK trang 37).',
    placeholder: 'Gợi ý: Trong CO2, nguyên tử C góp chung mấy e với mỗi O? Trong NH3, nguyên tử N góp chung mấy e với mỗi nguyên tử H trong 3 nguyên tử H?...',
    rubrics: [
      { keywords: ['co2', '2', 'c'], desc: 'Trong CO₂: Nguyên tử C (4e lớp ngoài) góp chung 2 electron với mỗi nguyên tử O (tạo 2 cặp e chung với mỗi O)' },
      { keywords: ['nh3', '3', 'h'], desc: 'Trong NH₃: Nguyên tử N (5e lớp ngoài) góp chung 1 electron với mỗi nguyên tử H trong 3 nguyên tử H (tạo 3 cặp e chung)' },
      { keywords: ['góp chung', 'dùng chung'], desc: 'Nêu đúng nguyên tắc góp chung electron' },
      { keywords: ['8', '2', 'ne', 'he', 'khí hiếm'], desc: 'Nêu được sau liên kết C, O, N đạt 8e (giống Ne) và H đạt 2e (giống He)' }
    ],
    modelAnswer: '• Phân tử CO₂: Nguyên tử C (có 4e lớp ngoài cùng) liên kết với 2 nguyên tử O (mỗi O có 6e lớp ngoài cùng) bằng cách nguyên tử C góp chung 2 electron với mỗi nguyên tử O tạo thành các cặp electron dùng chung; giúp C và O đều đạt 8e lớp ngoài cùng giống khí hiếm Ne.\n• Phân tử NH₃: Nguyên tử N (có 5e lớp ngoài cùng) liên kết với 3 nguyên tử H bằng cách nguyên tử N góp chung với mỗi nguyên tử H 1 electron tạo thành 3 cặp electron dùng chung; giúp N đạt 8e (giống Ne) và mỗi H đạt 2e (giống He).'
  },
  {
    id: 'es5',
    q: 'Câu 5 (4 điểm): Vận dụng khái niệm liên kết hóa học, em hãy giải thích vì sao trong tự nhiên, muối ăn (NaCl) ở dạng rắn, khó nóng chảy, khó bay hơi, còn đường ăn, nước đá ở thể rắn dễ nóng chảy và nước (H₂O) ở thể lỏng dễ bay hơi? (Mục Em có thể - SGK trang 37).',
    placeholder: 'Gợi ý: Chỉ rõ muối ăn thuộc loại hợp chất gì (liên kết gì)? Đường ăn và nước thuộc loại chất gì (liên kết gì)? Từ đó suy ra sự khác biệt về nhiệt độ nóng chảy và bay hơi...',
    rubrics: [
      { keywords: ['muối ăn', 'ion', 'nacl'], desc: 'Chỉ ra được muối ăn (NaCl) là hợp chất ion (chứa liên kết ion)' },
      { keywords: ['khó nóng chảy', 'khó bay hơi', 'rắn'], desc: 'Giải thích hợp chất ion có tính chất là chất rắn, khó nóng chảy, khó bay hơi' },
      { keywords: ['đường', 'nước', 'cộng hóa trị', 'cộng hoá trị'], desc: 'Chỉ ra được đường ăn, nước đá và nước lỏng là chất cộng hóa trị (chứa liên kết cộng hóa trị)' },
      { keywords: ['thấp', 'dễ nóng chảy', 'dễ bay hơi', 'nhiệt độ sôi'], desc: 'Giải thích chất cộng hóa trị có nhiệt độ nóng chảy và nhiệt độ sôi thấp nên dễ nóng chảy, dễ bay hơi' }
    ],
    modelAnswer: '• Muối ăn (NaCl) là hợp chất ion (được tạo thành bởi liên kết ion giữa các ion Na⁺ và Cl⁻ hút nhau rất mạnh) nên ở điều kiện thường là chất rắn, có nhiệt độ nóng chảy và nhiệt độ sôi cao (khó nóng chảy, khó bay hơi).\n• Đường ăn, nước đá và nước lỏng (H₂O) là các chất cộng hóa trị (chỉ chứa các liên kết cộng hóa trị dùng chung electron), mà các chất cộng hóa trị thường có nhiệt độ nóng chảy và nhiệt độ sôi thấp nên đường ăn, nước đá dễ nóng chảy và nước lỏng dễ bay hơi.'
  }
];

/* ==========================================================================
   5. KHỞI TẠO ỨNG DỤNG & XỬ LÝ ĐĂNG NHẬP / ĐĂNG XUẤT
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initAuthSystem();
  renderNobleGasSVGs();
  initWarmupSection();
  initNobleSection();
  initSimulatorSection();
  initPracticeSection();
  initExamSection();
  initGasModal();
  initScrollSpy();
});

function initAuthSystem() {
  const loginScreen = document.getElementById('login-screen');
  const mainApp = document.getElementById('main-app');
  const loginForm = document.getElementById('login-form');
  const nameInput = document.getElementById('student-name-input');
  const classInput = document.getElementById('student-class-input');
  const errorMsg = document.getElementById('login-error-msg');
  const logoutBtn = document.getElementById('logout-btn');

  // Nút chọn nhanh lớp
  document.querySelectorAll('.class-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      classInput.value = chip.getAttribute('data-class') || '';
      classInput.focus();
    });
  });

  // Kiểm tra phiên đăng nhập đã lưu
  const savedStudent = localStorage.getItem(STORAGE_KEYS.STUDENT);
  if (savedStudent) {
    try {
      const parsed = JSON.parse(savedStudent);
      if (parsed.name && parsed.className) {
        enterMainApp(parsed.name, parsed.className);
      }
    } catch (e) {
      localStorage.removeItem(STORAGE_KEYS.STUDENT);
    }
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const sName = nameInput.value.trim();
    const sClass = classInput.value.trim();

    if (!sName || !sClass) {
      errorMsg.classList.remove('hidden');
      return;
    }

    errorMsg.classList.add('hidden');
    localStorage.setItem(
      STORAGE_KEYS.STUDENT,
      JSON.stringify({ name: sName, className: sClass })
    );
    enterMainApp(sName, sClass);
  });

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEYS.STUDENT);
    state.studentName = '';
    state.studentClass = '';
    nameInput.value = '';
    classInput.value = '';
    mainApp.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function enterMainApp(name, className) {
  state.studentName = name;
  state.studentClass = className;
  state.examStartTime = Date.now();

  document.getElementById('display-student-name').textContent = name;
  document.getElementById('display-student-class').textContent = className;
  document.getElementById('exam-student-name').textContent = name;
  document.getElementById('exam-student-class').textContent = className;

  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('main-app').classList.remove('hidden');
  markMilestone('login_done', 10);
}

function markMilestone(milestoneKey, xpReward = 10) {
  if (!state.completedMilestones.has(milestoneKey)) {
    state.completedMilestones.add(milestoneKey);
    state.xp += xpReward;
    document.getElementById('xp-counter').textContent = state.xp;
    updateProgressBar();
  }
}

function updateProgressBar() {
  // Tổng cộng 12 cột mốc học tập trong toàn bài
  const totalMilestones = 12;
  const count = state.completedMilestones.size;
  const percent = Math.min(100, Math.max(10, Math.round((count / totalMilestones) * 100)));

  document.getElementById('progress-bar-fill').style.width = `${percent}%`;
  document.getElementById('progress-percent-text').textContent = `${percent}%`;
}

/* ==========================================================================
   6. SECTION 1: KHỞI ĐỘNG (WARM-UP)
   ========================================================================== */
function initWarmupSection() {
  // Câu hỏi khởi động
  const quizBtns = document.querySelectorAll('.warmup-quiz-btn');
  const quizFeedback = document.getElementById('warmup-quiz-feedback');

  quizBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const isCorrect = btn.getAttribute('data-correct') === 'true';
      quizFeedback.classList.add('show');
      if (isCorrect) {
        quizFeedback.className = 'feedback-box show correct';
        quizFeedback.innerHTML = '🎉 <strong>Tuyệt vời! Chính xác!</strong> Các nguyên tử luôn có xu hướng nhường, nhận hoặc dùng chung electron để đạt được lớp electron ngoài cùng bền vững giống nguyên tử khí hiếm!';
        markMilestone('warmup_quiz', 15);
      } else {
        quizFeedback.className = 'feedback-box show wrong';
        quizFeedback.innerHTML = '💡 <strong>Thử lại nhé!</strong> Gợi ý: Khi liên kết hóa học, hạt nhân nguyên tử không thay đổi mà chỉ có các <em>electron ở lớp vỏ ngoài cùng</em> tham gia thôi!';
      }
    });
  });

  // Thí nghiệm Khinh khí cầu H2 vs He
  const balloonVisual = document.getElementById('balloon-visual');
  const balloonFeedback = document.getElementById('balloon-feedback');

  document.getElementById('btn-gas-h2').addEventListener('click', () => {
    balloonVisual.textContent = '💥🔥';
    balloonVisual.classList.remove('balloon-float');
    balloonFeedback.className = 'feedback-box show wrong';
    balloonFeedback.innerHTML = '⚠️ <strong>Cẩn thận! Thử lại nhé!</strong> Khí Hydrogen (<strong>H<sub>2</sub></strong>) tuy nhẹ nhưng rất dễ gây cháy nổ khi gặp tia lửa hoặc nhiệt độ cao!';
  });

  document.getElementById('btn-gas-he').addEventListener('click', () => {
    balloonVisual.textContent = '🎈✨';
    balloonVisual.classList.add('balloon-float');
    balloonFeedback.className = 'feedback-box show correct';
    balloonFeedback.innerHTML = '🌟 <strong>Tuyệt vời! Chính xác!</strong> Khí hiếm Helium (<strong>He</strong>) có lớp vỏ 2 electron bền vững nên rất trơ, khó cháy hay nổ, cực kỳ an toàn để bơm vào khinh khí cầu!';
    markMilestone('balloon_lab', 15);
  });
}

/* ==========================================================================
   7. SECTION 2: CẤU TRÚC KHÍ HIẾM (HÌNH 6.1)
   ========================================================================== */
function renderNobleGasSVGs() {
  const hl = state.highlightOuterOnly;
  document.getElementById('svg-noble-he').innerHTML = createAtomSVG('He', '+2', [2], { highlightOuter: hl });
  document.getElementById('svg-noble-ne').innerHTML = createAtomSVG('Ne', '+10', [2, 8], { highlightOuter: hl });
  document.getElementById('svg-noble-ar').innerHTML = createAtomSVG('Ar', '+18', [2, 8, 8], { highlightOuter: hl });
}

function initNobleSection() {
  // Lật thẻ 3D
  document.querySelectorAll('.flip-card').forEach((card) => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
      const atom = card.getAttribute('data-atom');
      markMilestone(`flip_${atom}`, 10);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  // Nút làm nổi bật lớp ngoài cùng
  const toggleBtn = document.getElementById('toggle-outer-shell-btn');
  toggleBtn.addEventListener('click', () => {
    state.highlightOuterOnly = !state.highlightOuterOnly;
    toggleBtn.textContent = state.highlightOuterOnly
      ? '🔍 Hiển thị đầy đủ mọi lớp electron'
      : '👁️ Làm nổi bật lớp ngoài cùng';
    renderNobleGasSVGs();
  });

  // Câu hỏi Hình 6.1 SGK
  const nobleFeedback = document.getElementById('noble-check-feedback');
  document.querySelectorAll('.noble-check-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const ans = btn.getAttribute('data-ans');
      if (ans === 'correct') {
        nobleFeedback.className = 'feedback-box show correct';
        nobleFeedback.innerHTML = '🎉 <strong>Chính xác! Tuyệt vời!</strong> Lớp electron ngoài cùng của các nguyên tử khí hiếm đều chứa <strong>8 electron</strong> (như Ne và Ar), riêng nguyên tử Helium (He) chứa <strong>2 electron</strong>.';
        markMilestone('noble_question', 15);
      } else {
        nobleFeedback.className = 'feedback-box show wrong';
        nobleFeedback.innerHTML = '💡 <strong>Thử lại nhé!</strong> Hãy đếm số chấm tròn màu vàng ở vòng tròn ngoài cùng của Hình 6.1a (He), 6.1b (Ne) và 6.1c (Ar) nhé!';
      }
    });
  });
}

/* ==========================================================================
   8. SECTION 3: PHÒNG THÍ NGHIỆM MÔ PHỎNG LIÊN KẾT (HÌNH 6.2 -> 6.6)
   ========================================================================== */
function initSimulatorSection() {
  const simTabs = document.querySelectorAll('.sim-tab-btn');
  const actionBtn = document.getElementById('sim-action-btn');
  const resetBtn = document.getElementById('sim-reset-btn');

  // Mặc định hiển thị luôn sơ đồ quá trình hình thành liên kết đầy đủ (Trước -> Sau)
  state.isSimBonded = true;

  simTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      simTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      state.currentSimMolecule = tab.getAttribute('data-mol') || 'NaCl';
      state.isSimBonded = true;
      markMilestone(`sim_${state.currentSimMolecule}`, 15);
      renderSimulatorStage();
    });
  });

  actionBtn.addEventListener('click', () => {
    state.isSimBonded = true;
    markMilestone(`sim_${state.currentSimMolecule}`, 15);
    renderSimulatorStage();
  });

  resetBtn.addEventListener('click', () => {
    state.isSimBonded = false;
    renderSimulatorStage();
  });

  // Các phân tử mở rộng (Cl2, N2, CO2, NH3)
  const extBtns = document.querySelectorAll('.ext-mol-btn');
  extBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      extBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const key = btn.getAttribute('data-ext') || 'Cl2';
      markMilestone(`ext_${key}`, 10);
      renderExtendedMolecule(key);
    });
  });

  renderSimulatorStage();
  renderExtendedMolecule('Cl2');
}

function formatChemHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/²⁺/g, '<sup>2+</sup>')
    .replace(/²⁻/g, '<sup>2−</sup>')
    .replace(/⁺/g, '<sup>+</sup>')
    .replace(/⁻/g, '<sup>−</sup>')
    .replace(/₂/g, '<sub>2</sub>')
    .replace(/₃/g, '<sub>3</sub>');
}

function renderSimulatorStage() {
  const mol = state.currentSimMolecule;
  const info = SIMULATOR_DATA[mol];
  const canvas = document.getElementById('sim-visual-canvas');
  const expBox = document.getElementById('sim-explanation-box');
  const actionBtn = document.getElementById('sim-action-btn');

  document.getElementById('sim-type-badge').innerHTML = formatChemHTML(info.typeBadge);
  document.getElementById('sim-title').innerHTML = formatChemHTML(info.title);
  actionBtn.innerHTML = state.isSimBonded ? '✅ Đang hiển thị sơ đồ hình thành liên kết' : formatChemHTML(info.actionLabel);
  actionBtn.disabled = state.isSimBonded;

  expBox.innerHTML = formatChemHTML(state.isSimBonded ? info.afterDesc : info.beforeDesc);

  if (mol === 'NaCl') {
    if (!state.isSimBonded) {
      canvas.innerHTML = `
        <div class="atom-box">
          ${createAtomSVG('Na', '+11', [2, 8, 1], { highlightOuter: true })}
          <div style="font-weight:800; color:#0C4A6E;">Nguyên tử Na (2, 8, 1)</div>
          <small style="color:#B45309; font-weight:700;">Có 1e lớp ngoài cùng</small>
        </div>
        <div class="bond-arrow">&rarr; nhường 1e &rarr;</div>
        <div class="atom-box">
          ${createAtomSVG('Cl', '+17', [2, 8, 7], { highlightOuter: true })}
          <div style="font-weight:800; color:#0C4A6E;">Nguyên tử Cl (2, 8, 7)</div>
          <small style="color:#0284C7; font-weight:700;">Có 7e lớp ngoài cùng</small>
        </div>
      `;
    } else {
      canvas.innerHTML = `
        <div class="bond-formation-flow" style="width:100%; border:none; background:transparent; padding:4px; margin:0;">
          <div class="formation-stage-box">
            <span class="formation-stage-label">1. Trước khi liên kết (Nguyên tử)</span>
            <div class="formation-atoms-row">
              <div class="atom-box" style="padding:6px;">
                ${createAtomSVG('Na', '+11', [2, 8, 1], { highlightOuter: true, size: 145 })}
                <div style="font-weight:800; font-size:0.9rem; color:#0C4A6E;">Na (2, 8, 1)</div>
              </div>
              <div class="bond-arrow">+</div>
              <div class="atom-box" style="padding:6px;">
                ${createAtomSVG('Cl', '+17', [2, 8, 7], { highlightOuter: true, size: 145 })}
                <div style="font-weight:800; font-size:0.9rem; color:#0C4A6E;">Cl (2, 8, 7)</div>
              </div>
            </div>
          </div>
          <div class="formation-arrow-box">
            <span>⚡ Na nhường 1e cho Cl</span>
            <span style="font-size:1.5rem;">&rarr;</span>
          </div>
          <div class="formation-stage-box after-stage">
            <span class="formation-stage-label">2. Sau khi liên kết (Phân tử NaCl)</span>
            <div class="formation-atoms-row">
              <div class="atom-box ion-formed-pos" style="padding:8px;">
                ${createAtomSVG('Na+', '+11', [2, 8], { isIon: true, ionSign: '+', highlightOuter: true, size: 150 })}
                <div style="font-weight:900; font-size:0.9rem; color:#B45309;">Ion Na<sup>+</sup> (2, 8)</div>
                <small style="font-weight:700;">Giống Ne</small>
              </div>
              <div class="bond-arrow" style="font-size:1.2rem;">⚡Hút⚡</div>
              <div class="atom-box ion-formed-neg" style="padding:8px;">
                ${createAtomSVG('Cl-', '+17', [2, 8, 8], { isIon: true, ionSign: '−', highlightOuter: true, size: 150 })}
                <div style="font-weight:900; font-size:0.9rem; color:#0369A1;">Ion Cl<sup>−</sup> (2, 8, 8)</div>
                <small style="font-weight:700;">Giống Ar</small>
              </div>
            </div>
          </div>
        </div>
      `;
    }
    return;
  }

  if (mol === 'MgO') {
    if (!state.isSimBonded) {
      canvas.innerHTML = `
        <div class="atom-box">
          ${createAtomSVG('Mg', '+12', [2, 8, 2], { highlightOuter: true })}
          <div style="font-weight:800; color:#0C4A6E;">Nguyên tử Mg (2, 8, 2)</div>
          <small style="color:#B45309; font-weight:700;">Có 2e lớp ngoài cùng</small>
        </div>
        <div class="bond-arrow">&rarr; nhường 2e &rarr;</div>
        <div class="atom-box">
          ${createAtomSVG('O', '+8', [2, 6], { highlightOuter: true })}
          <div style="font-weight:800; color:#0C4A6E;">Nguyên tử O (2, 6)</div>
          <small style="color:#0284C7; font-weight:700;">Có 6e lớp ngoài cùng</small>
        </div>
      `;
    } else {
      canvas.innerHTML = `
        <div class="bond-formation-flow" style="width:100%; border:none; background:transparent; padding:4px; margin:0;">
          <div class="formation-stage-box">
            <span class="formation-stage-label">1. Trước khi liên kết (Nguyên tử)</span>
            <div class="formation-atoms-row">
              <div class="atom-box" style="padding:6px;">
                ${createAtomSVG('Mg', '+12', [2, 8, 2], { highlightOuter: true, size: 145 })}
                <div style="font-weight:800; font-size:0.9rem; color:#0C4A6E;">Mg (2, 8, 2)</div>
              </div>
              <div class="bond-arrow">+</div>
              <div class="atom-box" style="padding:6px;">
                ${createAtomSVG('O', '+8', [2, 6], { highlightOuter: true, size: 145 })}
                <div style="font-weight:800; font-size:0.9rem; color:#0C4A6E;">O (2, 6)</div>
              </div>
            </div>
          </div>
          <div class="formation-arrow-box">
            <span>⚡ Mg nhường 2e cho O</span>
            <span style="font-size:1.5rem;">&rarr;</span>
          </div>
          <div class="formation-stage-box after-stage">
            <span class="formation-stage-label">2. Sau khi liên kết (Phân tử MgO)</span>
            <div class="formation-atoms-row">
              <div class="atom-box ion-formed-pos" style="padding:8px;">
                ${createAtomSVG('Mg2+', '+12', [2, 8], { isIon: true, ionSign: '2+', highlightOuter: true, size: 150 })}
                <div style="font-weight:900; font-size:0.9rem; color:#B45309;">Ion Mg<sup>2+</sup> (2, 8)</div>
                <small style="font-weight:700;">Giống Ne</small>
              </div>
              <div class="bond-arrow" style="font-size:1.2rem;">⚡Hút⚡</div>
              <div class="atom-box ion-formed-neg" style="padding:8px;">
                ${createAtomSVG('O2-', '+8', [2, 8], { isIon: true, ionSign: '2−', highlightOuter: true, size: 150 })}
                <div style="font-weight:900; font-size:0.9rem; color:#0369A1;">Ion O<sup>2−</sup> (2, 8)</div>
                <small style="font-weight:700;">Giống Ne</small>
              </div>
            </div>
          </div>
        </div>
      `;
    }
    return;
  }

  if (mol === 'H2') {
    if (!state.isSimBonded) {
      canvas.innerHTML = `
        <div class="atom-box">
          ${createAtomSVG('H', '+1', [1], { highlightOuter: true })}
          <div style="font-weight:800;">Nguyên tử H (1e)</div>
        </div>
        <div class="bond-arrow">+</div>
        <div class="atom-box">
          ${createAtomSVG('H', '+1', [1], { highlightOuter: true })}
          <div style="font-weight:800;">Nguyên tử H (1e)</div>
        </div>
      `;
    } else {
      canvas.innerHTML = `
        <div class="bond-formation-flow" style="width:100%; border:none; background:transparent; padding:4px; margin:0;">
          <div class="formation-stage-box">
            <span class="formation-stage-label">1. Trước khi liên kết (2 nguyên tử H)</span>
            <div class="formation-atoms-row">
              <div class="atom-box" style="padding:6px;">
                ${createAtomSVG('H', '+1', [1], { highlightOuter: true, size: 135 })}
                <div style="font-weight:800; font-size:0.9rem;">Nguyên tử H (1e)</div>
              </div>
              <div class="bond-arrow">+</div>
              <div class="atom-box" style="padding:6px;">
                ${createAtomSVG('H', '+1', [1], { highlightOuter: true, size: 135 })}
                <div style="font-weight:800; font-size:0.9rem;">Nguyên tử H (1e)</div>
              </div>
            </div>
          </div>
          <div class="formation-arrow-box">
            <span>🤝 Góp chung 1 cặp e</span>
            <span style="font-size:1.5rem;">&rarr;</span>
          </div>
          <div class="formation-stage-box after-stage">
            <span class="formation-stage-label">2. Sau khi liên kết (Phân tử H<sub>2</sub>)</span>
            <div>${createCovalentBondedSVG('H2')}</div>
          </div>
        </div>
      `;
    }
    return;
  }

  if (mol === 'O2') {
    if (!state.isSimBonded) {
      canvas.innerHTML = `
        <div class="atom-box">
          ${createAtomSVG('O', '+8', [2, 6], { highlightOuter: true })}
          <div style="font-weight:800;">Nguyên tử O (2, 6)</div>
        </div>
        <div class="bond-arrow">+</div>
        <div class="atom-box">
          ${createAtomSVG('O', '+8', [2, 6], { highlightOuter: true })}
          <div style="font-weight:800;">Nguyên tử O (2, 6)</div>
        </div>
      `;
    } else {
      canvas.innerHTML = `
        <div class="bond-formation-flow" style="width:100%; border:none; background:transparent; padding:4px; margin:0;">
          <div class="formation-stage-box">
            <span class="formation-stage-label">1. Trước khi liên kết (2 nguyên tử O)</span>
            <div class="formation-atoms-row">
              <div class="atom-box" style="padding:6px;">
                ${createAtomSVG('O', '+8', [2, 6], { highlightOuter: true, size: 135 })}
                <div style="font-weight:800; font-size:0.9rem;">Nguyên tử O (2, 6)</div>
              </div>
              <div class="bond-arrow">+</div>
              <div class="atom-box" style="padding:6px;">
                ${createAtomSVG('O', '+8', [2, 6], { highlightOuter: true, size: 135 })}
                <div style="font-weight:800; font-size:0.9rem;">Nguyên tử O (2, 6)</div>
              </div>
            </div>
          </div>
          <div class="formation-arrow-box">
            <span>🤝 Góp chung 2 cặp e</span>
            <span style="font-size:1.5rem;">&rarr;</span>
          </div>
          <div class="formation-stage-box after-stage">
            <span class="formation-stage-label">2. Sau khi liên kết (Phân tử O<sub>2</sub>)</span>
            <div>${createCovalentBondedSVG('O2')}</div>
          </div>
        </div>
      `;
    }
    return;
  }

  // H2O
  if (!state.isSimBonded) {
    canvas.innerHTML = `
      <div class="atom-box">
        ${createAtomSVG('H', '+1', [1], { highlightOuter: true })}
        <div style="font-weight:800;">Nguyên tử H (1e)</div>
      </div>
      <div class="bond-arrow">+</div>
      <div class="atom-box">
        ${createAtomSVG('O', '+8', [2, 6], { highlightOuter: true })}
        <div style="font-weight:800;">Nguyên tử O (2, 6)</div>
      </div>
      <div class="bond-arrow">+</div>
      <div class="atom-box">
        ${createAtomSVG('H', '+1', [1], { highlightOuter: true })}
        <div style="font-weight:800;">Nguyên tử H (1e)</div>
      </div>
    `;
  } else {
    canvas.innerHTML = `
      <div class="bond-formation-flow" style="width:100%; border:none; background:transparent; padding:4px; margin:0;">
        <div class="formation-stage-box">
          <span class="formation-stage-label">1. Trước khi liên kết (2H + 1O)</span>
          <div class="formation-atoms-row">
            <div class="atom-box" style="padding:4px;">
              ${createAtomSVG('H', '+1', [1], { highlightOuter: true, size: 120 })}
              <div style="font-weight:800; font-size:0.85rem;">H (1e)</div>
            </div>
            <div class="bond-arrow">+</div>
            <div class="atom-box" style="padding:4px;">
              ${createAtomSVG('O', '+8', [2, 6], { highlightOuter: true, size: 125 })}
              <div style="font-weight:800; font-size:0.85rem;">O (2, 6)</div>
            </div>
            <div class="bond-arrow">+</div>
            <div class="atom-box" style="padding:4px;">
              ${createAtomSVG('H', '+1', [1], { highlightOuter: true, size: 120 })}
              <div style="font-weight:800; font-size:0.85rem;">H (1e)</div>
            </div>
          </div>
        </div>
        <div class="formation-arrow-box">
          <span>🤝 O góp 1e với mỗi H</span>
          <span style="font-size:1.5rem;">&rarr;</span>
        </div>
        <div class="formation-stage-box after-stage">
          <span class="formation-stage-label">2. Sau khi liên kết (Phân tử H<sub>2</sub>O)</span>
          <div>${createCovalentBondedSVG('H2O')}</div>
        </div>
      </div>
    `;
  }
}

function getExtendedBeforeAtomsHTML(key) {
  if (key === 'Cl2') {
    return `
      <div class="atom-box" style="padding:6px;">
        ${createAtomSVG('Cl', '+17', [2, 8, 7], { highlightOuter: true, size: 135 })}
        <div style="font-weight:800; font-size:0.88rem; color:#0C4A6E;">Nguyên tử Cl (2, 8, 7)</div>
        <small style="color:#B45309; font-weight:700;">7e lớp ngoài cùng</small>
      </div>
      <div class="bond-arrow">+</div>
      <div class="atom-box" style="padding:6px;">
        ${createAtomSVG('Cl', '+17', [2, 8, 7], { highlightOuter: true, size: 135 })}
        <div style="font-weight:800; font-size:0.88rem; color:#0C4A6E;">Nguyên tử Cl (2, 8, 7)</div>
        <small style="color:#B45309; font-weight:700;">7e lớp ngoài cùng</small>
      </div>
    `;
  }
  if (key === 'N2') {
    return `
      <div class="atom-box" style="padding:6px;">
        ${createAtomSVG('N', '+7', [2, 5], { highlightOuter: true, size: 135 })}
        <div style="font-weight:800; font-size:0.88rem; color:#0C4A6E;">Nguyên tử N (2, 5)</div>
        <small style="color:#B45309; font-weight:700;">5e lớp ngoài cùng</small>
      </div>
      <div class="bond-arrow">+</div>
      <div class="atom-box" style="padding:6px;">
        ${createAtomSVG('N', '+7', [2, 5], { highlightOuter: true, size: 135 })}
        <div style="font-weight:800; font-size:0.88rem; color:#0C4A6E;">Nguyên tử N (2, 5)</div>
        <small style="color:#B45309; font-weight:700;">5e lớp ngoài cùng</small>
      </div>
    `;
  }
  if (key === 'CO2') {
    return `
      <div class="atom-box" style="padding:4px;">
        ${createAtomSVG('O', '+8', [2, 6], { highlightOuter: true, size: 120 })}
        <div style="font-weight:800; font-size:0.85rem; color:#0C4A6E;">O (2, 6)</div>
        <small style="color:#0284C7; font-weight:700;">6e ngoài</small>
      </div>
      <div class="bond-arrow">+</div>
      <div class="atom-box" style="padding:4px;">
        ${createAtomSVG('C', '+6', [2, 4], { highlightOuter: true, size: 120 })}
        <div style="font-weight:800; font-size:0.85rem; color:#B45309;">C (2, 4)</div>
        <small style="color:#B45309; font-weight:700;">4e ngoài</small>
      </div>
      <div class="bond-arrow">+</div>
      <div class="atom-box" style="padding:4px;">
        ${createAtomSVG('O', '+8', [2, 6], { highlightOuter: true, size: 120 })}
        <div style="font-weight:800; font-size:0.85rem; color:#0C4A6E;">O (2, 6)</div>
        <small style="color:#0284C7; font-weight:700;">6e ngoài</small>
      </div>
    `;
  }
  // NH3
  return `
    <div class="atom-box" style="padding:4px;">
      ${createAtomSVG('N', '+7', [2, 5], { highlightOuter: true, size: 125 })}
      <div style="font-weight:800; font-size:0.85rem; color:#0C4A6E;">Nguyên tử N (2, 5)</div>
      <small style="color:#B45309; font-weight:700;">5e lớp ngoài</small>
    </div>
    <div class="bond-arrow">+</div>
    <div class="atom-box" style="padding:4px;">
      ${createAtomSVG('H', '+1', [1], { highlightOuter: true, size: 115 })}
      <div style="font-weight:800; font-size:0.85rem; color:#0C4A6E;">3 × Nguyên tử H (1e)</div>
      <small style="color:#0284C7; font-weight:700;">Mỗi H có 1e</small>
    </div>
  `;
}

function renderExtendedMolecule(key) {
  const item = EXTENDED_MOLECULES[key];
  const box = document.getElementById('ext-mol-detail');
  box.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:10px;">
      <h4 style="color: var(--primary-blue-deep); font-size: 1.15rem; margin:0;">🔬 ${formatChemHTML(item.title)}</h4>
      <div style="display:flex; flex-wrap:wrap; gap:8px;">
        <span class="formula-pill" style="margin-top:0;">🔗 ${formatChemHTML(item.sharedBadge)}</span>
        <span class="formula-pill" style="margin-top:0; background:#FEF3C7; border-color:var(--accent-yellow); color:#92400E;">📐 ${formatChemHTML(item.formulaBadge)}</span>
      </div>
    </div>

    <!-- MÔ HÌNH TRỰC QUAN SỰ HÌNH THÀNH LIÊN KẾT (TRƯỚC -> SAU) -->
    <div class="bond-formation-flow" role="region" aria-label="Mô hình sự hình thành liên kết ${key}">
      <div class="formation-stage-box">
        <span class="formation-stage-label">1. Trước khi liên kết (Các nguyên tử riêng rẽ)</span>
        <div class="formation-atoms-row">
          ${getExtendedBeforeAtomsHTML(key)}
        </div>
      </div>

      <div class="formation-arrow-box">
        <span>🤝 ${formatChemHTML(item.arrowLabel)}</span>
        <span style="font-size: 1.6rem; line-height: 1;">&rarr;</span>
      </div>

      <div class="formation-stage-box after-stage">
        <span class="formation-stage-label">2. Sau khi liên kết (Mô hình phân tử ${formatChemHTML(key.replace('2', '₂').replace('3', '₃'))})</span>
        <div>
          ${createCovalentBondedSVG(key)}
        </div>
      </div>
    </div>

    <div style="font-size: 0.96rem; background:#F0F9FF; padding:12px 16px; border-radius:10px; border-left:4px solid var(--primary-blue);">
      ${formatChemHTML(item.content)}
    </div>
  `;
}

/* ==========================================================================
   9. SECTION 4: BA HOẠT ĐỘNG THỰC HÀNH TƯƠNG TÁC CÓ PHẢN HỒI TỨC THÌ
   ========================================================================== */
function initPracticeSection() {
  // Hoạt động 1
  const c1 = document.getElementById('act1-container');
  c1.innerHTML = PRACTICE_ACT1.map((item) => `
    <div class="sort-item">
      <div style="font-weight: 700; color: var(--text-main);">${formatChemHTML(item.prompt)}</div>
      <div class="sort-btn-group" style="flex-direction: column;">
        ${item.options.map((opt) => `
          <button type="button" class="sort-btn act1-btn" data-id="${item.id}" data-opt="${opt}">${formatChemHTML(opt)}</button>
        `).join('')}
      </div>
      <div id="fb-${item.id}" class="feedback-box" role="status"></div>
    </div>
  `).join('');

  c1.querySelectorAll('.act1-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const opt = btn.getAttribute('data-opt');
      const item = PRACTICE_ACT1.find((x) => x.id === id);
      const fb = document.getElementById(`fb-${id}`);

      if (opt === item.correct) {
        fb.className = 'feedback-box show correct';
        fb.innerHTML = '🎉 <strong>Tuyệt vời! Chính xác!</strong>';
        markMilestone(`prac_${id}`, 5);
      } else {
        fb.className = 'feedback-box show wrong';
        fb.innerHTML = `💡 <strong>Thử lại nhé!</strong> Gợi ý: ${formatChemHTML(item.hint)}`;
      }
    });
  });

  // Hoạt động 2
  const c2 = document.getElementById('act2-container');
  c2.innerHTML = PRACTICE_ACT2.map((item) => `
    <div class="sort-item">
      <div style="font-weight: 700;">${formatChemHTML(item.text)}</div>
      <div class="sort-btn-group">
        <button type="button" class="sort-btn act2-btn" data-id="${item.id}" data-choice="Hợp chất Ion">Hợp chất Ion</button>
        <button type="button" class="sort-btn act2-btn" data-id="${item.id}" data-choice="Chất Cộng hóa trị">Chất Cộng hóa trị</button>
      </div>
      <div id="fb-${item.id}" class="feedback-box" role="status"></div>
    </div>
  `).join('');

  c2.querySelectorAll('.act2-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const choice = btn.getAttribute('data-choice');
      const item = PRACTICE_ACT2.find((x) => x.id === id);
      const fb = document.getElementById(`fb-${id}`);

      if (choice === item.correct) {
        fb.className = 'feedback-box show correct';
        fb.innerHTML = `🌟 <strong>Chính xác!</strong> Thuộc nhóm <strong>${item.correct}</strong>.`;
        markMilestone(`prac_${id}`, 5);
      } else {
        fb.className = 'feedback-box show wrong';
        fb.innerHTML = `💡 <strong>Thử lại nhé!</strong> Gợi ý: ${formatChemHTML(item.hint)}`;
      }
    });
  });

  // Hoạt động 3
  const c3 = document.getElementById('act3-container');
  c3.innerHTML = PRACTICE_ACT3.map((item) => `
    <div class="sort-item">
      <div style="font-weight: 700;">${formatChemHTML(item.text)}</div>
      <div class="sort-btn-group">
        <button type="button" class="sort-btn act3-btn" data-id="${item.id}" data-choice="He (Helium)">He (+2)</button>
        <button type="button" class="sort-btn act3-btn" data-id="${item.id}" data-choice="Ne (Neon)">Ne (+10)</button>
        <button type="button" class="sort-btn act3-btn" data-id="${item.id}" data-choice="Ar (Argon)">Ar (+18)</button>
      </div>
      <div id="fb-${item.id}" class="feedback-box" role="status"></div>
    </div>
  `).join('');

  c3.querySelectorAll('.act3-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const choice = btn.getAttribute('data-choice');
      const item = PRACTICE_ACT3.find((x) => x.id === id);
      const fb = document.getElementById(`fb-${id}`);

      if (choice === item.correct) {
        fb.className = 'feedback-box show correct';
        fb.innerHTML = `🎉 <strong>Tuyệt vời! Chính xác!</strong> Giống vỏ nguyên tử khí hiếm <strong>${item.correct}</strong>.`;
        markMilestone(`prac_${id}`, 5);
      } else {
        fb.className = 'feedback-box show wrong';
        fb.innerHTML = `💡 <strong>Thử lại nhé!</strong> Gợi ý: ${formatChemHTML(item.hint)}`;
      }
    });
  });
}

/* ==========================================================================
   10. SECTION 5: HỆ THỐNG KIỂM TRA 100 ĐIỂM (45 CÂU HỎI) & TỰ CHẤM ĐIỂM
   ========================================================================== */
function initExamSection() {
  renderExamQuestions();

  // Chuyển đổi các tab phần thi
  const partTabs = document.querySelectorAll('.exam-part-tab');
  const panels = {
    'part-mcq': document.getElementById('part-mcq'),
    'part-tf': document.getElementById('part-tf'),
    'part-match': document.getElementById('part-match'),
    'part-short': document.getElementById('part-short'),
    'part-essay': document.getElementById('part-essay')
  };

  partTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      partTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.getAttribute('data-part');

      if (target === 'part-all') {
        Object.values(panels).forEach((p) => p.classList.remove('hidden'));
      } else {
        Object.entries(panels).forEach(([key, panel]) => {
          panel.classList.toggle('hidden', key !== target);
        });
      }
    });
  });

  document.getElementById('scroll-to-submit-btn').addEventListener('click', () => {
    document.getElementById('submit-exam-zone').scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('submit-exam-btn').addEventListener('click', gradeAndSubmitExam);

  document.getElementById('retry-exam-btn').addEventListener('click', () => {
    state.isExamSubmitted = false;
    state.examStartTime = Date.now();
    document.getElementById('exam-result-panel').classList.add('hidden');
    document.getElementById('retry-exam-btn').classList.add('hidden');
    document.getElementById('submit-exam-btn').disabled = false;
    document.getElementById('gas-sync-status').textContent = '';
    renderExamQuestions();
    updateAnsweredCounter();
    document.getElementById('sec-exam').scrollIntoView({ behavior: 'smooth' });
  });

  // Nút hoàn thành bài học ở Footer
  document.getElementById('complete-lesson-btn').addEventListener('click', () => {
    markMilestone('lesson_finished', 20);
    document.getElementById('progress-bar-fill').style.width = '100%';
    document.getElementById('progress-percent-text').textContent = '100%';
    document.getElementById('lesson-complete-banner').classList.add('show');
  });
}

function renderExamQuestions() {
  // 1. Render 10 câu Nhiều lựa chọn
  const mcqContainer = document.getElementById('mcq-questions-list');
  mcqContainer.innerHTML = EXAM_MCQ.map((item, idx) => `
    <div class="question-card" id="card-${item.id}">
      <div class="q-header">
        <span class="q-number">Phần I • Câu ${idx + 1}/10</span>
        <span class="q-points">2 điểm</span>
      </div>
      <div class="q-text">${formatChemHTML(item.q)}</div>
      <div class="options-grid">
        ${item.options.map((opt, optIdx) => `
          <label class="option-label">
            <input type="radio" name="${item.id}" value="${optIdx}" class="exam-input" data-card="card-${item.id}" />
            <span>${formatChemHTML(opt)}</span>
          </label>
        `).join('')}
      </div>
      <div id="fb-${item.id}" class="feedback-box" role="status"></div>
    </div>
  `).join('');

  // 2. Render 10 câu Đúng / Sai
  const tfContainer = document.getElementById('tf-questions-list');
  tfContainer.innerHTML = EXAM_TF.map((item, idx) => `
    <div class="question-card" id="card-${item.id}">
      <div class="q-header">
        <span class="q-number">Phần II • Câu ${idx + 1}/10</span>
        <span class="q-points">2 điểm</span>
      </div>
      <div class="q-text">${formatChemHTML(item.q)}</div>
      <div class="options-grid" style="max-width: 420px;">
        <label class="option-label">
          <input type="radio" name="${item.id}" value="true" class="exam-input" data-card="card-${item.id}" />
          <span>✅ Đúng</span>
        </label>
        <label class="option-label">
          <input type="radio" name="${item.id}" value="false" class="exam-input" data-card="card-${item.id}" />
          <span>❌ Sai</span>
        </label>
      </div>
      <div id="fb-${item.id}" class="feedback-box" role="status"></div>
    </div>
  `).join('');

  // 3. Render 10 câu Ghép cột
  const matchOptionsPool = EXAM_MATCH.map((m) => m.ans).sort((a, b) => a.localeCompare(b, 'vi'));
  const matchContainer = document.getElementById('match-questions-list');
  matchContainer.innerHTML = EXAM_MATCH.map((item, idx) => `
    <div class="question-card" id="card-${item.id}">
      <div class="q-header">
        <span class="q-number">Phần III • Ghép cột ${idx + 1}/10</span>
        <span class="q-points">2 điểm</span>
      </div>
      <div class="matching-row">
        <div style="font-weight: 800; color: var(--primary-blue-deep);">${formatChemHTML(item.colA)}</div>
        <div>
          <select id="select-${item.id}" class="matching-select exam-input" data-card="card-${item.id}" aria-label="Chọn đáp án ghép cột cho ${item.colA}">
            <option value="">-- Chọn nội dung tương ứng ở Cột B --</option>
            ${matchOptionsPool.map((opt) => `<option value="${opt}">${opt}</option>`).join('')}
          </select>
        </div>
      </div>
      <div id="fb-${item.id}" class="feedback-box" role="status"></div>
    </div>
  `).join('');

  // 4. Render 10 câu Trả lời ngắn
  const shortContainer = document.getElementById('short-questions-list');
  shortContainer.innerHTML = EXAM_SHORT.map((item, idx) => `
    <div class="question-card" id="card-${item.id}">
      <div class="q-header">
        <span class="q-number">Phần IV • Câu ${idx + 1}/10</span>
        <span class="q-points">2 điểm</span>
      </div>
      <div class="q-text">${formatChemHTML(item.q)}</div>
      <input
        type="text"
        id="input-${item.id}"
        class="form-input exam-input"
        data-card="card-${item.id}"
        placeholder="Nhập câu trả lời ngắn của em..."
        style="max-width: 380px;"
      />
      <div id="fb-${item.id}" class="feedback-box" role="status"></div>
    </div>
  `).join('');

  // 5. Render 5 câu Tự luận (4 điểm / câu)
  const essayContainer = document.getElementById('essay-questions-list');
  essayContainer.innerHTML = EXAM_ESSAY.map((item, idx) => `
    <div class="question-card" id="card-${item.id}">
      <div class="q-header">
        <span class="q-number">Phần V • Tự luận ${idx + 1}/5</span>
        <span class="q-points">4 điểm</span>
      </div>
      <div class="q-text">${formatChemHTML(item.q)}</div>
      <textarea
        id="textarea-${item.id}"
        class="essay-textarea exam-input"
        data-card="card-${item.id}"
        placeholder="${item.placeholder}"
      ></textarea>
      <div id="fb-${item.id}" class="feedback-box" role="status"></div>
    </div>
  `).join('');

  // Lắng nghe sự kiện trả lời để cập nhật bộ đếm
  document.querySelectorAll('.exam-input').forEach((el) => {
    el.addEventListener('change', updateAnsweredCounter);
    el.addEventListener('input', updateAnsweredCounter);
  });
}

function updateAnsweredCounter() {
  let count = 0;

  EXAM_MCQ.forEach((item) => {
    const checked = document.querySelector(`input[name="${item.id}"]:checked`);
    const card = document.getElementById(`card-${item.id}`);
    if (checked) {
      count++;
      card.classList.add('answered');
    } else {
      card.classList.remove('answered');
    }
  });

  EXAM_TF.forEach((item) => {
    const checked = document.querySelector(`input[name="${item.id}"]:checked`);
    const card = document.getElementById(`card-${item.id}`);
    if (checked) {
      count++;
      card.classList.add('answered');
    } else {
      card.classList.remove('answered');
    }
  });

  EXAM_MATCH.forEach((item) => {
    const sel = document.getElementById(`select-${item.id}`);
    const card = document.getElementById(`card-${item.id}`);
    if (sel && sel.value.trim() !== '') {
      count++;
      card.classList.add('answered');
    } else {
      card.classList.remove('answered');
    }
  });

  EXAM_SHORT.forEach((item) => {
    const inp = document.getElementById(`input-${item.id}`);
    const card = document.getElementById(`card-${item.id}`);
    if (inp && inp.value.trim() !== '') {
      count++;
      card.classList.add('answered');
    } else {
      card.classList.remove('answered');
    }
  });

  EXAM_ESSAY.forEach((item) => {
    const ta = document.getElementById(`textarea-${item.id}`);
    const card = document.getElementById(`card-${item.id}`);
    if (ta && ta.value.trim() !== '') {
      count++;
      card.classList.add('answered');
    } else {
      card.classList.remove('answered');
    }
  });

  document.getElementById('answered-count-text').textContent = `${count} / 45`;
}

function normalizeVietnameseText(str) {
  return (str || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function gradeAndSubmitExam() {
  let mcqScore = 0;
  let tfScore = 0;
  let matchScore = 0;
  let shortScore = 0;
  let essayScore = 0;

  const detailsRecord = {};
  const essaySummaries = [];

  // Hiển thị tất cả 5 phần để học sinh xem kết quả đối chiếu từng câu
  document.querySelectorAll('.exam-part-panel').forEach((p) => p.classList.remove('hidden'));
  document.querySelectorAll('.exam-part-tab').forEach((t) => {
    t.classList.toggle('active', t.getAttribute('data-part') === 'part-all');
  });

  // 1. Chấm Phần I: Nhiều lựa chọn (10 câu × 2đ)
  EXAM_MCQ.forEach((item) => {
    const checked = document.querySelector(`input[name="${item.id}"]:checked`);
    const fb = document.getElementById(`fb-${item.id}`);
    const userVal = checked ? Number(checked.value) : -1;
    const isCorrect = userVal === item.ans;

    if (isCorrect) {
      mcqScore += 2;
      fb.className = 'feedback-box show correct';
      fb.innerHTML = `🎉 <strong>Chính xác! (+2 điểm)</strong> — ${formatChemHTML(item.exp)}`;
    } else {
      fb.className = 'feedback-box show wrong';
      fb.innerHTML = `💡 <strong>Thử lại nhé! (0 điểm)</strong> Đáp án đúng là: <strong>${formatChemHTML(item.options[item.ans])}</strong>.<br/><em>Gợi ý SGK: ${formatChemHTML(item.exp)}</em>`;
    }
    detailsRecord[item.id] = { user: userVal, score: isCorrect ? 2 : 0 };
  });

  // 2. Chấm Phần II: Đúng / Sai (10 câu × 2đ)
  EXAM_TF.forEach((item) => {
    const checked = document.querySelector(`input[name="${item.id}"]:checked`);
    const fb = document.getElementById(`fb-${item.id}`);
    const userBool = checked ? checked.value === 'true' : null;
    const isCorrect = userBool === item.ans;

    if (isCorrect) {
      tfScore += 2;
      fb.className = 'feedback-box show correct';
      fb.innerHTML = `🎉 <strong>Tuyệt vời! Chính xác! (+2 điểm)</strong> — ${formatChemHTML(item.exp)}`;
    } else {
      fb.className = 'feedback-box show wrong';
      fb.innerHTML = `💡 <strong>Chưa chính xác! (0 điểm)</strong> Đáp án đúng là: <strong>${item.ans ? 'Đúng' : 'Sai'}</strong>.<br/><em>Giải thích: ${formatChemHTML(item.exp)}</em>`;
    }
    detailsRecord[item.id] = { user: userBool, score: isCorrect ? 2 : 0 };
  });

  // 3. Chấm Phần III: Ghép cột (10 câu × 2đ)
  EXAM_MATCH.forEach((item) => {
    const sel = document.getElementById(`select-${item.id}`);
    const fb = document.getElementById(`fb-${item.id}`);
    const userChoice = sel ? sel.value : '';
    const isCorrect = userChoice === item.ans;

    if (isCorrect) {
      matchScore += 2;
      fb.className = 'feedback-box show correct';
      fb.innerHTML = `🎉 <strong>Chính xác! (+2 điểm)</strong> — ${formatChemHTML(item.exp)}`;
    } else {
      fb.className = 'feedback-box show wrong';
      fb.innerHTML = `💡 <strong>Chưa đúng! (0 điểm)</strong> Ghép đúng phải là: <strong>"${formatChemHTML(item.ans)}"</strong>.<br/><em>Gợi ý: ${formatChemHTML(item.exp)}</em>`;
    }
    detailsRecord[item.id] = { user: userChoice, score: isCorrect ? 2 : 0 };
  });

  // 4. Chấm Phần IV: Trả lời ngắn (10 câu × 2đ)
  EXAM_SHORT.forEach((item) => {
    const inp = document.getElementById(`input-${item.id}`);
    const fb = document.getElementById(`fb-${item.id}`);
    const rawVal = inp ? inp.value.trim() : '';
    const normVal = normalizeVietnameseText(rawVal);
    const isCorrect = item.accepted.some((acc) => normalizeVietnameseText(acc) === normVal);

    if (isCorrect) {
      shortScore += 2;
      fb.className = 'feedback-box show correct';
      fb.innerHTML = `🎉 <strong>Chính xác! (+2 điểm)</strong> Đáp án chuẩn: <strong>${formatChemHTML(item.displayAns)}</strong> — ${formatChemHTML(item.exp)}`;
    } else {
      fb.className = 'feedback-box show wrong';
      fb.innerHTML = `💡 <strong>Thử lại nhé! (0 điểm)</strong> Đáp án chuẩn là: <strong>${formatChemHTML(item.displayAns)}</strong>.<br/><em>Gợi ý SGK: ${formatChemHTML(item.exp)}</em>`;
    }
    detailsRecord[item.id] = { user: rawVal, score: isCorrect ? 2 : 0 };
  });

  // 5. Chấm Phần V: Tự luận (5 câu × 4đ = 20đ theo Rubric từ khóa)
  EXAM_ESSAY.forEach((item, idx) => {
    const ta = document.getElementById(`textarea-${item.id}`);
    const fb = document.getElementById(`fb-${item.id}`);
    const rawEssay = ta ? ta.value.trim() : '';
    const normEssay = normalizeVietnameseText(rawEssay);

    let qPoints = 0;
    const matchedCriteria = [];
    const missedCriteria = [];

    if (normEssay.length >= 8) {
      item.rubrics.forEach((rubric) => {
        const hit = rubric.keywords.some((kw) => normEssay.includes(normalizeVietnameseText(kw)));
        if (hit) {
          qPoints += 1;
          matchedCriteria.push(formatChemHTML(rubric.desc));
        } else {
          missedCriteria.push(formatChemHTML(rubric.desc));
        }
      });
    } else {
      item.rubrics.forEach((r) => missedCriteria.push(formatChemHTML(r.desc)));
    }

    essayScore += qPoints;
    essaySummaries.push(`Câu ${idx + 1} (${qPoints}/4đ): ${rawEssay || '[Trống]'}`);
    detailsRecord[item.id] = { user: rawEssay, score: qPoints };

    const isFull = qPoints === 4;
    fb.className = `feedback-box show ${qPoints >= 2 ? 'correct' : 'wrong'}`;
    fb.innerHTML = `
      <div><strong>${isFull ? '🌟 Tuyệt vời!' : '📝 Đánh giá Tự luận:'} Đạt ${qPoints} / 4 điểm</strong></div>
      ${matchedCriteria.length ? `<div style="margin-top:4px;">✅ <strong>Ý đúng đã nêu được:</strong> ${matchedCriteria.join('; ')}.</div>` : ''}
      ${missedCriteria.length ? `<div style="margin-top:4px;">💡 <strong>Ý cần bổ sung thêm:</strong> ${missedCriteria.join('; ')}.</div>` : ''}
      <div style="margin-top:8px; padding-top:6px; border-top:1px dashed currentColor;">
        <strong>📘 Đáp án chuẩn SGK:</strong> ${formatChemHTML(item.modelAnswer)}
      </div>
    `;
  });

  const totalScore = mcqScore + tfScore + matchScore + shortScore + essayScore;
  const durationSeconds = Math.round((Date.now() - state.examStartTime) / 1000);

  let badgeTitle = '💪 CỐ GẮNG HƠN NHÉ! HÃY ÔN LẠI CÁC MÔ HÌNH ELECTRON';
  let encouragement = 'Em hãy xem kỹ phần giải thích từng câu ở trên và thử sức lại để đạt điểm tối đa nhé!';

  if (totalScore >= 90) {
    badgeTitle = '🏆 NHÀ KHOA HỌC NGUYÊN TỬ XUẤT SẮC!';
    encouragement = 'Tuyệt vời! Em đã nắm vững toàn diện kiến thức Bài 6 về khí hiếm, liên kết ion và liên kết cộng hóa trị!';
  } else if (totalScore >= 75) {
    badgeTitle = '🥇 CHUYÊN GIA LIÊN KẾT HÓA HỌC!';
    encouragement = 'Rất đáng khen! Em hiểu bài rất chắc chắn, chỉ cần lưu ý thêm vài chi tiết nhỏ để đạt 100/100 điểm!';
  } else if (totalScore >= 50) {
    badgeTitle = '🥈 NHÀ KHÁM PHÁ TIỀM NĂNG!';
    encouragement = 'Em đã nắm được các kiến thức cơ bản! Hãy xem lại gợi ý ở các câu sai để bứt phá hơn nhé!';
  }

  // Hiển thị bảng điểm tổng kết
  document.getElementById('result-badge-title').textContent = badgeTitle;
  document.getElementById('result-student-info').textContent = `Học sinh: ${state.studentName} | Lớp: ${state.studentClass} | Thời gian làm bài: ${durationSeconds} giây`;
  document.getElementById('result-total-score').textContent = totalScore;
  document.getElementById('score-part1').textContent = `${mcqScore} / 20`;
  document.getElementById('score-part2').textContent = `${tfScore} / 20`;
  document.getElementById('score-part3').textContent = `${matchScore} / 20`;
  document.getElementById('score-part4').textContent = `${shortScore} / 20`;
  document.getElementById('score-part5').textContent = `${essayScore} / 20`;
  document.getElementById('result-encouragement').textContent = encouragement;

  const resultPanel = document.getElementById('exam-result-panel');
  resultPanel.classList.remove('hidden');
  document.getElementById('retry-exam-btn').classList.remove('hidden');
  resultPanel.scrollIntoView({ behavior: 'smooth' });

  markMilestone('exam_submitted', 30);

  // Đồng bộ kết quả lên Google Apps Script
  sendResultsToGoogleSheets({
    studentName: state.studentName,
    studentClass: state.studentClass,
    totalScore,
    badgeTitle,
    mcqScore,
    tfScore,
    matchScore,
    shortScore,
    essayScore,
    durationSeconds,
    essaySummary: essaySummaries.join(' | '),
    detailsJson: JSON.stringify(detailsRecord)
  });
}

/* ==========================================================================
   11. KẾT NỐI GOOGLE APPS SCRIPT (GOOGLE SHEETS)
   ========================================================================== */
async function sendResultsToGoogleSheets(payload) {
  const statusEl = document.getElementById('gas-sync-status');
  const gasUrl = (localStorage.getItem(STORAGE_KEYS.GAS_URL) || DEFAULT_GAS_WEB_APP_URL).trim();

  if (!gasUrl) {
    statusEl.style.color = '#B45309';
    statusEl.innerHTML = 'ℹ️ Đã chấm điểm hoàn tất! (Để tự động lưu bảng điểm lên Google Sheets, hãy nhấn nút <strong>"⚙️ Google Sheet"</strong> ở thanh trên cùng để dán Web App URL).';
    return;
  }

  statusEl.style.color = '#0284C7';
  statusEl.textContent = '⏳ Đang đồng bộ điểm số và bài làm lên Google Sheets của Giáo viên...';

  try {
    await fetch(gasUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    statusEl.style.color = '#059669';
    statusEl.innerHTML = `✅ Đã gửi điểm số (<strong>${payload.totalScore}/100 điểm</strong>) của học sinh <strong>${payload.studentName} (${payload.studentClass})</strong> lên Google Sheets thành công!`;
  } catch (err) {
    statusEl.style.color = '#DC2626';
    statusEl.innerHTML = `⚠️ Không thể kết nối tới Google Apps Script URL. Vui lòng kiểm tra lại đường dẫn trong mục "⚙️ Google Sheet".`;
  }
}

function initGasModal() {
  const modal = document.getElementById('gas-modal');
  const openBtn = document.getElementById('open-gas-modal-btn');
  const closeBtn = document.getElementById('close-gas-modal-btn');
  const saveBtn = document.getElementById('save-gas-url-btn');
  const copyCodeBtn = document.getElementById('copy-gas-code-btn');
  const urlInput = document.getElementById('gas-url-input');
  const feedback = document.getElementById('gas-save-feedback');

  urlInput.value = localStorage.getItem(STORAGE_KEYS.GAS_URL) || DEFAULT_GAS_WEB_APP_URL;

  openBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  saveBtn.addEventListener('click', () => {
    const val = urlInput.value.trim();
    localStorage.setItem(STORAGE_KEYS.GAS_URL, val);
    feedback.className = 'feedback-box show correct';
    feedback.textContent = val
      ? '✅ Đã lưu đường dẫn Google Apps Script Web App URL thành công!'
      : 'ℹ️ Đã xóa URL kết nối Google Apps Script.';
  });

  copyCodeBtn.addEventListener('click', async () => {
    const sampleGasCode = `const SHEET_NAME = 'KetQua_Bai6_KHTN7';
function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Thời gian nộp','Họ và tên học sinh','Lớp','Tổng điểm (/100)','Danh hiệu','Điểm TN Nhiều lựa chọn (/20)','Điểm TN Đúng/Sai (/20)','Điểm TN Ghép cột (/20)','Điểm TN Trả lời ngắn (/20)','Điểm Tự luận (/20)','Thời gian làm (giây)','Bài làm Tự luận']);
  }
  const data = JSON.parse(e.postData.contents);
  const time = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss');
  sheet.appendRow([time, data.studentName, data.studentClass, data.totalScore, data.badgeTitle, data.mcqScore, data.tfScore, data.matchScore, data.shortScore, data.essayScore, data.durationSeconds, data.essaySummary]);
  return ContentService.createTextOutput(JSON.stringify({status:'success'})).setMimeType(ContentService.MimeType.JSON);
}`;
    try {
      await navigator.clipboard.writeText(sampleGasCode);
      feedback.className = 'feedback-box show correct';
      feedback.textContent = '📋 Đã sao chép mã nguồn Google Apps Script (Code.gs) vào bộ nhớ tạm!';
    } catch (e) {
      feedback.className = 'feedback-box show wrong';
      feedback.textContent = 'Bạn có thể mở trực tiếp tệp google-apps-script/Code.gs trong thư mục dự án để sao chép.';
    }
  });
}

function initScrollSpy() {
  const navLinks = document.querySelectorAll('.nav-tab');
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.forEach((l) => l.classList.remove('active'));
      link.classList.add('active');
      const secId = link.getAttribute('data-sec');
      const targetSec = secId ? document.getElementById(secId) : null;
      if (targetSec) {
        targetSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}
