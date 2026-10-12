<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Sales_model extends CI_Model
{
    public function __construct()
    {
        parent::__construct();
        $this->db->query('CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cashier TEXT NOT NULL,
            total REAL NOT NULL,
            items_json TEXT NOT NULL,
            created_at TEXT NOT NULL
        )');
    }

    public function record(array $items, $total, $cashier)
    {
        return $this->db->insert('sales', array(
            'cashier' => (string) $cashier,
            'total' => round((float) $total, 2),
            'items_json' => json_encode($items),
            'created_at' => date('c'),
        ));
    }

    public function getTotalSales()
    {
        $result = $this->db->select_sum('total')->get('sales')->row_array();
        return round((float) ($result['total'] ?? 0), 2);
    }

    public function getTodaysSales()
    {
        $start = date('Y-m-d').'T00:00:00';
        $end = date('Y-m-d').'T23:59:59';

        $result = $this->db
            ->select_sum('total')
            ->where('created_at >=', $start)
            ->where('created_at <=', $end)
            ->get('sales')
            ->row_array();

        return round((float) ($result['total'] ?? 0), 2);
    }

    public function countSales()
    {
        return (int) $this->db->count_all('sales');
    }
}
