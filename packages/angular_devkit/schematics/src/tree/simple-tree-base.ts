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
  Path,
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


export class SimpleTreeBase implements Tree {
  'constructor': typeof SimpleTreeBase;

  protected _dirs = new Map<string, Tree>();
  protected _files = new Map<string, FileEntry>();

  protected _version: number | null = null;

  protected _staging: Staging | null = null;

  constructor(private _base: Tree | null) {
    if (_base) {
      const trees = _base.subtrees();
      for (const name of Object.keys(trees)) {
        this._dirs.set(name, new (this.constructor)(trees[name]));
      }
      this._version = _base.version;
    }
  }

  get base() { return this._base; }
  get staging(): Staging {
    return this._staging || (this._staging = new SimpleStagingBase(this));
  }
  get version() { return this._version; }

  dir(name: string): Tree | null {
    if (name.endsWith('/')) {
      return this._dirs.get(name.slice(0, -1) as Path) || null;
    }

    return this._dirs.get(name as Path) || null;
  }
  file(name: string): FileEntry | null {
    return this._files.get(name as Path) || null;
  }

  subtrees() {
    const result: { [name: string]: Tree } = {};
    for (const [name, tree] of this._dirs.entries()) {
      result[name] = tree;
    }

    return result;
  }

  subfiles() {
    const result: { [name: string]: FileEntry } = {};
    for (const [name, file] of this._files.entries()) {
      result[name] = file;
    }

    return result;
  }

  getTreeOf(path: string): Tree | null {
    const p = normalize(path);
    let tree: Tree | null = this;
    for (const fragment of split(p).slice(0, -1)) {
      if (tree === null) {
        return null;
      }
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
    const maybeTree = this.getTreeOf(path);
    if (!maybeTree) {
      return null;
    }

    return maybeTree.file(basename(normalize(path)));
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
    (this.getTreeOf(action.path) as SimpleStagingBase)._actions.push({
      ...action,
      path: basename(action.path),
    });
  }

  overwrite(path: string, content: Buffer | string): void {
    if (typeof content == 'string') {
      content = new Buffer(content, 'utf-8');
    }

    (this.getTreeOf(action.path) as SimpleStagingBase)._actions.push(action);
    return this._actions.overwrite(normalize(path), content);
  }

  // Structural methods.
  create(path: string, content: Buffer | string): void {
    if (typeof content == 'string') {
      content = new Buffer(content, 'utf-8');
    }

    return this._actions.create(normalize(path), content);
  }
  delete(path: string): void {
    return this._actions.delete(normalize(path));
  }
  rename(from: string, to: string): void {
    return this._actions.rename(from, to);
  }
}
