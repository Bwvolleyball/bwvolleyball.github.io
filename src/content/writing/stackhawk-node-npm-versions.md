---
title: "Managing Node and NPM Versions in Our Projects: Best Practices for Developers"
summary: "Discover how the StackHawk team manages our node and NPM versions."
published: "2023-08-23"
topic: architecture
type: essay
# First published on the StackHawk blog. Archived here, words and images, so it outlives the original.
original:
  publisher: StackHawk blog
  url: "https://www.stackhawk.com/blog/managing-node-and-npm-versions-in-our-projects-best-practices-for-developers/"
---

It sounds ideal to have the same Node and NPM versions for all projects in your shop. However, if you have ever tried to enforce this, even with just a few projects, it tends to fall over quickly. Therefore, rather than trying to solve that holy grail of Node development, let's instead focus on making the tools work for us.

### Embracing Node Version Manager (NVM)

Our first step towards version management bliss is to encourage all of our engineers to [install Node Version Manager (NVM)](https://github.com/nvm-sh) on their local machines. NVM allows developers to easily switch between different Node versions and ensures that each project uses the appropriate version required for its specific dependencies.

There are several Node version managers. Here's the reasons we picked NVM (Disclaimer - this is not to say your node version manager does not support these):

- Node Version Management Requirements:

    - Had to be easy to switch versions. ✅ => `nvm use`

    - Had to be easy to install versions. ✅ => `nvm install x.y.z`

    - Had to be easy to upgrade npm to the latest compatible version for this node version. ✅ => `nvm install-latest-npm`

    - Bonus: Had to be automatic. ✅ => Set and forget, never worry about your node version again.

- CI Environment

    - Same configuration file can be used to drive Node version on CI => ✅ `actions/setup-node@v3` can understand this file.

    - Can automatically use newer NPM versions that are compatible. => ❌ but we came up with a workaround!

#### Bonus: Automatic NVM

[We recommend configuring NVM in auto nvm use mode](https://github.com/nvm-sh/nvm#deeper-shell-integration), which detects the appropriate Node.js version for a project based on the `.nvmrc` file present in the project's root directory as your shell enters this directory. This way, developers don't have to worry about switching Node.js versions manually; NVM handles it seamlessly!

### Utilizing the "engines" Block in `package.json`

To further enforce the compatibility of Node and NPM versions within our projects, we've started using the "engines" block in the `package.json` file. This block allows us to specify the required versions of Node and NPM for the project explicitly.

This is useful to help protect folks from accidentally using incompatible node and npm versions in the project, and is a gentle reminder to either:\
a) configure nvm in automatic mode.\
b) run `nvm use`\
c) run `npm install-latest-npm`

```json
// package.json
{
  "name": "your-project",
  "version": "1.0.0",
  "engines": {
    "node": ">=18",
    "npm": ">=9"
  }
}
```

To ensure that these specified versions are strictly adhered to, we set `engine-strict=true` in the `.npmrc` file of our projects. This flag ensures that NPM will halt the installation if the required versions are not met, preventing potential incompatibility issues.

Here's what our updated `.npmrc` looks like:\
`registry={our-registry}\ engine-strict=true`

#### Where We Needed This

This particular solution helped us solve an issue with a project stuck on Node 14. Node 14 ships with npm v6, which uses an older `package-lock.json` strategy. If folks used npm v6 instead of npm v7 (which is supported by Node 14) with the newer `package-lock.json` spec, we would experience `package-lock.json` thrash, where a perpetual tug-of-war between the 2 strategies in source control would unfold. This is not fun, and we would prefer the `package-lock.json` to stay consistent.

### Seamless CI Integration with GitHub Actions

One of the key problems we needed to solve was the seamless connection of Development mode with CI mode. These two experiences needed to be closely connected and work toghether instead of being disjointed. Remember the checklist for why we picked NVM? Well, here's why it matters. GitHub Actions can understand `.nvmrc` for setting up Node. Let's look at our shared Actions configuration:

```yaml
# github-actions-composite.yaml
runs:
  using: composite
  steps:
  ### Checkout Code
  - name: Check out repository code
    uses: actions/checkout@v3
  ### Check for .nvmrc
  - name: Check if project has nvmrc
    id: check_for_node
    uses: andstor/file-existence-action@v2
    with:
      files: ".nvmrc"
  - name: Configure Node
    if: steps.check_for_node.outputs.files_exists == 'true'
    uses: actions/setup-node@v3
    with:
      node-version-file: '.nvmrc'
```

Since this is a shared Actions configuration, we only want to setup node for builds that need it. By looking for `.nvmrc` to do this, we enforce projects that need Node to include a `.nvmrc` - That's a win! Second, by using this file to control CI, we are doing everything we can to make sure development and CI use the _same node version_ for a project.

### Handling NPM Versions in CI

While "actions/setup-node" works brilliantly for managing Node.js versions in our CI environment, we encountered a minor challenge when handling NPM versions. As of version 3, `actions/setup-node` lacks built-in tools to manage the corresponding NPM version for a particular Node version. The project simply recommends you install a newer version of npm if you need it with `npm install -g npm@x.y.z`. This is... not great... for shared CI configuration. Enter, our workaround!

To address this, we devised a clever solution by introducing the `.npm-version` file in repositories that require a specific NPM version alongside their Node.js version. Similar to the `.nvmrc` file, the `.npm-version` file contains the desired NPM version for the project.

The `.npm-version` file can look as simple as:

```
8.19.4
```

This tells our CI pipeline to use `npm@8.19.4` as you'll see below. Consider this Actions configuration:

```yaml
# github-actions-composite.yaml
runs:
  using: composite
  steps:
    ### <our node configuration from above> ###
  - name: Check if project has npm-version
    id: check_for_npm_version
    uses: andstor/file-existence-action@v2
    with:
      files: ".npm-version"
  - name: Configure Npm
    if: steps.check_for_npm_version.outputs.files_exists == 'true'
    run: |
      npm install -g npm@$(cat .npm-version| tr -d "\t\n\rv")
    shell: bash
```

In our CI pipeline, we use the `.npm-version` file's existence to trigger an NPM version upgrade command, ensuring that the required version is installed before executing other build steps.\
All we do is extract that version from our new file convention, and use it to install the version of NPM we want.

With this approach we achieve a consistent and efficient version management process for both Node and NPM in our CI environment.

Better yet, while it's not perfect, there is documentation as code for the NPM version in CI if it's not the default version shipped with Node.

### Conclusion

Managing Node and NPM versions across a multitude of projects can be a daunting task, but with the right tools and practices, it becomes an organized and streamlined process. By leveraging NVM, utilizing the "engines" block, and introducing custom version management files in our CI, we've been able to ensure compatibility and stability across our projects.

We hope that sharing our approach will help fellow developers in their version management journey. Feel free to adopt and adapt these strategies to suit your team's specific needs, and may your projects always run on the right Node and NPM versions!

_Brandon Ward is a Sr. Senior Software Engineer at StackHawk_
