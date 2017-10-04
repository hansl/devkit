/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BaseException, Path, PathFragment, dirname, join, normalize } from '@angular-devkit/core';
import { FileDoesNotExistException } from '../exception/exception';
import { Action } from './action';
import { DirEntry, FileEntry, Staging, Tree, TreeVisitor, UpdateRecorder } from './interface';
import { UpdateRecorderBase } from './recorder';
import { CannotApplyActionException } from '@angular-devkit/schematics';


export class CannotCreateFileException extends BaseException {
  constructor(path: string) { super(`Cannot create file "${path}".`); }
}


export class NullDirEntry implements DirEntry {
  constructor(public readonly path: Path) {}

  get parent() { return this.path == '/' ? null : new NullDirEntry(dirname(this.path)); }

  subdirs(): PathFragment[] { return []; }
  subfiles(): PathFragment[] { return []; }

  dir(name: PathFragment) { return name ? new NullDirEntry(join(this.path, name)) : this; }
  file(_: PathFragment) { return null; }
}


export class NullStaging implements Staging {
  constructor(public readonly base: Tree) {}

  get actions(): Action[] { return []; }
  files(): Path[] { return []; }

  // Readonly.
  has(_path: Path): boolean { return false; }

  // Content access.
  get(_path: Path): FileEntry | null { return null; }
  read(_path: Path): Buffer | null { return null; }

  apply(action: Action) {
    throw new CannotApplyActionException(action);
  }

  // Change content of host files.
  overwrite(path: Path, _content: Buffer): void { throw new FileDoesNotExistException(path); }

  // Structural methods.
  create(path: Path, _content: Buffer): void {
    throw new CannotCreateFileException(path);
  }
  delete(path: Path): void { throw new FileDoesNotExistException(path); }
  rename(from: Path, _to: Path): void { throw new FileDoesNotExistException(from); }

  // Version management.
  get version() { return null; }
}


export class NullTree implements Tree {
  get base() { return null; }
  get staging(): Staging { return new NullStaging(this); }
  get version() { return null; }
  get root() { return new NullDirEntry(normalize('/')); }

  // Simple readonly file system operations.
  exists(_path: string) { return false; }
  get(_path: string) { return null; }
  getDir(path: string) { return new NullDirEntry(normalize(path)); }
  read(_path: string) { return null; }
  visit(_visitor: TreeVisitor) { /* nothing to visit */ };

  // Change content of host files.
  beginUpdate(path: string): never {
    throw new FileDoesNotExistException(path);
  }
  commitUpdate(record: UpdateRecorder): never {
    throw new FileDoesNotExistException(record instanceof UpdateRecorderBase
      ? record.path
      : '<unknown>');
  }

  // Change structure of the host.
  copy(path: string, _to: string): never {
    throw new FileDoesNotExistException(path);
  }
  delete(path: string): never {
    throw new FileDoesNotExistException(path);
  }
  create(path: string, _content: Buffer | string): never {
    throw new CannotCreateFileException(path);
  }
  rename(path: string, _to: string): never {
    throw new FileDoesNotExistException(path);
  }
  overwrite(path: string, _content: Buffer | string): never {
    throw new FileDoesNotExistException(path);
  }
}
