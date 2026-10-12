<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Dashboard extends MY_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->requireLogin();
        $this->load->model('Sales_model');
    }

    public function index()
    {
        $this->load->view('dashboard/index', array(
            'user' => $this->session->userdata('user'),
            'total_sales' => $this->Sales_model->getTotalSales(),
            'today_sales' => $this->Sales_model->getTodaysSales(),
            'transaction_count' => $this->Sales_model->countSales(),
        ));
    }
}
