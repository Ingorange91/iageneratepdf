<?php

    class esc{
        private $conexion;

        public function __construct()
        {
            $objConexion=new connection();
            $this->conexion=$objConexion->get_Conexion();

          
        }

        public function oneQuery($table, $campo, $consulta){
            $stmt=$this->conexion->prepare("SELECT * FROM $table WHERE $campo=? ");
            $stmt->execute([$consulta]);
            return $stmt;

            // $stmt=$this->conexion->prepare("SELECT * FROM $table WHERE $campo=:rfc ");
            // $stmt->bindParam(':rfc', $consulta, PDO::PARAM_STR);
            // $stmt->execute();
            // return $stmt;


        }
    }


?>