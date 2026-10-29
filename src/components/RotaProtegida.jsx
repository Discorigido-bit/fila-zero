import React from 'react'
import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

export function RotaAluno({ children }) {
  const { aluno } = useApp()
  return aluno ? children : <Navigate to="/" replace />
}

export function RotaCantina({ children }) {
  const { cantinaLogada } = useApp()
  return cantinaLogada ? children : <Navigate to="/cantina" replace />
}

export function RotaResponsavel({ children }) {
  const { responsavelRa } = useApp()
  return responsavelRa ? children : <Navigate to="/responsavel" replace />
}
