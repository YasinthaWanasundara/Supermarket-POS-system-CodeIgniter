<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Products extends MY_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->requireLogin();
        $this->load->model('Products_model');
    }

    public function index()
    {
        $this->load->view('products/index', array(
            'products' => $this->Products_model->all(),
            'user' => $this->session->userdata('user'),
        ));
    }

    public function add()
    {
        if ($this->input->method() === 'post') {
            $name = trim((string) $this->input->post('name'));
            $price = (float) $this->input->post('price');
            $stock = (int) $this->input->post('stock');

            if ($name !== '' && $price > 0 && $stock >= 0) {
                $this->Products_model->create($name, $price, $stock);
            }
        }

        redirect('products');
    }
}
