import { strict as assert } from 'assert';
import cheerio from 'cheerio';
import nock from 'nock';
import request from 'supertest';
import sinon from 'sinon';

import server from '../../app';

const sandbox = sinon.createSandbox();

nock.disableNetConnect();
nock.enableNetConnect('127.0.0.1');

describe('404 Handler', () => {
  beforeEach(async () => {
  });

  afterEach(() => {
    sandbox.restore();
    nock.cleanAll();
  });

  it('is returned when the route does not match', async () => {
    const res = await request(server)
      .get('/some-odd-page/meow')
      .expect(404);

    const $ = cheerio.load(res.text);
    const $errorContainer = $('#main .error');

    assert($errorContainer.length, 'Expected an error page');
  });

  it('renders the default 404 page when a 404 is encountered', async () => {
    const res = await request(server)
      .get('/some-other-page/moo')
      .expect(404);

    const $ = cheerio.load(res.text);
    const errorCard = $('.error__main-card');

    assert.strictEqual(errorCard.length, 1, `expected to find a card, but found ${errorCard.length} instead`);
    assert(errorCard.find('.error__main-card__img').attr('title').includes('404'));
    assert.strictEqual(errorCard.find('h2').text(), 'You seem to have wandered off the beaten path');
  });
});
