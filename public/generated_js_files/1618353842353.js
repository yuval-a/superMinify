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
    /**
     *
     * @param {string} domain
     * @param {string} key
     * @param {string} value
     * @param {number} [expireMillis]
     */
    set: function (domain, key, value, expireMillis = 0) {
        // Key is saved as an encrypted [domain]:[key]
        let fullKey   = getFullKey(domain, key);
        // Value is saved as an encrypted [setTimestamp]:[ttl]:value
        // TTL 0 means "unlimited"
        // TTL -1 will put null
        // If value is null, just store null
        let fullValue = value !== null && expireMillis >= 0 ? 
                        encrypt(Date.now() + ':' + expireMillis + ':' + encodeURIComponent(value)) :
                        null;
        STORAGE.setItem(fullKey, fullValue);
    }}

  })();

  window.localStorage.clear();

  /**
 *
 * @param {string|null} actual
 * @param {string|null} expected
 */
function check (actual, expected){
    if(expected !== actual){
      console.log(`FAIL: expected ${expected}, got ${actual} ...`);
    } else {
      console.log(`SUCCESS: ${expected} === ${actual}`);
    }
  }

  // basic set value
  check(CookieStorage.get('google.com', 'A'), null);
  CookieStorage.set("google.com", "A", "a");
  check(CookieStorage.get('google.com', 'A'), 'a');
  
  // basic set value per domain
  check(CookieStorage.get('kueez-ent.com', 'A'), null);
  CookieStorage.set("kueez-ent.com", "A", "b");
  check(CookieStorage.get('', 'A'), 'a');
  check(CookieStorage.get('kueez-ent.com', 'A'), 'b');
  
  // basic delete
  CookieStorage.set("kueez-ent.com", "A", null); // delete
  check(CookieStorage.get('kueez-ent.com', 'A'), null);
  
  // set with TTL
  CookieStorage.set("kueez-ent.com", "A", 'c', 10); // delete
  check(CookieStorage.get('kueez-ent.com', 'A'), 'c');
  
  setTimeout(() => {
    check(CookieStorage.get('kueez-ent.com', 'A'), 'c');
  }, 5);
  
  setTimeout(() => {
    check(CookieStorage.get('kueez-ent.com', 'A'), null);
  }, 11);
  
  // delete using TTL
  CookieStorage.set("kueez-ent.com", "B", "bb", -1); // delete
  check(CookieStorage.get('kueez-ent.com', 'B'), null);
 