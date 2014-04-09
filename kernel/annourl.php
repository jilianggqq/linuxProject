<?php

// header('Content-type: text/json');
error_reporting( E_ALL ^ E_NOTICE );
include "config.php";
$con = mysql_connect( $db_host, $db_username, $db_password );
mysql_query( 'set names utf8' );

if ( !$con ) {
	die( 'Could not connect: ' . mysql_error() );
}


$currentArch = $_GET['arch'];
//choice the x86 db
if ( $currentArch == "arm" ) {
	$select = mysql_select_db( $x86_db, $con );
} else {
	$select = mysql_select_db( $arm_db, $con );
}

if ( !$select ) {
	die( 'Select nothing: ' . mysql_error() );
}

$id = $_GET['id'];
$type =$_GET['type'];
$sql = '';

if ( $type == 2 ) {
	// this for file to jump
	$sql = "SELECT annourl FROM filename WHERE filename.id = $id";
	// echo $sql;

} else if ( $type == 3 ) {
		// this for function_exists(function_name) to jump
		$sql = "SELECT annourl FROM functioninfo WHERE functioninfo.id = $id";

	} else if ( $type == 5 ) {
		// this for type to jump
		$sql = "SELECT annourl FROM typeinfo WHERE typeinfo.id = $id";
	} else if ( $type == 1 ) {
		$sql = "SELECT
					DirectoryPath
				FROM
					linuxkernel.`directory`,
					linuxkernel.module
				WHERE
					`directory`.Id = linuxkernel.module.DirectoryPathId
				AND linuxkernel.module.Id = $id";
	}

// $sql = "SELECT * From filename LIMIT 0,30";
$rs = mysql_query( $sql, $con );
//echo $sql;
if ( !$rs ) {
	die( "Valid result!" );
}
if ( $type != 1 ) {
	while ( $row = mysql_fetch_row( $rs ) ) {
		$target = $row[0];
	}
} else if ( $type == 1 ) {
		while ( $row = mysql_fetch_row( $rs ) ) {
			$target = $row[0];
		}
		$target = "http://124.16.141.171:81/mediawiki/index.php/".$target;
		// echo $target;
	}


// if ( $target == null || !startsWith($target,"http://")) {
//  echo "<script>window.close();</script>"
// }
header( "Location: $target" );
// echo $target;
?>
