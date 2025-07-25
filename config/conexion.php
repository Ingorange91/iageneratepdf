<?php

class connection{
    private $conexion;

    public function __construct()
    {
        $this->establecer_Conexion();
    }

    public function establecer_Conexion(){
        try {
            $option=[
                PDO::ATTR_ERRMODE =>PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_EMULATE_PREPARES=>FALSE,
                PDO::MYSQL_ATTR_INIT_COMMAND=>"SET NAMES utf8"
            ];
            $servidor="mysql:dbname=".DB_NAME.";host=".DB_SERVER;
            $this->conexion=new PDO($servidor,DB_USER,DB_PASS, $option);

        }catch(PDOException $e){ echo "error en la conexion".$e->getMessage();}
    }

    public function get_Conexion(){
        return $this->conexion;
    }
}



?>