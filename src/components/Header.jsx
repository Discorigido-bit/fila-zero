import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useApp, moeda } from '../context/AppContext.jsx'

export default function Header() {
  const { aluno, carrinho, logoutAluno, cantinaAberta } = useApp()
  const navigate = useNavigate()
  const iniciais = aluno?.nome?.split(' ').map((p) => p[0]).slice(0, 2).join('') || '?'
  const qtdItens = carrinho.reduce((s, i) => s + i.qtd, 0)
  const ativo = ({ isActive }) => (isActive ? 'ativo' : '')

  function sair() {
    logoutAluno()
    navigate('/')
  }

  return (
    <>
      <header className="header">
        <div className="marca">
          <span className="logo-emoji">FZ</span> FilaZero
        </div>
        {/* Navegação do computador (some no celular) */}
        <nav>
          <NavLink to="/cardapio" className={ativo}>Cardápio</NavLink>
          <NavLink to="/meus-pedidos" className={ativo}>Meus Pedidos</NavLink>
          <NavLink to="/responsavel" className={ativo}>Responsável</NavLink>
        </nav>
        <div className="direita">
          <span className={`pilula-status ${cantinaAberta ? 'aberta' : 'fechada'}`}>
            <i className="dot" /> <span className="so-desktop">Cantina&nbsp;</span>{cantinaAberta ? 'aberta' : 'fechada'}
          </span>
          <span className="saldo-header">Saldo {moeda(aluno?.saldo)}</span>
          <button className="btn so-desktop" style={{ width: 'auto', padding: '8px 14px' }} onClick={() => navigate('/carrinho')}>
            Carrinho ({qtdItens})
          </button>
          <div className="avatar so-desktop" title={aluno?.nome}>{iniciais}</div>
          <button className="btn outline so-desktop" style={{ width: 'auto', padding: '6px 10px' }} onClick={sair}>Sair</button>
        </div>
      </header>

      {/* Barra inferior fixa, só aparece no celular */}
      <nav className="nav-inferior" aria-label="Navegação principal">
        <NavLink to="/cardapio" className={ativo}>Cardápio</NavLink>
        <NavLink to="/meus-pedidos" className={ativo}>Pedidos</NavLink>
        <NavLink to="/carrinho" className={ativo}>
          Carrinho{qtdItens > 0 && <b className="badge-qtd">{qtdItens}</b>}
        </NavLink>
        <NavLink to="/responsavel" className={ativo}>Responsável</NavLink>
        <button onClick={sair}>Sair</button>
      </nav>
    </>
  )
}
