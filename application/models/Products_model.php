<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Products_model extends CI_Model
{
    public function __construct()
    {
        parent::__construct();
        $this->db->query('CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            stock INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL
        )');

        $count = (int) $this->db->count_all('products');
        if ($count === 0) {
            $this->seed();
        }
    }

    public function all()
    {
        return $this->db->order_by('name', 'ASC')->get('products')->result_array();
    }

    public function find($id)
    {
        return $this->db->get_where('products', array('id' => (int) $id))->row_array();
    }

    public function create($name, $price, $stock)
    {
        return $this->db->insert('products', array(
            'name' => $name,
            'price' => round((float) $price, 2),
            'stock' => (int) $stock,
            'created_at' => date('c'),
        ));
    }

    private function seed()
    {
        $items = array(
            array('name' => 'Milk 1L', 'price' => 2.50, 'stock' => 40),
            array('name' => 'Bread Loaf', 'price' => 1.80, 'stock' => 30),
            array('name' => 'Eggs 12pk', 'price' => 3.20, 'stock' => 25),
        );

        foreach ($items as $item) {
            $this->create($item['name'], $item['price'], $item['stock']);
        }
    }
}
