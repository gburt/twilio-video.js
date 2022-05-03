/* eslint-disable no-console */
'use strict';

const assert = require('assert');
const { isFirefox } = require('../../lib/guessbrowser');

const { createLocalAudioTrack } = require('../../../es5');

describe('createLocalAudioTrack', () => {
  [
    {
      testName: 'when noise cancellation library is not hosted returns regular audio track',
      noiseCancellationOptions: { vendor: 'rnnoise', sdkAssetsPath: '/not_hosted/rnnoise' },
      expectedVendor: null
    },
    {
      testName: 'returns rnnoise track when vendor = rnnoise ',
      noiseCancellationOptions: { vendor: 'rnnoise', sdkAssetsPath: '/noisecancellation/rnnoise' },
      expectedVendor: 'rnnoise'
    },
    {
      testName: 'noise cancellation is optional',
      noiseCancellationOptions: null,
      expectedVendor: null
    }
  ].forEach(({ testName, noiseCancellationOptions, expectedVendor }) => {
    it(testName, async function()  {
      if (expectedVendor && isFirefox) {
        // third party library does not load on firefox
        // https://issues.corp.twilio.com/browse/VIDEO-9654
        // eslint-disable-next-line no-invalid-this
        this.skip();
      } else {
        const audioTrack = await createLocalAudioTrack({ noiseCancellationOptions });
        assert(audioTrack, `unexpected audioTrack ${audioTrack}`);
        if (expectedVendor) {
          assert(audioTrack.noiseCancellation, `unexpected audioTrack.noiseCancellation: ${audioTrack.noiseCancellation}`);
          assert.equal(audioTrack.noiseCancellation.vendor, expectedVendor, 'unexpected vendor');

          // ensure that source track is accessible.
          assert(audioTrack.noiseCancellation.sourceTrack.getSettings());

          // verify that noise cancellation can be enable/disable'd.
          await audioTrack.noiseCancellation.disable();
          assert.equal(audioTrack.noiseCancellation.isEnabled, false, `unexpected audioTrack.noiseCancellation.isEnabled:${audioTrack.noiseCancellation.isEnabled}`);

          await audioTrack.noiseCancellation.enable();
          assert.equal(audioTrack.noiseCancellation.isEnabled, true, `unexpected audioTrack.noiseCancellation.isEnabled:${audioTrack.noiseCancellation.isEnabled}`);

        } else {
          assert.equal(audioTrack.noiseCancellation, null, `unexpected audioTrack.noiseCancellation: ${audioTrack.noiseCancellation}`);
        }
      }
    });
  });
});