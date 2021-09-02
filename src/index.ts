import sha256 from 'fast-sha256'
import type { PublicKey } from 'libp2p-crypto'
import { encoding as multibaseEncoding } from 'multibase'
import { getCodeVarint as multicodecGetCodeVarint } from 'multicodec'
import * as multihash from 'multihashes'
import { concat as uint8ArrayConcat } from 'uint8arrays'

/**
 * A `PeerId` is derived by hashing an encoded public key with multihash
 */
export type PeerId = Uint8Array

/**
 * A `PeerIdString` is a multibase-encoded CID or a raw base58btc-encoded multihash
 */
export type PeerIdString = string

/**
 * Create a peer-id from a public key
 */
export function createPeerId(pubkey: PublicKey): PeerId {
  const pubkeyBytes = pubkey.bytes
  if (pubkeyBytes.length > 42) {
    return multihash.encode(sha256(pubkeyBytes), 'sha2-256')
  }
  return multihash.encode(pubkeyBytes, 'identity')
}

/**
 * Validate a peer-id
 *
 * Throws an error on invalid peer-id
 */
export function validatePeerId(peerId: PeerId): void {
  multihash.validate(peerId)
}

// precompute cid/multicodec prefix
// <multicodec-cidv1><multicodec-content-type>
const cidPrefix = uint8ArrayConcat([[1], multicodecGetCodeVarint('libp2p-key')])
const base32 = multibaseEncoding('base32')
/**
 * Convert a peer-id to a multibase-encoded CID
 */
export function toStringCID(peerId: PeerId): PeerIdString {
  return base32.encode(uint8ArrayConcat([cidPrefix, peerId]))
}

/**
 * Convert a multibase-encoded CID to a peer-id
 *
 * Throws an error on invalid peer-id
 */
export function fromStringCID(peerIdStr: PeerIdString): PeerId {
  const peerId = base32.decode(peerIdStr).slice(cidPrefix.byteLength)
  validatePeerId(peerId)
  return peerId
}

/**
 * Convert a peer-id to a raw base58btc-encoded multihash
 */
export function toStringLegacy(peerId: PeerId): PeerIdString {
  return multihash.toB58String(peerId)
}

/**
 * Convert a raw base58btc-encoded multihash to a peer-id
 *
 * Throws an error on invalid peer-id
 */
export function fromStringLegacy(peerIdStr: PeerIdString): PeerId {
  const peerId = multihash.fromB58String(peerIdStr)
  validatePeerId(peerId)
  return peerId
}

/**
 * Convert a peer-id to a string
 */
export function toString(peerId: PeerId): PeerIdString {
  return toStringCID(peerId)
}

/**
 * Convert a stringified peer-id to a peer-id
 *
 * Throws an error on invalid peer-id
 */
export function fromString(peerIdStr: PeerIdString): PeerId {
  if (peerIdStr.startsWith('Qm') || peerIdStr.startsWith('1')) {
    return fromStringLegacy(peerIdStr)
  } else {
    return fromStringCID(peerIdStr)
  }
}

export function validateString(peerIdStr: PeerIdString): void {
  fromString(peerIdStr)
}
