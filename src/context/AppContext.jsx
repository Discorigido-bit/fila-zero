import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import {
  createUserWithEmailAndPassword, deleteUser, onAuthStateChanged, signInWithEmailAndPassword, signOut,
} from 'firebase/auth'
import {
  collection, deleteDoc, doc, getDoc, getDocs, increment, limit, onSnapshot, orderBy, query,
  runTransaction, setDoc, updateDoc, where, writeBatch,
} from 'firebase/firestore'
import { auth, db, persistenciaPronta } from '../firebase.js'
import { PRODUTOS_INICIAIS, VENDIDOS_EXEMPLO } from '../data/produtos.js'

const AppContext = createContext(null)

// ---------- utilitários ----------
const arredondar = (v) => Math.round(v * 100) / 100
const somar = (lista) => lista.reduce((s, p) => s + p.total, 0)
export const moeda = (v) => 'R$ ' + Number(v || 0).toFixed(2).replace('.', ',')
export function chaveDia(data) {
  const d = new Date(data)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
export const chaveMes = (data) => chaveDia(data).slice(0, 7)

// O Firebase Authentication exige e-mail. Aluno e cantina entram por RA/usuário,
// então montamos um e-mail interno só para o login (não precisa existir de verdade).
const emailDoAluno = (ra) => `${ra}@aluno.filazero.app`
const emailDaCantina = (usuario) => `${usuario}@filazero.app`
const identificadorValido = (txt) => /^[a-z0-9._-]+$/.test(txt)

function mensagemErro(e, contexto = 'login') {
  switch (e?.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-login-credentials':
      return contexto === 'responsavel' ? 'E-mail ou senha incorretos.' : contexto === 'cantina' ? 'Usuário ou senha inválidos.' : 'RA ou senha inválidos.'
    case 'auth/email-already-in-use':
      return contexto === 'cadastro' ? 'Já existe um cadastro com esse RA.' : 'Este e-mail já tem senha. Volte e entre com a sua senha.'
    case 'auth/weak-password': return 'A senha deve ter no mínimo 6 caracteres.'
    case 'auth/invalid-email': return 'E-mail inválido.'
    case 'auth/too-many-requests': return 'Muitas tentativas. Aguarde alguns minutos e tente de novo.'
    case 'auth/network-request-failed': return 'Sem conexão com a internet.'
    case 'permission-denied': return 'Sem permissão. Confira se as regras do Firestore foram publicadas.'
    default: return 'Não foi possível concluir agora. Tente novamente.'
  }
}

const CARACTERES = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
function gerarCodigo() {
  let c = ''
  for (let i = 0; i < 5; i++) c += CARACTERES[Math.floor(Math.random() * CARACTERES.length)]
  return `FZ-${c}`
}

const lerCarrinho = () => {
  try { return JSON.parse(sessionStorage.getItem('fz_carrinho')) || [] } catch { return [] }
}

export function AppProvider({ children }) {
  // ----- sessão -----
  const [carregando, setCarregando] = useState(true) // true até saber quem está logado
  const [usuario, setUsuario] = useState(null) // { uid, email }
  const [papel, setPapel] = useState(null) // 'aluno' | 'cantina' | 'responsavel' | null
  const [aluno, setAluno] = useState(null) // perfil do aluno logado
  const [alunosResp, setAlunosResp] = useState([]) // alunos vinculados ao responsável logado

  // ----- dados em tempo real -----
  const [pedidos, setPedidos] = useState([])
  const [pedidosOk, setPedidosOk] = useState(false)
  const [produtos, setProdutos] = useState([])
  const [cantinaAberta, setCantinaAberta] = useState(true)

  // ----- por aba -----
  const [carrinho, setCarrinho] = useState(lerCarrinho)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    try { sessionStorage.setItem('fz_carrinho', JSON.stringify(carrinho)) } catch { /* ignora */ }
  }, [carrinho])

  const alunoControlado = papel === 'responsavel' ? alunosResp[0] || null : null
  const cantinaLogada = papel === 'cantina'
  const responsavelRa = alunoControlado?.ra || null

  // ---------- pop-ups ----------
  const mostrarToast = useCallback((mensagem, opcoes = {}) => {
    setToast({ id: Date.now() + Math.random(), mensagem, ...opcoes })
  }, [])
  const fecharToast = useCallback(() => setToast(null), [])

  // ---------- descobrir quem está logado ----------
  // Cantina = existe em "funcionarios/{uid}". Aluno = existe em "alunos/{uid}".
  // Responsável = qualquer outro login cujo e-mail está em "emailResponsavel" de algum aluno.
  const seq = useRef(0)
  const resolverPapel = useCallback(async (user) => {
    const meu = ++seq.current
    const aplicar = (fn) => { if (meu === seq.current) fn() }

    if (!user) {
      aplicar(() => { setUsuario(null); setPapel(null); setAluno(null); setAlunosResp([]); setCarregando(false) })
      return null
    }
    aplicar(() => setCarregando(true))
    try {
      const u = { uid: user.uid, email: (user.email || '').toLowerCase() }

      const func = await getDoc(doc(db, 'funcionarios', user.uid))
      if (func.exists()) {
        aplicar(() => { setUsuario(u); setAluno(null); setAlunosResp([]); setPapel('cantina') })
        return 'cantina'
      }
      const al = await getDoc(doc(db, 'alunos', user.uid))
      if (al.exists()) {
        aplicar(() => { setUsuario(u); setAlunosResp([]); setAluno({ uid: al.id, ...al.data() }); setPapel('aluno') })
        return 'aluno'
      }
      const resp = await getDocs(query(collection(db, 'alunos'), where('emailResponsavel', '==', u.email)))
      if (!resp.empty) {
        aplicar(() => { setUsuario(u); setAluno(null); setAlunosResp(resp.docs.map((d) => ({ uid: d.id, ...d.data() }))); setPapel('responsavel') })
        return 'responsavel'
      }
      aplicar(() => { setUsuario(u); setAluno(null); setAlunosResp([]); setPapel(null) })
      return null
    } catch (e) {
      console.error('Erro ao identificar o usuário:', e)
      aplicar(() => setPapel(null))
      return null
    } finally {
      aplicar(() => setCarregando(false))
    }
  }, [])

  useEffect(() => onAuthStateChanged(auth, (user) => { resolverPapel(user) }), [resolverPapel])

  // ---------- listeners em tempo real ----------
  const falhaListener = useCallback((nome) => (erro) => {
    console.error(`Erro ao ler ${nome}:`, erro)
    mostrarToast(`Não foi possível carregar ${nome}. Confira as regras do Firestore.`, { titulo: 'Erro de dados', tipo: 'erro' })
  }, [mostrarToast])

  // cardápio + cantina aberta/fechada (qualquer pessoa logada)
  useEffect(() => {
    if (!usuario || !papel) { setProdutos([]); return undefined }
    const offProdutos = onSnapshot(collection(db, 'produtos'), (snap) => {
      setProdutos(snap.docs.map((d) => ({ ...d.data(), id: d.id })))
    }, falhaListener('o cardápio'))
    const offConfig = onSnapshot(doc(db, 'config', 'cantina'), (snap) => {
      setCantinaAberta(snap.exists() ? snap.data().aberta !== false : true)
    }, falhaListener('o status da cantina'))
    return () => { offProdutos(); offConfig() }
  }, [usuario?.uid, papel, falhaListener]) // eslint-disable-line react-hooks/exhaustive-deps

  // perfil do aluno ao vivo (saldo, restrições e limites mudam quando o responsável edita)
  useEffect(() => {
    if (papel !== 'aluno' || !usuario) return undefined
    return onSnapshot(doc(db, 'alunos', usuario.uid), (snap) => {
      if (snap.exists()) setAluno({ uid: snap.id, ...snap.data() })
    }, falhaListener('o seu perfil'))
  }, [papel, usuario?.uid, falhaListener]) // eslint-disable-line react-hooks/exhaustive-deps

  // aluno(s) do responsável ao vivo
  useEffect(() => {
    if (papel !== 'responsavel' || !usuario) return undefined
    const q = query(collection(db, 'alunos'), where('emailResponsavel', '==', usuario.email))
    return onSnapshot(q, (snap) => {
      setAlunosResp(snap.docs.map((d) => ({ uid: d.id, ...d.data() })))
    }, falhaListener('os dados do aluno'))
  }, [papel, usuario?.uid, usuario?.email, falhaListener]) // eslint-disable-line react-hooks/exhaustive-deps

  // pedidos: cantina vê os mais recentes de todos; aluno e responsável só os do aluno
  useEffect(() => {
    setPedidosOk(false)
    if (!usuario || !papel) { setPedidos([]); return undefined }
    let q = null
    if (papel === 'cantina') q = query(collection(db, 'pedidos'), orderBy('criadoEm', 'desc'), limit(300))
    else if (papel === 'aluno') q = query(collection(db, 'pedidos'), where('alunoUid', '==', usuario.uid))
    else if (papel === 'responsavel' && alunoControlado) q = query(collection(db, 'pedidos'), where('alunoUid', '==', alunoControlado.uid))
    if (!q) { setPedidos([]); return undefined }
    return onSnapshot(q, (snap) => {
      const lista = snap.docs.map((d) => ({ ...d.data(), id: d.id }))
      lista.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))
      setPedidos(lista)
      setPedidosOk(true)
    }, falhaListener('os pedidos'))
  }, [usuario?.uid, papel, alunoControlado?.uid, falhaListener]) // eslint-disable-line react-hooks/exhaustive-deps

  // Avisos: pedido novo (cantina) e mudança de status (aluno)
  const statusAnterior = useRef(null)
  useEffect(() => {
    if (!pedidosOk) { statusAnterior.current = null; return }
    const mapa = Object.fromEntries(pedidos.map((p) => [p.id, p.status]))
    const antes = statusAnterior.current
    statusAnterior.current = mapa
    if (!antes) return
    if (papel === 'aluno') {
      pedidos.filter((p) => antes[p.id] && antes[p.id] !== p.status).forEach((p) => {
        if (p.status === 'preparando') mostrarToast(`Seu pedido ${p.id} começou a ser preparado.`, { titulo: 'Pedido em preparo', tipo: 'info' })
        if (p.status === 'pronto') mostrarToast(`Seu pedido ${p.id} está pronto. Retire no balcão.`, { titulo: 'Pedido pronto', acao: { label: 'Ver pedido', to: `/pedido/${p.id}` } })
      })
    }
    if (papel === 'cantina') {
      const novos = pedidos.filter((p) => !(p.id in antes) && p.status === 'aguardando')
      if (novos.length) mostrarToast(`${novos[0].alunoNome} fez o pedido ${novos[0].id}.`, { titulo: 'Novo pedido', tipo: 'info' })
    }
  }, [pedidos, pedidosOk]) // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- autenticação: aluno ----------
  async function loginAluno(ra, senha) {
    const raLimpo = ra.trim().toLowerCase()
    if (!identificadorValido(raLimpo) || !senha) return { ok: false, erro: 'RA ou senha inválidos.' }
    try {
      await persistenciaPronta
      const cred = await signInWithEmailAndPassword(auth, emailDoAluno(raLimpo), senha)
      const p = await resolverPapel(cred.user)
      if (p !== 'aluno') { await signOut(auth); return { ok: false, erro: 'RA ou senha inválidos.' } }
      return { ok: true }
    } catch (e) {
      return { ok: false, erro: mensagemErro(e, 'aluno') }
    }
  }

  async function cadastrarAluno({ nome, ra, email, turma, emailResponsavel, senha }) {
    const raLimpo = (ra || '').trim().toLowerCase()
    if (!nome || !raLimpo || !email || !turma || !emailResponsavel || !senha) return { ok: false, erro: 'Preencha todos os campos.' }
    if (!identificadorValido(raLimpo)) return { ok: false, erro: 'O RA deve ter apenas letras e números.' }
    try {
      await persistenciaPronta
      const cred = await createUserWithEmailAndPassword(auth, emailDoAluno(raLimpo), senha)
      const perfil = {
        ra: raLimpo, nome, email: email.trim().toLowerCase(), turma,
        emailResponsavel: emailResponsavel.trim().toLowerCase(),
        saldo: 0, categoriasBloqueadas: [], itensBloqueados: [], limiteDiario: null, limiteMensal: null, recargas: [],
        criadoEm: new Date().toISOString(),
      }
      try {
        await setDoc(doc(db, 'alunos', cred.user.uid), perfil)
      } catch (e) {
        await deleteUser(cred.user).catch(() => {}) // não deixa login "órfão" sem perfil
        throw e
      }
      await resolverPapel(cred.user)
      return { ok: true }
    } catch (e) {
      return { ok: false, erro: mensagemErro(e, 'cadastro') }
    }
  }

  // ---------- autenticação: cantina ----------
  async function loginCantina(usuarioDigitado, senha) {
    const u = (usuarioDigitado || '').trim().toLowerCase()
    if (!identificadorValido(u) || !senha) return { ok: false, erro: 'Usuário ou senha inválidos.' }
    try {
      await persistenciaPronta
      const cred = await signInWithEmailAndPassword(auth, emailDaCantina(u), senha)
      const p = await resolverPapel(cred.user)
      if (p !== 'cantina') { await signOut(auth); return { ok: false, erro: 'Esta conta não tem acesso ao painel da cantina.' } }
      return { ok: true }
    } catch (e) {
      return { ok: false, erro: mensagemErro(e, 'cantina') }
    }
  }

  // ---------- autenticação: responsável ----------
  async function loginResponsavel(email, senha) {
    const emailLimpo = (email || '').trim().toLowerCase()
    if (!senha) return { ok: false, primeiroAcesso: true, email: emailLimpo } // senha em branco = primeiro acesso
    try {
      await persistenciaPronta
      const cred = await signInWithEmailAndPassword(auth, emailLimpo, senha)
      const p = await resolverPapel(cred.user)
      if (p !== 'responsavel') { await signOut(auth); return { ok: false, erro: 'Nenhum aluno está vinculado a esse e-mail.' } }
      return { ok: true }
    } catch (e) {
      return { ok: false, erro: mensagemErro(e, 'responsavel') }
    }
  }

  async function criarSenhaResponsavel(email, novaSenha) {
    const emailLimpo = (email || '').trim().toLowerCase()
    try {
      await persistenciaPronta
      const cred = await createUserWithEmailAndPassword(auth, emailLimpo, novaSenha)
      const p = await resolverPapel(cred.user)
      if (p !== 'responsavel') {
        await deleteUser(cred.user).catch(() => {})
        await signOut(auth).catch(() => {})
        await resolverPapel(null)
        return { ok: false, erro: 'Nenhum aluno está vinculado a esse e-mail. Confira se o aluno cadastrou o e-mail do responsável corretamente.' }
      }
      return { ok: true }
    } catch (e) {
      return { ok: false, erro: mensagemErro(e, 'responsavel-novo') }
    }
  }

  async function sair() {
    setCarrinho([])
    await signOut(auth)
  }
  const logoutAluno = sair
  const logoutCantina = sair
  const logoutResponsavel = sair

  // ---------- cantina ----------
  async function alternarCantinaAberta() {
    try {
      await setDoc(doc(db, 'config', 'cantina'), { aberta: !cantinaAberta }, { merge: true })
    } catch (e) {
      mostrarToast(mensagemErro(e), { titulo: 'Erro', tipo: 'erro' })
    }
  }

  async function adicionarProduto({ nome, categoria, preco, descricao }) {
    const nomeLimpo = (nome || '').trim()
    if (!nomeLimpo) return { ok: false, erro: 'Informe o nome do produto.' }
    const valor = Number(String(preco).replace(',', '.'))
    if (!(valor > 0)) return { ok: false, erro: 'Informe um preço maior que zero.' }
    if (produtos.some((p) => p.nome.toLowerCase() === nomeLimpo.toLowerCase())) return { ok: false, erro: 'Já existe um produto com esse nome.' }
    const slug = nomeLimpo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')
    const id = `${slug}-${Date.now().toString(36)}`
    try {
      await setDoc(doc(db, 'produtos', id), { nome: nomeLimpo, categoria, preco: arredondar(valor), descricao: (descricao || '').trim(), vendidos: 0 })
      return { ok: true }
    } catch (e) {
      return { ok: false, erro: mensagemErro(e) }
    }
  }

  async function removerProduto(id) {
    setCarrinho((prev) => prev.filter((i) => i.id !== id))
    try {
      await deleteDoc(doc(db, 'produtos', id))
    } catch (e) {
      mostrarToast(mensagemErro(e), { titulo: 'Erro ao remover', tipo: 'erro' })
    }
  }

  // Cardápio começa vazio no Firebase: este botão (no painel da cantina) carrega os 12 itens iniciais.
  async function carregarCardapioInicial() {
    try {
      const lote = writeBatch(db)
      PRODUTOS_INICIAIS.forEach(({ id, ...dados }) => {
        lote.set(doc(db, 'produtos', id), { ...dados, vendidos: VENDIDOS_EXEMPLO[id] || 0 })
      })
      await lote.commit()
      return { ok: true }
    } catch (e) {
      return { ok: false, erro: mensagemErro(e) }
    }
  }

  async function atualizarStatusPedido(id, status) {
    try {
      await updateDoc(doc(db, 'pedidos', id), { status })
    } catch (e) {
      mostrarToast(mensagemErro(e), { titulo: 'Erro ao atualizar pedido', tipo: 'erro' })
    }
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
      return [...prev, { id: produto.id, nome: produto.nome, categoria: produto.categoria, preco: produto.preco, descricao: produto.descricao, qtd: 1 }]
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

  async function criarPedido(formaPagamento) {
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

    const itens = carrinho.map((i) => ({ id: i.id, nome: i.nome, categoria: i.categoria, preco: i.preco, qtd: i.qtd }))
    for (let tentativa = 0; tentativa < 4; tentativa++) {
      const id = gerarCodigo()
      const pedido = {
        alunoUid: aluno.uid, alunoRa: aluno.ra, alunoNome: aluno.nome, itens, total,
        formaPagamento, status: 'aguardando', criadoEm: new Date().toISOString(),
      }
      try {
        // Transação: desconta o saldo, conta as vendas e cria o pedido tudo junto, ou nada.
        await runTransaction(db, async (tx) => {
          const alunoRef = doc(db, 'alunos', aluno.uid)
          if (formaPagamento === 'saldo') {
            const snap = await tx.get(alunoRef)
            const saldoAtual = snap.data().saldo
            if (saldoAtual < total - 0.001) throw new Error('SALDO')
            tx.update(alunoRef, { saldo: arredondar(saldoAtual - total) })
          }
          itens.forEach((i) => tx.update(doc(db, 'produtos', i.id), { vendidos: increment(i.qtd) }))
          tx.set(doc(db, 'pedidos', id), pedido)
        })
        setCarrinho([])
        mostrarToast(`Pedido ${id} enviado para a cantina. Acompanhe o andamento.`, { titulo: 'Pedido realizado' })
        return { ok: true, pedido: { ...pedido, id } }
      } catch (e) {
        if (e.message === 'SALDO') return { ok: false, erro: 'Saldo insuficiente para este pedido.' }
        if (e.code === 'not-found') return { ok: false, erro: 'Algum item do carrinho não existe mais no cardápio.' }
        if (e.code === 'permission-denied' && tentativa < 3) continue // código repetido ou cantina acabou de fechar: tenta de novo
        if (e.code === 'permission-denied') return { ok: false, erro: 'Não foi possível enviar o pedido. A cantina pode ter acabado de fechar.' }
        return { ok: false, erro: 'Não foi possível enviar o pedido. Verifique a conexão e tente de novo.' }
      }
    }
    return { ok: false, erro: 'Não foi possível enviar o pedido agora.' }
  }

  // ---------- portal do responsável (age sobre o aluno vinculado ao login) ----------
  async function atualizarRestricoes(ra, { categoriasBloqueadas, itensBloqueados }) {
    if (!alunoControlado || alunoControlado.ra !== ra) return { ok: false, erro: 'Aluno não encontrado.' }
    try {
      await updateDoc(doc(db, 'alunos', alunoControlado.uid), { categoriasBloqueadas, itensBloqueados })
      return { ok: true }
    } catch (e) {
      return { ok: false, erro: mensagemErro(e) }
    }
  }

  async function atualizarLimites(ra, { limiteDiario, limiteMensal }) {
    if (!alunoControlado || alunoControlado.ra !== ra) return { ok: false, erro: 'Aluno não encontrado.' }
    if (limiteDiario != null && limiteMensal != null && limiteMensal < limiteDiario) {
      return { ok: false, erro: 'O limite mensal não pode ser menor que o diário.' }
    }
    try {
      await updateDoc(doc(db, 'alunos', alunoControlado.uid), { limiteDiario, limiteMensal })
      return { ok: true }
    } catch (e) {
      return { ok: false, erro: mensagemErro(e) }
    }
  }

  async function adicionarSaldo(ra, valor) {
    if (!alunoControlado || alunoControlado.ra !== ra) return { ok: false, erro: 'Aluno não encontrado.' }
    const v = arredondar(Number(valor))
    if (!(v > 0)) return { ok: false, erro: 'Informe um valor maior que zero.' }
    if (v > 1000) return { ok: false, erro: 'O valor máximo por recarga é R$ 1.000,00.' }
    try {
      await updateDoc(doc(db, 'alunos', alunoControlado.uid), {
        saldo: increment(v),
        recargas: [{ valor: v, em: new Date().toISOString() }, ...(alunoControlado.recargas || []).slice(0, 19)],
      })
      return { ok: true }
    } catch (e) {
      return { ok: false, erro: mensagemErro(e) }
    }
  }

  const value = {
    // sessão e dados
    carregando, aluno, alunos: alunosResp, pedidos, produtos, carrinho, cantinaAberta, cantinaLogada, responsavelRa, alunoControlado, toast,
    // aluno
    loginAluno, cadastrarAluno, logoutAluno,
    adicionarAoCarrinho, alterarQtd, limparCarrinho, itemEstaBloqueado, criarPedido, gastos,
    // cantina
    loginCantina, logoutCantina, alternarCantinaAberta, adicionarProduto, removerProduto, carregarCardapioInicial, atualizarStatusPedido,
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
