// Dados extraídos do protótipo. Ajustem preços/descrições livremente.
// Isto é só a CARGA INICIAL: a lista real fica no AppContext (estado "produtos"),
// porque a cantina agora pode adicionar/remover itens. Depois vira coleção do Firestore.
export const CATEGORIAS = ['Lanches', 'Refeições', 'Bebidas', 'Sobremesas', 'Combos']

export const PRODUTOS_INICIAIS = [
  { id: 'lanche-xburgao', nome: 'X-Burgão SENAI', categoria: 'Lanches', preco: 16.9, descricao: 'Hambúrguer artesanal, queijo prato, alface, tomate e molho especial.' },
  { id: 'lanche-misto', nome: 'Misto Quente', categoria: 'Lanches', preco: 8.5, descricao: 'Pão de forma, presunto e queijo grelhados na chapa.' },
  { id: 'lanche-hotdog', nome: 'Hot Dog Completo', categoria: 'Lanches', preco: 12.0, descricao: 'Salsicha, purê de batata, vinagrete, queijo ralado e batata palha.' },
  { id: 'lanche-wrap', nome: 'Wrap de Frango', categoria: 'Lanches', preco: 13.5, descricao: 'Tortilha, frango grelhado, alface e molho de iogurte.' },
  { id: 'refeicao-prato', nome: 'Prato do Dia', categoria: 'Refeições', preco: 18.0, descricao: 'Arroz, feijão, proteína do dia e salada.' },
  { id: 'refeicao-macarrao', nome: 'Macarrão à Bolonhesa', categoria: 'Refeições', preco: 16.0, descricao: 'Macarrão com molho bolonhesa e queijo ralado.' },
  { id: 'bebida-suco', nome: 'Suco Natural 500ml', categoria: 'Bebidas', preco: 7.0, descricao: 'Suco natural da fruta do dia.' },
  { id: 'bebida-refri', nome: 'Refrigerante Lata', categoria: 'Bebidas', preco: 5.5, descricao: 'Lata 350ml, sabores variados.' },
  { id: 'bebida-cafe', nome: 'Café Expresso', categoria: 'Bebidas', preco: 4.0, descricao: 'Café expresso tradicional.' },
  { id: 'bebida-agua', nome: 'Água Mineral 500ml', categoria: 'Bebidas', preco: 3.5, descricao: 'Água mineral sem gás.' },
  { id: 'sobremesa-bolo', nome: 'Bolo de Chocolate', categoria: 'Sobremesas', preco: 7.5, descricao: 'Fatia de bolo de chocolate com cobertura.' },
  { id: 'combo-estudante', nome: 'Combo Estudante', categoria: 'Combos', preco: 17.5, descricao: 'Lanche + bebida com desconto especial.' },
]

export const STATUS_LABEL = {
  aguardando: 'Aguardando',
  preparando: 'Preparando',
  pronto: 'Pronto',
  entregue: 'Entregue',
}

export const FORMAS_PAGAMENTO = {
  saldo: 'Saldo FilaZero',
  pix: 'PIX',
  debito: 'Cartão de débito',
  credito: 'Cartão de crédito',
}

// Usuários de demonstração
export const ALUNO_DEMO = {
  ra: '2024001234',
  senha: 'senai123',
  nome: 'Lucas Ferreira',
  email: 'lucas@aluno.com',
  turma: 'Técnico em Informática',
  saldo: 45.5,
  emailResponsavel: 'responsavel@demo.com',
  responsavelSenha: 'resp123', // já configurada, pra testar o login direto
  categoriasBloqueadas: [],
  itensBloqueados: [],
  limiteDiario: null,
  limiteMensal: null,
  recargas: [],
}
export const CANTINA_DEMO = { usuario: 'cantina', senha: 'sesi2026' }

// Pedidos de exemplo (de outros alunos, de 2 dias atrás) só para o ranking
// "Mais pedidos" já ter dados na primeira abertura. Podem ser apagados.
export function gerarPedidosIniciais() {
  const base = Date.now() - 2 * 24 * 3600 * 1000
  const montar = (n, itens, forma) => {
    const lista = itens.map(([id, qtd]) => ({ ...PRODUTOS_INICIAIS.find((p) => p.id === id), qtd }))
    return {
      id: `FZ-${9000 + n}`,
      alunoRa: 'exemplo',
      alunoNome: 'Outro aluno',
      itens: lista,
      total: lista.reduce((s, i) => s + i.preco * i.qtd, 0),
      formaPagamento: forma,
      status: 'entregue',
      criadoEm: new Date(base + n * 60000).toISOString(),
    }
  }
  return [
    montar(1, [['lanche-xburgao', 2], ['bebida-refri', 2]], 'pix'),
    montar(2, [['lanche-hotdog', 3]], 'debito'),
    montar(3, [['refeicao-prato', 2], ['bebida-suco', 1]], 'pix'),
    montar(4, [['lanche-xburgao', 1], ['bebida-refri', 1]], 'saldo'),
    montar(5, [['combo-estudante', 2]], 'pix'),
    montar(6, [['bebida-refri', 3]], 'credito'),
  ]
}
