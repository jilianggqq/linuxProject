<?php
include_once("./class/DB.class.php");
$op = $_POST['op'];
$host = '127.0.0.1';
$user = 'root';
$pass = '';
$port = 3306;
$dbname = 'kernel';
$tbname = "opmodule";
$dbi = DB::get_instance($host,$port,$user,$pass,$dbname);

function addmd($name,$fname) {
   global $dbi;
   global $tbname;
   $fids = array("max(id)");
   $condition = "";
   $result = $dbi->db_select($tbname,$fids,$condition);
   $row = mysql_fetch_array($result);
   $nameId = $row[0] + 1;
   $fatherId = $row[0] + 2;
   $value = array($newid,"null","null",$name,0,0,"-2","null","null",$fatherId,"null");
   $result = $dbi->db_insert($tbname,$value);

   $value = array($fatherId,"null","null",$fname,0,0,"-2","null","null",0,"null");
   $result = $dbi->db_insert($tbname,$value);

}

function addrel($sname,$ename) {

   global $dbi;
   global $tbname;
   $condition = "name = '$sname'";
   $result = $dbi->db_select($tbname,$fids,$condition);
   $row = mysql_fetch_array($result);

   if (!empty($row)) {
   //$id = $row["id"];
      $depends = $row["depends"];
      if ($depends != "null") {
	 $depends = $depends.",$ename";
	 echo $depends;
      } else {
	 $depends = $ename;
      }

      $value = array("depends" => $depends);
      $result = $dbi->db_update($tbname,$value,$condition);
   }

}


function delmd($name) {

   global $dbi;
   global $tbname;
   $condition = "name = '$name'";
   $result = $dbi->db_select($tbname,$fids,$condition);
   $row = mysql_fetch_array($result);
   if (!empty($row)) {
      $yeyeId = $row['father'];
      $selfId = $row['id'];
   //search module whose father is selfId
      $condition = "father = $selfId";
      $result = $dbi->db_select($tbname,$fids,$condition);
      $row = mysql_fetch_array($result);
      if (!empty($row)) {
	 $childId = $row["id"]; 
	 $childName = $row["name"]; 

	 if (!empty($childId)) {
	    $value = array("father" => $yeyeId);
	    $dbi->db_update($tbname,$value,$condition);
	 }
      }
   }
   

   if (!empty($yeyeId)) {

      $condition = "id = $yeyeId";
      $result = $dbi->db_select($tbname,$fids,$condition);
      $row = mysql_fetch_array($result);

      if (!empty($row)) {
	 $childs = $row["child"]; 
	 if (!empty($childs)) {
	    $newchildsArray = array();
	    foreach (explode(',',$childs) as $keyvalue) {
	       foreach (explode(':',$keyvalue) as $key => $value) {
		  if ($key != $selfId) {
		     array_push($newchildsArray,"$key:$value");
		  }
	       }
	    }

	    array_push($newchildsArray,"$childId:$childName");
	    $newchild = implode(",",$newchildsArray);
	    $value = array("child" => $newchild);
	    $dbi->db_update($tbname,$value,$condition);
	 }
      } 
   }



   $condition = "depends like '$name'";
   $result = $dbi->db_select($tbname,$fids,$condition);
   $row = mysql_fetch_array($result);

   if (!empty($row)) {

      $otherId = $row["id"]; 
      $otherDepends = $row["depends"];

      $newDependsArray = array();
      foreach (explode(',',$otherDepends) as $md) {
	 if ($md != $name) {
	    array_push($newDependsArray,"$md");
	 }
      }
      $newdepends = implode(",",$newDependsArray);
      $condition = "id = $otherId";
      $value = array("depends" => $newdepends);
      $dbi->db_update($tbname,$value,$condition);

   }

   $condition = "id = $selfId";
   $dbi->db_delete($tbname,$condition); 

}



function delrel($sname,$ename) {

   global $dbi;
   global $tbname;
   $condition = "name = '$sname'";
   $result = $dbi->db_select($tbname,$fids,$condition);
   $row = mysql_fetch_array($result);
   //$id = $row["id"];
   $depends = $row["depends"];
   if (!empty($depends)) {
      $newDependsArray = array();
      foreach (explode(',',$depends) as $md) {
	 if ($md != $ename) {
	    array_push($newDependsArray,"$md");
	 }
      }

      $newdepends = implode(",",$newDependsArray);
      $value = array("depends" => $newdepends);
      $dbi->db_update($tbname,$value,$condition);
   }

}



function chgrel($sname,$ename,$newname) {

   global $dbi;
   global $tbname;
   $condition = "name = '$sname'";
   $result = $dbi->db_select($tbname,$fids,$condition);
   $row = mysql_fetch_array($result);

   if (!empty($row)) {
      //$id = $row["id"];
      $depends = $row["depends"];
      if (!empty($depends)) {
	 $newDependsArray = array();
	 foreach (explode(',',$depends) as $md) {
	    if ($md != $ename) {
	       array_push($newDependsArray,"$md");
	    } else {
	       array_push($newDependsArray,"$newname");
	    }
	 }

	 $newdepends = implode(",",$newDependsArray);
	 $value = array("depends" => $newdepends);
	 $dbi->db_update($tbname,$value,$condition);
      }
   }
}



function chgmdname($name,$newname) {

   global $dbi;
   global $tbname;
   $condition = "name = '$name'";
   $result = $dbi->db_select($tbname,$fids,$condition);
   $row = mysql_fetch_array($result);
   $yeyeId = $row['father'];
   $selfId = $row['id'];


   $condition = "id = $yeyeId";
   $result = $dbi->db_select($tbname,$fids,$condition);
   $row = mysql_fetch_array($result);

   if (!empty($row)) {
      $childs = $row["child"]; 
      if (!empty($childs)) {
	 $newchildsArray = array();
	 foreach (explode(',',$childs) as $keyvalue) {
	    foreach (explode(':',$keyvalue) as $key => $value) {
	       if ($value != $name) {
		  array_push($newchildsArray,"$key:$value");
	       } else {
		  array_push($newchildsArray,"$key:$newname");
	       }
	    }
	 }

	 array_push($newchildsArray,"$childId:$childName");
	 $newchild = implode(",",$newchildsArray);
	 $value = array("child" => $newchild);
	 $dbi->db_update($tbname,$value,$condition);
      }
   }
      

   $condition = "depends like '$name'";
   $result = $dbi->db_select($tbname,$fids,$condition);
   $row = mysql_fetch_array($result);

   if (!empty($row)) {

      $otherId = $row["id"]; 
      $otherDepends = $row["depends"];

      if (!empty($otherId)) {
	 $newDependsArray = array();
	 foreach (explode(',',$otherDepends) as $md) {
	    if ($md != $name) {
	       array_push($newDependsArray,"$md");
	    } else {
	       array_push($newDependsArray,"$newname");
	    }
	 }
	 $newdepends = implode(",",$newDependsArray);
	 $condition = "id = $otherId";
	 $value = array("depends" => $newdepends);
	 $dbi->db_update($tbname,$value,$condition);
      }
   }

   $condition = "id = $selfId";
   $value = array("name" => $newname);
   $dbi->db_update($tbname,$value,$condition); 

}





switch($op) {
   case "addmd":
      $name = $_POST["name"];
      $fname = $_POST["fname"];
      addmd($name,$fname);     
      break;

   case "addrel":
      $sname = $_POST["sname"];
      $ename = $_POST["ename"];
      addrel($sname,$ename);     
      break;

   case "delmd":
      $name = $_POST["name"];
      delmd($name);
      break;

   case "delrel":
      $sname = $_POST["sname"];
      $ename = $_POST["ename"];
      delrel($sname,$ename);
      break;

   case "chgmdname":
      $name = $_POST["name"];
      $newname = $_POST["newname"];
      chgmdname($name,$newname);
      break;
      
   case "chgrel":
      $sname = $_POST["sname"];
      $ename = $_POST["ename"];
      $newname = $_POST["newname"];
      chgrel($sname,$ename,$newname);
}

?>
