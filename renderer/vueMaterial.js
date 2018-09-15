import Vue from 'vue';
import {
  // layout
  MdElevation,
  MdRipple,

  // layout components
  MdContent,
  MdToolbar,
  MdApp,

  // form components
  MdField,    // md-input, md-textarea, md-select
  MdSwitch,

  // other components
  MdAvatar,
  MdButton,
  MdDialog,
  MdDivider,
  MdEmptyState,
  MdIcon,
  MdList,
  MdMenu,
  MdProgress,
  MdSnackbar,
  MdSpeedDial,
  MdSubheader,
  MdTooltip,
} from 'vue-material/dist/components';

import 'vue-material/dist/vue-material.css';
import './assets/themes.scss';
import './assets/MaterialIcons.css';
import './assets/Roboto.css';


for (const component of [
  // layout
  MdElevation,
  MdRipple,

  // layout components
  MdContent,
  MdToolbar,
  MdApp,

  // form components
  MdField,    // md-input, md-textarea, md-select
  MdSwitch,

  // components
  MdAvatar,
  MdButton,
  MdDialog,
  MdDivider,
  MdEmptyState,
  MdIcon,
  MdList,
  MdMenu,
  MdProgress,
  MdSnackbar,
  MdSpeedDial,
  MdSubheader,
  MdTooltip,
]) {
  Vue.use(component);
}
