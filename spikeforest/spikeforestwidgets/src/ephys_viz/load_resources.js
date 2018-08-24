if (using_electron()) {
	var remote = require('electron').remote;
	window.RESOURCES={};
	//window.RESOURCES.d3=require('d3');
	window.RESOURCES.params=remote.getGlobal('sharedObject').params;
	window.RESOURCES.load_binary_file_part=electron__load_binary_file_part;

	// It is annoying that we need to do this, but apparently necessary
	window.$ = window.jQuery = require('jquery');
}
else {
	window.RESOURCES={};
	window.RESOURCES.params=parse_url_params();
	window.RESOURCES.load_binary_file_part=browser__load_binary_file_part;
	//load_d3();
	//load_css('https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css');
}

/*
function load_d3() {
	var s=document.createElement('script');
	s.type='text/javascript';
	s.src='https://d3js.org/d3.v4.min.js';
	document.head.appendChild(s);
}
*/

function parse_url_params() {
	var match;
	var pl     = /\+/g;  // Regex for replacing addition symbol with a space
	var search = /([^&=]+)=?([^&]*)/g;
	var decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); };
	var query  = window.location.search.substring(1);
	var url_params = {};
	while (match = search.exec(query))
		url_params[decode(match[1])] = decode(match[2]);
	return url_params;
}


function using_electron() {
	var userAgent = navigator.userAgent.toLowerCase();
	if (userAgent.indexOf(' electron/') > -1) {
	   return true;
	}
	return false;
}

/*
function load_css(url) {
	var fileref = document.createElement("link")
    fileref.setAttribute("rel", "stylesheet");
    fileref.setAttribute("type", "text/css");
    fileref.setAttribute("href", url);
    document.getElementsByTagName("head")[0].appendChild(fileref);
}
*/

function is_url(fname_or_url) {
	return ((fname_or_url.indexOf('http:')==0)||(fname_or_url.indexOf('https:')==0));
}

function browser__load_binary_file_part(url,start,end,callback) {
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

function electron__load_binary_file_part(path,start,end,callback) {
	var headers={};
	if ((start!==undefined)&&(end!==undefined)) {
		headers['range']=`bytes=${start}-${end-1}`;
	}
	if (is_url(path)) {
		var opts = {
		    method: 'GET',
		    url: path,
		    encoding: null, // See https://stackoverflow.com/questions/14855015/getting-binary-content-in-node-js-using-request
		    headers:headers
		};
		require('request')(opts, function(error, response, body) {
		    if (error) {
		    	callback(error.message);
		    	return;
		    }

		    // The following is sadly necessary because the body is returned
		    // with an underlying buffer that holds 32-bit integers. Can you believe it??
		    // TODO: fix this by using utf8 and charcodes or something
		    var AA=new Uint8Array(body.length);
		    for (var jj=0; jj<body.length; jj++) {
		    	AA[jj]=body[jj];
		    }

		    callback(null,AA.buffer);
		});
	}
	else {
		require('fs').open(path, 'r', function(err, fd) {
			if (err) {
			    callback(err.message);
			    return;
			}
			if ((start===undefined)&&(end===undefined)) {
				start=0;
				end=get_file_size(path);
			}
			var buffer = new Buffer(end-start);
			require('fs').read(fd, buffer, 0, end-start, start, function(err, num) {
				if (err) {
					callback(err.message);
					return;
				}
				callback(null,buffer.buffer);
			});
		});
	}
}

function get_file_size(fname) {
	return require('fs').statSync(fname).size;
}

/**
 *
 * jquery.binarytransport.js
 *
 * @description. jQuery ajax transport for making binary data type requests.
 * @version 1.0 
 * @author Henry Algus <henryalgus@gmail.com>
 *
 */
 
// use this transport for "binary" data type

$(document).ready(function() {
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
});