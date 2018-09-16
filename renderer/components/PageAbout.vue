<template>
<base-layout>
  <template slot="toolbar">
    <md-button class="button-home md-icon-button" to="/" @dragstart.native.prevent>
      <md-icon>home</md-icon>
      <md-tooltip>{{$t('tooltip.ReturnToHome')}}</md-tooltip>
    </md-button>
    <h1 class="title md-title">
      {{$t('PageAbout.title', [appName])}}
    </h1>
  </template>

  <template slot="content">
    <div class="product">
      <div class="logo">
        <img class="logo-image" :src="logo" @dragstart.prevent>
        <span class="logo-text md-display-1">
          {{appName}}
        </span>
      </div>
      <div class="version">
        {{$t('PageAbout.version', [version])}}
      </div>
      <div class="copyright">
        &copy; 2018&#32;<a href="https://github.com/subnode" @click="openExternal">subnode</a>&#32;All rights reserved.
      </div>
      <div class="links">
        <a href="https://github.com/subnode/LoungeDesktop" @click="openExternal">
          {{$t('PageAbout.GitHubRepository')}}
        </a>
        &#32;|&#32;
        <a href="https://github.com/subnode/LoungeDesktop/issues" @click="openExternal">
          {{$t('PageAbout.ReportBug')}}
        </a>
      </div>
    </div>

    <!-- credits, no localization for this section -->
    <div class="credits">
      <h2 class="credits-title">Credits</h2>
      <p>
        See also&#32;<a href="#" @click.prevent="openLCHtmlFile" @dragstart.prevent>LICENSES.chromium.html</a>&#32;for the license notices related to Chromium.
      </p>
      <template v-if="!credits.length">
        <p>
          {{$t('PageAbout.NowLoading')}}
        </p>
      </template>
      <template v-else>
        <ul class="credit-list">
          <li
            v-for="credit in credits"
            :key="`list-${credit.id}#${credit.version}`"
            class="credit-list-item"
          >
            <a
             :href="`#block-${credit.id}#${credit.version}`"
             @click.prevent="scrollTo(`block-${credit.id}#${credit.version}`)"
             @dragstart.prevent
            >
              <span class="credit-name">
                {{credit.name}}
              </span>
              <span class="credit-version" v-if="credit.version">
                &#32;version {{credit.version}}
              </span>
            </a>
          </li>
        </ul>
        <div
          v-for="credit in credits"
          :key="`block-${credit.id}#${credit.version}`"
          class="credit-block"
          :ref="`block-${credit.id}#${credit.version}`"
        >
          <div class="credit-block-title-container">
            <h3 class="credit-block-title">
              <a class="credit-name" :href="credit.url" @click.prevent="openExternal">
                {{credit.name}}
              </a>
              <span class="credit-version" v-if="credit.version">
                &#32;version {{credit.version}}
              </span>
            </h3>
            <md-button class="credit-block-actions md-icon-button" @click="selectAll">
              <md-icon>select_all</md-icon>
            </md-button>
            <md-button class="credit-block-actions md-icon-button" @click="scrollToTop">
              <md-icon>arrow_upward</md-icon>
            </md-button>
          </div>
          <md-content class="credit-block-text md-scrollbar">
            {{credit.text}}
          </md-content>
        </div>
      </template>
    </div>
  </template>
</base-layout>
</template>


<script>
import {appName} from '../../common/config';
import xfi from '../lib/xfi';
import * as ipc from '../lib/ipc';

import BaseLayout from './BaseLayout.vue';

import logo from '../../logo.svg';


function scrollY(scrollerElement, to) {
  if (!scrollerElement) {
    return;
  }
  if (typeof to !== 'number') {
    to = to.offsetTop - scrollerElement.offsetTop;
  }
  scrollerElement.scrollTo({
    top: to,
  });
}

export default {
  components: {
    BaseLayout,
  },
  data() {
    return {
      title$$: `About - ${appName}`,
      appName,
      logo,
      version: VERSION,
      credits: [],
    };
  },
  created() {
    fetch(`/${FILENAMES.thirdPartyNoticesJson}`)
      .then(response => response.json())
      .then(credits => {
        this.credits = credits;
      });
  },
  methods: {
    scrollToTop() {
      scrollY(document.querySelector('.md-app-scroller'), 0);
    },
    scrollTo(key) {
      const element = this.$refs[key][0];
      if (!element) {
        return;
      }
      scrollY(document.querySelector('.md-app-scroller'), element);
    },
    openLCHtmlFile(event) {
      ipc.send('openLCHtmlFile');
    },
    openExternal(event) {
      xfi.shell.openExternal(event.target.href);
    },
    selectAll(event) {
      let element = event.target;
      while (element && !element.classList.contains('credit-block')) {
        element = element.parentElement;
      }
      if (!element) {
        return;
      }
      element = element.getElementsByClassName('credit-block-text')[0];
      if (!element) {
        return;
      }
      const range = document.createRange();
      range.selectNode(element);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    },
  },
};
</script>


<style scoped>
.title {
  flex: 1;
}

.product {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo {
  display: inline-flex;
  align-items: center;
}

.logo-image {
  width: auto;
  height: 4rem;
  user-select: none;
}

.logo-text {
  margin-left: .5rem;
}

.version {
  opacity: .95;
  font-size: 95%;
}

.copyright {
  margin: 1rem 0;
}


/* credits */

.credit-block-title-container {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  margin: 2rem 0 .25rem 0;
}

.credit-block-title {
  flex: 1 1 auto;
  justify-self: flex-start;
  margin: 0;
}

.credit-block-actions {
  flex: 0 0 auto;
  justify-self: flex-end;
  user-select: none;
}

.credit-block-text {
  margin: 0;
  padding: .5em;
  /*
  max-height: 24.5em;
  */
  max-height: calc(90vh - 10rem);
  background: rgba(127, 127, 127, .15) !important;
  /*
  white-space: pre;
  word-break: keep-all;
  */
  white-space: pre-wrap;
  font-size: 90%;
  font-family: Consolas, Inconsolata, 'Courier New', Courier, monospace;
  overflow: auto;

}
</style>
