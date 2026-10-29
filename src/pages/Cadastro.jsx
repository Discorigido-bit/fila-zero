import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

const CAMPOS_INICIAIS = { nome: '', ra: '', email: '', turma: '', emailResponsavel: '', senha: '', confirmarSenha: '' }

export default function Cadastro() {
  const [dados, setDados] = useState(CAMPOS_INICIAIS)
  const [erro, setErro] = useState('')
  const { cadastrarAluno } = useApp()
  const navigate = useNavigate()

  function set(campo) {
    return (e) => setDados((d) => ({ ...d, [campo]: e.target.value }))
  }

  function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  function enviar(e) {
    e.preventDefault()
    setErro('')

    if (!validarEmail(dados.email)) {
      setErro('Informe um e-mail válido do aluno.')
      return
    }
    if (!validarEmail(dados.emailResponsavel)) {
      setErro('Informe um e-mail válido do responsável.')
      return
    }
    if (dados.senha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.')
      return
    }
    if (dados.senha !== dados.confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    const resultado = cadastrarAluno({
      nome: dados.nome.trim(),
      ra: dados.ra,
      email: dados.email.trim(),
      turma: dados.turma.trim(),
      emailResponsavel: dados.emailResponsavel.trim(),
      senha: dados.senha,
    })

    if (resultado.ok) navigate('/cardapio')
    else setErro(resultado.erro)
  }

  return (
    <div className="tela-cheia">
      <div className="card-login" style={{ width: 380 }}>
        <div className="logo-emoji">FZ</div>
        <h1>Criar conta</h1>
        <p className="subtitulo">Cadastro do aluno — FilaZero</p>

        <form onSubmit={enviar}>
          <div className="campo">
            <label>Nome completo</label>
            <input value={dados.nome} onChange={set('nome')} placeholder="Seu nome completo" required />
          </div>
          <div className="campo">
            <label>RA (registro do aluno)</label>
            <input value={dados.ra} onChange={set('ra')} placeholder="Ex: 2026001234" required />
          </div>
          <div className="campo">
            <label>Turma</label>
            <input value={dados.turma} onChange={set('turma')} placeholder="Ex: Técnico em Informática" required />
          </div>
          <div className="campo">
            <label>E-mail do aluno</label>
            <input type="email" value={dados.email} onChange={set('email')} placeholder="voce@email.com" required />
          </div>
          <div className="campo">
            <label>E-mail do responsável</label>
            <input type="email" value={dados.emailResponsavel} onChange={set('emailResponsavel')} placeholder="responsavel@email.com" required />
          </div>
          <div className="campo">
            <label>Senha</label>
            <input type="password" value={dados.senha} onChange={set('senha')} placeholder="Mínimo 6 caracteres" required />
          </div>
          <div className="campo">
            <label>Confirmar senha</label>
            <input type="password" value={dados.confirmarSenha} onChange={set('confirmarSenha')} placeholder="Repita a senha" required />
          </div>

          {erro && <p className="erro">{erro}</p>}
          <button className="btn" type="submit">Criar conta e entrar</button>
        </form>

        <p style={{ marginTop: 14 }}>
          <Link to="/" style={{ fontSize: '.8rem', color: '#6b7280' }}>← Já tenho conta, fazer login</Link>
        </p>
      </div>
    </div>
  )
}
