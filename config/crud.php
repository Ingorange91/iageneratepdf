<?php

    class esc{
        private $conexion;

        public function __construct()
        {
            $objConexion=new connection();
            $this->conexion=$objConexion->get_Conexion();

          
        }

        public function oneQuery($table, $campo, $consulta){
            $stmt=$this->conexion->prepare("SELECT * FROM $table WHERE $campo='$consulta' ");
            $stmt->execute();
            return $stmt;
        }
    }


?>