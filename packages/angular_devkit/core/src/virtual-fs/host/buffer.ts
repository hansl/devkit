/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { FileBuffer } from './interface';

declare const TextEncoder: {
  new (encoding: string): {
    encode(str: string): Uint8Array;
  };
};

declare const TextDecoder: {
  new(encoding: string): {
    decode(bytes: Uint8Array): string;
  };
};

export function stringToFileBuffer(str: string): FileBuffer {
  // If we're in Node...
  if (typeof Buffer !== 'undefined' && typeof Buffer.from === 'function') {
    const buf = Buffer.from(str);
    const ab = new ArrayBuffer(buf.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
      view[i] = buf[i];
    }

    return ab as FileBuffer;
  } else if (typeof TextEncoder !== 'undefined') {
    // Modern browsers implement TextEncode.
    return new TextEncoder('utf-8').encode(str).buffer as FileBuffer;
  } else {
    // Slowest method but sure to be compatible with every platform.
    const buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    const bufView = new Uint16Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }

    return buf as FileBuffer;
  }
}

export function fileBufferToString(fileBuffer: FileBuffer): string {
  if (typeof TextDecoder !== 'undefined') {
    // Modern browsers implement TextEncode.
    return new TextDecoder('utf-8').decode(new Uint8Array(fileBuffer));
  } else {
    return String.fromCharCode.apply(null, new Uint8Array(fileBuffer));
  }
}
