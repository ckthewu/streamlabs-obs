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
import Raven from 'raven-js';
import RavenVue from 'raven-js/plugins/vue';
import RavenConsole from 'raven-js/plugins/console';
import VTooltip from 'v-tooltip';

const { ipcRenderer, remote } = electron;

const slobsVersion = remote.process.env.SLOBS_VERSION;
const isProduction = process.env.NODE_ENV === 'production';

// This is the development DSN
let sentryDsn = 'https://8f444a81edd446b69ce75421d5e91d4d@sentry.io/252950';

if (isProduction) {
  // This is the production DSN
  sentryDsn = 'https://6971fa187bb64f58ab29ac514aa0eb3d@sentry.io/251674';

  electron.crashReporter.start({
    productName: 'streamlabs-obs',
    companyName: 'streamlabs',
    submitURL:
      'https://streamlabs.sp.backtrace.io:6098/post?' +
      'format=minidump&' +
      'token=e3f92ff3be69381afe2718f94c56da4644567935cc52dec601cf82b3f52a06ce',
    extra: {
      version: slobsVersion,
      processType: 'renderer'
    }
  });
}

if (isProduction || process.env.SLOBS_REPORT_TO_SENTRY) {
  Raven.config(sentryDsn, {
    release: slobsVersion,
    dataCallback: data => {
      // Because our URLs are local files and not publicly
      // accessible URLs, we simply truncate and send only
      // the filename.  Unfortunately sentry's electron support
      // isn't that great, so we do this hack.
      // Some discussion here: https://github.com/getsentry/sentry/issues/2708
      const normalize = (filename: string) => {
        const splitArray = filename.split('/');
        return splitArray[splitArray.length - 1];
      };

      if (data.exception) {
        data.exception.values[0].stacktrace.frames.forEach((frame: any) => {
          frame.filename = normalize(frame.filename);
        });

        data.culprit = data.exception.values[0].stacktrace.frames[0].filename;
      }

      return data;
    }
  })
    .addPlugin(RavenVue, Vue)
    .addPlugin(RavenConsole, console, { levels: ['error'] })
    .install();
}

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
  }else if (isChild) {
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

  // Used for replacing the contents of this window with
  // a new top level component
  ipcRenderer.on(
    'window-setContents',
    (event: Electron.Event, options: IWindowOptions) => {
      windowsService.updateChildWindowOptions(options);

      // This is purely for developer convencience.  Changing the URL
      // to match the current contents, as well as pulling the options
      // from the URL, allows child windows to be refreshed without
      // losing their contents.
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

      // This is purely for developer convencience.  Changing the URL
      // to match the current contents, as well as pulling the options
      // from the URL, allows child windows to be refreshed without
      // losing their contents.
      const newOptions: any = Object.assign({ child: isChild, float: isFloat }, options);
      const newURL: string = URI(window.location.href)
        .query(newOptions)
        .toString();

      window.history.replaceState({}, '', newURL);
    }
  );
});
