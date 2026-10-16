/* Copy used in the film. Every legal statement below comes from Moní's own answers captured on
   tajiklaw.ai/trial (Pro) on 16 Oct 2026 — see README.md "Provenance" for the exact questions. */
window.FILM = {
  hookFragments: [
    ['ГРАЖДАНСКИЙ КОДЕКС РЕСПУБЛИКИ ТАДЖИКИСТАН', 'caps'],
    ['Статья 214', 'serif'],
    ['ТРУДОВОЙ КОДЕКС', 'caps'],
    ['Статья 28. Испытание при приёме на работу', ''],
    ['Кодекси граждании Ҷумҳурии Тоҷикистон', 'serif goldtxt'],
    ['Моддаи 214', 'serif'],
    ['НАЛОГОВЫЙ КОДЕКС', 'caps'],
    ['Статья 183', 'serif'],
    ['ТАМОЖЕННЫЙ КОДЕКС', 'caps'],
    ['Закон РТ «О государственной регистрации юридических лиц»', ''],
    ['Статья 680. Арендная плата', ''],
    ['ЗЕМЕЛЬНЫЙ КОДЕКС', 'caps'],
    ['Статья 718', 'serif goldtxt'],
    ['Кодекси меҳнат', 'serif'],
    ['СЕМЕЙНЫЙ КОДЕКС', 'caps'],
    ['Статья 384. Уменьшение неустойки', ''],
    ['ЖИЛИЩНЫЙ КОДЕКС', 'caps'],
    ['Закон РТ «О разрешительной системе»', ''],
    ['Статья 687', 'serif'],
    ['КОДЕКС ОБ АДМИНИСТРАТИВНЫХ ПРАВОНАРУШЕНИЯХ', 'caps'],
    ['Моддаи 28', 'serif goldtxt'],
    ['Статья 516', 'serif'],
    ['Закон РТ «Об обществах с ограниченной ответственностью»', ''],
    ['Статья 683. Капитальный ремонт', ''],
    ['УГОЛОВНЫЙ КОДЕКС', 'caps'],
    ['Статья 94', 'serif'],
    ['Қонуни ҶТ «Дар бораи истеҳсолоти иҷро»', 'serif'],
    ['ГРАЖДАНСКИЙ ПРОЦЕССУАЛЬНЫЙ КОДЕКС', 'caps']
  ],

  ask: {
    question: 'Can an employer dismiss an employee during the probation period under the Labor Code of Tajikistan?'
  },

  langs: [
    { tag: 'EN', name: 'English',
      q: 'Can an employer dismiss an employee during the probation period?',
      a: '<strong>Yes — but only on the ground and under the procedure set out in ТК РТ, ст. 28.</strong> Written notice is required not earlier than seven calendar days before probation ends.' },
    { tag: 'RU', name: 'Русский',
      q: 'Какой срок исковой давности по Гражданскому кодексу РТ?',
      a: '<strong>Общий срок исковой давности по ГК РТ — три года (ГК РТ, ст. 214).</strong> По отдельным требованиям закон устанавливает специальные сроки.' },
    { tag: 'TJ', name: 'Тоҷикӣ', voice: true,
      q: 'Мӯҳлати умумии даъво тибқи Кодекси граждании Ҷумҳурии Тоҷикистон чанд сол аст?',
      a: '<strong>Мӯҳлати умумии даъво се сол муқаррар шудааст (ГК РТ, моддаи 214).</strong>' }
  ],

  lease: {
    file: 'Commercial_Lease_14-26.docx',
    title: 'COMMERCIAL LEASE AGREEMENT No. 14/26',
    paras: [
      { t: 'Dushanbe, Republic of Tajikistan · 1 October 2026', cls: 'dv-p-center' },
      { t: 'Somon City Plaza LLC (the “Landlord”) and Pamir Trade LLC (the “Tenant”) have entered into this Agreement as follows:' },
      { t: '1.2. The lease term is 5 (five) years from the date of signing this Agreement.' },
      { id: 'c22', t: '2.2. The Landlord may unilaterally change the rent at any time without the Tenant’s consent by giving 3 (three) days’ notice.' },
      { t: '2.3. The Tenant shall pay a security deposit equal to 3 (three) months’ rent.' },
      { id: 'c31', t: '3.1. The Tenant shall carry out, at its own expense, all capital repairs of the Premises, including the roof and utility networks.' },
      { id: 'c41', t: '4.1. For late payment of rent, the Tenant shall pay a penalty of 5% of the overdue amount for each day of delay.' },
      { id: 'c51', t: '5.1. The Landlord may terminate this Agreement unilaterally at any time without giving reasons.' },
      { id: 'c61', t: '6.1. This Agreement enters into force upon signing and is not subject to state registration.' },
      { t: '6.3. Matters not covered by this Agreement are governed by the laws of the Republic of Tajikistan.' }
    ]
  },

  /* category -> site's own review-card category classes (upload.js CAT table) */
  findings: [
    { clause: 'cl. 2.2', para: 'c22', cat: 'red', catLabel: 'Not compliant with the law', sev: 'high',
      issue: 'Rent cannot be changed unilaterally — only by agreement of the parties, and no more than once a year.',
      law: 'ГК РТ, ст. 680, ч. 5',
      del: 'The Landlord may unilaterally change the rent at any time without the Tenant’s consent by giving 3 (three) days’ notice.',
      ins: 'The rent may be changed by agreement of the Parties, no more than once a year.' },
    { clause: 'cl. 6.1', para: 'c61', cat: 'red', catLabel: 'Not compliant with the law', sev: 'high',
      issue: 'A building lease for one year or more is subject to state registration and is concluded only from the moment of registration.',
      law: 'ГК РТ, ст. 718, ч. 3',
      del: 'is not subject to state registration.',
      ins: 'is subject to state registration and is deemed concluded from the moment of registration.' },
    { clause: 'cl. 5.1', para: 'c51', cat: 'red', catLabel: 'Not compliant with the law', sev: 'high',
      issue: 'The landlord may seek early termination only in court, on the grounds of art. 687 — not “without giving reasons”.',
      law: 'ГК РТ, ст. 687, ст. 516',
      del: 'terminate this Agreement unilaterally at any time without giving reasons.',
      ins: 'demand early termination of this Agreement in court on the grounds of Article 687 of the Civil Code.' },
    { clause: 'cl. 3.1', para: 'c31', cat: 'amber', catLabel: 'Unfavourable term', sev: 'med',
      issue: 'By default, capital repairs are the landlord’s duty, at its own expense.',
      law: 'ГК РТ, ст. 683, п. 1',
      del: 'The Tenant shall carry out, at its own expense, all capital repairs',
      ins: 'The Landlord shall carry out, at its own expense, capital repairs' },
    { clause: 'cl. 4.1', para: 'c41', cat: 'amber', catLabel: 'Risk', sev: 'med',
      issue: 'A penalty clearly disproportionate to the breach can be reduced by the court at the debtor’s request.',
      law: 'ГК РТ, ст. 384, ч. 1',
      del: '5% of the overdue amount for each day of delay.',
      ins: '0.1% of the overdue amount per day, capped at 10%.' }
  ],

  draftPrompt: 'Draft a services agreement for a new corporate website — TJS 25,000, 60 days, 50% advance, 50% on acceptance.',
  /* English rendering of the contract Moní drafted (its original output was in Russian). */
  draft: {
    title: 'Services Agreement No. [specify: number]',
    paras: [
      { t: 'SERVICES AGREEMENT No. <i class="ph-mark">[specify: number]</i>', cls: 'dv-p-title' },
      { t: 'Dushanbe · «<i class="ph-mark">[specify: day]</i>» <i class="ph-mark">[specify: month]</i> 2026' },
      { t: 'Pamir Trade Limited Liability Company, registered under the legislation of the Republic of Tajikistan, TIN <i class="ph-mark">[specify: TIN]</i>, hereinafter the “Client”, and Somon Digital Limited Liability Company, TIN <i class="ph-mark">[specify: TIN]</i>, hereinafter the “Contractor”, have concluded this Agreement as follows.' },
      { t: '1. SUBJECT OF THE AGREEMENT', cls: 'dv-p-head' },
      { t: '1.1. The Contractor undertakes, on the Client’s instructions, to develop the Client’s new corporate website (the “Site”), and the Client undertakes to accept and pay for the services.' },
      { t: '1.2. The Site includes: home page; “About the company”; “Services”; “News”; “Contacts”; a content management system (CMS).' },
      { t: '1.3. Stages: design mock-up · development · testing · launch on the Client’s hosting.' },
      { t: '2. TERM OF SERVICES', cls: 'dv-p-head' },
      { t: '2.1. The total term of services is 60 (sixty) calendar days from the date the advance payment is received.' },
      { t: '3. PRICE AND PAYMENT', cls: 'dv-p-head' },
      { t: '3.1. The total cost of services is 25,000 (twenty-five thousand) somoni (TJS) <i class="ph-mark">[specify: VAT, if applicable]</i>.' },
      { t: '3.3.1. An advance payment of 50%, i.e. TJS 12,500, within 5 business days of signing;' },
      { t: '3.3.2. The final payment of 50%, i.e. TJS 12,500, within 5 business days of signing the Acceptance Certificate.' },
      { t: '6. INTELLECTUAL PROPERTY', cls: 'dv-p-head' },
      { t: '6.1. Exclusive rights to the design, source code and files of the Site pass to the Client in full upon full payment.' },
      { t: '7. WARRANTY', cls: 'dv-p-head' },
      { t: '7.1. The Contractor fixes errors in the Site free of charge for 3 (three) months after launch.' }
    ]
  },

  caps: [
    { h: 'Legal Q&A', p: 'Plain-language answers that cite the exact article.', ic: 'chat' },
    { h: 'Contract review', p: 'Risks, conflicts with the law, suggested fixes.', ic: 'search' },
    { h: 'Contract drafting', p: 'A full first draft, ready to edit as .docx.', ic: 'doc' },
    { h: 'Calculators', p: 'Taxes, fees, duties and fines — 12 categories.', ic: 'calc' },
    { h: 'English · Русский · Тоҷикӣ', p: 'And more — by text or by voice.', ic: 'globe' },
    { h: 'Current legislation', p: 'Codes, laws and bylaws, kept up to date.', ic: 'book' }
  ]
};
