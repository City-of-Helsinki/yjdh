<?php
$config = array(
    'admin' => array(
        'core:AdminPassword',
    ),
    'example-userpass' => array(
        'exampleauth:UserPass',
        // Define a mock user with Suomi.fi attributes
        'samluser:samlpassword' => array(
            'uid' => array('samluser'),
            'urn:oid:1.2.246.21' => array('210281-9988'), // nationalIdentificationNumber (hashed for username)
            'urn:oid:1.2.246.22' => array('1234567890'), // electronicIdentificationNumber (satu)
            'urn:oid:2.5.4.42' => array('Matti'),         // givenName
            'urn:oid:2.5.4.4' => array('Meikäläinen'),   // sn
            'urn:oid:2.5.4.3' => array('Matti Meikäläinen'), // cn
        ),
    ),
);
