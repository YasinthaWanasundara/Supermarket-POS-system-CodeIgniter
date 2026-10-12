<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?php echo isset($title) ? html_escape($title) : 'POS'; ?></title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f6fbf6; color: #1f2937; }
        nav a { margin-right: 12px; color: #1f5d3c; text-decoration: none; font-weight: bold; }
        table { border-collapse: collapse; width: 100%; background: #fff; }
        th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
        .card { background: #fff; border: 1px solid #d1d5db; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
        .row { display: flex; gap: 16px; flex-wrap: wrap; }
        .col { flex: 1; min-width: 220px; }
        .btn { background: #2d6a4f; color: #fff; border: 0; padding: 8px 12px; border-radius: 4px; cursor: pointer; }
        .muted { color: #6b7280; }
    </style>
</head>
<body>
<?php if (!empty($user)): ?>
    <nav>
        <a href="<?php echo site_url('dashboard'); ?>">Dashboard</a>
        <a href="<?php echo site_url('products'); ?>">Products</a>
        <a href="<?php echo site_url('pos'); ?>">POS Terminal</a>
        <a href="<?php echo site_url('logout'); ?>">Logout (<?php echo html_escape($user['username']); ?>)</a>
    </nav>
    <hr>
<?php endif; ?>
