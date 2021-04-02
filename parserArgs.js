#!/usr/bin/env node

const fs = require('fs')
const parserArgs = require('minimist')
const pjson = require('./package.json');

const parserOptions = {
  string: ['path', 'name', 'type-dep', 'name-dep', 'val-dep'],
  boolean: ['help', 'version', 'not-look'],
  alias: {
    'h': 'help',
    'v': 'version',
    'p': 'path',
    'n': 'name',
  },
  default: {
    help: false,
    version: false,
    path: '.',
    name: 'package.json',
    'type-dep': 'dependencies',
    'not-look': false,
  }
};
const parseArgs = parserArgs(process.argv.slice(2), parserOptions);

const infoHelpSimple = `
Usage:         
        work-packagejson <command> [arguments]

The commands are:
        view      demonstrate name, version and all dependencies
        add

Use "work-packagejson help <command>" for more information about a command.

Options:
  -h, --help      display this help and exit
  -v, --version   output version information and exit

${pjson.description}`.slice(1);

const infoHelpSimple = `
Usage: work-packagejson (view | add) [options]

Options:
  -h, --help      display this help and exit
  -v, --version   output version information and exit
  -p, --path      path to json file (default: ${parserOptions.default.path})
  --name-file     name json file (default: ${parserOptions.default.name})

Options required to 'add':
  --not-look      don't look for dependencе (use ONLY if you are sure)
  --type-dep      type dependencies to add dependency if not found in json file
                  (default: '${parserOptions.default['type-dep']}')
  --name-dep      name dependency
  --val-dep       new value dependency

${pjson.description}`.slice(1);

// console.log(parseArgs);
const pathToFile = parseArgs.path + parseArgs.name;

if (process.argv.length === 2 || process.argv) {
  console.log(infoHelp);
} else if (parseArgs.version) {
  console.log(pjson.version);
} else {
  if (parseArgs._.length !== 1) {
    console.error(`Lots of undefined arguments:`, parseArgs._);
    return;
  }
  if (!['view', 'add'].includes(parseArgs._[0])) {
    console.error(`'view' or 'add' not found`);
    return;
  }
  if (parseArgs._[0] === 'add') {
    if (parseArgs['name-dep'] === undefined) {
      console.error(`'--name-dep' not found`);
      return;
    }
    if (parseArgs['val-dep'] === undefined) {
      console.error(`'--val-dep' not found`);
      return;
    }
  }
  let jsonString;
  try {
    jsonString = fs.readFileSync(pathToFile, 'utf8');
  } catch (err) {
    console.error('Error reading file from disk:', err);
    return;
  }
  let package;
  try {
    package = JSON.parse(jsonString);
  } catch (err) {
    console.error('Error parsing JSON string:', err);
    return;
  }
  if (parseArgs._[0] === 'view') {
    console.log(Object
      .keys(package)
      .filter((elem) => ['name', 'version'].includes(elem)
        || /[Dd]ependencies/.test(elem))
      .reduce((accum, elem) => {
        accum[elem] = package[elem];
        return accum;
      }, {}));
  } else {
    const typeDenendence = parseArgs['type-dep'];
    const nameDependence = parseArgs['name-dep'];
    const valDependence = parseArgs['val-dep'];
    let find = package[typeDenendence];
    if (!parseArgs['not-look']) {
      find = Object
        .keys(package)
        .filter((elem) => /[Dd]ependencies/.test(elem))
        .map((elem) => package[elem])
        .find((elem) => elem[nameDependence] !== undefined)
        ?? find;
      console.log(find);
    }
    if (find === undefined) package[typeDenendence] = find = {};
    find[nameDependence] = valDependence;
    console.log(package);
    // fs.writeFile(pathToFile, JSON.stringify(package), (err) => {
    //   if (err) console.log('Error writing file:', err)
    // })
  }
}
