<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class MY_Controller extends CI_Controller
{
    protected function requireLogin()
    {
        if (!$this->session->userdata('user')) {
            redirect('login');
        }
    }
}
