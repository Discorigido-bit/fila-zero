import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, moeda, chaveDia } from '../context/AppContext.jsx'
import { CATEGORIAS, FORMAS_PAGAMENTO } from '../data/produtos.js'

const COLUNAS = [
  { status: 'aguardando', titulo: 'Aguardando', proximo: 'preparando', acao: 'Iniciar preparo' },
  { status: 'preparando', titulo: 'Preparando', proximo: 'pronto', acao: 'Marcar como pronto' },
  { status: 'pronto', titulo: 'Prontos', proximo: 'entregue', acao: 'Confirmar entrega' },
  { status: 'entregue', titulo: 'Entregues hoje', proximo: null, acao: null },
]

function useRelogio() {
  const [agora, setAgora] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setAgora(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return agora
}

function GerenciarCardapio() {
  const { produtos, adicionarProduto, removerProduto, mostrarToast } = useApp()
  const [form, setForm] = useState({ nome: '', categoria: CATEGORIAS[0], preco: '', descricao: '' })
  const [erro, setErro] = useState('')
  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  function enviar(e) {
    e.preventDefault()
    const r = adicionarProduto(form)
    if (!r.ok) { setErro(r.erro); return }
    setErro('')
    mostrarToast(`${form.nome.trim()} foi adicionado ao cardápio.`, { titulo: 'Produto adicionado' })
    setForm({ nome: '', categoria: form.categoria, preco: '', descricao: '' })
  }
  function remover(p) {
    if (window.confirm(`Remover "${p.nome}" do cardápio? Os alunos não poderão mais pedir este item.`)) {
      removerProduto(p.id)
      mostrarToast(`${p.nome} foi removido do cardápio.`, { titulo: 'Produto removido', tipo: 'info' })
    }
  }

  return (
    <div className="grid-gerenciar">
      <form onSubmit={enviar} style={{ background: 'white', borderRadius: 12, padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Adicionar produto</h3>
        <div className="campo"><label>Nome</label><input value={form.nome} onChange={set('nome')} placeholder="Ex: Pastel de queijo" required /></div>
        <div className="campo">
          <label>Categoria</label>
          <select value={form.categoria} onChange={set('categoria')} className="select">
            {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="campo"><label>Preço (R$)</label><input value={form.preco} onChange={set('preco')} placeholder="Ex: 6,50" inputMode="decimal" required /></div>
        <div className="campo"><label>Descrição</label><input value={form.descricao} onChange={set('descricao')} placeholder="Ingredientes, tamanho..." /></div>
        {erro && <p className="erro">{erro}</p>}
        <button className="btn" type="submit">Adicionar ao cardápio</button>
      </form>

      <div style={{ background: 'white', borderRadius: 12, padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Produtos no cardápio ({produtos.length})</h3>
        {CATEGORIAS.map((cat) => {
          const lista = produtos.filter((p) => p.categoria === cat)
          if (lista.length === 0) return null
          return (
            <div key={cat} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '.72rem', letterSpacing: '.06em', color: '#6b7280', textTransform: 'uppercase', marginBottom: 4 }}>{cat}</div>
              {lista.map((p) => (
                <div className="toggle-row" key={p.id}>
                  <span>{p.nome} <span style={{ color: '#6b7280', fontSize: '.8rem' }}>{moeda(p.preco)}</span></span>
                  <button className="btn outline" style={{ width: 'auto', padding: '4px 12px', fontSize: '.78rem' }} onClick={() => remover(p)}>Remover</button>
                </div>
              ))}
            </div>
          )
        })}
        {produtos.length === 0 && <p style={{ color: '#6b7280' }}>Nenhum produto. Adicione o primeiro ao lado.</p>}
      </div>
    </div>
  )
}

export default function PainelCantina() {
  const { pedidos, atualizarStatusPedido, logoutCantina, cantinaAberta, alternarCantinaAberta, mostrarToast } = useApp()
  const navigate = useNavigate()
  const agora = useRelogio()
  const [aba, setAba] = useState('Pedidos')

  const hoje = chaveDia(agora)
  const pedidosHoje = pedidos.filter((p) => chaveDia(p.criadoEm) === hoje && p.status !== 'cancelado')
  const faturamentoHoje = pedidosHoje.reduce((s, p) => s + p.total, 0)

  function alternar() {
    alternarCantinaAberta()
    mostrarToast(cantinaAberta ? 'Novos pedidos estão bloqueados.' : 'Os alunos já podem fazer pedidos.', {
      titulo: cantinaAberta ? 'Cantina fechada' : 'Cantina aberta', tipo: cantinaAberta ? 'info' : 'sucesso',
    })
  }

  return (
    <div>
      <header className="header" style={{ flexWrap: 'wrap', gap: 10 }}>
        <div className="marca">
          <span className="logo-emoji">FZ</span> FilaZero
          <span className="tag-cantina">Cantina</span>
        </div>
        <div className="relogio">
          <div className="hora">{agora.toLocaleTimeString('pt-BR')}</div>
          <div className="data">{agora.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</div>
        </div>
        <div className="direita">
          <div className="abre-fecha">
            <span className={`pilula-status ${cantinaAberta ? 'aberta' : 'fechada'}`}><i className="dot" /> {cantinaAberta ? 'Aberta' : 'Fechada'}</span>
            <button className={`switch ${cantinaAberta ? 'on' : ''}`} onClick={alternar} aria-label="Abrir ou fechar a cantina" title="Abrir ou fechar a cantina"><span className="bola" /></button>
          </div>
          <span style={{ fontSize: '.85rem' }}>Faturamento hoje: <b>{moeda(faturamentoHoje)}</b></span>
          <button className="btn outline" style={{ width: 'auto', padding: '6px 10px' }} onClick={() => { logoutCantina(); navigate('/cantina') }}>Sair</button>
        </div>
      </header>

      <div className="container" style={{ maxWidth: 1100 }}>
        {!cantinaAberta && (
          <div className="aviso-banner fechada">
            A cantina está fechada: os alunos não conseguem fazer novos pedidos. Pedidos já recebidos continuam no painel.
          </div>
        )}
        <div className="tabs">
          {['Pedidos', 'Cardápio'].map((a) => <button key={a} className={aba === a ? 'ativa' : ''} onClick={() => setAba(a)}>{a}</button>)}
        </div>

        {aba === 'Pedidos' && (
          <div className="kanban">
            {COLUNAS.map((col) => {
              const itens = pedidos
                .filter((p) => p.status === col.status && (col.status !== 'entregue' || chaveDia(p.criadoEm) === hoje))
                .sort((a, b) => new Date(a.criadoEm) - new Date(b.criadoEm)) // fila: mais antigo primeiro
              return (
                <div className="coluna-kanban" key={col.status}>
                  <h4>{col.titulo} ({itens.length})</h4>
                  {itens.length === 0 && <p style={{ fontSize: '.75rem', color: '#9ca3af' }}>Nenhum pedido</p>}
                  {itens.map((p) => (
                    <div className="pedido-card" key={p.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <b>{p.alunoNome || 'Aluno'}</b><span style={{ color: '#6b7280' }}>{p.id}</span>
                      </div>
                      <div style={{ fontSize: '.75rem', color: '#6b7280', marginBottom: 4 }}>
                        {new Date(p.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {p.itens.map((i) => <div key={i.id}>{i.qtd}x {i.nome}</div>)}
                      <div style={{ marginTop: 6, fontWeight: 700 }}>
                        {moeda(p.total)} <span style={{ fontWeight: 400, color: '#6b7280' }}>· {FORMAS_PAGAMENTO[p.formaPagamento] || p.formaPagamento}</span>
                      </div>
                      {col.proximo && <button className="btn" onClick={() => atualizarStatusPedido(p.id, col.proximo)}>{col.acao}</button>}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}

        {aba === 'Cardápio' && <GerenciarCardapio />}
      </div>
    </div>
  )
}
