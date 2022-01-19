
# @pyramation/prompt

Improvement of https://github.com/pyramation/inquirerer that bakes in minimist style arguments. 

## Example

```js
#!/usr/bin/env node
import { prompt } from '@pyramation/prompt';
const argv = process.argv.slice(2);

const questions = [
  {
    _: true,
    name: 'root',
    type: 'string',
    required: true
  },
  {
    _: true,
    name: 'do it!',
    type: 'path',
    required: true
  }
];

(async () => {
  const values = await prompt(questions, argv);
  console.log(values);
})();
```

A wrapper around Inquirer to solve this issue: https://github.com/SBoudrias/Inquirer.js/issues/166

Allows you to override properties passed in, and won't be asked interactively. This is huge when creating real production systems where scripts need to run automatically without human interaction.

## override properties

Imagine this exists in a file `myprogram.js`:

```js
import { prompt } from '@pyramation/prompt';
const argv = process.argv.slice(2);

const questions = [
  {
    name: 'database',
    message: 'database',
    required: true,
    ...
  },
];

const { database } = await prompt(questions, argv);
```

To run interactively, just run `node myprogram.js`. However, if you want to override, simply do:

```sh
node myprogram.js --database mydb1
```

And will skip the interactive phase, unless more questions are unanswered.

## `_` properties

If you set `_: true`, then you can pass an argument into the system and it won't need the parameter name.

```js
const questions = [
  {
    _: true,
    name: 'database',
    message: 'database',
    required: true,
    ...
  },
];

const { database } = await prompt(questions, argv);
```

Now you can run with or without the `--database` flag

```sh
node myprogram.js mydb1
```

or equivalently:

```sh
node myprogram.js --database mydb1
```

## `_` properties with multiple

```
const questions = [
  {
    _: true,
    name: 'foo',
    message: 'foo',
  },
  {
    name: 'bar',
    message: 'bar',
  },
  {
    _: true,
    name: 'baz',
    message: 'baz',
  },
];

const result = await prompt(questions, argv);
```

```sh
node myprogram.js 1 3 --bar 2
```

will treat `argv` as

```
{
  _: [],
  foo: 1,
  bar: 2,
  baz: 3,
}
```

## other examples

```
const questions = [
  {
    type: 'fuzzy',
    name: 'item2',
    message: 'which do you want?',
    choices: ['a', 'b']
  }
];
```

```
const questions = [
  {
    type: 'checkbox',
    name: 'item1',
    message: 'which do you want?',
    choices: ['a', 'b']
  }
];
```
