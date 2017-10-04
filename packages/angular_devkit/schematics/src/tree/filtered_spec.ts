/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Path, normalize } from '@angular-devkit/core';
import { FilteredTree } from './filtered';
import { InMemorySimpleTree } from './memory';


describe('FilteredTree', () => {
  it('works', () => {
    const tree = new InMemorySimpleTree;
    tree.create('/file1', '');
    tree.create('/file2', '');
    tree.create('/file3', '');

    const filtered = new FilteredTree(tree, p => p != '/file2');

    const acc: Path[] = [];
    filtered.visit(p => acc.push(p));
    expect(acc.sort()).toEqual(['/file1', '/file3'].map(x => normalize(x)));
  });
});
