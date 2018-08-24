exports.ClusterMetricsWidget=ClusterMetricsWidget;

function ClusterMetricsWidget(O) {
	var that=this;
	
	this.div=function() {return m_div;};
	this.setObject=function(obj) {setObject(obj);};
	this.object=function() {return object();};

	var m_div=$('<div class=ml-item-content></div');
	var m_object={};

	function setObject(obj) {
		m_object=JSON.parse(JSON.stringify(obj));
		do_refresh();
	}
	function object() {
		return JSON.parse(JSON.stringify(m_object));
	}
	function get_all_metric_names() {
		var names={};
		var clusters=m_object.clusters||[];
		for (var i in clusters) {
			var C=clusters[i];
			var metrics0=C.metrics||{};
			for (var mm in metrics0) {
				names[mm]=1;
			}
		}
		var list=Object.keys(names).sort();
		return list;
	}
	function do_refresh() {
		m_div.empty();
		var table=$(`<table class=table></table>`);
		m_div.append(table);

		var names=get_all_metric_names();
		var header_row=$('<tr></tr>');
		table.append(header_row);
		header_row.append(`<th>Cluster</th>`);
		for (var i in names) {
			var th=$(`<th>${names[i]}</th>`);
			header_row.append(th);
		}
	
		var clusters=m_object.clusters||[];
		for (var i in clusters) {
			var C=clusters[i];
			var label0=C.label;
			var metrics0=C.metrics||{};
			var row=$('<tr></tr>');
			table.append(row);
			row.append(`<td>${label0}</td>`)
			for (var i in names) {
				var val=format_val(metrics0[names[i]]||'0');
                var tr=$(`<td>${val}</td>`);
				row.append(tr);
			}
		}
	}
	function format_val(val) {
		if (typeof(val)=='number') {
            if (val==0) return '0';
			if (val<0) {
				return '-'+format_val(-val);
			}
			var factor=1;
			while (val>10000) {
				val/=10;
				factor/=10;	
			}
			while (val<10000) {
				val*=10;
				factor*=10;
			}
			return Math.round(val)/factor;
		}
		else return val;
	}
	do_refresh();
}
