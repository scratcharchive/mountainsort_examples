exports.view_cluster_metrics=view_cluster_metrics;

var ClusterMetricsWidget=require('./clustermetricswidget.js').ClusterMetricsWidget;
var load_text_file=require('./load_text_file.js').load_text_file;

var METRICS=null;

function view_cluster_metrics(PARAMS, parent_element) {
	var metrics=PARAMS.metrics||PARAMS.arg1;
	load_metrics(metrics,function() {
		start_app();
	});

	function load_metrics(metrics,callback) {
		load_text_file(metrics,function(err,txt) {
			if (err) {
				throw new Error(err);
				return;
			}
			METRICS=JSON.parse(txt);
            callback();
		});
		
	}

	function start_app() {
		var W=new ClusterMetricsWidget();
		W.setObject(METRICS);

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
