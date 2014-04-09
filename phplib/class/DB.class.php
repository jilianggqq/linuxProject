<?php
	class DB{
		private $dbc ;
		private $dbname;
		private static $instance = null;
		private function __construct(){
		
		}

		private function __clone(){
		
		}
		
		private function init_db($host,$port,$uname,$passwd,$dbname){
			$this->dbc = mysql_connect($host.":".$port,$uname,$passwd) or die(mysql_error());
			mysql_query('set names utf8') or die('mysql_error');
			if(isset($dbname)){
				$this->dbname = $dbname;
				mysql_select_db($dbname , $this->dbc) or die(mysql_error());
			}
		}

		/*
		public function get_dbname(){
			return $this->dbname;
		}
		*/
		public static function is_db_exist(){
			if( is_object(self::$instance) ){
				return(1);
			}else{
				return(0);
			}
		}

		public static function existed_db(){
			if( self::is_db_exist() )
				return self::$instance;
			else
				return null;
		}

		public function change_db($dbname){
			return mysql_select_db( $dbname, $this->dbc);
		}

		public function get_dbc(){
			return $this->dbc;
		}
		public static function get_instance($host, $port, $uname, $passwd, $dbname){
			if(is_null(self::$instance) || !isset(self::$instance)){
				self::$instance = new DB();
				self::$instance->init_db($host, $port, $uname, $passwd, $dbname);
			}else{
				if( self::is_db_exist()  && self::$instance->dbname  != $dbname ){
					mysql_select_db( $dbname, self::$instance->get_dbc() );
				}
			}
			return self::$instance;
		}

		private function is_assoc_array($arr) {
			return array_keys($arr) !== range(0, count($arr) - 1);
		}
				

		private function set_condition($condition){
			return  isset($condition) ? "where $condition" : "";
		}
		public function db_query($sql){
			$res = mysql_query($sql) or die(mysql_error());
			return $res;
		}

		public function db_select($table,$item_arr = null,$condition = null, $attr = null){
			if($condition != null)
				$condition = $this->set_condition($condition);
			if( !count($item_arr) || $item_arr == null){
				$sql = "select * from $table $condition";
			}else{
				$items = implode(',' , $item_arr);
				$sql = "select $items from $table $condition";
			}
			if( $attr ){
				$sql	.= "$attr";
			}
			//echo $sql."\n";
			return $this->db_query($sql);
		}

		public function db_update($table , $key_value = null, $condition = null){
			if(!is_null($condition))
				$condition = $this->set_condition($condition);
			if( !count($key_value) && $key_value == null){
				echo "Error:update need at less one item";
				return(-1);
			}else{
				$tmp = array();
				foreach ($key_value as $key => $value ){
					$pair = is_numeric($value) ? "$key = $value" : "$key = '$value'";
					array_push($tmp , $pair);
				}
				$pairs = implode(',' , $tmp);
				$sql = "update $table set $pairs $condition";
			}
			return $this->db_query($sql);
		}

		public function db_delete($table ,  $condition = null){
			if(!is_null($condition))
				$condition = $this->set_condition($condition);
			if($condition == ""){
				return(-1);
			}else{
				$sql = "delete from $table $condition";
				return mysql_query($sql);
			}
			return(0) ;
		}

		public function db_insert($table , $arr){
			if($this->is_assoc_array($arr)){
				$tmp = array();
				foreach ($arr as $key => $value ){
					$tmp[] = is_numeric($value) ? "$key = $value" : "$key = '$value'";
//					$tmp[] = "$key = '$value'";
				}
				$sql = "insert into $table set ".join(',' , $tmp);
			}else{
				$tmp = array();
				foreach ($arr as $value){
					$tmp[] = is_numeric($value) ? "$value" : "'$value'";
//					$tmp[] = $v;
				}
				$sql = "insert into $table values(".join(',' , $tmp).")";
			}
		//	echo $sql;
			return mysql_query($sql);
		}

		public function db_insert_id(){
			return mysql_insert_id($this->dbc);
		}

		
	}

?>
