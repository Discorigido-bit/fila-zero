import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { CANTINA_DEMO } from '../data/produtos.js'

export default function LoginCantina() {
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const { loginCantina } = useApp()
  const navigate = useNavigate()

  function entrar(e) {
    e.preventDefault()
    if (loginCantina(usuario, senha)) navigate('/cantina/painel')
    else setErro('Usuário ou senha inválidos.')
  }

  return (
    <div className="tela-cheia">
      <div className="card-login">
        <div className="logo-emoji">FZ</div>
        <h1>FilaZero</h1>
        <p className="subtitulo">Painel da Cantina</p>
        <form onSubmit={entrar}>
          <div className="campo">
            <label>Usuário</label>
            <input value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="cantina" />
          </div>
          <div className="campo">
            <label>Senha</label>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" />
          </div>
          {erro && <p className="erro">{erro}</p>}
          <button className="btn" type="submit">Entrar no painel</button>
        </form>
        <div className="demo-box">Demo: <b>{CANTINA_DEMO.usuario}</b> / <b>{CANTINA_DEMO.senha}</b></div>
        <p style={{ marginTop: 14 }}>
          <Link to="/" style={{ fontSize: '.8rem', color: '#6b7280' }}>← Sou aluno</Link>
        </p>
      </div>
    </div>
  )
}
