import {EventEmitter} from 'events';
import fetch from 'node-fetch';

import Na from './Na';
import generateF from './f';


const xProductVersion = $O('1.1.0');
const accessTokenLifetimeMargin = 15 * 60 * 1000;   // 15 min.


export default class Znc extends EventEmitter {
  /**
   * @returns {string}
   */
  static get xProductVersion() {
    return xProductVersion;
  }

  /**
   * @param {ZncObject} zncObject
   */
  constructor(zncObject) {
    super();

    Object.assign(this, zncObject);

    if (!this.na) {
      throw new Error('no na specified');
    }
    if (!(this.na instanceof Na)) {
      this.na = new Na(this.na);
    }
  }

  /**
   * @returns {ZncObject}
   */
  toJSON() {
    return this.exportZncObject();
  }

  /**
   * @returns {ZncObject}
   */
  exportZncObject() {
    return [
      //'isAppAnalyticsOptedIn',
      //'isAnalyticsOptedIn',
      'naAccountInfo',
      //'userAgent',
      //'xPlatform',
    ].reduce((acc, key) => {
      if (this[key] !== undefined) {
        acc[key] = this[key];
      }
      return acc;
    }, {
      na: this.na.exportNaObject(),
    });
  }

  /**
   * @returns {boolean}
   */
  get isLoggedIn() {
    return !!this.$_loginInfo;
  }

  async $_request(method, url, body = null, _headers = {}, raw = false) {
    try {
      if (!/:\/\//.test(url)) {
        if (!/^\/*v\d+\//.test(url)) {
          url = '/v1/' + url.replace(/^\/+/, '');
        }
        url = 'https://api-lp1.znc.srv.nintendo.net/' + url.replace(/^\/+/, '');
      }

      const headers = {..._headers};
      headers['X-ProductVersion'] = xProductVersion;
      if (this.xPlatform) {
        headers['X-Platform'] = this.xPlatform;
      }
      // always set User-Agent to prevent setting node-fetch's default User-Agent
      headers['User-Agent'] = this.userAgent || '';
      headers.Accept = 'application/json';

      if (body) {
        headers['Content-Type'] = 'application/json; charset=utf-8';
        body = JSON.stringify(raw ? body : {
          parameter: body,
        });
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

      if (responseJson.status) {
        let errorMessage = `${responseJson.status}`;
        if (responseJson.errorMessage) {
          errorMessage += '\n' + responseJson.errorMessage;
        }
        // eslint-disable-next-line no-console
        console.error('Znc API error', url, errorMessage);
        throw new Error(errorMessage);
      }

      return raw ? responseJson : responseJson.result;
    } catch(error) {
      error.url = `${method} ${url}`;
      throw error;
    }
  }

  /**
   * @param {boolean} forceRenew
   */
  async login(forceRenew = false) {
    if (!forceRenew && this.accessTokenExpiry && Date.now() < this.accessTokenExpiry) {
      return false;
    }

    const naUsersMeResponse = await this.na.apiRequest('GET', '/2.0.0/users/me');

    this.naAccountInfo = naUsersMeResponse;
    this.emit('naUpdate', naUsersMeResponse);

    this.$_loginInfo = await this.$_request('POST', '/v1/Account/Login', {
      f: generateF(this.na.idToken),
      naCountry: naUsersMeResponse.country,
      naIdToken: this.na.idToken,
      naBirthday: naUsersMeResponse.birthday,
      language: naUsersMeResponse.language,
    }, {
      Authorization: 'Bearer',
    });

    this.accessTokenExpiry = Date.now() + (Math.min(this.$_loginInfo.firebaseCredential.expiresIn, this.$_loginInfo.webApiServerCredential.expiresIn) * 1000) - accessTokenLifetimeMargin;

    this.emit('login', this.$_loginInfo.user);

    return true;
  }

  async apiRequest(method, url, body = null, _headers = {}, raw = false) {
    await this.login(false);

    const headers = {
      ..._headers,
      Authorization: `Bearer ${this.$_loginInfo.webApiServerCredential.accessToken}`,
    };

    return this.$_request(method, url, body, headers, raw);
  }

  /**
   * generates request headers required for opening web services
   * @param {string} gameWebToken
   * @returns {Object}
   */
  generateWebServiceRequestHeaders(gameWebToken) {
    const headers = {};
    const isAnalyticsOptedIn = this.isAnalyticsOptedIn === 'auto' ? this.naAccountInfo.analyticsOptedIn.toString() : this.isAnalyticsOptedIn;
    const isAppAnalyticsOptedIn = this.isAppAnalyticsOptedIn === 'auto' ? isAnalyticsOptedIn : this.isAnalyticsOptedIn;
    if (isAnalyticsOptedIn != null) {
      headers['x-isanalyticsoptedin'] = isAnalyticsOptedIn;
    }
    if (gameWebToken) {
      headers['x-gamewebtoken'] = gameWebToken;
    }
    headers.dnt = '1';
    if (isAppAnalyticsOptedIn != null) {
      headers['x-isappanalyticsoptedin'] = isAppAnalyticsOptedIn;
    }
    headers['X-Requested-With'] = 'com.nintendo.znca';
    return headers;
  }
}
