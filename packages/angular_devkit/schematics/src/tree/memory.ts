/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {
  FileAlreadyExistException,
  FileDoesNotExistException,
  MergeConflictException,
  Path,
  PathFragment,
  basename,
  dirname,
  join,
  normalize,
  rootname,
  split,
} from '@angular-devkit/core';
import { Action, ActionList, UnknownActionException } from './action';
import { SimpleFileEntry } from './entry';
import { DirEntry, FileEntry, MergeStrategy, Staging, Tree } from './interface';
import { SimpleDirEntryBase, SimpleStagingBase, SimpleTreeBase } from './simple-tree-base';


export class InMemorySimpleDirEntry extends SimpleDirEntryBase {
  protected _subdirs = new Map<PathFragment, InMemorySimpleDirEntry>();
  protected _base: DirEntry | null;

  constructor(path: Path, protected _tree: InMemorySimpleTree) {
    super(path);
    if (_tree.base) {
      let dir = _tree.base.root;
      split(path).forEach(fragment => dir = dir.dir(fragment));
      this._base = dir;
    } else {
      this._base = null;
    }
  }

  get path() { return this._path; }
  get parent() { return this._path == '/' ? null : this._tree.getDir(dirname(this._path)); }

  subdirs(): PathFragment[] {
    const subdirs = new Set<PathFragment>(this._subdirs.keys());
    const i = this.path == '/' ? 0 : this.path.length;

    if (this._base) {
      this._base.subdirs().forEach(subdir => subdirs.add(subdir));
    }

    for (const f of this._tree.cache.keys()) {
      if (f.startsWith(this.path) && dirname(f) != this.path) {
        const subf = f.substr(i);
        subdirs.add(rootname(normalize(subf)));
      }
    }

    for (const f of this._tree.staging.files()) {
      if (f.startsWith(this.path) && dirname(f) != this.path) {
        const subf = f.substr(i);
        subdirs.add(rootname(normalize(subf)));
      }
    }

    return [...subdirs];
  }

  subfiles(): PathFragment[] {
    const subfiles = new Set<PathFragment>();

    if (this._base) {
      this._base.subfiles().forEach(subfile => subfiles.add(subfile));
    }

    for (const f of this._tree.cache.keys()) {
      if (f.startsWith(this.path) && dirname(f) == this.path) {
        subfiles.add(basename(f));
      }
    }

    for (const f of this._tree.staging.files()) {
      if (f.startsWith(this.path) && dirname(f) == this.path) {
        subfiles.add(basename(f));
      }
    }

    return [...subfiles];
  }

  dir(name: PathFragment): DirEntry {
    if (name == '') {
      return this;
    }
    let maybe = this._subdirs.get(name);
    if (!maybe) {
      const path = join(this.path, name);
      maybe = new InMemorySimpleDirEntry(path, this._tree);
      this._subdirs.set(name, maybe);
    }

    return maybe;
  }

  file(name: PathFragment): FileEntry | null {
    return this._tree.get(join(this.path, name));
  }
}


export class InMemorySimpleTree extends SimpleTreeBase {
  protected _root = new InMemorySimpleDirEntry(this._normalize('/'), this);
  protected _staging = new InMemorySimpleStaging(this);

  protected _cache = new Map<Path, FileEntry>();

  get base(): Tree | null { return this._base || null; }
  get cache() { return this._cache; }
  get root(): DirEntry { return this._root; }
  get staging(): Staging { return this._staging; }

  get(path: string): FileEntry | null {
    const p = this._normalize(path);

    return this._cache.get(p)
        || this.staging.get(p)
        || (this._base && this._base.get(p))
        || null;
  }

  constructor(protected _base?: Tree) { super(); }
}


export class InMemorySimpleStaging extends SimpleStagingBase {
  protected _actions = new ActionList();
  protected _cache = new Map<Path, FileEntry>();

  get actions() {
    this._actions.optimize();

    return [...this._actions];
  }
  get base(): Tree { return this._base; }
  get version() { return null; }

  constructor(protected _base: Tree) { super(); }

  apply(action: Action, strategy?: MergeStrategy): void {
    if (this._actions.has(action)) {
      return;
    }
    switch (action.kind) {
      case 'o':
        // Update the action buffer.
        this._overwrite(action.path, action.content, action, strategy);
        break;

      case 'c':
        if (this._cache.has(action.path)) {
          switch (strategy) {
            case MergeStrategy.Error: throw new MergeConflictException(action.path);
            case MergeStrategy.Overwrite:
              this._overwrite(action.path, action.content, action);
              break;
          }
        } else {
          this._create(action.path, action.content, action);
        }
        break;

      case 'r':
        this._rename(action.path, action.to, action, strategy);
        break;

      case 'd': this._delete(action.path, action); break;

      default: throw new UnknownActionException(action);
    }
  }
  files(): Path[] { return [...this._cache.keys()]; }
  get(path: Path): FileEntry | null {
    return this._cache.get(path) || null;
  }

  protected _overwrite(path: Path, content: Buffer, action?: Action, _strategy?: MergeStrategy) {
    // Update the action buffer.
    if (action) {
      this._actions.push(action);
    } else {
      this._actions.overwrite(path, content);
    }
    this._cache.set(path, new SimpleFileEntry(path, content));
  }
  protected _create(path: Path, content: Buffer, action?: Action) {
    if (this._cache.has(path)) {
      throw new FileAlreadyExistException(path);
    }

    if (action) {
      this._actions.push(action);
    } else {
      this._actions.create(path, content);
    }
    this._cache.set(path, new SimpleFileEntry(path, content));
  }
  protected _rename(
    path: Path,
    to: Path,
    action?: Action,
    strategy: MergeStrategy = MergeStrategy.Default,
  ) {
    const entry = this.get(path);
    if (!entry) {
      throw new FileDoesNotExistException(path);
    }
    if (this._cache.has(to) && !(strategy & MergeStrategy.AllowOverwriteConflict)) {
      throw new FileAlreadyExistException(to);
    }

    if (action) {
      this._actions.push(action);
    } else {
      this._actions.rename(path, to);
    }

    this._cache.set(to, new SimpleFileEntry(to, entry.content));
    this._cache.delete(path);
  }
  protected _delete(path: Path, action?: Action) {
    if (!this.get(path)) {
      throw new FileDoesNotExistException(path);
    }

    if (action) {
      this._actions.push(action);
    } else {
      this._actions.delete(path);
    }
    this._cache.delete(path);
  }
}
