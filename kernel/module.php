<?php
	header('Content-type: text/json');
	error_reporting(E_ALL ^ E_NOTICE);	 //显示除去 E_NOTICE 之外的所有错误信息 
	include("config.php");
	$link = mysql_connect($db_host,$db_username,$db_password);
	mysql_query('set names utf8');
	//数据库是否连接
	if(!$link) echo "link unsuccess!"; 
	//else echo "link success!\n";
	$currentArch = $_GET['arch'];
	if ($currentArch == "x86"){
	
		mysql_select_db($x86_db , $link);
	}  //choice the x86 db
	if ($currentArch == "arm"){
		mysql_select_db($arm_db ,$link);
	}

	function mutualByConfigID($link){
		
		$callback = $_GET['jsoncallback'];		
		$ConfigID = $_GET["ConfigID"];		//从前台取值,接口是ConfigID
		$ParentID = $_GET["parentId"];
		//$ConfigID = 7766;
		//$q = "SELECT Id,FileName FROM filename";	//测试

		$jsonArray = array();
		$fileArray = array();
	    $filerlArray2 = array();
		$filerlArray3 = array();
		$tmpmdArray = array();
		$crazyArray = array();
		$filerlArray = array();
		$madArray = array();
		//the file in this config&&virtualpath

		$q = "SELECT filename.Id, filename.FileName, filename.annourl FROM filename, virtualtorealpath WHERE filename.ModuleId = $ConfigID AND virtualtorealpath.RealPath = filename.FileName AND virtualtorealpath.virtualDirId = $ParentID ORDER BY weight DESC";	//取得文件列表的数据集
		$rs = mysql_query($q, $link);
		if(!$rs){
			die("Valid result!");
		} 
		while($row = mysql_fetch_row($rs)){

			
			$fileArray["id"] = "2_" . $row[0];
			$fileArray["name"] = $row[1];
			$fileArray["annourl"] = $row[2];
			$fileArray["type"] = 2;
			$fileArray["RecColor"] = 2;
			array_push($crazyArray,$fileArray);
			$q8 = "SELECT filerelation.toId, filename.Moduleid, virtualpathtomodules.virtualDirId FROM filerelation, filename, virtualpathtomodules WHERE filerelation.fromId = $row[0] AND filename.id = filerelation.toId AND virtualpathtomodules.moduleId = filename.moduleID";
			$rs_tmp = mysql_query($q8, $link);
			while($row1 = mysql_fetch_row($rs_tmp)){
				$filerlArray["from"] = "2_" . $row[0];
				$filerlArray["to"] = "2_" . $row1[0];	//file to file-2
				$filerlArray2["from"] = "2_" . $row[0];
				$filerlArray2["to"] = "1_" . $row1[1];	//file to module-1
				$filerlArray3["from"] = "2_" . $row[0];
				$filerlArray3["to"] = "0_" . $row1[2];	//file to virtualdir-0
				array_push($madArray,$filerlArray);
				//array_push($madArray,$filerlArray);	//should delete it??
				array_push($madArray,$filerlArray2);
				array_push($madArray,$filerlArray3);
			
			}
			$query_to_low = "SELECT functioncall.CalleeId 
				FROM  functioninfo, functioncall 
				WHERE  functioninfo.FileNameId = $row[0]
				AND functioninfo.id = functioncall.CallerId";
			$rs_tmp_to_low = mysql_query($query_to_low, $link);
			while($row1 = mysql_fetch_row($rs_tmp_to_low)){
				$filerlArray["from"] = "2_" . $row[0];
				$filerlArray["to"] = "3_" . $row1[0];
				array_push($madArray,$filerlArray);
			}

			$q9 = "SELECT filerelation.fromId, filename.Moduleid, virtualpathtomodules.virtualDirId FROM filerelation, filename, virtualpathtomodules WHERE filerelation.toId = $row[0] AND filename.id = filerelation.fromId AND virtualpathtomodules.moduleId = filename.moduleID";
			$rs_tmp = mysql_query($q9, $link);
			while($row1 = mysql_fetch_row($rs_tmp)){
				$filerlArray["from"] = "2_" . $row1[0];
				$filerlArray["to"] = "2_" . $row[0];		//file to file-2
				$filerlArray2["from"] = "1_" . $row1[1];
				$filerlArray2["to"] = "2_" . $row[0];		//module to file-1
				$filerlArray3["from"] = "0_" . $row1[2];
				$filerlArray3["to"] = "2_" . $row[0];		//virtualDir to file-0
				array_push($madArray,$filerlArray);
				//array_push($madArray,$filerlArray);	//should delete it??
				array_push($madArray,$filerlArray2);
				array_push($madArray,$filerlArray3);


			}

			$query_to_low_reverse = "SELECT functioncall.CallerId 
				FROM functioninfo, functioncall 
				WHERE  functioninfo.FileNameId = $row[0]
				AND functioninfo.id = functioncall.CalleeId";
			$rs_tmp_to_low = mysql_query($query_to_low_reverse, $link);
			while($row1 = mysql_fetch_row($rs_tmp_to_low)){
				$filerlArray["from"] = "3_" . $row1[0];
				$filerlArray["to"] = "2_" . $row[0];
				array_push($madArray,$filerlArray);
			}

		}
		// the file in this config but not exist in this virutalpath
		$q = "SELECT filename.Id, filename.FileName, filename.annourl FROM filename, virtualtorealpath WHERE filename.ModuleId = $ConfigID AND virtualtorealpath.RealPath = filename.FileName AND virtualtorealpath.virtualDirId != $ParentID ORDER BY weight DESC";
		$rs = mysql_query($q, $link);
		if($rs){
			while($row = mysql_fetch_row($rs)){
			$fileArray["id"] = "2_" . $row[0];
			$fileArray["name"] = $row[1];
			$fileArray["annourl"] = $row[2];
			$fileArray["type"] = 2;
			$fileArray["RecColor"] = 6;
			array_push($crazyArray,$fileArray);
			$q8 = "SELECT filerelation.toId, filename.Moduleid, virtualpathtomodules.virtualDirId FROM filerelation, filename, virtualpathtomodules WHERE filerelation.fromId = $row[0] AND filename.id = filerelation.toId AND virtualpathtomodules.moduleId = filename.moduleID";
			$rs_tmp = mysql_query($q8, $link);
			while($row1 = mysql_fetch_row($rs_tmp)){
				$filerlArray["from"] = "2_" . $row[0];
				$filerlArray["to"] = "2_" . $row1[0];	//file to file-2
				$filerlArray2["from"] = "2_" . $row[0];
				$filerlArray2["to"] = "1_" . $row1[1];	//file to module-1
				$filerlArray3["from"] = "2_" . $row[0];
				$filerlArray3["to"] = "0_" . $row1[2];	//file to virtualdir-0
				array_push($madArray,$filerlArray);
				//array_push($madArray,$filerlArray);	//should delete it??
				array_push($madArray,$filerlArray2);
				array_push($madArray,$filerlArray3);
			}

			$query_to_low = "SELECT functioncall.CalleeId 
				FROM  functioninfo, functioncall 
				WHERE  functioninfo.FileNameId = $row[0]
				AND functioninfo.id = functioncall.CallerId";
			$rs_tmp_to_low = mysql_query($query_to_low, $link);
			while($row1 = mysql_fetch_row($rs_tmp_to_low)){
				$filerlArray["from"] = "2_" . $row[0];
				$filerlArray["to"] = "3_" . $row1[0];
				array_push($madArray,$filerlArray);
			}

			$q9 = "SELECT filerelation.fromId, filename.Moduleid, virtualpathtomodules.virtualDirId FROM filerelation, filename, virtualpathtomodules WHERE filerelation.toId = $row[0] AND filename.id = filerelation.fromId AND virtualpathtomodules.moduleId = filename.moduleID";
			$rs_tmp = mysql_query($q9, $link);
			while($row1 = mysql_fetch_row($rs_tmp)){
				$filerlArray["from"] = "2_" . $row1[0];
				$filerlArray["to"] = "2_" . $row[0];		//file to file-2
				$filerlArray2["from"] = "1_" . $row1[1];
				$filerlArray2["to"] = "2_" . $row[0];		//module to file-1
				$filerlArray3["from"] = "0_" . $row1[2];
				$filerlArray3["to"] = "2_" . $row[0];		//virtualDir to file-0
				array_push($madArray,$filerlArray);
				//array_push($madArray,$filerlArray);	//should delete it??
				array_push($madArray,$filerlArray2);
				array_push($madArray,$filerlArray3);
			}

			$query_to_low_reverse = "SELECT functioncall.CallerId 
				FROM functioninfo, functioncall 
				WHERE  functioninfo.FileNameId = $row[0]
				AND functioninfo.id = functioncall.CalleeId";
			$rs_tmp_to_low = mysql_query($query_to_low_reverse, $link);
			while($row1 = mysql_fetch_row($rs_tmp_to_low)){
				$filerlArray["from"] = "3_" . $row1[0];
				$filerlArray["to"] = "2_" . $row[0];
				array_push($madArray,$filerlArray);
			}
			//end
			}
		}
		
		$relatArray = array();
		if(count($madArray)!=0){
				foreach ($madArray as $k=>$v){
					$v = join(",",$v);
					$temp[$k] = $v;
				}
				$temp = array_unique($temp);
				foreach ($temp as $k => $v){
		    		$array=explode(",",$v);
		    		$filterArray["from"] =$array[0];  
		    		$filterArray["to"] =$array[1];
		    		array_push($relatArray,$filterArray);
				}
		}
		$tmpmdArray["modules"] = $crazyArray;	//save the file info
		$tmpmdArray["relations"] = $relatArray;
		array_push($jsonArray,$tmpmdArray);
		mysql_free_result($rs);
		
		echo $callback."(".json_encode($tmpmdArray).")";
		//echo json_encode($jsonArray);	//输出json串
	}

	mutualByConfigID($link);

?>
