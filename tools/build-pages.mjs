// Generates the inner pages (shared <head>, header/footer placeholders). Run: node tools/build-pages.mjs
import { writeFileSync } from 'node:fs';

const shell = (file, title, desc, page, body) =>
  writeFileSync(
    new URL(`../${file}`, import.meta.url),
    `<!doctype html>
<html lang="th">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title} — STAGECRAFT</title>
    <meta name="description" content="${desc}" />
    <link rel="icon" href="img/logo/favicon.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500&family=Prompt:wght@300;400&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="css/style.css" />
  </head>
  <body data-page="${page}">
    <div data-header></div>
    <main>
${body}
    </main>
    <div data-footer></div>
    <script type="module" src="js/app.js"></script>
  </body>
</html>
`,
  );

const hero = (eyebrow, l1, l2, lead) => `      <section class="page-hero">
        <div class="wrap">
          <span class="eyebrow reveal">${eyebrow}</span>
          <h1 class="display reveal">${l1} ${l2}</h1>
          <p class="lead one-line reveal">${lead}</p>
        </div>
      </section>`;

const icon = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}" /></svg>`;

shell(
  'works.html',
  'ผลงาน',
  'ผลงานเวที แสง สี เสียง และจอ LED ของ STAGECRAFT',
  'works',
  `${hero('Selected works', 'Shows we', 'built.', 'งานที่เราดูแลตั้งแต่ติดตั้งจนรื้อถอน กดที่งานเพื่อดูภาพทุกมุมและงบประมาณ')}
      <section class="section" style="padding-top: 0">
        <div class="wrap">
          <div class="chips reveal" data-chips role="group" aria-label="ประเภทงาน"></div>
          <div class="works" data-works></div>
        </div>
      </section>
      <section class="section" style="padding-top: 0">
        <div class="wrap">
          <div class="cta-band reveal">
            <img src="img/photos/blaze.webp" alt="" loading="lazy" />
            <div>
              <span class="eyebrow">Next on stage</span>
              <h2 class="h2">Your event is next.</h2>
              <p class="lead one-line">ส่งรายละเอียดงาน รับแบบเวทีพร้อมราคาภายใน 3 วัน</p>
              <a class="btn" href="contact.html">ขอใบเสนอราคา</a>
            </div>
          </div>
        </div>
      </section>`,
);

shell(
  'services.html',
  'บริการ',
  'บริการเวที โครงทรัส ระบบแสง ระบบเสียง จอ LED บูธ และจัดทั้งงาน',
  'services',
  `${hero('Services', 'One crew,', 'the whole show.', 'เลือกเฉพาะส่วนที่ต้องการ หรือให้เราดูแลทั้งงาน')}
      <section class="section" style="padding-top: 0">
        <div class="wrap"><div class="svc-list" data-services></div></div>
      </section>
      <section class="section" style="padding-top: 0">
        <div class="wrap">
          <div class="section-head reveal">
            <div><span class="eyebrow">How we work</span><h2 class="h2">From brief to bump-out.</h2></div>
            <a class="btn btn-ghost" href="contact.html">เริ่มคุยงาน</a>
          </div>
          <div class="process stagger" data-process></div>
        </div>
      </section>`,
);

const check = (v, l) => `<label><input type="checkbox" name="svc" value="${v}" /><span>${l}</span></label>`;
shell(
  'contact.html',
  'ขอใบเสนอราคา',
  'ขอใบเสนอราคาเวที แสง สี เสียง และจอ LED จาก STAGECRAFT',
  'contact',
  `${hero('Get a quote', 'Tell us', 'the date.', 'กรอกเท่าที่รู้ก็พอ ทีมงานโทรกลับภายใน 1 วันทำการ')}
      <section class="section" style="padding-top: 0">
        <div class="wrap contact-grid">
          <form class="form reveal" data-quote novalidate>
            <label class="field"><span>ชื่อผู้ติดต่อ</span><input name="name" autocomplete="name" /></label>
            <label class="field"><span>เบอร์โทร</span><input name="tel" type="tel" autocomplete="tel" /></label>
            <label class="field"><span>วันงาน</span><input name="date" type="date" /></label>
            <label class="field"><span>ประเภทงาน</span>
              <select name="type"><option>คอนเสิร์ต / เฟสติวัล</option><option>สัมมนา / งานองค์กร</option><option>บูธ / นิทรรศการ</option><option>งานเลี้ยง / กาล่า</option><option>อื่น ๆ</option></select>
            </label>
            <label class="field"><span>สถานที่</span><input name="venue" placeholder="เช่น ฮอลล์ในห้าง ลานกลางแจ้ง" /></label>
            <label class="field"><span>จำนวนแขกโดยประมาณ</span>
              <select name="guests"><option>ไม่เกิน 200 คน</option><option>200 – 1,000 คน</option><option>1,000 – 5,000 คน</option><option>มากกว่า 5,000 คน</option></select>
            </label>
            <fieldset class="field full" style="border: 0; padding: 0; margin: 0">
              <span>ต้องการอะไรบ้าง</span>
              <div class="checks">${[['stage', 'เวที / ทรัส'], ['light', 'แสง'], ['sound', 'เสียง'], ['led', 'จอ LED'], ['booth', 'บูธ'], ['full', 'จัดทั้งงาน']].map(([v, l]) => check(v, l)).join('')}</div>
            </fieldset>
            <label class="field full"><span>รายละเอียดเพิ่มเติม</span><textarea name="note" placeholder="ลำดับพิธี ศิลปิน ขนาดพื้นที่ หรือภาพตัวอย่างที่ชอบ"></textarea></label>
            <button class="btn" type="submit">ส่งคำขอใบเสนอราคา ${icon('M5 12h14M13 6l6 6-6 6')}</button>
            <p class="form-done" tabindex="-1" role="status">ได้รับคำขอแล้ว ทีมงานจะติดต่อกลับภายใน 1 วันทำการ (เว็บตัวอย่าง ยังไม่ส่งข้อมูลจริง)</p>
          </form>
          <div class="info reveal">
            <div class="info-row"><span>โทร</span><b>02 000 0000</b></div>
            <div class="info-row"><span>LINE</span><b>@stagecraft</b></div>
            <div class="info-row"><span>อีเมล</span><b>hello@stagecraft.example</b></div>
            <div class="info-row"><span>เวลาทำการ</span><b>ทุกวัน 09:00 – 20:00</b></div>
            <div class="info-row"><span>พื้นที่รับงาน</span><b>กรุงเทพฯ ปริมณฑล และทั่วประเทศ</b></div>
          </div>
        </div>
      </section>`,
);

shell(
  'credits.html',
  'เครดิตภาพ',
  'เครดิตภาพประกอบเว็บไซต์ตัวอย่าง STAGECRAFT',
  'credits',
  `${hero('Credits', 'Photo', 'credits.', 'ภาพทั้งหมดจาก Unsplash ใช้ภายใต้ Unsplash License ขอบคุณช่างภาพทุกท่าน')}
      <section class="section" style="padding-top: 0">
        <div class="wrap"><ul class="credits" data-credits></ul></div>
      </section>`,
);
shell(
  'work.html',
  'ผลงาน',
  'รายละเอียดผลงาน ภาพทุกมุม อุปกรณ์ที่ใช้ และงบประมาณ',
  'work',
  `      <section class="work-page">
        <div class="wrap" data-work></div>
      </section>
      <section class="section" style="padding-top: 0">
        <div class="wrap">
          <div class="section-head reveal">
            <div><span class="eyebrow">More shows</span><h2 class="h2">Similar works.</h2></div>
            <a class="btn btn-ghost" href="works.html">ผลงานทั้งหมด</a>
          </div>
          <div class="works works-3" data-similar></div>
        </div>
      </section>
      <div class="lightbox" data-lightbox role="dialog" aria-modal="true" aria-label="ภาพผลงาน">
        <button class="lb-btn lb-close" type="button" aria-label="ปิด">${icon('M6 6l12 12M18 6 6 18')}</button>
        <button class="lb-btn lb-prev" type="button" aria-label="ภาพก่อนหน้า">${icon('M15 6l-6 6 6 6')}</button>
        <button class="lb-btn lb-next" type="button" aria-label="ภาพถัดไป">${icon('M9 6l6 6-6 6')}</button>
        <figure><img src="" alt="" /><figcaption></figcaption></figure>
      </div>`,
);
console.log('pages written');
