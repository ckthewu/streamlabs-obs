// This singleton class provides a renderer-space API
// for spawning various child windows.

import Main from '../components/windows/Main.vue';
import Settings from '../components/windows/Settings.vue';
import SourcesShowcase from '../components/windows/SourcesShowcase.vue';
import SceneTransitions from '../components/windows/SceneTransitions.vue';
import AddSource from '../components/windows/AddSource.vue';
import NameSceneCollection from '../components/windows/NameSceneCollection.vue';
import NameSource from '../components/windows/NameSource.vue';
import NameScene from '../components/windows/NameScene.vue';
import NameFolder from '../components/windows/NameFolder.vue';
import SourceProperties from '../components/windows/SourceProperties.vue';
import SourceFilters from '../components/windows/SourceFilters.vue';
import AddSourceFilter from '../components/windows/AddSourceFilter.vue';
import EditStreamInfo from '../components/windows/EditStreamInfo.vue';
import AdvancedAudio from '../components/windows/AdvancedAudio.vue';
import Notifications from '../components/windows/Notifications.vue';
import Troubleshooter from '../components/windows/Troubleshooter.vue';
import Blank from '../components/windows/Blank.vue';
import Barrage from '../components/windows/Barrage.vue';
import ManageSceneCollections from 'components/windows/ManageSceneCollections.vue';
import { mutation, StatefulService } from './stateful-service';
import electron from 'electron';

const { ipcRenderer, remote } = electron;
const BrowserWindow = remote.BrowserWindow;

type TWindowId = 'main' | 'child' | 'float';

enum windowIds {'main', 'child', 'float'}

export interface IWindowOptions {
  componentName: string;
  queryParams?: Dictionary<any>;
  size?: {
    width: number;
    height: number;
  };
  scaleFactor: number;
  title?: string;
}

interface IWindowsState {
  main: IWindowOptions;
  child: IWindowOptions;
  float: IWindowOptions;
}

export class WindowsService extends StatefulService<IWindowsState> {

  static initialState: IWindowsState = {
    main: {
      componentName: 'Main',
      scaleFactor: 1,
      title: `Streamlabs OBS - Version: ${remote.process.env.SLOBS_VERSION}`
    },
    child: {
      componentName: 'Blank',
      scaleFactor: 1,
    },
    float: {
      componentName: 'Blank',
      scaleFactor: 1,
    },
  };

  // This is a list of components that are registered to be
  // top level components in new child windows.
  components = {
    Main,
    Settings,
    Barrage,
    SceneTransitions,
    SourcesShowcase,
    NameSource,
    AddSource,
    NameScene,
    NameSceneCollection,
    NameFolder,
    SourceProperties,
    SourceFilters,
    AddSourceFilter,
    Blank,
    EditStreamInfo,
    AdvancedAudio,
    Notifications,
    Troubleshooter,
    ManageSceneCollections
  };

  private windows: Electron.BrowserWindow[] = BrowserWindow.getAllWindows();


  init() {
    this.updateScaleFactor('main');
    this.updateScaleFactor('child');
    this.updateScaleFactor('float');
    this.getWindow('main').on('move', () => this.updateScaleFactor('main'));
    this.getWindow('child').on('move', () => this.updateScaleFactor('child'));
    this.getWindow('float').on('move', () => this.updateScaleFactor('float'));
  }

  private updateScaleFactor(windowId: TWindowId) {
    const window = this.getWindow(windowId);
    const bounds = window.getBounds();
    const currentDisplay = electron.screen.getDisplayMatching(bounds);
    this.UPDATE_SCALE_FACTOR(windowId, currentDisplay.scaleFactor);
  }

  showWindow(options: Partial<IWindowOptions>) {
    ipcRenderer.send('window-showChildWindow', options);
  }

  showFloatWindow(options: Partial<IWindowOptions>) {
    console.log('showFloatWindow')
    ipcRenderer.send('window-showFloatWindow', options);
  }

  closeChildWindow() {
    ipcRenderer.send('window-closeChildWindow');

    // This prevents you from seeing the previous contents
    // of the window for a split second after it is shown.
    this.updateChildWindowOptions({ componentName: 'Blank' });

    // Refocus the main window
    ipcRenderer.send('window-focusMain');
  }

  closeFloatWindow() {
    ipcRenderer.send('window-closeFloatWindow');

    // This prevents you from seeing the previous contents
    // of the window for a split second after it is shown.
    this.updateChildWindowOptions({ componentName: 'Blank' });

    // Refocus the main window
    ipcRenderer.send('window-focusMain');
  }

  closeMainWindow() {
    remote.getCurrentWindow().close();
  }


  getChildWindowOptions(): IWindowOptions {
    return this.state.child;
  }

  getChildWindowQueryParams(): Dictionary<string> {
    return this.getChildWindowOptions().queryParams || {};
  }


  updateChildWindowOptions(options: Partial<IWindowOptions>) {
    this.UPDATE_CHILD_WINDOW_OPTIONS(options);
  }

  getFloatWindowOptions(): IWindowOptions {
    return this.state.float;
  }

  getFloatWindowQueryParams(): Dictionary<string> {
    return this.getFloatWindowOptions().queryParams || {};
  }


  updateFloatWindowOptions(options: Partial<IWindowOptions>) {
    this.UPDATE_FLOAT_WINDOW_OPTIONS(options);
  }

  updateMainWindowOptions(options: Partial<IWindowOptions>) {
    this.UPDATE_MAIN_WINDOW_OPTIONS(options);
  }


  private getWindow(windowId: TWindowId): Electron.BrowserWindow {
    return this.windows[windowIds[windowId]];
  }


  @mutation()
  private UPDATE_CHILD_WINDOW_OPTIONS(options: Partial<IWindowOptions>) {
    this.state.child = { ...this.state.child, ...options };
  }

  @mutation()
  private UPDATE_FLOAT_WINDOW_OPTIONS(options: Partial<IWindowOptions>) {
    this.state.float = { ...this.state.float, ...options };
  }

  @mutation()
  private UPDATE_MAIN_WINDOW_OPTIONS(options: Partial<IWindowOptions>) {
    this.state.main = { ...this.state.main, ...options };
  }

  @mutation()
  private UPDATE_SCALE_FACTOR(windowId: TWindowId, scaleFactor: number) {
    this.state[windowId].scaleFactor = scaleFactor;
  }
}
