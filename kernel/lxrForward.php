<?php



  

function lastindexof($all,$part){
  if(trim($all)=="" || trim($part)=="") return 0;

  while(strpos($all,$part)!=false)
  {
   $indexof = strpos($all,$part);
   $lastindexof = $lastindexof + $indexof + $offset;
   $all = substr($all,$indexof+ strlen($part));
   $offset = strlen($part);
  }
  
  return $lastindexof;
 }


  // header('Content-type: text/json');
error_reporting(E_ALL ^ E_NOTICE);
include("config.php");
$con = mysql_connect($db_host,$db_username,$db_password);
mysql_query('set names utf8');

if (!$con)
{
    die('Could not connect: ' . mysql_error());
}


$currentArch = $_GET['arch'];
$currentDir = "real";
   //choice the x86 db
if ($currentArch == "arm"){
  $select = mysql_select_db($arm_db,$con);
} else {
  $select = mysql_select_db($x86_db,$con);
  $currentArch = "x86";
}

if(!$select)
{
 die('Select nothing: ' . mysql_error());
}

$fromId = $_GET['fromId'];
$fromType = $_GET['fromType'];
$toId = $_GET['toId'];
$toType =$_GET['toType'];
$sql = '';
$TsinghuaType = $_GET['tsinghuaType'];




if ($fromType == 2) {
    // this for file to jump
  $sql = "SELECT fileName FROM filename WHERE filename.id = $fromId";
    // echo $sql;
} else if ($fromType == 3) {
    // this for function_exists(function_name) to jump
  $sql = "SELECT annourl FROM functioninfo WHERE functioninfo.id = $fromId";

} else if ($fromType == 5) {
    // this for type to jump
  $sql = "SELECT annourl FROM typeinfo WHERE typeinfo.id = $fromId";
} else if ($fromType == 1){
  $sql = "SELECT
  DirectoryPath
  FROM
  `directory`,
  module
  WHERE
  `directory`.Id = module.DirectoryPathId
  AND module.Id = $fromId";
} else if ($fromType == 0){
  $sql = "SELECT 
   NameInEnglish, ParentId 
   FROM
   basevirtualdirectory
   WHERE 
   basevirtualdirectory.Id = $fromId
   ";
  $currentDir = "virtual";
}

  // $sql = "SELECT * From filename LIMIT 0,30";
$rs = mysql_query($sql, $con);
// echo $sql;
if(!$rs){
 die("Valid result!");
}

$fromPath="*";
if ($fromType == 3 || $fromType == 5){
  while($row = mysql_fetch_row($rs)){
     $fromPath = $row[0];
 }
    $fromPath = substr($fromPath, 46); // len(http://124.16.141.171:81/mediawiki/index.php/) = 44
    $fromPath = substr($fromPath, 0, strlen($fromPath) - 19);
  } else if ($fromType == 1 || $fromType == 2) {
    while($row = mysql_fetch_row($rs)){
      $fromPath = $row[0];
    }
    $fromPath = substr($fromPath, 1);
    // echo $target;
  } else if ($fromType == 0){
    $pid = -1;
    $fromPath = "";
    while($row = mysql_fetch_row($rs)){
      $fromPath = $row[0];
      $pid = $row[1];
    }
    while ($pid != -1){
      $sql = "SELECT 
       NameInEnglish, ParentId 
       FROM
       basevirtualdirectory
       WHERE 
       basevirtualdirectory.Id = $pid
       ";
       $rs = mysql_query($sql, $con);
       while ($row = mysql_fetch_row($rs)){
        $fromPath = $row[0] . "/" . $fromPath;
        $pid = $row[1];
       }
    }
  }

  if ($toType == 2) {
    // this for file to jump
    $sql = "SELECT fileName FROM filename WHERE filename.id = $toId";
    // echo $sql;

  } else if ($toType == 3) {
    // this for function_exists(function_name) to jump
    $sql = "SELECT annourl FROM functioninfo WHERE functioninfo.id = $toId";

  } else if ($toType == 5) {
    // this for type to jump
    $sql = "SELECT annourl FROM typeinfo WHERE typeinfo.id = $toId";
  } else if ($toType == 1){
    $sql = "SELECT
      DirectoryPath
      FROM
      `directory`,
      module
      WHERE
      `directory`.Id = module.DirectoryPathId
      AND module.Id = $toId";
   } else if ($toType == 0){
      $sql = "SELECT 
       NameInEnglish, ParentId 
       FROM
       basevirtualdirectory
       WHERE 
       basevirtualdirectory.Id = $toId
       ";
      $currentDir = "virtual";
  } 


  if ($toType != null && $toId != null) {
     $rs = mysql_query($sql, $con);
     if(!$rs){
        die("Valid result!");
    }

    $toPath="*";
    if ($toType == 3 || $toType == 5){
        while($row = mysql_fetch_row($rs)){
            $toPath = $row[0];
        }
        $toPath = substr($toPath, 46); // len(http://124.16.141.171:81/mediawiki/index.php/) = 44
        $toPath = substr($toPath, 0, strlen($toPath) - 19);
    } else if ($toType == 1 || $toType == 2) {
        while($row = mysql_fetch_row($rs)){
            $toPath = $row[0];
        }
        $toPath = substr($toPath, 1);
    } else if ($toType == 0){
        $pid = -1;
        $toPath = "";
        while($row = mysql_fetch_row($rs)){
          $toPath = $row[0];
          $pid = $row[1];
        }
        while ($pid != -1){
          $sql = "SELECT 
           NameInEnglish, ParentId 
           FROM
           basevirtualdirectory
           WHERE 
           basevirtualdirectory.Id = $pid
           ";
           $rs = mysql_query($sql, $con);
           while ($row = mysql_fetch_row($rs)){
            $toPath = $row[0] . "/" . $toPath;
            $pid = $row[1];
           }
    }
  }
} else {
    $toPath = "";
}

if ($currentArch == "arm") {
  $currentArch = "arm-RaspberryPI";
} else {
  $currentArch = "x86_32";
}



$prefix_call = "http://124.16.141.130/lxr/call?";
$prefix_watchlist = "http://124.16.141.130/lxr/watchlist?";
$prefix_taintrace ="http://124.16.141.130/lxr/taintrace?";


switch ($TsinghuaType) {
  case 0:
    if(strpos($fromPath, ".c") != false){
    $fromPath = substr($fromPath, 0, lastindexof($fromPath, "/"));
    }
    if(strpos($toPath, ".c") != false){
    $toPath = substr($toPath, 0, lastindexof($toPath, "/"));
    }
    if ($fromPath == $toPath) {
      $toPath = "";
    }
    $target = $prefix_call . "v=linux-3.5.4&f=". $currentDir ."&a=" . $currentArch . "&path0=" . $fromPath . "&path1=" . $toPath;
    break;
  case 1:
    if(strpos($fromPath, ".c") !=  false && (strpos($fromPath, ".c") != (strlen($fromPath) - 2)) ){
    $fromPath = substr($fromPath, 0, lastindexof($fromPath, "/"));
    }
    if(strpos($toPath, ".c") != false && (strpos($toPath, ".c") != (strlen($toPath) - 2)) ){
    $toPath = substr($toPath, 0, lastindexof($toPath, "/"));
    }
    if ($fromPath == $toPath) {
      $toPath = "";
    }
    $target = $prefix_watchlist . "v=linux-3.5.4&f=". $currentDir ."&a=" . $currentArch . "&path0=" . $fromPath . "&path1=" . $toPath;
   
    break;
  case 2:
     if ( $fromPath == $toPath) {
      $toPath = "";
     }
     $target = $prefix_taintrace . "v=linux-3.5.4&f=". $currentDir ."&a=" . $currentArch . "&path0=" . $fromPath . "&path1=" . $toPath."&depth=5";
   
    break;
  
  default:
    if ($fromPath == $toPath) {
      $toPath = "";
    }
    $target = $prefix_call . "v=linux-3.5.4&f=". $currentDir ."&a=" . $currentArch . "&path0=" . $fromPath . "&path1=" . $toPath;
    break;
}


header("Location: $target"); 
// echo $target;
//echo $currentDir;
?>
