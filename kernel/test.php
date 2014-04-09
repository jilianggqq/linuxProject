<?php
header( 'Content-type: text/json' );
error_reporting( E_ALL ^ E_NOTICE );
set_time_limit( 0 );

$link = mysql_connect( "localhost:3306", "root", "123456" );
mysql_query( 'set names utf8' );
//if(!$link) echo "link unsuccess!";
//else echo "link success!\n";

mysql_select_db( "kernel", $link );  //choice the x86 db



function insertTheRelation() {
	$link = mysql_connect( "localhost:3306", "root", "123456" );
	$formid = 123;
	$toid = 4435;
	$q = "SELECT * FROM module WHERE Id=1";
	$rs = mysql_query( $q, $link );
	$row = mysql_fetch_row( $rs );
	echo $row[2];
	$q = "INSERT INTO basevirtualrelation (FromId, ToId) VALUES ('".$formid."', '".$toid."')";
	$rs = mysql_query( $q, $link );
	if ( !$rs ) {
		echo "insert failed";
	}
	else {
		echo "insert succeed";
	}
}
insertTheRelation();
?>
