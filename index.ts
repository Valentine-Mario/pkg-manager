#!/usr/bin/env ts-node
import {
  readFile,
  parseToml,
  execScript,
  stringifyObj,
  writeFile,
} from "./lib";
import {
  getLatestVersion,
  getImmedteDep,
  getNestedDep,
  getTarballLinkAndName,
} from "./api";
import { JsonMap } from "@iarna/toml";

const main = async () => {
  try {
    //read and parse toml file
    const toml_data = await readFile("./pkg.toml");
    const obj = parseToml(toml_data);

    //if arg is passed, read arg from cmd else read toml file
    if (process.argv[2] === "install" || process.argv[2] === "i") {
      if (process.argv.length == 3) {
        //get dependency list
        const dependency_list = obj["dependencies"] as object;
        //get dev dependencies
        const dev_dependency_list = obj["devDependncies"] as object;
        //merge both dep and devDep
        const all_dependencies = { ...dependency_list, ...dev_dependency_list };
        install(all_dependencies);
      } else {
        //craete an empty JSON map
        let cmd_map: JsonMap = {};

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
        await install(cmd_map);
        for (let dep in cmd_map) {
          obj["dependencies"][dep] = cmd_map[dep];
        }
        let toml_str = stringifyObj(obj);
        writeFile("./pkg.toml", toml_str);
      }
    } else if (process.argv[2] === "exec") {
      if (process.argv.length < 4) {
        console.error("invalid exec arg supplied");
      } else {
        //get scripts
        const script = obj["scripts"];
        execScript(script[process.argv[3]]);
      }
    } else {
      console.error("invalid operation");
    }
  } catch (error) {
    console.log(error);
  }
};

const install = async (depenecyMap: JsonMap) => {
  let aggregated_dep: JsonMap = {};

  for (let cli_dep in depenecyMap) {
    console.log("getting depenency list...");
    aggregated_dep[cli_dep] = depenecyMap[cli_dep];
    const immediteDep = await getImmedteDep(
      cli_dep,
      depenecyMap[cli_dep] as string
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
  const download_list = [];
  for (let item in aggregated_dep) {
    download_list.push(
      getTarballLinkAndName(item, aggregated_dep[item] as string)
    );
  }
  await Promise.all(download_list);
};

main();
