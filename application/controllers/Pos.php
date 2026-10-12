<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Pos extends MY_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->requireLogin();
        $this->load->model('Products_model');
        $this->load->model('Sales_model');
    }

    public function index()
    {
        $cart = $this->session->userdata('cart') ?: array();

        $this->load->view('pos/index', array(
            'products' => $this->Products_model->all(),
            'cart' => $cart,
            'total' => $this->calculateTotal($cart),
            'user' => $this->session->userdata('user'),
        ));
    }

    public function add()
    {
        $productId = (int) $this->input->post('product_id');
        $product = $this->Products_model->find($productId);

        if ($product) {
            $cart = $this->session->userdata('cart') ?: array();
            $exists = FALSE;

            foreach ($cart as &$item) {
                if ((int) $item['id'] === (int) $product['id']) {
                    $item['qty']++;
                    $exists = TRUE;
                    break;
                }
            }
            unset($item);

            if (!$exists) {
                $cart[] = array(
                    'id' => (int) $product['id'],
                    'name' => $product['name'],
                    'price' => (float) $product['price'],
                    'qty' => 1,
                );
            }

            $this->session->set_userdata('cart', $cart);
        }

        redirect('pos');
    }

    public function remove($productId)
    {
        $productId = (int) $productId;
        $cart = $this->session->userdata('cart') ?: array();

        $cart = array_values(array_filter($cart, function ($item) use ($productId) {
            return (int) $item['id'] !== $productId;
        }));

        $this->session->set_userdata('cart', $cart);
        redirect('pos');
    }

    public function checkout()
    {
        $cart = $this->session->userdata('cart') ?: array();

        if (!empty($cart)) {
            $total = $this->calculateTotal($cart);
            $this->Sales_model->record($cart, $total, $this->session->userdata('user')['username']);
            $this->session->unset_userdata('cart');
        }

        redirect('dashboard');
    }

    private function calculateTotal(array $cart)
    {
        $total = 0;
        foreach ($cart as $item) {
            $total += ((float) $item['price']) * ((int) $item['qty']);
        }
        return round($total, 2);
    }
}
