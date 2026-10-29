import React, { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

export default function CriarSenhaResponsavel() {
  const location = useLocation()
  const email = location.state?.email
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro] = useState('')
  const { criarSenhaResponsavel } = useApp()
  const navigate = useNavigate()

  // Se a pessoa cair aqui direto pela URL, sem ter passado pelo login, manda pro login.
  if (!email) return <Navigate to="/responsavel" replace />

  function salvar(e) {
    e.preventDefault()
    if (novaSenha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.')
      return
    }
    if (novaSenha !== confirmar) {
      setErro('As senhas não coincidem.')
      return
    }
    const resultado = criarSenhaResponsavel(email, novaSenha)
    if (resultado.ok) navigate('/responsavel/painel')
    else setErro(resultado.erro)
  }

  return (
    <div className="tela-cheia roxo">
      <div className="card-login">
        <div className="logo-emoji" style={{ background: 'var(--roxo)' }}>FZ</div>
        <h1>Portal do Responsável</h1>
        <p className="subtitulo">Primeiro acesso — crie uma senha exclusiva</p>
        <p style={{ fontSize: '.8rem', color: '#6b7280', textAlign: 'left', marginBottom: 16 }}>
          Esta senha é <b>independente</b> da senha do aluno. Somente o responsável deve conhecê-la.
        </p>
        <form onSubmit={salvar}>
          <div className="campo">
            <label>Nova senha</label>
            <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="campo">
            <label>Confirmar senha</label>
            <input type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} placeholder="••••••••" />
          </div>
          {erro && <p className="erro">{erro}</p>}
          <button className="btn roxo" type="submit">Criar senha e acessar</button>
        </form>
      </div>
    </div>
  )
}
