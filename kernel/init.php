<?php
	//author:Song Yang
	//Email:nosongyang@gmail.com
	header('Content-type: text/json');
	error_reporting(E_ALL ^ E_NOTICE);
	include("config.php");
	$link = mysql_connect($db_host,$db_username,$db_password);
	mysql_query('set names utf8');
	if(!$link) die( "link unsuccess!"); 
	//else echo "link success!\n";
	//$currentArch = $_GET['arch'];
	fwrite(STDOUT, "Enter Architecture (x86 or arm): ");
	$currentArch = trim(fgets(STDIN));
	fwrite(STDOUT, "Enter out put absolute path (end with .json format): ");
	$outputFile = trim(fgets(STDIN));
	if ($currentArch == "x86"){
	
		mysql_select_db($x86_db , $link);
	}  //choice the x86 db
	elseif ($currentArch == "arm"){
		mysql_select_db($arm_db ,$link);
	}
	else{
		die("Architecture error!");
	}

	function initIndexMap($link,$outputFile){
		//$callback = $_GET['jsoncallback'];

		$levelArray0 = array();
		$levelArray1 = array();
		$levelArray2 = array();
		$tmpArray = array();
		$relationsArray = array();

		$levelArray0["level"] = 0;
		$levelArray0["modules"] = array();
		$levelArray0["relations"] = array();

		$levelArray1["level"] = 1;
		$levelArray1["modules"] = array();
		$levelArray1["relations"] = array();

		$levelArray2["level"] = 2;
		$levelArray2["modules"] = array();
		$levelArray2["relations"] = array();

		$q = "SELECT * FROM basevirtualdirectory";
		$rs = mysql_query($q , $link);
		if(!$rs){
			die("Valid result!");
		}
		while ($row = mysql_fetch_row($rs)) {
			if($row[2] == -1){
				$tmpArray["id"] = "0_" . $row[0];
				$tmpArray["name"] = urlencode($row[1]);
				$tmpArray["parentid"] = "0_" . $row[2];
				$tmpArray["type"] = 0;
				$tmpArray["level"] = -1;
				array_push($levelArray0["modules"], $tmpArray);
			}
			elseif ($row[2] <= 8) {
				$tmpArray["id"] = "0_" . $row[0];
				$tmpArray["name"] = urlencode($row[1]);
				$tmpArray["parentid"] ="0_" . $row[2];
				$tmpArray["type"] = 0;
				$tmpArray["level"] = 0;
				array_push($levelArray1["modules"], $tmpArray);
			}
			else{
				$tmpArray["id"] = "0_" . $row[0];
				$tmpArray["name"] = urlencode($row[1]);
				$tmpArray["parentid"] = "0_" . $row[2];
				$tmpArray["type"] = 0;
				$tmpArray["level"] = 1;
				array_push($levelArray2["modules"], $tmpArray);
			}
		}
		
		$q = "SELECT * FROM basevirtualrelation";
		$rs = mysql_query($q , $link);
		if(!$rs){
			die("Valid result!");
		}
		while($row = mysql_fetch_row($rs)){
			$relationsArray["id"] = "0_" . $row[0];
			$relationsArray["from"] = "0_" . $row[1];
			$relationsArray["to"] = "0_" . $row[2];
			array_push($levelArray1["relations"], $relationsArray);
		}



		$jsonArray = array();
		$jsonArray["name"] = "kernel";
		$jsonArray["version"] = "3.5.4";
		$jsonArray["map"] = array();
		$jsonArray["map"]["layers"] = array();
		array_push($jsonArray["map"]["layers"],$levelArray0);
		array_push($jsonArray["map"]["layers"],$levelArray1);
		array_push($jsonArray["map"]["layers"],$levelArray2);


		//echo $callback."(".json_encode($jsonArray).")";
		//echo json_encode($jsonArray);
		creat_json_file($outputFile,$jsonArray);


	}
	function creat_json_file($filepath,$filedata){
		$filename = $filepath;

		$file_pointer = fopen($filename, "w"); 
		fwrite($file_pointer, urldecode(json_encode($filedata)));
		fclose($file_pointer);
		echo "write JSON file success";
		
	}
	initIndexMap($link,$outputFile);
?>