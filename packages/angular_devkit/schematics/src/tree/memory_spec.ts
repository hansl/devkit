/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { fragment } from '@angular-devkit/core';
import { InMemorySimpleTree } from './memory';


describe('InMemoryTree', () => {
  it('works as expected', () => {
    const tree = new InMemorySimpleTree();

    tree.create('/hello', 'world');
    expect(tree.get('/hello')).not.toBeNull();

    const hello = tree.read('/hello');
    expect(hello && hello.toString()).toEqual('world');
  });

  it('has subdirs', () => {
    const tree = new InMemorySimpleTree();

    tree.create('/hello', 'world');
    tree.create('/hello2', 'world');

    expect(tree.root.subfiles().sort()).toEqual([fragment('hello'), fragment('hello2')]);
  });

  it('works with subdirs', () => {
    const tree = new InMemorySimpleTree();

    tree.create('/a/b/c/hello', 'world');
    const rootdirs = tree.root.subdirs();
    expect(rootdirs).toEqual([fragment('a')]);
    expect(tree.root.dir(fragment('a'))).not.toBeNull();

    const c = tree.root.dir(fragment('a')).dir(fragment('b')).dir(fragment('c'));
    expect(c).not.toBeNull();
    expect(c.subfiles()).toEqual([fragment('hello')]);

    const hello = c.file(fragment('hello'));
    expect(hello).not.toBeNull();
    expect(hello && hello.content.toString()).toBe('world');
  });
});
