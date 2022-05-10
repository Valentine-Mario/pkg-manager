#!/usr/bin/env ts-node
import { readFile, parseToml } from "./lib";
import {
  getLatestVersion,
  getImmedteDep,
  getNestedDep,
  getTarballLinkAndName,
} from "./api";
import { JsonMap } from "@iarna/toml";
import { copySync } from "fs-extra";

const main = async () => {
  //if arg is passed, read arg from cmd else read toml file
  if (process.argv[2] === "install" || process.argv[2] === "i") {
    if (process.argv.length == 3) {
      //read toml file
      const toml_data = await readFile("./pkg.toml");
      //parse toml string
      const obj = parseToml(toml_data);
      //get dependency list
      const dependency_list = obj["dependencies"] as object;
      //get dev dependencies
      const dev_dependency_list = obj["devDependncies"] as object;
      //merge both dep and devDep
      const all_dependencies = { ...dependency_list, ...dev_dependency_list };
    } else {
      //craete an empty JSON map
      let cmd_map: JsonMap = {};
      let aggregated_dep: JsonMap = {};

      //read arg from command line
      //get the last n elem in the array, removing the first 2
      const dependecy_list = process.argv.slice(3);
      const latest_list = [];

      for (let i of dependecy_list) {
        latest_list.push(getLatestVersion(i));
      }
      const resolved_list = await Promise.all(latest_list);
      for (let item of resolved_list) {
        cmd_map[item[0]] = item[1];
      }

      for (let cli_dep in cmd_map) {
        aggregated_dep[cli_dep] = cmd_map[cli_dep];
        const immediteDep = await getImmedteDep(
          cli_dep,
          cmd_map[cli_dep] as string
        );
        for (let immed_dep in immediteDep) {
          aggregated_dep[immed_dep] = immediteDep[immed_dep];
          const nestedDep = await getNestedDep(
            immed_dep,
            immediteDep[immed_dep] as string
          );
          for (let nested_dep in nestedDep) {
            aggregated_dep[nested_dep] = nestedDep[nested_dep];
          }
        }
      }
      console.log(aggregated_dep);
    }
  } else {
    console.error("invalid operation");
  }
};

main();
