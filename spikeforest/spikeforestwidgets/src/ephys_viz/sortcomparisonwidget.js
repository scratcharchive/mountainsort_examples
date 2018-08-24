exports.SortComparisonWidget=SortComparisonWidget;

function SortComparisonWidget(O) {
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
	function get_all_field_names() {
		return ['true_unit','best_match','accuracy','f.p. rate','f.n. rate','num_matches','num_false_negatives','num_false_positives'];
	}
	function do_refresh() {
		m_div.empty();
		var table=$(`<table class=table></table>`);
		m_div.append(table);

		var names=get_all_field_names();
		var header_row=$('<tr></tr>');
		table.append(header_row);
		for (var i in names) {
			var th=$(`<th>${names[i]}</th>`);
			header_row.append(th);
		}

		var true_units=m_object.true_units||[];
		for (var label in true_units) {
			var U=true_units[label];
			U['true_unit']=label;
			U['f.p. rate']=compute_fp_rate(U).toFixed(3);
			U['f.n. rate']=compute_fn_rate(U).toFixed(3);
			U['accuracy']=Number(U['accuracy']).toFixed(3);
			var row=$('<tr></tr>');
			table.append(row);
			for (var i in names) {
				var val=format_val(U[names[i]]||'');
				var tr=$(`<td>${val}</td>`);
				row.append(tr);
			}
		}
	}
	function compute_fn_rate(U) {
		var numer=Number(U['num_false_negatives']);
		var denom=Number(U['num_matches'])+numer;
		if (!denom) return 0;
		return numer/denom;
	}
	function compute_fp_rate(U) {
		var numer=Number(U['num_false_positives']);
		var denom=Number(U['num_matches'])+numer;
		if (!denom) return 0;
		return numer/denom;
	}
	function format_val(val) {
		if (typeof(val)=='number') {
			if (val==0) return val;
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

