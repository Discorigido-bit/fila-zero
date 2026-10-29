import React, { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { useApp, moeda } from '../context/AppContext.jsx'

const FORMAS = [
  { id: 'saldo', nome: 'Saldo FilaZero' },
  { id: 'pix', nome: 'PIX', desc: 'Aprovação instantânea' },
  { id: 'debito', nome: 'Cartão de débito', desc: 'Débito na hora' },
  { id: 'credito', nome: 'Cartão de crédito', desc: 'Crédito à vista' },
]

export default function Pagamento() {
  const { carrinho, criarPedido, aluno, gastos, cantinaAberta } = useApp()
  const [forma, setForma] = useState('saldo')
  const [erro, setErro] = useState('')
  const navigate = useNavigate()
  const total = carrinho.reduce((s, i) => s + i.preco * i.qtd, 0)

  if (carrinho.length === 0) return <Navigate to="/carrinho" replace />

  const { hoje, mes } = gastos(aluno.ra)

  function confirmar() {
    const r = criarPedido(forma)
    if (!r.ok) { setErro(r.erro); return }
    navigate(`/pedido/${r.pedido.id}`)
  }

  return (
    <div>
      <Header />
      <div className="container" style={{ maxWidth: 500 }}>
        <p><a href="#" onClick={(e) => { e.preventDefault(); navigate('/carrinho') }}>← Voltar ao carrinho</a></p>
        <h2>Pagamento</h2>

        {!cantinaAberta && <div className="aviso-banner fechada">A cantina está fechada no momento. Não é possível finalizar o pedido.</div>}

        <div style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          {carrinho.map((i) => (
            <div className="linha-item" key={i.id}>
              <span>{i.qtd}x {i.nome}</span><span>{moeda(i.preco * i.qtd)}</span>
            </div>
          ))}
          <div className="resumo-total"><span>Total</span><span>{moeda(total)}</span></div>
          {(aluno.limiteDiario != null || aluno.limiteMensal != null) && (
            <div style={{ fontSize: '.8rem', color: '#6b7280', marginTop: 4 }}>
              {aluno.limiteDiario != null && <div>Gasto hoje: {moeda(hoje)} de {moeda(aluno.limiteDiario)} (limite diário)</div>}
              {aluno.limiteMensal != null && <div>Gasto no mês: {moeda(mes)} de {moeda(aluno.limiteMensal)} (limite mensal)</div>}
            </div>
          )}
        </div>

        <div style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          {FORMAS.map((f) => (
            <div key={f.id} className={`opcao-pagamento ${forma === f.id ? 'selecionada' : ''}`} onClick={() => { setForma(f.id); setErro('') }}>
              <span>
                <b>{f.nome}</b>
                <div style={{ fontSize: '.78rem', color: '#6b7280' }}>
                  {f.id === 'saldo' ? `Disponível: ${moeda(aluno.saldo)}` : f.desc}
                </div>
              </span>
              <input type="radio" checked={forma === f.id} readOnly />
            </div>
          ))}
        </div>

        {erro && <div className="aviso-banner fechada">{erro}</div>}
        <button className="btn" disabled={!cantinaAberta} onClick={confirmar}>Confirmar e pagar {moeda(total)}</button>
      </div>
    </div>
  )
}
