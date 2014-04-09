<?php
	header('Content-type: text/json');
	error_reporting(E_ALL ^ E_NOTICE);	 //ÏÔÊ¾³ýÈ¥ E_NOTICE Ö®ÍâµÄËùÓÐ´íÎóÐÅÏ¢ 
	set_time_limit(0);
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
	


	function mutualByVirDirID($link){
		
		$callback = $_GET['jsoncallback'];	
		$VirDirID = $_GET["VirDirID"];		//´ÓÇ°Ì¨È¡Öµ,½Ó¿ÚÊÇVirDirID
		 //$VirDirID = 28;

		//È¡µÃÄ£¿éµÄÊý¾Ý¼¯
		$q1 = "SELECT virtualpathtomodules.ModuleId, module.ModuleName
			FROM  virtualpathtomodules, module
			WHERE virtualpathtomodules.virtualDirId = '$VirDirID'
			and virtualpathtomodules.moduleID = module.Id
			ORDER BY module.weight DESC";
		$rs1 = mysql_query($q1, $link);
		$jsonarray = array();	
		$moduArray = array();	//moduleArray
		
		if(!$rs1){
			die("Valid result1!");
		}
		while($row = mysql_fetch_row($rs1)){

	  		$mdtmpArray = array();	 //moduleTemporaryArray¼òÐ´
			$mdtmpArray["id"] = "1_" . $row[0];
			$mdtmpArray["name"] = $row[1];
			$mdtmpArray['parentid'] = $VirDirID;
			$mdtmpArray["type"] = 1;	//'1':module '0':virtualdir '2':file
			array_push($moduArray,$mdtmpArray);
		}

		//moduleralation
		$q2 = "SELECT modulerelation.ModuleId, modulerelation.LogicRelation, modulerelation.RelationType
			FROM  virtualpathtomodules, modulerelation, module
			WHERE virtualpathtomodules.virtualDirId = '$VirDirID'
			and virtualpathtomodules.moduleID = module.Id
			and module.Id = modulerelation.ModuleId";

		$rs2 = mysql_query($q2, $link);
		$mdrlArray = array(); 	//moduleRelationArrayµÄ¼òÐ´

		if(!$rs2){
			die("Valid result!");
		}

		while($row = mysql_fetch_row($rs2)){
			
	  		$rltmpArray = array();	//relationTemporaryArray¼òÐ´
			$string = $row[1];
			$str = preg_replace('(!)', '', 
			       	preg_replace('(&&|\|\|)', ',', 
				 preg_replace('(\(|\))', '', 
				  preg_replace('( )', '', $string))));	//½«¡®&&¡¯¡®||¡¯Ìæ»»³É¡®£¬¡¯£¬É¾³ý¡®!¡¯
			

			if(strpos($str,",")){
				
			       	$rlArray = array();	
				$rlArray = explode(",", $str);	//·Ö¸î´¦ÀíºóµÄlogicrelation£¬½«modulename´æÈëÊý×é
				$num = count($rlArray);
				
				for($i = 0 ;$i < $num; $i++){	//·Ö±ðÕÒµ½Êý×éÖÐmodulename¶ÔÓ¦µÄmoduleid
					 
					$q3 = "SELECT Id FROM module WHERE ModuleName ='$rlArray[$i]'";
					
					$rs_tmp = mysql_query($q3, $link);
					
					if(!$rs_tmp){
						die("rs_tmp Valid result!");
					}
					if($rlArray[$i]){
						
						while($tmp = mysql_fetch_row($rs_tmp)){
							
							$rltmpArray["from"] = "1_" . $row[0];
							$rltmpArray["logicrelation"] = $row[1];

							$rltmpArray["to"] = "1_" . $tmp[0];
							$rltmpArray["type"] = $row[2];

							array_push($mdrlArray,$rltmpArray);
						}
						
					}
					
				}	
			}else{
				$q4 = "SELECT Id FROM module WHERE ModuleName = '$str'";
				$rs_tmp = mysql_query($q4, $link);
				if(!$rs_tmp){
					die("rs_tmp Valid result!");
				}
				//if($str){ 		
					while($tmp = mysql_fetch_row($rs_tmp)){
						if($row[2] == 2){
							//the module depenance cause by menuconfig+if which relationtype=2
							$rltmpArray["from"] = "1_" . $tmp[0];
							$rltmpArray["logicrelation"] = NULL;
							$rltmpArray["to"] = "1_" . $row[0];
							$rltmpArray["type"] = $row[2];
						}
						else{
							$rltmpArray["from"] = "1_" . $row[0];
							$rltmpArray["logicrelation"] = NULL;
							$rltmpArray["to"] = "1_" . $tmp[0];
							$rltmpArray["type"] = $row[2];
						}
						array_push($mdrlArray,$rltmpArray);
					}
					
				//}
				
							
			}
					
		}
		mysql_free_result($rs2);
		mysql_free_result($rs_tmp);
		//È¡µÃ´ÓÆäËûmoduleµ½VirDirIDµÄÄ£¿é¹ØÏµ  reverse to find the relationship of modules
		$q5 = "SELECT  virtualpathtomodules.moduleID, module.ModuleName 
			FROM  virtualpathtomodules, module
			WHERE virtualpathtomodules.virtualDirId = '$VirDirID'
			and virtualpathtomodules.moduleID = module.Id";

		$rs5 = mysql_query($q5, $link);				//@@use rs1 is enough????
		$torltmpArray = array();
		$tomdtmpArray1 = array();
		if(!$rs5){
			die("Valid result!");
		}
		$reverseArray = array();
		while($row = mysql_fetch_row($rs5)){
			
			$string = $row[1];
						
			$q6 = "SELECT modulerelation.ModuleId, modulerelation.RelationType
				FROM modulerelation 
				WHERE LogicRelation LIKE '%$string%'";
			$rs6 = mysql_query($q6, $link);
			if(!$rs6){
				die("Valid result!");
			}
			$array = array();
		
			while($row1 = mysql_fetch_row($rs6)){
				
				array_push($array,$row1);
			}					
			//$array = array_unique($array);//È¡³öÖØ¸´
			
			foreach($array as $arrtmp){          
				if($arrtmp[1] == 2){
					$torltmpArray["from"] = "1_" . $row[0];
					$torltmpArray["logicrelation"] = NULL;
					$torltmpArray["to"] = "1_" . $arrtmp[0];
					$torltmpArray["type"] = $arrtmp[1];
				}else{
					$torltmpArray["from"] = "1_" . $arrtmp[0];
					$torltmpArray["logicrelation"] = NULL;
					$torltmpArray["to"] = "1_" . $row[0];
					$torltmpArray["type"] = $arrtmp[1];
				}
				array_push($reverseArray,$torltmpArray);
			}
		}
		mysql_free_result($rs1);
		mysql_free_result($rs5);
		mysql_free_result($rs6);
	$module_to_high_relation = array();

	if(count($reverseArray)!=0){
		//deal with reverse relation (the foreign virtuldir to the config of current virtuldir) 
		foreach ($reverseArray as $k=>$v){
			$v = join(",",$v);
			$temp[$k] = $v;
		}
		$temp = array_unique($temp);
		foreach ($temp as $k => $v){
		    $array=explode(",",$v);
		    $reverseTemp[$k]["from"] =$array[0];  
		    $reverseTemp[$k]["logicrelation"] =$array[1];
		    $reverseTemp[$k]["to"] =$array[2];
		    $reverseTemp[$k]["type"] = $array[3];
		}
		sort($reverseTemp);
		$i_max = count($reverseTemp);
		for($i = 0 ;$i < $i_max;$i++){
			$jsonArray["relations"][] = $reverseTemp[$i]; //add the reverse data to the JSON
			$vid  = $reverseTemp[$i]["from"];	
			$vid = substr($vid,2,strlen($vid));		
			$reverseq = "SELECT virtualpathtomodules.virtualDirId
				FROM virtualpathtomodules
				WHERE virtualpathtomodules.moduleID = $vid
				AND virtualpathtomodules.virtualDirId != $VirDirID"; 
			$rs_tmp = mysql_query($reverseq, $link);
			if(!$rs_tmp){
				continue;
			}  
			while($row = mysql_fetch_row($rs_tmp)){
				$tmp = array();
				$tmp ["from"] = "0_" . $row[0];
				$tmp ["logicrelation"] = NULL;//$reverseTemp[$i]["logicrelation"];
				$tmp ["to"] = $reverseTemp[$i]["to"];
				$tmp ["type"] = 3;
				//$jsonArray["relations"][] = $tmp;
				array_push($module_to_high_relation, $tmp);
			}	 
		}
	}
	/*
	if(count($moduArray)!=0){
		foreach ($moduArray as $k=>$v){
			$v = join(",",$v);
			$temp[$k] = $v;
		}
		$temp = array_unique($temp);
		foreach ($temp as $k => $v){
		    $array=explode(",",$v);
		    $temp2[$k]["id"] =$array[0];  
		    $temp2[$k]["name"] =$array[1];
		    $temp2[$k]["type"] =$array[2];
		}
		//sort($temp2);
		$i_max = count($temp2);
		for($i = 0 ;$i < $i_max;$i++){
			$jsonArray["modules"][] = $temp2[$i];
		}
	}*/
	//$jsonArray["modules"] = $moduArray;

	if(count($mdrlArray)!=0){
		foreach ($mdrlArray as $k=>$v){
			$v = join(",",$v);
			$temp[$k] = $v;
		}
		$temp = array_unique($temp);
		foreach ($temp as $k => $v){
		    $array=explode(",",$v);
		    $temp3[$k]["from"] =$array[0];  
		    $temp3[$k]["logicrelation"] =$array[1];
		    $temp3[$k]["to"] =$array[2];
		    $temp3[$k]["type"] = $array[3];
		}
		sort($temp3);
		$i_max = count($temp3);
		for($i = 0 ;$i < $i_max;$i++){
			$vid  = $temp3[$i]["to"];			//@@the reverse relation 'to' is the current virtualDirID
			$vid = substr($vid,2,strlen($vid));
			$q8 = "SELECT virtualpathtomodules.virtualDirId
				FROM virtualpathtomodules
				WHERE virtualpathtomodules.moduleID = $vid
				AND virtualpathtomodules.virtualDirId != $VirDirID";   //@@virtualpathtomodules.moduleID = $vid???
			$rs_tmp = mysql_query($q8, $link);
			if(!$rs_tmp){
				continue;
			} 
			while($row = mysql_fetch_row($rs_tmp)){
				$tmp = array();
				$tmp ["from"] = $temp3[$i]["from"];
				$tmp ["logicrelation"] = NULL;//$temp3[$i]["logicrelation"];
				$tmp ["to"] = "0_" . $row[0];
				$tmp ["type"] = 3;
				//$jsonArray["relations"][] = $tmp;
				array_push($module_to_high_relation, $tmp);
			}
			$jsonArray["relations"][] = $temp3[$i];			 
		}
	}
	if(count($module_to_high_relation)!=0){
		foreach ($module_to_high_relation as $k=>$v){
			$v = join(",",$v);
			$temp[$k] = $v;
		}
		$temp = array_unique($temp);
		foreach ($temp as $k => $v){
		    $array=explode(",",$v);
		    $temp3[$k]["from"] =$array[0];  
		    $temp3[$k]["logicrelation"] =$array[1];
		    $temp3[$k]["to"] =$array[2];
		    $temp3[$k]["type"] = $array[3];
		}
		$i_max = count($temp3);
		for($i = 0 ;$i < $i_max;$i++){
			if($temp3[$i]){
			$jsonArray["relations"][] = $temp3[$i];
			}			 
		}
	}

	$module_to_low_relation = array();
	//deal with 1_ to 2_  and 1_ and 3_
	$q1 = "SELECT  virtualpathtomodules.moduleID 
			FROM  virtualpathtomodules, module
			WHERE virtualpathtomodules.virtualDirId = '$VirDirID'
			and virtualpathtomodules.moduleID = module.Id";
	$rs5 = mysql_query($q5, $link);
	while($row = mysql_fetch_row($rs5)){

		$q2 = "SELECT functioncall.CalleeId, functioninfo.FileNameId
				FROM functioncall, functioninfo
				WHERE functioncall.CallerModuleId='$row[0]'
				AND functioncall.CalleeId = functioninfo.Id";
		$rs_tmp = mysql_query($q2,$link);
		while($row_result = mysql_fetch_row($rs_tmp)){
			$tmp ["from"] = "1_" . $row[0];
			$tmp ["logicrelation"] = NULL;
			$tmp ["to"] = "2_" . $row_result[1];
			$tmp ["type"] = 3;
			array_push($module_to_low_relation,$tmp);
			$tmp ["to"] = "3_" . $row_result[0];
			array_push($module_to_low_relation,$tmp);
		}

		$q2 = "SELECT functioncall.CallerId, functioninfo.FileNameId
				FROM functioncall, functioninfo
				WHERE functioncall.CalleeModuleId='$row[0]'
				AND functioncall.CallerId = functioninfo.Id";
		$rs_tmp = mysql_query($q2,$link);
		while($row_result = mysql_fetch_row($rs_tmp)){
			$tmp ["from"] = "2_" . $row_result[1];
			$tmp ["logicrelation"] = NULL;
			$tmp ["to"] = "1_" . $row[0];
			$tmp ["type"] = 3;
			array_push($module_to_low_relation,$tmp);
			$tmp ["from"] = "3_" . $row_result[0];
			array_push($module_to_low_relation, $tmp);
		}

	}


	if(count($module_to_low_relation)!=0){
		foreach ($module_to_low_relation as $k=>$v){
			$v = join(",",$v);
			$temp[$k] = $v;
		}
		$temp = array_unique($temp);
		foreach ($temp as $k => $v){
		    $array=explode(",",$v);
		    $temp3[$k]["from"] =$array[0];  
		    $temp3[$k]["logicrelation"] =$array[1];
		    $temp3[$k]["to"] =$array[2];
		    $temp3[$k]["type"] = $array[3];
		}
		$i_max = count($temp3);
		for($i = 0 ;$i < $i_max;$i++){
			if($temp3[$i]){
			$jsonArray["relations"][] = $temp3[$i];
			}			 
		}
	}
	$jsonArray["modules"] = $moduArray;
		
		echo $callback."(".json_encode($jsonArray).")";
	    //    	echo json_encode($moduArray);	//Êä³öjson´®
		
	}

	mutualByVirDirID($link);

?>
