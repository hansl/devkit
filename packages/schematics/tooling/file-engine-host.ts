import {ExportStringRef} from './export-ref';
import {FileSystemHost} from './file-system-host';
import {
  Collection,
  CollectionDescription,
  EngineHost,
  FileSystemTree,
  RuleFactory,
  SchematicDescription,
  Source,
  TypedSchematicContext,
} from '../src/index';

import {readFileSync} from 'fs';
import {dirname, resolve} from 'path';
import {Url} from 'url';


export interface FileSystemCollectionDescription {
  readonly path: string;
  readonly schematics: { [name: string]: FileSystemSchematicDescription };
}


export interface FileSystemSchematicDescription {
  readonly path: string;
  readonly factory: string;
  readonly description: string;
  readonly schema?: string;

  readonly schemaJson?: Object;
}


/**
 * Used to simplify typings.
 */
export declare type FileSystemCollection
  = Collection<FileSystemCollectionDescription, FileSystemSchematicDescription>;
export declare type FileSystemCollectionDesc
  = CollectionDescription<FileSystemCollectionDescription>;
export declare type FileSystemSchematicDesc
  = SchematicDescription<FileSystemCollectionDescription, FileSystemSchematicDescription>;
export declare type FileSystemSchematicContext
  = TypedSchematicContext<FileSystemCollectionDescription, FileSystemSchematicDescription>;



/**
 * A simple EngineHost that uses FileSystem to resolve collections.
 */
export class FileSystemEngineHost implements EngineHost<FileSystemCollectionDescription,
                                                        FileSystemSchematicDescription> {
  private _collectionMap = new Map<string, FileSystemCollectionDesc>();

  constructor() {}

  /**
   * Register a collection JSON with its name.
   */
  registerCollection(path: string): string {
    const collectionDesc = JSON.parse(readFileSync(path, 'utf-8')) as FileSystemCollectionDesc;
    const maybeCollection = this._collectionMap.get(collectionDesc.name);
    if (maybeCollection && maybeCollection.path !== path) {
      throw new Error();
    }

    this._collectionMap.set(collectionDesc.name, {
      ...collectionDesc,
      path
    });
    return collectionDesc.name;
  }

  listSchematics(collection: FileSystemCollection) {
    return Object.keys(collection.description.schematics);
  }
  listCollections() {
    return [...this._collectionMap.keys()];
  }

  /**
   *
   * @param name
   * @return {{path: string}}
   */
  createCollectionDescription(name: string): FileSystemCollectionDesc | null {
    const description = this._collectionMap.get(name);
    if (!description) {
      return null;
    }

    return description;
  }

  createSchematicDescription(
    name: string, collection: FileSystemCollectionDesc): FileSystemSchematicDesc | null {
    if (!(name in collection.schematics)) {
      return null;
    }

    const collectionPath = dirname(collection.path);
    const description = collection.schematics[name];

    if (!description) {
      return null;
    }

    // Use any on this ref as we don't have the OptionT here, but we don't need it (we only need
    // the path).
    const ref = new ExportStringRef<RuleFactory<any>>(description.factory, collectionPath);
    let schema = description.schema;
    let schemaJson = undefined;
    if (schema) {
      const schemaRef = new ExportStringRef<Object>(schema, collectionPath, false);
      schema = schemaRef.module;
      schemaJson = schemaRef.ref;
    }

    // Validate the schema.
    return {
      ...description,
      schema,
      schemaJson,
      name,
      path: ref.path,
      collection
    };
  }

  createSourceFromUrl(url: Url): Source | null {
    switch (url.protocol) {
      case '':
      case 'file:':
        return (context: FileSystemSchematicContext) => {
          // Resolve all file:///a/b/c/d from the schematic's own path, and not the current
          // path.
          const root = resolve(context.schematic.description.path, url.path);
          return new FileSystemTree(new FileSystemHost(root), true);
        };
    }

    return null;
  }

  getSchematicRuleFactory<OptionT>(
    schematic: FileSystemSchematicDesc,
    collection: FileSystemCollectionDesc): RuleFactory<OptionT> {

    const collectionPath = dirname(collection.path);
    const ref = new ExportStringRef<RuleFactory<OptionT>>(schematic.factory, collectionPath);

    return ref.ref;
  }

}
