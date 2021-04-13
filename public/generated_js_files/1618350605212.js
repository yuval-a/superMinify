CookieStorage = (function() {

    const STORAGE = window.localStorage;
    const encrypt = window.btoa;
    const decrypt = window.atob; 

    function getFullKey(domain, key) {
        return encrypt(encodeURIComponent(domain) + ':' + encodeURIComponent(key));
    }

 
  check(CookieStorage.get('kueez-ent.com', 'B'), null);
 