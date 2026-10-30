import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

export default function LoginCantina() {
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const { loginCantina } = useApp()
  const navigate = useNavigate()

  async function entrar(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    const resultado = await loginCantina(usuario, senha)
    setEnviando(false)
    if (resultado.ok) navigate('/cantina/painel')
    else setErro(resultado.erro)
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
          <button className="btn" type="submit" disabled={enviando}>{enviando ? 'Entrando...' : 'Entrar no painel'}</button>
        </form>
        <p style={{ marginTop: 14 }}>
          <Link to="/" style={{ fontSize: '.8rem', color: '#6b7280' }}>← Sou aluno</Link>
        </p>
      </div>
    </div>
  )
}
