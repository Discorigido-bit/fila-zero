import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

export default function LoginResponsavel() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const { loginResponsavel } = useApp()
  const navigate = useNavigate()

  async function entrar(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    const resultado = await loginResponsavel(email, senha)
    setEnviando(false)
    if (resultado.ok) {
      navigate('/responsavel/painel')
    } else if (resultado.primeiroAcesso) {
      navigate('/responsavel/criar-senha', { state: { email: resultado.email } })
    } else {
      setErro(resultado.erro)
    }
  }

  return (
    <div className="tela-cheia roxo">
      <div className="card-login">
        <div className="logo-emoji" style={{ background: 'var(--roxo)' }}>FZ</div>
        <h1>Portal do Responsável</h1>
        <p className="subtitulo">Acompanhe e controle os pedidos do seu filho(a)</p>
        <form onSubmit={entrar}>
          <div className="campo">
            <label>E-mail do responsável</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="responsavel@email.com" required />
          </div>
          <div className="campo">
            <label>Senha</label>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Deixe em branco no primeiro acesso" />
          </div>
          {erro && <p className="erro">{erro}</p>}
          <button className="btn roxo" type="submit" disabled={enviando}>{enviando ? 'Entrando...' : 'Entrar'}</button>
        </form>
        <div className="demo-box">
          Primeiro acesso? Digite o e-mail que o aluno cadastrou para você e deixe a senha em branco.
        </div>
        <p style={{ marginTop: 14 }}>
          <Link to="/" style={{ fontSize: '.8rem', color: '#6b7280' }}>← Sou aluno</Link>
        </p>
      </div>
    </div>
  )
}
