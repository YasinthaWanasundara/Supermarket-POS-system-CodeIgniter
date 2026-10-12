<?php $this->load->view('layouts/header', array('title' => 'Products', 'user' => $user)); ?>
<h2>Products</h2>
<div class="card">
    <form method="post" action="<?php echo site_url('products/add'); ?>">
        <div class="row">
            <div class="col"><label>Name<br><input type="text" name="name" required></label></div>
            <div class="col"><label>Price<br><input type="number" name="price" step="0.01" min="0.01" required></label></div>
            <div class="col"><label>Stock<br><input type="number" name="stock" min="0" required></label></div>
            <div class="col" style="align-self:end;"><button class="btn" type="submit">Add Product</button></div>
        </div>
    </form>
</div>
<table>
    <thead><tr><th>ID</th><th>Name</th><th>Price</th><th>Stock</th></tr></thead>
    <tbody>
        <?php foreach ($products as $product): ?>
            <tr>
                <td><?php echo (int) $product['id']; ?></td>
                <td><?php echo html_escape($product['name']); ?></td>
                <td>$<?php echo number_format((float) $product['price'], 2); ?></td>
                <td><?php echo (int) $product['stock']; ?></td>
            </tr>
        <?php endforeach; ?>
    </tbody>
</table>
<?php $this->load->view('layouts/footer'); ?>
