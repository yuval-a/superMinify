CookieStorage = (function() {

    const STORAGE = window.localStorage;
    const encrypt = window.btoa;
    const decrypt = window.atob; 

    function getFullKey(domain, key) {
        return encrypt(encodeURIComponent(domain) + ':' + encodeURIComponent(key));
    }

    return {
    /**
     *
     * @param {string} domain
     * @param {string} key
     * @returns {string|null}

     */
    get: function (domain, key) {
        let fullKey = getFullKey(domain, key);
        let [setTimestamp, ttl, value] = decrypt(STORAGE.getItem(fullKey)).split(':');
        if (ttl > 0 && Date.now() - setTimestamp >= ttl) {
            STORAGE.removeItem(fullKey);
            return null;
        }
        return value || null;
    },
   
 