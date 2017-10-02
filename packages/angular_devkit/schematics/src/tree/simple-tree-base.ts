/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {
  ContentHasMutatedException,
  FileDoesNotExistException,
  InvalidUpdateRecordException,
  PathFragment,
  basename,
  normalize,
  split,
} from '@angular-devkit/core';
import { Action, ActionList } from './action';
import {
  FileEntry,
  MergeStrategy,
  Staging,
  Tree,
  UpdateRecorder,
} from './interface';
import { UpdateRecorderBase } from './recorder';


export abstract class SimpleTreeBase implements Tree {
  protected _version: number | null = null;
  protected _staging: Staging | null = null;

  constructor(protected _base: Tree | null) {
    if (_base) {
      this._version = _base.version;
    }
  }

  get base() { return this._base; }
  get staging(): Staging {
    return this._staging || (this._staging = new SimpleStagingBase(this));
  }
  get version() { return this._version; }

  abstract subtrees(): PathFragment[];
  abstract subfiles(): PathFragment[];
  abstract dir(name: PathFragment): Tree;
  abstract file(name: PathFragment): FileEntry | null;

  getTreeOf(path: string): Tree {
    const p = normalize(path);
    let tree: Tree = this;
    for (const fragment of split(p).slice(0, -1)) {
      tree = tree.dir(fragment);
    }

    return tree;
  }

  exists(path: string) {
    return this.get(path) !== null;
  }
  read(path: string) {
    const maybeFile = this.get(path);

    return maybeFile ? maybeFile.content : null;
  }
  get(path: string) {
    return this.getTreeOf(path).file(basename(normalize(path)));
  }

  overwrite(path: string, content: Buffer | string): void {
    return this.staging.overwrite(path, content);
  }

  beginUpdate(path: string): UpdateRecorder {
    const entry = this.get(path);
    if (!entry) {
      throw new FileDoesNotExistException(path);
    }

    return new UpdateRecorderBase(entry);
  }

  commitUpdate(record: UpdateRecorder) {
    if (record instanceof UpdateRecorderBase) {
      const path = record.path;
      const entry = this.get(path);
      if (!entry) {
        throw new ContentHasMutatedException(path);
      } else {
        const newContent = record.apply(entry.content);
        this.overwrite(path, newContent);
      }
    } else {
      throw new InvalidUpdateRecordException();
    }
  }

  // Structural methods.
  create(path: string, content: Buffer | string): void {
    return this.staging.create(path, content);
  }
  delete(path: string): void {
    return this.staging.delete(path);
  }
  rename(from: string, to: string): void {
    return this.staging.rename(from, to);
  }
}


export class InMemoryTree extends SimpleTreeBase {
  protected _dirs = new Map<PathFragment, SimpleTreeBase>();
  protected _files = new Map<PathFragment, FileEntry>();

  subtrees(): PathFragment[];
  subfiles(): PathFragment[];
  dir(name: PathFragment): Tree;
  file(name: PathFragment): FileEntry | null;
}


export class SimpleStagingBase extends SimpleTreeBase implements Staging {
  protected _actions: ActionList;

  get version() {
    return this._actions.length
      ? this._actions.get(this._actions.length - 1).id
      : super.version;
  }
  get staging() { return this; }

  get actions() { return [...this._actions]; }
  push(action: Action, _strategy?: MergeStrategy) {
    // TODO: validate the merge strategy.
    this._actions.push({
      ...action,
      path: basename(action.path),
    });
  }

  overwrite(path: string, content: Buffer | string): void {
    if (typeof content == 'string') {
      content = new Buffer(content, 'utf-8');
    }

    this._actions.overwrite(normalize(path), content);
  }

  // Structural methods.
  create(path: string, content: Buffer | string): void {
    if (typeof content == 'string') {
      content = new Buffer(content, 'utf-8');
    }

    this._actions.create(normalize(path), content);
  }
  delete(path: string): void {
    this._actions.delete(normalize(path));
  }
  rename(from: string, to: string): void {
    this._actions.rename(normalize(from), normalize(to));
  }
}
