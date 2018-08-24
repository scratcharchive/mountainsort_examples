exports.view_timeseries=view_timeseries;

var Mda=require('./mda.js').Mda;
var TimeseriesWidget=require('./timeserieswidget.js').TimeseriesWidget;

var TimeseriesModel=require('./timeseriesmodel.js').TimeseriesModel;
var FiringsModel=require('./firingsmodel.js').FiringsModel;

// the following is not needed once we allow passing path to firings model:
var load_binary_file_part=require('./load_binary_file_part.js').load_binary_file_part;

var TSM=null;
var FM=null;

function view_timeseries(PARAMS, parent_element) {
	var timeseries=PARAMS.timeseries||PARAMS.arg1;
	var firings=PARAMS.firings;
	load_timeseries_model(timeseries,PARAMS,function() {
		load_firings_model(firings,function() {
			start_app();
		});
	});

	function load_timeseries_model(timeseries,PARAMS,callback) {
		TSM=new TimeseriesModel(timeseries,PARAMS);
		TSM.initialize(function(err) {
			if (err) {
				throw new Error(`Error initializing timeseries model for ${timeseries}: ${err}`);
				return;
			}
			callback();
		});
	}

	function load_firings_model(firings,callback) {
		if (firings) {
			load_binary_file_part(firings,undefined,undefined,function(err,buf) {
				if (err) {
					throw new Error(`Error loading firings file: ${firings}`);
					return;
				}
				var X=new Mda();
				X.setFromArrayBuffer(buf);
				FM=new FiringsModel(X);
				callback();
			});
		}
		else {
			callback();
		}
	}

	function start_app() {
		var W=new TimeseriesWidget();
		W.setTimeseriesModel(TSM);

		W.setSampleRate(Number(PARAMS.samplerate)||1);
		if (PARAMS.channels) {
			var list=PARAMS.channels.split(',');
			channels=[];
			for (var i in list) {
				channels.push(Number(list[i]));
			}
			W.setChannels(channels);
		}

		W.setSize(400,400);
		W.setViewRange([0,1000]);
		parent_element.append(W.div());
		$(window).resize(update_size);
		update_size();
		function update_size() {
			//W.setSize($('#content').width(),$('#content').height());
			W.setSize($(window).width(),$(window).height());
		}
		if (FM) {
			W.setFiringsModel(FM);
		}
	}


}
