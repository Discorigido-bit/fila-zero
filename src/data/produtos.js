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

// Contadores de exemplo usados só quando a cantina clica em "Carregar cardápio inicial",
// para o ranking "Mais pedidos" não começar vazio. Podem ser zerados no Firestore.
export const VENDIDOS_EXEMPLO = {
  'bebida-refri': 6, 'lanche-xburgao': 3, 'lanche-hotdog': 3, 'refeicao-prato': 2, 'combo-estudante': 2, 'bebida-suco': 1,
}
