import { useState, useEffect } from 'react';

function App() {
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]); // memória para o carrinho
  const [estaSalvando, setEstaSalvando] = useState(false);
  const [abaAtual, setAbaAtual] = useState('pdv'); // Controla qual tela mostrar
  const [kpis, setKpis] = useState({ total_pedidos: 0, faturamento: 0, ticket_medio: 0 });

  // Busca o cardápio no backend ao abrir a tela
  useEffect(() => {
    fetch('http://localhost:3000/produtos')
      .then(resposta => resposta.json())
      .then(dados => setProdutos(dados))
      .catch(erro => console.error("Erro ao buscar produtos:", erro));
  }, []);
  const carregarKpis = async () => {
  try {
    const resposta = await fetch('http://localhost:3000/kpis/hoje');
    const dados = await resposta.json();
    setKpis(dados);
  } catch (erro) {
    console.error("Erro ao buscar KPIs:", erro);
  }
};

useEffect(() => {
  if (abaAtual === 'dashboard') {
    carregarKpis();
  }
}, [abaAtual]);

  // Função acionada quando o caixa clica em um botão de hambúrguer
    const adicionarAoCarrinho = (produto) => {
    const itemExistente = carrinho.find(item => item.id === produto.id);

    if (itemExistente) {
      setCarrinho(carrinho.map(item => 
        item.id === produto.id 
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      ));
    } else {
      setCarrinho([...carrinho, { ...produto, quantidade: 1 }]);
    }
  };

  // Função que soma o total do pedido
  const calcularTotal = () => {
    return carrinho.reduce((total, item) => total + (Number(item.preco) * item.quantidade), 0);
  };
  // Função que envia o carrinho para o Node.js
const finalizarVenda = async () => {
  if (carrinho.length === 0) {
    alert("O carrinho está vazio!");
    return;
  }
  setEstaSalvando(true);

  try {
    const resposta = await fetch('http://localhost:3000/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ carrinho: carrinho })
    });

    if (resposta.ok) {
      alert("✅ Pedido finalizado e salvo com sucesso!");
      setCarrinho([]);
    } else {
      alert("❌ Erro ao salvar pedido no servidor.");
    }
  } catch (erro) {
    console.error(erro);
    alert("Erro de comunicação com o servidor.");
  } finally {
    setEstaSalvando(false);
  };

  const totalPedido = calcularTotal();

  try {
    const resposta = await fetch('http://localhost:3000/pedidos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ carrinho: carrinho })
    });

    if (resposta.ok) {
      alert("✅ Pedido finalizado e salvo com sucesso!");
      setCarrinho([]);
    } else {
      alert("❌ Erro ao salvar pedido no servidor.");
    }
  } catch (erro) {
    console.error(erro);
    alert("Erro de comunicação com o servidor.");
  }
};

  // FRONTEND
  
return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* BARRA DE NAVEGAÇÃO SUPERIOR */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>
        <button 
          onClick={() => setAbaAtual('pdv')}
          style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: abaAtual === 'pdv' ? '#007bff' : '#e9ecef', color: abaAtual === 'pdv' ? 'white' : 'black', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          🍔 PDV Caixa
        </button>
        
        <button 
          onClick={() => setAbaAtual('dashboard')}
          style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: abaAtual === 'dashboard' ? '#6f42c1' : '#e9ecef', color: abaAtual === 'dashboard' ? 'white' : 'black', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          📊 Painel de Dados
        </button>
      </div>

      {/* RENDERIZAÇÃO CONDICIONAL: Se a aba for 'pdv', mostra a tela de caixa */}
      {abaAtual === 'pdv' ? (
        
        /* === INÍCIO DO CÓDIGO DO PDV (COM O BOTÃO TRAVADO) === */
        <div style={{ display: 'flex', gap: '20px' }}>

          {/* COLUNA 1: CARDÁPIO (ESQUERDA) */}
          <div style={{ flex: 1, backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
            <h2>🍔 Cardápio</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {produtos.map(produto => (
                <button 
                  key={produto.id} 
                  onClick={() => adicionarAoCarrinho(produto)}
                  style={{ 
                    padding: '15px', fontSize: '18px', cursor: 'pointer', 
                    borderRadius: '5px', border: '1px solid #ccc', 
                    display: 'flex', justifyContent: 'space-between', backgroundColor: '#fff' 
                  }}
                >
                  <span>{produto.nome}</span>
                  <strong>R$ {Number(produto.preco).toFixed(2)}</strong>
                </button>
              ))}
            </div>
          </div>

          {/* COLUNA 2: CARRINHO (DIREITA) */}
          <div style={{ flex: 1, backgroundColor: '#fff3cd', padding: '20px', borderRadius: '8px', border: '1px solid #ffe69c' }}>
            <h2>🛒 Carrinho de Compras</h2>

            {/* Se o carrinho estiver vazio, mostra uma mensagem. Senão, lista os itens. */}
            {carrinho.length === 0 ? (
              <p>O carrinho está vazio. Clique em um produto ao lado para adicionar.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {carrinho.map(item => (
                  <li key={item.id} style={{ marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{item.nome}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{item.quantidade}x R$ {Number(item.preco).toFixed(2)}</span>
                      <strong>R$ {(Number(item.preco) * item.quantidade).toFixed(2)}</strong>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Total e Botão de Finalizar */}
            <div style={{ borderTop: '2px solid #000', paddingTop: '10px', marginTop: '20px' }}>
              <h3>Total: R$ {calcularTotal().toFixed(2)}</h3>

              <button 
                onClick={finalizarVenda}
                disabled={estaSalvando}
                style={{ 
                  width: '100%', 
                  padding: '15px', 
                  backgroundColor: estaSalvando ? '#6c757d' : '#28a745', 
                  color: 'white', 
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  border: 'none', 
                  borderRadius: '5px', 
                  cursor: estaSalvando ? 'not-allowed' : 'pointer', 
                  marginTop: '10px' 
                }}>
                {estaSalvando ? "Salvando Pedido..." : "Finalizar Pedido"}
              </button>
            </div>
          </div>

        </div>
        /* === FIM DO CÓDIGO DO PDV === */

      ) : (
        
        /* === INÍCIO DO CÓDIGO DO DASHBOARD === */
        <div style={{ backgroundColor: '#f8f9fa', padding: '30px', borderRadius: '8px' }}>
          <h2>📊 Desempenho de Hoje</h2>
          
          <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
            
            <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <h3 style={{ color: '#6c757d', margin: '0 0 10px 0' }}>Faturamento Total</h3>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745', margin: 0 }}>
                R$ {Number(kpis.faturamento).toFixed(2)}
              </p>
            </div>

            <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <h3 style={{ color: '#6c757d', margin: '0 0 10px 0' }}>Pedidos Realizados</h3>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff', margin: 0 }}>
                {kpis.total_pedidos}
              </p>
            </div>

            <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <h3 style={{ color: '#6c757d', margin: '0 0 10px 0' }}>Ticket Médio</h3>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#17a2b8', margin: 0 }}>
                R$ {Number(kpis.ticket_medio).toFixed(2)}
              </p>
            </div>

          </div>
        </div>
        /* === FIM DO CÓDIGO DO DASHBOARD === */
        
      )}
    </div>
  );
}
export default App;