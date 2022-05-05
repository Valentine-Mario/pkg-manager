#!/usr/bin/env ts-node
import { readFile, parseToml } from "./lib";
import { getLatestVersion } from "./api";
import { JsonMap } from "@iarna/toml";

const main = async () => {
  //if arg is passed, read arg from cmd else read toml file
  if (process.argv[2] === "install" || process.argv[2] === "i") {
    if (process.argv.length == 2) {
      //read toml file
      const toml_data = await readFile("./pkg.toml");
      //parse toml string
      const obj = parseToml(toml_data);
      //get dependency list
      const dependency_list = obj["dependencies"];
    } else {
      //craete an empty JSON map
      let cmd_map: JsonMap = {};

      //read arg from command line
      //get the lasyt n elem in the array, removing the first 2
      const dependecy_list = process.argv.slice(3);

      for (let i of dependecy_list) {
        cmd_map[i] = await getLatestVersion(i);
      }

      console.log(cmd_map);
    }
  } else {
    console.error("invalid operation");
  }
};

main();
