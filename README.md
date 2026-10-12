# Supermarket POS System (CodeIgniter)

This repository contains a CodeIgniter-based implementation of a supermarket POS starter system inspired by:
https://github.com/heshanibhagya/Supermarket-POS-System-PHP

## Implemented modules

- Authentication (`admin/admin123`, `cashier/cashier123`)
- POS dashboard with total sales, today sales, transaction count
- Product management (list + add)
- POS terminal (add to cart, remove item, checkout)
- SQLite-backed persistence for products and sales

## Run locally

```bash
php -S localhost:8080
```

Then open `http://localhost:8080/index.php/login`.

## Notes

- Database file is created automatically at `application/database/pos.sqlite`.
- Seed products are inserted automatically on first run.
