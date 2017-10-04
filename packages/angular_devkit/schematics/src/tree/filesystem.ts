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
  split, fragment,
} from '@angular-devkit/core';
import { LazyFileEntry } from './entry';
import { DirEntry, FileEntry, Staging, Tree } from './interface';
import { InMemorySimpleStaging } from './memory';
import { SimpleDirEntryBase, SimpleTreeBase } from './simple-tree-base';


export interface FileSystemTreeHost {
  listDirectory: (path: string) => string[];
  isDirectory: (path: string) => boolean;
  readFile: (path: string) => Buffer;

  join: (path1: string, other: string) => string;
}


export class FileSystemDirEntry extends SimpleDirEntryBase {
  protected _subdirs = new Map<PathFragment, FileSystemDirEntry>();
  protected _subfiles = new Map<PathFragment, FileEntry>();

  constructor(path: Path, protected _system: string, protected _tree: FileSystemTree) {
    super(path);
  }

  get path() { return this._path; }
  get parent() { return this._path == '/' ? null : this._tree.getDir(dirname(this._path)); }

  subdirs(): PathFragment[] {
    const subdirs = new Set<PathFragment>(this._subdirs.keys());
    const i = this.path == '/' ? 0 : this.path.length;

    const host = this._tree.host;
    host.listDirectory(this._system).forEach(p => {
      if (host.isDirectory(host.join(this._system, p))) {
        subdirs.add(fragment(p));
      }
    });

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

    const host = this._tree.host;
    host.listDirectory(this._system).forEach(p => {
      if (!host.isDirectory(host.join(this._system, p))) {
        subfiles.add(fragment(p));
      }
    });

    for (const f of this._tree.staging.files()) {
      if (f.startsWith(this.path) && dirname(f) == this.path) {
        subfiles.add(basename(f));
      }
    }

    return [...subfiles];
  }

  dir(name: PathFragment): DirEntry {
    let maybe = this._subdirs.get(name);
    if (!maybe) {
      const path = join(this.path, name);
      maybe = new FileSystemDirEntry(path, this._tree.host.join(this._system, name), this._tree);
      this._subdirs.set(name, maybe);
    }

    return maybe;
  }

  file(name: PathFragment): FileEntry | null {
    let maybe = this._subfiles.get(name);
    if (!maybe) {
      const path = join(this.path, name);
      const systemPath = this._tree.host.join(this._system, name);
      maybe = new LazyFileEntry(path, () => this._tree.host.readFile(systemPath));
      this._subfiles.set(name, maybe);
    }

    return maybe;
  }
}


export class FileSystemTree extends SimpleTreeBase {
  protected _root = new FileSystemDirEntry(normalize('/'), '', this);
  protected _staging = new InMemorySimpleStaging(this);

  constructor(protected _host: FileSystemTreeHost) {
    super();  // FileSystemTree cannot have a base.
  }

  get base(): Tree | null { return null; }
  get host() { return this._host; }
  get root(): DirEntry { return this._root; }
  get staging(): Staging { return this._staging; }

  get(path: string): FileEntry | null {
    const p = normalize(path);
    const maybe = this.staging.get(p);
    if (maybe) {
      return maybe;
    } else {
      let dir = this.root;
      split(dirname(p)).forEach(fragment => dir = dir.dir(fragment));

      return dir.file(basename(p)) || null;
    }
  }
}


export class InMemoryFileSystemTreeHost implements FileSystemTreeHost {
  private _content: { [path: string]: Buffer };
  private _files: string[];
  constructor(content: { [path: string]: string }) {
    this._content = Object.create(null);
    Object.keys(content).forEach(path => {
      path = normalize(path);
      this._content[path] = new Buffer(content[path]);
    });
    this._files = Object.keys(this._content);
  }

  listDirectory(path: string) {
    path = normalize(path).replace(/\/?$/, '/');

    return Object.keys(
      this._files
          .filter(p => p.startsWith(path))
          .map(p => p.substr(path.length))
          .map(p => p.replace(/\/.*$/, ''))
          .reduce((acc: {[k: string]: boolean}, p) => {
            acc[p] = true;

            return acc;
          }, {}),
    ).sort();
  }
  isDirectory(path: string) {
    path = normalize(path);

    return path == '/' || this._files.some(p => p.split('/').slice(0, -1).join('/') == path);
  }
  readFile(path: string) {
    path = normalize(path);

    return this._content[path] || new Buffer('');
  }

  join(path1: string, path2: string) {
    return normalize(path1 + '/' + path2);
  }
}
