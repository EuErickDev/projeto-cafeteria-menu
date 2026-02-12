// Funções do carrinho compartilhadas
function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function addToCart(id, name, img, price) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) item.qty += 1;
  else cart.push({ id, name, img, price: Number(price) || 0, qty: 1 });
  saveCart(cart);
  showToast(name + ' adicionado ao carrinho! ✓');
}

function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((s, i) => s + (i.qty || 0), 0);
  const el = document.getElementById('cartCount');
  if (el) {
    el.textContent = total;
    if (total > 0) el.style.opacity = '1';
  }
}

// Notificação simples
function showToast(msg) {
  const existing = document.getElementById('toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.textContent = msg;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #28a745;
    color: #fff;
    padding: 12px 20px;
    border-radius: 6px;
    z-index: 9999;
    animation: slideIn 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

// funções usadas em carrinho.html
function exibirCarrinho() {
  const itensCarrinho = document.getElementById('itensCarrinho');
  if (!itensCarrinho) return;
  
  const cart = getCart();
  itensCarrinho.innerHTML = '';
  let total = 0;

  if (!cart.length) {
    itensCarrinho.innerHTML = '<li class="empty">Nenhum item no carrinho.</li>';
    const totalEl = document.getElementById('totalCompra');
    if (totalEl) totalEl.textContent = (0).toFixed(2);
    return;
  }

  cart.forEach(item => {
    const li = document.createElement('li');
    li.className = 'cart-item';

    const img = document.createElement('img');
    img.src = item.img || '';
    img.alt = item.name;
    img.className = 'cart-img';

    const info = document.createElement('div');
    info.className = 'cart-info';
    const subtotal = (item.price || 0) * (item.qty || 0);
    info.innerHTML = `
      <div class="cart-name">${item.name}</div>
      <div class="cart-price">R$ ${Number(item.price).toFixed(2)} × ${item.qty} = R$ ${subtotal.toFixed(2)}</div>
    `;

    const controls = document.createElement('div');
    controls.className = 'controls';
    controls.innerHTML = `
      <button class="btn" onclick="changeQty('${item.id}', -1)">−</button>
      <span id="qty-${item.id}">${item.qty}</span>
      <button class="btn" onclick="changeQty('${item.id}', 1)">+</button>
      <button class="btn btn-danger" onclick="removeItem('${item.id}')">Remover</button>
    `;

    li.appendChild(img);
    li.appendChild(info);
    li.appendChild(controls);
    itensCarrinho.appendChild(li);

    total += subtotal;
  });

  const totalEl = document.getElementById('totalCompra');
  if (totalEl) totalEl.textContent = total.toFixed(2);
}

function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart.splice(cart.findIndex(i => i.id === id), 1);
  saveCart(cart);
  exibirCarrinho();
}

function removeItem(id) {
  if (!confirm('Remover este item do carrinho?')) return;
  let cart = getCart();
  cart = cart.filter(i => i.id !== id);
  saveCart(cart);
  exibirCarrinho();
  showToast('Item removido. ✓');
}

function lixeira() {
  if (!confirm('Deseja esvaziar o carrinho completamente?')) return;
  localStorage.removeItem('cart');
  exibirCarrinho();
  updateCartCount();
  showToast('Carrinho esvaziado.');
}

function checkout() {
  const cart = getCart();
  if (!cart.length) {
    showToast('Carrinho vazio.');
    return;
  }

  if (!confirm('Deseja continuar com essa compra?')) {
    showToast('Compra cancelada.');
    return;
  }

  const nome = prompt('Digite seu nome (simulação):');
  if (!nome || nome.trim() === '') {
    showToast('Nome é obrigatório.');
    return;
  }

  const btn = event ? event.target : null;
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Processando...';
  }

  showToast('Processando pagamento...');

  setTimeout(() => {
    const orderId = 'PED' + Date.now();
    localStorage.removeItem('cart');
    updateCartCount();
    exibirCarrinho();
    
    const history = JSON.parse(localStorage.getItem('orders') || '[]');
    history.push({
      id: orderId,
      name: nome.trim(),
      items: cart,
      date: new Date().toISOString()
    });
    localStorage.setItem('orders', JSON.stringify(history));

    alert(`✓ Compra realizada com sucesso!\n\nPedido: ${orderId}\nCliente: ${nome}\nTotal: R$ ${cart.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2)}`);
    
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Finalizar compra';
    }
  }, 1200);
}

// Animação toast
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);

// inicialização
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
});
