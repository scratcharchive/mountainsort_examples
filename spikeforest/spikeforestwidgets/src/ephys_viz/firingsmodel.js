exports.FiringsModel=FiringsModel;

function FiringsModel(X) {
	this.getChunk=function(opts) {return getChunk(opts);};
	this.numEvents=function() {return m_all_times.length;};

	var m_all_times=[];
	var m_all_labels=[];

	for (var i=0; i<X.N2(); i++) {
		var t0=X.value(1,i);
		var k0=X.value(2,i);
		m_all_times.push(t0);
		m_all_labels.push(k0);
	}
	// TODO: sort by time for better efficiency
	X=0; //free memory (I think)

	function getChunk(opts) {
		var ret={
			times:[],
			labels:[]
		}
		// TODO: sort for better efficiency
		for (var i=0; i<m_all_times.length; i++) {
			var t0=m_all_times[i];
			if ((opts.t1<=t0)&&(t0<opts.t2)) {
				ret.times.push(t0);
				ret.labels.push(m_all_labels[i]);
			}
		}
		return ret;
	}
}
