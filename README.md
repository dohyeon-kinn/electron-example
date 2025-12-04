# Release Process

### Stable Release

Stable releases are created from branches with the format `v{version}`.

- Branch name: `v0.0.1`, `v1.0.0`, etc.
- Tag name: `v0.0.1`
- Release name: `v0.0.1`
- File name: `StarMesh-0.0.1-{arch}.{ext}`

### Beta Release

Beta releases are created from branches with the format `v{version}-beta.{betaVersion}`.

- Branch name: `v0.0.1-beta.1`, `v0.0.1-beta.2`, etc.
- Tag name: `beta-v0.0.1-beta.1`
- Release name: `beta-v0.0.1-beta.1`
- File name: `StarMesh-0.0.1-beta.1-{arch}.{ext}`

#### How to Create a Beta Release

1. Create a beta branch:
   ```bash
   git checkout -b v0.0.1-beta.1
   ```

2. Push the branch to automatically create a release:
   ```bash
   git push origin v0.0.1-beta.1
   ```

3. GitHub Actions will automatically:
   - Extract the base version (`0.0.1`) and beta version (`1`) from the branch name
   - Add `-beta.1` suffix to the file name
   - Use `beta-v0.0.1-beta.1` format for the tag name
   - Mark it as a Pre-release

### Environment Variables

- `PRE_RELEASE`: When set to `true`, the release is treated as a beta release
- `BETA_VERSION`: Beta version number (e.g., `1`, `2`)
- `PACKAGE_VERSION`: Package version (e.g., `0.0.1`)

These environment variables are automatically set by the GitHub Actions workflow.