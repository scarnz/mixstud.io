function getValue(selector, fn){
  var value = $(selector).val();
  value = value.trim();
  $(selector).val('');

  if(fn){
    value = fn(value);
  }

  return value;
}

function parseUpperCase(string){
  return string.toUpperCase();
}

function parseLowerCase(string){
  return string.toLowerCase();
}

function formatCurrency(number){
  return '$' + number.toFixed(2);
}

function sendAjaxRequest(url, data, verb, altVerb, event, successFn){
  var options = {};
  options.url = url;
  options.type = verb;
  options.data = data;
  options.success = successFn;
  options.error = function(jqXHR, status, error){console.log(error);};

  if(altVerb)
    if(typeof data === 'string')
      options.data += '&_method=' + altVerb;
    else
      options.data._method = altVerb;

  $.ajax(options);
  if(event) event.preventDefault();
}

function sendAjaxFiles(url, data, verb, altVerb, event, successFn){
  var options = {};
  options.url = url;
  options.type = verb;
  options.data = data;
  options.success = successFn;
  options.processData = false;
  options.contentType = false;

  options.error = function(jqXHR, status, error){console.log(error);};

  if(altVerb)
    if(typeof data === 'string')
      options.data += '&_method=' + altVerb;
    else
      options.data._method = altVerb;

  $.ajax(options);
  if(event) event.preventDefault();
}

function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value){
    vars[key] = value;
  });
  return vars;
}


function validateImageFileType(ext) {
  ext = parseLowerCase(ext.substr(ext.indexOf('/') + 1));
  var validFileTypes = ['jpg', 'jpeg', 'png', 'gif'];
  var isValid = false;
  for(var i = 0; i < validFileTypes.length; i++){
    if(ext === validFileTypes[i]){
      isValid = true;
    }
  }
  return isValid;
}
