import React, { useMemo, useState } from 'react'
import Header from '../components/Header.jsx'
import { CATEGORIAS } from '../data/produtos.js'
import { useApp, moeda } from '../context/AppContext.jsx'

function CartaoProduto({ p, rank, vendidos }) {
  const { adicionarAoCarrinho, itemEstaBloqueado, cantinaAberta } = useApp()
  const bloqueado = itemEstaBloqueado(p)
  return (
    <div className="produto-card" style={bloqueado ? { opacity: 0.55 } : undefined}>
      <div className="produto-imagem">
        <span>{p.categoria}</span>
        {rank && <b className="selo-rank">#{rank} mais pedido</b>}
      </div>
      <div className="produto-info">
        <h3>{p.nome}</h3>
        <p>{p.descricao}</p>
        {vendidos > 0 && <span className="tag-vendidos">{vendidos} {vendidos === 1 ? 'unidade pedida' : 'unidades pedidas'}</span>}
        {bloqueado ? (
          <>
            <span style={{ fontSize: '.8rem', color: '#9ca3af' }}>Bloqueado pelo responsável</span>
            <button className="btn" disabled>Indisponível</button>
          </>
        ) : (
          <>
            <span className="produto-preco">{moeda(p.preco)}</span>
            <button className="btn" disabled={!cantinaAberta} onClick={() => adicionarAoCarrinho(p)}>
              {cantinaAberta ? '+ Adicionar' : 'Cantina fechada'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function Cardapio() {
  const [busca, setBusca] = useState('')
  const [categoria, setCategoria] = useState('Todas')
  const { produtos, cantinaAberta } = useApp()

  // Ranking: cada produto guarda um contador "vendidos" que sobe a cada pedido (atualiza ao vivo)
  const maisPedidos = useMemo(
    () => [...produtos].filter((p) => (p.vendidos || 0) > 0).sort((a, b) => b.vendidos - a.vendidos).slice(0, 5),
    [produtos],
  )

  const filtrados = produtos.filter((p) => {
    const bateCategoria = categoria === 'Todas' || p.categoria === categoria
    const bateBusca = p.nome.toLowerCase().includes(busca.toLowerCase())
    return bateCategoria && bateBusca
  })
  const mostrarRanking = maisPedidos.length > 0 && busca === '' && categoria === 'Todas'

  return (
    <div>
      <Header />
      <div className="container">
        {!cantinaAberta && (
          <div className="aviso-banner fechada">
            A cantina está fechada no momento. Você pode ver o cardápio, mas os pedidos estão desativados até ela reabrir.
          </div>
        )}

        <input className="busca" placeholder="Buscar no cardápio..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        <div className="categorias">
          {['Todas', ...CATEGORIAS].map((c) => (
            <button key={c} className={categoria === c ? 'ativa' : ''} onClick={() => setCategoria(c)}>{c}</button>
          ))}
        </div>

        {mostrarRanking && (
          <section style={{ marginBottom: 28 }}>
            <h2 className="titulo-secao">Mais pedidos <small>os favoritos da galera</small></h2>
            <div className="grid-produtos">
              {maisPedidos.map((p, i) => <CartaoProduto key={p.id} p={p} rank={i + 1} vendidos={p.vendidos} />)}
            </div>
          </section>
        )}

        <h2 className="titulo-secao">Cardápio completo</h2>
        <div className="grid-produtos">
          {filtrados.map((p) => <CartaoProduto key={p.id} p={p} />)}
          {filtrados.length === 0 && <p>{produtos.length === 0 ? 'A cantina ainda não cadastrou produtos.' : 'Nenhum item encontrado.'}</p>}
        </div>
      </div>
    </div>
  )
}
