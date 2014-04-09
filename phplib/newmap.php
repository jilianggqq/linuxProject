<?php
  include_once("./class/DB.class.php");
  $autocre = 0;
  $tag = 0;
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
$futureLevel = array();

function spider($id,&$ttLevelArray,&$ttRelationArray,$depth,$tag) {
  global $autocre;
  global $futureLevel;

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
  ///////////////////
/*
  if (array_key_exists($row["level"],$futureLevel)) {
      
  }
*/


  ////////////////////

  if ($row["depends"] != "null") {
     $previousLevel = $row["level"] - 1;
     $infids = array("id","level");
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
	      $tmp_level = $inRow["level"] - 1;
	      //if ($previousLevel < ($inRow["level"] - 1)) {
	      if ($previousLevel < $tmp_level) {
		 $fLevel = $inRow["level"] - 1;
		 $futureId = $inRow["id"];
		 if (!array_key_exists($fLevel,$futureLevel)) {
		    $futureLevel[$fLevel] = array(); 
	         } 
		 $futureLevel[$fLevel][$futureId] = array(
							    "id" => ++$autocre,
							   "from" => intval($id),
							   "to" => intval($futureId)
							 );

	      } else {
		 $tmpRelationArray["id"] = ++$autocre;
		 $tmpRelationArray["from"] = intval($id); 
		 $tmpRelationArray["to"] = intval($inRow["id"]); 
		 array_push($ttRelationArray[$previousLevel],$tmpRelationArray);
	       }
	   }
	}
     }
  }


  if ($row["vselect"] != "null") {
     $previousLevel = $row["level"] - 1;
     $infids = array("id","level");

     if (!array_key_exists($previousLevel,$ttRelationArray)) { 
	$ttRelationArray[$previousLevel] = array();
     }

     if ($row["vselect"] != '') {
	foreach (explode(',',$row['vselect']) as $cldname) { 
	   $inCondition = "name = '$cldname'";
	   $inResult = $dbi->db_select($tbname,$infids,$inCondition);
	   $inRow = mysql_fetch_array($inResult);
	   if (!empty($inRow)) {

	      $tmp_level = $inRow["level"] - 1;
	      //if ($previousLevel < ($inRow["level"] - 1)) {
	      if ($previousLevel < $tmp_level) {
		 $fLevel = $inRow["level"] - 1;
		 $futureId = $inRow["id"];
		 if (!array_key_exists($fLevel,$futureLevel)) {
		    $futureLevel[$fLevel] = array(); 
	         } 
		 $futureLevel[$fLevel][$futureId] = array(
							    "id" => ++$autocre,
							   "from" => intval($id),
							   "to" => intval($futureId)
							 );
	      } else {
		 $tmpRelationArray["id"] = ++$autocre;
		 $tmpRelationArray["from"] = intval($id); 
		 $tmpRelationArray["to"] = intval($inRow["id"]); 
		 array_push($ttRelationArray[$previousLevel],$tmpRelationArray);
	       }
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
		 $mdarray["link"] = "/system/lib";
	      }
	      array_push($ttLevelArray[$childLevel],$mdarray); 
	  }
	}    
     }


     if ($tag == 0) {
        $depth--;
	if ($depth > 0) {
	   if ($row["child"] != '' and $row["child"] != "null") {
	      foreach (explode(',',$row['child']) as $cld) {
		 $tmpArr = explode(':',$cld);
		 $clid = $tmpArr[0];
		 //echo "clid is $clid,depth is $depth\n";
		 spider($clid,$ttLevelArray,$ttRelationArray,$depth,$tag);
	      }
	   }else {
	      return ;	
	   }
	}

     } else {

      return; 

     }
  }

}

spider($id,$totalLevelMdArray,$totalRelationArray,4,$tag);

/*
print_r(array_keys($totalRelationArray));
echo "_____________________\n";

print_r(array_keys($totalLevelMdArray));

////print_r($totalLevelMdArray);

echo "_____________________\n";
print_r(array_keys($futureLevel));
exit();
 */


foreach (array_keys($totalLevelMdArray) as $level) {
   $tmpArray = array("level" => $level,"modules" => array());
   //array_push($tmpArray["modules"],$totalLevelMdArray[$level]);
   $tmpArray["modules"] = $totalLevelMdArray[$level];
   if (array_key_exists($level,$totalRelationArray)) {
      $tmpArray["relations"] = $totalRelationArray[$level];
      if (array_key_exists($level,$futureLevel)) {
	 $futurekeys = array_keys($futureLevel[$level]);
	 foreach ($futurekeys as $key) {
	    array_push($tmpArray["relations"],$futureLevel[$level][$key]);
	 }
      }
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
