### A simple package manager for Node JS

This is a simple demonstration of a package manager for Node JS, that does not cover all the edge cases. Just the very basic implementation. 

* chmod the `index.ts` file to make the shebang executable 

* Be sure to have a `pkg.toml` file in your dir

* To install via cli run the command `./index.ts i <packages>` or `./index.ts install <packages>`

* To install all `dependencies` and `devDependncies` in an already exisiting `pkg.toml` file, run `./index.ts i` or `./index.ts install`

* To execute scripts, create a script section in your `toml` file eg

```js
[scripts]
install = "ts-node index.ts i"
```
Then run the command `./index.ts exec install`

* To delete a package run the command `./index.ts delete <packages>` or `./index.ts d <packages>`