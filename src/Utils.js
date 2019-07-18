import Config from './Config';

var Utils = {
  
  get: function(url, params, cb) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.statusText !== 'OK') {
          alert('Error retreiving contacts');
          return
        }
        cb(JSON.parse(xhr.responseText));
      }
    }
    var paramList = Object.keys(params).map(function(key){
      var param = params[key];
      return key + '=' + param
    });
    var _params = ''
    if (paramList.length > 0) {
      _params = '?' + paramList.join('&')
    }
    xhr.open('GET', Config.URL_PREFIX + url + _params, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Api-Token', Config.AC_API_TOKEN);
    xhr.send();
  }

}

export default Utils;