/**
 * 对 svg 图像的缩放,拖拽,平移等基本操作
 * 
 * 
 */

//svg 根节点
var svgDom = null;

/*  Constants: */
var svgViewBoxWidth = 1200; // The original width value of the viewBox attribute for the svg element.
var svgViewBoxHeight = 1000; // The original height value of the viewBox attribute for the svg element.
var leftArrow = 37; // The numeric code for the left arrow key.
var upArrow = 38;
var rightArrow = 39;
var downArrow = 40;
var panRate = 10; // Number of pixels to pan per key press.		
var zoomRate = 1.1; // Must be greater than 1. Increase this value for faster zooming (i.e., less granularity).
var currentZoomFactor = 1.0;
var currentRate = 1.0;

/**
 * 拖曳处理
 */
var dragHandler = {
	x1 : 0,
	y1 : 0,
	x2 : 0,
	y2 : 0
};

dragHandler.dragstart = function(evt) {
	//console.log("dragstart");
	dragHandler.x1 = evt.screenX;
	dragHandler.y1 = evt.screenY;
};

dragHandler.dragend = function(evt) {
	//console.log("dragend");
	dragHandler.x2 = evt.screenX;
	dragHandler.y2 = evt.screenY;

	var viewBox = svgDom.getAttribute('viewBox');
	var viewBoxValues = viewBox.split(' ');

	viewBoxValues[0] = parseFloat(viewBoxValues[0]);
	viewBoxValues[1] = parseFloat(viewBoxValues[1]);

	viewBoxValues[0] -= (dragHandler.x2 - dragHandler.x1);
	viewBoxValues[1] -= (dragHandler.y2 - dragHandler.y1);

	svgDom.setAttribute('viewBox', viewBoxValues.join(' '));
};

/**
 * 处理按键事件，当按键为 上、下、左、右 箭头键时，对svg进行相应的平移操作
 */
function processKeyPress(evt) {
	var viewBox = svgDom.getAttribute('viewBox'); // Grab the object representing the SVG element's viewBox attribute.
	var viewBoxValues = viewBox.split(' '); // Create an array and insert each individual view box attribute value (assume they're seperated by a single whitespace character).

	viewBoxValues[0] = parseFloat(viewBoxValues[0]); // Convert string "numeric" values to actual numeric values.
	viewBoxValues[1] = parseFloat(viewBoxValues[1]);

	switch (evt.keyCode) {
	case leftArrow:
		viewBoxValues[0] += panRate; // Increase the x-coordinate value of the viewBox attribute to pan right.
		break;
	case rightArrow:
		viewBoxValues[0] -= panRate; // Decrease the x-coordinate value of the viewBox attribute to pan left.
		break;
	case upArrow:
		viewBoxValues[1] += panRate; // Increase the y-coordinate value of the viewBox attribute to pan down.
		break;
	case downArrow:
		viewBoxValues[1] -= panRate; // Decrease the y-coordinate value of the viewBox attribute to pan up.      
		break;
	} // switch

	svgDom.setAttribute('viewBox', viewBoxValues.join(' ')); // Convert the viewBoxValues array into a string with a white space character between the given values.
}

/**
 * 缩放svg
 */
function zoom(zoomType) {
	var viewBox = svgDom.getAttribute('viewBox'); // Grab the object representing the SVG element's viewBox attribute.
	var viewBoxValues = viewBox.split(' '); // Create an array and insert each individual view box attribute value (assume they're seperated by a single whitespace character).

	viewBoxValues[2] = parseFloat(viewBoxValues[2]); // Convert string "numeric" values to actual numeric values.
	viewBoxValues[3] = parseFloat(viewBoxValues[3]);

	if (zoomType == 'zoomIn') {
		viewBoxValues[2] /= zoomRate; // Decrease the width and height attributes of the viewBox attribute to zoom in.
		viewBoxValues[3] /= zoomRate;
		currentRate /=zoomRate;
	} else if (zoomType == 'zoomOut') {
		viewBoxValues[2] *= zoomRate; // Increase the width and height attributes of the viewBox attribute to zoom out.
		viewBoxValues[3] *= zoomRate;
		currentRate *=zoomRate;
	} else {
		alert("function zoom(zoomType) given invalid zoomType parameter.");
	}

	svgDom.setAttribute('viewBox', viewBoxValues.join(' ')); // Convert the viewBoxValues array into a string with a white space character between the given values.

	currentZoomFactor = svgViewBoxWidth / viewBoxValues[2]; // Calculates the current zoom factor, could have just as easily used svgViewBoxHeight.      
/*	var groups = svgDom.getElementsByTagName('g');
	var g = null;
	var l = 0;
	for ( var i = 0; i < groups.length; i++) {
		g = groups[i];
		if (g.getAttribute('id') && /^level_\d+$/.test(g.getAttribute('id'))) {
			l = parseInt(g.getAttribute('id').replace(/^level_/, ''), 10);
			if (l > 0) {
				l = parseFloat(l) / 10 + 1.0;
				if (currentZoomFactor >= l) {
					g.setAttribute('visibility', 'visible');
				} else {
					g.setAttribute('visibility', 'hidden');
				}
			}
		}
	}*/

	var newText = currentZoomFactor.toFixed(3); // Create a generic new text node object.
	$("#currentZoomFactorText").text(newText);
}

/**
 * 处理鼠标滚轮事件, firefox不支持
 */
function zoomViaMouseWheel(mouseWheelEvent) {
	if (mouseWheelEvent.wheelDelta > 0) {
		zoom('zoomIn');
	} else {
		zoom('zoomOut');
	}

	/* When the mouse is over the webpage, don't let the mouse wheel scroll the entire webpage: */
	mouseWheelEvent.cancelBubble = true;
	return false;
}

/**
 * 用于窗口大小改变时的自动布局
 */
function autoLayout(evt) {
	var northDom = document.getElementById('north');
	var westDom = document.getElementById('west');
	var centerDom = document.getElementById('center');
	var southDom = document.getElementById('south');

	var w = document.documentElement.clientWidth - westDom.offsetWidth;
	var h = document.documentElement.clientHeight - northDom.offsetHeight - southDom.offsetHeight;

	centerDom.style.width = w + 'px';
	centerDom.style.height = h + 'px';
	westDom.style.height = h + 'px';

	var treeHeight = $("#west").height() - $("#zoombar").height() 
						- $("#radioset").height() - $("#toolbar").height() - 25;
	$("#tree").height(treeHeight + "px");
	
	if (evt && 'load' == evt.type) {
/*		if (svgViewBoxWidth < w) {
			svgViewBoxWidth = w;
		}

		if (svgViewBoxHeight < h) {
			svgViewBoxHeight = h;
		}*/

		//mapPaper.setSize(svgViewBoxWidth, svgViewBoxHeight);
		//mapPaper.setViewBox(0, 0, svgViewBoxWidth, svgViewBoxHeight, true);
		svgDom.setAttributeNS (null, "width", svgViewBoxWidth);
		svgDom.setAttributeNS (null, "height", svgViewBoxHeight);
		svgDom.setAttribute('viewBox', "0 0 " + svgViewBoxWidth + " " + svgViewBoxHeight);
		
		var gtags = ['rect', 'circle', 'ellipse', 'line', 'text'];
		for(var i = 0; i < gtags.length; i++) {
			percent2px(svgDom.getElementsByTagName(gtags[i]), svgViewBoxWidth, svgViewBoxHeight);
		}
	}
}

/**
 * 将x,y,width,height的值由百分比转换为像素值
 */
function percent2px(arr, w, h) {
	var attx = ['x', 'width', 'x1', 'x2', 'cx', 'rx'];
	var atty = ['y', 'height', 'y1', 'y2', 'cy', 'ry'];
	var n;
	var a;
	var j;
	
	for ( var i = 0; i < arr.length; i++) {
		n = arr[i];

		for( j = 0; j< attx.length; j++) {
			a = attx[j];
			if (n.getAttribute(a) && /%$/.test(n.getAttribute(a))) {
				n.setAttribute(a, parseFloat(n.getAttribute(a).replace(/%$/, '')) * w / 100);
			}
		}
		
		for( j = 0; j< atty.length; j++) {
			a = atty[j];
			if (n.getAttribute(a) && /%$/.test(n.getAttribute(a))) {
				n.setAttribute(a, parseFloat(n.getAttribute(a).replace(/%$/, '')) * h / 100);
			}
		}
	}
}

function per2px(per, l) {
	if("string" == typeof(per) && /%$/.test(per)) {
		return parseFloat(per.replace(/%$/, '')) * l / 100;
	}
	
	return per;
}