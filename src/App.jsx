import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginAluno from './pages/LoginAluno.jsx'
import Cadastro from './pages/Cadastro.jsx'
import Cardapio from './pages/Cardapio.jsx'
import Carrinho from './pages/Carrinho.jsx'
import Pagamento from './pages/Pagamento.jsx'
import PedidoConfirmado from './pages/PedidoConfirmado.jsx'
import MeusPedidos from './pages/MeusPedidos.jsx'
import LoginCantina from './pages/LoginCantina.jsx'
import PainelCantina from './pages/PainelCantina.jsx'
import LoginResponsavel from './pages/LoginResponsavel.jsx'
import CriarSenhaResponsavel from './pages/CriarSenhaResponsavel.jsx'
import PainelResponsavel from './pages/PainelResponsavel.jsx'
import { RotaAluno, RotaCantina, RotaResponsavel } from './components/RotaProtegida.jsx'
import Toast from './components/Toast.jsx'

export default function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<LoginAluno />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/cantina" element={<LoginCantina />} />

      <Route path="/cardapio" element={<RotaAluno><Cardapio /></RotaAluno>} />
      <Route path="/carrinho" element={<RotaAluno><Carrinho /></RotaAluno>} />
      <Route path="/pagamento" element={<RotaAluno><Pagamento /></RotaAluno>} />
      <Route path="/pedido/:id" element={<RotaAluno><PedidoConfirmado /></RotaAluno>} />
      <Route path="/meus-pedidos" element={<RotaAluno><MeusPedidos /></RotaAluno>} />

      <Route path="/responsavel" element={<LoginResponsavel />} />
      <Route path="/responsavel/criar-senha" element={<CriarSenhaResponsavel />} />
      <Route path="/responsavel/painel" element={<RotaResponsavel><PainelResponsavel /></RotaResponsavel>} />

      <Route path="/cantina/painel" element={<RotaCantina><PainelCantina /></RotaCantina>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <Toast />
    </>
  )
}
