// POS terminal: dual-panel engine, hardware scanner, view modes (CodeIgniter 4 build)
document.addEventListener('DOMContentLoaded', () => {
    const CFG = window.POS || {};
    const TAX_PCT = Number(CFG.taxPercent) || 0;
    const JSON_HDRS = { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' };

    let cart = [];
    let paymentMethod = 'Cash';
    let isCheckingOut = false;

    const $ = (id) => document.getElementById(id);
    const money = (v) => 'Rs. ' + (Number(v) || 0).toFixed(2);
    const round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;

    const barcodeInput = $('barcode-input');
    const searchInput = $('search-input');
    const customerNameInput = $('customer-name-input');
    const cartTbody = $('cart-tbody');
    const emptyCartMsg = $('empty-cart-msg');
    const cartItemBadge = $('cart-item-badge');
    const subtotalEl = $('summary-subtotal');
    const discountInput = $('discount-input');
    const taxEl = $('summary-tax');
    const totalEl = $('summary-total');
    const tenderInput = $('tender-input');
    const changeEl = $('summary-change');
    const tenderContainer = $('tender-container');
    const checkoutBtn = $('checkout-btn');
    const clearCartBtn = $('clear-cart-btn');
    const payMethodBtns = document.querySelectorAll('.pay-method-btn');
    const cards = Array.from(document.querySelectorAll('.product-card'));

    barcodeInput?.focus();

    // ---------------------------------------------------------------
    // 1. Audio feedback (single shared AudioContext)
    // ---------------------------------------------------------------
    let audioCtx = null;
    const TONES = { scan: [880, 'sine', 0.15, 0.08], qty: [520, 'triangle', 0.1, 0.05], clear: [320, 'sine', 0.12, 0.12] };

    function beep(type = 'scan') {
        try {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            audioCtx = audioCtx || new AC();
            if (audioCtx.state === 'suspended') audioCtx.resume();
            const [freq, wave, vol, dur] = TONES[type] || TONES.scan;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const t = audioCtx.currentTime;
            osc.type = wave;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(vol, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(t + dur);
        } catch (e) { /* audio is optional */ }
    }

    // ---------------------------------------------------------------
    // 2. View mode (grid / compact) + saved preference
    // ---------------------------------------------------------------
    const BTN_ON = 'bg-[#2d6a4f] text-white shadow-xs';
    const BTN_OFF = 'text-slate-600 hover:text-[#2d6a4f] hover:bg-[#eaf4ec]';

    window.setPosViewMode = (mode) => {
        const grid = $('product-cards-grid');
        if (!grid) return;
        const compact = mode === 'compact';
        grid.classList.toggle('pos-compact-view', compact);
        [['view-grid-btn', !compact], ['view-compact-btn', compact]].forEach(([id, on]) => {
            const btn = $(id);
            if (btn) btn.className = 'px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ' + (on ? BTN_ON : BTN_OFF);
        });
        try { localStorage.setItem('posViewMode', mode); } catch (e) {}
    };
    let savedMode = 'grid';
    try { savedMode = localStorage.getItem('posViewMode') || 'grid'; } catch (e) {}
    window.setPosViewMode(savedMode);

    // ---------------------------------------------------------------
    // 3. Category + search filtering (one combined filter)
    // ---------------------------------------------------------------
    let activeCat = 0;
    let query = '';

    function applyFilters() {
        const q = query.trim().toLowerCase();
        cards.forEach((card) => {
            const d = card.dataset;
            const catOk = activeCat === 0 || parseInt(d.categoryId || 0, 10) === activeCat;
            const textOk = !q
                || (d.name || '').includes(q)
                || (d.barcode || '').toLowerCase().includes(q)
                || (d.sku || '').includes(q);
            card.style.display = catOk && textOk ? 'flex' : 'none';
        });
    }

    window.filterCategory = (catId, btn) => {
        document.querySelectorAll('.cat-pill').forEach((b) => b.classList.remove('cat-pill-active'));
        btn?.classList.add('cat-pill-active');
        activeCat = Number(catId) || 0;
        applyFilters();
    };

    let debounce;
    searchInput?.addEventListener('input', function () {
        clearTimeout(debounce);
        debounce = setTimeout(() => { query = this.value; applyFilters(); }, 150);
    });
    searchInput?.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        query = searchInput.value;
        applyFilters();
        const visible = cards.filter((c) => c.style.display !== 'none');
        if (visible.length === 1) {            // single match → auto add
            visible[0].click();
            searchInput.value = '';
            query = '';
            applyFilters();
        }
    });

    cards.forEach((card) => card.addEventListener('click', () => {
        try { window.quickAddProduct(JSON.parse(card.dataset.product)); } catch (e) { console.error(e); }
    }));

    // ---------------------------------------------------------------
    // 4. Scanner + hotkeys
    // ---------------------------------------------------------------
    async function lookupAndAdd(code) {
        const raw = code.trim();
        const wanted = raw.toLowerCase();
        const card = cards.find((c) =>
            (c.dataset.barcode || '').toLowerCase() === wanted || (c.dataset.sku || '').toLowerCase() === wanted);

        if (card) {
            window.quickAddProduct(JSON.parse(card.dataset.product));
            return true;
        }
        try {
            const res = await fetch(`${CFG.productsUrl}?barcode=${encodeURIComponent(raw)}`, { headers: JSON_HDRS });
            const result = await res.json().catch(() => null);
            if (result?.status === 'success' && result.data) {
                window.quickAddProduct(result.data);
                return true;
            }
            alert(`Product not found for scanned barcode: ${raw}`);
        } catch (err) {
            console.error('Scan API error:', err);
            alert('Server connection error during barcode scan.');
        }
        return false;
    }

    // Scanner typing INTO the barcode box
    barcodeInput?.addEventListener('keydown', async (e) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        const code = barcodeInput.value.trim();
        if (!code) return;
        barcodeInput.value = '';
        if (!(await lookupAndAdd(code))) {
            barcodeInput.value = code;
            barcodeInput.select();
        }
    });

    // Global: F2 / F3 / Esc + scanner when NO input has focus
    let scanBuf = '';
    let scanStart = 0;
    let lastKey = 0;

    document.addEventListener('keydown', (e) => {
        if (e.key === 'F2') {
            e.preventDefault();
            if (barcodeInput) { barcodeInput.value = ''; barcodeInput.focus(); }
            return;
        }
        if (e.key === 'F3') { e.preventDefault(); window.toggleCalcModal?.(); return; }
        if (e.key === 'Escape') {
            const calc = $('calc-modal');
            if (calc && !calc.classList.contains('hidden')) { calc.classList.add('hidden'); barcodeInput?.focus(); }
            return;
        }

        const tag = document.activeElement?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;   // fields handle their own Enter

        const now = Date.now();
        if (now - lastKey > 100) { scanBuf = ''; scanStart = now; }
        lastKey = now;

        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) { scanBuf += e.key; return; }

        if (e.key === 'Enter') {
            // scanner = fast burst (avg ≤ 50ms / key); humans typing are slower
            const isScan = scanBuf.length >= 3 && (now - scanStart) / scanBuf.length <= 50;
            if (isScan) {
                e.preventDefault();      // stops Enter from "clicking" a focused button
                lookupAndAdd(scanBuf);
            }
            scanBuf = '';
        }
    });

    document.addEventListener('receipt:closed', () => barcodeInput?.focus());

    // ---------------------------------------------------------------
    // 5. Cart
    // ---------------------------------------------------------------
    window.quickAddProduct = (product) => {
        const id = parseInt(product.id, 10);
        const card = cards.find((c) => parseInt(c.dataset.id, 10) === id);
        const stock = card ? parseInt(card.dataset.stock, 10) : (parseInt(product.stock, 10) || 0);

        if (stock <= 0) { alert(`Out of Stock: '${product.name}' has 0 items remaining!`); return; }

        const existing = cart.find((i) => i.id === id);
        if (existing) {
            existing.stock = stock;
            if (existing.qty >= stock) {
                alert(`Stock Limit Reached: Cannot add more than available stock (${stock}) for '${product.name}'`);
                return;
            }
            existing.qty++;
        } else {
            cart.push({ id, barcode: product.barcode || '', name: product.name, price: Number(product.price) || 0, stock, qty: 1 });
        }
        beep('scan');
        renderCart();
    };

    function renderCart() {
        if (!cartTbody) return;
        cartTbody.replaceChildren();

        const qtyTotal = cart.reduce((s, i) => s + i.qty, 0);
        if (cartItemBadge) cartItemBadge.textContent = `${qtyTotal} Items`;
        emptyCartMsg?.classList.toggle('hidden', cart.length > 0);

        cart.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-slate-50 transition border-b border-slate-100';
            tr.innerHTML = `
                <td class="py-2 px-3">
                    <div class="font-bold text-slate-800 text-xs" data-f="name"></div>
                    <div class="text-[10px] text-slate-400 font-mono" data-f="barcode"></div>
                </td>
                <td class="py-2 px-2 text-center">
                    <div class="inline-flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shadow-sm">
                        <button type="button" class="px-2 py-0.5 text-slate-600 hover:bg-slate-100 font-bold text-xs transition" onclick="updateQty(${index}, -1)">-</button>
                        <span class="px-2 py-0.5 font-black text-[#14281e] text-xs font-mono">${item.qty}</span>
                        <button type="button" class="px-2 py-0.5 text-slate-600 hover:bg-slate-100 font-bold text-xs transition" onclick="updateQty(${index}, 1)">+</button>
                    </div>
                </td>
                <td class="py-2 px-3 text-right font-black text-slate-900 font-mono text-xs">${money(item.price * item.qty)}</td>
                <td class="py-2 px-2 text-center">
                    <button type="button" class="w-6 h-6 rounded-full text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition inline-flex items-center justify-center" onclick="removeItem(${index})" title="Remove Item">
                        <i class="fa-solid fa-trash-can text-xs"></i>
                    </button>
                </td>`;
            tr.querySelector('[data-f="name"]').textContent = item.name;        // never innerHTML for names
            tr.querySelector('[data-f="barcode"]').textContent = item.barcode;
            cartTbody.appendChild(tr);
        });
        calculateTotals();
    }

    window.updateQty = (index, change) => {
        const item = cart[index];
        if (!item) return;
        if (change > 0 && item.qty >= item.stock) { alert(`Stock limit reached! Available stock: ${item.stock}`); return; }
        item.qty += change;
        beep('qty');
        if (item.qty <= 0) cart.splice(index, 1);
        renderCart();
    };

    window.removeItem = (index) => { cart.splice(index, 1); beep('qty'); renderCart(); };

    // ---------------------------------------------------------------
    // 6. Totals (server recomputes everything, this is display only)
    // ---------------------------------------------------------------
    function totals() {
        const subtotal = round2(cart.reduce((s, i) => s + i.price * i.qty, 0));
        const discount = round2(Math.min(Math.max(parseFloat(discountInput?.value) || 0, 0), subtotal));
        const tax = round2((subtotal - discount) * TAX_PCT / 100);
        return { subtotal, discount, tax, total: round2(subtotal - discount + tax) };
    }

    function updateChange(total) {
        if (!tenderInput || !changeEl) return;
        const tender = parseFloat(tenderInput.value) || 0;
        changeEl.textContent = money(Math.max(0, tender - total));
        const short = paymentMethod === 'Cash' && total > 0 && tender < total;
        changeEl.className = 'text-sm font-black font-mono ' + (short ? 'text-rose-600' : 'text-[#2d6a4f]');
    }

    function calculateTotals() {
        const t = totals();
        if (subtotalEl) subtotalEl.textContent = money(t.subtotal);
        if (taxEl) taxEl.textContent = money(t.tax);
        if (totalEl) totalEl.textContent = money(t.total);
        updateChange(t.total);
    }

    window.setTenderPreset = (val) => {
        const { total } = totals();
        if (tenderInput) tenderInput.value = (val === 'exact' ? total : Number(val)).toFixed(2);
        updateChange(total);
    };

    discountInput?.addEventListener('input', calculateTotals);
    tenderInput?.addEventListener('input', () => updateChange(totals().total));

    payMethodBtns.forEach((btn) => btn.addEventListener('click', () => {
        payMethodBtns.forEach((b) => {
            const on = b === btn;
            b.className = 'pay-method-btn py-2 border rounded-xl font-bold text-xs transition flex items-center justify-center gap-1 '
                + (on ? 'active bg-[#2d6a4f] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100');
        });
        paymentMethod = btn.dataset.method;

        const cash = paymentMethod === 'Cash';
        tenderContainer?.classList.toggle('opacity-50', !cash);
        tenderContainer?.classList.toggle('pointer-events-none', !cash);
        if (!cash && tenderInput) tenderInput.value = '';
        calculateTotals();
    }));

    function resetOrder(refocus = true) {
        cart = [];
        if (tenderInput) tenderInput.value = '';
        if (discountInput) discountInput.value = '0.00';
        renderCart();
        if (refocus) barcodeInput?.focus();
    }

    clearCartBtn?.addEventListener('click', () => {
        if (!cart.length || !confirm('Clear current active order?')) return;
        beep('clear');
        resetOrder();
    });

    // ---------------------------------------------------------------
    // 7. Complete sale
    // ---------------------------------------------------------------
    checkoutBtn?.addEventListener('click', async () => {
        if (isCheckingOut) return;
        if (!cart.length) { alert('Cart is empty! Add items before completing sale.'); barcodeInput?.focus(); return; }

        const t = totals();
        const tender = parseFloat(tenderInput?.value) || 0;
        if (paymentMethod === 'Cash' && tender < t.total) {
            alert(`Insufficient Cash Tendered!\nTendered: ${money(tender)}\nNet Total: ${money(t.total)}`);
            tenderInput?.focus();
            return;
        }

        isCheckingOut = true;
        checkoutBtn.disabled = true;
        checkoutBtn.innerHTML = '<i></i> Processing...';

        const payload = {
            customer_name: customerNameInput?.value.trim() || 'Walk-in Customer',
            discount: t.discount,
            payment_method: paymentMethod,
            tender_amount: paymentMethod === 'Cash' ? tender : t.total,
            items: cart.map((i) => ({ id: i.id, qty: i.qty })),     // prices/tax are recomputed server-side
        };

        try {
            const res = await fetch(CFG.saveBillUrl, {
                method: 'POST',
                headers: { ...JSON_HDRS, 'Content-Type': 'application/json', [CFG.csrfHeader]: CFG.csrfToken },
                body: JSON.stringify(payload),
            });

            if (res.status === 401) { alert('Session expired. Please log in again.'); location.href = CFG.baseUrl; return; }

            const data = await res.json().catch(() => null);
            if (!data) { alert(`Server error (${res.status}). Please reload the page and try again.`); return; }

            if (!data.success) {
                alert('Error Completing Sale: ' + (data.error || data.message || 'Unknown transaction error.'));
                return;
            }

            // update stock badges on the grid without reloading
            (data.items || []).forEach((item) => {
                const card = cards.find((c) => parseInt(c.dataset.id, 10) === item.id);
                if (!card) return;
                card.dataset.stock = item.remaining_stock;
                const badge = card.querySelector('.absolute span');
                if (badge) {
                    badge.textContent = `${item.remaining_stock} pcs`;
                    if (item.remaining_stock <= (parseInt(card.dataset.alert, 10) || 5)) {
                        badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-extrabold font-mono bg-rose-100 text-rose-700 border border-rose-200';
                    }
                }
            });

            Receipt.render(data);
            Receipt.open();
            resetOrder(false);
        } catch (err) {
            console.error('Checkout API error:', err);
            alert('Connection error occurred while saving the bill.');
        } finally {
            isCheckingOut = false;
            checkoutBtn.disabled = false;
            checkoutBtn.innerHTML = '<i></i> Complete Sale';
        }
    });

    calculateTotals();
});
