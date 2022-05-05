#!/usr/bin/env ts-node
import { parse, stringify } from "@iarna/toml";
import {readFile} from "./lib"
// const obj = parse(`[abc]
// foo = 123
// bar = [1,2,3]`)
// console.log(obj)
// obj['dependencies']={key:"val"};

// const str=stringify(obj);
// console.log(str)

const main = async () => {
  //if arg is passed, read arg from cmd else read toml file
  if (process.argv.length == 2) {
    //read toml file
    const toml_data=await readFile("./pkg.toml");
    console.log(toml_data);
  } else {
    //read arg from command line
    //get the lasyt n elem in the array, removing the first 2
    let dependecy_list = process.argv.slice(2);
    console.log(dependecy_list);
  }
};

main();
