exports.view_dataset=view_dataset;

const EVDatasetWidget=require(__dirname+'/evdatasetwidget.js').EVDatasetWidget;

function view_dataset(PARAMS, parent_element) {
	var dataset_directory=PARAMS.dataset||PARAMS.arg1;
	let firings=PARAMS.firings||'';
	let visible_channels_str=PARAMS.visible_channels||'';
	start_app();

	function start_app() {
		var W=new EVDatasetWidget();
		W.setDatasetDirectory(dataset_directory);
		if (firings) {
			console.info('Setting firings: '+firings);
			W.setFirings(firings);
		}
		if (visible_channels_str) {
			W.setVisibleChannels(visible_channels_str);
		}

		W.setSize(400,400);
		parent_element.append(W.element());
		$(window).resize(update_size);
		update_size();
		function update_size() {
			//W.setSize($('#content').width(),$('#content').height());
			W.setSize($(window).width(),$(window).height());
		}
	}
}
