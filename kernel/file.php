<?php
	header('Content-type: text/json');
	error_reporting(E_ALL ^ E_NOTICE);	 //显示除去 E_NOTICE 之外的所有错误信息 
	include("config.php");
	$link = mysql_connect($db_host,$db_username,$db_password);
	mysql_query('set names utf8');
	//Êý¾Ý¿âÊÇ·ñÁ¬½Ó
	if(!$link) echo "link unsuccess!"; 
	//else echo "link success!\n";
	$currentArch = $_GET['arch'];
	if ($currentArch == "x86"){
	
		mysql_select_db($x86_db , $link);
	}  //choice the x86 db
	if ($currentArch == "arm"){
		mysql_select_db($arm_db ,$link);
	}

	function mutualByFileID($link){
		
		$callback = $_GET['jsoncallback'];	
		$FileID = $_GET["FileID"];		//从前台取值,接口是FileID
		//$FileID = 4941;
		//$q = "SELECT Id,FileName FROM filename";	//测试
		$q = "SELECT Id, FunctionName, annourl, FunctionType FROM functioninfo WHERE FileNameId = $FileID AND FunctionType != 2 ORDER BY weight DESC";	//取得函数列表的数据集
		$rs = mysql_query($q, $link);
		$jsonArray = array();
		$funcArray = array();
		$tmpmdArray = array();
		if(!$rs){
			die("Valid result!");
		}

		while($row = mysql_fetch_row($rs)){
			
			$funcArray["id"] = "3_" . $row[0];
			$funcArray["name"] = $row[1];
			$funcArray["annourl"] = $row[2];
			$funcArray["type"] = 3;
			$funcArray["functiontype"] = $row[3];	
			array_push($tmpmdArray,$funcArray);
		}
		mysql_free_result($rs);	

		$i_max = count($tmpmdArray);
		for($i = 0 ;$i < $i_max;$i++){
			$jsonArray["modules"][] = $tmpmdArray[$i];
		}
	
		$jsonArray["relations"] = array();
		$i_max = count($jsonArray["modules"]);
		$tmp_array2 = array();
		for($i = 0 ;$i < $i_max;$i++){
			$vid  = $jsonArray["modules"][$i]["id"];
			$vid = substr($vid,2,strlen($vid));
			$q8 = "SELECT functioncall.CalleeId, filename.id,filename.moduleId,virtualpathtomodules.virtualDirId,functioncall.Conditions FROM functioncall,functioninfo,filename,virtualpathtomodules WHERE functioncall.CallerId =$vid AND virtualpathtomodules.moduleId = filename.moduleId AND functioninfo.Id = CalleeId AND functioninfo.FileNameId = filename.id";
			$rs_tmp = @mysql_query($q8, $link);			//可使用functionspec表
			$tmp_array = array();
			while($row = @mysql_fetch_row($rs_tmp)){
				$tmp_array["from"] = "3_" . $vid;
				$tmp_array["logicrelation"] = $row[4];
				$tmp_array["to"] = "3_" . $row[0];
				array_push($tmp_array2, $tmp_array);
				$tmp_array["from"] = "3_" . $vid;
				$tmp_array["logicrelation"] = NULL;
				$tmp_array["to"] = "2_" . $row[1];
				array_push($tmp_array2,$tmp_array);
				$tmp_array["from"] = "3_" . $vid;
				$tmp_array["logicrelation"] = NULL;
				$tmp_array["to"] = "1_" . $row[2];
				array_push($tmp_array2,$tmp_array);
				$tmp_array["from"] = "3_" . $vid;
				$tmp_array["logicrelation"] = NULL;
				$tmp_array["to"] = "0_" . $row[3];
				array_push($tmp_array2,$tmp_array);
			}
			@mysql_free_result($rs_tmp);	
			$q9 = "SELECT functioncall.CallerId, filename.id,filename.moduleId,virtualpathtomodules.virtualDirId,functioncall.Conditions FROM functioncall,functioninfo,filename,virtualpathtomodules WHERE functioncall.CalleeId =$vid AND virtualpathtomodules.moduleId = filename.moduleId AND functioninfo.Id = CallerId AND functioninfo.FileNameId = filename.id";
			$rs_tmp = @mysql_query($q9, $link);			//可使用functionspec表
			while($row = @mysql_fetch_row($rs_tmp)){
				$tmp_array["from"] = "3_" . $row[0];
				$tmp_array["logicrelation"] = $row[4];
				$tmp_array["to"] = "3_" . $vid;
				array_push($tmp_array2, $tmp_array);
				$tmp_array["from"] = "2_" .$row[1];
				$tmp_array["logicrelation"] = NULL;
				$tmp_array["to"] = "3_" . $vid;
				array_push($tmp_array2,$tmp_array);
				$tmp_array["from"] = "1_" .$row[2];
				$tmp_array["logicrelation"] = NULL;
				$tmp_array["to"] = "3_" . $vid;
				array_push($tmp_array2,$tmp_array);
				$tmp_array["from"] = "0_" .$row[3];
				$tmp_array["logicrelation"] = NULL;
				$tmp_array["to"] = "3_" . $vid;
				array_push($tmp_array2,$tmp_array);
			}
			@mysql_free_result($rs_tmp);	
		}
		$jsonArray["relations"]= $tmp_array2;
	
		//echo json_encode($jsonArray);	//输出json串
		echo $callback."(".json_encode($jsonArray).")";
	}
	mutualByFileID($link);

?>
