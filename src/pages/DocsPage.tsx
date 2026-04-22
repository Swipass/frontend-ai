// src/pages/DocsPage.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'

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
    <div style={{ position:'relative', background:'var(--gray-50)', border:'1px solid var(--gray-300)', borderRadius:8, overflow:'hidden' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.5rem 1rem', background:'var(--gray-200)', borderBottom:'1px solid var(--gray-300)' }}>
        <span style={{ fontSize:'0.65rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gray-500)' }}>{lang}</span>
        <button onClick={copy} style={{ background:'none', border:'none', fontSize:'0.65rem', color:'var(--gray-500)', cursor:'none', fontFamily:"'DM Mono',monospace", letterSpacing:'0.06em', textTransform:'uppercase' }}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre style={{ padding:'1.25rem', fontFamily:"'DM Mono',monospace", fontSize:'0.78rem', color:'var(--gray-600)', lineHeight:1.7, margin:0, overflow:'auto', maxHeight:400 }}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

function ExampleTabs({ examples }: { examples: Record<string, string> }) {
  const [activeLang, setActiveLang] = useState('JavaScript')
  return (
    <div>
      <div style={{ display:'flex', gap:0, borderBottom:'1px solid var(--gray-300)', marginBottom:'1rem' }}>
        {LANGS.map(lang => (
          <button key={lang} onClick={() => setActiveLang(lang)}
            style={{ padding:'0.5rem 1rem', fontFamily:"'DM Mono',monospace", fontSize:'0.72rem', letterSpacing:'0.06em', textTransform:'uppercase', color: activeLang===lang ? 'var(--gray-900)' : 'var(--gray-500)', background:'none', border:'none', borderBottom: activeLang===lang ? '2px solid var(--gray-700)' : '2px solid transparent', cursor:'none', transition:'all 0.2s', marginBottom:-1 }}>
            {lang}
          </button>
        ))}
      </div>
      <CodeBlock code={examples[activeLang] || '// Not available for this language'} lang={activeLang} />
    </div>
  )
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('introduction')

  return (
    <div style={{ minHeight:'100vh', background:'var(--gray-50)', fontFamily:"'DM Mono',monospace" }}>
      {/* Header */}
      <header style={{ position:'sticky', top:0, background:'rgba(10,10,10,0.85)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--gray-300)', padding:'0 2rem', height:56, display:'flex', alignItems:'center', justifyContent:'space-between', zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'1.5rem' }}>
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontFamily:"'Syne',sans-serif", fontSize:'1rem', fontWeight:800, color:'var(--gray-900)', letterSpacing:'-0.03em' }}>
            <div style={{ width:24, height:24, border:'1.5px solid var(--gray-500)', borderRadius:5, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.55rem', color:'var(--gray-500)' }}>SW</div>
            Swipass
          </Link>
          <span style={{ fontSize:'0.7rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gray-500)', padding:'0.2rem 0.6rem', border:'1px solid var(--gray-300)', borderRadius:3 }}>Docs</span>
        </div>
        <div style={{ display:'flex', gap:'0.75rem' }}>
          <Link to="/app" className="sw-btn sw-btn-ghost" style={{ fontSize:'0.68rem', padding:'0.4rem 0.85rem' }}>Launch App</Link>
          <Link to="/auth" className="sw-btn sw-btn-primary" style={{ fontSize:'0.68rem', padding:'0.4rem 0.85rem' }}>Get API Key</Link>
        </div>
      </header>

      <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', maxWidth:1280, margin:'0 auto', minHeight:'calc(100vh - 56px)' }}>
        {/* Sidebar nav */}
        <nav style={{ padding:'2rem 0', borderRight:'1px solid var(--gray-300)', position:'sticky', top:56, height:'calc(100vh - 56px)', overflowY:'auto' }}>
          {DOC_SECTIONS.map(sec => (
            <a key={sec.id} href={`#${sec.id}`} onClick={() => setActiveSection(sec.id)}
              style={{ display:'block', padding:'0.55rem 1.5rem', fontSize:'0.78rem', color: activeSection===sec.id ? 'var(--gray-900)' : 'var(--gray-500)', borderLeft: activeSection===sec.id ? '2px solid var(--gray-700)' : '2px solid transparent', transition:'all 0.2s' }}>
              {sec.label}
            </a>
          ))}
        </nav>

        {/* Content */}
        <article style={{ padding:'3rem 3rem 6rem', maxWidth:800 }}>

          <section id="introduction" style={{ marginBottom:'4rem' }}>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'2.5rem', fontWeight:800, color:'var(--gray-900)', letterSpacing:'-0.03em', marginBottom:'1rem', lineHeight:1.1 }}>Swipass API<br /><span style={{ fontFamily:"'Instrument Serif',serif", fontStyle:'italic', fontWeight:400, fontSize:'2rem', color:'var(--gray-600)' }}>Developer Documentation</span></h1>
            <p style={{ color:'var(--gray-500)', fontSize:'0.9rem', lineHeight:1.8, marginBottom:'1.5rem' }}>
              Swipass gives you a single REST endpoint to execute any cross-chain swap, bridge, or send in natural language. Your users just type (or speak) what they want — Swipass handles the rest.
            </p>
            <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
              <div style={{ padding:'0.75rem 1.25rem', background:'var(--gray-100)', border:'1px solid var(--gray-300)', borderRadius:6, fontSize:'0.78rem', color:'var(--gray-600)' }}>Base URL: <code style={{ color:'var(--gray-800)' }}>https://api.swipass.xyz</code></div>
              <div style={{ padding:'0.75rem 1.25rem', background:'var(--gray-100)', border:'1px solid var(--gray-300)', borderRadius:6, fontSize:'0.78rem', color:'var(--gray-600)' }}>Format: <code style={{ color:'var(--gray-800)' }}>application/json</code></div>
            </div>
          </section>

          <section id="authentication" style={{ marginBottom:'4rem' }}>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.5rem', fontWeight:700, color:'var(--gray-900)', letterSpacing:'-0.02em', marginBottom:'1rem' }}>Authentication</h2>
            <p style={{ color:'var(--gray-500)', fontSize:'0.85rem', lineHeight:1.8, marginBottom:'1.5rem' }}>
              All developer API requests must include your API key via the <code style={{ background:'var(--gray-200)', padding:'1px 5px', borderRadius:3, color:'var(--gray-700)' }}>X-API-Key</code> header. 
              Get your key by creating a project in the <Link to="/dashboard/developer" style={{ color:'var(--gray-700)', textDecoration:'underline' }}>Developer Dashboard</Link>.
            </p>
            <div style={{ padding:'1.25rem', background:'var(--gray-100)', border:'1px solid var(--gray-300)', borderRadius:8, marginBottom:'1rem' }}>
              {[
                ['X-API-Key', 'sw_live_...', 'Required for developer projects'],
                ['X-LLM-Provider', 'openai | anthropic', 'Optional BYO-LLM provider'],
                ['X-LLM-API-Key', 'sk-...', 'Optional BYO-LLM key (never stored)'],
                ['X-LLM-Model', 'gpt-4o-mini', 'Optional BYO-LLM model'],
              ].map(([h,v,d]) => (
                <div key={h} style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr 2fr', gap:'1rem', padding:'0.5rem 0', borderBottom:'1px solid var(--gray-300)', fontSize:'0.78rem' }}>
                  <code style={{ color:'var(--gray-800)', fontFamily:"'DM Mono',monospace" }}>{h}</code>
                  <span style={{ color:'var(--gray-500)' }}>{v}</span>
                  <span style={{ color:'var(--gray-400)' }}>{d}</span>
                </div>
              ))}
            </div>
          </section>

          <section id="quick-start" style={{ marginBottom:'4rem' }}>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.5rem', fontWeight:700, color:'var(--gray-900)', letterSpacing:'-0.02em', marginBottom:'1rem' }}>Quick Start</h2>
            <p style={{ color:'var(--gray-500)', fontSize:'0.85rem', lineHeight:1.8, marginBottom:'1.5rem' }}>Make your first cross-chain intent request in under 2 minutes.</p>
            <ExampleTabs examples={CODE_EXAMPLES['Quick Start']} />
          </section>

          <section id="endpoints" style={{ marginBottom:'4rem' }}>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.5rem', fontWeight:700, color:'var(--gray-900)', letterSpacing:'-0.02em', marginBottom:'1.5rem' }}>API Endpoints</h2>
            {[
              { method:'POST', path:'/v1/intent', desc:'Execute a cross-chain intent from natural language.', auth:'Optional (X-API-Key)', body:'command, destination_address?, wallet_address?' },
              { method:'GET', path:'/v1/stats', desc:'Real-time platform statistics.', auth:'None', body:'-' },
              { method:'GET', path:'/v1/chains', desc:'List all supported chains.', auth:'None', body:'-' },
              { method:'GET', path:'/v1/providers', desc:'List active execution providers.', auth:'None', body:'-' },
              { method:'GET', path:'/platform/projects', desc:'List your developer projects.', auth:'Clerk JWT', body:'-' },
              { method:'POST', path:'/platform/projects', desc:'Create a new project.', auth:'Clerk JWT', body:'name, description?' },
            ].map(ep => (
              <div key={ep.path} style={{ padding:'1.25rem', background:'var(--gray-100)', border:'1px solid var(--gray-300)', borderRadius:8, marginBottom:'0.75rem' }}>
                <div style={{ display:'flex', gap:'0.75rem', alignItems:'center', marginBottom:'0.5rem' }}>
                  <span style={{ padding:'0.2rem 0.5rem', background: ep.method==='POST' ? 'var(--gray-400)' : 'var(--gray-300)', borderRadius:3, fontSize:'0.65rem', letterSpacing:'0.08em', textTransform:'uppercase', color: ep.method==='POST' ? 'var(--gray-900)' : 'var(--gray-700)', fontFamily:"'DM Mono',monospace", fontWeight:500 }}>{ep.method}</span>
                  <code style={{ fontFamily:"'DM Mono',monospace", fontSize:'0.85rem', color:'var(--gray-800)' }}>{ep.path}</code>
                </div>
                <p style={{ color:'var(--gray-500)', fontSize:'0.8rem', margin:'0 0 0.5rem' }}>{ep.desc}</p>
                <div style={{ fontSize:'0.72rem', color:'var(--gray-400)' }}>Auth: {ep.auth} · Body: {ep.body}</div>
              </div>
            ))}
          </section>

          <section id="byollm" style={{ marginBottom:'4rem' }}>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.5rem', fontWeight:700, color:'var(--gray-900)', letterSpacing:'-0.02em', marginBottom:'1rem' }}>BYO-LLM (Bring Your Own LLM)</h2>
            <p style={{ color:'var(--gray-500)', fontSize:'0.85rem', lineHeight:1.8, marginBottom:'1.5rem' }}>Pass your own LLM API keys per request to control costs and choose your preferred model. Keys are used only for that single request and never stored by Swipass.</p>
            <ExampleTabs examples={CODE_EXAMPLES['BYO-LLM']} />
          </section>

          <section id="destination" style={{ marginBottom:'4rem' }}>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.5rem', fontWeight:700, color:'var(--gray-900)', letterSpacing:'-0.02em', marginBottom:'1rem' }}>Destination Address</h2>
            <p style={{ color:'var(--gray-500)', fontSize:'0.85rem', lineHeight:1.8, marginBottom:'1.5rem' }}>By default, bridged or swapped assets go to the connected wallet on the destination chain. Pass <code style={{ background:'var(--gray-200)', padding:'1px 5px', borderRadius:3, color:'var(--gray-700)' }}>destination_address</code> to send funds to a different address. This works for both direct users and developer integrations.</p>
            <ExampleTabs examples={CODE_EXAMPLES['Destination Address']} />
          </section>

          <section id="errors" style={{ marginBottom:'4rem' }}>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.5rem', fontWeight:700, color:'var(--gray-900)', letterSpacing:'-0.02em', marginBottom:'1.5rem' }}>Error Reference</h2>
            <div style={{ border:'1px solid var(--gray-300)', borderRadius:8, overflow:'hidden' }}>
              <div style={{ display:'grid', gridTemplateColumns:'100px 1fr 2fr', padding:'0.5rem 1rem', background:'var(--gray-200)', fontSize:'0.62rem', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--gray-500)', borderBottom:'1px solid var(--gray-300)' }}>
                {['Status','Code','Message'].map(h=><span key={h}>{h}</span>)}
              </div>
              {[
                [422,'intent_error','Failed to parse command or route the intent'],
                [401,'unauthorized','Authentication required or API key invalid'],
                [403,'project_paused','API key project has been paused'],
                [429,'rate_limited','Too many requests. Slow down.'],
                [503,'service_paused','Platform is temporarily paused for maintenance'],
                [500,'internal_error','Unexpected server error. Retry with backoff.'],
              ].map(([status, code, msg]) => (
                <div key={code as string} style={{ display:'grid', gridTemplateColumns:'100px 1fr 2fr', padding:'0.7rem 1rem', borderBottom:'1px solid var(--gray-300)', fontSize:'0.78rem', alignItems:'center' }}>
                  <code style={{ color:'var(--gray-600)', fontFamily:"'DM Mono',monospace" }}>{status}</code>
                  <code style={{ color:'var(--gray-700)', fontFamily:"'DM Mono',monospace" }}>{code}</code>
                  <span style={{ color:'var(--gray-500)' }}>{msg}</span>
                </div>
              ))}
            </div>
          </section>

          <section id="providers" style={{ marginBottom:'4rem' }}>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.5rem', fontWeight:700, color:'var(--gray-900)', letterSpacing:'-0.02em', marginBottom:'1rem' }}>Providers</h2>
            <p style={{ color:'var(--gray-500)', fontSize:'0.85rem', lineHeight:1.8, marginBottom:'1.5rem' }}>Swipass queries all active providers simultaneously and selects the best quote using a weighted scoring algorithm:</p>
            <div style={{ display:'flex', gap:'2rem', padding:'1.25rem', background:'var(--gray-100)', border:'1px solid var(--gray-300)', borderRadius:8, marginBottom:'1.5rem', flexWrap:'wrap' }}>
              {[['Output Amount','70%'],['Speed','20%'],['Historical Success Rate','10%']].map(([l,v]) => (
                <div key={l}><div style={{ fontSize:'0.6rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--gray-500)', marginBottom:'0.25rem' }}>{l}</div><div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.4rem', fontWeight:700, color:'var(--gray-900)' }}>{v}</div></div>
              ))}
            </div>
            <p style={{ color:'var(--gray-500)', fontSize:'0.82rem', lineHeight:1.7 }}>If the selected provider fails during transaction building, Swipass automatically falls back to the next best provider from the original quote set. Providers are modular — new protocols can be added without any changes to the API interface.</p>
          </section>

          <section id="fees" style={{ marginBottom:'4rem' }}>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.5rem', fontWeight:700, color:'var(--gray-900)', letterSpacing:'-0.02em', marginBottom:'1rem' }}>Fees & Revenue Sharing</h2>
            <div style={{ border:'1px solid var(--gray-300)', borderRadius:8, overflow:'hidden', marginBottom:'1.5rem' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', padding:'0.5rem 1rem', background:'var(--gray-200)', fontSize:'0.62rem', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--gray-500)', borderBottom:'1px solid var(--gray-300)' }}>
                {['User Type','Platform Fee','Your Share'].map(h=><span key={h}>{h}</span>)}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', padding:'0.75rem 1rem', borderBottom:'1px solid var(--gray-300)', fontSize:'0.82rem' }}>
                <span style={{ color:'var(--gray-700)' }}>Direct Swipass User</span><span style={{ color:'var(--gray-600)' }}>0.10%</span><span style={{ color:'var(--gray-400)' }}>—</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', padding:'0.75rem 1rem', fontSize:'0.82rem', background:'var(--gray-200)' }}>
                <span style={{ color:'var(--gray-900)', fontWeight:500 }}>Via Developer App</span><span style={{ color:'var(--gray-800)' }}>0.15%</span><span style={{ color:'var(--gray-900)', fontWeight:600 }}>0.075% (50%)</span>
              </div>
            </div>
            <p style={{ color:'var(--gray-500)', fontSize:'0.82rem', lineHeight:1.7 }}>Developer earnings accumulate in your project balance. Once your balance reaches $50 USD equivalent, the "Withdraw" button activates in your dashboard. Withdrawals go to your configured EVM payout wallet.</p>
          </section>

        </article>
      </div>
    </div>
  )
}
