import React from 'react'
import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

function Carregando() {
  return (
    <div className="tela-cheia">
      <div style={{ color: 'white', fontWeight: 700 }}>Carregando...</div>
    </div>
  )
}

export function RotaAluno({ children }) {
  const { aluno, carregando } = useApp()
  if (carregando) return <Carregando />
  return aluno ? children : <Navigate to="/" replace />
}

export function RotaCantina({ children }) {
  const { cantinaLogada, carregando } = useApp()
  if (carregando) return <Carregando />
  return cantinaLogada ? children : <Navigate to="/cantina" replace />
}

export function RotaResponsavel({ children }) {
  const { responsavelRa, carregando } = useApp()
  if (carregando) return <Carregando />
  return responsavelRa ? children : <Navigate to="/responsavel" replace />
}
