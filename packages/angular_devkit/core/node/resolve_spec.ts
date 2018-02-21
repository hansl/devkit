/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// tslint:disable:no-any
// tslint:disable-next-line:no-implicit-dependencies
import { resolve } from '@angular-devkit/core/node';
import * as path from 'path';

describe('resolve', () => {

  it('works', () => {
    expect(resolve('tslint', { basedir: process.cwd() }))
      .toBe(path.join(process.cwd(), 'node_modules/tslint/lib/index.js'));
    expect(resolve('tslint', { basedir: __dirname, preserveSymlinks: false }))
      .toBe(require.resolve('tslint'));

    expect(() => resolve('npm', { basedir: '/' })).toThrow();

    expect(() => resolve('npm', { basedir: '/', checkGlobal: true })).not.toThrow();
  });

});
