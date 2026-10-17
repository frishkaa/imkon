/* Copy used in the film. Every legal statement below comes from Moní's own answers captured on
   tajiklaw.ai/trial (Pro) on 16 Oct 2026 — see README.md "Provenance" for the exact questions. */
window.FILM = {
  hookFragments: [
    ['CIVIL CODE OF THE REPUBLIC OF TAJIKISTAN', 'caps'],
    ['Article 214', 'serif'],
    ['LABOUR CODE', 'caps'],
    ['Article 28. Probation on hiring', ''],
    ['Tax Code of the Republic of Tajikistan', 'serif goldtxt'],
    ['Article 183', 'serif'],
    ['TAX CODE', 'caps'],
    ['Article 332. Social tax', 'serif'],
    ['CUSTOMS CODE', 'caps'],
    ['Law on State Registration of Legal Entities', ''],
    ['Article 680. Rent', ''],
    ['LAND CODE', 'caps'],
    ['Article 718', 'serif goldtxt'],
    ['Labour Code of the Republic of Tajikistan', 'serif'],
    ['FAMILY CODE', 'caps'],
    ['Article 384. Reduction of a penalty', ''],
    ['HOUSING CODE', 'caps'],
    ['Law on the Licensing System', ''],
    ['Article 687', 'serif'],
    ['CODE OF ADMINISTRATIVE OFFENCES', 'caps'],
    ['Article 191', 'serif goldtxt'],
    ['Article 516', 'serif'],
    ['Law on Limited Liability Companies', ''],
    ['Article 683. Capital repairs', ''],
    ['CRIMINAL CODE', 'caps'],
    ['Article 94', 'serif'],
    ['Law on Enforcement Proceedings', 'serif'],
    ['CIVIL PROCEDURE CODE', 'caps']
  ],


  ask: {
    question: 'Can an employer dismiss an employee during the probation period under the Labor Code of Tajikistan?'
  },

  /* a sample of the languages Moní answers in (not the full list — the film names no total) */
  languages: ['English', 'Russian', 'Tajik', 'Chinese', 'Kazakh', 'Uzbek', 'Arabic', 'Turkish', 'Italian',
    'German', 'French', 'Spanish', 'Japanese', 'Hindi', 'Urdu', 'Persian', 'Korean', 'Kyrgyz'],
  /* Moní's answer to the limitation-period question (captured in Russian and Tajik; shown in English). */
  voice: {
    q: 'What is the general limitation period under the Civil Code?',
    a: '<strong>The general limitation period is three years (Civil Code, Art. 214).</strong> For some claims the law sets special periods.'
  },


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
      law: 'Civil Code, Art. 680(5)',
      del: 'The Landlord may unilaterally change the rent at any time without the Tenant’s consent by giving 3 (three) days’ notice.',
      ins: 'The rent may be changed by agreement of the Parties, no more than once a year.' },
    { clause: 'cl. 6.1', para: 'c61', cat: 'red', catLabel: 'Not compliant with the law', sev: 'high',
      issue: 'A building lease for one year or more is subject to state registration and is concluded only from the moment of registration.',
      law: 'Civil Code, Art. 718(3)',
      del: 'is not subject to state registration.',
      ins: 'is subject to state registration and is deemed concluded from the moment of registration.' },
    { clause: 'cl. 5.1', para: 'c51', cat: 'red', catLabel: 'Not compliant with the law', sev: 'high',
      issue: 'The landlord may seek early termination only in court, on the grounds of art. 687 — not “without giving reasons”.',
      law: 'Civil Code, Arts. 687, 516',
      del: 'terminate this Agreement unilaterally at any time without giving reasons.',
      ins: 'demand early termination of this Agreement in court on the grounds of Article 687 of the Civil Code.' },
    { clause: 'cl. 3.1', para: 'c31', cat: 'amber', catLabel: 'Unfavourable term', sev: 'med',
      issue: 'By default, capital repairs are the landlord’s duty, at its own expense.',
      law: 'Civil Code, Art. 683(1)',
      del: 'The Tenant shall carry out, at its own expense, all capital repairs',
      ins: 'The Landlord shall carry out, at its own expense, capital repairs' },
    { clause: 'cl. 4.1', para: 'c41', cat: 'amber', catLabel: 'Risk', sev: 'med',
      issue: 'A penalty clearly disproportionate to the breach can be reduced by the court at the debtor’s request.',
      law: 'Civil Code, Art. 384(1)',
      del: '5% of the overdue amount for each day of delay.',
      ins: '0.1% of the overdue amount per day, capped at 10%.' }
  ],

  /* Calculator: the Pro panel captured on tajiklaw.ai/trial/en (17 calculation types) and Moní's real
     Income Tax calculation for 8,000 TJS/month (its output was in Russian; shown here in English). */
  calc: {
    types: ["Income Tax", "Non-Resident Income Tax", "VAT", "Profit Tax", "Social Tax", "Simplified Tax System", "Customs Duty", "Fees and Payments", "Licenses and Permits", "State Duty", "Maternity Benefit", "Salary &amp; Advance", "Vacation Pay", "Sick Leave", "Final Settlement", "Business Trip", "Fine"],
    panel: "<div class=\"calc-panel show\" id=\"calcPanel\"> <div class=\"calc-header\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"4\" y=\"2\" width=\"16\" height=\"20\" rx=\"2\"></rect><line x1=\"8\" y1=\"6\" x2=\"16\" y2=\"6\"></line></svg> <span>Calculator</span></div> <div class=\"calc-group\"><label>Calculation type</label><select class=\"calc-select\" id=\"calcType\"><option value=\"income\">Income Tax</option><option value=\"nonresident\">Non-Resident Income Tax</option><option value=\"vat\">VAT</option><option value=\"profit\">Profit Tax</option><option value=\"social\">Social Tax</option><option value=\"simplified\">Simplified Tax System</option><option value=\"customs\">Customs Duty</option><option value=\"fees\">Fees and Payments</option><option value=\"permits\">Licenses and Permits</option><option value=\"duty\">State Duty</option><option value=\"maternity\">Maternity Benefit</option><option value=\"salary_adv\">Salary &amp; Advance</option><option value=\"vacation\">Vacation Pay</option><option value=\"sick\">Sick Leave</option><option value=\"dismissal\">Final Settlement</option><option value=\"trip\">Business Trip</option><option value=\"penalty\">Fine</option></select></div> <div id=\"calcFields\"><div class=\"calc-group\"><label>Monthly income (TJS)</label><input class=\"calc-input\" id=\"cIncome\" type=\"number\" placeholder=\"5000\" style=\"\"></div><div class=\"calc-group\"><label>Period</label><select class=\"calc-select\" id=\"cPeriod\"><option value=\"month\">Month</option><option value=\"quarter\">Quarter</option><option value=\"year\">Year</option></select></div><div class=\"calc-group\"><label>Status</label><select class=\"calc-select\" id=\"cStatus\"><option value=\"resident\">Resident</option><option value=\"nonresident\">Non-resident</option></select></div><div class=\"calc-group\" id=\"mainPlaceGroup\" style=\"display: block;\"><label class=\"calc-check\"><input type=\"checkbox\" id=\"cMainPlace\" checked=\"\" style=\"\"><span>Main place of work</span></label><div class=\"calc-hint\">Affects rate: main place — 12% (with deduction), other — 15% (no deductions)</div></div><div class=\"calc-group\" id=\"incomeOrgGroup\" style=\"display: block;\"><label>Organization type</label><select class=\"calc-select\" id=\"cIncomeOrgType\"><option value=\"budget\">Budget/State</option><option value=\"other\">Other</option></select></div><div class=\"calc-group\" id=\"countryGroup\" style=\"display:none\"><label>Country of residence</label><select class=\"calc-select\" id=\"cCountry\"><option value=\"none\">Per Tax Code</option><option value=\"russia\">Russia</option><option value=\"kazakhstan\">Kazakhstan</option><option value=\"kyrgyzstan\">Kyrgyzstan</option><option value=\"belarus\">Belarus</option><option value=\"ukraine\">Ukraine</option><option value=\"moldova\">Moldova</option><option value=\"armenia\">Armenia</option><option value=\"germany\">Germany</option><option value=\"france\">France</option><option value=\"czech\">Czech Republic</option><option value=\"india\">India</option><option value=\"kuwait\">Kuwait</option><option value=\"other\">Other country...</option></select></div><div class=\"calc-group\" id=\"customCountryGroup\" style=\"display:none\"><label>Specify country</label><input class=\"calc-input\" id=\"cCustomCountry\" type=\"text\" placeholder=\"e.g., Turkey\" style=\"\"></div><div class=\"calc-group\" id=\"deductionsGroup\" style=\"display: block;\"><label>Deductions (TJS)</label><input class=\"calc-input\" id=\"cDeductions\" type=\"number\" value=\"0\" style=\"\"></div></div> <div class=\"calc-rates\" id=\"calcRates\" title=\"\">Calculation Indicator (PDR) = 78 somoni (2026)</div> <button class=\"calc-submit\">Calculate</button> </div>",
    question: 'Calculation: Income Tax',
    result: "<p><strong>Income tax for an individual: resident, main place of work, 12% rate</strong></p><p><strong>Given:</strong> gross income 8,000.00 TJS for 1 calendar month; organization type: other; resident, main place of work; rate 12% (Tax Code, Art. 183(1)).</p><p><strong>Step 1. Social tax of the insured person.</strong><br>For other organizations the rate is 2% (Tax Code, Art. 332(2)).<br>8,000.00 × 2% = <strong>160.00 TJS</strong>.</p><p><strong>Step 2. Personal deduction.</strong><br>Two calculation indicators for each calendar month (Tax Code, Art. 191(1)). With PDR = 78: 2 × 78 × 1 = <strong>156.00 TJS</strong>.</p><p><strong>Step 3. Taxable income.</strong><br>8,000.00 − 160.00 − 156.00 = <strong>7,684.00 TJS</strong> (Tax Code, Art. 191(1), (6)).</p><p><strong>Step 4. Income tax at 12%.</strong><br>7,684.00 × 12% = <strong>922.08 TJS</strong>.</p><p><strong>Breakdown:</strong></p><div class=\"tbl-wrap\"><div class=\"tbl-scroll\"><table data-moni-tbl=\"1\"><thead><tr><th>Item</th><th>Amount, TJS</th></tr></thead><tbody><tr><td>Gross income</td><td>8,000.00</td></tr><tr><td>Social tax of the insured person (2%)</td><td>160.00</td></tr><tr><td>Personal deduction (2 PDR × 78 × 1 mo.)</td><td>156.00</td></tr><tr><td>Taxable income</td><td>7,684.00</td></tr><tr><td>Income tax (12%)</td><td>922.08</td></tr><tr class=\"net\"><td><strong>Net pay to the employee</strong></td><td><strong>6,917.92</strong></td></tr></tbody></table></div><div class=\"tbl-tools\"><button type=\"button\" class=\"tbl-btn\">CSV</button><button type=\"button\" class=\"tbl-btn\">Excel</button></div></div><p>Net pay: 8,000.00 − 160.00 − 922.08 = 6,917.92 TJS.</p><hr><p><strong>Sources:</strong><br>• <strong>Tax Code of the Republic of Tajikistan</strong> — Art. 183, 191, 332 (of 03.11.2021, as amended 11.02.2025)<br>• <strong>Instruction on calculating and paying social tax</strong> (of 07.01.2022)</p>"
  },
  /* Account: tajiklaw.ai/trial/en/login says "Log in to see your chat history"; the site keeps history on the
     server for logged-in users (localStorage for guests). The sidebar lists this film's own chats. */
  account: {
    name: 'Nilufar', email: 'nilufar@example.com',
    chats: [
      'Draft a services agreement for a new corporate website',
      'Calculation: Income Tax',
      'Commercial_Lease_14-26.docx',
      'What is the general limitation period under the Civil Code?',
      'Can an employer dismiss an employee during the probation period?',
      'What is the VAT rate in Tajikistan?'
    ],
    icons: {"collapse": "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg>", "new": "<svg width=\"17\" height=\"17\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><line x1=\"12\" y1=\"5\" x2=\"12\" y2=\"19\"></line><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"></line></svg>", "pin": "<svg viewBox=\"0 0 24 24\" width=\"15\" height=\"15\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 17v5M7 9V4h10v5l-3 3v0H10v0L7 9z\"></path></svg>", "edit": "<svg viewBox=\"0 0 24 24\" width=\"15\" height=\"15\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7\"></path><path d=\"M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z\"></path></svg>", "del": "<svg viewBox=\"0 0 24 24\" width=\"15\" height=\"15\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"3 6 5 6 21 6\"></polyline><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"></path></svg>"}
  },
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
    { h: 'Calculators', p: 'Taxes, duties, fees, salary and fines: 17 calculation types.', ic: 'calc' },
    { h: 'Any language', p: 'Ask by text or by voice, in your own language.', ic: 'globe' },
    { h: 'Contract drafting', p: 'A full first draft, ready to edit as .docx.', ic: 'doc' },
    { h: 'Current legislation', p: 'Thousands of Tajik legal acts, kept up to date.', ic: 'book' }
  ]
};
