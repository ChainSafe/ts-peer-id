import { expect } from 'chai'
import * as mh from 'multihashes'
import * as crypto from '@libp2p/crypto'
const { keys } = crypto
import CID from 'cids'
import {fromString} from 'uint8arrays/from-string'

import * as PeerId from '../src/index.js'

import * as testId from './fixtures/sample-id.js'
import * as goId from './fixtures/go-private-key.js'

const testIdBytes = mh.fromHexString(testId.id)
const testIdB58String = mh.toB58String(testIdBytes)
const testPrivKey = fromString(testId.privKey, 'base64pad')

const goPeerIdString = goId.id
const goPrivKey = fromString(goId.privKey, 'base64pad')

describe("peer-id", () => {
  it('create from a PublicKey', async () => {
    const privkey = await keys.unmarshalPrivateKey(testPrivKey)
    const id = PeerId.createPeerId(privkey.public)
    expect(testIdBytes).to.deep.equal(id)
    expect(testIdB58String).to.equal(PeerId.toStringLegacy(id))
  })

  it('interoperate with go', async () => {
    const privkey = await keys.unmarshalPrivateKey(goPrivKey)
    const id = PeerId.createPeerId(privkey.public)
    expect(goPeerIdString).to.equal(PeerId.toStringLegacy(id))
  })

  it('throws on invalid CID multicodec', () => {
    // only libp2p and dag-pb are supported
    const invalidCID = new CID(1, 'raw', testIdBytes).toBaseEncodedString('base32')
    expect(() => {
      PeerId.fromString(invalidCID)
    }).to.throw()
  })

  it('throws on invalid CID value', () => {
    // using function code that does not represent valid hash function
    // https://github.com/multiformats/js-multihash/blob/b85999d5768bf06f1b0f16b926ef2cb6d9c14265/src/constants.js#L345
    const invalidCID = 'QmaozNR7DZHQK1ZcU9p7QdrshMvXqWK6gpu5rmrkPdT3L'
    expect(() => {
      PeerId.fromString(invalidCID)
    }).to.throw(/multihash unknown function code: 0x50/)
  })
});
