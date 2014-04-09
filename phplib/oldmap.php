<?php
  include_once("./class/DB.class.php");
  $autocre = 0;
  $tag = 0;
  /////$id = 0;
  $id = $_GET['id'];
  $id = 0 ;// delete the line when accessed from web
/*
  if (!empty($id)) {
      $tag = 1;   
  }
*/

  $host = '127.0.0.1';
  $user = 'root';
  $pass = '';
  $port = 3306;
  $dbname = 'kernel';
  $tbname = "module";
  $dbi = DB::get_instance($host,$port,$user,$pass,$dbname);
  $result = $dbi->db_select($tbname,$fids,$condition);
  $jsonArray = array();
  $row = mysql_fetch_array($result);
  $jsonArray["name"] = $row["fnode"];
  $jsonArray["version"] = "3.5.4";
  $jsonArray["map"]["layers"] = array();


$totalLevelMdArray = array();
$totalRelationArray = array();

function spider($id,&$ttLevelArray,&$ttRelationArray,$depth,$tag) {
  global $autocre;
  $depth--;
  $host = '127.0.0.1';
  $user = 'root';
  $pass = '';
  $port = 3306;
  $dbname = 'kernel';
  $tbname = "module";
  $dbi = DB::get_instance($host,$port,$user,$pass,$dbname);
  $condition = "id = $id";
  $result = $dbi->db_select($tbname,$fids,$condition);
  $row = mysql_fetch_array($result);

  if ($row["depends"] != "null") {
     $previousLevel = $row["level"] - 1;
     $infids = array("id");
     //$inId = ++$autocre;

     if (!array_key_exists($previousLevel,$ttRelationArray)) { 
	$ttRelationArray[$previousLevel] = array();
     }

     if ($row["depends"] != '') {
	foreach (explode(',',$row['depends']) as $cldname) { 
	   $inCondition = "name = '$cldname'";
	   $inResult = $dbi->db_select($tbname,$infids,$inCondition);
	   $inRow = mysql_fetch_array($inResult);
	   if (!empty($inRow)) {
	      $tmpRelationArray["id"] = ++$autocre;
	      $tmpRelationArray["from"] = intval($id); 
	      $tmpRelationArray["to"] = intval($inRow["id"]); 
	      array_push($ttRelationArray[$previousLevel],$tmpRelationArray);
	   }
	}
     }
  }


  if ($row["vselect"] != "null") {
     $previousLevel = $row["level"] - 1;
     $infids = array("id");

     if (!array_key_exists($previousLevel,$ttRelationArray)) { 
	$ttRelationArray[$previousLevel] = array();
     }

     if ($row["vselect"] != '') {
	foreach (explode(',',$row['vselect']) as $cldname) { 
	   $inCondition = "name = '$cldname'";
	   $inResult = $dbi->db_select($tbname,$infids,$inCondition);
	   $inRow = mysql_fetch_array($inResult);
	   if (!empty($inRow)) {
	      $tmpRelationArray["id"] = ++$autocre;
	      $tmpRelationArray["from"] = intval($id); 
	      $tmpRelationArray["to"] = intval($inRow["id"]); 
	      array_push($ttRelationArray[$previousLevel],$tmpRelationArray);
	   }
	}
     }
  }


  if ($row['child'] != "null" && $row['child'] != '') {
     $childNum = 0;
     $pfids = array("path");
     $ptbname ="mpath";
     $jsonArray["map"]["layers"] = array();
      
     //$childLevel = $row["level"] + 1;
     $childLevel = $row["level"];

     if (!array_key_exists($childLevel,$ttLevelArray)) {
	$ttLevelArray[$childLevel] = array();
     }

     if ($row["child"] != '' && $row["child"] != "null" ) {
	foreach (explode(',',$row['child']) as $cld) {
	  if (strpos($cld,':')) { 
	      $tmpArr = explode(':',$cld);
	      $pcondition = "name = '$tmpArr[1]'";
	      $mdarray=array();
	      $mdarray["id"] = intval($tmpArr[0]);
	      $mdarray["name"] = $tmpArr[1];
	      $mdarray["parentid"] =intval($row["id"]);

	      // for link:to search each child,if null,xxlib as default 
	      $presult = $dbi->db_select($ptbname,$pfids,$pcondition);  
	      $prow = mysql_fetch_array($presult);
	      if (!empty($prow['path'])) {	
		 $mdarray["link"] = $prow['path'];
	      } else {
		 $mdarray["link"] = "/system/xxlib";
	      }
	      array_push($ttLevelArray[$childLevel],$mdarray); 
	  }
	}    
     }


     if ($tag == 0) {

        if ($row["child"] != '' and $row["child"] != "null") {
	   foreach (explode(',',$row['child']) as $cld) {
	      $tmpArr = explode(':',$cld);
	      $clid = $tmpArr[0];
	      //echo "$clid\n";
	      spider($clid,$ttLevelArray,$ttRelationArray,$depth,$tag);
	   }
	}else {
	   return ;	
	}

     } else {

      return; 

     }
  }

}

spider($id,$totalLevelMdArray,$totalRelationArray,2,$tag);


/*
print_r(array_keys($totalRelationArray));
echo "_____________________\n";
print_r(array_keys($totalLevelMdArray));
////print_r($totalLevelMdArray);
//print_r($totalRelationArray);

//echo "_____________________\n";
//print_r($totalLevelMdArray);
exit();

*/

foreach (array_keys($totalLevelMdArray) as $level) {
   $tmpArray = array("level" => $level,"modules" => array());
   //array_push($tmpArray["modules"],$totalLevelMdArray[$level]);
   $tmpArray["modules"] = $totalLevelMdArray[$level];
   if (array_key_exists($level,$totalRelationArray)) {
      $tmpArray["relations"] = $totalRelationArray[$level];
   } else {
      $tmpArray["relations"] = array();
   }
   array_push($jsonArray["map"]["layers"],$tmpArray);
}
echo json_encode($jsonArray);



//jsonArray["map"]["layers"];
//print_r($totalLevelMdArray);
//echo json_encode($jsonArray);
//  if ($row['child'] != "null") {
//     $childNum = 0;
//     $pfids=array("path");
//     $ptbname="mpath";
//     //$jsonArray["map"]["layers"]["level"] = $row["level"] + 1;
//     $jsonArray["map"]["layers"] = array();
//
//     $totalMdArray = array();

?>
