import Config from './Config';

const Utils = {
  
  get: function(url, params, cb) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.statusText !== 'OK') {
          alert('Error retreiving contacts');
          return
        }
        cb(JSON.parse(xhr.responseText));
      }
    }
    let paramList = Object.keys(params).map(function(key){
      let param = params[key];
      return key + '=' + param
    });
    let _params = ''
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