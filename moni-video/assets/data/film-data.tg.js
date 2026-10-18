/* Тоҷикӣ — the Tajik film's words. Moní's own answers were captured on tajiklaw.ai/trial/tj (Pro), 17 Oct 2026:
   the probation answer and the limitation-period answer are Moní's Tajik output; the calculation and the contract
   review are Moní's results rendered in Tajik (the site returned them in Russian / the review timed out — see README). */
window.FILM = {
  lang: 'tg',
  hookFragments: [
    ['КОДЕКСИ ГРАЖДАНИИ ҶУМҲУРИИ ТОҶИКИСТОН', 'caps'],
    ['Моддаи 214', 'serif'],
    ['КОДЕКСИ МЕҲНАТ', 'caps'],
    ['Моддаи 28. Санҷиш ҳангоми ба кор қабул кардан', ''],
    ['Кодекси андози Ҷумҳурии Тоҷикистон', 'serif goldtxt'],
    ['Моддаи 183', 'serif'],
    ['КОДЕКСИ АНДОЗ', 'caps'],
    ['Моддаи 332. Андози иҷтимоӣ', 'serif'],
    ['КОДЕКСИ ГУМРУК', 'caps'],
    ['Қонун «Дар бораи бақайдгирии давлатии шахсони ҳуқуқӣ»', ''],
    ['Моддаи 680. Ҳаққи иҷора', ''],
    ['КОДЕКСИ ЗАМИН', 'caps'],
    ['Моддаи 718', 'serif goldtxt'],
    ['Кодекси меҳнати Ҷумҳурии Тоҷикистон', 'serif'],
    ['КОДЕКСИ ОИЛА', 'caps'],
    ['Моддаи 384. Кам кардани ноустуворона', ''],
    ['КОДЕКСИ МАНЗИЛ', 'caps'],
    ['Қонун «Дар бораи иҷозатномадиҳӣ»', ''],
    ['Моддаи 687', 'serif'],
    ['КОДЕКСИ ҲУҚУҚВАЙРОНКУНИИ МАЪМУРӢ', 'caps'],
    ['Моддаи 191', 'serif goldtxt'],
    ['Моддаи 516', 'serif'],
    ['Қонун «Дар бораи ҷамъиятҳои дорои масъулияти маҳдуд»', ''],
    ['Моддаи 683. Таъмири асосӣ', ''],
    ['КОДЕКСИ ҶИНОЯТӢ', 'caps'],
    ['Моддаи 94', 'serif'],
    ['Қонун «Дар бораи истеҳсолоти иҷро»', 'serif'],
    ['КОДЕКСИ МУРОФИАВИИ ГРАЖДАНӢ', 'caps']
  ],

  ask: {
    question: 'Оё корфармо метавонад кормандро дар давраи санҷиш тибқи Кодекси меҳнати Ҷумҳурии Тоҷикистон аз кор озод кунад?'
  },

  /* the three languages the film names; a dashed chip says any other works too (the film names no total) */
  languages: ['Тоҷикӣ', 'Англисӣ', 'Русӣ'],
  spoken: 'Тоҷикӣ',   // the voice question below is asked in Tajik
  /* Moní's Tajik answer to the limitation-period question (tajiklaw.ai/trial/tj) */
  voice: {
    q: 'Мӯҳлати умумии даъво тибқи Кодекси граждании Ҷумҳурии Тоҷикистон чанд сол аст?',
    a: '<strong>Мӯҳлати умумии даъво се сол муқаррар шудааст (КГ ҶТ, моддаи 214).</strong> Баъзе талабҳо ба мӯҳлати даъво тобеъ нестанд (КГ ҶТ, моддаи 224).'
  },

  lease: {
    file: 'Шартномаи_иҷора_14-26.docx',
    title: 'ШАРТНОМАИ ИҶОРА № 14/26',
    paras: [
      { t: 'ш. Душанбе, Ҷумҳурии Тоҷикистон · 1 октябри соли 2026', cls: 'dv-p-center' },
      { t: 'ҶДММ «Сомон Сити Плаза» («Иҷорадиҳанда») ва ҶДММ «Помир Трейд» («Иҷорагир») ин Шартномаро дар бораи зайл бастанд:' },
      { t: '1.2. Мӯҳлати иҷора 5 (панҷ) сол аз санаи имзои ҳамин Шартнома мебошад.' },
      { id: 'c22', t: '2.2. Иҷорадиҳанда ҳуқуқ дорад ҳаққи иҷораро дар ҳар вақт бе розигии Иҷорагир бо огоҳии 3 (се) рӯза яктарафа тағйир диҳад.' },
      { t: '2.3. Иҷорагир маблағи кафолатиро ба андозаи ҳаққи иҷораи 3 (се) моҳ месупорад.' },
      { id: 'c31', t: '3.1. Иҷорагир ҳамаи таъмири асосии Биноро, аз ҷумла таъмири бом ва шабакаҳои муҳандисӣ, аз ҳисоби худ анҷом медиҳад.' },
      { id: 'c41', t: '4.1. Барои дер пардохт кардани ҳаққи иҷора Иҷорагир барои ҳар рӯзи таъхир ҷаримаи 5%-и маблағи саривақт пардохтнашударо месупорад.' },
      { id: 'c51', t: '5.1. Иҷорадиҳанда ҳуқуқ дорад ин Шартномаро дар ҳар вақт бе нишон додани сабаб яктарафа бекор кунад.' },
      { id: 'c61', t: '6.1. Ин Шартнома аз лаҳзаи имзо эътибор пайдо мекунад ва ба бақайдгирии давлатӣ тобеъ нест.' },
      { t: '6.3. Масъалаҳое, ки дар ин Шартнома пешбинӣ нашудаанд, бо қонунгузории Ҷумҳурии Тоҷикистон танзим карда мешаванд.' }
    ]
  },

  /* category -> site's own review-card category classes (upload.js CAT table) */
  findings: [
    { clause: 'б. 2.2', para: 'c22', cat: 'red', catLabel: 'Хилофи қонун', sev: 'high',
      issue: 'Ҳаққи иҷораро яктарафа тағйир додан мумкин нест — танҳо бо созиши тарафҳо ва на бештар аз як маротиба дар як сол.',
      law: 'КГ ҶТ, қисми 5 моддаи 680',
      del: 'Иҷорадиҳанда ҳуқуқ дорад ҳаққи иҷораро дар ҳар вақт бе розигии Иҷорагир бо огоҳии 3 (се) рӯза яктарафа тағйир диҳад.',
      ins: 'Ҳаққи иҷора бо созиши Тарафҳо, на бештар аз як маротиба дар як сол, тағйир дода мешавад.' },
    { clause: 'б. 6.1', para: 'c61', cat: 'red', catLabel: 'Хилофи қонун', sev: 'high',
      issue: 'Иҷораи бино ба мӯҳлати як сол ва зиёда бояд ба қайди давлатӣ гирифта шавад ва танҳо аз лаҳзаи бақайдгирӣ басташуда ҳисобида мешавад.',
      law: 'КГ ҶТ, қисми 3 моддаи 718',
      del: 'ба бақайдгирии давлатӣ тобеъ нест.',
      ins: 'ба бақайдгирии давлатӣ тобеъ аст ва аз лаҳзаи бақайдгирӣ басташуда ҳисобида мешавад.' },
    { clause: 'б. 5.1', para: 'c51', cat: 'red', catLabel: 'Хилофи қонун', sev: 'high',
      issue: 'Иҷорадиҳанда шартномаро пеш аз мӯҳлат танҳо тавассути суд ва бо асосҳои моддаи 687 бекор карда метавонад — на «бе нишон додани сабаб».',
      law: 'КГ ҶТ, моддаҳои 687, 516',
      del: 'ин Шартномаро дар ҳар вақт бе нишон додани сабаб яктарафа бекор кунад.',
      ins: 'бекор кардани пеш аз мӯҳлати ин Шартномаро тавассути суд бо асосҳои моддаи 687 Кодекси граждании ҶТ талаб кунад.' },
    { clause: 'б. 3.1', para: 'c31', cat: 'amber', catLabel: 'Шарти номусоид', sev: 'med',
      issue: 'Ба таври умумӣ таъмири асосӣ уҳдадории иҷорадиҳанда аст ва аз ҳисоби ӯ анҷом дода мешавад.',
      law: 'КГ ҶТ, қисми 1 моддаи 683',
      del: 'Иҷорагир ҳамаи таъмири асосии Биноро',
      ins: 'Иҷорадиҳанда таъмири асосии Биноро' },
    { clause: 'б. 4.1', para: 'c41', cat: 'amber', catLabel: 'Хатар', sev: 'med',
      issue: 'Ноустуворонае, ки ба оқибатҳои вайронкунӣ ошкоро номутаносиб аст, бо дархости қарздор аз ҷониби суд кам карда мешавад.',
      law: 'КГ ҶТ, қисми 1 моддаи 384',
      del: 'ҷаримаи 5%-и маблағи саривақт пардохтнашударо месупорад.',
      ins: 'ҷаримаи 0,1%-и маблағи саривақт пардохтнашударо, вале на бештар аз 10%, месупорад.' }
  ],

  /* Calculator: the Pro panel captured on tajiklaw.ai/trial/tj (17 calculation types) and Moní's real Income Tax
     calculation for 8 000 TJS/month (the site returned it in Russian; shown here in Tajik). */
  calc: {
    types: ["Андоз аз даромад", "Андоз аз даромади ғайрирезидент", "ААИ", "Андоз аз фоида", "Андози иҷтимоӣ", "Андози соддакардашуда", "Боҷи гумрукӣ", "Хироҷот ва пардохтҳо", "Литсензияҳо ва иҷозатномаҳо", "Боҷи давлатӣ", "Кӯмакпулии ҳомиладорӣ", "Маош ва пешпардохт", "Пули рухсатӣ", "Варақаи беморӣ", "Ҳисоби ниҳоӣ ҳангоми озодшавӣ", "Хароҷоти сафари хизматӣ", "Ҷарима"],
    panel: "<div class=\"calc-panel show\" id=\"calcPanel\"> <div class=\"calc-header\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"4\" y=\"2\" width=\"16\" height=\"20\" rx=\"2\"></rect><line x1=\"8\" y1=\"6\" x2=\"16\" y2=\"6\"></line></svg> <span>Ҳисобкунак</span></div> <div class=\"calc-group\"><label>Навъи ҳисобкунӣ</label><select class=\"calc-select\" id=\"calcType\"><option value=\"income\">Андоз аз даромад</option><option value=\"nonresident\">Андоз аз даромади ғайрирезидент</option><option value=\"vat\">ААИ</option><option value=\"profit\">Андоз аз фоида</option><option value=\"social\">Андози иҷтимоӣ</option><option value=\"simplified\">Андози соддакардашуда</option><option value=\"customs\">Боҷи гумрукӣ</option><option value=\"fees\">Хироҷот ва пардохтҳо</option><option value=\"permits\">Литсензияҳо ва иҷозатномаҳо</option><option value=\"duty\">Боҷи давлатӣ</option><option value=\"maternity\">Кӯмакпулии ҳомиладорӣ</option><option value=\"salary_adv\">Маош ва пешпардохт</option><option value=\"vacation\">Пули рухсатӣ</option><option value=\"sick\">Варақаи беморӣ</option><option value=\"dismissal\">Ҳисоби ниҳоӣ ҳангоми озодшавӣ</option><option value=\"trip\">Хароҷоти сафари хизматӣ</option><option value=\"penalty\">Ҷарима</option></select></div> <div id=\"calcFields\"><div class=\"calc-group\"><label>Даромади моҳона (TJS)</label><input class=\"calc-input\" id=\"cIncome\" type=\"number\" placeholder=\"5000\" style=\"\"></div><div class=\"calc-group\"><label>Давра</label><select class=\"calc-select\" id=\"cPeriod\"><option value=\"month\">Моҳ</option><option value=\"quarter\">Семоҳа</option><option value=\"year\">Сол</option></select></div><div class=\"calc-group\"><label>Мақом</label><select class=\"calc-select\" id=\"cStatus\"><option value=\"resident\">Резидент</option><option value=\"nonresident\">Ғайрирезидент</option></select></div><div class=\"calc-group\" id=\"mainPlaceGroup\" style=\"display: block;\"><label class=\"calc-check\"><input type=\"checkbox\" id=\"cMainPlace\" checked=\"\" style=\"\"><span>Ҷои кории асосӣ</span></label><div class=\"calc-hint\">Ба ставка таъсир мекунад: асосӣ — 12% (бо тарҳкунӣ), ғайриасосӣ — 15% (бе тарҳкунӣ)</div></div><div class=\"calc-group\" id=\"incomeOrgGroup\" style=\"display: block;\"><label>Навъи ташкилот</label><select class=\"calc-select\" id=\"cIncomeOrgType\"><option value=\"budget\">Буҷетӣ</option><option value=\"other\">Дигар</option></select></div><div class=\"calc-group\" id=\"countryGroup\" style=\"display:none\"><label>Кишвари иқомат</label><select class=\"calc-select\" id=\"cCountry\"><option value=\"none\">Мувофиқи КА ҶТ</option><option value=\"russia\">Русия</option><option value=\"kazakhstan\">Қазоқистон</option><option value=\"kyrgyzstan\">Қирғизистон</option><option value=\"belarus\">Беларус</option><option value=\"ukraine\">Украина</option><option value=\"moldova\">Молдова</option><option value=\"armenia\">Арманистон</option><option value=\"germany\">Олмон</option><option value=\"france\">Фаронса</option><option value=\"czech\">Чехия</option><option value=\"india\">Ҳиндустон</option><option value=\"kuwait\">Қувайт</option><option value=\"other\">Кишвари дигар...</option></select></div><div class=\"calc-group\" id=\"customCountryGroup\" style=\"display:none\"><label>Кишварро нишон диҳед</label><input class=\"calc-input\" id=\"cCustomCountry\" type=\"text\" placeholder=\"Масалан: Туркия\" style=\"\"></div><div class=\"calc-group\" id=\"deductionsGroup\" style=\"display: block;\"><label>Тарҳкуниҳо (TJS)</label><input class=\"calc-input\" id=\"cDeductions\" type=\"number\" value=\"0\" style=\"\"></div></div> <div class=\"calc-rates\" id=\"calcRates\" title=\"\">Нишондиҳандаи ҳисобӣ (НҲ) = 78 сомонӣ (2026)</div> <button class=\"calc-submit\">Ҳисоб кунед</button> </div>",
    question: 'Ҳисоб: Андоз аз даромад',
    result: '<p><strong>Андоз аз даромади шахси воқеӣ: резидент, ҷои кории асосӣ, меъёри 12%</strong></p>' +
      '<p><strong>Дода шудааст:</strong> даромади умумӣ 8 000,00 сомонӣ барои 1 моҳи тақвимӣ; навъи ташкилот: дигар; резидент, ҷои кории асосӣ; меъёр 12% (КА ҶТ, қисми 1 моддаи 183).</p>' +
      '<p><strong>Қадами 1. Андози иҷтимоии шахси суғурташуда.</strong><br>Барои ташкилотҳои дигар меъёр 2% аст (КА ҶТ, қисми 2 моддаи 332).<br>8 000,00 × 2% = <strong>160,00 сомонӣ</strong>.</p>' +
      '<p><strong>Қадами 2. Тарҳкунии шахсӣ.</strong><br>Ду нишондиҳандаи ҳисобӣ барои ҳар моҳи тақвимӣ (КА ҶТ, қисми 1 моддаи 191). Бо НҲ = 78: 2 × 78 × 1 = <strong>156,00 сомонӣ</strong>.</p>' +
      '<p><strong>Қадами 3. Даромади андозбандишаванда.</strong><br>8 000,00 − 160,00 − 156,00 = <strong>7 684,00 сомонӣ</strong> (КА ҶТ, қисмҳои 1 ва 6 моддаи 191).</p>' +
      '<p><strong>Қадами 4. Андоз аз даромад бо меъёри 12%.</strong><br>7 684,00 × 12% = <strong>922,08 сомонӣ</strong>.</p>' +
      '<p><strong>Тафсилот:</strong></p><div class="tbl-wrap"><div class="tbl-scroll"><table data-moni-tbl="1"><thead><tr><th>Нишондиҳанда</th><th>Маблағ, сомонӣ</th></tr></thead><tbody>' +
      '<tr><td>Даромади умумӣ</td><td>8 000,00</td></tr><tr><td>Андози иҷтимоии шахси суғурташуда (2%)</td><td>160,00</td></tr>' +
      '<tr><td>Тарҳкунии шахсӣ (2 НҲ × 78 × 1 моҳ)</td><td>156,00</td></tr><tr><td>Даромади андозбандишаванда</td><td>7 684,00</td></tr>' +
      '<tr><td>Андоз аз даромад (12%)</td><td>922,08</td></tr><tr class="net"><td><strong>Маблағи пардохт ба корманд</strong></td><td><strong>6 917,92</strong></td></tr></tbody></table></div>' +
      '<div class="tbl-tools"><button type="button" class="tbl-btn">CSV</button><button type="button" class="tbl-btn">Excel</button></div></div>' +
      '<p>Ба пардохт: 8 000,00 − 160,00 − 922,08 = 6 917,92 сомонӣ.</p><hr>' +
      '<p><strong>Сарчашма:</strong><br>• <strong>Кодекси андози Ҷумҳурии Тоҷикистон</strong> — моддаҳои 183, 191, 332 (аз 03.11.2021, бо таҳрири 11.02.2025)<br>• <strong>Дастурамал оид ба ҳисоб ва пардохти андози иҷтимоӣ</strong> (аз 07.01.2022)</p>'
  },
  /* Account: tajiklaw.ai/trial/tj/login says "Барои дидани таърихи чат ворид шавед". The sidebar lists this film's chats. */
  account: {
    name: 'Нилуфар', email: 'nilufar@example.com',
    chats: [
      'Шартномаи хизматрасонӣ оид ба таҳияи сомонаи корпоративӣ',
      'Ҳисоб: Андоз аз даромад',
      'Шартномаи_иҷора_14-26.docx',
      'Мӯҳлати умумии даъво тибқи Кодекси граждании ҶТ чанд сол аст?',
      'Оё корфармо метавонад кормандро дар давраи санҷиш озод кунад?',
      'Меъёри ААИ дар Тоҷикистон чанд фоиз аст?'
    ],
    icons: {"collapse": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg>", "new": "<svg width=\"17\" height=\"17\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><line x1=\"12\" y1=\"5\" x2=\"12\" y2=\"19\"></line><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"></line></svg>", "pin": "<svg viewBox=\"0 0 24 24\" width=\"15\" height=\"15\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 17v5M7 9V4h10v5l-3 3v0H10v0L7 9z\"></path></svg>", "edit": "<svg viewBox=\"0 0 24 24\" width=\"15\" height=\"15\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7\"></path><path d=\"M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z\"></path></svg>", "del": "<svg viewBox=\"0 0 24 24\" width=\"15\" height=\"15\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"3 6 5 6 21 6\"></polyline><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"></path></svg>"}
  },
  draftPrompt: 'Шартномаи хизматрасонӣ оид ба таҳияи сомонаи нави корпоративӣ тартиб диҳед — 25 000 сомонӣ, 60 рӯз, 50% пешпардохт, 50% пас аз қабули кор.',
  /* the contract Moní drafted in Tajik (tajiklaw.ai/trial/tj); its blanks are the gaps to fill */
  draft: {
    title: 'Шартномаи хизматрасонӣ № ___',
    paras: [
      { t: 'ШАРТНОМАИ ХИЗМАТРАСОНӢ № <i class="ph-mark">___</i>', cls: 'dv-p-title' },
      { t: 'оид ба таҳияи сомонаи нави корпоративӣ', cls: 'dv-p-center' },
      { t: 'ш. <i class="ph-mark">________</i> · «<i class="ph-mark">___</i>» <i class="ph-mark">________</i> 20<i class="ph-mark">__</i> с.' },
      { t: '1. ТАРАФҲО', cls: 'dv-p-head' },
      { t: '1.1. Иҷрокунанда: <i class="ph-mark">____________________</i> (ном, суроға, РМА), дар шахсияти <i class="ph-mark">____________</i> амал мекунад.' },
      { t: '1.2. Фармоишгар: <i class="ph-mark">____________________</i> (ном, суроға, РМА), дар шахсияти <i class="ph-mark">____________</i> амал мекунад.' },
      { t: '2. МАВЗӮИ ШАРТНОМА', cls: 'dv-p-head' },
      { t: '2.1. Иҷрокунанда уҳдадор мешавад сомонаи нави корпоративиро таҳия намояд, Фармоишгар бошад натиҷаро қабул ва пардохт кунад.' },
      { t: '2.2. Ҳаҷм, таркиб ва талабот ба сомона дар Замимаи № 1 (супориши техникӣ) муайян мешаванд, ки ҷузъи ҷудонашавандаи шартнома мебошад.' },
      { t: '3. НАРХ ВА ТАРТИБИ ПАРДОХТ', cls: 'dv-p-head' },
      { t: '3.1. Нархи умумии кор 25 000 (бисту панҷ ҳазор) сомонӣ мебошад.' },
      { t: '3.2. Пешпардохт — 50%, яъне 12 500 (дувоздаҳ ҳазору панҷсад) сомонӣ, дар муҳлати <i class="ph-mark">___</i> рӯзи корӣ пас аз имзои шартнома пардохт мешавад.' },
      { t: '3.3. Пардохти боқимонда — 50%, яъне 12 500 (дувоздаҳ ҳазору панҷсад) сомонӣ, дар муҳлати <i class="ph-mark">___</i> рӯзи корӣ пас аз имзои санади қабули кор пардохт мешавад.' },
      { t: '4. МУҲЛАТИ ИҶРО', cls: 'dv-p-head' },
      { t: '4.1. Муҳлати иҷрои кор — 60 (шаст) рӯзи тақвимӣ аз рӯзи ворид шудани пешпардохт ба ҳисоби Иҷрокунанда.' },
      { t: '5. ТАРТИБИ СУПОРИДАН ВА ҚАБУЛИ КОР', cls: 'dv-p-head' },
      { t: '5.2. Фармоишгар дар муҳлати <i class="ph-mark">___</i> рӯзи корӣ корро мебинад ва санади қабулро имзо мекунад ё камбудиҳои асоснокро хаттӣ нишон медиҳад.' }
    ]
  },

  caps: [
    { h: 'Саволу ҷавоби ҳуқуқӣ', p: 'Ҷавоб бо забони содда ва бо истинод ба моддаи дақиқ.', ic: 'chat' },
    { h: 'Таҳлили шартнома', p: 'Хатарҳо, мухолифат бо қонун ва ислоҳоти пешниҳодшуда.', ic: 'search' },
    { h: 'Ҳисобкунакҳо', p: 'Андозҳо, боҷҳо, пардохтҳо, маош ва ҷаримаҳо: 17 навъи ҳисоб.', ic: 'calc' },
    { h: 'Ҳар забон', p: 'Бо матн ё бо овоз — бо забони худатон пурсед.', ic: 'globe' },
    { h: 'Таҳияи шартнома', p: 'Лоиҳаи пурра, омода барои таҳрир дар .docx.', ic: 'doc' },
    { h: 'Қонунгузории амалкунанда', p: 'Ҳазорҳо санадҳои ҳуқуқии Тоҷикистон, ки мунтазам нав мешаванд.', ic: 'book' }
  ]
};

/* The film's own words in Tajik (mirrors FILM.str in film-data.js). */
FILM.str = {
  path: '/trial/tj/', loginPath: '/trial/tj/login',
  askPh: 'Маро пурсед...', stop: 'Қатъ кунед', sec: 'с',
  thinking: 'Moní фикр мекунад', calculating: 'Moní фикр мекунад',
  sourcesRe: /Сарчашма/,
  qa: { kick: 'Саволу ҷавоби ҳуқуқӣ', head: 'Ҷавоб бо истинод <em>ба қонун.</em>', lede: 'Ҳар хулоса ба моддаи мушаххас ишора мекунад — дар ин ҷо ба Кодекси меҳнат.', chip: 'Кодекси меҳнат · моддаи 28' },
  src: { kick: 'Сарчашмаҳо', head: 'Дар асоси қонунгузории <em>амалкунанда.</em>', lede: 'Кодекси меҳнати Ҷумҳурии Тоҷикистон, бо таҳрири 17.06.2026.' },
  more: 'Забонҳои дигар ҳам — бипурсед', voiceTag: 'Бо овоз пурсида шуд',
  review: { title: 'Таҳлили ҳуҷҷат: Шартномаи иҷора', risk: 'Хатари баланд', type: 'Иҷора',
    summary: '5 банд ба Кодекси граждании Ҷумҳурии Тоҷикистон мухолиф аст ё хатарро ба дӯши иҷорагир мегузорад.',
    verified: 'тасдиқ шуд', fix: 'Ислоҳ кардан ва зеркашӣ', track: 'тағйиротро нишон диҳед (чӣ ислоҳ шуд)', found: 'мушкилот ёфт шуд',
    status: 'Ҳуҷҷат тибқи қонунҳои Тоҷикистон таҳлил мешавад…', attached: 'Замима шуд · ҳангоми фиристодан таҳлил мешавад',
    docPh: 'Дар бораи ин ҳуҷҷат пурсед ё танҳо фиристед…' },
  upload: { kick: 'Таҳлили шартнома', head: '<em>Шартномаро</em> бор кунед.', lede: 'Moní онро бо Кодекси граждани месанҷад ва бандҳои хатарнокро нишон медиҳад.' },
  fixed: { kick: 'Ислоҳ шуд', head: 'Ҳар ислоҳ — <em>намоён.</em>', lede: 'Ҳамаи тағйирот дар .docx дида мешавад — формат, мӯҳрҳо ва тарҳ бетағйир мемонанд.',
    file: 'Шартномаи_иҷора_ислоҳшуда.docx', sub: '<b>5 ислоҳ ворид шуд</b> · тағйирот намоён' },
  calc: { header: 'Андоз аз даромад', kick: 'Ҳисобкунак', head: 'Андозу пардохтҳо — <em>ҳисобшуда.</em>', lede: '17 навъи ҳисоб, ҳар қадам бо истинод ба Кодекси андоз.',
    net: 'Ба пардохт', cur: 'сомонӣ', chip: 'Кодекси андоз · моддаҳои 183, 191, 332' },
  num: function (v) { return v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' '); },
  draft: { kick: 'Таҳияи шартнома', head: 'Лоиҳаи аввал — <em>омода барои таҳрир.</em>', lede: 'Ҷойҳое, ки бояд пур кунед, бо ранги тиллоӣ қайд шудаанд.',
    file: 'Шартномаи_хизматрасонӣ.docx', sub: 'Омода барои таҳрир · зеркашӣ бо як клик',
    reply: 'Лоиҳаи шартнома (хизматрасонӣ) тартиб дода шуд. Онро санҷед ва ҷойҳои холиро пур кунед.', open: 'Ҳуҷҷат · барои кушодан пахш кунед',
    comments: 'Эзоҳҳои шумо (0)', send: 'Эзоҳҳоро ба чат фиристед',
    disc: 'Moní ҷойи маслиҳати ҳуқуқии инфиродӣ шуда наметавонад. Барои маслиҳат ба ҳуқуқшиноси соҳибихтисос муроҷиат намоед.' },
  login: { title: 'Хуш омадед', sub: 'Барои дидани таърихи чат ворид шавед', email: 'Почтаи электронӣ', pw: 'Рамз', pwPh: 'Рамзи шумо', submit: 'Вуруд',
    foot: '<a>Рамзро фаромӯш кардед?</a><br>Ҳисоб надоред? <a>Бақайд гирифтан</a>' },
  chats: 'Чатҳо', newChat: 'Чати нав',
  acct: { kick: 'Ҳисоби шумо', head: 'Ҳар чат <em>ҳифз мешавад.</em>', lede: 'Аз ҳар дастгоҳ ворид шавед — тамоми таърихи шумо дар он ҷост.' }
};
/* Latin that may stay in the Tajik film: brand names, the site's address, file types, codes */
FILM.latinOk = /Moní|MONÍ|tajiklaw\.ai|info@|AI Conf|AAA Law Offices|Pro|docx|CSV|Excel|TJS|TJ|RU|EN|\/trial\/tj\/(login)?|you@example\.com|nilufar@example\.com|W(?![a-z])/g;
/* Russian that would slip in through captured UI: letters Tajik does not use, or Russian legal abbreviations */
FILM.russianRe = /[ыщьЫЩЬ]|(^|[^А-яЁёӢӣӮӯҒғҚқҲҳҶҷ])(РТ|ст\.|п\.|ч\.|от|ред\.)(?=[^А-яЁё]|$)/;
/* Moní's sources come back with Russian titles ("ТРУДОВОЙ КОДЕКС … — ст. 28 (от …, ред. …)"); shown in Tajik. */
(function () {
  const ACTS = [
    [/ТРУДОВОЙ КОДЕКС РЕСПУБЛИКИ ТАДЖИКИСТАН/g, 'Кодекси меҳнати Ҷумҳурии Тоҷикистон'],
    [/УГОЛОВНЫЙ КОДЕКС РЕСПУБЛИКИ ТАДЖИКИСТАН/g, 'Кодекси ҷиноятии Ҷумҳурии Тоҷикистон'],
    [/Гражданский кодекс Республики Таджикистан/g, 'Кодекси граждании Ҷумҳурии Тоҷикистон'],
    [/ГК РТ/g, 'КГ ҶТ']
  ];
  FILM.citations = function (v) {
    ACTS.forEach(function (r) { v = v.replace(r[0], r[1]); });
    return v.replace(/ — ст\. ([\d, ]+) \(от ([\d.]+), ред\. ([\d.]+)\)/g, function (_, a, d, r) {
      return ' — ' + (/,/.test(a) ? 'моддаҳои ' : 'моддаи ') + a + ' (аз ' + d + ', бо таҳрири ' + r + ')';
    });
  };
  /* the probation answer, trimmed to fit the frame: the lead, conditions 1 and 3 (contract, written notice), the sources */
  FILM.trimAnswer = function (content) {
    const items = content.querySelectorAll('ol > li');
    items.forEach(function (li, i) { if (i !== 0 && i !== 2) li.remove(); });
    content.querySelectorAll('p').forEach(function (p) {
      const s = p.querySelector('strong'), k = s ? s.textContent.trim() : '';
      if (/^Нуктаи иловагӣ|^Хулоса/.test(k)) p.remove();
    });
  };
})();
