<?php
    header('Content-type: text/json');
    error_reporting(E_ALL ^ E_NOTICE);   //ÏÔÊ¾³ýÈ¥ E_NOTICE Ö®ÍâµÄËùÓÐ´íÎóÐÅÏ¢ 
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
    function ConfigInfo($link){
        $callback = $_GET['jsoncallback'];      
        $ConfigID = $_GET["ConfigID"];
        $jsonArray = array();
        $jsonArray["info"] = array();
        $jsonArray["menu"] = array();
        $q ="SELECT info,ParentNodeId FROM module WHERE Id=$ConfigID";
        $rs = mysql_query($q, $link);
        if($rs){
           $row = mysql_fetch_row($rs);
           array_push($jsonArray["info"],$row[0]);
           $i = $row[1];
           while($i != -1){
            $menu_query = "SELECT ModuleName,ParentNodeId FROM module WHERE Id=$i";
            $menu_result = mysql_query($menu_query,$link);
            $menu_data = mysql_fetch_row($menu_result);
            array_push($jsonArray["menu"],$menu_data[0]);
            $i = $menu_data[1];
           }
        }
        echo $callback."(".json_encode($jsonArray).")";

    }
    ConfigInfo($link);
?>