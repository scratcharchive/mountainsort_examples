var study=_MLS.study;
var run_pipeline=_MLS.runPipeline;
var res=_MLS.getResultPath;
var prv=_MLS.computePrv;
var write_json=_MLS.writeJson;

var detect_threshold=3;

var datasets=study.datasets;
for (var id in datasets) {
	console.log ('Processing dataset: '+id);
	process_dataset(datasets[id]);
}

function process_dataset(X) {
	run_pipeline('mountainsort3','sort',
		{
			raw:X.files['raw.mda']
		},
		{
			firings_out:res(X,'firings.mda'),
			cluster_metrics_out:res(X,'cluster_metrics.json')
		},
		{
			samplerate:X.parameters['samplerate']||undefined,
			detect_sign:X.parameters['detect_sign']||undefined,
			adjacency_radius:X.parameters['adjacency_radius']||undefined,
			detect_threshold:detect_threshold,
			curate:'true'
		}
	);

	var mv2={
    	samplerate: X.parameters['samplerate'],
    	firings: prv(res(X,'firings.mda')),
    	timeseries: {
      		"Raw Data": {
	        	"name": "Raw Data",
	        	"data": prv(X.files['raw.mda'])
      		}
      	},
      	cluster_metrics: prv(res(X,'cluster_metrics.json'))
    };
    write_json(mv2,res(X,'output.mv2'));
}