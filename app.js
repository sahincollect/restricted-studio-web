/**
 * Restricted Studio — Apple-Inspired Minimalist Light Web Platform
 * Interactive Hero Graphics, Mobile Navigation & Code Preview Engine
 */

const STUDIO_LINKS = {
  itemsatis: 'https://www.itemsatis.com/p/saintstudio',
  discord: 'https://discord.gg/eVcN3D5va'
};

document.addEventListener('DOMContentLoaded', () => {
  initExternalLinks();
  initMobileNav();
  initHeroChartStage();
  initCodePreview();
  initFaq();
});

function initExternalLinks() {
  document.querySelectorAll('[data-link="itemsatis"]').forEach((el) => {
    el.setAttribute('href', STUDIO_LINKS.itemsatis);
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener noreferrer');
  });

  document.querySelectorAll('[data-link="discord"]').forEach((el) => {
    el.setAttribute('href', STUDIO_LINKS.discord);
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener noreferrer');
  });
}

function initMobileNav() {
  const toggle = document.getElementById('mobileToggle');
  const menu = document.getElementById('navMenu');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.classList.toggle('active', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function initHeroChartStage() {
  const buttons = document.querySelectorAll('.sfw-btn');
  const fwLabel = document.getElementById('heroChartFwLabel');
  const metricBridge = document.getElementById('heroMetricBridge');
  const metricSql = document.getElementById('heroMetricSql');
  const metricRam = document.getElementById('heroMetricRam');
  const dynamicLine = document.getElementById('heroDynamicLine');
  const dynamicArea = document.getElementById('heroDynamicArea');
  const gaugeCircle = document.getElementById('heroGaugeCircle');
  const gaugeVal = document.getElementById('heroGaugeVal');

  const STAGE_DATA = {
    qb: {
      name: 'QB-Core',
      bridge: 'QBCore.Functions',
      sql: '0.42 ms (oxmysql)',
      ram: '14.2 MB Stabil',
      gaugeText: '%99',
      gaugeOffset: '18',
      line: 'M45 171 C 140 171, 230 165, 330 170 C 430 171, 520 168, 620 171',
      area: 'M45 171 C 140 171, 230 165, 330 170 C 430 171, 520 168, 620 171 L 620 175 L 45 175 Z'
    },
    qbox: {
      name: 'Qbox',
      bridge: 'exports.qbx_core',
      sql: '0.35 ms (StateBag)',
      ram: '11.8 MB Stabil',
      gaugeText: '%100',
      gaugeOffset: '6',
      line: 'M45 172 C 140 172, 230 170, 330 172 C 430 172, 520 171, 620 172',
      area: 'M45 172 C 140 172, 230 170, 330 172 C 430 172, 520 171, 620 172 L 620 175 L 45 175 Z'
    },
    esx: {
      name: 'ESX Legacy',
      bridge: 'ESX.GetExtendedPlayers',
      sql: '0.46 ms (oxmysql)',
      ram: '13.6 MB Stabil',
      gaugeText: '%99',
      gaugeOffset: '15',
      line: 'M45 170 C 140 168, 230 171, 330 169 C 430 170, 520 167, 620 170',
      area: 'M45 170 C 140 168, 230 171, 330 169 C 430 170, 520 167, 620 170 L 620 175 L 45 175 Z'
    }
  };

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-fw');
      const d = STAGE_DATA[key];
      if (!d) return;

      buttons.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      if (fwLabel) fwLabel.textContent = d.name;
      if (metricBridge) metricBridge.textContent = d.bridge;
      if (metricSql) metricSql.textContent = d.sql;
      if (metricRam) metricRam.textContent = d.ram;
      if (dynamicLine) dynamicLine.setAttribute('d', d.line);
      if (dynamicArea) dynamicArea.setAttribute('d', d.area);
      if (gaugeCircle) gaugeCircle.setAttribute('stroke-dashoffset', d.gaugeOffset);
      if (gaugeVal) gaugeVal.textContent = d.gaugeText;
    });
  });
}

function initCodePreview() {
  const tabs = document.querySelectorAll('.ccc-tab');
  const codeBox = document.getElementById('codePreviewBox');

  if (!codeBox) return;

  const SNIPPETS = {
    bridge: `<span class="c-comment">-- QB-Core, Qbox ve ESX Otomatik Algılama Köprüsü</span>
<span class="c-kw">local</span> Bridge = {}

<span class="c-kw">function</span> Bridge.<span class="c-fn">GetFramework</span>()
    <span class="c-kw">if</span> <span class="c-fn">GetResourceState</span>(<span class="c-str">"qbx_core"</span>) == <span class="c-str">"started"</span> <span class="c-kw">then</span>
        <span class="c-kw">return</span> <span class="c-str">"qbox"</span>
    <span class="c-kw">elseif</span> <span class="c-fn">GetResourceState</span>(<span class="c-str">"qb-core"</span>) == <span class="c-str">"started"</span> <span class="c-kw">then</span>
        <span class="c-kw">return</span> <span class="c-str">"qbcore"</span>
    <span class="c-kw">elseif</span> <span class="c-fn">GetResourceState</span>(<span class="c-str">"es_extended"</span>) == <span class="c-str">"started"</span> <span class="c-kw">then</span>
        <span class="c-kw">return</span> <span class="c-str">"esx"</span>
    <span class="c-kw">end</span>
<span class="c-kw">end</span>

<span class="c-kw">return</span> Bridge`,

    security: `<span class="c-comment">-- Sunucu Taraflı Mesafe ve Güvenlik Doğrulaması</span>
<span class="c-kw">local function</span> <span class="c-fn">VerifyPlayerAction</span>(source, targetCoords)
    <span class="c-kw">local</span> ped = <span class="c-fn">GetPlayerPed</span>(source)
    <span class="c-kw">if not</span> <span class="c-fn">DoesEntityExist</span>(ped) <span class="c-kw">then return false end</span>

    <span class="c-kw">local</span> dist = #(<span class="c-fn">GetEntityCoords</span>(ped) - targetCoords)
    <span class="c-kw">if</span> dist &gt; 3.5 <span class="c-kw">then</span>
        <span class="c-kw">return false</span>
    <span class="c-kw">end</span>

    <span class="c-kw">return true</span>
<span class="c-kw">end</span>`,

    database: `<span class="c-comment">-- İndekslenmiş MariaDB Veri Tablosu Yapısı</span>
<span class="c-kw">CREATE TABLE IF NOT EXISTS</span> <span class="c-str">\`restricted_records\`</span> (
    <span class="c-str">\`id\`</span> <span class="c-kw">INT UNSIGNED AUTO_INCREMENT PRIMARY KEY</span>,
    <span class="c-str">\`citizenid\`</span> <span class="c-kw">VARCHAR</span>(50) <span class="c-kw">NOT NULL</span>,
    <span class="c-str">\`data\`</span> <span class="c-kw">LONGTEXT NOT NULL</span>,
    <span class="c-kw">INDEX</span> <span class="c-str">\`idx_citizen\`</span> (<span class="c-str">\`citizenid\`</span>)
) <span class="c-kw">ENGINE</span>=InnoDB <span class="c-kw">DEFAULT CHARSET</span>=utf8mb4;`
  };

  codeBox.innerHTML = SNIPPETS.bridge;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const key = tab.getAttribute('data-tab');
      if (!SNIPPETS[key]) return;

      tabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      codeBox.innerHTML = SNIPPETS[key];
    });
  });
}

function initFaq() {
  const items = document.querySelectorAll('.afaq-item');

  items.forEach((item) => {
    const trigger = item.querySelector('.afaq-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      items.forEach((other) => {
        other.classList.remove('active');
        const btn = other.querySelector('.afaq-trigger');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
}
