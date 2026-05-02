// ── VENTAS (CARRITO) ────────────────────────────────────
let carrito = [];
let productosDisponibles = [];
let clientesDisponibles = [];

async function renderVentas() {
  if (!isLoggedIn()) {
    appEl.innerHTML = '<div class="hero"><h2>Requiere Autenticación</h2><p>Inicia sesión como empleado para registrar ventas.</p></div>';
    return;
  }

  appEl.innerHTML = `
    <div class="fade-in">
      <div class="page-header">
        <h1>🛒 Punto de Venta</h1>
      </div>
      
      <div class="grid-2">
        <!-- Columna Izquierda: Selección -->
        <div>
          <div class="card" style="margin-bottom: 1rem">
            <h3>Datos de la Factura</h3>
            <div class="form-row" style="margin-top: 1rem">
              <div class="form-group">
                <label>Cliente *</label>
                <select id="venta-cliente"><option value="">Cargando...</option></select>
              </div>
              <div class="form-group">
                <label>Método de Pago *</label>
                <select id="venta-pago">
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta_credito">Tarjeta de Crédito</option>
                  <option value="tarjeta_debito">Tarjeta de Débito</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Fin de Garantía (Opcional)</label>
              <input type="date" id="venta-garantia">
            </div>
          </div>

          <div class="card">
            <h3>Agregar Producto</h3>
            <div class="form-group" style="margin-top: 1rem">
              <select id="venta-producto"><option value="">Cargando...</option></select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Cantidad</label>
                <input type="number" id="venta-cantidad" value="1" min="1">
              </div>
              <div class="form-group" style="display: flex; align-items: flex-end">
                <button class="btn btn-outline" style="width: 100%; justify-content: center" onclick="agregarAlCarrito()">Agregar al Carrito</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Carrito -->
        <div class="card">
          <h3>Carrito de Compras</h3>
          <div id="carrito-items" class="cart-items">
            <p style="color:var(--text-muted); text-align:center">El carrito está vacío</p>
          </div>
          <div class="cart-total" id="carrito-total">Total: Q0.00</div>
          <button class="btn btn-success" style="width: 100%; justify-content: center; margin-top: 1rem; padding: 1rem" onclick="procesarVenta()">Procesar Venta</button>
        </div>
      </div>
    </div>
  `;

  carrito = [];
  try {
    const [prods, clis] = await Promise.all([api.getProductos(), api.getClientes()]);
    productosDisponibles = prods;
    clientesDisponibles = clis;

    document.getElementById('venta-producto').innerHTML =
      `<option value="">Seleccione un producto...</option>` +
      prods.map(p => `<option value="${p.id_producto}">[${p.stock_general} unid.] ${p.nombre} — ${formatQ(p.precio_actual)}</option>`).join('');

    document.getElementById('venta-cliente').innerHTML =
      `<option value="">Seleccione un cliente...</option>` +
      clis.map(c => `<option value="${c.dpi}">${c.nombre} (DPI: ${c.dpi})</option>`).join('');

  } catch (err) {
    showToast('Error cargando datos: ' + err.message, 'error');
  }
}

function agregarAlCarrito() {
  const prodId = parseInt(document.getElementById('venta-producto').value);
  const cant = parseInt(document.getElementById('venta-cantidad').value);

  if (!prodId || isNaN(cant) || cant < 1) {
    return showToast('Seleccione un producto y cantidad válida', 'warning');
  }

  const producto = productosDisponibles.find(p => p.id_producto === prodId);

  if (producto.stock_general < cant) {
    return showToast(`Stock insuficiente. Disponible: ${producto.stock_general}`, 'error');
  }

  // Revisar si ya está en carrito
  const existente = carrito.find(item => item.id_producto === prodId);
  if (existente) {
    if (existente.cantidad + cant > producto.stock_general) {
      return showToast(`No puedes agregar más. Stock límite: ${producto.stock_general}`, 'error');
    }
    existente.cantidad += cant;
    existente.subtotal = existente.cantidad * producto.precio_actual;
  } else {
    carrito.push({
      id_producto: prodId,
      nombre: producto.nombre,
      precio: parseFloat(producto.precio_actual),
      cantidad: cant,
      subtotal: cant * parseFloat(producto.precio_actual)
    });
  }

  actualizarVistaCarrito();
}

function eliminarDelCarrito(id) {
  carrito = carrito.filter(item => item.id_producto !== id);
  actualizarVistaCarrito();
}

function actualizarVistaCarrito() {
  const container = document.getElementById('carrito-items');
  const totalEl = document.getElementById('carrito-total');

  if (carrito.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted); text-align:center">El carrito está vacío</p>';
    totalEl.textContent = 'Total: Q0.00';
    return;
  }

  let html = '';
  let total = 0;

  carrito.forEach(item => {
    html += `
      <div class="cart-item">
        <div>
          <div style="font-weight: 600">${item.nombre}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted)">${item.cantidad} x ${formatQ(item.precio)}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 1rem">
          <div style="font-weight: 600">${formatQ(item.subtotal)}</div>
          <button class="btn btn-sm btn-danger" style="padding: 0.2rem 0.5rem" onclick="eliminarDelCarrito(${item.id_producto})">×</button>
        </div>
      </div>
    `;
    total += item.subtotal;
  });

  container.innerHTML = html;
  totalEl.textContent = `Total: ${formatQ(total)}`;
}

async function procesarVenta() {
  if (carrito.length === 0) return showToast('El carrito está vacío', 'warning');

  const dpi_cliente = document.getElementById('venta-cliente').value;
  const metodo_pago = document.getElementById('venta-pago').value;
  const fecha_fin_garantia = document.getElementById('venta-garantia').value;

  if (!dpi_cliente) return showToast('Seleccione un cliente', 'error');

  // El backend exige dpi_empleado. Como es prueba técnica, usaremos el usuario logueado o uno fijo si no tiene.
  const usr = getUsuario();
  const dpi_empleado = usr ? usr.dpi : '1001200010028'; // Fallback a empleado de seed si por alguna razón falla

  const items = carrito.map(item => ({
    id_producto: item.id_producto,
    cantidad: item.cantidad
  }));

  try {
    const data = await api.createFactura({
      dpi_cliente,
      dpi_empleado,
      metodo_pago,
      fecha_fin_garantia: fecha_fin_garantia || null,
      items
    });

    showToast('Venta registrada exitosamente (Factura #' + data.id_factura + ')', 'success');
    renderVentas(); // Reiniciar vista
  } catch (err) {
    showToast(err.message, 'error');
  }
}
