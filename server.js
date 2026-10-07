require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com o banco Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Rota 1: Teste
app.get('/teste-banco', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT NOW()');
    res.send('✅ Conectado ao Neon! Hora: ' + resultado.rows[0].now);
  } catch (erro) {
    res.status(500).send('❌ Erro: ' + erro.message);
  }
});

// Rota 2: Enviar o cardápio para o React
app.get('/produtos', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM produtos WHERE estabelecimento_id = 1 AND ativo = true');
    res.json(resultado.rows);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao buscar o cardápio" });
  }
});

// Rota 3: Receber e salvar o pedido
app.post('/pedidos', async (req, res) => {
  const { carrinho } = req.body; 
  
  const cliente = await pool.connect();

  try {
    await cliente.query('BEGIN'); // Inicia a transação "Tudo ou Nada"

    let totalCalculadoBackend = 0;

    // 1. Confere os preços reais no banco de dados
    for (let item of carrinho) {
      const resultadoProduto = await cliente.query(
        'SELECT preco FROM produtos WHERE id = $1', [item.id]
      );
      
      if (resultadoProduto.rows.length === 0) {
        throw new Error(`Produto ID ${item.id} não existe mais.`);
      }
      
      const precoReal = resultadoProduto.rows[0].preco;
      totalCalculadoBackend += (Number(precoReal) * item.quantidade);
      
      item.precoSeguro = precoReal; 
    }

    // 2. Salva o pedido principal
    const resultadoPedido = await cliente.query(
      "INSERT INTO pedidos (estabelecimento_id, valor_total, status) VALUES (1, $1, 'Finalizado') RETURNING id",
      [totalCalculadoBackend]
    );
    const pedidoId = resultadoPedido.rows[0].id;

    // 3. Salva os itens do pedido
    for (let item of carrinho) {
      await cliente.query(
        "INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES ($1, $2, $3, $4)",
        [pedidoId, item.id, item.quantidade, item.precoSeguro]
      );
    }

    await cliente.query('COMMIT'); // Confirma a gravação
    res.json({ mensagem: "Pedido salvo com segurança!", numero_pedido: pedidoId });

  } catch (erro) {
    await cliente.query('ROLLBACK'); // Desfaz se der erro
    console.error("Transação falhou:", erro);
    res.status(500).json({ erro: "Erro crítico. Pedido não salvo." });
  } finally {
    cliente.release(); // Devolve a conexão
  }
});
// ROTA DE DADOS: Extração de KPIs do dia atual
app.get('/kpis/hoje', async (req, res) => {
  try {
    // A função COALESCE garante que, se não houver vendas, retorne 0 em vez de "nulo"
    const query = `
      SELECT 
        COUNT(id) AS total_pedidos,
        COALESCE(SUM(valor_total), 0) AS faturamento,
        COALESCE(AVG(valor_total), 0) AS ticket_medio
      FROM pedidos 
      WHERE estabelecimento_id = 1 
      AND DATE(criado_em) = CURRENT_DATE;
    `;
    
    const resultado = await pool.query(query);
    
    // Devolve a primeira linha com os cálculos prontos
    res.json(resultado.rows[0]); 
  } catch (erro) {
    console.error("Erro ao calcular KPIs:", erro);
    res.status(500).json({ erro: "Erro ao gerar métricas" });
  }
});
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});