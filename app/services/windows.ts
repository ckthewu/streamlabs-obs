// 使用一个单例类生产各子窗口

// 页面组件
import Main from '../components/windows/Main.vue';
import Blank from '../components/windows/Blank.vue';
import Barrage from '../components/windows/Barrage.vue';

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

// TODO:新增窗口处理复杂 需重构
export class WindowsService extends StatefulService<IWindowsState> {

  static initialState: IWindowsState = {
    main: {
      componentName: 'Main',
      scaleFactor: 1,
      title: `Streamlabs OBS - Version: ${remote.process.env.SLOBS_VERSION}` // TODO:title
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

  // 页面级组件列表
  components = {
    Main,
    Blank,
    Barrage,
  };

  private windows: Electron.BrowserWindow[] = BrowserWindow.getAllWindows();


  init() {
    this.updateScaleFactor('main');
    this.updateScaleFactor('child');
    this.updateScaleFactor('float');
    // 窗口移动可能导致切换设备
    this.getWindow('main').on('move', () => this.updateScaleFactor('main'));
    this.getWindow('child').on('move', () => this.updateScaleFactor('child'));
    this.getWindow('float').on('move', () => this.updateScaleFactor('float'));
  }

  // 更新输出设备像素比
  private updateScaleFactor(windowId: TWindowId) {
    const window = this.getWindow(windowId);
    const bounds = window.getBounds();
    const currentDisplay = electron.screen.getDisplayMatching(bounds);
    this.UPDATE_SCALE_FACTOR(windowId, currentDisplay.scaleFactor);
  }

  // 弹出子窗口
  showWindow(options: Partial<IWindowOptions>) {
    ipcRenderer.send('window-showChildWindow', options);
  }

  // 弹出浮层专用窗口
  showFloatWindow(options: Partial<IWindowOptions>) {
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
