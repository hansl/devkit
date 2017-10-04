/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {
  Path,
  PathFragment,
  basename,
  dirname,
  join,
  normalize,
  rootname,
} from '@angular-devkit/core';
import { FilePredicate, Tree } from './interface';
import { InMemorySimpleDirEntry, InMemorySimpleTree } from './memory';


export class FilteredDirEntry extends InMemorySimpleDirEntry {
  constructor(protected _filter: FilePredicate<boolean>, path: Path, tree: FilteredTree) {
    super(path, tree);
  }

  subdirs(): PathFragment[] {
    const subdirs = new Set<PathFragment>(this._subdirs.keys());
    const i = this.path == '/' ? 0 : this.path.length;

    if (this._base) {
      this._base.subdirs().forEach(subdir => subdirs.add(subdir));
    }

    for (const f of this._tree.cache.keys()) {
      const entry = this._tree.get(f);
      if (f.startsWith(this.path) && dirname(f) != this.path && this._filter(f, entry)) {
        subdirs.add(rootname(normalize(f.substr(i))));
      }
    }

    // We don't apply the filter to a filtered tree's staging area, only its base.
    for (const f of this._tree.staging.files()) {
      if (f.startsWith(this.path) && dirname(f) != this.path) {
        subdirs.add(rootname(normalize(f.substr(i))));
      }
    }

    return [...subdirs];
  }

  subfiles(): PathFragment[] {
    const subfiles = new Set<PathFragment>();

    if (this._base) {
      this._base.subfiles().forEach(subfile => {
        const entry = this._base !.file(subfile);  // tslint:disable-line:non-null-operator
        if (this._filter(join(this.path, subfile), entry)) {
          subfiles.add(subfile);
        }
      });
    }

    for (const f of this._tree.cache.keys()) {
      const entry = this._tree.get(f);
      if (f.startsWith(this.path) && dirname(f) == this.path && this._filter(f, entry)) {
        subfiles.add(basename(f));
      }
    }

    // We don't apply the filter to a filtered tree's staging area, only its base.
    for (const f of this._tree.staging.files()) {
      if (f.startsWith(this.path) && dirname(f) == this.path) {
        subfiles.add(basename(f));
      }
    }

    return [...subfiles];
  }
}


export class FilteredTree extends InMemorySimpleTree {
  constructor(protected _tree: Tree, protected _filter: FilePredicate<boolean> = () => true) {
    super(_tree);

    this._root = new FilteredDirEntry(_filter, normalize('/'), this);
  }

  get filter() { return this._filter; }
}
