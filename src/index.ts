import {hash} from 'fast-sha256'
import type { PublicKey } from '@libp2p/interface-keys'
import * as multibase from 'multibase'
import * as multicodec from 'multicodec'
import * as multihash from 'multihashes'
import { concat } from 'uint8arrays/concat'

type PeerIdBrand<T> = T & {["peer_id_v1"]: never}

/**
 * A `PeerId` is derived by hashing an encoded public key with multihash
 */
export type PeerId = PeerIdBrand<Uint8Array>

/**
 * A `PeerIdString` is a multibase-encoded CID or a raw base58btc-encoded multihash
 */
export type PeerIdString = PeerIdBrand<string>

/**
 * Create a peer-id from a public key
 */
export function createPeerId(pubkey: PublicKey): PeerId {
  const pubkeyBytes = pubkey.bytes
  if (pubkeyBytes.length > 42) {
    return multihash.encode(hash(pubkeyBytes), 'sha2-256') as PeerId
  }
  return multihash.encode(pubkeyBytes, 'identity') as PeerId
}

/**
 * Validate a peer-id
 *
 * Throws an error on invalid peer-id
 */
export function validatePeerId(peerId: Uint8Array): asserts peerId is PeerId {
  multihash.validate(peerId)
}

// precompute cid/multicodec prefix
// <multicodec-cidv1><multicodec-content-type>
const cidPrefix = concat([[1], multicodec.getCodeVarint('libp2p-key')])
const base32 = multibase.encoding('base32')
/**
 * Convert a peer-id to a multibase-encoded CID
 */
export function toStringCID(peerId: PeerId): PeerIdString {
  return base32.encode(concat([cidPrefix, peerId])) as PeerIdString
}

/**
 * Convert a multibase-encoded CID to a peer-id
 *
 * Throws an error on invalid peer-id
 */
export function fromStringCID(peerIdStr: string): PeerId {
  const peerId = base32.decode(peerIdStr).slice(cidPrefix.byteLength)
  validatePeerId(peerId)
  return peerId
}

/**
 * Convert a peer-id to a raw base58btc-encoded multihash
 */
export function toStringLegacy(peerId: PeerId): PeerIdString {
  return multihash.toB58String(peerId) as PeerIdString
}

/**
 * Convert a raw base58btc-encoded multihash to a peer-id
 *
 * Throws an error on invalid peer-id
 */
export function fromStringLegacy(peerIdStr: string): PeerId {
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
export function fromString(peerIdStr: string): PeerId {
  if (peerIdStr.startsWith('Qm') || peerIdStr.startsWith('1')) {
    return fromStringLegacy(peerIdStr)
  } else {
    return fromStringCID(peerIdStr)
  }
}

export function validateString(peerIdStr: string): asserts peerIdStr is PeerIdString {
  fromString(peerIdStr as PeerIdString)
}
