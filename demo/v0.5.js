/**
 * Ple Sandbox UI - v0.4 Chat Interface (Issue #112)
 * Simulated conversational chat view driving the Chaos → Order pipeline.
 */

const API_ENDPOINT = '/api/v1/compile/visualize';
const TRIGGER_PHRASE = "We're building a new retail bank ledger";

// DOM
const chatHistory = document.getElementById('chatHistory');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const buildItBtn = document.getElementById('buildItBtn');
const statusMessage = document.getElementById('statusMessage');
const mermaidContainer = document.getElementById('mermaidContainer');
const admJsonOutput = document.getElementById('admJsonOutput');
const prdOutput = document.getElementById('prdOutput');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const deploySection = document.getElementById('deploySection');
const deployBtn = document.getElementById('deployBtn');
const deployStatus = document.getElementById('deployStatus');
const versionNav = document.getElementById('versionNav');
const versionDropdown = document.getElementById('versionDropdown');
const versionTimestamp = document.getElementById('versionTimestamp');
const versionDelta = document.getElementById('versionDelta');
const artifactUrlBar = document.getElementById('artifactUrlBar');
const artifactUrlText = document.getElementById('artifactUrlText');
const artifactUrlCopyBtn = document.getElementById('artifactUrlCopyBtn');
const artifactUrlMeta = document.getElementById('artifactUrlMeta');
const artifactBar = document.getElementById('artifactBar');
const pillsList = document.getElementById('pillsList');
const newDomainBtn = document.getElementById('newDomainBtn');
const execTabs = document.querySelectorAll('.exec-tab');
const apiEndpointList = document.getElementById('apiEndpointList');
const eventStreamLog = document.getElementById('eventStreamLog');

// ─── Mock Data ────────────────────────────────────────────────

const MOCK_BANKING_ADM = {
  domainName: 'Banking',
  aggregates: [{
    name: 'BankAccount',
    description: 'The core ledger for retail banking.',
    commands: [
      { name: 'OpenAccount', description: 'Creates a new bank account.' },
      { name: 'Deposit', description: 'Increases the balance.' },
      { name: 'Withdrawal', description: 'Decreases the balance. Rule: Cannot overdraft unless OverdraftFacility is active.' },
    ],
    events: [
      { name: 'BankAccountCreated' },
      { name: 'DepositCompleted', description: 'Emitted when a deposit successfully processes.' },
      { name: 'FundsWithdrawn', description: 'Emitted when a withdrawal successfully processes so downstream systems can trigger an SMS alert.' },
    ],
  }],
  globalEvents: [],
};

const MOCK_BANKING_MERMAID = `graph LR
    BankAccount -->|OpenAccount| BankAccountCreated
    BankAccount -->|Deposit| DepositCompleted
    BankAccount -->|Withdrawal| FundsWithdrawn`;

const MOCK_BANKING_PRD = `# Generated PRD: Banking Domain

## Aggregate: BankAccount
**Description:** The core ledger for retail banking.

### Commands
- **\\\`OpenAccount\\\`**: Creates a new bank account.
- **\\\`Deposit\\\`**: Increases the balance.
- **\\\`Withdrawal\\\`**: Decreases the balance.
  - *Rule:* The account cannot be overdrawn (balance cannot go below zero) unless an OverdraftFacility is active.

### Events
- **\\\`BankAccountCreated\\\`**
- **\\\`DepositCompleted\\\`**: Emitted when a deposit successfully processes.
- **\\\`FundsWithdrawn\\\`**: Emitted when a withdrawal successfully processes so downstream systems can trigger an SMS alert.`;

// ─── Helpers ──────────────────────────────────────────────────

function formatJson(obj) { return JSON.stringify(obj, null, 2); }

function getConversationText() {
  const bubbles = chatHistory.querySelectorAll('.chat-bubble.user');
  return Array.from(bubbles)
    .map(b => b.querySelector('.bubble-text')?.textContent || '')
    .filter(Boolean)
    .join('\n');
}

// ─── Chat Bubbles ─────────────────────────────────────────────

function addChatBubble(text, type, id) {
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${type}`;
  if (id) bubble.id = id;

  // Build label + content
  const label = document.createElement('span');
  label.className = 'bubble-avatar';
  if (type === 'user') {
    label.textContent = 'You';
  } else {
    label.innerHTML = '✦ Spout';
  }
  bubble.appendChild(label);

  const content = document.createElement('span');
  content.className = 'bubble-text';
  if (type === 'system-loading') {
    content.innerHTML = `<span class="spinner-sm"></span> ${text}`;
  } else {
    content.textContent = text;
  }
  bubble.appendChild(content);

  // Remove placeholder when first message arrives
  const placeholder = chatHistory.querySelector('.chat-placeholder');
  if (placeholder) placeholder.remove();

  chatHistory.appendChild(bubble);
  chatHistory.scrollTop = chatHistory.scrollHeight;
  return bubble;
}

function updateChatBubble(id, newText, newType) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `chat-bubble ${newType}`;
  const label = el.querySelector('.bubble-avatar');
  if (label) {
    label.textContent = newType === 'user' ? 'You' : '✦ Spout';
  }
  const content = el.querySelector('.bubble-text');
  if (content) {
    content.textContent = newText;
  }
}

function sendMessage(text) {
  if (!text.trim()) return;
  addChatBubble(text.trim(), 'user');
  chatInput.value = '';
  sendBtn.disabled = true;
  chatHistory.scrollTop = chatHistory.scrollHeight;
  chatInput.focus();
  buildItBtn.disabled = false;
}

// ─── Right Panel Population ───────────────────────────────────

async function populateRightPanel() {
  populateVersionNav();
  // populateVersionNav() calls switchVersion('v5') which sets all tabs
}

// ─── Version Snapshots ──────────────────────────────────────

const VERSION_SNAPSHOTS = {
  v1: {
    label: 'v1',
    description: 'Initial domain: Account, User',
    timestamp: '2026-05-06T09:00:00Z',
    mermaid: `graph LR
    Account -->|Register| AccountCreated
    User -->|SignUp| UserRegistered`,
    adm: {
      domainName: 'Banking',
      aggregates: [
        { name: 'Account', description: 'Basic bank account entity.', commands: [{ name: 'Register', description: 'Creates a new account.' }], events: [{ name: 'AccountCreated' }] },
        { name: 'User', description: 'Identity record.', commands: [{ name: 'SignUp', description: 'Registers a new user.' }], events: [{ name: 'UserRegistered' }] },
      ],
      globalEvents: [],
    },
    prd: `# Generated PRD: Banking Domain — v1

## Aggregate: Account
**Description:** Basic bank account entity.

### Commands
- **\`Register\`**: Creates a new account.

### Events
- **\`AccountCreated\`**

---

## Aggregate: User
**Description:** Identity record.

### Commands
- **\`SignUp\`**: Registers a new user.

### Events
- **\`UserRegistered\`**`,
  },
  v2: {
    label: 'v2',
    description: 'Added aggregate: Transaction',
    timestamp: '2026-05-06T09:30:00Z',
    mermaid: `graph LR
    Account -->|Register| AccountCreated
    User -->|SignUp| UserRegistered
    Transaction -->|Record| TransactionLogged`,
    adm: {
      domainName: 'Banking',
      aggregates: [
        { name: 'Account', description: 'Basic bank account.', commands: [{ name: 'Register', description: 'Creates a new account.' }], events: [{ name: 'AccountCreated' }] },
        { name: 'User', description: 'Identity record.', commands: [{ name: 'SignUp', description: 'Registers a new user.' }], events: [{ name: 'UserRegistered' }] },
        { name: 'Transaction', description: 'Logs all monetary movements.', commands: [{ name: 'Record', description: 'Records a transaction.' }], events: [{ name: 'TransactionLogged' }] },
      ],
      globalEvents: [],
    },
    prd: `# Generated PRD: Banking Domain — v2

## Aggregate: Account
**Description:** Basic bank account.

### Commands
- **\`Register\`**: Creates a new account.

### Events
- **\`AccountCreated\`**

---

## Aggregate: User
**Description:** Identity record.

### Commands
- **\`SignUp\`**: Registers a new user.

### Events
- **\`UserRegistered\`**

---

## Aggregate: Transaction
**Description:** Logs all monetary movements.

### Commands
- **\`Record\`**: Records a transaction.

### Events
- **\`TransactionLogged\`**`,
  },
  v3: {
    label: 'v3',
    description: 'Added commands: Deposit, Withdraw',
    timestamp: '2026-05-06T10:00:00Z',
    mermaid: `graph LR
    BankAccount -->|OpenAccount| BankAccountCreated
    BankAccount -->|Deposit| DepositCompleted
    BankAccount -->|Withdrawal| FundsWithdrawn`,
    adm: {
      domainName: 'Banking',
      aggregates: [
        { name: 'BankAccount', description: 'Core banking aggregate handling accounts.', commands: [{ name: 'OpenAccount', description: 'Opens a new bank account.' }, { name: 'Deposit', description: 'Deposits funds into account.' }, { name: 'Withdrawal', description: 'Withdraws funds from account.' }], events: [{ name: 'BankAccountCreated' }, { name: 'DepositCompleted' }, { name: 'FundsWithdrawn' }] },
      ],
      globalEvents: [],
    },
    prd: `# Generated PRD: Banking Domain — v3

## Aggregate: BankAccount
**Description:** Core banking aggregate handling accounts.

### Commands
- **\`OpenAccount\`**: Opens a new bank account.
- **\`Deposit\`**: Deposits funds into account.
- **\`Withdrawal\`**: Withdraws funds from account.

### Events
- **\`BankAccountCreated\`**
- **\`DepositCompleted\`**
- **\`FundsWithdrawn\`**`,
  },
  v4: {
    label: 'v4',
    description: 'Added policy: WithdrawalLimit',
    timestamp: '2026-05-06T10:30:00Z',
    mermaid: `graph LR
    BankAccount -->|OpenAccount| BankAccountCreated
    BankAccount -->|Deposit| DepositCompleted
    BankAccount -->|Withdrawal| FundsWithdrawn
    BankAccount -->|WithdrawalLimit| OverdraftPolicy`,
    adm: {
      domainName: 'Banking',
      aggregates: [
        { name: 'BankAccount', description: 'Core banking aggregate with overdraft policy.', commands: [{ name: 'OpenAccount', description: 'Opens a new bank account.' }, { name: 'Deposit', description: 'Deposits funds into account.' }, { name: 'Withdrawal', description: 'Withdraws funds from account. Rule: Cannot overdraft without OverdraftFacility.' }], events: [{ name: 'BankAccountCreated' }, { name: 'DepositCompleted' }, { name: 'FundsWithdrawn' }, { name: 'OverdraftPolicy' }] },
      ],
      globalEvents: [],
    },
    prd: `# Generated PRD: Banking Domain — v4

## Aggregate: BankAccount
**Description:** Core banking aggregate with overdraft policy.

### Commands
- **\`OpenAccount\`**: Opens a new bank account.
- **\`Deposit\`**: Deposits funds into account.
- **\`Withdrawal\`**: Withdraws funds from account.
  - *Rule:* Cannot overdraft without OverdraftFacility.

### Events
- **\`BankAccountCreated\`**
- **\`DepositCompleted\`**
- **\`FundsWithdrawn\`**
- **\`OverdraftPolicy\`**`,
  },
  v5: {
    label: 'v5 (latest)',
    description: 'Added events: AccountDebited, AccountCredited',
    timestamp: '2026-05-06T11:00:00Z',
    mermaid: `graph LR
    BankAccount -->|OpenAccount| BankAccountCreated
    BankAccount -->|Deposit| AccountCredited
    BankAccount -->|Withdrawal| AccountDebited
    BankAccount -->|WithdrawalLimit| OverdraftProtection`,
    adm: {
      domainName: 'Banking',
      aggregates: [
        { name: 'BankAccount', description: 'The core ledger for retail banking with full event sourcing.', commands: [{ name: 'OpenAccount', description: 'Creates a new bank account.' }, { name: 'Deposit', description: 'Increases the balance. Emits AccountCredited.' }, { name: 'Withdrawal', description: 'Decreases the balance. Emits AccountDebited. Rule: Cannot overdraft.' }], events: [{ name: 'BankAccountCreated' }, { name: 'AccountCredited', description: 'Emitted when deposit processes.' }, { name: 'AccountDebited', description: 'Emitted when withdrawal processes.' }, { name: 'OverdraftProtection' }] },
      ],
      globalEvents: [],
    },
    prd: `# Generated PRD: Banking Domain — v5

## Aggregate: BankAccount
**Description:** The core ledger for retail banking with full event sourcing.

### Commands
- **\`OpenAccount\`**: Creates a new bank account.
- **\`Deposit\`**: Increases the balance.
  - *Emits:* AccountCredited event.
- **\`Withdrawal\`**: Decreases the balance.
  - *Emits:* AccountDebited event.
  - *Rule:* Cannot overdraft without OverdraftProtection.

### Events
- **\`BankAccountCreated\`**
- **\`AccountCredited\`**: Emitted when a deposit successfully processes.
- **\`AccountDebited\`**: Emitted when a withdrawal successfully processes.
- **\`OverdraftProtection\`**: Signaled when overdraft rule is enforced.`,
  },
};

function populateVersionNav() {
  versionNav.classList.remove('hidden');
  artifactUrlBar.classList.remove('hidden');
  const snap = VERSION_SNAPSHOTS['v5'];
  versionTimestamp.textContent = formatTimestamp(snap.timestamp);
  versionDelta.textContent = snap.description;
  versionDropdown.value = 'v5';
  switchVersion('v5');
}

function formatTimestamp(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function switchVersion(version) {
  const snap = VERSION_SNAPSHOTS[version];
  if (!snap) return;

  versionDropdown.value = version;
  versionTimestamp.textContent = formatTimestamp(snap.timestamp);
  versionDelta.textContent = snap.description;

  // Update Diagram
  renderMermaid(snap.mermaid);

  // Update ADM
  admJsonOutput.textContent = formatJson(snap.adm);

  // Update PRD
  prdOutput.textContent = snap.prd;

  // Update artifact URL
  updateArtifactUrl(version);
}

function updateArtifactUrl(version) {
  const domainName = 'banking-ledger';
  const url = 'ghcr.io/ple/' + domainName + ':' + version;
  artifactUrlText.textContent = url;
  artifactUrlMeta.textContent = 'Pullable image · 2.3 MB · ' + version;
}

function copyArtifactUrl() {
  const text = artifactUrlText.textContent;
  navigator.clipboard.writeText(text).then(() => {
    artifactUrlCopyBtn.textContent = '✓';
    setTimeout(() => { artifactUrlCopyBtn.textContent = '📋'; }, 2000);
  }).catch(() => {
    // fallback: select and copy
    const range = document.createRange();
    range.selectNodeContents(artifactUrlText);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand('copy');
    sel.removeAllRanges();
    artifactUrlCopyBtn.textContent = '✓';
    setTimeout(() => { artifactUrlCopyBtn.textContent = '📋'; }, 2000);
  });
}

async function renderMermaid(diagramDef) {
  try {
    const renderId = 'mermaid-svg-' + Date.now();
    const { svg } = await window.mermaid.render(renderId, diagramDef);
    mermaidContainer.innerHTML = svg;
  } catch (err) {
    mermaidContainer.innerHTML = '<pre class="error-text">Mermaid Error: ' + err.message + '</pre><pre>' + diagramDef + '</pre>';
  }
}

// ─── Auto-Play Demo Data ──────────────────────────────────────────

const DEMO_MESSAGES = [
  "We're building a new retail bank ledger",
  'Users should be able to open a bank account',
  'They need to deposit money into their accounts',
  'Withdrawal of funds should be supported',
];

const SPOUT_ACKS = [
  'Intent captured: Banking domain confirmed. A BankAccount aggregate will be created.',
  'Acknowledged: OpenAccount command added to BankAccount aggregate.',
  'Acknowledged: Deposit command added. Will emit DepositCompleted event.',
  'Acknowledged: Withdrawal command added. FundsWithdrawn event will notify downstream systems.',
];

const CONFLICT_MESSAGE = 'For our premium users, let them have negative balances. They\'re trusted VIPs.';

const MESSAGES_AFTER_CONFLICT = [
  'Also need SMS alerts on every withdrawal',
  'And a monthly fee of $10 per account',
];

const SPOUT_FINAL_ACK = 'Acknowledged. All invariants resolved.';

// ─── Compilation Pipeline ─────────────────────────────────────

async function runCompilation(intent) {
  showStatus('Compiling…', 'loading');
  buildItBtn.disabled = true;
  sendBtn.disabled = true;

  const loadId = 'sys-' + Date.now();
  addChatBubble('Understood. Compiling Chaos to Order…', 'system-loading', loadId);

  const useMock = intent.toLowerCase().includes('retail bank ledger');

  if (useMock) {
    await new Promise(r => setTimeout(r, 600));
    await populateRightPanel();
    updateChatBubble(loadId, 'Compilation successful. Visual Contract generated.', 'system');
    showStatus('✓ Compilation successful (Demo Mode)', 'success');
    showDeploySection();
    saveCurrentDomainState();
  } else {
    try {
      await new Promise(r => setTimeout(r, 400));
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent }),
      });
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      admJsonOutput.textContent = formatJson(data.adm);
      prdOutput.textContent = 'PRD generation requires live compilation pipeline.';
      try {
        const renderId = 'mermaid-svg-' + Date.now();
        const { svg } = await window.mermaid.render(renderId, data.mermaid);
        mermaidContainer.innerHTML = svg;
      } catch (e) {
        mermaidContainer.innerHTML = '<pre>' + data.mermaid + '</pre>';
      }
      updateChatBubble(loadId, 'Compilation successful. Visual Contract generated.', 'system');
      showStatus('✓ Compilation successful', 'success');
      showDeploySection();
      saveCurrentDomainState();
    } catch (err) {
      console.error('API error, falling back to demo:', err);
      updateChatBubble(loadId, 'API unavailable. Falling back to demo mode…', 'system');
      await new Promise(r => setTimeout(r, 400));
      await populateRightPanel();
      updateChatBubble(loadId, 'Compilation successful. Visual Contract generated (demo).', 'system');
      showStatus('✓ Demo mode (API unavailable)', 'success');
      showDeploySection();
      saveCurrentDomainState();
    }
  }

  buildItBtn.disabled = false;
  sendBtn.disabled = false;
}

async function startAutoPlay() {
  chatInput.disabled = true;
  sendBtn.disabled = true;
  buildItBtn.disabled = true;
  showStatus('▶ Auto-playing demo…', 'info');

  await new Promise(r => setTimeout(r, 800));

  // Phase 1: Normal statements with per-message Spout acknowledgments
  for (let i = 0; i < DEMO_MESSAGES.length; i++) {
    showTyping();
    await new Promise(r => setTimeout(r, 1000));
    hideTyping();
    addChatBubble(DEMO_MESSAGES[i], 'user');
    chatHistory.scrollTop = chatHistory.scrollHeight;

    await new Promise(r => setTimeout(r, 300));
    addChatBubble(SPOUT_ACKS[i], 'system');
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  // Phase 2: Contradictory statement
  await new Promise(r => setTimeout(r, 300));
  showTyping();
  await new Promise(r => setTimeout(r, 1000));
  hideTyping();
  addChatBubble(CONFLICT_MESSAGE, 'user');
  chatHistory.scrollTop = chatHistory.scrollHeight;

  // Phase 3: Spout detects contradiction
  await new Promise(r => setTimeout(r, 500));
  const conflictBubbleId = 'conflict-' + Date.now();
  addChatBubble('⚠ Contradiction detected — this conflicts with the NoOverdraftWithoutFacility rule.', 'system', conflictBubbleId);
  chatHistory.scrollTop = chatHistory.scrollHeight;

  // Phase 4: Show the Conflict Modal
  await new Promise(r => setTimeout(r, 800));
  showConflictModal();

  // Phase 5: Wait for resolution
  const resolution = await new Promise(resolve => {
    const timeout = setTimeout(() => resolve('keep'), 3500);
    document.getElementById('conflictKeepBtn').onclick = () => { clearTimeout(timeout); resolve('keep'); };
    document.getElementById('conflictOverrideBtn').onclick = () => { clearTimeout(timeout); resolve('override'); };
  });

  hideConflictModal();

  const resolutionText = resolution === 'keep'
    ? '✓ Rule maintained: NoOverdraftWithoutFacility preserved. Balance cannot go below zero.'
    : '✓ Rule overridden: premium users may carry negative balance.';
  updateChatBubble(conflictBubbleId, resolutionText, 'system');
  await new Promise(r => setTimeout(r, 300));

  // Phase 6: Remaining statements with acknowledgments
  for (let i = 0; i < MESSAGES_AFTER_CONFLICT.length; i++) {
    showTyping();
    await new Promise(r => setTimeout(r, 1000));
    hideTyping();
    addChatBubble(MESSAGES_AFTER_CONFLICT[i], 'user');
    chatHistory.scrollTop = chatHistory.scrollHeight;

    await new Promise(r => setTimeout(r, 300));
    addChatBubble(SPOUT_FINAL_ACK, 'system');
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  // Phase 7: Compilation
  await new Promise(r => setTimeout(r, 600));
  const loadId = 'sys-' + Date.now();
  addChatBubble('Understood. Compiling Chaos to Order…', 'system-loading', loadId);

  await new Promise(r => setTimeout(r, 800));
  await populateRightPanel();

  updateChatBubble(loadId, 'Compilation successful. Visual Contract generated.', 'system');
  showStatus('✓ Compilation successful', 'success');

  // Phase 8: Deploy (auto-trigger after compilcation)
  await new Promise(r => setTimeout(r, 500));
  showDeploySection();
  await new Promise(r => setTimeout(r, 400));
  await deployService();
  saveCurrentDomainState();

  showStatus('✓ Demo complete — service is live', 'success');

  chatInput.disabled = false;
  sendBtn.disabled = false;
  chatInput.focus();
}

function showConflictModal() {
  const overlay = document.getElementById('conflictOverlay');
  const desc = document.getElementById('conflictDesc');
  desc.innerHTML = [
    '<strong>You stated:</strong>',
    '<div class="conflict-source">The account cannot be overdrawn (balance cannot go below zero) unless an OverdraftFacility is active.</div>',
    '<strong>Then you stated:</strong>',
    '<div class="conflict-source">For our premium users, let them have negative balances. They\'re trusted VIPs.</div>',
    '<p style="margin-top:10px;color:#666;">These rules are mathematically incompatible in the ADM. Which intent survives?</p>',
  ].join('');
  overlay.style.display = 'flex';
}

function hideConflictModal() {
  document.getElementById('conflictOverlay').style.display = 'none';
}

let typingIndicator = null;

function showTyping() {
  if (typingIndicator) return;
  const dot = document.createElement('div');
  dot.className = 'chat-typing';
  dot.innerHTML = '<span></span><span></span><span></span>';
  typingIndicator = dot;
  chatHistory.appendChild(dot);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function hideTyping() {
  if (typingIndicator) {
    typingIndicator.remove();
    typingIndicator = null;
  }
}

// ─── Tab Switching ────────────────────────────────────────────

function setupTabs() {
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById(`${tabName}Tab`);
      if (target) target.classList.add('active');
    });
  });
}

// ─── Mock Execution Phase — API & Event Stream Data ─────────

const MOCK_API_SPEC = [
  {
    method: 'POST',
    path: '/accounts',
    name: 'OpenAccount',
    description: 'Creates a new bank account with an initial balance.',
    requestPayload: {
      accountHolder: 'Jane Doe',
      initialDeposit: 1000,
      currency: 'USD',
    },
    responseBody: {
      status: 'success',
      data: {
        accountId: 'acc_9f3b2a1e',
        accountNumber: '1000001',
        holder: 'Jane Doe',
        balance: 1000,
        currency: 'USD',
        createdAt: new Date().toISOString(),
      },
    },
  },
  {
    method: 'POST',
    path: '/accounts/{accountId}/deposit',
    name: 'Deposit',
    description: 'Deposits funds into an existing account.',
    requestPayload: {
      accountId: 'acc_9f3b2a1e',
      amount: 500,
      reference: 'DEP-20260506-001',
    },
    responseBody: {
      status: 'success',
      data: {
        transactionId: 'txn_7d1c4e9f',
        accountId: 'acc_9f3b2a1e',
        amount: 500,
        newBalance: 1500,
        timestamp: new Date().toISOString(),
      },
    },
  },
  {
    method: 'POST',
    path: '/accounts/{accountId}/withdraw',
    name: 'Withdrawal',
    description: 'Withdraws funds from an existing account.',
    requestPayload: {
      accountId: 'acc_9f3b2a1e',
      amount: 200,
      reference: 'WTH-20260506-001',
    },
    responseBody: {
      status: 'success',
      data: {
        transactionId: 'txn_3e8f7b2c',
        accountId: 'acc_9f3b2a1e',
        amount: 200,
        newBalance: 1300,
        timestamp: new Date().toISOString(),
      },
    },
  },
];

const MOCK_EVENTS = {
  OpenAccount: {
    eventName: 'BankAccountCreated',
    payload: {
      eventId: 'evt_' + Date.now().toString(36),
      eventType: 'BankAccountCreated',
      aggregateId: 'acc_9f3b2a1e',
      version: 1,
      timestamp: new Date().toISOString(),
      data: {
        accountNumber: '1000001',
        holder: 'Jane Doe',
        initialBalance: 1000,
        currency: 'USD',
      },
    },
  },
  Deposit: {
    eventName: 'DepositCompleted',
    payload: {
      eventId: 'evt_' + Date.now().toString(36),
      eventType: 'DepositCompleted',
      aggregateId: 'acc_9f3b2a1e',
      version: 2,
      timestamp: new Date().toISOString(),
      data: {
        amount: 500,
        newBalance: 1500,
        depositRef: 'DEP-20260506-001',
      },
    },
  },
  Withdrawal: {
    eventName: 'FundsWithdrawn',
    payload: {
      eventId: 'evt_' + Date.now().toString(36),
      eventType: 'FundsWithdrawn',
      aggregateId: 'acc_9f3b2a1e',
      version: 3,
      timestamp: new Date().toISOString(),
      data: {
        amount: 200,
        newBalance: 1300,
        withdrawalRef: 'WTH-20260506-001',
        smsAlert: 'Sent to +1-555-0100',
      },
    },
  },
};

// ─── Deploy & Execution Phase ─────────────────────────────────

let deployed = false;

function showDeploySection() {
  deploySection.classList.remove('hidden');
  deployBtn.disabled = false;
  deployStatus.className = 'deploy-status';
  deployStatus.textContent = '○ Not Deployed';
}

async function deployService() {
  deployBtn.disabled = true;
  deployBtn.textContent = '⟳ Deploying…';
  deployStatus.className = 'deploy-status provisioning';
  deployStatus.textContent = '⟳ Provisioning…';

  await new Promise(r => setTimeout(r, 1500));

  deployed = true;
  deployBtn.textContent = '✓ Deployed';
  deployStatus.className = 'deploy-status running';
  deployStatus.textContent = '✓ Running';

  // Reveal execution tabs
  execTabs.forEach(tab => tab.classList.remove('hidden'));
  populateLiveApi();
  showExecutionDeployStatus('Service is live. Use the Live API tab to interact.');
}

function populateLiveApi() {
  apiEndpointList.innerHTML = '';

  MOCK_API_SPEC.forEach((ep, idx) => {
    const card = document.createElement('div');
    card.className = 'api-endpoint';
    card.dataset.index = idx;

    const header = document.createElement('div');
    header.className = 'endpoint-header';
    header.innerHTML = `
      <span class="endpoint-method ${ep.method.toLowerCase()}">${ep.method}</span>
      <span class="endpoint-path">${ep.path}</span>
      <span class="endpoint-name">${ep.name}</span>
      <span class="endpoint-chevron">▶</span>
    `;

    const detail = document.createElement('div');
    detail.className = 'endpoint-detail';

    const desc = document.createElement('p');
    desc.className = 'endpoint-desc';
    desc.textContent = ep.description;
    detail.appendChild(desc);

    const reqBox = document.createElement('div');
    reqBox.className = 'endpoint-request-box';
    reqBox.innerHTML = `
      <span class="request-label">Request Body (application/json)</span>
      <pre class="request-payload">${formatJson(ep.requestPayload)}</pre>
    `;
    detail.appendChild(reqBox);

    const tryBtn = document.createElement('button');
    tryBtn.className = 'btn-try-it';
    tryBtn.textContent = 'Try it out';
    tryBtn.dataset.endpoint = ep.name;
    detail.appendChild(tryBtn);

    const respBox = document.createElement('div');
    respBox.className = 'api-response-box';
    respBox.innerHTML = `
      <span class="response-label">Response <span class="response-status">200 OK</span></span>
      <pre class="response-body"></pre>
    `;
    detail.appendChild(respBox);

    card.appendChild(header);
    card.appendChild(detail);

    header.addEventListener('click', () => {
      const isOpen = detail.classList.toggle('open');
      header.querySelector('.endpoint-chevron').classList.toggle('open', isOpen);
    });

    tryBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      tryBtn.disabled = true;
      tryBtn.textContent = 'Sending…';

      await new Promise(r => setTimeout(r, 600));

      const epName = tryBtn.dataset.endpoint;
      const bodyEl = respBox.querySelector('.response-body');
      bodyEl.textContent = formatJson(ep.responseBody);
      respBox.classList.add('open');

      tryBtn.textContent = '✓ Sent';

      // Append corresponding domain event
      const eventData = MOCK_EVENTS[epName];
      if (eventData) {
        const freshPayload = JSON.parse(JSON.stringify(eventData.payload));
        freshPayload.timestamp = new Date().toISOString();
        freshPayload.eventId = 'evt_' + Date.now().toString(36);
        appendEventEntry(eventData.eventName, freshPayload);
      }
    });

    apiEndpointList.appendChild(card);
  });
}

function appendEventEntry(eventName, payload) {
  const placeholder = eventStreamLog.querySelector('.event-placeholder');
  if (placeholder) placeholder.remove();

  const entry = document.createElement('div');
  entry.className = 'event-entry';

  const ts = new Date(payload.timestamp);
  const timeStr = ts.toLocaleTimeString('en-US', { hour12: false }) + '.' + String(ts.getMilliseconds()).padStart(3, '0');

  entry.innerHTML = `
    <span class="event-timestamp">[${timeStr}]</span>
    <span class="event-title">⟶ ${eventName}</span>
    <pre class="event-payload">${formatJson(payload)}</pre>
  `;

  eventStreamLog.appendChild(entry);
  eventStreamLog.scrollTop = eventStreamLog.scrollHeight;
}

function showExecutionDeployStatus(msg) {
  showStatus('✓ ' + msg, 'success');
}

// ─── Multi-Domain State ──────────────────────────────────────

const domainArtifacts = {};
let currentDomain = 'default';
let domainOrder = ['default'];

function startNewDomain() {
  saveCurrentDomainState();
  
  const domainName = 'domain-' + Date.now().toString(36);
  domainArtifacts[domainName] = { name: domainName, chatHtml: '', state: {}, compiled: false };
  domainOrder.push(domainName);
  
  switchDomain(domainName);
}

function switchDomain(name) {
  if (name === currentDomain) return;
  saveCurrentDomainState();
  currentDomain = name;
  restoreDomainState(name);
  updatePills();
}

function saveCurrentDomainState() {
  if (currentDomain === 'default' && domainArtifacts.default === undefined) {
    domainArtifacts.default = { name: 'Banking', chatHtml: '', state: {}, compiled: false };
  }
  const entry = domainArtifacts[currentDomain];
  if (!entry) return;
  
  entry.chatHtml = chatHistory.innerHTML;
  entry.state = {
    version: versionDropdown.value,
    admHtml: admJsonOutput.textContent,
    prdText: prdOutput.textContent,
    mermaidHtml: mermaidContainer.innerHTML,
    deployed: deployed,
    versionNavVisible: !versionNav.classList.contains('hidden'),
    deploySectionVisible: !deploySection.classList.contains('hidden'),
    execTabsVisible: execTabs.length > 0 && !execTabs[0].classList.contains('hidden'),
  };
  entry.compiled = entry.state.versionNavVisible;
  
  if (currentDomain === 'default' && entry.chatHtml && entry.chatHtml.includes('chat-bubble')) {
    entry.name = 'Banking';
  }
}

function restoreDomainState(name) {
  const entry = domainArtifacts[name];
  if (!entry) return;
  
  chatHistory.innerHTML = entry.chatHtml || '<p class="chat-placeholder">Type a domain intent statement below and hit Send to begin.</p>';
  
  if (entry.state.admHtml) {
    admJsonOutput.textContent = entry.state.admHtml;
    prdOutput.textContent = entry.state.prdText || '';
    mermaidContainer.innerHTML = entry.state.mermaidHtml || '<p class="placeholder">Diagram will appear here after compilation</p>';
    
    versionNav.classList.toggle('hidden', !entry.state.versionNavVisible);
    if (entry.state.versionNavVisible) {
      versionDropdown.value = entry.state.version || 'v5';
    }
    
    deploySection.classList.toggle('hidden', !entry.state.deploySectionVisible);
    
    execTabs.forEach(t => t.classList.toggle('hidden', !entry.state.execTabsVisible));
    
    deployed = entry.state.deployed || false;
  }
  
  updatePills();
}

function updatePills() {
  const visible = domainOrder.filter(name => {
    const e = domainArtifacts[name];
    return e && (e.compiled || name === currentDomain);
  });
  
  if (visible.length <= 1) {
    artifactBar.classList.add('hidden');
    return;
  }
  
  artifactBar.classList.remove('hidden');
  pillsList.innerHTML = '';
  
  visible.forEach(name => {
    const entry = domainArtifacts[name];
    const pill = document.createElement('button');
    pill.className = 'artifact-pill' + (name === currentDomain ? ' active' : '');
    pill.innerHTML = '<span class="pill-icon">📦</span> ' + (entry.name || name) + '<span class="pill-close" title="Remove this artifact">×</span>';
    pill.addEventListener('click', (e) => {
      if (e.target.classList.contains('pill-close')) {
        removeDomain(name);
      } else {
        switchDomain(name);
      }
    });
    pillsList.appendChild(pill);
  });
}

function removeDomain(name) {
  const entry = domainArtifacts[name];
  if (!entry) return;
  
  const wasActive = name === currentDomain;
  const wasCompiled = entry.compiled;
  
  delete domainArtifacts[name];
  domainOrder = domainOrder.filter(n => n !== name);
  
  if (wasActive && domainOrder.length > 0) {
    // Switch to first remaining domain
    const first = domainOrder[0];
    currentDomain = first;
    restoreDomainState(first);
  } else if (wasActive) {
    // No domains left, create fresh default
    currentDomain = 'default';
    resetToFreshState();
  }
  
  updatePills();
}

function resetToFreshState() {
  chatHistory.innerHTML = '<p class="chat-placeholder">Type a domain intent statement below and hit Send to begin.</p>';
  admJsonOutput.textContent = '{\n  "domainName": "...",\n  "aggregates": [],\n  "globalEvents": []\n}';
  prdOutput.textContent = 'PRD will appear here...';
  mermaidContainer.innerHTML = '<p class="placeholder">Diagram will appear here after compilation</p>';
  versionNav.classList.add('hidden');
  deploySection.classList.add('hidden');
  execTabs.forEach(t => t.classList.add('hidden'));
  chatInput.value = '';
  deployed = false;
  chatInput.disabled = false;
  sendBtn.disabled = true;
  buildItBtn.disabled = true;
}

// ─── Status ───────────────────────────────────────────────────

function showStatus(msg, type) {
  statusMessage.textContent = msg;
  statusMessage.className = `status-message ${type || 'info'}`;
}

// ─── Init ─────────────────────────────────────────────────────

function init() {
  setupTabs();

  // Enable/disable Send based on input
  chatInput.addEventListener('input', () => {
    sendBtn.disabled = !chatInput.value.trim();
  });

  // Enter → adds message to conversation (no compilation)
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (text) sendMessage(text);
    }
  });

  // Send button → just adds a chat bubble
  sendBtn.addEventListener('click', () => {
    const text = chatInput.value.trim();
    if (text) { sendMessage(text); showWaitlist(); }
  });

  // Build It → compiles the entire conversation
  buildItBtn.addEventListener('click', () => {
    const intent = getConversationText().trim();
    if (intent) runCompilation(intent);
  });

  // Deploy to Sandbox
  deployBtn.addEventListener('click', deployService);

  // Version Navigator
  versionDropdown.addEventListener('change', () => {
    switchVersion(versionDropdown.value);
  });

  // Artifact URL copy
  artifactUrlCopyBtn.addEventListener('click', copyArtifactUrl);

  // New Domain
  newDomainBtn.addEventListener('click', startNewDomain);

  showStatus('Ready. Type a domain intent statement and hit Send.', 'info');

  // Auto-play demo script with sequential messages
  startAutoPlay();

  chatInput.placeholder = "e.g. Try: 'Users can deposit money into their account'"

  console.log('Ple Sandbox v0.4 Chat UI initialized');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
