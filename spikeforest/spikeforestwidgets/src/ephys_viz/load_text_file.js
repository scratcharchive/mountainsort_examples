exports.load_text_file = load_text_file;
const KBClient = require('kbclient').v1;

function load_text_file(path, callback) {

  let KBC = new KBClient();
  KBC.readTextFile(path, {})
    .then(function(txt) {
      callback(null, txt);
    })
    .catch(function(err) {
      console.error(`Error reading text file ${path}: ` + err);
    });
}


//////// old:

function is_url(fname_or_url) {
  return ((fname_or_url.indexOf('http:') == 0) || (fname_or_url.indexOf('https:') == 0));
}

function load_text_file_old(url_or_path, callback) {
  if (!is_url(url_or_path)) {
    window.electron_resources.load_text_file(url_or_path, callback);
  } else {
    var url = url_or_path;
    $.get(url, function(text) {
      callback(null, text);
    });
  }
}