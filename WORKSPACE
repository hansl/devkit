workspace(name = "angular_devkit")

http_archive(
    name = "build_bazel_rules_nodejs",
    url = "https://github.com/bazelbuild/rules_nodejs/archive/0.9.1.zip",
    strip_prefix = "rules_nodejs-0.9.1",
    sha256 = "6139762b62b37c1fd171d7f22aa39566cb7dc2916f0f801d505a9aaf118c117f",
)

http_archive(
    name = "io_bazel_rules_webtesting",
    url = "https://github.com/bazelbuild/rules_webtesting/archive/cfcaaf98553fee8e7063b5f5c11fd1b77e43d683.zip",
    strip_prefix = "rules_webtesting-cfcaaf98553fee8e7063b5f5c11fd1b77e43d683",
    sha256 = "636c7a9ac2ca13a04d982c2f9c874876ecc90a7b9ccfe4188156122b26ada7b3",
)

http_archive(
    name = "build_bazel_rules_typescript",
    url = "https://github.com/bazelbuild/rules_typescript/archive/80ce606dcb0076378629cc34d96852302d17f8ce.zip",
    strip_prefix = "rules_typescript-80ce606dcb0076378629cc34d96852302d17f8ce",
    sha256 = "88d056510c8c731dd28b55e66b5a12f2e968e21bb02671f5b3b08a5fcb0b1a49",
)

load("@build_bazel_rules_nodejs//:defs.bzl", "check_bazel_version", "node_repositories")

check_bazel_version("0.9.0")
node_repositories(
    package_json = ["//:package.json"],
    preserve_symlinks = True,
)

local_repository(
    name = "rxjs",
    path = "node_modules/rxjs/src",
)

load("@build_bazel_rules_typescript//:defs.bzl", "ts_setup_workspace")
ts_setup_workspace()

# We get tools like Buildifier from here
git_repository(
    name = "com_github_bazelbuild_buildtools",
    remote = "https://github.com/bazelbuild/buildtools.git",
    commit = "b3b620e8bcff18ed3378cd3f35ebeb7016d71f71",
)

# The Go toolchain is used for Buildifier and some TypeScript tooling.
http_archive(
    name = "io_bazel_rules_go",
    url = "https://github.com/bazelbuild/rules_go/releases/download/0.7.1/rules_go-0.7.1.tar.gz",
    sha256 = "341d5eacef704415386974bc82a1783a8b7ffbff2ab6ba02375e1ca20d9b031c",
)

load("@io_bazel_rules_go//go:def.bzl", "go_rules_dependencies", "go_register_toolchains")

go_rules_dependencies()

go_register_toolchains()

