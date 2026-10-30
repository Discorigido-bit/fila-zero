# Configurar o Firebase (uma vez só)

1. **Projeto:** console.firebase.google.com > Adicionar projeto.
2. **App Web:** Visão geral > ícone `</>` > registrar. Copie o `firebaseConfig`.
3. **Authentication:** Começar > Sign-in method > ativar **E-mail/senha**.
4. **Firestore:** Criar banco de dados > região `southamerica-east1` > modo de produção.
5. **Regras:** Firestore > aba **Regras** > cole o conteúdo de `firestore.rules` > **Publicar**.
6. **Variáveis:** copie `.env.example` para `.env` e preencha as 4 chaves. Reinicie o `npm run dev`.
   Na Vercel: Settings > Environment Variables (as mesmas 4) e faça um novo deploy.
7. **Usuário da cantina (à mão):**
   - Authentication > Users > Add user: e-mail `cantina@filazero.app` + uma senha (mín. 6 caracteres).
     Na tela de login da cantina, o campo "Usuário" é `cantina` (o sistema acrescenta `@filazero.app`).
   - Copie o **UID** desse usuário.
   - Firestore > Iniciar coleção `funcionarios` > ID do documento = o UID > campo `nome` = `Cantina`.
8. **Cardápio:** entre no painel da cantina > aba Cardápio > **Carregar cardápio inicial**.

Alunos se cadastram sozinhos em `/cadastro`. O responsável entra em `/responsavel` com o e-mail que o aluno
cadastrou, senha em branco no primeiro acesso, e cria a própria senha.
