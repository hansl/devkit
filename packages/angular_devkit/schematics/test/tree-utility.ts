/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { InMemorySimpleTree, Tree } from '@angular-devkit/schematics';


export function listFiles(tree: Tree | null): string[] {
  if (tree === null) {
    return [];
  }

  let files: string[] = [];
  tree.visit(p => files.push(p));

  return files;
}


export class TestTree extends InMemorySimpleTree {
  get files() { return listFiles(this); }
}
