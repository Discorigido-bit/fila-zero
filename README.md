# FilaZero

Sistema de pedidos para a cantina do SESI/SENAI. Este é o esqueleto funcional
do projeto, já com as telas do protótipo (login do aluno, cardápio, carrinho,
pagamento, acompanhamento do pedido, painel da cantina e portal do
responsável), usando **dados mockados em memória/localStorage** no lugar do
Firebase por enquanto — assim vocês já conseguem testar tudo sem depender de
nada externo.

## 1. Rodar localmente

```bash
npm install
npm run dev
```

Abra o link que aparecer no terminal (geralmente `http://localhost:5173`).

- Login do aluno: RA `2024001234`, senha `senai123`
- Login da cantina: usuário `cantina`, senha `sesi2026` (acesse em `/cantina`)

Testem o fluxo completo: login → cardápio → carrinho → pagamento → tela de
acompanhamento. Em outra aba, abram `/cantina` e movam o pedido pelas colunas
do kanban (Aguardando → Preparando → Pronto → Entregue) — a tela do aluno
atualiza porque tudo está no mesmo `localStorage` do navegador.

## 2. Onde está cada coisa

```
src/
  data/produtos.js       → cardápio (edite aqui preços/itens)
  context/AppContext.jsx → "banco de dados" temporário (login, carrinho, pedidos)
  pages/                 → uma tela para cada página do protótipo
  components/            → Header e proteção de rotas
```

## 3. Próximo passo: ligar o Firebase

Isso substitui o `AppContext.jsx` atual por chamadas reais. Ordem sugerida:

1. Criar o projeto em [console.firebase.google.com](https://console.firebase.google.com)
2. Ativar **Authentication** (E-mail/Senha) e **Firestore Database**
3. Criar `src/firebase.js` com as credenciais do projeto (Configurações do projeto → SDK)
4. Criar as coleções no Firestore de acordo com o DER de vocês:
   - `usuarios` (id_user, email, senha/auth, tipo: aluno|responsável)
   - `alunos` (id_aluno, nome, turma, email_responsavel)
   - `produtos` (id_produto, nome, categoria, preço, disponível)
   - `pedidos` (id_pedido, id_aluno, itens, valor, status, criado_em)
   - `pagamentos` (id_pagamento, id_pedido, método, valor)
5. Trocar, uma função por vez, dentro de `AppContext.jsx`:
   - `loginAluno`/`loginCantina` → `signInWithEmailAndPassword`
   - `criarPedido` → `addDoc(collection(db, "pedidos"), ...)`
   - Ler pedidos da cantina em tempo real com `onSnapshot` (assim o painel
     da cantina atualiza sozinho sem precisar dar F5)

## 4. Publicar

1. Suba o projeto para o GitHub (`git init`, `git add .`, `git commit`, criar repo, `git push`)
2. Importe o repositório na [Vercel](https://vercel.com/new) — ela detecta
   Vite automaticamente
3. Cadastre as variáveis de ambiente do Firebase nas configurações do
   projeto na Vercel (as mesmas chaves do `src/firebase.js`)

## 5. Coisas para o grupo decidir/ajustar

- Preços e descrições reais dos produtos em `src/data/produtos.js`
- Se o "saldo FilaZero" (pré-pago) será mesmo implementado ou só PIX/cartão
- Como o Responsável vai receber a senha de acesso ao portal (hoje é mock)
- Fotos reais dos produtos (hoje é só um emoji de placeholder)
