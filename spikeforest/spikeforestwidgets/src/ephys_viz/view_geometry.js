exports.view_geometry=view_geometry;

var Mda=require('./mda.js').Mda;
var GeomWidget=require('./geomwidget.js').GeomWidget;
var load_text_file=require('./load_text_file.js').load_text_file;

var GEOM=null;

function view_geometry(PARAMS, parent_element) {
	var geometry=PARAMS.geometry||PARAMS.arg1;
	load_geometry(geometry,function() {
		start_app();
	});

	function load_geometry(geometry,callback) {
		load_text_file(geometry,function(err,txt) {
			if (err) {
				throw new Error(err);
				return;
			}
			GEOM=txt;
			callback();
		});
		
	}

	function start_app() {
		var W=new GeomWidget();
		W.setGeomText(GEOM);

		parent_element.append(W.div());
		$(window).resize(update_size);
		update_size();
		function update_size() {
			//W.setSize($('#content').width(),$('#content').height());
			var W=Math.min(400,$(window).width());
			var H=Math.min(400,$(window).height());
			W.setSize(W,H);
		}
	}
}