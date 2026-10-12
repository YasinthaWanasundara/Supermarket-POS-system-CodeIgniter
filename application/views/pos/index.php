<?php $this->load->view('layouts/header', array('title' => 'POS Terminal', 'user' => $user)); ?>
<h2>POS Terminal</h2>
<div class="row">
    <div class="col card">
        <h3>Products</h3>
        <table>
            <thead><tr><th>Name</th><th>Price</th><th></th></tr></thead>
            <tbody>
            <?php foreach ($products as $product): ?>
                <tr>
                    <td><?php echo html_escape($product['name']); ?></td>
                    <td>$<?php echo number_format((float) $product['price'], 2); ?></td>
                    <td>
                        <form method="post" action="<?php echo site_url('pos/add'); ?>">
                            <input type="hidden" name="product_id" value="<?php echo (int) $product['id']; ?>">
                            <button class="btn" type="submit">Add</button>
                        </form>
                    </td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>
    <div class="col card">
        <h3>Current Cart</h3>
        <table>
            <thead><tr><th>Item</th><th>Qty</th><th>Line Total</th><th></th></tr></thead>
            <tbody>
            <?php if (empty($cart)): ?>
                <tr><td colspan="4" class="muted">No items yet.</td></tr>
            <?php else: ?>
                <?php foreach ($cart as $item): ?>
                    <tr>
                        <td><?php echo html_escape($item['name']); ?></td>
                        <td><?php echo (int) $item['qty']; ?></td>
                        <td>$<?php echo number_format($item['price'] * $item['qty'], 2); ?></td>
                        <td><a href="<?php echo site_url('pos/remove/'.$item['id']); ?>">remove</a></td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
            </tbody>
        </table>
        <p><strong>Total: $<?php echo number_format($total, 2); ?></strong></p>
        <form method="post" action="<?php echo site_url('pos/checkout'); ?>">
            <button class="btn" type="submit" <?php echo empty($cart) ? 'disabled' : ''; ?>>Checkout</button>
        </form>
    </div>
</div>
<?php $this->load->view('layouts/footer'); ?>
