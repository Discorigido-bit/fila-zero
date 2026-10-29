import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { ALUNO_DEMO, CANTINA_DEMO, PRODUTOS_INICIAIS, gerarPedidosIniciais } from '../data/produtos.js'

const AppContext = createContext(null)

// ---------- utilitários ----------
function ler(storage, chave, padrao) {
  try {
    const bruto = storage.getItem(chave)
    return bruto ? JSON.parse(bruto) : padrao
  } catch {
    return padrao
  }
}
function gravar(storage, chave, valor) {
  try { storage.setItem(chave, JSON.stringify(valor)) } catch { /* ignora */ }
}
const arredondar = (v) => Math.round(v * 100) / 100
const somar = (lista) => lista.reduce((s, p) => s + p.total, 0)

export const moeda = (v) => 'R$ ' + Number(v || 0).toFixed(2).replace('.', ',')
export function chaveDia(data) {
  const d = new Date(data)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
export const chaveMes = (data) => chaveDia(data).slice(0, 7)

// Dados COMPARTILHADOS entre abas (localStorage). Quando uma aba muda, as outras
// recebem o evento "storage" e atualizam sozinhas, sem F5.
// Trocar por Firestore + onSnapshot quando ligarem o Firebase.
const K = { alunos: 'fz_alunos', pedidos: 'fz_pedidos', produtos: 'fz_produtos', aberta: 'fz_cantina_aberta' }

export function AppProvider({ children }) {
  // ----- compartilhado -----
  const [alunos, setAlunos] = useState(() => ler(localStorage, K.alunos, [ALUNO_DEMO]))
  const [pedidos, setPedidos] = useState(() => ler(localStorage, K.pedidos, gerarPedidosIniciais()))
  const [produtos, setProdutos] = useState(() => ler(localStorage, K.produtos, PRODUTOS_INICIAIS))
  const [cantinaAberta, setCantinaAberta] = useState(() => ler(localStorage, K.aberta, true))

  // ----- sessão por aba (aluno, cantina e responsável podem ficar logados ao mesmo tempo em abas diferentes) -----
  const [alunoRa, setAlunoRa] = useState(() => ler(sessionStorage, 'fz_aluno_ra', null))
  const [cantinaLogada, setCantinaLogada] = useState(() => ler(sessionStorage, 'fz_cantina_logada', false))
  const [responsavelRa, setResponsavelRa] = useState(() => ler(sessionStorage, 'fz_responsavel_ra', null))
  const [carrinho, setCarrinho] = useState(() => ler(sessionStorage, 'fz_carrinho', []))
  const [toast, setToast] = useState(null)

  useEffect(() => gravar(localStorage, K.alunos, alunos), [alunos])
  useEffect(() => gravar(localStorage, K.pedidos, pedidos), [pedidos])
  useEffect(() => gravar(localStorage, K.produtos, produtos), [produtos])
  useEffect(() => gravar(localStorage, K.aberta, cantinaAberta), [cantinaAberta])
  useEffect(() => gravar(sessionStorage, 'fz_aluno_ra', alunoRa), [alunoRa])
  useEffect(() => gravar(sessionStorage, 'fz_cantina_logada', cantinaLogada), [cantinaLogada])
  useEffect(() => gravar(sessionStorage, 'fz_responsavel_ra', responsavelRa), [responsavelRa])
  useEffect(() => gravar(sessionStorage, 'fz_carrinho', carrinho), [carrinho])

  // Sincronização em tempo real entre abas
  useEffect(() => {
    function aoMudar(e) {
      if (e.storageArea !== localStorage || e.newValue == null) return
      try {
        const valor = JSON.parse(e.newValue)
        if (e.key === K.alunos) setAlunos(valor)
        else if (e.key === K.pedidos) setPedidos(valor)
        else if (e.key === K.produtos) setProdutos(valor)
        else if (e.key === K.aberta) setCantinaAberta(valor)
      } catch { /* ignora */ }
    }
    window.addEventListener('storage', aoMudar)
    return () => window.removeEventListener('storage', aoMudar)
  }, [])

  const aluno = alunos.find((a) => a.ra === alunoRa) || null
  const alunoControlado = alunos.find((a) => a.ra === responsavelRa) || null

  // ---------- pop-ups ----------
  const mostrarToast = useCallback((mensagem, opcoes = {}) => {
    setToast({ id: Date.now() + Math.random(), mensagem, ...opcoes })
  }, [])
  const fecharToast = useCallback(() => setToast(null), [])

  // Avisos automáticos quando chegam pedidos novos (cantina) ou muda o status (aluno)
  const statusAnterior = useRef(null)
  useEffect(() => {
    const mapa = Object.fromEntries(pedidos.map((p) => [p.id, p.status]))
    const antes = statusAnterior.current
    statusAnterior.current = mapa
    if (!antes) return
    if (aluno) {
      pedidos
        .filter((p) => p.alunoRa === aluno.ra && antes[p.id] && antes[p.id] !== p.status)
        .forEach((p) => {
          if (p.status === 'preparando') mostrarToast(`Seu pedido ${p.id} começou a ser preparado.`, { titulo: 'Pedido em preparo', tipo: 'info' })
          if (p.status === 'pronto') mostrarToast(`Seu pedido ${p.id} está pronto. Retire no balcão.`, { titulo: 'Pedido pronto', acao: { label: 'Ver pedido', to: `/pedido/${p.id}` } })
        })
    }
    if (cantinaLogada) {
      const novos = pedidos.filter((p) => !(p.id in antes) && p.status === 'aguardando')
      if (novos.length) mostrarToast(`${novos[0].alunoNome} fez o pedido ${novos[0].id}.`, { titulo: 'Novo pedido', tipo: 'info' })
    }
  }, [pedidos]) // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- autenticação do aluno (trocar por Firebase Auth) ----------
  function loginAluno(ra, senha) {
    const achado = alunos.find((a) => a.ra === ra.trim() && a.senha === senha)
    if (!achado) return { ok: false, erro: 'RA ou senha inválidos.' }
    setAlunoRa(achado.ra)
    return { ok: true }
  }
  function cadastrarAluno({ nome, ra, email, turma, emailResponsavel, senha }) {
    const raLimpo = ra.trim()
    if (!nome || !raLimpo || !email || !turma || !emailResponsavel || !senha) return { ok: false, erro: 'Preencha todos os campos.' }
    if (alunos.some((a) => a.ra === raLimpo)) return { ok: false, erro: 'Já existe um cadastro com esse RA.' }
    if (alunos.some((a) => a.email === email)) return { ok: false, erro: 'Já existe um cadastro com esse e-mail.' }
    const novo = {
      ra: raLimpo, nome, email, turma, emailResponsavel, senha, saldo: 0,
      responsavelSenha: null, categoriasBloqueadas: [], itensBloqueados: [],
      limiteDiario: null, limiteMensal: null, recargas: [],
    }
    setAlunos((prev) => [...prev, novo])
    setAlunoRa(novo.ra)
    return { ok: true }
  }
  function logoutAluno() {
    setAlunoRa(null)
    setCarrinho([])
  }

  // ---------- cantina ----------
  function loginCantina(usuario, senha) {
    if (usuario === CANTINA_DEMO.usuario && senha === CANTINA_DEMO.senha) {
      setCantinaLogada(true)
      return true
    }
    return false
  }
  function logoutCantina() {
    setCantinaLogada(false)
  }
  function alternarCantinaAberta() {
    setCantinaAberta((v) => !v)
  }
  function adicionarProduto({ nome, categoria, preco, descricao }) {
    const nomeLimpo = (nome || '').trim()
    if (!nomeLimpo) return { ok: false, erro: 'Informe o nome do produto.' }
    const valor = Number(String(preco).replace(',', '.'))
    if (!(valor > 0)) return { ok: false, erro: 'Informe um preço maior que zero.' }
    if (produtos.some((p) => p.nome.toLowerCase() === nomeLimpo.toLowerCase())) return { ok: false, erro: 'Já existe um produto com esse nome.' }
    const slug = nomeLimpo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')
    const novo = { id: `${slug}-${Date.now().toString(36)}`, nome: nomeLimpo, categoria, preco: arredondar(valor), descricao: (descricao || '').trim() }
    setProdutos((prev) => [...prev, novo])
    return { ok: true }
  }
  function removerProduto(id) {
    setProdutos((prev) => prev.filter((p) => p.id !== id))
    setCarrinho((prev) => prev.filter((i) => i.id !== id))
  }
  function atualizarStatusPedido(id, status) {
    setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
  }

  // ---------- carrinho ----------
  function itemEstaBloqueado(produto, alvo = aluno) {
    if (!alvo) return false
    return (alvo.categoriasBloqueadas || []).includes(produto.categoria) || (alvo.itensBloqueados || []).includes(produto.id)
  }
  function adicionarAoCarrinho(produto) {
    if (!cantinaAberta) {
      mostrarToast('A cantina está fechada no momento.', { titulo: 'Cantina fechada', tipo: 'erro' })
      return
    }
    if (itemEstaBloqueado(produto)) {
      mostrarToast(`${produto.nome} foi bloqueado pelo seu responsável.`, { titulo: 'Item indisponível', tipo: 'erro' })
      return
    }
    setCarrinho((prev) => {
      const existe = prev.find((i) => i.id === produto.id)
      if (existe) return prev.map((i) => (i.id === produto.id ? { ...i, qtd: i.qtd + 1 } : i))
      return [...prev, { ...produto, qtd: 1 }]
    })
    mostrarToast(`${produto.nome} foi para o carrinho.`, { titulo: 'Adicionado ao carrinho', acao: { label: 'Ver carrinho', to: '/carrinho' } })
  }
  function alterarQtd(id, delta) {
    setCarrinho((prev) => prev.map((i) => (i.id === id ? { ...i, qtd: i.qtd + delta } : i)).filter((i) => i.qtd > 0))
  }
  function limparCarrinho() {
    setCarrinho([])
  }

  // ---------- gastos / limites / pedidos ----------
  function gastos(ra) {
    const hoje = chaveDia(new Date())
    const mes = chaveMes(new Date())
    const validos = pedidos.filter((p) => p.alunoRa === ra && p.status !== 'cancelado')
    return {
      hoje: somar(validos.filter((p) => chaveDia(p.criadoEm) === hoje)),
      mes: somar(validos.filter((p) => chaveMes(p.criadoEm) === mes)),
    }
  }

  function criarPedido(formaPagamento) {
    if (!aluno) return { ok: false, erro: 'Faça login para fazer pedidos.' }
    if (!cantinaAberta) return { ok: false, erro: 'A cantina está fechada no momento.' }
    if (carrinho.length === 0) return { ok: false, erro: 'Seu carrinho está vazio.' }

    const sumiram = carrinho.filter((i) => !produtos.some((p) => p.id === i.id))
    if (sumiram.length) return { ok: false, erro: `Item indisponível na cantina: ${sumiram.map((i) => i.nome).join(', ')}. Remova do carrinho.` }
    const bloqueados = carrinho.filter((i) => itemEstaBloqueado(i))
    if (bloqueados.length) return { ok: false, erro: `Bloqueado pelo responsável: ${bloqueados.map((i) => i.nome).join(', ')}.` }

    const total = arredondar(carrinho.reduce((s, i) => s + i.preco * i.qtd, 0))
    const { hoje, mes } = gastos(aluno.ra)
    if (aluno.limiteDiario != null && hoje + total > aluno.limiteDiario + 0.001) {
      return { ok: false, erro: `Este pedido passa do limite diário de ${moeda(aluno.limiteDiario)}. Você já gastou ${moeda(hoje)} hoje.` }
    }
    if (aluno.limiteMensal != null && mes + total > aluno.limiteMensal + 0.001) {
      return { ok: false, erro: `Este pedido passa do limite mensal de ${moeda(aluno.limiteMensal)}. Você já gastou ${moeda(mes)} neste mês.` }
    }
    if (formaPagamento === 'saldo' && aluno.saldo < total) {
      return { ok: false, erro: `Saldo insuficiente. Disponível: ${moeda(aluno.saldo)}. Peça ao responsável para adicionar saldo ou escolha outra forma.` }
    }

    let id
    do { id = 'FZ-' + Math.floor(1000 + Math.random() * 8000) } while (pedidos.some((p) => p.id === id))
    const pedido = {
      id, alunoRa: aluno.ra, alunoNome: aluno.nome, itens: carrinho, total,
      formaPagamento, status: 'aguardando', criadoEm: new Date().toISOString(),
    }
    setPedidos((prev) => [pedido, ...prev])
    if (formaPagamento === 'saldo') {
      setAlunos((prev) => prev.map((a) => (a.ra === aluno.ra ? { ...a, saldo: arredondar(a.saldo - total) } : a)))
    }
    setCarrinho([])
    mostrarToast(`Pedido ${id} enviado para a cantina. Acompanhe o andamento.`, { titulo: 'Pedido realizado' })
    return { ok: true, pedido }
  }

  // ---------- portal do responsável ----------
  const achaPorEmailResp = (email) => alunos.find((a) => a.emailResponsavel?.toLowerCase() === email.trim().toLowerCase())

  function loginResponsavel(email, senha) {
    const vinculado = achaPorEmailResp(email)
    if (!vinculado) return { ok: false, erro: 'Nenhum aluno está vinculado a esse e-mail.' }
    if (!vinculado.responsavelSenha) return { ok: false, primeiroAcesso: true, email: email.trim().toLowerCase() }
    if (vinculado.responsavelSenha !== senha) return { ok: false, erro: 'Senha incorreta.' }
    setResponsavelRa(vinculado.ra)
    return { ok: true }
  }
  function criarSenhaResponsavel(email, novaSenha) {
    const vinculado = achaPorEmailResp(email)
    if (!vinculado) return { ok: false, erro: 'Aluno não encontrado para esse e-mail.' }
    setAlunos((prev) => prev.map((a) => (a.ra === vinculado.ra ? { ...a, responsavelSenha: novaSenha } : a)))
    setResponsavelRa(vinculado.ra)
    return { ok: true }
  }
  function logoutResponsavel() {
    setResponsavelRa(null)
  }
  function atualizarRestricoes(ra, { categoriasBloqueadas, itensBloqueados }) {
    setAlunos((prev) => prev.map((a) => (a.ra === ra ? { ...a, categoriasBloqueadas, itensBloqueados } : a)))
  }
  // limite = número > 0 ou null (sem limite)
  function atualizarLimites(ra, { limiteDiario, limiteMensal }) {
    if (limiteDiario != null && limiteMensal != null && limiteMensal < limiteDiario) {
      return { ok: false, erro: 'O limite mensal não pode ser menor que o diário.' }
    }
    setAlunos((prev) => prev.map((a) => (a.ra === ra ? { ...a, limiteDiario, limiteMensal } : a)))
    return { ok: true }
  }
  function adicionarSaldo(ra, valor) {
    const v = arredondar(Number(valor))
    if (!(v > 0)) return { ok: false, erro: 'Informe um valor maior que zero.' }
    if (v > 1000) return { ok: false, erro: 'O valor máximo por recarga é R$ 1.000,00.' }
    setAlunos((prev) => prev.map((a) => (
      a.ra === ra
        ? { ...a, saldo: arredondar((a.saldo || 0) + v), recargas: [{ valor: v, em: new Date().toISOString() }, ...(a.recargas || [])] }
        : a
    )))
    return { ok: true }
  }

  const value = {
    // dados
    aluno, alunos, pedidos, produtos, carrinho, cantinaAberta, cantinaLogada, responsavelRa, alunoControlado, toast,
    // aluno
    loginAluno, cadastrarAluno, logoutAluno,
    adicionarAoCarrinho, alterarQtd, limparCarrinho, itemEstaBloqueado, criarPedido, gastos,
    // cantina
    loginCantina, logoutCantina, alternarCantinaAberta, adicionarProduto, removerProduto, atualizarStatusPedido,
    // responsável
    loginResponsavel, criarSenhaResponsavel, logoutResponsavel, atualizarRestricoes, atualizarLimites, adicionarSaldo,
    // pop-up
    mostrarToast, fecharToast,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp precisa estar dentro de <AppProvider>')
  return ctx
}
