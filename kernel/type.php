<?php
	header('Content-type: text/json');
	error_reporting(E_ALL ^ E_NOTICE);	 //��ʾ��ȥ E_NOTICE ֮������д�����Ϣ 
	include("config.php");
	$link = mysql_connect($db_host,$db_username,$db_password);
	mysql_query('set names utf8');
	//���ݿ��Ƿ�����
	if(!$link) echo "link unsuccess!"; 
	//else echo "link success!\n";
	$currentArch = $_GET['arch'];
	if ($currentArch == "x86"){
	
		mysql_select_db($x86_db , $link);
	}  //choice the x86 db
	if ($currentArch == "arm"){
		mysql_select_db($arm_db ,$link);
	}

	function mutualByTypeID($link){
		
		$callback = $_GET['jsoncallback'];	
		$FileID = $_GET["TypeID"];		//��ǰ̨ȡֵ,�ӿ���TypeID
		//$TypeID = 1;
		

		//ȡ�ú�����ϵ�����ݼ�
		
		$q = "SELECT typeinfotemp.Id, typeinfotemp.TypeName, typeinfotemp.Typekind , typeinfotemp.annourl
			FROM typeinfotemp
			WHERE typeinfotemp.FileNameId = $FileID";	
		
		$rs = mysql_query($q, $link);
		$jsonArray = array();
		
		$relaArray = array();
		$crazyArray = array();
		$madArray = array();
		$tmprelaArray = array();

		$midtmprelaArray = array();
		
		if($rs){
			
			while($row = mysql_fetch_row($rs)){
		
				$relaArray["id"] = "3_" . $row[0];
				$relaArray["name"] = $row[1];
				$relaArray["type"] = 5;//$row[2];
				$relaArray["annourl"] = $row[3];
		
				array_push($crazyArray,$relaArray);	
			}
		}
		$midtmprelaArray["modules"] = $crazyArray;

		$q1 = "SELECT typecall.ReferId, typecall.RefereeId
			FROM typecall 
			WHERE typecall.ReferId = $FileID or typecall.RefereeId = $FileID";	
		
		$rs1 = mysql_query($q1, $link);
		if($rs1){

			while($row1 = mysql_fetch_row($rs1)){
		
				$tmprelaArray["from"] = "3_" . $row1[0];
				$tmprelaArray["to"] = "3_" . $row1[1];
		
				array_push($madArray,$tmprelaArray);	
			}	
		}
		$midtmprelaArray["relations"] = $madArray;
	        
		$jsonArray = $midtmprelaArray;
		mysql_free_result($rs);

		echo $callback."(".json_encode($jsonArray).")";
		// echo json_encode($jsonArray);	//���json��
	}
	


	mutualByTypeID($link);
	
	
?>
