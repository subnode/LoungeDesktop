/*
Na.js - A module about Nintendo Account API

Rough flow is below.
Refer OpenID Connect for detail.
```
@startuml
participant "client (this)"
participant server
actor user

note right of "client (this)": isAuthorizing = false;\nisAuthorized = false;\nhasToken = false;
|||
== Initialization ==
group authorization
"client (this)" -> user: Open authorization page
alt Success
user -> server: Authorize
server -> "client (this)": sessionTokenCode (authorization callback)
note right of "client (this)": isAuthorizing = true;\n// isAuthorized === false, hasToken === false
note right of "client (this)": sessionTokenCode is used for getting sessionToken.\nMaybe it has an expiration date.
else Failure
user -> server: Cancel, etc.
server -> "client (this)": Some error (authorization callback)
end
end
|||
group fetchSessionToken
"client (this)" -> server: Request sessionToken using sessionTokenCode
server --> "client (this)": sessionToken
note right of "client (this)": isAuthorizing = false;\nisAuthorized = true;\n// hasToken === false
note right of "client (this)": sessionToken is used for getting token.\nIt is permanent (does not have an expiration date).
end
|||
== Repetition ==
group fetchToken
"client (this)" -> server: Request token using sessionToken
server --> "client (this)": token
note right of "client (this)": hasToken = true;\n// isAuthorizing === false, isAuthorized === true
note right of "client (this)": token is used for API requests.\nIt has an expiration date.
end
|||
group apiRequest
note right of "client (this)": Fetch token if necessary in the actual implementation.
"client (this)" -> server: Call API using token
server --> "client (this)": API result
end
@enduml
```
*/

import * as crypto from 'crypto';
import fetch from 'node-fetch';


const tokenLifetimeMargin = 15 * 60 * 1000;   // 15 min.


/**
 * generates random string
 * @param {number} length
 * @param {string} from
 * @returns {string}
 */
function generateRandomString(length, from) {
  const fromLength = from.length;
  let ret = '';
  for (let i = 0; i < length; i++) {
    ret += from[Math.floor(Math.random() * fromLength)];
  }
  return ret;
}

/**
 * Encodes buffer to base64url
 * @param {Buffer|string} buffer
 * @returns {string} base64url
 */
function encodeBase64url(buffer) {
  if (!(buffer instanceof Buffer)) {
    buffer = Buffer.from(buffer);
  }
  return buffer.toString('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * parses query string
 * @param {string} queryString
 * @returns {Object}
 */
function parseQueryString(queryString) {
  return queryString.split('&').reduce((acc, strFvPair) => {
    const [key, ...values] = strFvPair.split('=').map(v => decodeURIComponent(v));
    acc[key] = values.join('=');
    return acc;
  }, {});
}

/**
 * generates code_challenge of OpenID Connect
 * @param {string} codeVerifier - code_verifier
 * @param {string} method - code_challenge_method, 'plain' or 'S256'
 * @returns {string}
 */
function generateCodeChallenge(codeVerifier, method = 'S256') {
  switch (method) {
    case 'plain':
      return codeVerifier;

    case 'S256':
      return encodeBase64url(crypto.createHash('sha256').update(codeVerifier, 'utf8').digest());
  }
  throw new Error(`unknown method: ${method}`);
}


export default class Na {
  /**
   * generates state
   * @returns {string}
   */
  static generateState() {
    return generateRandomString(50, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz');
  }

  /**
   * generates code_challenge for retreiving session_token
   * @param {string} state - state
   * @param {string} method - code_challenge_method, 'plain' or 'S256'
   * @returns {string}
   */
  static generateSessionTokenCodeChallenge(state = Na.generateState(), method = 'S256') {
    return generateCodeChallenge(state, method);
  }

  /**
   * converts client_id to the protocol
   * @param {string} clientId
   * @returns {string}
   */
  static generateRedirectUriProtocol(clientId) {
    return `npf${clientId}`;
  }

  /**
   * converts client_id to the redirect_uri
   * @param {string} clientId
   * @returns {string}
   */
  static generateRedirectUri(clientId) {
    return `${Na.generateRedirectUriProtocol(clientId)}://auth`;
  }

  /**
   * generates an url to the authorization page
   * @param {string} clientId - client_id
   * @param {string[]} scope - scope, a string list of requiring scopes
   * @param {string} state - state, a random string
   * @param {string} sessionTokenCodeChallengeMethod - code_challenge_method for retreiving session_token
   * @returns {AuthorizationURLObject}
   */
  static generateAuthorizationUrl(clientId, scope, state = Na.generateState(), sessionTokenCodeChallengeMethod = 'S256') {
    scope = Array.from(scope);
    scope.sort();
    const redirectUri = Na.generateRedirectUri(clientId);
    const sessionTokenCodeChallenge = Na.generateSessionTokenCodeChallenge(state, sessionTokenCodeChallengeMethod);
    const params = {
      state,
      redirect_uri: redirectUri,
      client_id: clientId,
      scope: scope.join(' '),
      response_type: 'session_token_code',
      session_token_code_challenge: sessionTokenCodeChallenge,
      session_token_code_challenge_method: sessionTokenCodeChallengeMethod,
      theme: 'login_form',
    };
    const strParams = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${key === 'redirect_url' ? value : encodeURIComponent(value)}`)
      .join('&');
    const object = {
      url: `https://accounts.nintendo.com/connect/1.0.0/authorize?${strParams}`,
      state,
      sessionTokenCodeChallenge,
    };
    object.toString = function() {
      return this.url.toString();
    };
    return object;
  }

  /**
   * parses callback uri launched from authorization page
   * @param {string} clientId
   * @param {string} url
   * @returns {Object}
   */
  static parseCallbackUrl(clientId, url) {
    const redirectUri = Na.generateRedirectUri(clientId);
    if (!url.startsWith(redirectUri) || !/^\/?#/.test(url.slice(redirectUri.length))) {
      throw new Error('invalid callback uri specified');
    }
    const match = url.match(/#(.*)$/);
    if (!match || !match[1]) {
      throw new Error('query string is empty');
    }
    const query = parseQueryString(match[1]);
    return query;
  }

  /**
   * @param {NaObject} naObject
   */
  constructor(naObject = {}) {
    Object.assign(this, naObject);

    [
      'clientId',
      'scope',
    ].forEach(key => {
      if (!this[key]) {
        throw new Error(`no ${key} specified`);
      }
    });

    this.scope = [...this.scope].sort();
  }

  /**
   * @returns {NaObject}
   */
  toJSON() {
    return this.exportNaObject();
  }

  /**
   * @returns {NaObject}
   */
  exportNaObject() {
    return [
      //'clientId',
      //'scope',
      //'userAgent',
      'sessionToken',
      'accessToken',
      'idToken',
      'tokenExpiry',
    ].reduce((acc, key) => {
      if (this[key] !== undefined) {
        acc[key] = this[key];
      }
      return acc;
    }, {});
  }

  /**
   * @returns {string}
   */
  get redirectUriProtocol() {
    return Na.generateRedirectUriProtocol(this.clientId);
  }

  /**
   * @returns {string}
   */
  get redirectUri() {
    return Na.generateRedirectUri(this.clientId);
  }

  /**
   * @returns {boolean}
   */
  get isAuthorizing() {
    //return !!this.sessionState && !!this.sessionTokenCode;
    return !!this.sessionTokenCode;
  }

  /**
   * @returns {boolean}
   */
  get isAuthorized() {
    return !!this.sessionToken;
  }

  /**
   * returns if this has a valid token
   * @returns {boolean}
   */
  get hasToken() {
    return !!this.accessToken && !!this.idToken && !!this.tokenType && !!this.tokenExpiry && Date.now() < this.tokenExpiry;
  }

  /**
   * @param {string} method
   * @param {string} url
   * @param {Object} body
   * @param {boolean} json
   * @param {Object} _headers
   * @returns {Object}
   */
  async $_request(method, url, body = null, json = true, _headers = {}) {
    try {
      const headers = {..._headers};

      // always set User-Agent to prevent setting node-fetch's default User-Agent
      headers['User-Agent'] = this.userAgent || '';
      headers.Accept = 'application/json';

      if (body) {
        if (json) {
          headers['Content-Type'] = 'application/json; charset=utf-8';
          body = JSON.stringify(body);
        } else {
          headers['Content-Type'] = 'application/x-www-form-urlencoded';
          body = Object.entries(body).map(kv => kv.map(v => encodeURIComponent(v).replace(/%20/g, '+')).join('=')).join('&');
        }
      }

      const response = await fetch(url, {
        method,
        headers,
        body,
        redirect: 'follow',
        compress: true,
      });

      const responseJson = await response.json();

      //console.log(url, body, responseJson);

      if (responseJson.error) {
        let errorString = responseJson.error;
        if (responseJson.error_description) {
          errorString += '\n' + responseJson.error_description;
        }
        throw new Error(errorString);
      }

      return responseJson;
    } catch(error) {
      error.url = `${method} ${url}`;
      throw error;
    }
  }

  /**
   * @param {string} state - state
   * @param {string} sessionTokenCodeChallengeMethod - code_challenge_method for retrieving session_token
   * @returns {string}
   */
  generateAuthorizationUrl(state = Na.generateState(), sessionTokenCodeChallengeMethod = 'S256') {
    this.state = state;
    return Na.generateAuthorizationUrl(this.clientId, this.scope, state, sessionTokenCodeChallengeMethod).url;
  }

  /**
   * @param {string|Object} ret - callback uri
   * @param {boolean} fetchSessionToken - whether fetch session_token or not
   * @param {boolean} token - whether fetch token or not
   * @returns {Promise<void>}
   */
  async authorizationCallback(ret, fetchSessionToken = true, fetchToken = true) {
    if (typeof ret === 'string') {
      return this.authorizationCallback(Na.parseCallbackUrl(this.clientId, ret));
    }

    if (ret.state !== this.state) {
      throw new Error('invalid state was returned');
    }

    // session_state is for dealing with session change so is unneeded at now
    //this.sessionState = ret.session_state;
    this.sessionTokenCode = ret.session_token_code;

    if (fetchSessionToken) {
      await this.fetchSessionToken(fetchToken);
    }

    return undefined;
  }

  /**
   * @param {boolean} token - whether fetch token or not
   */
  async fetchSessionToken(fetchToken = true) {
    if (!this.isAuthorizing) {
      throw new Error('authorization is needed before fetching session token');
    }

    const response = await this.$_request('POST', 'https://accounts.nintendo.com/connect/1.0.0/api/session_token', {
      client_id: this.clientId,
      session_token_code: this.sessionTokenCode,
      session_token_code_verifier: this.state,
    }, false);

    this.sessionTokenCode = null;
    //this.sessionState = null;
    this.state = null;

    //this.code = response.code;
    this.sessionToken = response.session_token;

    if (fetchToken) {
      await this.fetchToken(true);
    }
  }

  /**
   * @param {boolean} forceRenew - if set current token will be invalidated and new one will be fetched
   */
  async fetchToken(forceRenew = false) {
    if (!this.isAuthorized) {
      throw new Error('session token is needed before fetching token');
    }

    if (!forceRenew && this.hasToken) {
      // no need to renew token
      return false;
    }

    const response = await this.$_request('POST', 'https://accounts.nintendo.com/connect/1.0.0/api/token', {
      client_id: this.clientId,
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer-session-token',
      session_token: this.sessionToken,
    });

    this.tokenType = response.token_type;
    this.accessToken = response.access_token;
    this.idToken = response.id_token;
    this.tokenExpiry = Date.now() + (response.expires_in * 1000) - tokenLifetimeMargin;

    return true;
  }

  /**
   * @param {string} method
   * @param {string} url
   * @param {Object} body
   * @param {boolean} json
   * @param {Object} _headers
   * @param {boolean} autoRenewToken
   * @returns {Object}
   */
  async apiRequest(method, url, body = null, json = true, _headers = {}, autoRenewToken = true) {
    if (autoRenewToken) {
      await this.fetchToken(false);
    }

    /*
    if (!this.hasToken) {
      throw new Error('token is needed before requesting api');
    }
    //*/

    if (!/:\/\//.test(url)) {
      if (!/^\/*(\d+\.)*\d+\//.test(url)) {
        url = '/2.0.0/' + url.replace(/^\/+/, '');
      }
      url = 'https://api.accounts.nintendo.com/' + url.replace(/^\/+/, '');
    }

    const headers = {..._headers};
    headers.Authorization = `${this.tokenType} ${this.accessToken}`;

    // TODO: renew token and retry if request failed due to token revocation
    return this.$_request(method, url, body, json, headers);
  }
}
