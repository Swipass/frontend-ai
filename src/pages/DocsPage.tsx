// src/pages/DocsPage.tsx
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const LANGS = ['JavaScript', 'Python', 'Go', 'Rust', 'cURL']

const CODE_EXAMPLES: Record<string, Record<string, string>> = {
  'Quick Start': {
    JavaScript: `import fetch from 'node-fetch'; // or use native fetch

const response = await fetch('https://api.swipass.xyz/v1/intent', {
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
console.log('Selected Provider:', data.selected_provider);
console.log('To Amount:', data.quote.to_amount, data.quote.to_token);
console.log('Transaction:', data.transaction);`,

    Python: `import requests

response = requests.post(
    'https://api.swipass.xyz/v1/intent',
    headers={
        'Content-Type': 'application/json',
        'X-API-Key': 'sw_live_your_api_key_here',
    },
    json={
        'command': 'Bridge 1 ETH from Arbitrum to Polygon',
        'destination_address': '0xRecipientAddress',  # optional
    }
)

data = response.json()
print(f"Intent ID: {data['intent_id']}")
print(f"Provider: {data['selected_provider']}")
print(f"To Amount: {data['quote']['to_amount']} {data['quote']['to_token']}")`,

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
        "https://api.swipass.xyz/v1/intent",
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
        .post("https://api.swipass.xyz/v1/intent")
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
    println!("To Amount: {} {}",
        data["quote"]["to_amount"],
        data["quote"]["to_token"]);

    Ok(())
}`,

    cURL: `curl -X POST https://api.swipass.xyz/v1/intent \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: sw_live_your_api_key_here" \\
  -d '{
    "command": "Bridge 1 ETH from Arbitrum to Polygon",
    "destination_address": "0xRecipientAddress"
  }'`,
  },

  'BYO-LLM': {
    JavaScript: `// Pass your own LLM credentials per request
const response = await fetch('https://api.swipass.xyz/v1/intent', {
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
    'https://api.swipass.xyz/v1/intent',
    headers={
        'X-API-Key': 'sw_live_your_key',
        'X-LLM-Provider': 'anthropic',
        'X-LLM-API-Key': 'sk-ant-your-key',
        'X-LLM-Model': 'claude-haiku-4-5-20251001',
    },
    json={'command': 'Swap 500 USDC for WETH on Arbitrum'}
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

    cURL: `curl -X POST https://api.swipass.xyz/v1/intent \\
  -H "X-API-Key: sw_live_your_key" \\
  -H "X-LLM-Provider: openai" \\
  -H "X-LLM-API-Key: sk-your-openai-key" \\
  -H "X-LLM-Model: gpt-4o-mini" \\
  -d '{"command": "Swap 500 USDC for WETH on Arbitrum"}'`,
  },

  'Destination Address': {
    JavaScript: `// Send assets to a DIFFERENT address than the signing wallet
// This works for both direct users and developer API
const response = await fetch('https://api.swipass.xyz/v1/intent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'sw_live_your_key',
  },
  body: JSON.stringify({
    command: 'Bridge 2 ETH from Ethereum to Polygon',
    // Funds land here on the destination chain, not the signing wallet
    destination_address: '0xDifferentRecipientOnPolygon',
    wallet_address: '0xMySigningWallet',  // wallet that signs
  }),
});

const data = await response.json();
// data.destination_note confirms where funds will go`,

    Python: `response = requests.post(
    'https://api.swipass.xyz/v1/intent',
    headers={'X-API-Key': 'sw_live_your_key'},
    json={
        'command': 'Bridge 2 ETH from Ethereum to Polygon',
        'destination_address': '0xDifferentRecipient',
        'wallet_address': '0xMySigningWallet',
    }
)
data = response.json()
print(data['destination_note'])  # confirms routing`,

    Go: `json.Marshal(map[string]string{
    "command":              "Bridge 2 ETH to Polygon",
    "destination_address":  "0xDifferentRecipient",
    "wallet_address":       "0xMySigningWallet",
})`,

    Rust: `json!({
    "command": "Bridge 2 ETH to Polygon",
    "destination_address": "0xDifferentRecipient",
    "wallet_address": "0xMySigningWallet",
})`,

    cURL: `curl -X POST https://api.swipass.xyz/v1/intent \\
  -H "X-API-Key: sw_live_your_key" \\
  -d '{
    "command": "Bridge 2 ETH from Ethereum to Polygon",
    "destination_address": "0xDifferentRecipient",
    "wallet_address": "0xMySigningWallet"
  }'`,
  },
}

const DOC_SECTIONS = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'authentication', label: 'Authentication' },
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'endpoints', label: 'Endpoints' },
  { id: 'byollm', label: 'BYO-LLM' },
  { id: 'destination', label: 'Destination Address' },
  { id: 'errors', label: 'Error Reference' },
  { id: 'providers', label: 'Providers' },
  { id: 'fees', label: 'Fees & Revenue' },
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

function ExampleTabs({ examples }: { examples: Record<string, string> }) {
  const [activeLang, setActiveLang] = useState('JavaScript')
  return (
    <div>
      <div className="flex flex-wrap border-b border-dark-grey-3 mb-4">
        {LANGS.map(lang => (
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

export default function DocsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('introduction')
  const location = useLocation()

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  // Update active section based on scroll (simplified: just set from hash)
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash && DOC_SECTIONS.some(s => s.id === hash)) {
      setActiveSection(hash)
    }
  }, [])

  const scrollToSection = (id: string) => {
    setActiveSection(id)
    setMobileMenuOpen(false)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-deepest-dark font-mono">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-deepest-dark/85 backdrop-blur-md border-b border-dark-grey-3 px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold text-almost-white tracking-tighter">
            Swipass
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
        {/* Sidebar – collapsible on mobile */}
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
          <nav className="py-4">
            {DOC_SECTIONS.map(sec => (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
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

        {/* Main content */}
        <article className="flex-1 p-6 md:p-8 lg:p-12 max-w-4xl mx-auto">
          <section id="introduction" className="mb-12 scroll-mt-20">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-almost-white tracking-tighter leading-tight mb-4">
              Swipass API<br />
              <span className="font-serif italic font-normal text-light-grey-2 text-2xl sm:text-3xl">Developer Documentation</span>
            </h1>
            <p className="text-light-grey-1 text-sm sm:text-base leading-relaxed mb-6">
              Swipass gives you a single REST endpoint to execute any cross-chain swap, bridge, or send in natural language. Your users just type (or speak) what they want — Swipass handles the rest.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="px-3 py-2 bg-dark-grey-1 border border-dark-grey-3 rounded text-xs text-light-grey-2">Base URL: <code className="text-almost-white">https://api.swipass.xyz</code></div>
              <div className="px-3 py-2 bg-dark-grey-1 border border-dark-grey-3 rounded text-xs text-light-grey-2">Format: <code className="text-almost-white">application/json</code></div>
            </div>
          </section>

          <section id="authentication" className="mb-12 scroll-mt-20">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-almost-white tracking-tighter mb-4">Authentication</h2>
            <p className="text-light-grey-1 text-sm sm:text-base leading-relaxed mb-6">
              All developer API requests must include your API key via the <code className="bg-dark-grey-2 px-1 py-0.5 rounded text-light-grey-3 text-xs">X-API-Key</code> header. 
              Get your key by creating a project in the <Link to="/dashboard/developer" className="text-light-grey-3 underline">Developer Dashboard</Link>.
            </p>
            <div className="bg-dark-grey-1 border border-dark-grey-3 rounded-lg p-4 mb-4 overflow-x-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="font-mono text-light-grey-3">X-API-Key</div>
                <div className="text-light-grey-1">sw_live_...</div>
                <div className="text-light-grey-2">Required for developer projects</div>
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

          <section id="quick-start" className="mb-12 scroll-mt-20">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-almost-white tracking-tighter mb-4">Quick Start</h2>
            <p className="text-light-grey-1 text-sm sm:text-base leading-relaxed mb-6">Make your first cross-chain intent request in under 2 minutes.</p>
            <ExampleTabs examples={CODE_EXAMPLES['Quick Start']} />
          </section>

          <section id="endpoints" className="mb-12 scroll-mt-20">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-almost-white tracking-tighter mb-6">API Endpoints</h2>
            <div className="space-y-4">
              {[
                { method:'POST', path:'/v1/intent', desc:'Execute a cross-chain intent from natural language.', auth:'Optional (X-API-Key)', body:'command, destination_address?, wallet_address?' },
                { method:'GET', path:'/v1/stats', desc:'Real-time platform statistics.', auth:'None', body:'-' },
                { method:'GET', path:'/v1/chains', desc:'List all supported chains.', auth:'None', body:'-' },
                { method:'GET', path:'/v1/providers', desc:'List active execution providers.', auth:'None', body:'-' },
                { method:'GET', path:'/platform/projects', desc:'List your developer projects.', auth:'Clerk JWT', body:'-' },
                { method:'POST', path:'/platform/projects', desc:'Create a new project.', auth:'Clerk JWT', body:'name, description?' },
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
          </section>

          <section id="byollm" className="mb-12 scroll-mt-20">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-almost-white tracking-tighter mb-4">BYO-LLM (Bring Your Own LLM)</h2>
            <p className="text-light-grey-1 text-sm sm:text-base leading-relaxed mb-6">Pass your own LLM API keys per request to control costs and choose your preferred model. Keys are used only for that single request and never stored by Swipass.</p>
            <ExampleTabs examples={CODE_EXAMPLES['BYO-LLM']} />
          </section>

          <section id="destination" className="mb-12 scroll-mt-20">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-almost-white tracking-tighter mb-4">Destination Address</h2>
            <p className="text-light-grey-1 text-sm sm:text-base leading-relaxed mb-6">By default, bridged or swapped assets go to the connected wallet on the destination chain. Pass <code className="bg-dark-grey-2 px-1 py-0.5 rounded text-light-grey-3 text-xs">destination_address</code> to send funds to a different address. This works for both direct users and developer integrations.</p>
            <ExampleTabs examples={CODE_EXAMPLES['Destination Address']} />
          </section>

          <section id="errors" className="mb-12 scroll-mt-20">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-almost-white tracking-tighter mb-6">Error Reference</h2>
            <div className="border border-dark-grey-3 rounded-lg overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-dark-grey-2 text-light-grey-1 text-xs uppercase tracking-wider">
                  <tr><th className="p-3">Status</th><th className="p-3">Code</th><th className="p-3">Message</th></tr>
                </thead>
                <tbody>
                  {[
                    [422,'intent_error','Failed to parse command or route the intent'],
                    [401,'unauthorized','Authentication required or API key invalid'],
                    [403,'project_paused','API key project has been paused'],
                    [429,'rate_limited','Too many requests. Slow down.'],
                    [503,'service_paused','Platform is temporarily paused for maintenance'],
                    [500,'internal_error','Unexpected server error. Retry with backoff.'],
                  ].map(([status, code, msg]) => (
                    <tr key={code as string} className="border-b border-dark-grey-3">
                      <td className="p-3 font-mono text-light-grey-2">{status}</td>
                      <td className="p-3 font-mono text-light-grey-2">{code}</td>
                      <td className="p-3 text-light-grey-1">{msg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="providers" className="mb-12 scroll-mt-20">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-almost-white tracking-tighter mb-4">Providers</h2>
            <p className="text-light-grey-1 text-sm sm:text-base leading-relaxed mb-6">Swipass queries all active providers simultaneously and selects the best quote using a weighted scoring algorithm:</p>
            <div className="flex flex-wrap gap-8 p-5 bg-dark-grey-1 border border-dark-grey-3 rounded-lg mb-6">
              {[['Output Amount','70%'],['Speed','20%'],['Historical Success Rate','10%']].map(([l,v]) => (
                <div key={l}>
                  <div className="text-xs uppercase tracking-wider text-light-grey-1 mb-1">{l}</div>
                  <div className="font-display text-2xl font-bold text-almost-white">{v}</div>
                </div>
              ))}
            </div>
            <p className="text-light-grey-1 text-sm leading-relaxed">If the selected provider fails during transaction building, Swipass automatically falls back to the next best provider from the original quote set. Providers are modular — new protocols can be added without any changes to the API interface.</p>
          </section>

          <section id="fees" className="mb-12 scroll-mt-20">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-almost-white tracking-tighter mb-6">Fees & Revenue Sharing</h2>
            <div className="border border-dark-grey-3 rounded-lg overflow-hidden mb-6">
              <table className="w-full">
                <thead className="bg-dark-grey-2 text-light-grey-1 text-xs uppercase tracking-wider">
                  <tr><th className="p-3">User Type</th><th className="p-3">Platform Fee</th><th className="p-3">Your Share</th></tr>
                </thead>
                <tbody>
                  <tr className="border-b border-dark-grey-3"><td className="p-3 text-light-grey-2">Direct Swipass User</td><td className="p-3 text-light-grey-2">0.10%</td><td className="p-3 text-light-grey-2">—</td></tr>
                  <tr className="bg-dark-grey-1"><td className="p-3 text-almost-white font-medium">Via Developer App</td><td className="p-3 text-light-grey-2">0.15%</td><td className="p-3 text-almost-white font-semibold">0.075% (50%)</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-light-grey-1 text-sm leading-relaxed">Developer earnings accumulate in your project balance. Once your balance reaches $50 USD equivalent, the "Withdraw" button activates in your dashboard. Withdrawals go to your configured EVM payout wallet.</p>
          </section>
        </article>
      </div>
    </div>
  )
}