import Vue from 'vue';
import VueI18n from 'vue-i18n';

import {fallbackLocale} from '../common/config';
import {messages} from '../locales/index';


Vue.use(VueI18n);


export default new VueI18n({
  locale: fallbackLocale,
  fallbackLocale,
  messages,
});
