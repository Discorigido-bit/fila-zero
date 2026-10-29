import React from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { useApp, moeda } from '../context/AppContext.jsx'

export default function Carrinho() {
  const { carrinho, alterarQtd, produtos, cantinaAberta } = useApp()
  const navigate = useNavigate()
  const total = carrinho.reduce((s, i) => s + i.preco * i.qtd, 0)
  const temIndisponivel = carrinho.some((i) => !produtos.some((p) => p.id === i.id))

  return (
    <div>
      <Header />
      <div className="container">
        <p><a href="#" onClick={(e) => { e.preventDefault(); navigate('/cardapio') }}>← Voltar ao cardápio</a></p>
        <h2>Seu carrinho</h2>
        {carrinho.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <p><b>Carrinho vazio</b></p>
            <p style={{ color: '#6b7280' }}>Adicione itens do cardápio para continuar</p>
            <button className="btn" style={{ width: 'auto', padding: '10px 20px' }} onClick={() => navigate('/cardapio')}>Ver cardápio</button>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 12, padding: 16, maxWidth: 500 }}>
            {!cantinaAberta && <div className="aviso-banner fechada">A cantina está fechada no momento.</div>}
            {carrinho.map((i) => {
              const indisponivel = !produtos.some((p) => p.id === i.id)
              return (
                <div className="linha-item" key={i.id}>
                  <div>
                    <div>{i.nome}</div>
                    <div style={{ fontSize: '.8rem', color: indisponivel ? '#d6003c' : '#6b7280' }}>
                      {indisponivel ? 'Indisponível na cantina. Remova este item.' : moeda(i.preco)}
                    </div>
                  </div>
                  <div className="qtd-controle">
                    <button onClick={() => alterarQtd(i.id, -1)}>−</button>
                    <span>{i.qtd}</span>
                    <button onClick={() => alterarQtd(i.id, 1)} disabled={indisponivel}>+</button>
                  </div>
                </div>
              )
            })}
            <div className="resumo-total"><span>Total</span><span>{moeda(total)}</span></div>
            <button className="btn" disabled={!cantinaAberta || temIndisponivel} onClick={() => navigate('/pagamento')}>Ir para pagamento</button>
          </div>
        )}
      </div>
    </div>
  )
}
