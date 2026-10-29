import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, moeda, chaveDia, chaveMes } from '../context/AppContext.jsx'
import { CATEGORIAS, FORMAS_PAGAMENTO } from '../data/produtos.js'

const ABAS = ['Visão geral', 'Limites', 'Saldo', 'Restrições', 'Histórico']
const paraNumero = (txt) => {
  const limpo = String(txt).trim().replace(',', '.')
  return limpo === '' ? null : Number(limpo)
}
const textoLimite = (v) => (v == null ? '' : String(v).replace('.', ','))

function BarraUso({ rotulo, gasto, limite }) {
  if (limite == null) return <div className="uso"><span>{rotulo}: {moeda(gasto)}</span><small>sem limite definido</small></div>
  const pct = Math.min(100, (gasto / limite) * 100)
  return (
    <div className="uso">
      <span>{rotulo}: {moeda(gasto)} de {moeda(limite)}</span>
      <div className="barra"><div className={`barra-fill ${pct >= 100 ? 'cheia' : pct >= 80 ? 'alerta' : ''}`} style={{ width: `${pct}%` }} /></div>
    </div>
  )
}

export default function PainelResponsavel() {
  const {
    alunoControlado, pedidos, produtos, atualizarRestricoes, atualizarLimites, adicionarSaldo,
    logoutResponsavel, mostrarToast, gastos,
  } = useApp()
  const navigate = useNavigate()
  const [aba, setAba] = useState('Visão geral')

  const [categoriasBloqueadas, setCategoriasBloqueadas] = useState(alunoControlado?.categoriasBloqueadas || [])
  const [itensBloqueados, setItensBloqueados] = useState(alunoControlado?.itensBloqueados || [])
  const [salvoRestricoes, setSalvoRestricoes] = useState(false)
  const [limDiario, setLimDiario] = useState(textoLimite(alunoControlado?.limiteDiario))
  const [limMensal, setLimMensal] = useState(textoLimite(alunoControlado?.limiteMensal))
  const [erroLimites, setErroLimites] = useState('')
  const [valorSaldo, setValorSaldo] = useState('')
  const [erroSaldo, setErroSaldo] = useState('')

  useEffect(() => {
    setCategoriasBloqueadas(alunoControlado?.categoriasBloqueadas || [])
    setItensBloqueados(alunoControlado?.itensBloqueados || [])
    setLimDiario(textoLimite(alunoControlado?.limiteDiario))
    setLimMensal(textoLimite(alunoControlado?.limiteMensal))
  }, [alunoControlado?.ra]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!alunoControlado) return null
  const ra = alunoControlado.ra
  const meusPedidos = pedidos.filter((p) => p.alunoRa === ra)
  const { hoje, mes } = gastos(ra)

  function toggleCategoria(cat) { setCategoriasBloqueadas((p) => (p.includes(cat) ? p.filter((c) => c !== cat) : [...p, cat])); setSalvoRestricoes(false) }
  function toggleItem(id) { setItensBloqueados((p) => (p.includes(id) ? p.filter((i) => i !== id) : [...p, id])); setSalvoRestricoes(false) }
  function salvarRestricoes() {
    atualizarRestricoes(ra, { categoriasBloqueadas, itensBloqueados })
    setSalvoRestricoes(true)
    mostrarToast('O cardápio do aluno já foi atualizado.', { titulo: 'Restrições salvas' })
  }

  function salvarLimites(e) {
    e.preventDefault()
    const d = paraNumero(limDiario)
    const m = paraNumero(limMensal)
    if ((d != null && !(d > 0)) || (m != null && !(m > 0))) { setErroLimites('Use um valor maior que zero, ou deixe vazio para ficar sem limite.'); return }
    const r = atualizarLimites(ra, { limiteDiario: d, limiteMensal: m })
    if (!r.ok) { setErroLimites(r.erro); return }
    setErroLimites('')
    mostrarToast('Os novos limites já valem para os próximos pedidos.', { titulo: 'Limites salvos' })
  }

  function recarregar(e) {
    e.preventDefault()
    const v = paraNumero(valorSaldo)
    const r = adicionarSaldo(ra, v)
    if (!r.ok) { setErroSaldo(r.erro); return }
    setErroSaldo('')
    setValorSaldo('')
    mostrarToast(`${moeda(v)} adicionados ao saldo de ${alunoControlado.nome}.`, { titulo: 'Saldo adicionado' })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6fa' }}>
      <div style={{ background: 'linear-gradient(135deg,#4c1d95,#8b2ff7 60%,#00e5ff)', padding: '16px 24px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><b>Portal do Responsável</b><div style={{ fontSize: '.8rem', opacity: .85 }}>{alunoControlado.nome} · Saldo {moeda(alunoControlado.saldo)}</div></div>
          <button className="btn outline" style={{ width: 'auto', padding: '6px 12px', background: 'transparent', borderColor: 'white', color: 'white' }}
            onClick={() => { logoutResponsavel(); navigate('/responsavel') }}>Sair</button>
        </div>
        <div className="tabs" style={{ marginTop: 12, marginBottom: 0 }}>
          {ABAS.map((a) => (
            <button key={a} className={aba === a ? 'ativa' : ''} onClick={() => setAba(a)}
              style={{ background: aba === a ? 'white' : 'rgba(255,255,255,.15)', color: aba === a ? 'var(--roxo)' : 'white', boxShadow: 'none' }}>{a}</button>
          ))}
        </div>
      </div>

      <div className="container" style={{ maxWidth: 700 }}>
        {aba === 'Visão geral' && (
          <>
            <div className="stat-grid">
              <div className="stat-box"><div>Saldo</div><div className="valor">{moeda(alunoControlado.saldo)}</div></div>
              <div className="stat-box"><div>Gasto hoje</div><div className="valor">{moeda(hoje)}</div></div>
              <div className="stat-box"><div>Gasto no mês</div><div className="valor">{moeda(mes)}</div></div>
              <div className="stat-box"><div>Pedidos</div><div className="valor">{meusPedidos.length}</div></div>
            </div>
            <div style={{ background: 'white', borderRadius: 12, padding: 16 }}>
              <BarraUso rotulo="Hoje" gasto={hoje} limite={alunoControlado.limiteDiario} />
              <BarraUso rotulo="Neste mês" gasto={mes} limite={alunoControlado.limiteMensal} />
            </div>
          </>
        )}

        {aba === 'Limites' && (
          <form onSubmit={salvarLimites} style={{ background: 'white', borderRadius: 12, padding: 16 }}>
            <p style={{ fontSize: '.85rem', background: '#eef2ff', padding: 10, borderRadius: 8 }}>
              <b>Como funciona:</b> quando um novo pedido fizer o gasto passar do limite, ele é recusado até o período renovar (o diário renova todo dia, o mensal todo mês).
            </p>
            <BarraUso rotulo="Hoje" gasto={hoje} limite={alunoControlado.limiteDiario} />
            <BarraUso rotulo="Neste mês" gasto={mes} limite={alunoControlado.limiteMensal} />
            <div className="campo"><label>Limite diário (R$)</label><input value={limDiario} onChange={(e) => setLimDiario(e.target.value)} placeholder="Sem limite" inputMode="decimal" /></div>
            <div className="campo"><label>Limite mensal (R$)</label><input value={limMensal} onChange={(e) => setLimMensal(e.target.value)} placeholder="Sem limite" inputMode="decimal" /></div>
            {erroLimites && <p className="erro">{erroLimites}</p>}
            <button className="btn roxo" type="submit">Salvar limites</button>
          </form>
        )}

        {aba === 'Saldo' && (
          <div style={{ background: 'white', borderRadius: 12, padding: 16 }}>
            <div className="stat-box" style={{ background: '#f5f3ff', marginBottom: 16 }}>
              <div>Saldo atual de {alunoControlado.nome}</div>
              <div className="valor" style={{ fontSize: '1.8rem' }}>{moeda(alunoControlado.saldo)}</div>
            </div>
            <form onSubmit={recarregar}>
              <div className="campo"><label>Valor a adicionar (R$)</label>
                <input value={valorSaldo} onChange={(e) => setValorSaldo(e.target.value)} placeholder="Ex: 30,00" inputMode="decimal" />
              </div>
              <div className="atalhos">
                {[10, 20, 50, 100].map((v) => <button type="button" key={v} onClick={() => setValorSaldo(String(v))}>+ {moeda(v)}</button>)}
              </div>
              {erroSaldo && <p className="erro">{erroSaldo}</p>}
              <button className="btn roxo" type="submit">Adicionar saldo</button>
              <p style={{ fontSize: '.75rem', color: '#6b7280' }}>Simulação: nesta versão o saldo é creditado na hora, sem cobrança real. Em produção isso passa pelo gateway de pagamento.</p>
            </form>
            <h4 style={{ marginBottom: 4 }}>Últimas recargas</h4>
            {(alunoControlado.recargas || []).length === 0 && <p style={{ color: '#6b7280', fontSize: '.85rem' }}>Nenhuma recarga ainda.</p>}
            {(alunoControlado.recargas || []).slice(0, 8).map((r, i) => (
              <div className="toggle-row" key={i}><span>{new Date(r.em).toLocaleString('pt-BR')}</span><b>+ {moeda(r.valor)}</b></div>
            ))}
          </div>
        )}

        {aba === 'Restrições' && (
          <div style={{ background: 'white', borderRadius: 12, padding: 16 }}>
            <p style={{ fontSize: '.85rem', background: '#fffbeb', padding: 10, borderRadius: 8 }}>
              Itens e categorias bloqueados ficam <b>indisponíveis</b> para o aluno ao fazer pedidos.
            </p>
            <h4 style={{ marginTop: 16, marginBottom: 4, fontSize: '.85rem', color: '#6b7280' }}>BLOQUEAR CATEGORIAS INTEIRAS</h4>
            {CATEGORIAS.map((cat) => (
              <div className="toggle-row" key={cat}><span>{cat}</span>
                <button className={`switch ${categoriasBloqueadas.includes(cat) ? 'on' : ''}`} onClick={() => toggleCategoria(cat)}><span className="bola" /></button>
              </div>
            ))}
            <h4 style={{ marginTop: 20, marginBottom: 4, fontSize: '.85rem', color: '#6b7280' }}>BLOQUEAR ITENS ESPECÍFICOS</h4>
            {produtos.map((p) => {
              const jaBloqueada = categoriasBloqueadas.includes(p.categoria)
              return (
                <div className="toggle-row" key={p.id} style={{ opacity: jaBloqueada ? 0.5 : 1 }}>
                  <span>{p.nome} <span style={{ fontSize: '.75rem', color: '#9ca3af' }}>{p.categoria}</span></span>
                  <button className={`switch ${itensBloqueados.includes(p.id) || jaBloqueada ? 'on' : ''}`} onClick={() => !jaBloqueada && toggleItem(p.id)} disabled={jaBloqueada}><span className="bola" /></button>
                </div>
              )
            })}
            <button className="btn roxo" style={{ marginTop: 16 }} onClick={salvarRestricoes}>Salvar configurações</button>
            {salvoRestricoes && <p style={{ color: 'var(--sucesso)', fontSize: '.85rem', marginTop: 8 }}>Restrições salvas. O cardápio do aluno já foi atualizado.</p>}
          </div>
        )}

        {aba === 'Histórico' && (
          <div style={{ background: 'white', borderRadius: 12, padding: 16 }}>
            {meusPedidos.length === 0 && <p>Nenhum pedido ainda.</p>}
            {meusPedidos.map((p) => (
              <div key={p.id} style={{ borderBottom: '1px solid #f0f0f0', padding: '10px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><b>{p.id}</b><span>{moeda(p.total)}</span></div>
                <div style={{ fontSize: '.85rem' }}>{p.itens.map((i) => `${i.qtd}x ${i.nome}`).join(', ')}</div>
                <div style={{ fontSize: '.8rem', color: '#6b7280' }}>{new Date(p.criadoEm).toLocaleString('pt-BR')} · {FORMAS_PAGAMENTO[p.formaPagamento] || p.formaPagamento}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
