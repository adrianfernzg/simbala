const TICKER_TEXT =
  '🕹️ MÁQUINAS RECREATIVAS ARTESANALES · FABRICADAS EN VALENCIA · ' +
  'ENVÍO A TODA ESPAÑA · RECOGIDA EN TALLER · PERSONALIZACIÓN TOTAL · ' +
  'PAGO SEGURO CON STRIPE · HANDCRAFTED IN SPAIN · ALTA GAMA · SINCE 2024 · '

export function Ticker() {
  return (
    <div className="overflow-hidden border-y-2 border-gold bg-gold py-2.5" aria-hidden="true">
      <div className="flex whitespace-nowrap" style={{ animation: 'ticker 30s linear infinite' }}>
        <span className="font-pixel text-black shrink-0" style={{ fontSize: '8px', letterSpacing: '0.12em' }}>
          {TICKER_TEXT}
        </span>
        <span className="font-pixel text-black shrink-0" style={{ fontSize: '8px', letterSpacing: '0.12em' }}>
          {TICKER_TEXT}
        </span>
      </div>
    </div>
  )
}
