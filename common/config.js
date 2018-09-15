import defaultAccountIcon from './baseline-person-24px.svg';
import defaultAppIcon from './baseline-web-24px.svg';



export const appName = 'Lounge Desktop';

export const appProtocol = 'app';

export const appHostname = '-';

export const appStartupPath = '/';

export const fetchProtocolPrefix = 'fetch-';

export const fetchableProtocols = [
  'http',
  'https',
];

export const routerMode = 'history';

export const currentAccountsFileVersion = 1;

export const currentPreferencesFileVersion = 1;

export const themes = [
  {
    id: 'RedDark',
    name: 'Red Dark',
    theme: 'dark',
  },
  {
    id: 'RedLight',
    name: 'Red Light',
    theme: 'light',
  },
  {
    id: 'MonoDark',
    name: 'Mono Dark',
    theme: 'dark',
  },
  {
    id: 'MonoLight',
    name: 'Mono Light',
    theme: 'light',
  },
  {
    id: 'VMDark',
    name: 'VM Dark',
    theme: 'dark',
  },
  {
    id: 'VMLight',
    name: 'VM Light',
    theme: 'light',
  },
];

export const themeBackgroundColor = {
  dark: '#444444',
  light: '#ffffff',
};

export const accountPlaceholder = {
  $$isPlaceholder: true,
  $$apps: [],
  $$appsFetched: false,
  version: currentAccountsFileVersion,
  id: 0,
  name: '(account)',
  imageUri: defaultAccountIcon,
  extraInfo: {
    supportId: '0000-0000-0000-0000-0000-0',
  },
  znc: {
    naAccountInfo: {
      id: '****************',
      screenName: '*****@*****',
      nickname: '(nickname)',
    },
    na: {
      tokenExpiry: 0,
    },
  },
};

export const appPlaceholder = {
  $$isPlaceholder: true,
  id: 0,
  name: '(application)',
  imageUri: defaultAppIcon,
  uri: '/',
  whiteList: [],
};

export const defaultPreferences = {
  version: currentPreferencesFileVersion,
  developerMode: false,
  language: 'en-US',
  theme: 'RedDark',
  showNaInfo: true,
  applyCustomCssToWebview: true,
  showWindowOn: 'navigated',    // 'created', 'navigated', 'rendered'
  showWebviewOn: 'navigated',    // 'navigated', 'rendered'
  saveWindowSize: true,
  windowSize: {
    width: 540,
    height: 780,
  },
  loginOnStartup: 2500,
  fetchAppListOnStartup: 1500,
  persistWebviewSessions: true,
  napi: {
    znc: {
      proxy: '',
      userAgent: 'com.nintendo.znca/1.1.2 (Android/9.0.0)',
      xPlatform: 'Android',
      isAnalyticsOptedIn: 'auto',
      isAppAnalyticsOptedIn: 'false',
    },
    na: {
      proxy: '#znc',
      userAgent: 'OnlineLounge/1.1.2 NASDKAPI Android',
    },
    webview: {
      proxy: '#na',
      userAgent: '',
    },
    miscFetch: {
      proxy: '#webview',
      userAgent: '',
    },
    miscNonFetch: {
      proxy: '#webview',
      userAgent: '',
    },
  },
};
