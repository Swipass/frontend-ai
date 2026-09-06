// src/pages/DocsPage.tsx
import { useState, useEffect } from 'react'
import { useFeeRates } from '../hooks/useFeeRates'
import { Link, useLocation } from 'react-router-dom'
import { config } from '../config'
import { Wordmark } from '../components/Logo'

const HTTP_LANGS = ['JavaScript', 'Python', 'Go', 'Rust', 'cURL']

// Resolve the API base at runtime: configured URL, else the current origin.
const API_BASE =
  config.apiUrl || (typeof window !== 'undefined' ? window.location.origin : '')

// ---------------------------------------------------------------------------
// Code examples. Factored into a data object so the JSX below stays readable.
// makeHttpExamples() builds the raw-HTTP quickstart tabs; makeSdkExamples()
// builds the JavaScript and Python SDK quickstarts.
// ---------------------------------------------------------------------------

const makeHttpExamples = (base: string): Record<string, Record<string, string>> => ({
  'Quick Start': {
    JavaScript: `// Raw HTTP with native fetch (Node 18+ or the browser)
const response = await fetch('${base}/v1/intent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'sw_live_your_api_key_here',
  },
  body: JSON.stringify({
    command: 'Bridge 1 ETH from Arbitrum to Polygon',
    destination_address: '0xRecipientAddress', // optional
  }),
});

const data = await response.json();
console.log('Intent ID:', data.intent_id);
console.log('Provider:', data.selected_provider);
console.log('Guaranteed out:', data.quote.guaranteed_to_amount, data.quote.to_token);
console.log('Simulation passed:', data.simulation_passed);
console.log('Calldata to sign:', data.transaction);`,

    Python: `import requests

response = requests.post(
    '${base}/v1/intent',
    headers={
        'Content-Type': 'application/json',
        'X-API-Key': 'sw_live_your_api_key_here',
    },
    json={
        'command': 'Bridge 1 ETH from Arbitrum to Polygon',
        'destination_address': '0xRecipientAddress',  # optional
    },
)

data = response.json()
print('Intent ID:', data['intent_id'])
print('Provider:', data['selected_provider'])
print('Guaranteed out:', data['quote']['guaranteed_to_amount'])
print('Simulation passed:', data['simulation_passed'])`,

    Go: `package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
)

func main() {
    payload := map[string]string{
        "command":             "Bridge 1 ETH from Arbitrum to Polygon",
        "destination_address": "0xRecipientAddress",
    }
    body, _ := json.Marshal(payload)

    req, _ := http.NewRequest("POST",
        "${base}/v1/intent",
        bytes.NewBuffer(body))
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("X-API-Key", "sw_live_your_api_key_here")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    var result map[string]interface{}
    json.NewDecoder(resp.Body).Decode(&result)
    fmt.Printf("Intent ID: %s\\n", result["intent_id"])
    fmt.Printf("Provider: %s\\n", result["selected_provider"])
}`,

    Rust: `use reqwest::Client;
use serde_json::{json, Value};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::new();

    let response = client
        .post("${base}/v1/intent")
        .header("Content-Type", "application/json")
        .header("X-API-Key", "sw_live_your_api_key_here")
        .json(&json!({
            "command": "Bridge 1 ETH from Arbitrum to Polygon",
            "destination_address": "0xRecipientAddress"
        }))
        .send()
        .await?;

    let data: Value = response.json().await?;
    println!("Intent ID: {}", data["intent_id"]);
    println!("Provider: {}", data["selected_provider"]);
    println!("Guaranteed out: {}", data["quote"]["guaranteed_to_amount"]);

    Ok(())
}`,

    cURL: `curl -X POST ${base}/v1/intent \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: sw_live_your_api_key_here" \\
  -d '{
    "command": "Bridge 1 ETH from Arbitrum to Polygon",
    "destination_address": "0xRecipientAddress"
  }'`,
  },

  'BYO-LLM': {
    JavaScript: `// Pass your own LLM credentials per request
const response = await fetch('${base}/v1/intent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'sw_live_your_key',
    'X-LLM-Provider': 'openai',         // or 'anthropic'
    'X-LLM-API-Key': 'sk-your-openai-key',
    'X-LLM-Model': 'gpt-4o-mini',       // any supported model
  },
  body: JSON.stringify({ command: 'Swap 500 USDC for WETH on Arbitrum' }),
});`,

    Python: `import requests

response = requests.post(
    '${base}/v1/intent',
    headers={
        'X-API-Key': 'sw_live_your_key',
        'X-LLM-Provider': 'anthropic',
        'X-LLM-API-Key': 'sk-ant-your-key',
        'X-LLM-Model': 'claude-haiku-4-5',
    },
    json={'command': 'Swap 500 USDC for WETH on Arbitrum'},
)
print(response.json())`,

    Go: `req.Header.Set("X-LLM-Provider", "openai")
req.Header.Set("X-LLM-API-Key", "sk-your-key")
req.Header.Set("X-LLM-Model", "gpt-4o-mini")`,

    Rust: `client
    .post(url)
    .header("X-LLM-Provider", "openai")
    .header("X-LLM-API-Key", "sk-your-key")
    .header("X-LLM-Model", "gpt-4o-mini")`,

    cURL: `curl -X POST ${base}/v1/intent \\
  -H "X-API-Key: sw_live_your_key" \\
  -H "X-LLM-Provider: openai" \\
  -H "X-LLM-API-Key: sk-your-openai-key" \\
  -H "X-LLM-Model: gpt-4o-mini" \\
  -d '{"command": "Swap 500 USDC for WETH on Arbitrum"}'`,
  },

  'Destination Address': {
    JavaScript: `// Send output to a DIFFERENT address than the signing wallet.
// On the intent, set destination_address.
const response = await fetch('${base}/v1/intent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'sw_live_your_key',
  },
  body: JSON.stringify({
    command: 'Bridge 2 ETH from Ethereum to Polygon',
    destination_address: '0xDifferentRecipientOnPolygon',
    wallet_address: '0xMySigningWallet',
  }),
});

const data = await response.json();
// data.destination_note confirms where funds will land.

// When you rebuild a transaction for another quote, carry the recipient
// through with the X-Destination-Address header.
const tx = await fetch('${base}/v1/intent/build-transaction', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Wallet-Address': '0xMySigningWallet',
    'X-Destination-Address': '0xDifferentRecipientOnPolygon',
  },
  body: JSON.stringify(data.all_quotes[1]),
});`,

    Python: `response = requests.post(
    '${base}/v1/intent',
    headers={'X-API-Key': 'sw_live_your_key'},
    json={
        'command': 'Bridge 2 ETH from Ethereum to Polygon',
        'destination_address': '0xDifferentRecipient',
        'wallet_address': '0xMySigningWallet',
    },
)
data = response.json()
print(data['destination_note'])  # confirms routing

# Rebuilding a transaction keeps the recipient via the header.
tx = requests.post(
    '${base}/v1/intent/build-transaction',
    headers={
        'X-Wallet-Address': '0xMySigningWallet',
        'X-Destination-Address': '0xDifferentRecipient',
    },
    json=data['all_quotes'][1],
)`,

    Go: `json.Marshal(map[string]string{
    "command":              "Bridge 2 ETH to Polygon",
    "destination_address":  "0xDifferentRecipient",
    "wallet_address":       "0xMySigningWallet",
})
// On build-transaction:
// req.Header.Set("X-Destination-Address", "0xDifferentRecipient")`,

    Rust: `json!({
    "command": "Bridge 2 ETH to Polygon",
    "destination_address": "0xDifferentRecipient",
    "wallet_address": "0xMySigningWallet",
})
// On build-transaction:
// .header("X-Destination-Address", "0xDifferentRecipient")`,

    cURL: `curl -X POST ${base}/v1/intent \\
  -H "X-API-Key: sw_live_your_key" \\
  -d '{
    "command": "Bridge 2 ETH from Ethereum to Polygon",
    "destination_address": "0xDifferentRecipient",
    "wallet_address": "0xMySigningWallet"
  }'`,
  },
})

const makeSdkExamples = (): Record<string, string> => ({
  JavaScript: `// npm install @swipass/sdk
import { SwipassClient } from '@swipass/sdk';

const client = new SwipassClient({ apiKey: 'sw_live_your_key' });

// 1. Create an intent from natural language.
const intent = await client.createIntent({
  command: 'Bridge 1 ETH from Arbitrum to Polygon',
  destinationAddress: '0xRecipient', // optional
});

console.log(intent.quote.guaranteedToAmount); // on-chain floor
console.log(intent.simulationPassed);         // true when pre-flight passed

// 2. Reference data (all public, no key required).
const chains = await client.getChains();
const providers = await client.getProviders();
const ratings = await client.getProviderRatings();

// 3. Optionally build a transaction for a different quote.
const tx = await client.buildTransaction(intent.allQuotes[1], {
  walletAddress: '0xSigner',
  destinationAddress: '0xRecipient', // optional
});

// 4. Sign tx with the user's wallet, broadcast, then reconcile.
await client.reportStatus(intent.intentId, {
  txHash: '0xabc...',
  status: 'completed',      // or 'failed'
  actualToAmount: '0.9979', // optional, powers truth-return analytics
});`,

  Python: `# pip install swipass
from swipass import SwipassClient

client = SwipassClient(api_key="sw_live_your_key")

# 1. Create an intent from natural language.
intent = client.create_intent(
    command="Bridge 1 ETH from Arbitrum to Polygon",
    destination_address="0xRecipient",  # optional
)
print(intent.quote.guaranteed_to_amount)  # on-chain floor
print(intent.simulation_passed)           # True when pre-flight passed

# 2. Reference data (all public, no key required).
chains = client.get_chains()
providers = client.get_providers()

# 3. Optionally build a transaction for a different quote.
tx = client.build_transaction(
    intent.all_quotes[1],
    wallet_address="0xSigner",
    destination_address="0xRecipient",  # optional
)

# 4. Sign tx with the user's wallet, broadcast, then reconcile.
client.report_status(
    intent.intent_id,
    tx_hash="0xabc...",
    status="completed",         # or "failed"
    actual_to_amount="0.9979",  # optional, powers truth-return analytics
)

# For asyncio, AsyncSwipassClient exposes the same methods with await:
#   from swipass import AsyncSwipassClient
#   async with AsyncSwipassClient(api_key="sw_live_your_key") as client:
#       intent = await client.create_intent(command="...")`,
})

// Detailed request / response reference blocks.
const INTENT_RESPONSE_JSON = `{
  "intent_id": "int_9f3a2c81",
  "trace_id": "trc_5b21d0af",
  "parsed_intent": {
    "action": "bridge",
    "from_chain": "arbitrum",
    "to_chain": "polygon",
    "from_token": "ETH",
    "to_token": "ETH",
    "amount": "1"
  },
  "selected_provider": "across",
  "quote": {
    "provider": "across",
    "from_chain": "arbitrum",
    "to_chain": "polygon",
    "from_token": "ETH",
    "to_token": "ETH",
    "from_amount": "1",
    "to_amount": "0.99824",
    "guaranteed_to_amount": "0.99710",
    "fee_amount": "0.00176",
    "fee_token": "ETH",
    "estimated_time_seconds": 42,
    "estimated_gas_usd": "0.31",
    "price_impact_percent": "0.05",
    "route_description": "Across fast bridge",
    "score": 0.94,
    "quote_id": "qt_across_7710",
    "expires_at": 1752883200
  },
  "transaction": {
    "to": "0xEF4fB24aD0916217251F553c0596F8Edc630Eb66",
    "data": "0x9f...calldata",
    "value": "1000000000000000000",
    "gas_limit": "210000",
    "chain_id": 42161,
    "chain_name": "arbitrum"
  },
  "all_quotes": [
    { "provider": "across", "guaranteed_to_amount": "0.99710", "score": 0.94, "quote_id": "qt_across_7710" },
    { "provider": "stargate", "guaranteed_to_amount": "0.99604", "score": 0.90, "quote_id": "qt_stargate_2214" },
    { "provider": "lifi", "guaranteed_to_amount": "0.99551", "score": 0.88, "quote_id": "qt_lifi_5093" }
  ],
  "destination_address": "0xRecipient",
  "destination_note": "Funds will arrive at 0xRecipient on polygon",
  "simulation_passed": true,
  "simulation_reason": "ok",
  "requires_approval": false,
  "approval": null
}`

const BUILD_TX_REQUEST = `POST ${API_BASE}/v1/intent/build-transaction
X-Wallet-Address: 0xMySigningWallet
X-Destination-Address: 0xRecipient   (optional)
Content-Type: application/json

// Body: one quote object taken from all_quotes[]
{
  "provider": "stargate",
  "from_chain": "arbitrum",
  "to_chain": "polygon",
  "from_token": "ETH",
  "to_token": "ETH",
  "from_amount": "1",
  "to_amount": "0.99720",
  "guaranteed_to_amount": "0.99604",
  "fee_amount": "0.00280",
  "fee_token": "ETH",
  "estimated_time_seconds": 65,
  "estimated_gas_usd": "0.29",
  "price_impact_percent": "0.06",
  "score": 0.90,
  "quote_id": "qt_stargate_2214"
}`

const BUILD_TX_RESPONSE = `{
  "transaction": {
    "to": "0x8731d54E9D02c286767d56ac03e8037C07e01e98",
    "data": "0xac...calldata",
    "value": "1000000000000000000",
    "gas_limit": "225000",
    "chain_id": 42161,
    "chain_name": "arbitrum",
    "max_fee_per_gas": "120000000",
    "max_priority_fee_per_gas": "1000000",
    "spender": null
  },
  "approval": null,
  "requires_approval": false,
  "simulation_passed": true,
  "simulation_reason": "ok"
}`

// What comes back when the route spends an ERC20 the spender cannot move yet.
const APPROVAL_RESPONSE = `{
  "transaction": { "...the swap, ready once the approval lands..." },
  "requires_approval": true,
  "simulation_passed": false,
  "simulation_reason": "needs_approval",
  "approval": {
    "to": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "data": "0x095ea7b3...",
    "value": "0",
    "gas_limit": "80000",
    "chain_id": 8453,
    "chain_name": "Base",
    "token_symbol": "USDC",
    "token_address": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "spender": "0x2626664c2603336E57B271c5C0b26F421741e481",
    "amount": "100000000",
    "current_allowance": "0",
    "is_reset": false
  }
}`

const ERROR_ENVELOPE = `{
  "detail": {
    "error": "intent_error",
    "message": "Could not resolve a route for this command"
  }
}`

const DOC_SECTIONS = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'authentication', label: 'Authentication' },
  { id: 'sdks', label: 'SDKs' },
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'endpoints', label: 'Endpoints' },
  { id: 'execution-flow', label: 'Execution Flow' },
  { id: 'approvals', label: 'Token Approvals' },
  { id: 'webhooks', label: 'Webhooks' },
  { id: 'traces', label: 'Traces' },
  { id: 'byollm', label: 'BYO-LLM' },
  { id: 'destination', label: 'Destination Address' },
  { id: 'providers', label: 'Providers' },
  { id: 'fees', label: 'Fees & Revenue' },
  { id: 'errors', label: 'Error Reference' },
]

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <div className="bg-deepest-dark border border-dark-grey-3 rounded-lg overflow-hidden">
      <div className="flex justify-between items-center px-3 py-2 bg-dark-grey-2 border-b border-dark-grey-3">
        <span className="text-xs uppercase tracking-wide text-light-grey-1">{lang}</span>
        <button
          onClick={copy}
          className="bg-none border-none text-xs text-light-grey-1 hover:text-light-grey-3 font-mono uppercase tracking-wide"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 font-mono text-xs md:text-sm text-light-grey-2 leading-relaxed overflow-x-auto max-h-96">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function ExampleTabs({ examples, langs }: { examples: Record<string, string>; langs: string[] }) {
  const [activeLang, setActiveLang] = useState(langs[0])
  return (
    <div>
      <div className="flex flex-wrap border-b border-dark-grey-3 mb-4">
        {langs.map(lang => (
          <button
            key={lang}
            onClick={() => setActiveLang(lang)}
            className={`px-3 py-2 font-mono text-xs uppercase tracking-wide transition-colors cursor-none ${
              activeLang === lang
                ? 'text-almost-white border-b-2 border-light-grey-3'
                : 'text-light-grey-1 border-b-2 border-transparent hover:text-light-grey-3'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>
      <CodeBlock code={examples[activeLang] || '// Not available for this language'} lang={activeLang} />
    </div>
  )
}

const HTTP_EXAMPLES = makeHttpExamples(API_BASE)
const SDK_EXAMPLES = makeSdkExamples()

const H2 = 'font-display text-2xl sm:text-3xl font-bold text-almost-white tracking-tighter mb-4'
const P = 'text-light-grey-1 text-sm sm:text-base leading-relaxed mb-6'
const CODE_INLINE = 'font-mono bg-dark-grey-2 px-1 py-0.5 rounded text-light-grey-3 text-xs'

export default function DocsPage() {
  // Fee rates are admin-editable at runtime, so they are read rather than written.
  const fees = useFeeRates()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('introduction')
  const location = useLocation()

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  // Set active section from the URL hash on load
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash && DOC_SECTIONS.some(s => s.id === hash)) {
      setActiveSection(hash)
    }
  }, [])

  // Paginated docs: one section at a time, navigated by the sidebar or the
  // Previous/Next controls at the bottom of each page.
  const goToSection = (id: string) => {
    setActiveSection(id)
    setMobileMenuOpen(false)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${id}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const activeIndex = DOC_SECTIONS.findIndex(s => s.id === activeSection)
  const prevSection = activeIndex > 0 ? DOC_SECTIONS[activeIndex - 1] : null
  const nextSection =
    activeIndex >= 0 && activeIndex < DOC_SECTIONS.length - 1 ? DOC_SECTIONS[activeIndex + 1] : null

  return (
    <div className="min-h-screen bg-deepest-dark font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-deepest-dark/85 backdrop-blur-md border-b border-dark-grey-3 px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold text-almost-white tracking-tighter">
            <Wordmark textClassName="text-xl" />
          </Link>
          <span className="text-xs uppercase tracking-wider text-light-grey-1 px-2 py-0.5 border border-dark-grey-3 rounded">Docs</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex gap-3">
            <Link to="/app" className="sw-btn sw-btn-ghost text-xs py-1.5 px-3">Launch App</Link>
            <Link to="/auth" className="sw-btn sw-btn-primary text-xs py-1.5 px-3">Get API Key</Link>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-almost-white w-8 h-8 flex items-center justify-center border border-dark-grey-3 rounded"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar, collapsible on mobile */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-dark-grey-1 border-r border-dark-grey-3 transform transition-transform duration-200 ease-in-out
          md:relative md:translate-x-0 md:block md:top-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-4 border-b border-dark-grey-3 md:hidden">
            <div className="text-xs uppercase tracking-wider text-light-grey-1">Docs Menu</div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 text-light-grey-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="py-4 md:sticky md:top-14 md:max-h-[calc(100vh-3.5rem)] md:overflow-y-auto">
            {DOC_SECTIONS.map(sec => (
              <button
                key={sec.id}
                onClick={() => goToSection(sec.id)}
                className={`block w-full text-left px-5 py-2.5 text-sm transition-all duration-200 ${
                  activeSection === sec.id
                    ? 'text-almost-white bg-dark-grey-2 border-l-2 border-light-grey-3'
                    : 'text-light-grey-1 hover:text-light-grey-3 hover:bg-dark-grey-2'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content: paginated, one section shown at a time. */}
        <article id="doc-article" className="flex-1 p-6 md:p-8 lg:p-12 max-w-4xl mx-auto">
          <style>{`#doc-article > section { display: none } #doc-article > section#${activeSection} { display: block }`}</style>

          {/* 1. Introduction */}
          <section id="introduction" className="mb-12 scroll-mt-20">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-almost-white tracking-tighter leading-tight mb-4">
              Swipass API<br />
              <span className="font-serif italic font-normal text-light-grey-2 text-2xl sm:text-3xl">Developer Documentation</span>
            </h1>
            <p className={P}>
              Swipass turns a plain-language command into an executed cross-chain swap, bridge, or send. A user writes what they want, for example <span className="text-light-grey-3">"Bridge 1 ETH from Arbitrum to Polygon"</span>, and Swipass parses it, sources quotes from every connected liquidity provider, and returns ready-to-sign calldata.
            </p>
            <p className={P}>
              <span className="text-almost-white font-semibold">The certainty guarantee.</span> Every quote you are offered has already been pre-flight simulated against live chain state. An accepted quote either settles on-chain or the route is not offered in the first place. The <code className={CODE_INLINE}>guaranteed_to_amount</code> field is the on-chain floor the user is promised, and <code className={CODE_INLINE}>simulation_passed</code> tells you the route cleared simulation before it reached you.
            </p>
            <p className={P}>
              There are two audiences. <span className="text-almost-white font-semibold">End users</span> connect a wallet and go, with no account and no signup. <span className="text-almost-white font-semibold">Developers</span> create an API key in the developer dashboard, embed the flow in their own product, and earn a share of the platform fee on every transaction they route.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="px-3 py-2 bg-dark-grey-1 border border-dark-grey-3 rounded text-xs text-light-grey-2">Base URL: <code className="text-almost-white">{API_BASE || 'your-swipass-host'}</code></div>
              <div className="px-3 py-2 bg-dark-grey-1 border border-dark-grey-3 rounded text-xs text-light-grey-2">Format: <code className="text-almost-white">application/json</code></div>
              <div className="px-3 py-2 bg-dark-grey-1 border border-dark-grey-3 rounded text-xs text-light-grey-2">Custody: <code className="text-almost-white">non-custodial</code></div>
            </div>
          </section>

          {/* 2. Authentication */}
          <section id="authentication" className="mb-12 scroll-mt-20">
            <h2 className={H2}>Authentication</h2>
            <p className={P}>Swipass has two independent authentication models. Do not confuse them: one authenticates programmatic API traffic, the other signs a person into a dashboard.</p>

            <div className="bg-dark-grey-1 border border-dark-grey-3 rounded-lg p-5 mb-4">
              <h3 className="font-display text-lg font-bold text-almost-white mb-2">Developer API</h3>
              <p className="text-light-grey-1 text-sm leading-relaxed mb-3">
                All <code className={CODE_INLINE}>/v1</code> endpoints authenticate with an API key sent in the <code className={CODE_INLINE}>X-API-Key</code> header. Keys are created per project in the <Link to="/dashboard/developer" className="text-light-grey-3 underline">Developer Dashboard</Link> and are prefixed <code className={CODE_INLINE}>sw_live_</code>.
              </p>
              <CodeBlock code={`X-API-Key: sw_live_1a2b3c4d5e6f7g8h9i0j`} lang="HTTP Header" />
            </div>

            <div className="bg-dark-grey-1 border border-dark-grey-3 rounded-lg p-5 mb-4">
              <h3 className="font-display text-lg font-bold text-almost-white mb-2">Dashboards</h3>
              <p className="text-light-grey-1 text-sm leading-relaxed">
                The developer and admin dashboards sign in with self-hosted OAuth using Google or GitHub only. There are no passwords. A successful sign-in issues a session <code className={CODE_INLINE}>Bearer</code> token that the dashboard sends on its own requests. This session is entirely separate from the <code className={CODE_INLINE}>X-API-Key</code> that authenticates programmatic API calls.
              </p>
            </div>

            <div className="bg-dark-grey-1 border border-dark-grey-3 rounded-lg p-4 overflow-x-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="font-mono text-light-grey-3">X-API-Key</div>
                <div className="text-light-grey-1">sw_live_...</div>
                <div className="text-light-grey-2">Authenticates a developer project on /v1 endpoints</div>
                <div className="font-mono text-light-grey-3">Authorization</div>
                <div className="text-light-grey-1">Bearer ...</div>
                <div className="text-light-grey-2">Dashboard session (Google or GitHub OAuth)</div>
                <div className="font-mono text-light-grey-3">X-LLM-Provider</div>
                <div className="text-light-grey-1">openai | anthropic</div>
                <div className="text-light-grey-2">Optional BYO-LLM provider</div>
                <div className="font-mono text-light-grey-3">X-LLM-API-Key</div>
                <div className="text-light-grey-1">sk-...</div>
                <div className="text-light-grey-2">Optional BYO-LLM key (never stored)</div>
                <div className="font-mono text-light-grey-3">X-LLM-Model</div>
                <div className="text-light-grey-1">gpt-4o-mini</div>
                <div className="text-light-grey-2">Optional BYO-LLM model</div>
              </div>
            </div>
          </section>

          {/* 3. SDKs */}
          <section id="sdks" className="mb-12 scroll-mt-20">
            <h2 className={H2}>SDKs</h2>
            <p className={P}>
              Official SDKs wrap the REST API with typed models, retries, and the full intent lifecycle. They are the fastest way to integrate. Both surface API failures as typed errors (see the Error Reference below).
            </p>

            <h3 className="font-display text-lg font-bold text-almost-white mb-2">JavaScript / TypeScript</h3>
            <div className="mb-3"><CodeBlock code={`npm install @swipass/sdk`} lang="shell" /></div>
            <div className="mb-6"><CodeBlock code={SDK_EXAMPLES.JavaScript} lang="TypeScript" /></div>

            <h3 className="font-display text-lg font-bold text-almost-white mb-2">Python</h3>
            <div className="mb-3"><CodeBlock code={`pip install swipass`} lang="shell" /></div>
            <div className="mb-4"><CodeBlock code={SDK_EXAMPLES.Python} lang="Python" /></div>

            <p className="text-light-grey-1 text-sm leading-relaxed">
              The Python SDK also ships <code className={CODE_INLINE}>AsyncSwipassClient</code>, an asyncio client that exposes the same methods with <code className={CODE_INLINE}>await</code>. The SDK repositories contain many detailed, end-to-end examples covering quotes, transaction building, destination routing, BYO-LLM, and status reconciliation.
            </p>
          </section>

          {/* 4. Quick Start */}
          <section id="quick-start" className="mb-12 scroll-mt-20">
            <h2 className={H2}>Quick Start (raw HTTP)</h2>
            <p className={P}>
              If you prefer to call the API directly, here is the same first request in several languages. Send <code className={CODE_INLINE}>X-API-Key</code> with a POST to <code className={CODE_INLINE}>/v1/intent</code>. The optional <code className={CODE_INLINE}>destination_address</code> routes output to a recipient other than the signer.
            </p>
            <ExampleTabs examples={HTTP_EXAMPLES['Quick Start']} langs={HTTP_LANGS} />
          </section>

          {/* 5. Endpoints */}
          <section id="endpoints" className="mb-12 scroll-mt-20">
            <h2 className={H2}>Endpoints</h2>
            <p className={P}>The complete public API surface. Reference endpoints (chains, providers, ratings, stats) require no key.</p>
            <div className="space-y-4 mb-8">
              {[
                { method:'POST', path:'/v1/intent', desc:'Parse a natural-language command, source and score quotes from every provider, run pre-flight simulation, and return the best quote plus ready-to-sign calldata.', auth:'X-API-Key (optional)', body:'command, wallet_address?, destination_address?, from_chain_hint?' },
                { method:'POST', path:'/v1/intent/build-transaction', desc:'Rebuild calldata for a specific quote from a prior all_quotes array, for example to pick a different provider than the auto-selected one.', auth:'X-Wallet-Address (header)', body:'a quote object from all_quotes' },
                { method:'GET', path:'/v1/stats', desc:'Real-time platform statistics: volume, transactions, chains, providers.', auth:'None', body:'-' },
                { method:'GET', path:'/v1/chains', desc:'Every supported chain, with its numeric id, native asset and explorer, computed from the active providers.', auth:'None', body:'-' },
                { method:'GET', path:'/v1/tokens?chain=base', desc:'Tokens resolvable on a chain: the native asset plus known ERC20s. A symbol missing here is rejected at validation, never guessed.', auth:'None', body:'-' },
                { method:'GET', path:'/v1/providers', desc:'List active execution providers and the chains each supports.', auth:'None', body:'-' },
                { method:'GET', path:'/v1/analytics/providers', desc:'Public provider ratings (success rate, average truth-return) used to sort and filter quotes.', auth:'None', body:'-' },
                { method:'POST', path:'/v1/intents/{intent_id}/status', desc:'Reconciliation hook. Call after the wallet signs and the tx settles so the analytics engine can compute truth-return (actual vs quoted).', auth:'X-API-Key (optional)', body:'tx_hash, status, actual_to_amount?' },
                { method:'GET', path:'/v1/intents/{intent_id}/trace', desc:'The stage-by-stage record of one of your intents: parsed intent, execution graph, every quote, the route chosen, the transaction, and the settled truth-return.', auth:'X-API-Key (required)', body:'-' },
              ].map(ep => (
                <div key={ep.path} className="bg-dark-grey-1 border border-dark-grey-3 rounded-lg p-4">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded ${
                      ep.method === 'POST' ? 'bg-mid-grey text-almost-white' : 'bg-dark-grey-2 text-light-grey-1'
                    }`}>{ep.method}</span>
                    <code className="font-mono text-sm text-light-grey-3">{ep.path}</code>
                  </div>
                  <p className="text-light-grey-2 text-sm mb-2">{ep.desc}</p>
                  <div className="text-xs text-light-grey-1">Auth: {ep.auth} · Body: {ep.body}</div>
                </div>
              ))}
            </div>

            <h3 className="font-display text-lg font-bold text-almost-white mb-2">POST /v1/intent</h3>
            <p className="text-light-grey-1 text-sm leading-relaxed mb-3">
              Request body fields: <code className={CODE_INLINE}>command</code> (required), <code className={CODE_INLINE}>wallet_address</code>, <code className={CODE_INLINE}>destination_address</code>, and <code className={CODE_INLINE}>from_chain_hint</code>. Optional headers: <code className={CODE_INLINE}>X-API-Key</code>, and the BYO-LLM trio <code className={CODE_INLINE}>X-LLM-Provider</code> / <code className={CODE_INLINE}>X-LLM-API-Key</code> / <code className={CODE_INLINE}>X-LLM-Model</code>. The response is an <code className={CODE_INLINE}>IntentResponse</code>:
            </p>
            <div className="mb-6"><CodeBlock code={INTENT_RESPONSE_JSON} lang="JSON response" /></div>
            <p className="text-light-grey-1 text-sm leading-relaxed mb-6">
              <code className={CODE_INLINE}>quote</code> is the auto-selected best route, and <code className={CODE_INLINE}>all_quotes</code> holds every provider quote (best first) so you can offer alternatives. <code className={CODE_INLINE}>transaction</code> is the calldata to sign for the selected quote. <code className={CODE_INLINE}>guaranteed_to_amount</code> is the on-chain floor and <code className={CODE_INLINE}>simulation_passed</code> confirms the route cleared pre-flight simulation. It is never set optimistically: when it is false, <code className={CODE_INLINE}>simulation_reason</code> says what stopped the check.
            </p>

            <h3 className="font-display text-lg font-bold text-almost-white mb-2">POST /v1/intent/build-transaction</h3>
            <p className="text-light-grey-1 text-sm leading-relaxed mb-3">
              Post one quote object from a prior <code className={CODE_INLINE}>all_quotes</code> array to rebuild calldata for that specific provider. The signer goes in the <code className={CODE_INLINE}>X-Wallet-Address</code> header; add <code className={CODE_INLINE}>X-Destination-Address</code> to route output elsewhere.
            </p>
            <div className="mb-4"><CodeBlock code={BUILD_TX_REQUEST} lang="HTTP request" /></div>
            <p className="text-light-grey-1 text-sm leading-relaxed mb-3">The response carries the whole sequence to sign, not just the transaction:</p>
            <div className="mb-6"><CodeBlock code={BUILD_TX_RESPONSE} lang="JSON response" /></div>
            <p className="text-light-grey-1 text-sm leading-relaxed mb-3">
              When the route spends an ERC20 the provider is not yet allowed to move, the same call returns the approval to sign first. See <a href="#approvals" className="text-light-grey-3 underline">Token Approvals</a>.
            </p>
            <div><CodeBlock code={APPROVAL_RESPONSE} lang="JSON response" /></div>
          </section>

          {/* 6. Execution flow */}
          <section id="execution-flow" className="mb-12 scroll-mt-20">
            <h2 className={H2}>Execution Flow</h2>
            <p className={P}>Swipass is non-custodial. The backend never holds funds and never signs. It returns calldata; your user's wallet signs and broadcasts. The full lifecycle:</p>
            <ol className="space-y-4">
              {[
                ['Create the intent', <>POST the natural-language <code className={CODE_INLINE}>command</code> to <code className={CODE_INLINE}>/v1/intent</code>. You get back a scored, pre-flight-simulated <code className={CODE_INLINE}>quote</code>, the full <code className={CODE_INLINE}>all_quotes</code> set, and ready-to-sign <code className={CODE_INLINE}>transaction</code> calldata.</>],
                ['Inspect the quote', <>Read <code className={CODE_INLINE}>guaranteed_to_amount</code> (the on-chain floor the user is promised) and check <code className={CODE_INLINE}>simulation_passed</code>. When it is false, <code className={CODE_INLINE}>simulation_reason</code> says why: <code className={CODE_INLINE}>needs_approval</code> means the route is ready once the approval below is signed, <code className={CODE_INLINE}>no_rpc</code> means nothing could be verified.</>],
                ['Sign the approval, if there is one', <>When <code className={CODE_INLINE}>requires_approval</code> is true, the route spends an ERC20 the provider is not yet allowed to move. Sign the <code className={CODE_INLINE}>approval</code> payload first, then call <code className={CODE_INLINE}>/v1/intent/build-transaction</code> again for the ready transaction.</>],
                ['Optionally choose another route', <>If you want a different provider than the auto-selected one, POST that quote from <code className={CODE_INLINE}>all_quotes</code> to <code className={CODE_INLINE}>/v1/intent/build-transaction</code> to get fresh calldata, plus any approval it still needs.</>],
                ['Sign and broadcast', <>Hand the returned <code className={CODE_INLINE}>transaction</code> calldata to the user's wallet to sign and submit. Swipass is never in the signing path.</>],
                ['Report status', <>Once the tx settles, POST to <code className={CODE_INLINE}>/v1/intents/{'{intent_id}'}/status</code> with <code className={CODE_INLINE}>tx_hash</code>, <code className={CODE_INLINE}>status</code>, and optionally <code className={CODE_INLINE}>actual_to_amount</code>. This reconciles the intent and powers truth-return analytics.</>],
              ].map(([title, body], i) => (
                <li key={i} className="flex gap-4 bg-dark-grey-1 border border-dark-grey-3 rounded-lg p-4">
                  <span className="font-display text-xl font-extrabold text-light-grey-3 shrink-0">{i + 1}</span>
                  <div>
                    <div className="text-almost-white font-semibold text-sm mb-1">{title}</div>
                    <p className="text-light-grey-1 text-sm leading-relaxed">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Token approvals */}
          <section id="approvals" className="mb-12 scroll-mt-20">
            <h2 className={H2}>Token Approvals</h2>
            <p className={P}>
              An ERC20 cannot be moved by a router the user has not approved. Swipass reads the real on-chain allowance while it builds the route, so you never discover the problem by paying gas for a revert.
            </p>
            <p className={P}>
              When the allowance is short, <code className={CODE_INLINE}>requires_approval</code> is <code className={CODE_INLINE}>true</code> and <code className={CODE_INLINE}>approval</code> carries the exact <code className={CODE_INLINE}>approve(spender, amount)</code> call to sign first. It approves the amount this route needs, not an unlimited allowance. Native assets never need one.
            </p>
            <div className="bg-dark-grey-1 border border-dark-grey-3 rounded-lg p-4 mb-6">
              <ol className="space-y-2 text-sm text-light-grey-1 leading-relaxed list-decimal list-inside">
                <li>Send the <code className={CODE_INLINE}>approval</code> transaction from the same wallet and wait for its receipt.</li>
                <li>Call <code className={CODE_INLINE}>/v1/intent/build-transaction</code> again for the same quote.</li>
                <li>If <code className={CODE_INLINE}>requires_approval</code> is now false, sign the <code className={CODE_INLINE}>transaction</code>.</li>
              </ol>
            </div>
            <p className={P}>
              Some tokens refuse to change a non-zero allowance directly. For those the first step comes back with <code className={CODE_INLINE}>is_reset</code> set and an amount of zero: sign it, request the build again, and you get the real approval next. Repeating the loop above handles both cases without special-casing any token.
            </p>
          </section>

          {/* Webhooks */}
          <section id="webhooks" className="mb-12 scroll-mt-20">
            <h2 className={H2}>Webhooks</h2>
            <p className={P}>
              Register an endpoint on your project in the developer dashboard and Swipass will POST each intent lifecycle event to it, so your app learns what happened without polling.
            </p>
            <div className="border border-dark-grey-3 rounded-lg overflow-hidden mb-6">
              <table className="w-full text-sm">
                <thead className="bg-dark-grey-2 text-light-grey-1 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-3 text-left">Event</th>
                    <th className="p-3 text-left">When it fires</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['intent.quoted', 'A route was selected and a transaction built for one of your users.'],
                    ['intent.completed', 'The transaction settled. Carries the truth return: what landed versus what was quoted.'],
                    ['intent.failed', 'The transaction did not settle.'],
                  ].map(([event, when]) => (
                    <tr key={event} className="border-b border-dark-grey-3 last:border-0">
                      <td className="p-3"><code className={CODE_INLINE}>{event}</code></td>
                      <td className="p-3 text-light-grey-1">{when}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={P}>
              Every delivery is signed so you can prove it came from us. The <code className={CODE_INLINE}>X-Swipass-Signature</code> header is <code className={CODE_INLINE}>t=&lt;unix&gt;,v1=&lt;hmac&gt;</code>: recompute <code className={CODE_INLINE}>HMAC-SHA256(secret, t + "." + rawBody)</code> and compare it in constant time. The timestamp is inside the signed material, so a captured delivery cannot be replayed as a fresh one.
            </p>
            <CodeBlock
              lang="javascript"
              code={`import crypto from "node:crypto";

// Verify a Swipass webhook. Use the raw body, not a re-serialized object.
function verify(secret, header, rawBody) {
  const parts = Object.fromEntries(header.split(",").map(p => p.split("=")));
  const expected = crypto
    .createHmac("sha256", secret)
    .update(parts.t + "." + rawBody)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1));
}`}
            />
            <p className={`${P} mt-6`}>
              Reply with any 2xx to acknowledge. A failing endpoint is retried three times with a short backoff, and every attempt, with the status your server returned, is listed in the dashboard.
            </p>
          </section>

          {/* Traces */}
          <section id="traces" className="mb-12 scroll-mt-20">
            <h2 className={H2}>Traces</h2>
            <p className={P}>
              Every intent records what actually happened, stage by stage: the parsed intent, the execution graph derived from it, every quote received, the route chosen, the transaction built, and the settled outcome once reported. This is how you answer why a route won and what the user really received.
            </p>
            <p className={P}>
              <code className={CODE_INLINE}>GET /v1/intents/{'{intent_id}'}/trace</code> with your <code className={CODE_INLINE}>X-API-Key</code> returns the trace for an intent your project produced, and only yours. The same record is available in your dashboard.
            </p>
            <CodeBlock
              lang="bash"
              code={`curl ${API_BASE}/v1/intents/$INTENT_ID/trace \\
  -H "X-API-Key: $SWIPASS_API_KEY"`}
            />
            <p className={`${P} mt-6`}>
              <code className={CODE_INLINE}>truth_return_bps</code> is the settled amount against the quoted amount, in basis points. Negative means the user received less than the quote showed. It is what provider ratings are built from, so routing is scored on what settled rather than on what was promised.
            </p>
          </section>

          {/* 7. BYO-LLM */}
          <section id="byollm" className="mb-12 scroll-mt-20">
            <h2 className={H2}>BYO-LLM (Bring Your Own LLM)</h2>
            <p className={P}>
              Command parsing runs through a language model. By default Swipass uses its own, but you can supply your own provider and key per request with the <code className={CODE_INLINE}>X-LLM-Provider</code> (<code className={CODE_INLINE}>openai</code> or <code className={CODE_INLINE}>anthropic</code>), <code className={CODE_INLINE}>X-LLM-API-Key</code>, and <code className={CODE_INLINE}>X-LLM-Model</code> headers. Keys are used only for that single request and are never stored.
            </p>
            <ExampleTabs examples={HTTP_EXAMPLES['BYO-LLM']} langs={HTTP_LANGS} />
          </section>

          {/* 8. Destination address */}
          <section id="destination" className="mb-12 scroll-mt-20">
            <h2 className={H2}>Destination Address</h2>
            <p className={P}>
              By default, output lands in the signing wallet on the destination chain. To send it to a different recipient, set <code className={CODE_INLINE}>destination_address</code> on the intent. When you rebuild calldata for another quote, carry the recipient through with the <code className={CODE_INLINE}>X-Destination-Address</code> header on <code className={CODE_INLINE}>/v1/intent/build-transaction</code>. The <code className={CODE_INLINE}>destination_note</code> field confirms where funds will arrive.
            </p>
            <ExampleTabs examples={HTTP_EXAMPLES['Destination Address']} langs={HTTP_LANGS} />
          </section>

          {/* 9. Providers */}
          <section id="providers" className="mb-12 scroll-mt-20">
            <h2 className={H2}>Providers</h2>
            <p className={P}>
              Swipass queries every active provider at once, then scores their quotes. The current set spans DEX aggregators and cross-chain bridges:
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {['0x', '1inch', 'Uniswap', 'LI.FI', 'Socket / Bungee', 'Across', 'Stargate'].map(name => (
                <span key={name} className="px-3 py-1.5 bg-dark-grey-1 border border-dark-grey-3 rounded text-sm text-light-grey-2">{name}</span>
              ))}
            </div>
            <p className="text-light-grey-1 text-sm sm:text-base leading-relaxed mb-4">Quotes are ranked by a weighted score:</p>
            <div className="flex flex-wrap gap-8 p-5 bg-dark-grey-1 border border-dark-grey-3 rounded-lg mb-6">
              {[['Output Amount','70%'],['Speed','20%'],['Historical Success','10%']].map(([l,v]) => (
                <div key={l}>
                  <div className="text-xs uppercase tracking-wider text-light-grey-1 mb-1">{l}</div>
                  <div className="font-display text-2xl font-bold text-almost-white">{v}</div>
                </div>
              ))}
            </div>
            <p className="text-light-grey-1 text-sm leading-relaxed">
              If the selected provider fails while building the transaction, Swipass fails over to the next best quote from the original set before anything is signed. Providers are modular, so new protocols can be added without changing the API surface. The public <code className={CODE_INLINE}>/v1/analytics/providers</code> ratings feed the historical-success weight.
            </p>
          </section>

          {/* 10. Fees & revenue sharing */}
          <section id="fees" className="mb-12 scroll-mt-20">
            <h2 className={H2}>Fees & Revenue Sharing</h2>
            <p className={P}>The platform fee is taken from the swap output. Developers who route volume earn a share of it.</p>
            <div className="border border-dark-grey-3 rounded-lg overflow-hidden overflow-x-auto mb-6">
              <table className="w-full">
                <thead className="bg-dark-grey-2 text-light-grey-1 text-xs uppercase tracking-wider">
                  <tr><th className="p-3 text-left">User Type</th><th className="p-3 text-left">Platform Fee</th><th className="p-3 text-left">Developer Share</th></tr>
                </thead>
                <tbody>
                  <tr className="border-b border-dark-grey-3"><td className="p-3 text-light-grey-2">Direct Swipass user</td><td className="p-3 text-light-grey-2">{fees.direct || '-'}</td><td className="p-3 text-light-grey-2">n/a</td></tr>
                  <tr className="bg-dark-grey-1"><td className="p-3 text-almost-white font-medium">Via a developer app</td><td className="p-3 text-light-grey-2">{fees.developer || '-'}</td><td className="p-3 text-almost-white font-semibold">{fees.developerCut || '-'}{fees.revenueShare ? ` (${fees.revenueShare} share)` : ''}</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-light-grey-1 text-sm leading-relaxed">
              For transactions routed through a developer app, the {fees.developer || 'platform'} fee is split {fees.revenueShare ? `${fees.revenueShare} to the developer` : 'with the developer'}, so the developer earns {fees.developerCut || 'their share'}. The split is configurable per project. Earnings accrue in your project balance and become withdrawable once the balance passes the payout threshold, paid to your configured EVM payout wallet. These rates are read live from the API, so what you see here is what is in force.
            </p>
          </section>

          {/* 11. Error reference */}
          <section id="errors" className="mb-12 scroll-mt-20">
            <h2 className={H2}>Error Reference</h2>
            <p className={P}>Errors return a consistent envelope with an HTTP status and a structured body:</p>
            <div className="mb-6"><CodeBlock code={ERROR_ENVELOPE} lang="JSON error envelope" /></div>
            <div className="border border-dark-grey-3 rounded-lg overflow-hidden overflow-x-auto mb-4">
              <table className="w-full text-sm">
                <thead className="bg-dark-grey-2 text-light-grey-1 text-xs uppercase tracking-wider">
                  <tr><th className="p-3 text-left">Status</th><th className="p-3 text-left">error</th><th className="p-3 text-left">When it happens</th></tr>
                </thead>
                <tbody>
                  {[
                    [422,'intent_error','Validation failed: the command could not be parsed or routed, or no LLM was configured for parsing.'],
                    [403,'forbidden','The wallet or destination address is blocked, or the project is paused.'],
                    [429,'rate_limited','Too many requests. Back off and retry.'],
                    [503,'service_paused','The platform is temporarily paused for maintenance.'],
                    [500,'internal_error','Unexpected server error. Retry with backoff.'],
                  ].map(([status, code, msg]) => (
                    <tr key={code as string} className="border-b border-dark-grey-3">
                      <td className="p-3 font-mono text-light-grey-2 align-top">{status}</td>
                      <td className="p-3 font-mono text-light-grey-2 align-top">{code}</td>
                      <td className="p-3 text-light-grey-1">{msg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-light-grey-1 text-sm leading-relaxed">The official SDKs surface these responses as typed errors, so you can branch on the status without parsing the envelope by hand.</p>
          </section>

          {/* Previous / Next pagination */}
          <div className="mt-4 pt-6 border-t border-dark-grey-3 grid grid-cols-2 gap-4">
            {prevSection ? (
              <button
                onClick={() => goToSection(prevSection.id)}
                className="group text-left p-4 border border-dark-grey-3 rounded-lg hover:border-light-grey-1 hover:bg-dark-grey-2 transition-all duration-200"
              >
                <div className="text-xs uppercase tracking-wider text-light-grey-1 mb-1">Previous</div>
                <div className="font-display text-sm font-semibold text-light-grey-3 group-hover:text-almost-white">
                  {prevSection.label}
                </div>
              </button>
            ) : (
              <span />
            )}
            {nextSection ? (
              <button
                onClick={() => goToSection(nextSection.id)}
                className="group text-right p-4 border border-dark-grey-3 rounded-lg hover:border-light-grey-1 hover:bg-dark-grey-2 transition-all duration-200"
              >
                <div className="text-xs uppercase tracking-wider text-light-grey-1 mb-1">Next</div>
                <div className="font-display text-sm font-semibold text-light-grey-3 group-hover:text-almost-white">
                  {nextSection.label}
                </div>
              </button>
            ) : (
              <span />
            )}
          </div>

        </article>
      </div>
    </div>
  )
}
