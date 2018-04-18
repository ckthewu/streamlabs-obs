window['eval'] = global.eval = () => {
  throw new Error('window.eval() is disabled for security');
};

import 'reflect-metadata';
import Vue from 'vue';
import URI from 'urijs';

import { createStore } from './store';
import { ObsApiService } from './services/obs-api';
import { IWindowOptions, WindowsService } from './services/windows';
import { AppService } from './services/app';
import { ServicesManager } from './services-manager';
import Utils from './services/utils';
import electron from 'electron';
import VTooltip from 'v-tooltip';

const { ipcRenderer, remote } = electron;

const slobsVersion = remote.process.env.SLOBS_VERSION;
const isProduction = process.env.NODE_ENV === 'production';

require('./app.less');

// Initiates tooltips and sets their parent wrapper
Vue.use(VTooltip);
VTooltip.options.defaultContainer = '#mainWrapper';

// Disable chrome default drag/drop behavior
document.addEventListener('dragover', event => event.preventDefault());
document.addEventListener('drop', event => event.preventDefault());

document.addEventListener('DOMContentLoaded', () => {
  const store = createStore();
  const servicesManager: ServicesManager = ServicesManager.instance;
  const windowsService: WindowsService = WindowsService.instance;
  const obsApiService = ObsApiService.instance;
  const isChild = Utils.isChildWindow();
  const isFloat = Utils.isFloatWindow();

  if (isFloat) {
    ipcRenderer.on('closeWindow', () => windowsService.closeFloatWindow());
    servicesManager.listenMessages();
  } else if (isChild) {
    ipcRenderer.on('closeWindow', () => windowsService.closeChildWindow());
    servicesManager.listenMessages();
  } else {
    ipcRenderer.on('closeWindow', () => windowsService.closeMainWindow());
    AppService.instance.load();
  }

  window['obs'] = obsApiService.nodeObs;

  const vm = new Vue({
    el: '#app',
    store,
    render: h => {
      const componentName = isChild
        ? isFloat ? windowsService.state.float.componentName : (windowsService.state.child.componentName)
        : windowsService.state.main.componentName;

      return h(windowsService.components[componentName]);
    }
  });
  ipcRenderer.on(
    'window-setContents',
    (event: Electron.Event, options: IWindowOptions) => {
      windowsService.updateChildWindowOptions(options);
      const newOptions: any = Object.assign({ child: isChild }, options);
      const newURL: string = URI(window.location.href)
        .query(newOptions)
        .toString();

      window.history.replaceState({}, '', newURL);
    }
  );
  ipcRenderer.on(
    'window-setFloatContents',
    (event: Electron.Event, options: IWindowOptions) => {
      windowsService.updateFloatWindowOptions(options);
      const newOptions: any = Object.assign({ child: isChild, float: isFloat }, options);
      const newURL: string = URI(window.location.href)
        .query(newOptions)
        .toString();

      window.history.replaceState({}, '', newURL);
    }
  );
});
