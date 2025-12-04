## Build

### 1. Go IPC Server Build
Build the Go IPC server binary:
```bash
cd resources
make all
```

To build for specific platforms:
- macOS: `make macos` or `make macos-x64`, `make macos-arm64`
- Linux: `make linux-all` or `make linux-x64`, `make linux-arm64`, `make linux-arm`
- Windows: `make win` or `make win-x64`, `make win-arm64`, `make win-ia32`

### 2. Package
Package the Electron app:
```bash
yarn package
```

### 3. Make
Create distributable installer files:
```bash
yarn make
```

<br><br><br>

## Supported OS and Architectures

| GitHub Actions Runner | Architecture | Platform |
|----------------------|-------------|----------|
| `ubuntu-latest` + `x64` | x64 | Linux (x64) |
| `ubuntu-24.04-arm` + `armv7l` | armv7l | Linux (ARMv7l, 32bit ARM) |
| `ubuntu-24.04-arm` + `arm64` | arm64 | Linux (ARM64) |
| `macos-latest` + `arm64` | arm64 | macOS (Apple Silicon, ARM64) |
| `macos-15-intel` + `x64` | x64 | macOS (Intel, x64) |
| `windows-latest` + `x64` | x64 | Windows 10/11 (64bit, x64) |
| `windows-11-arm` + `arm64` | arm64 | Windows 11 on ARM (ARM64) |
| `windows-latest` + `ia32` | ia32 | Windows 10/11 (32bit, ia32) |

<br><br><br>

## Release Process

### Stable Release

Stable releases are created from branches with the format `v{version}`.

- Git branch name: `v0.0.1`, `v1.0.0`, etc.
- Git release(tag)  name: `v0.0.1`
- File name: `StarMesh-0.0.1-{arch}.{ext}`

### Beta Release

Beta releases are created from branches with the format `v{version}-beta.{betaVersion}`.

- Git branch name: `v0.0.1-beta.1`, `v0.0.1-beta.2`, etc.
- Git release(tag) name: `beta.1-v0.0.1`
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

These environment variables are automatically set by the GitHub Actions workflow.