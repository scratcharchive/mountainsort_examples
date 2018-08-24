exports.load_binary_file_part=load_binary_file_part;

const KBClient = require('kbclient').v1;

function load_binary_file_part(url_or_path,start,end,callback) {
	let KBC=new KBClient();
	KBC.readBinaryFilePart(url_or_path, {
        start: start,
        end: end
      })
      .then(function(buf) {
        callback(null,buf);
      })
      .catch(function(err) {
        console.error(`Error reading part of file ${url_or_path}: ` + err);
      });
}


/*
Alex M: I know this is silly... I should be finding the protocol properly, but oh well...
*/

function is_url(fname_or_url) {
	return ((fname_or_url.indexOf('http://')==0)||(fname_or_url.indexOf('https://')==0));
}

function is_dat(fname_or_dat) {
	return (fname_or_dat.indexOf('dat://')==0);
}

function load_binary_file_part_old(url_or_dat_or_path,start,end,callback) {
	if (is_url(url_or_dat_or_path)) {
		var url=url_or_dat_or_path;
		var headers={};
		if ((start!==undefined)&&(end!==undefined)) {
			headers['range']=`bytes=${start}-${end-1}`;
		}
		$.ajax({
			url: url,
			type: "GET",
			dataType: "binary",
			processData: false,
			responseType: 'arraybuffer',
			headers:headers,
			error: function(jqXHR, textStatus, errorThrown) {
				if (callback) {
					callback('Error loading binary file part: '+textStatus+': '+errorThrown);
					callback=null;
				}
			},
			success: function(result) {
				if (callback) {
					callback(null,result);
					callback=null;
				}
			}
		});
	}
	else if (is_dat(url_or_dat_or_path)) {
		var dat=url_or_dat_or_path;
		dat=dat.slice(('dat://').length);
		var ind=dat.indexOf('/');
		if (ind<0) {
			callback('Problem with dat link: '+dat);
			return;
		}
		var dat_key=dat.slice(0,ind);
		var file_path=dat.slice(ind+1);
		window.electron_resources.load_binary_file_part_from_dat(dat_key,file_path,start,end,callback);
	}
	else {
		var path=url_or_dat_or_path;
		window.electron_resources.load_binary_file_part(path,start,end,callback);
	}
}

$.ajaxTransport("+binary", function(options, originalOptions, jqXHR){
    // check for conditions and support for blob / arraybuffer response type
    if (window.FormData && ((options.dataType && (options.dataType == 'binary')) || (options.data && ((window.ArrayBuffer && options.data instanceof ArrayBuffer) || (window.Blob && options.data instanceof Blob)))))
    {
        return {
            // create new XMLHttpRequest
            send: function(headers, callback){
		// setup all variables
                var xhr = new XMLHttpRequest(),
		url = options.url,
		type = options.type,
		async = options.async || true,
		// blob or arraybuffer. Default is blob
		dataType = options.responseType || "blob",
		data = options.data || null,
		username = options.username || null,
		password = options.password || null;
					
                xhr.addEventListener('load', function(){
			var data = {};
			data[options.dataType] = xhr.response;
			// make callback and send data
			callback(xhr.status, xhr.statusText, data, xhr.getAllResponseHeaders());
                });
 
                xhr.open(type, url, async, username, password);
				
		// setup custom headers
		for (var i in headers ) {
			xhr.setRequestHeader(i, headers[i] );
		}
				
                xhr.responseType = dataType;
                xhr.send(data);
            },
            abort: function(){
                jqXHR.abort();
            }
        };
    }
});