import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

export default function LoginAluno() {
  const [ra, setRa] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const { loginAluno } = useApp()
  const navigate = useNavigate()

  async function entrar(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    const resultado = await loginAluno(ra, senha)
    setEnviando(false)
    if (resultado.ok) navigate('/cardapio')
    else setErro(resultado.erro)
  }

  return (
    <div className="tela-cheia">
      <div className="card-login">
        <div className="logo-emoji">FZ</div>
        <h1>FilaZero</h1>
        <p className="subtitulo">Cantina SESI/SENAI — sem espera, sem fila</p>
        <form onSubmit={entrar}>
          <div className="campo">
            <label>RA do aluno</label>
            <input value={ra} onChange={(e) => setRa(e.target.value)} placeholder="Ex: 2026001234" />
          </div>
          <div className="campo">
            <label>Senha</label>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" />
          </div>
          {erro && <p className="erro">{erro}</p>}
          <button className="btn" type="submit" disabled={enviando}>{enviando ? 'Entrando...' : 'Entrar'}</button>
        </form>
        <p style={{ marginTop: 14, marginBottom: 4 }}>
          Ainda não tem conta? <Link to="/cadastro" style={{ color: 'var(--vermelho)', fontWeight: 600 }}>Cadastre-se</Link>
        </p>
        <p>
          <Link to="/cantina" style={{ fontSize: '.8rem', color: '#6b7280' }}>Sou funcionário da cantina →</Link>
        </p>
      </div>
    </div>
  )
}
