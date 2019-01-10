import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { next } from '@ember/runloop';

export default Component.extend({
  tagName: 'video',
  attributeBindings: ['autoplay'],
  autoplay: true,

  connectionService: service(),

  didInsertElement() {
    this._super(...arguments);
    next(this, this.setupStream);
    console.log('VIDYO');
    this.get('connectionService').on('reconnected', () => {
      this.get('call').close();
      console.log('reinstating webcam stream');
      this.setupStream();
    });
  },

  async setupStream() {
    let mediaStream = await this.get('mediaStream');
    if (this.get('connectionService.isMaster')) {
      let call = this.get('connectionService.peer').call(
        this.get('connectionService.connection.peer'),
        mediaStream
      );
      this.setupPeerVideo(call);
    } else {
      this.get('connectionService.peer').on('call', (call) => {
        call.answer(mediaStream);
        this.setupPeerVideo(call);
      });
    }
  },

  mediaStream: computed(function() {
    let settings = {
      video: {width: {exact: 640}, height: {exact: 480}},
      audio: true,
    };
    return navigator.mediaDevices.getUserMedia(settings)
    .catch(error => {
      console.error(error);
      console.error('Returning blank stream');
      return new MediaStream();
    });
  }),

  setupPeerVideo(call) {
    this.set('call', call);
    call.on('stream', stream => {
      this.$()[0].srcObject = stream;
    });
  }
});
