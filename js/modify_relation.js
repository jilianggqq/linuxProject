function setTsinghuaFunc() {
	var tsinghuaFuncs = $("#tsinghuaFunc").val();

	if (tsinghuaFuncs == "getLXRFromTsinghua") {
		TsinghuaClick(0);
	} else if (tsinghuaFuncs == "getLXRFromTsinghua2") {
		TsinghuaClick(1);
	} else if (tsinghuaFuncs == "getLXRFromTsinghua3") {
		TsinghuaClick(2);
	}
}

function setFilter() {
	var filterFuncs = $("#filterFunc").val();
	if (filterFuncs == "filter") {
		filterClick();
	} else if (filterFuncs == "twoWayfilter") {
		twoWayfilterClick();
	} else if (filterFuncs == "twoOtherfilter") {
		twoOtherfilterClick();
	} else {

	}

}

function updateTips(t) {
	tips
		.text(t)
		.addClass("ui-state-highlight");
	setTimeout(function() {
		tips.removeClass("ui-state-highlight", 1500);
	}, 500);
}

function addRelationship() {

	var sname = $("#sname").val(),
		ename = $("#ename").val(),
		allFields = $([]).add(sname).add(ename);

	$("#dialog-form-cr").dialog({
		autoOpen: false,
		height: 280,
		width: 300,
		modal: true,
		buttons: {添加: function() {
				var bValid = true;
				allFields.removeClass("ui-state-error");
				//交互
				$.post("http://localhost:8080/kernelProject-20130601/phplib/opmodule.php", {
						sname: sname,
						ename: ename,
						op: addrel,
					},
					function(status) {
						alert("operation " + status);
					});

				$(this).dialog("close");
			},
			取消: function() {
				$(this).dialog("close");
			}
		},
		close: function() {
			allFields.val("").removeClass("ui-state-error");
		}
	});

	$("#create-relation")
		.button()
		.click(function() {
			$("#dialog-form-cr").dialog("open");
		});
}

function addModules() {
	var name = $("#name").val(),
		fname = $("#fname").val(),
		allFields = $([]).add(name).add(fname);

	$("#dialog-form-cm").dialog({
		autoOpen: false,
		height: 220,
		width: 300,
		modal: true,
		buttons: {添加: function() {
				var bValid = true;
				allFields.removeClass("ui-state-error");
				//交互
				$.post("http://192.168.214.6/linux/project/phplib/opmodule.php", {
						name: name,
						fname: fname,
						op: addmd
					},
					function(status) {
						alert("operation " + status);
					});
				$(this).dialog("close");
			},
			取消: function() {
				$(this).dialog("close");
			}
		},
		close: function() {
			allFields.val("").removeClass("ui-state-error");
		}
	});

	$("#create-model")
		.button()
		.click(function() {
			$("#dialog-form-cm").dialog("open");
		});
}

function deleteModules() {

	var name = $("#name").val(),

		allFields = $([]).add(name);

	$("#dialog-form-rm").dialog({
		autoOpen: false,
		height: 220,
		width: 300,
		modal: true,
		buttons: {删除: function() {
				var bValid = true;
				allFields.removeClass("ui-state-error");

				//交互
				$.post("http://192.168.214.6/linux/project//phplib/opmodule.php", {
						name: name,
						op: delmd
					},
					function(status) {
						alert("operation " + status);
					});
				$(this).dialog("close");
			},
			取消: function() {
				$(this).dialog("close");
			}
		},
		close: function() {
			allFields.val("").removeClass("ui-state-error");
		}
	});

	$("#remove-model")
		.button()
		.click(function() {
			$("#dialog-form-rm").dialog("open");
		});
}

function deleteRelationship() {
	var sname = $("#sname").val(),
		ename = $("#ename").val(),
		allFields = $([]).add(sname).add(ename);


	$("#dialog-form-rr").dialog({
		autoOpen: false,
		height: 280,
		width: 300,
		modal: true,
		buttons: {删除: function() {
				var bValid = true;
				allFields.removeClass("ui-state-error");

				//交互
				$.post("http://192.168.214.6/linux/project/phplib/opmodule.php", {
						sname: sname,
						ename: ename,
						op: delrel
					},
					function(status) {
						alert("operation " + status);
					});
				$(this).dialog("close");
			},
			取消: function() {
				$(this).dialog("close");
			}
		},
		close: function() {
			allFields.val("").removeClass("ui-state-error");
		}
	});

	$("#remove-relation")
		.button()
		.click(function() {
			$("#dialog-form-rr").dialog("open");
		});
}

function modifyModules() {

	var name = $("#name").val(),
		newname = $("#newname").val(),
		allFields = $([]).add(name).add(newname);


	$("#dialog-form-am").dialog({
		autoOpen: false,
		height: 220,
		width: 300,
		modal: true,
		buttons: {修改: function() {
				var bValid = true;
				allFields.removeClass("ui-state-error");

				//交互
				$.post("http://192.168.214.6/linux/project/phplib/opmodule.php", {
						name: name,
						newname: newname,
						op: chgmdname
					},
					function(status) {
						alert("operation " + status);
					});
				$(this).dialog("close");
			},
			取消: function() {
				$(this).dialog("close");
			}
		},
		close: function() {
			allFields.val("").removeClass("ui-state-error");
		}
	});

	$("#alter-model")
		.button()
		.click(function() {
			$("#dialog-form-am").dialog("open");
		});

}

function modifyRelationship() {
	var sname = $("#sname").val(),
		ename = $("#ename").val(),
		newname = $("#newname").val(),
		allFields = $([]).add(sname).add(ename).add(newname);

	$("#dialog-form-ar").dialog({
		autoOpen: false,
		height: 280,
		width: 300,
		modal: true,
		buttons: {修改: function() {
				var bValid = true;

				//交互
				$.post("http://192.168.214.6/linux/project/phplib/opmodule.php", {
						sname: sname,
						ename: ename,
						newname: newname,
						op: chgrel
					},
					function(status) {
						alert("operation " + status);
					});
				$(this).dialog("close");
			},
			取消: function() {
				$(this).dialog("close");
			}
		},
		close: function() {
			allFields.val("").removeClass("ui-state-error");
		}
	});

	$("#alter-relation")
		.button()
		.click(function() {
			$("#dialog-form-ar").dialog("open");
		});

}