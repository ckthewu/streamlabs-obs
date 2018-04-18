import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { remote } from 'electron';
// import { Inject } from '../../util/injector';
// import { IScenesServiceApi } from '../../services/scenes';
// import { ISourcesServiceApi, TSourceType, TPropertiesManager } from '../../services/sources';
// import { WindowsService } from '../../services/windows';
import windowMixin from '../mixins/window';

let hoverTimeout: any;

@Component({ mixins: [windowMixin] })
export default class Barrage extends Vue {
  focusBarrage: boolean = false;
  handleMouseIn(event: any) {
    if (hoverTimeout) return;
    console.log('in');
    console.log(event);
    hoverTimeout = setTimeout(() => {
      this.focus();
      hoverTimeout = undefined;
    }, 1000);
  }
  focus() {
    this.focusBarrage = true;
  }
  handleMouseOut(event: any) {
    console.log('out');
    console.log(event);
    if (hoverTimeout) clearTimeout(hoverTimeout);
    hoverTimeout = undefined;
    this.focusBarrage = false;
  }
  handeClick() {
    this.focusBarrage = !this.focusBarrage;
  }
}
