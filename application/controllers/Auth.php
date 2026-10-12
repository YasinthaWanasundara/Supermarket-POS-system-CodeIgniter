<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Auth extends CI_Controller
{
    private $users = array(
        'admin' => array('password' => 'admin123', 'role' => 'Admin'),
        'cashier' => array('password' => 'cashier123', 'role' => 'Cashier'),
    );

    public function login()
    {
        if ($this->session->userdata('user')) {
            redirect('dashboard');
        }

        $error = NULL;
        if ($this->input->method() === 'post') {
            $username = trim((string) $this->input->post('username'));
            $password = (string) $this->input->post('password');

            if (isset($this->users[$username]) && $this->users[$username]['password'] === $password) {
                $this->session->set_userdata('user', array(
                    'username' => $username,
                    'role' => $this->users[$username]['role'],
                ));
                redirect('dashboard');
            }
            $error = 'Invalid username or password.';
        }

        $this->load->view('auth/login', array('error' => $error));
    }

    public function logout()
    {
        $this->session->unset_userdata('user');
        $this->session->unset_userdata('cart');
        redirect('login');
    }
}
