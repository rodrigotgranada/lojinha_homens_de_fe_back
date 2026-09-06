# 🧪 PROMPT PARA O AGENTE EXECUTAR NO SEU OUTRO COMPUTADOR

Copie e cole a instrução abaixo diretamente no chat do seu agente no outro computador para rodar a bateria completa de testes no navegador:

---

```markdown
Por favor, execute o teste automatizado no navegador (via browser_subagent) cobrindo todo o fluxo da nossa aplicação (Lojinha Homens de Fé).

Antes de testar no navegador, garanta que:
1. O backend está rodando na porta 3001 (`cd backend && npm run start:dev` ou `npm run start:local`).
2. Se o banco estiver vazio, execute `npm run db:seed` na pasta `backend` para popular com os dados realistas de teste.
3. O frontend está rodando na porta 5005 (`cd frontend && npm run dev`).

Em seguida, abra o navegador e siga este roteiro de validação:

1. ACESSO E LOGIN:
- Acesse http://localhost:5005/login
- Digite o CPF do Administrador: 11111111111 (Rodrigo Granada)
- Envie o formulário / clique em Entrar.
- Confirme se fez login com sucesso e se o evento ativo 'Retiro Homens de Fé 2026' aparece no cabeçalho.

2. CONTROLE DE ESTOQUE / PRODUTOS:
- Navegue para a página de Estoque / Produtos (/admin/produtos).
- Verifique se a lista de produtos carrega com dados do evento ativo.
- Abra o modal de "Importar Sobras de Retiros" (se disponível) ou "Novo Produto" e verifique a renderização correta dos campos. Feche o modal.

3. OPERAÇÃO DE PDV (VENDAS E BAIXA DE ESTOQUE):
- Navegue para o PDV (/admin/pdv).
- Adicione 1 ou 2 produtos ao carrinho.
- No campo de CPF do cliente, digite o CPF: 44444444444 (Felipe Santos).
- Finalize a venda marcando como paga ou pendente.
- Confirme a mensagem de sucesso de venda e se o carrinho foi limpo.

4. GESTÃO DE DESPESAS E REEMBOLSOS:
- Navegue para Despesas (/admin/despesas).
- Verifique os grupos cadastrados (ex: Rancho, Obras, etc.) e os itens de despesa com status (QUITADO, PARCIAL, PENDENTE).
- Abra o modal de "Dar Baixa" em algum item com saldo pendente para checar os campos de valor e método de pagamento. Feche o modal.

5. ENTRADA E SAÍDA DE VERBA & RELATÓRIOS:
- Na tela de despesas, abra a aba "Receitas do Retiro" e confira se aparecem as receitas (Inscrições, Rifa, Doação).
- Abra a aba "Relatório Geral" / Prestação de Contas e confira se os totais de receitas, despesas e saldo final estão sendo calculados e exibidos.

Ao final, gere um resumo completo com:
- O status de cada feature testada (Funcionando / Com Alerta / Com Falha);
- Se houve algum erro no console ou falha de layout/responsividade;
- Próximos passos recomendados.
```

---

## 📋 Passos Rápidos de Setup no Novo Computador:
1. `git pull origin feature/custo-lucro-prestacao-contas`
2. No backend:
   - Garanta o arquivo `.env` (use `.env.example` como base).
   - Se for usar banco local: `USE_LOCAL_DB=true`. Se for usar MongoDB Atlas: `USE_LOCAL_DB=false`.
   - Execute: `npm install` e `npm run db:seed`.
   - Inicie: `npm run start:dev`.
3. No frontend:
   - Garanta o arquivo `.env` com `PORT=5005` e `NEXT_PUBLIC_API_URL=http://localhost:3001`.
   - Execute: `npm install`.
   - Inicie: `npm run dev`.
