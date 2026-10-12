<?php $this->load->view('layouts/header', array('title' => 'Login')); ?>
<div class="card" style="max-width:420px;margin:40px auto;">
    <h2>Supermarket POS Login</h2>
    <p class="muted">Demo accounts: admin/admin123 or cashier/cashier123</p>
    <?php if (!empty($error)): ?>
        <p style="color:#b91c1c;"><?php echo html_escape($error); ?></p>
    <?php endif; ?>
    <form method="post" action="<?php echo site_url('login'); ?>">
        <p><label>Username<br><input type="text" name="username" required></label></p>
        <p><label>Password<br><input type="password" name="password" required></label></p>
        <button class="btn" type="submit">Sign In</button>
    </form>
</div>
<?php $this->load->view('layouts/footer'); ?>
