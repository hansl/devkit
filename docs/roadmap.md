# Angular DevKit Road Map

This is a list of features that will be worked on or are being worked on at the moment.

## CLI 1.x / 2.x

### Universal Support

Adding support for Universal application that can be built on the server. The following tasks need
to be added:

* **Schematics.** Adding generators for a server apps will make using universal in an already
  existing application really easy for users.
* **Commands.** We need to add support for all CLI commands to work properly.

### Gathering User Metrics

Opt-in for gathering anonymous data about CLI projects, e.g. build time, number of lazy routes
and average bundle sizes.

## DevKit

### DevKit Core

#### Json Schema

Move and rebuild the current json-schema library to be more useful in the devkit (performance
improvements, better support for Schema features, include refs). A new serializer focused interface
will be implemented, making it easier to use than the current one.

#### Logger

A reactive logging library that can be used to transfer logs around and manage general logging
strategies. This will be used internally by all the SDK to manage and forward logs.

This is already merged into the `core`.

#### Dependency Injection

The Angular’s core DI is not directly importable in the DevKit:
1. The SDK needs features that are not available in @angular/core. E.g. being able to, in the 
   factory, have the class being injected, so we could make ie. a Logger that has the name of the 
   constructor of that class when injected.
1. We cannot depend on @angular/core, ironically, because that would mean installing a version that
   could be different than the one in the project. We had problems with CLI 1.0 with that and made
   some hacks to make it work, but those hacks should go away.

There is a DI package available already, forked from @angular/core, made by Minko. We want to 
 integrate it into the DevKit Core to be able to use it without any external dependencies.


#### Conductor

A separated process that acts as a server to manage and run builds and operations on your project.
 The idea is that it always runs in the background and coordinate builds and serve requests. It can
 be started and stopped, and understands commands to be run.

This is in order to optimize bootstrapping the CLI and its extensions. Expansive extensions would
 clog the startup time of the CLI (as seen with some Ember CLI addons), and in order to mitigate 
 this we would keep a running background process of the CLI itself.


### Schematics

Many features are missing from Schematics. Such features include:

* **Annotations.** Attaching metadata to any files, including lazy metadata that may require a lot
  of computations.
* **Interactive Prompts.** Having default values that can be overridden by users during a prompt
  phase would be very useful.
* **Calculated Defaults.** Functions that are called, receiving the rest of the options, to
  calculate the default value of an option. This can be used, for example, for determining the 
  port of a backend service according to user input.
* **Directory Support.** Being able to list a directory instead of listing all the files in a single
  namespace. This is not guaranteed to be a feature as we still need to figure out the usefulness
  of this, but for lazy loading this could improve the bootstrap performance.
* **Lazy Loading.** Right now the current file system needs to be enumerated, even if most files
  aren’t read or used. Some folders, like .git and node_modules, aren’t really useful for most
  schematics but can have a lot of files. Only enumerating those when requested would speed up
  bootstrapping schematics.
* **Non-atomic Tasks.** Tasks are actions that should be performed only once for the whole process.
  External tasks are those who can have a system-wide side effect and cannot be reverted. Such an
  example would be to run `npm install` or adding rows to a database table. If such a task fails,
  the Schematics library cannot ensure that the system is in a reversible state.
  
  Because of their nature, tasks need specific design that enable Schematics to enqueue requests
  that will be executed at the end of the whole run, once. If those fails, the task runner itself
  will need to notify the user about the state of the system, and whether the system is stable 
  enough to continue or should fail entirely. No rollback can be done at that point.
 
  The design of tasks and particularly non-atomic ones is still early but most challenges have a 
  solution already.
* **Better History Support.** Right now everything is a single tree. The full model of a series of
  actions on top of a tree is not perfected, and there are many improvements in line for this.
* **Debugging.** Having a better history in general will improve debugging. There are also tools to
  be built to improve the debugging of schematics, both for tools that want to use the library as
  well as developers who want to implement schematics themselves.


### Refactoring Library

A big improvement over Schematics in general is going to be a refactoring library. Currently, no
 library specializes in refactoring itself. TSLint (an an example) implements some utility that 
 can be used to refactor, but does so poorly as its goal is to detect and fix errors in the code. A
 proper refactoring library would include utilities for querying, transforming and outputting code
 both from new and existing code.

Such a library could be used to, for example, query where code should be included in a schematics
 and then insert the code at the right place. Or maybe a Schematics could be used to merge two
 classes together in some deterministic way.

This is a prerequisite to having a proper update story; allowing a user to move from one version 
 of Angular (and/or other Angular packages) to another version, refactoring the code on the way.


### Build API

Currently, the CLI only supports 1 build system; Webpack. This task will design an API layer 
 inside the DevKit that people can use to swap the build system with another one.
