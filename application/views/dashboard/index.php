<?php $this->load->view('layouts/header', array('title' => 'Dashboard', 'user' => $user)); ?>
<h2>Operations Dashboard</h2>
<div class="row">
    <div class="card col"><strong>Total Sales</strong><div>$<?php echo number_format($total_sales, 2); ?></div></div>
    <div class="card col"><strong>Today's Sales</strong><div>$<?php echo number_format($today_sales, 2); ?></div></div>
    <div class="card col"><strong>Transactions</strong><div><?php echo (int) $transaction_count; ?></div></div>
</div>
<?php $this->load->view('layouts/footer'); ?>
