import React from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { useApp, moeda } from '../context/AppContext.jsx'
import { STATUS_LABEL, FORMAS_PAGAMENTO } from '../data/produtos.js'

export default function MeusPedidos() {
  const { pedidos, aluno } = useApp()
  const meus = pedidos.filter((p) => p.alunoRa === aluno?.ra)

  return (
    <div>
      <Header />
      <div className="container" style={{ maxWidth: 600 }}>
        <h2>Meus Pedidos</h2>
        {meus.length === 0 && <p>Você ainda não fez nenhum pedido.</p>}
        {meus.map((p) => (
          <Link to={`/pedido/${p.id}`} key={p.id} style={{ display: 'block' }}>
            <div style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <b>{p.id} <span style={{ fontWeight: 400, color: '#6b7280', fontSize: '.8rem' }}>{new Date(p.criadoEm).toLocaleString('pt-BR')}</span></b>
                <span className={`badge ${p.status}`}>{STATUS_LABEL[p.status] || p.status}</span>
              </div>
              {p.itens.map((i) => (
                <div key={i.id} style={{ fontSize: '.85rem', color: '#374151' }}>{i.qtd}x {i.nome}</div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontWeight: 700 }}>
                <span style={{ fontWeight: 400, color: '#6b7280', fontSize: '.8rem' }}>{FORMAS_PAGAMENTO[p.formaPagamento] || p.formaPagamento}</span>
                <span>{moeda(p.total)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
