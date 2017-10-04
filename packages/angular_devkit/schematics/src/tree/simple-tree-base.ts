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
  PathFragment,
  basename,
  dirname,
  normalize,
  rest,
  rootname,
} from '@angular-devkit/core';
import { Action } from './action';
import {
  DirEntry,
  FileEntry,
  MergeStrategy,
  Staging,
  Tree,
  TreeSymbol,
  TreeVisitor,
  TreeVisitorCancel,
  UpdateRecorder,
} from './interface';
import { UpdateRecorderBase } from './recorder';


export abstract class SimpleDirEntryBase implements DirEntry {
  constructor(protected _path: Path) {}

  get path() { return this._path; }
  abstract get parent(): DirEntry | null;

  abstract subdirs(): PathFragment[];
  abstract subfiles(): PathFragment[];

  abstract dir(name: PathFragment): DirEntry;
  abstract file(name: PathFragment): FileEntry | null;
}


export abstract class SimpleTreeBase implements Tree {
  abstract get base(): Tree | null;
  abstract get root(): DirEntry;
  abstract protected get _staging(): Staging | null;

  get [TreeSymbol]() { return true; }

  protected _normalize(path: string) {
    return normalize('/' + path);
  }

  get staging() {

  }

  getDir(path: Path) {
    path = this._normalize(path);
    let tree = this.root;
    while (path) {
      tree = tree.dir(rootname(path));
      path = rest(path);
    }

    return tree;
  }

  get version() {
    if (this.base && this.base.version) {
      return Math.max(this.base.version, this.staging.version || -1);
    }

    return this.staging.version;
  }

  // Readonly.
  exists(path: string): boolean {
    return this.get(path) !== null;
  }

  // Content access.
  get(path: string): FileEntry | null {
    const p = this._normalize(path);

    return this.getDir(dirname(p)).file(basename(p));
  }
  visit(visitor: TreeVisitor) {
    const files: (FileEntry | null)[] = new Array(64);
    let i = 0;
    function visitDir(dir: DirEntry) {
      dir.subfiles().forEach(fragment => {
        files[i++] = dir.file(fragment);
      });
      dir.subdirs().forEach(fragment => {
        visitDir(dir.dir(fragment));
      });
    }

    try {
      visitDir(this.root);
      files.forEach(entry => entry && visitor(entry.path, entry));
    } catch (e) {
      if (e !== TreeVisitorCancel) {
        throw e;
      }
    }
  }
  read(path: string): Buffer | null {
    const entry = this.get(path);

    return entry ? entry.content : null;
  }

  // Change content of host files.
  overwrite(path: string, content: Buffer | string): void {
    if (typeof content == 'string') {
      content = new Buffer(content);
    }
    this.staging.overwrite(this._normalize(path), content);
  }
  beginUpdate(path: string): UpdateRecorder {
    const entry = this.get(path);
    if (!entry) {
      throw new FileDoesNotExistException(path);
    }

    return new UpdateRecorderBase(entry);
  }
  commitUpdate(record: UpdateRecorder): void {
    if (record instanceof UpdateRecorderBase) {
      const path = record.path;
      const entry = this.get(path);
      if (!entry) {
        throw new ContentHasMutatedException(path);
      } else {
        const newContent = record.apply(entry.content);
        this.staging.overwrite(path, newContent);
      }
    } else {
      throw new InvalidUpdateRecordException();
    }
  }

  // Structural methods.
  create(path: string, content: Buffer | string): void {
    if (typeof content == 'string') {
      content = new Buffer(content);
    }
    this.staging.create(this._normalize(path), content);
  }
  delete(path: string): void {
    this.staging.delete(this._normalize(path));
  }
  rename(from: string, to: string): void {
    this.staging.rename(this._normalize(from), this._normalize(to));
  }
}


export abstract class SimpleStagingBase implements Staging {
  abstract get base(): Tree;

  abstract get actions(): Action[];
  abstract apply(action: Action, strategy?: MergeStrategy): void;
  abstract files(): Path[];
  abstract get(path: Path): FileEntry | null;

  // Readonly.
  has(path: Path): boolean {
    return this.get(path) != null;
  }

  // Content access.
  read(path: Path): Buffer | null {
    const maybe = this.get(path);

    return maybe ? maybe.content : null;
  }

  protected abstract _overwrite(
    path: Path,
    content: Buffer,
    action?: Action,
    strategy?: MergeStrategy,
  ): void;
  protected abstract _create(
    path: Path,
    content: Buffer,
    action?: Action,
    strategy?: MergeStrategy,
  ): void;
  protected abstract _delete(
    path: Path,
    action?: Action,
    strategy?: MergeStrategy,
  ): void;
  protected abstract _rename(
    path: Path,
    to: Path,
    action?: Action,
    strategy?: MergeStrategy,
  ): void;

  // Change content of host files.
  overwrite(path: Path, content: Buffer): void {
    this._overwrite(path, content);
  }

  // Structural methods.
  create(path: Path, content: Buffer): void {
    this._create(path, content);
  }
  delete(path: Path): void {
    this._delete(path);
  }
  rename(from: Path, to: Path): void {
    this._rename(from, to);
  }

  // Version management.
  abstract readonly version: number | null;
}
