import Vue from 'vue';
import { Component } from 'vue-property-decorator';
// import { Inject } from '../../util/injector';
// import { IScenesServiceApi } from '../../services/scenes';
// import { ISourcesServiceApi, TSourceType, TPropertiesManager } from '../../services/sources';
// import { WindowsService } from '../../services/windows';
import windowMixin from '../mixins/window';

@Component({ mixins: [windowMixin] })
export default class Barrage extends Vue {
}
