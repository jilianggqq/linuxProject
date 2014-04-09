/**
 * raphaep 箭头实现方案
 * 
 * 
 */

//获取组成箭头的三条线段的路径
function getArr(x1, y1, x2, y2, size) {
	var angle = Raphael.angle(x1, y1, x2, y2);//得到两点之间的角度
	var a45 = Raphael.rad(angle - 45);//角度转换成弧度
	var a45m = Raphael.rad(angle + 45);
	var x2a = x2 + Math.cos(a45) * size;
	var y2a = y2 + Math.sin(a45) * size;
	var x2b = x2 + Math.cos(a45m) * size;
	var y2b = y2 + Math.sin(a45m) * size;
	var result = [ "M", x1, y1, "L", x2, y2, "L", x2a, y2a, "M", x2, y2, "L", x2b, y2b ];
	return result;
}

//确定起点和终点
function getStartEnd(obj1, obj2) {
	var bb1 = obj1.getBBox(), bb2 = obj2.getBBox();
	var p = [ {
		x : bb1.x + bb1.width / 2,
		y : bb1.y - 1
	}, {
		x : bb1.x + bb1.width / 2,
		y : bb1.y + bb1.height + 1
	}, {
		x : bb1.x - 1,
		y : bb1.y + bb1.height / 2
	}, {
		x : bb1.x + bb1.width + 1,
		y : bb1.y + bb1.height / 2
	}, {
		x : bb2.x + bb2.width / 2,
		y : bb2.y - 1
	}, {
		x : bb2.x + bb2.width / 2,
		y : bb2.y + bb2.height + 1
	}, {
		x : bb2.x - 1,
		y : bb2.y + bb2.height / 2
	}, {
		x : bb2.x + bb2.width + 1,
		y : bb2.y + bb2.height / 2
	} ];
	var d = {}, dis = [];
	for ( var i = 0; i < 4; i++) {
		for ( var j = 4; j < 8; j++) {
			var dx = Math.abs(p[i].x - p[j].x), dy = Math.abs(p[i].y - p[j].y);
			if ((i == j - 4)
					|| (((i != 3 && j != 6) || p[i].x < p[j].x)
							&& ((i != 2 && j != 7) || p[i].x > p[j].x)
							&& ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
				dis.push(dx + dy);
				d[dis[dis.length - 1]] = [ i, j ];
			}
		}
	}
	if (dis.length == 0) {
		var res = [ 0, 4 ];
	} else {
		res = d[Math.min.apply(Math, dis)];
	}
	var result = {};
	result.start = {};
	result.end = {};
	result.start.x = p[res[0]].x;
	result.start.y = p[res[0]].y;
	result.end.x = p[res[1]].x;
	result.end.y = p[res[1]].y;
	return result;
}

//确定起点和终点
function calcStartEnd(obj1, obj2) {
	var bb1 = obj1.getBBox(), bb2 = obj2.getBBox();
	var bc1 = {x: (bb1.x + bb1.width / 2), y: (bb1.y + bb1.height / 2)};
	var bc2 = {x: (bb2.x + bb2.width / 2), y: (bb2.y + bb2.height / 2)};
	var shifting = 4;
	
	//obj2 和 obj1 重叠
	if(Math.abs(bc2.x - bc1.x) <= (bb1.width + bb2.width) / 2
			&& Math.abs(bc2.y - bc1.y) <= (bb1.height + bb2.height) / 2) {
		return null;
	}
	
	var result = {};
	result.start = {x: 0, y: 0};
	result.end = {x: 0, y: 0};
	
	//obj2 在 obj1右侧
	if(bb2.x > bb1.x2) {
		result.start.x = bc1.x;
		result.end.x = bc2.x;
		//obj2 在 obj1 右上角
		if(bb2.y2 < bb1.y) {
			result.start.y = bc1.y;
			result.end.y = bc2.y;
		}
		//obj2 在 obj1 右下角
		else if(bb2.y > bb1.y2) {
			result.start.y = bc1.y;
			result.end.y = bc2.y;
		}
		//obj2 在 obj1 正右方
		else {
			result.start.y = result.end.y = 
				(Math.max(bb1.y, bb2.y) + Math.min(bb1.y2, bb2.y2)) / 2;
			result.start.y = bc1.y;
			result.end.y = bc2.y;
		}
	}
	//obj2 在 obj1左侧
	else if(bb2.x2 < bb1.x) {
		result.start.x = bc1.x;
		result.end.x = bc2.x;
		//obj2 在 obj1 左上角
		if(bb2.y2 < bb1.y) {
			result.start.y = bc1.y;
			result.end.y = bc2.y;
		}
		//obj2 在 obj1 左下角
		else if(bb2.y > bb1.y2) {
			result.start.y = bc1.y;
			result.end.y = bc2.y;
		}
		//obj2 在 obj1 正左方
		else {
			result.start.y = result.end.y = 
				(Math.max(bb1.y, bb2.y) + Math.min(bb1.y2, bb2.y2)) / 2;
			result.start.y = bc1.y;
			result.end.y = bc2.y;
		}
	}
	else {
		result.start.x = result.end.x = 
			(Math.max(bb1.x, bb2.x) + Math.min(bb1.x2, bb2.x2)) / 2;
		result.start.x = bc1.x;
		result.end.x = bc2.x;
		
		//obj2 在 obj1正上方
		if(bb2.y2 < bb1.y) {
			result.start.y = bc1.y;
			result.end.y = bc2.y;
		}
		//obj2 在 obj1正下方
		else {
			result.start.y = bc1.y;
			result.end.y = bc2.y;
		}
	}
	return result;
}

/**
 * 在Raphael中添加绘制箭头的功能
 * 
 * @param obj {obj1: 第一个矩形元素, obj2: 第二个矩形元素}
 */
Raphael.fn.arrow = function(obj, attributes) {
	//var point = getStartEnd(obj.obj1, obj.obj2);
	var point = calcStartEnd(obj.obj1, obj.obj2);
	if(point == null) {
		return null;
	}
	var path1 = getArr(point.start.x, point.start.y, point.end.x, point.end.y, 8);
	if (obj.arrPath) {
		obj.arrPath.attr({
			path : path1
		});
	} else {
		obj.arrPath = this.path(path1);
		if(attributes) {
			obj.arrPath.attr(attributes);
		}
	}
	return obj.arrPath;
};