import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import windowMixin from 'components/mixins/window';
import ModalLayout from 'components/ModalLayout.vue';

@Component({
  mixins: [windowMixin],
  components: { ModalLayout }
})
export default class Main extends Vue {
}
