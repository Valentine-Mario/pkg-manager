#!/usr/bin/env ts-node
import {
  readFile,
  parseToml,
} from "./lib";

const main = async () => {
  //if arg is passed, read arg from cmd else read toml file
  if (process.argv.length == 2) {
    //read toml file
    const toml_data = await readFile("./pkg.toml");
    //parse toml string
    const obj = parseToml(toml_data);
    //get dependency list
    const dependency_list=obj['dependencies'];
  } else {
    //read arg from command line
    //get the lasyt n elem in the array, removing the first 2
    const dependecy_list = process.argv.slice(2);
  }
};

main();
