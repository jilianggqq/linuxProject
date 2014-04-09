/**
*根据mode的首字母 按照 a ， b ，c ，d...方式进行筛选
**/
var keys = [a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z];//筛选条件
var index = 0;//从第一个筛选条件开始 
/** 查到name的首字母为key时，返回true，否则返回false**/
function searchFilter(name){
	var first = "";//需要一个算法从name中获得首字母是什么
	var nowkey = keys[index];
	if(first.toLowerCase() == nowkey){
		return true;
	}else{
		return false;
	}
}
/**换另一个筛选条件 **/
function replacement(){
	var key = keys[index%26];
	index = (index+1)%26;
	return key;
}