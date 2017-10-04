/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { FilteredTree } from './filtered';
import { FilePredicate, MergeStrategy, Tree } from './interface';
import { InMemorySimpleTree } from './memory';


export function empty() { return new InMemorySimpleTree(); }

export function branch(tree: Tree) {
  return new InMemorySimpleTree(tree);
}

export function merge(tree: Tree, other: Tree, strategy: MergeStrategy = MergeStrategy.Default) {
  const result = new InMemorySimpleTree(tree);
  other.staging.actions.forEach(action => {
    result.staging.apply(action, strategy);
  });

  return result;
}

export function partition(tree: Tree, predicate: FilePredicate<boolean>): [Tree, Tree] {
  return [
    new FilteredTree(tree, predicate),
    new FilteredTree(tree, (path, entry) => !predicate(path, entry)),
  ];
}

export function optimize(tree: Tree) {
  return tree;
}
