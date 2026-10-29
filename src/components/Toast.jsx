import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

// Pop-up interativo: fecha sozinho, pausa com o mouse em cima, tem botão de ação e de fechar.
export default function Toast() {
  const { toast, fecharToast } = useApp()
  const navigate = useNavigate()
  const [pausado, setPausado] = useState(false)

  useEffect(() => setPausado(false), [toast?.id])

  useEffect(() => {
    if (!toast || pausado) return undefined
    const t = setTimeout(fecharToast, toast.duracao || 5000)
    return () => clearTimeout(t)
  }, [toast, pausado, fecharToast])

  if (!toast) return null

  return (
    <div className="toast-area" role="status" aria-live="polite">
      <div
        key={toast.id}
        className={`toast-popup ${toast.tipo || 'sucesso'}`}
        onMouseEnter={() => setPausado(true)}
        onMouseLeave={() => setPausado(false)}
      >
        <div className="toast-corpo">
          <strong>{toast.titulo || 'Aviso'}</strong>
          <span>{toast.mensagem}</span>
          {toast.acao && (
            <button className="toast-acao" onClick={() => { navigate(toast.acao.to); fecharToast() }}>
              {toast.acao.label}
            </button>
          )}
        </div>
        <button className="toast-fechar" onClick={fecharToast} aria-label="Fechar aviso">×</button>
      </div>
    </div>
  )
}
