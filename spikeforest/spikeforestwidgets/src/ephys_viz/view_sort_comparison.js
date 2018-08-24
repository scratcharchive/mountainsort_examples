exports.view_sort_comparison=view_sort_comparison;

var SortComparisonWidget=require('./sortcomparisonwidget.js').SortComparisonWidget;
var load_text_file=require('./load_text_file.js').load_text_file;

var COMPARISON=null;

function view_sort_comparison(PARAMS, parent_element) {
	var comparison=PARAMS.comparison||PARAMS.arg1;
	load_comparison(comparison,function() {
		start_app();
	});

	function load_comparison(comparison,callback) {
		load_text_file(comparison,function(err,txt) {
			if (err) {
				throw new Error(err);
				return;
			}
			COMPARISON=JSON.parse(txt);
			callback();
		});
		
	}

	function start_app() {
		var W=new SortComparisonWidget();
		W.setObject(COMPARISON);

		parent_element.append(W.div());
		$(window).resize(update_size);
		update_size();
		function update_size() {
			//W.setSize($('#content').width(),$('#content').height());
			//var W=Math.min(600,$(window).width());
			//var H=Math.min(600,$(window).height());
			//W.setSize(W,H);
		}
	}
}
