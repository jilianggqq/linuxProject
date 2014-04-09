/**
 * 模块树形菜单
 * 
 * 
 * 
 */

/*
 * 过滤器: 从ajax响应消息中过滤数据, 生成子节点数组
 * 
 * @param treeId
 * @param parentNode
 * @param resp
 * @returns
 */
function treeFilter(treeId, parentNode, resp) {
	if (!resp) return null;
	
	var layers = resp.map.layers;
	
	var level = 0;
	if(parentNode) {
		level = parentNode.level + 1;
	}
	
	var modules = [];
	for(var i=0; i<layers.length; i++) {
		if(level == layers[i].level) {
			modules = layers[i].modules;
			break;
		}
	}
	
	var childNodes = [];
	for (var j=0; j<modules.length; j++) {
		var m = modules[j];
		var flag = false;
		if(level == 0) {
			flag = true;
		}
		else if(parentNode && m.parentid == parentNode.id) {
			flag = true;
		}
		
		if(flag) {
			childNodes.push({
				"id": m.id,
				"pId": m.parentId,
				"name": m.name,
				"isParent": true
			});
		}
	}
	return childNodes;
}

/**
 * 处理树形菜单点击事件
 * 
 * @param event
 * @param treeId
 * @param treeNode
 */
function treeOnClick(event, treeId, treeNode) {
	var moduleId = treeNode.id;
	var viewBox = svgDom.getAttribute("viewBox").split(" ");
	var focusBBox = mapPaper.getById("r_" + moduleId).getBBox();
	var rec = mapPaper.rect(viewBox[0], viewBox[1], viewBox[2], viewBox[3]);
	rec.attr({
		stroke: "yellow", "stroke-width": 4, "stroke-opacity": 0.5,
		"fill": "silver", "fill-opacity": 0.5, 
		"stroke-linecap": "round", "stroke-linejoin": "round"
	});
	rec.animate({"x": focusBBox.x, "y": focusBBox.y, 
					"width": focusBBox.width, "height": focusBBox.height}, 
		1500, 
		">", 
		function () {
			this.remove();
		}
	);
}

/**
 * 处理节点展开事件
 * @param event
 * @param treeId
 * @param treeNode
 */
function treeOnExpand(event, treeId, treeNode) {
   var tree = $.fn.zTree.getZTreeObj(treeId);
   var children = [];
   if(treeNode) {
	   children = treeNode.children;
   }
   else {
	   children = tree.getNodesByFilter(function (node) {
		   return (node.level == 0);
	   });
   }
   for(var i=0; i<children.length; i++) {
	   tree.expandNode(children[i], true);
   }
};

/**
 * 查询节点并显示
 * @param txt
 */
function searchNode(txt) {
	if(txt == null || txt == "") {
		return;
	}
	txt = txt.replace(/^\s+/, "").replace(/\s+$/, "");
	if(txt == "") {
		return;
	}
	
	var tree = $.fn.zTree.getZTreeObj("treemenu");
	//tree.expandAll(false);
	var nodes = tree.getNodesByParamFuzzy("name", txt, null);
	
	for(var i=0; i<nodes.length; i++) {
		var n = nodes[i];
		var p = n.getParentNode();
		while(p) {
			tree.expandNode(p, true);
			p = p.getParentNode();
		}
	}
	
	if(nodes.length > 0) {
		tree.selectNode(nodes[0]);
	}
}

/**
 * 初始化treemenu
 * @param url
 */
function initTree(url) {
	/*
	 * 树形菜单配置项设置 
	 */
	var setting = {
		view: {
			showIcon: false
		},
		async: {
			enable: true,
			url: url,
			autoParam: ["id", "name", "level"],
			otherParam: {"version": "2.6"},
			dataFilter: treeFilter
		},
		callback: {
			//onExpand: treeOnExpand
			//onAsyncSuccess: treeOnExpand,
			onClick: treeOnClick
		}
	};
	
	$.fn.zTree.init($("#treemenu"), setting);
	
	$("#btn_search").button({
		icons: { primary: "ui-icon-search" }
	}).click( function( event ) {
		searchNode($("#txt_search").val());
	});
	
	$("#radioset").buttonset();
	$("#radio1").button({
		icons: { primary: "ui-icon-folder-open" }
	}).click( function( event ) {
		$.fn.zTree.getZTreeObj("treemenu").expandAll(true);
	});
	$("#radio2").button({
		icons: { primary: "ui-icon-folder-collapsed" }
	}).click( function( event ) {
		$.fn.zTree.getZTreeObj("treemenu").expandAll(false);
	});
	
	var treeHeight = $("#west").height() - $("#zoombar").height() 
						- $("#radioset").height() - $("#toolbar").height() - 25;
	$("#tree").height(treeHeight + "px");
}