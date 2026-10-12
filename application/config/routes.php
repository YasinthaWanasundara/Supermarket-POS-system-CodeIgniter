<?php
defined('BASEPATH') OR exit('No direct script access allowed');

$route['default_controller'] = 'auth/login';
$route['404_override'] = '';
$route['translate_uri_dashes'] = FALSE;

$route['dashboard'] = 'dashboard/index';
$route['login'] = 'auth/login';
$route['logout'] = 'auth/logout';
$route['products'] = 'products/index';
$route['products/add'] = 'products/add';
$route['pos'] = 'pos/index';
$route['pos/add'] = 'pos/add';
$route['pos/remove/(:num)'] = 'pos/remove/$1';
$route['pos/checkout'] = 'pos/checkout';
