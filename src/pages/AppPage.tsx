// src/pages/AppPage.tsx
import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, parseUnits } from 'viem'
import { intentService, IntentResponse, QuoteResponse } from '../services/intentService'
import { useAppStore } from '../store/appStore'
import { useWallet } from '../hooks/useWallet'
import { useVoiceInput } from '../hooks/useVoiceInput'

const QUICK_COMMANDS = [
  'Bridge 1 ETH from Ethereum to Polygon',
  'Swap 100 USDC for WETH on Arbitrum',
  'Send 50 DAI from Base to Optimism',
  'Move all USDT from Optimism to mainnet',
  'Bridge 0.5 ETH from Ethereum to Avalanche'
]

// Chain ID to block explorer URL
const EXPLORERS: Record<number, string> = {
  1: 'https://etherscan.io/tx/',
  42161: 'https://arbiscan.io/tx/',
  8453: 'https://basescan.org/tx/',
  10: 'https://optimistic.etherscan.io/tx/',
  137: 'https://polygonscan.com/tx/',
  43114: 'https://snowtrace.io/tx/',
  56: 'https://bscscan.com/tx/',
  100: 'https://gnosisscan.io/tx/',
}

// Capitalise first letter for display
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export default function AppPage() {
  const { commandHistory, addCommand, updateCommand } = useAppStore()
  const { address, isConnected, chainName, balance, connect, disconnect, chainId } = useWallet()
  const [command, setCommand] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<IntentResponse | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [fromChainIdx, setFromChainIdx] = useState(0)
  const [networkDropdown, setNetworkDropdown] = useState(false)
  const [destAddress, setDestAddress] = useState('')
  const [showDestInput, setShowDestInput] = useState(false)
  const [histId, setHistId] = useState<string | null>(null)
  const [chains, setChains] = useState<string[]>([])
  const [chainsLoading, setChainsLoading] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Voice input
  const { isRecording, transcript, error: voiceError, startRecording, stopRecording } = useVoiceInput()

  // Wagmi transaction hooks
  const { sendTransactionAsync, isPending: isSending } = useSendTransaction()
  const { data: receipt, isLoading: isWaiting, isSuccess: txSuccess } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
  })

  // Fetch supported chains from backend
  useEffect(() => {
    intentService.getChains()
      .then(data => {
        setChains(data)
        setChainsLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch chains:', err)
        // Fallback to default chains
        setChains(['ethereum', 'arbitrum', 'base', 'optimism', 'polygon', 'avalanche', 'bnb', 'gnosis'])
        setChainsLoading(false)
      })
  }, [])

  useEffect(() => {
    if (voiceError) toast.error(`Voice: ${voiceError}`)
  }, [voiceError])

  useEffect(() => {
    if (transcript) setCommand(transcript)
  }, [transcript])

  useEffect(() => {
    if (txSuccess && receipt && histId) {
      setShowSuccess(true)
      updateCommand(histId, { status: 'completed', txHash: receipt.transactionHash })
      toast.success('Transaction settled!')
      setConfirming(false)
    }
  }, [txSuccess, receipt, histId, updateCommand])

  const handleSubmit = async () => {
    if (!command.trim() || loading || chainsLoading) return
    setLoading(true)
    setResult(null)
    const fromChainDisplay = chains[fromChainIdx] || 'ethereum'
    const id = addCommand({
      command: command.trim(),
      fromChain: capitalize(fromChainDisplay),
      toChain: '',
      status: 'pending'
    })
    setHistId(id)

    try {
      const req = {
        command: command.trim(),
        destination_address: destAddress || undefined,
        from_chain_hint: fromChainDisplay.toLowerCase(),
        wallet_address: address || undefined
      }
      const res = await intentService.execute(req)
      setResult(res)
      updateCommand(id, { toChain: res.parsed_intent.to_chain || '', status: 'pending' })
    } catch (e: any) {
      toast.error(e.message || 'Failed to parse intent')
      updateCommand(id, { status: 'failed' })
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!result || !address) {
      toast.error('Wallet not connected')
      return
    }

    const tx = result.transaction
    if (!tx || !tx.to) {
      toast.error('Invalid transaction data')
      return
    }

    if (chainId !== tx.chain_id) {
      toast.error(`Please switch your wallet to ${tx.chain_name || 'the required chain'} (Chain ID: ${tx.chain_id})`)
      return
    }

    setConfirming(true)
    try {
      let value: bigint
      try {
        value = parseEther(tx.value || '0')
      } catch {
        value = parseUnits(tx.value || '0', 18)
      }

      const hash = await sendTransactionAsync({
        to: tx.to as `0x${string}`,
        data: tx.data as `0x${string}`,
        value,
        gas: tx.gas_limit ? BigInt(tx.gas_limit) : undefined,
      })
      setTxHash(hash)
      toast.loading('Transaction broadcasted. Waiting for confirmation...', { id: 'tx' })
    } catch (err: any) {
      console.error('Transaction error:', err)
      toast.error(err.message || 'Transaction failed')
      setConfirming(false)
      if (histId) updateCommand(histId, { status: 'failed' })
    }
  }

  const closeSuccess = () => {
    setShowSuccess(false)
    setResult(null)
    setCommand('')
    setDestAddress('')
    setShowDestInput(false)
    setTxHash('')
  }

  const toggleRecording = () => {
    if (isRecording) stopRecording()
    else startRecording()
  }

  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handleSubmit() }
      if (e.key === 'Escape') { setShowSuccess(false); setNetworkDropdown(false) }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); textareaRef.current?.focus() }
    }
    window.addEventListener('keydown', kd)
    return () => window.removeEventListener('keydown', kd)
  }, [command, loading, chainsLoading])

  const totalVolume = commandHistory.filter(c => c.status === 'completed').reduce((s, c) => s + (c.volumeUsd || 0), 0)
  const isConfirming = confirming || isSending || isWaiting
  const explorerUrl = result?.quote?.chain_id ? EXPLORERS[result.quote.chain_id] : 'https://etherscan.io/tx/'

  // Display chains with capitalised names
  const displayChains = chains.map(c => capitalize(c))

  return (
    <div style={{ height:'100vh', overflow:'hidden', display:'grid', gridTemplateRows:'56px 1fr', gridTemplateColumns:'260px 1fr 320px', background:'var(--gray-50)', fontFamily:"'DM Mono',monospace" }}>

      {/* SUCCESS OVERLAY */}
      {showSuccess && (
        <div style={{ position:'fixed', inset:0, background:'rgba(10,10,10,0.92)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, backdropFilter:'blur(10px)' }}
          onClick={e => { if (e.target === e.currentTarget) closeSuccess() }}>
          <div style={{ background:'var(--gray-100)', border:'1px solid var(--gray-300)', borderRadius:12, padding:'3rem 2.5rem', maxWidth:400, width:'90%', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:'1.25rem' }}>
            <div style={{ width:56, height:56, border:'1.5px solid var(--gray-500)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--gray-700)' }}>
              <svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
            </div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.5rem', fontWeight:700, color:'var(--gray-900)', letterSpacing:'-0.02em' }}>Transaction Settled</div>
            <p style={{ fontSize:'0.8rem', color:'var(--gray-500)', lineHeight:1.6, margin:0 }}>Your assets have been successfully bridged. The destination address will reflect the balance after on-chain confirmation.</p>
            <div style={{ padding:'0.6rem 0.85rem', background:'var(--gray-200)', border:'1px solid var(--gray-300)', borderRadius:5, fontSize:'0.68rem', color:'var(--gray-500)', wordBreak:'break-all', textAlign:'left', width:'100%' }}>
              {txHash.slice(0,20)}...{txHash.slice(-8)}
            </div>
            <div style={{ display:'flex', gap:'0.75rem', width:'100%' }}>
              <button onClick={closeSuccess} className="sw-btn sw-btn-ghost" style={{ flex:1, justifyContent:'center' }}>New Command</button>
              <a href={`${explorerUrl}${txHash}`} target="_blank" rel="noopener noreferrer" className="sw-btn sw-btn-primary" style={{ flex:1, justifyContent:'center', textAlign:'center' }}>View on Explorer</a>
            </div>
          </div>
        </div>
      )}

      {/* TOP BAR (unchanged) */}
      <header style={{ gridColumn:'1/-1', gridRow:1, background:'var(--gray-100)', borderBottom:'1px solid var(--gray-300)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 1.25rem', zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'1.5rem' }}>
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontFamily:"'Syne',sans-serif", fontSize:'1rem', fontWeight:800, color:'var(--gray-900)', letterSpacing:'-0.03em' }}>
            <div style={{ width:24, height:24, border:'1.5px solid var(--gray-500)', borderRadius:5, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.55rem', color:'var(--gray-500)' }}>SW</div>
            Swipass
          </Link>
          <nav style={{ display:'flex', gap:0, borderLeft:'1px solid var(--gray-300)', paddingLeft:'1.5rem' }}>
            {[['App','/app'],['Dashboard','/dashboard'],['Docs','/docs']].map(([label, href]) => (
              <Link key={label} to={href} style={{ fontSize:'0.7rem', letterSpacing:'0.08em', textTransform:'uppercase', color: href==='/app' ? 'var(--gray-900)' : 'var(--gray-500)', padding:'0.3rem 0.75rem', borderRadius:3, background: href==='/app' ? 'var(--gray-300)' : 'transparent', transition:'all 0.3s' }}>{label}</Link>
            ))}
          </nav>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
          {/* Network pill */}
          <div style={{ position:'relative' }}>
            <button onClick={() => setNetworkDropdown(!networkDropdown)} style={{ display:'flex', alignItems:'center', gap:'0.45rem', padding:'0.3rem 0.75rem', border:'1px solid var(--gray-300)', borderRadius:40, fontSize:'0.7rem', color:'var(--gray-600)', background:'none', cursor:'none', transition:'all 0.3s', fontFamily:"'DM Mono',monospace" }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background: isConnected ? 'var(--gray-600)' : 'var(--gray-500)', animation: isConnected ? 'pulseDot 2s ease-in-out infinite' : 'none' }} />
              {isConnected ? chainName : 'Select Network'}
              <svg width={10} height={10} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ opacity:0.5 }}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
            </button>
            {networkDropdown && !chainsLoading && (
              <div style={{ position:'absolute', top:'calc(100% + 8px)', right:0, background:'var(--gray-100)', border:'1px solid var(--gray-300)', borderRadius:8, minWidth:180, zIndex:200, overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.4)' }}>
                {displayChains.map((chain, idx) => (
                  <button key={chain} onClick={() => { setFromChainIdx(idx); setNetworkDropdown(false) }}
                    style={{ display:'flex', alignItems:'center', gap:'0.6rem', padding:'0.65rem 1rem', fontSize:'0.72rem', color: fromChainIdx === idx ? 'var(--gray-900)' : 'var(--gray-600)', background: fromChainIdx === idx ? 'var(--gray-200)' : 'none', width:'100%', border:'none', borderBottom:'1px solid var(--gray-300)', cursor:'none', fontFamily:"'DM Mono',monospace", transition:'background 0.2s' }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background: fromChainIdx === idx ? 'var(--gray-700)' : 'var(--gray-500)' }} />
                    {chain}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Wallet */}
          <button onClick={isConnected ? disconnect : connect}
            style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.4rem 1rem', background: isConnected ? 'var(--gray-200)' : 'var(--gray-900)', color: isConnected ? 'var(--gray-700)' : 'var(--gray-50)', border: isConnected ? '1px solid var(--gray-300)' : 'none', borderRadius:4, fontFamily:"'DM Mono',monospace", fontSize:'0.7rem', letterSpacing:'0.06em', textTransform:'uppercase', cursor:'none', transition:'all 0.3s' }}>
            {isConnected ? `${address?.slice(0,6)}...${address?.slice(-4)}` : 'Connect Wallet'}
          </button>
          <Link to="/dashboard" style={{ display:'flex', alignItems:'center', gap:'0.4rem', fontSize:'0.7rem', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--gray-500)', padding:'0.4rem 0.75rem', border:'1px solid var(--gray-300)', borderRadius:4, transition:'all 0.3s' }}>Dashboard</Link>
        </div>
      </header>

      {/* LEFT SIDEBAR - HISTORY (unchanged) */}
      <aside style={{ gridColumn:1, gridRow:2, borderRight:'1px solid var(--gray-300)', background:'var(--gray-100)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ padding:'1rem 1.25rem 0.75rem', borderBottom:'1px solid var(--gray-300)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <span style={{ fontSize:'0.65rem', letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--gray-500)' }}>Command History</span>
          <span style={{ background:'var(--gray-300)', color:'var(--gray-600)', fontSize:'0.6rem', padding:'0.15rem 0.45rem', borderRadius:10 }}>{commandHistory.length}</span>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'0.5rem 0' }}>
          {commandHistory.length === 0 ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'0.75rem', padding:'3rem 1.5rem', color:'var(--gray-400)', textAlign:'center' }}>
              <svg width={32} height={32} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} style={{ opacity:0.3 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
              <p style={{ fontSize:'0.75rem', lineHeight:1.5, margin:0 }}>Your command history<br />will appear here</p>
            </div>
          ) : commandHistory.map((item, i) => (
            <div key={item.id} style={{ padding:'0.85rem 1.25rem', borderLeft: i===0 ? '2px solid var(--gray-700)' : '2px solid transparent', background: i===0 ? 'var(--gray-200)' : 'transparent', transition:'all 0.3s', cursor:'default' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.3rem', marginBottom:'0.35rem' }}>
                {item.fromChain && <span style={{ padding:'0.1rem 0.4rem', background:'var(--gray-300)', borderRadius:3, fontSize:'0.6rem', color:'var(--gray-600)' }}>{item.fromChain}</span>}
                {item.toChain && <><span style={{ color:'var(--gray-400)', fontSize:'0.6rem' }}>→</span><span style={{ padding:'0.1rem 0.4rem', background:'var(--gray-300)', borderRadius:3, fontSize:'0.6rem', color:'var(--gray-600)' }}>{item.toChain}</span></>}
              </div>
              <div style={{ fontSize:'0.75rem', color:'var(--gray-700)', lineHeight:1.4, marginBottom:'0.4rem', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.command}</div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                <span style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', fontSize:'0.62rem', letterSpacing:'0.06em', textTransform:'uppercase', color: item.status==='completed' ? 'var(--gray-600)' : item.status==='failed' ? 'var(--gray-400)' : 'var(--gray-500)' }}>
                  <span style={{ width:4, height:4, borderRadius:'50%', background: item.status==='completed' ? 'var(--gray-600)' : item.status==='failed' ? 'var(--gray-400)' : 'var(--gray-500)', ...(item.status==='pending' ? { animation:'pulseDot 1.5s infinite' } : {}) }} />
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding:'0.75rem 1.25rem', borderTop:'1px solid var(--gray-300)', flexShrink:0 }}>
          <div style={{ display:'flex', gap:'1.5rem' }}>
            {[{ val:`$${totalVolume.toFixed(0)}`, lbl:'Volume' },{ val:commandHistory.filter(c=>c.status==='completed').length, lbl:'Settled' },{ val:commandHistory.length, lbl:'Total' }].map(s => (
              <div key={s.lbl} style={{ display:'flex', flexDirection:'column', gap:'0.15rem' }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'0.95rem', fontWeight:700, color:'var(--gray-800)', letterSpacing:'-0.02em' }}>{s.val}</div>
                <div style={{ fontSize:'0.58rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gray-500)' }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* MAIN COMMAND AREA */}
      <main style={{ gridColumn:2, gridRow:2, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'2rem', position:'relative', overflow:'hidden' }}
        onClick={() => setNetworkDropdown(false)}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:500, height:500, background:'radial-gradient(ellipse, rgba(100,100,100,0.04) 0%, transparent 70%)', pointerEvents:'none', animation:'ambientPulse 6s ease-in-out infinite' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle, var(--gray-300) 1px, transparent 1px)', backgroundSize:'28px 28px', opacity:0.25, pointerEvents:'none' }} />
        <style>{`@keyframes ambientPulse { 0%,100% { opacity:0.6; } 50% { opacity:1; } }`}</style>

        <div style={{ width:'100%', maxWidth:640, position:'relative', zIndex:1 }}>
          {/* Status banner */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.6rem', marginBottom:'2rem', opacity: isConnected ? 1 : 0.7, transform:'translateY(0)', transition:'all 0.4s' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--gray-500)', animation:'pulseDot 2s infinite' }} />
            <span style={{ fontSize:'0.7rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gray-500)' }}>
              {isConnected ? `Wallet connected (${balance} ${chainName}) — Ready to execute` : 'Connect wallet to begin'}
            </span>
          </div>

          {/* Command card */}
          <div style={{ background:'var(--gray-100)', border:`1px solid ${loading ? 'var(--gray-500)' : result ? 'var(--gray-600)' : 'var(--gray-300)'}`, borderRadius:12, overflow:'hidden', transition:'border-color 0.3s, box-shadow 0.3s', boxShadow: result ? '0 0 0 3px rgba(102,102,102,0.08)' : 'none' }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:0, padding:'1rem 1rem 0' }}>
              {/* Voice button */}
              <button onClick={toggleRecording} style={{ width:40, height:40, border:`1px solid ${isRecording ? 'var(--gray-600)' : 'var(--gray-300)'}`, borderRadius:8, background: isRecording ? 'var(--gray-400)' : 'var(--gray-200)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'none', flexShrink:0, color: isRecording ? 'var(--gray-900)' : 'var(--gray-500)', transition:'all 0.3s' }}>
                <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" /></svg>
              </button>
              <div style={{ flex:1, padding:'0 0.75rem' }}>
                <textarea ref={textareaRef} value={command} onChange={e => setCommand(e.target.value)} placeholder="Send 50 USDC from Arbitrum to Base..." rows={3}
                  style={{ width:'100%', background:'transparent', border:'none', outline:'none', resize:'none', fontFamily:"'DM Mono',monospace", fontSize:'0.9rem', color:'var(--gray-800)', lineHeight:1.6, minHeight:80, caretColor:'var(--gray-700)' }}
                  onKeyDown={e => { if ((e.metaKey||e.ctrlKey)&&e.key==='Enter') { e.preventDefault(); handleSubmit() } }} />
              </div>
            </div>

            {/* Destination address toggle */}
            <div style={{ padding:'0 1rem 0.5rem', paddingLeft:'calc(1rem + 40px + 0.75rem)' }}>
              <button onClick={() => setShowDestInput(!showDestInput)} style={{ fontSize:'0.62rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gray-400)', background:'none', border:'none', cursor:'none', fontFamily:"'DM Mono',monospace", padding:0 }}>
                {showDestInput ? '− Hide' : '+ Custom destination address'}
              </button>
              {showDestInput && (
                <input value={destAddress} onChange={e => setDestAddress(e.target.value)} placeholder="0x... destination address (optional)"
                  style={{ display:'block', width:'100%', marginTop:'0.5rem', background:'var(--gray-200)', border:'1px solid var(--gray-300)', borderRadius:5, padding:'0.4rem 0.75rem', fontFamily:"'DM Mono',monospace", fontSize:'0.72rem', color:'var(--gray-600)', outline:'none' }} />
              )}
            </div>

            <div style={{ padding:'0.75rem 1rem', borderTop:'1px solid var(--gray-300)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'0.75rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <button onClick={() => setFromChainIdx((fromChainIdx + 1) % chains.length)}
                  style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.3rem 0.65rem', background:'var(--gray-200)', border:'1px solid var(--gray-300)', borderRadius:20, fontSize:'0.68rem', color:'var(--gray-600)', cursor:'none', transition:'all 0.3s', fontFamily:"'DM Mono',monospace" }}>
                  ⇄ From: {displayChains[fromChainIdx] || 'Loading...'}
                </button>
                <span style={{ fontSize:'0.62rem', color:'var(--gray-400)' }}>⌘↵ to send</span>
              </div>
              <button onClick={handleSubmit} disabled={!command.trim() || loading || chainsLoading}
                style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.5rem 1.25rem', background: !command.trim() || loading || chainsLoading ? 'var(--gray-400)' : 'var(--gray-900)', color: !command.trim() || loading || chainsLoading ? 'var(--gray-600)' : 'var(--gray-50)', border:'none', borderRadius:6, fontFamily:"'DM Mono',monospace", fontSize:'0.72rem', letterSpacing:'0.06em', textTransform:'uppercase', cursor: loading ? 'not-allowed' : 'none', transition:'all 0.3s' }}>
                {loading ? <><div style={{ width:14, height:14, border:'1.5px solid rgba(245,245,245,0.3)', borderTopColor:'var(--gray-50)', borderRadius:'50%' }} className="spinner" /> Processing...</> : 'Execute'}
              </button>
            </div>
          </div>

          {/* Loading indicator */}
          {loading && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'1rem', padding:'2rem', textAlign:'center' }}>
              <div style={{ position:'relative', width:48, height:48 }}>
                <div style={{ width:'100%', height:'100%', border:'1px solid var(--gray-500)', borderTopColor:'var(--gray-800)', borderRadius:'50%' }} className="spinner" />
                <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:6, height:6, background:'var(--gray-600)', borderRadius:'50%' }} />
              </div>
              <div style={{ fontSize:'0.75rem', color:'var(--gray-500)' }}>Processing your command...</div>
            </div>
          )}

          {/* Provider comparison */}
          {result && !loading && (
            <div style={{ marginTop:'1rem' }}>
              <div style={{ fontSize:'0.6rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--gray-400)', marginBottom:'0.6rem' }}>Provider Quotes — Best Selected</div>
              <div style={{ border:'1px solid var(--gray-300)', borderRadius:8, overflow:'hidden' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1.2fr 1fr 0.8fr 1fr', padding:'0.5rem 1rem', background:'var(--gray-200)', fontSize:'0.6rem', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--gray-500)', borderBottom:'1px solid var(--gray-300)' }}>
                  {['Provider','Output','Est. Time','Score','Status'].map(h => <span key={h}>{h}</span>)}
                </div>
                {result.all_quotes.map((q: QuoteResponse, i: number) => (
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1.2fr 1fr 0.8fr 1fr', padding:'0.7rem 1rem', borderBottom: i < result.all_quotes.length-1 ? '1px solid var(--gray-300)' : 'none', background: i===0 ? 'var(--gray-200)' : 'var(--gray-100)', fontSize:'0.72rem', alignItems:'center', transition:'background 0.2s' }}>
                    <span style={{ color: i===0 ? 'var(--gray-900)' : 'var(--gray-500)', fontWeight: i===0 ? 500 : 400 }}>{q.provider}</span>
                    <span style={{ color: i===0 ? 'var(--gray-900)' : 'var(--gray-500)', fontFamily:"'DM Mono',monospace" }}>{parseFloat(q.to_amount).toFixed(4)} {q.to_token}</span>
                    <span style={{ color:'var(--gray-500)' }}>~{q.estimated_time_seconds}s</span>
                    <span><div style={{ display:'inline-flex', padding:'0.15rem 0.5rem', background: i===0 ? 'var(--gray-400)' : 'var(--gray-300)', borderRadius:3, fontSize:'0.62rem', color: i===0 ? 'var(--gray-900)' : 'var(--gray-600)' }}>{q.score.toFixed(1)}</div></span>
                    {i===0 ? <span><div style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', padding:'0.15rem 0.5rem', background:'var(--gray-400)', borderRadius:3, fontSize:'0.6rem', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--gray-900)' }}>✓ Selected</div></span> : <span />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick commands */}
          {!loading && !result && (
            <div style={{ marginTop:'1rem' }}>
              <div style={{ fontSize:'0.6rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--gray-400)', marginBottom:'0.6rem' }}>Quick Commands</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem' }}>
                {QUICK_COMMANDS.map((c, i) => (
                  <button key={i} onClick={() => setCommand(c)}
                    style={{ padding:'0.35rem 0.75rem', background:'var(--gray-200)', border:'1px solid var(--gray-300)', borderRadius:40, fontSize:'0.7rem', color:'var(--gray-500)', cursor:'none', transition:'all 0.3s', fontFamily:"'DM Mono',monospace" }}
                    onMouseEnter={e=>(e.currentTarget.style.background='var(--gray-300)')} onMouseLeave={e=>(e.currentTarget.style.background='var(--gray-200)')}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* RIGHT PANEL (unchanged) */}
      <aside style={{ gridColumn:3, gridRow:2, borderLeft:'1px solid var(--gray-300)', background:'var(--gray-100)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ flexShrink:0, borderBottom:'1px solid var(--gray-300)' }}>
          <div style={{ padding:'0.85rem 1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:'0.62rem', letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--gray-500)' }}>Wallet</span>
          </div>
          <div style={{ padding:'0 1.25rem 1.25rem' }}>
            {!isConnected ? (
              <>
                <p style={{ fontSize:'0.78rem', color:'var(--gray-500)', lineHeight:1.6, marginBottom:'0.75rem' }}>Connect your wallet to start executing cross-chain transactions. No account required.</p>
                <button onClick={connect} style={{ width:'100%', padding:'0.7rem', background:'var(--gray-900)', color:'var(--gray-50)', border:'none', borderRadius:4, fontFamily:"'DM Mono',monospace", fontSize:'0.7rem', letterSpacing:'0.06em', textTransform:'uppercase', cursor:'none', transition:'background 0.3s' }}>Connect Wallet</button>
                <div style={{ marginTop:'0.75rem', padding:'0.6rem 0.75rem', border:'1px solid var(--gray-300)', borderRadius:5, display:'flex', gap:'0.5rem', fontSize:'0.68rem', color:'var(--gray-500)', lineHeight:1.5 }}>
                  🛡️ Non-custodial. Your keys stay in your wallet.
                </div>
              </>
            ) : (
              <>
                <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:'0.6rem' }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--gray-300)', border:'1px solid var(--gray-400)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.6rem', color:'var(--gray-500)' }}>◈</div>
                  <div>
                    <div style={{ fontSize:'0.72rem', color:'var(--gray-700)' }}>{address?.slice(0,6)}...{address?.slice(-4)}</div>
                    <div style={{ fontSize:'0.65rem', color:'var(--gray-500)' }}>via WalletConnect</div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'baseline', gap:'0.4rem', marginBottom:'0.6rem' }}>
                  <span style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.4rem', fontWeight:700, color:'var(--gray-900)', letterSpacing:'-0.03em' }}>{parseFloat(balance).toFixed(4)}</span>
                  <span style={{ fontSize:'0.72rem', color:'var(--gray-500)' }}>{chainName === 'Ethereum' ? 'ETH' : chainName === 'BNB Chain' ? 'BNB' : chainName}</span>
                </div>
                <div style={{ display:'flex', gap:'0.5rem' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.3rem', padding:'0.2rem 0.55rem', background:'var(--gray-200)', border:'1px solid var(--gray-300)', borderRadius:20, fontSize:'0.62rem', color:'var(--gray-600)' }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--gray-600)', animation:'pulseDot 2s infinite' }} />
                    {chainName}
                  </div>
                  <button onClick={disconnect} style={{ fontSize:'0.62rem', color:'var(--gray-400)', cursor:'none', background:'none', border:'none', fontFamily:"'DM Mono',monospace", textTransform:'uppercase', letterSpacing:'0.06em', padding:0, marginLeft:'auto' }}>Disconnect</button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Transaction Preview */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', borderBottom:'none' }}>
          <div style={{ padding:'0.85rem 1.25rem', borderBottom:'1px solid var(--gray-300)', flexShrink:0 }}>
            <span style={{ fontSize:'0.62rem', letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--gray-500)' }}>Transaction Preview</span>
          </div>
          <div style={{ flex:1, overflowY:'auto', padding:'0 1.25rem' }}>
            {!result ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.75rem', padding:'1.5rem 0', color:'var(--gray-400)', textAlign:'center' }}>
                <svg width={36} height={36} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.75} style={{ opacity:0.25 }}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
                <p style={{ fontSize:'0.75rem', lineHeight:1.5, margin:0 }}>Execute a command to see your transaction details here</p>
                <div style={{ marginTop:'1rem', width:'100%', textAlign:'left' }}>
                  <div style={{ fontSize:'0.6rem', letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--gray-500)', marginBottom:'0.6rem', paddingBottom:'0.4rem', borderBottom:'1px solid var(--gray-300)' }}>Supported Chains</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.4rem' }}>
                    {displayChains.map(c => <div key={c} style={{ padding:'0.4rem 0.6rem', background:'var(--gray-200)', border:'1px solid var(--gray-300)', borderRadius:5, fontSize:'0.65rem', color:'var(--gray-600)', display:'flex', alignItems:'center', gap:'0.4rem' }}><div style={{ width:4, height:4, borderRadius:'50%', background:'var(--gray-500)' }} />{c}</div>)}
                  </div>
                  <div style={{ fontSize:'0.6rem', letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--gray-500)', marginTop:'1.25rem', marginBottom:'0.6rem', paddingBottom:'0.4rem', borderBottom:'1px solid var(--gray-300)' }}>Fee Structure</div>
                  {[['Direct use fee','0.10%'],['Via developer app','0.15%'],['Gas estimate','~$2–8']].map(([l,v]) => (
                    <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.72rem', padding:'0.4rem 0', borderBottom:'1px solid var(--gray-300)' }}>
                      <span style={{ color:'var(--gray-500)' }}>{l}</span><span style={{ color:'var(--gray-700)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ paddingTop:'0.75rem' }}>
                {/* Route */}
                <div style={{ display:'flex', alignItems:'center', paddingBottom:'1rem', borderBottom:'1px solid var(--gray-300)', marginBottom:'0.75rem' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'0.6rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gray-500)', marginBottom:'0.2rem' }}>You Send</div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.3rem', fontWeight:700, color:'var(--gray-900)', letterSpacing:'-0.02em' }}>{result.quote.from_amount}</div>
                    <div style={{ fontSize:'0.72rem', color:'var(--gray-600)' }}>{result.quote.from_token}</div>
                    <div style={{ fontSize:'0.65rem', color:'var(--gray-400)', marginTop:'0.1rem' }}>on {result.quote.from_chain}</div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.2rem', padding:'0 0.75rem', color:'var(--gray-400)' }}>
                    <div style={{ width:40, height:1, background:'var(--gray-400)', position:'relative' }}><span style={{ position:'absolute', right:-6, top:'50%', transform:'translateY(-50%)', fontSize:'0.4rem' }}>▶</span></div>
                    <div style={{ fontSize:'0.58rem', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--gray-500)' }}>via {result.selected_provider}</div>
                  </div>
                  <div style={{ flex:1, textAlign:'right' }}>
                    <div style={{ fontSize:'0.6rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gray-500)', marginBottom:'0.2rem' }}>You Receive</div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'1.3rem', fontWeight:700, color:'var(--gray-900)', letterSpacing:'-0.02em' }}>{parseFloat(result.quote.to_amount).toFixed(4)}</div>
                    <div style={{ fontSize:'0.72rem', color:'var(--gray-600)' }}>{result.quote.to_token}</div>
                    <div style={{ fontSize:'0.65rem', color:'var(--gray-400)', marginTop:'0.1rem' }}>on {result.quote.to_chain}</div>
                  </div>
                </div>
                {/* Details */}
                {[
                  ['Platform fee', `${result.quote.fee_amount} ${result.quote.fee_token} (0.10%)`],
                  ['Est. gas', `~$${result.quote.estimated_gas_usd}`],
                  ['Est. time', `~${result.quote.estimated_time_seconds}s`],
                  ['Provider', result.selected_provider],
                  ['Route score', `${result.quote.score.toFixed(1)} / 100`],
                ].map(([l, v]) => (
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.55rem 0', borderBottom:'1px solid var(--gray-300)', fontSize:'0.73rem' }}>
                    <span style={{ color:'var(--gray-500)' }}>{l}</span>
                    <span style={{ color: l==='Provider' ? 'var(--gray-900)' : 'var(--gray-700)', fontFamily:"'DM Mono',monospace" }}>{v}</span>
                  </div>
                ))}
                {/* Destination */}
                <div style={{ marginTop:'0.75rem', padding:'0.6rem 0.75rem', background:'var(--gray-200)', border:'1px solid var(--gray-300)', borderRadius:6 }}>
                  <div style={{ fontSize:'0.6rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gray-500)', marginBottom:'0.3rem' }}>Destination</div>
                  <div style={{ fontSize:'0.7rem', color: result.destination_address ? 'var(--gray-700)' : 'var(--gray-400)', fontStyle: result.destination_address ? 'normal' : 'italic', wordBreak:'break-all' }}>
                    {result.destination_note}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm button */}
          {result && (
            <div style={{ padding:'1rem 1.25rem 1.25rem', flexShrink:0 }}>
              <button onClick={handleConfirm} disabled={isConfirming}
                style={{ width:'100%', padding:'0.85rem', background: isConfirming ? 'var(--gray-400)' : 'var(--gray-900)', color: isConfirming ? 'var(--gray-600)' : 'var(--gray-50)', border:'none', borderRadius:8, fontFamily:"'DM Mono',monospace", fontSize:'0.75rem', letterSpacing:'0.08em', textTransform:'uppercase', cursor: isConfirming ? 'not-allowed' : 'none', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', transition:'background 0.3s' }}>
                {isConfirming ? <><div style={{ width:14, height:14, border:'1.5px solid rgba(245,245,245,0.3)', borderTopColor:'var(--gray-50)', borderRadius:'50%' }} className="spinner" /> {isSending ? 'Awaiting wallet...' : isWaiting ? 'Confirming...' : 'Processing...'}</> : '✓ Confirm & Sign'}
              </button>
              <p style={{ textAlign:'center', fontSize:'0.62rem', color:'var(--gray-400)', marginTop:'0.5rem', lineHeight:1.5 }}>Review in your wallet. Transaction broadcast after signature.</p>
              <div style={{ marginTop:'0.75rem', padding:'0.6rem 0.75rem', border:'1px solid var(--gray-300)', borderRadius:5, display:'flex', alignItems:'flex-start', gap:'0.5rem', fontSize:'0.68rem', color:'var(--gray-500)', lineHeight:1.5 }}>
                ⚠️ Simulation passed. You are signing a real on-chain transaction.
              </div>
            </div>
          )}
        </div>
      </aside>
      <style>{`@keyframes pulseDot { 0%,100% { opacity:1; } 50% { opacity:0.4; } }`}</style>
    </div>
  )
}