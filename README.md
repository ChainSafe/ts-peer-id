# ts-peer-id

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Typescript implementation of [peer-id](https://github.com/libp2p/specs/blob/master/peer-ids/peer-ids.md#peer-ids)

### Usage

```typescript
import crypto = require('libp2p-crypto')
import {
  createPeerId,
  validatePeerId,
  toStringLegacy,
  toStringCID,
  toString,
  fromStringLegacy,
  fromStringCID,
  fromString,
  validateString,
} from 'ts-peer-id'

const privkey = await crypto.keys.generateKeyPair('secp256k1')
const pubkey = privkey.public

// Create a PeerId

const peerId: Uint8Array = createPeerId(pubkey)

// Validate a PeerId

try {
  validatePeerId(peerId)
} catch (e) {
  // an invalid PeerId will result in an error
}

// Convert a PeerId to a string

// A PeerId can be stringified in two ways:
// 1. Legacy - a raw base58-encoded string
const peerIdStr1 = toStringLegacy(peerId)
// 2. CID - a base32-encoded multicodec
const peerIdStr2 = toStringCID(peerId)

// `toString` is an alias for `toStringCID`
toString(peerId) === peerIdStr2

// Convert a stringified PeerId to a PeerId

const peerId1 = fromStringLegacy(peerIdStr1)
const peerId2 = fromStringCID(peerIdStr2)

// `fromString` will convert either legacy or CID strings to PeerId
fromString(peerIdStr1)
fromString(peerIdStr2)

// Conversion from string will perform PeerId validation
try {
  fromString('foo')
} catch (e) {
  // will error
}
```

### License

MIT

