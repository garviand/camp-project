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
    xhr.open('GET', 'https://cors-anywhere.herokuapp.com/' + url + _params, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Api-Token', '0f7e5c9167768f6bb0a6e09e335ce464da7cb5e7008b989f0057266c26342424a4d8d3e5');
    xhr.send();
  }

}

export default Utils;