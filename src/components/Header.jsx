import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useApp, moeda } from '../context/AppContext.jsx'

export default function Header() {
  const { aluno, carrinho, logoutAluno, cantinaAberta } = useApp()
  const navigate = useNavigate()
  const iniciais = aluno?.nome?.split(' ').map((p) => p[0]).slice(0, 2).join('') || '?'
  const qtdItens = carrinho.reduce((s, i) => s + i.qtd, 0)

  return (
    <header className="header">
      <div className="marca">
        <span className="logo-emoji">FZ</span> FilaZero
      </div>
      <nav>
        <NavLink to="/cardapio" className={({ isActive }) => (isActive ? 'ativo' : '')}>Cardápio</NavLink>
        <NavLink to="/meus-pedidos" className={({ isActive }) => (isActive ? 'ativo' : '')}>Meus Pedidos</NavLink>
        <NavLink to="/responsavel" className={({ isActive }) => (isActive ? 'ativo' : '')}>Responsável</NavLink>
      </nav>
      <div className="direita">
        <span className={`pilula-status ${cantinaAberta ? 'aberta' : 'fechada'}`}>
          <i className="dot" /> Cantina {cantinaAberta ? 'aberta' : 'fechada'}
        </span>
        <span className="saldo-header">Saldo {moeda(aluno?.saldo)}</span>
        <button className="btn" style={{ width: 'auto', padding: '8px 14px' }} onClick={() => navigate('/carrinho')}>
          Carrinho ({qtdItens})
        </button>
        <div className="avatar" title={aluno?.nome}>{iniciais}</div>
        <button
          className="btn outline"
          style={{ width: 'auto', padding: '6px 10px' }}
          onClick={() => { logoutAluno(); navigate('/') }}
        >
          Sair
        </button>
      </div>
    </header>
  )
}
