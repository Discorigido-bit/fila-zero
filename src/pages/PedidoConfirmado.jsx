import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { useApp, moeda } from '../context/AppContext.jsx'
import { FORMAS_PAGAMENTO } from '../data/produtos.js'

const ETAPAS = [
  { chave: 'aguardando', label: 'Pedido recebido', desc: 'A cantina recebeu seu pedido.' },
  { chave: 'preparando', label: 'Preparando', desc: 'Seu pedido está sendo preparado na cozinha.' },
  { chave: 'pronto', label: 'Pronto para retirar', desc: 'Vá ao balcão e informe seu código.' },
  { chave: 'entregue', label: 'Retirado', desc: 'Bom apetite!' },
]
const ORDEM = ETAPAS.map((e) => e.chave)

export default function PedidoConfirmado() {
  const { id } = useParams()
  const { pedidos } = useApp() // atualiza sozinho quando a cantina muda o status
  const navigate = useNavigate()
  const pedido = pedidos.find((p) => p.id === id)

  if (!pedido) return (<div><Header /><div className="container">Pedido não encontrado.</div></div>)
  const idxAtual = ORDEM.indexOf(pedido.status)

  return (
    <div>
      <Header />
      <div className="container" style={{ maxWidth: 500 }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <h2>Pedido confirmado</h2>
          <p style={{ color: '#6b7280' }}>O status é atualizado automaticamente, sem precisar recarregar a página.</p>
        </div>
        <div style={{ background: 'linear-gradient(135deg,var(--vermelho),var(--laranja))', color: 'white', borderRadius: 12, padding: 20, textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: '.75rem', opacity: .85 }}>NÚMERO DO PEDIDO</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{pedido.id}</div>
          <div style={{ fontSize: '.75rem', opacity: .85 }}>Informe esse código no balcão</div>
        </div>
        <div style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div className="status-track">
            {ETAPAS.map((et, i) => {
              const feito = i <= idxAtual
              const atual = et.chave === pedido.status
              return (
                <div className="status-item" key={et.chave}>
                  <div className={`status-bolinha ${feito ? 'feito' : ''} ${atual ? 'atual' : ''}`}>{i + 1}</div>
                  <div>
                    <div style={{ fontWeight: 700, opacity: feito ? 1 : 0.5 }}>{et.label}</div>
                    <div style={{ fontSize: '.8rem', color: '#6b7280' }}>{et.desc}</div>
                  </div>
                </div>
              )
            })}
          </div>
          {pedido.status === 'pronto' && (
            <div className="aviso-banner aberta" style={{ marginBottom: 0 }}>
              Seu pedido está pronto. Dirija-se ao balcão com o código {pedido.id}.
            </div>
          )}
        </div>
        <div style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: '.75rem', color: '#6b7280', marginBottom: 8 }}>ITENS DO PEDIDO</div>
          {pedido.itens.map((i) => (
            <div className="linha-item" key={i.id}><span>{i.qtd}x {i.nome}</span><span>{moeda(i.preco * i.qtd)}</span></div>
          ))}
          <div className="resumo-total"><span>Total pago</span><span>{moeda(pedido.total)}</span></div>
          <div style={{ fontSize: '.8rem', color: '#6b7280' }}>{FORMAS_PAGAMENTO[pedido.formaPagamento] || pedido.formaPagamento}</div>
        </div>
        <button className="btn outline" onClick={() => navigate('/cardapio')}>Fazer novo pedido</button>
      </div>
    </div>
  )
}
