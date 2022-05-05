#!/usr/bin/env ts-node
import { readFile, parseToml } from "./lib";
import { getLatestVersion, getImmedteDep, getNestedDep } from "./api";
import { JsonMap } from "@iarna/toml";

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
      const dev_dependency_list=obj['devDependncies'] as object
      //merge both dep and devDep
      const all_dependencies={...dependency_list, ...dev_dependency_list}
    } else {
      //craete an empty JSON map
      let cmd_map: JsonMap = {};

      //read arg from command line
      //get the lasyt n elem in the array, removing the first 2
      const dependecy_list = process.argv.slice(3);
      const latest_list = [];

      for (let i of dependecy_list) {
        latest_list.push(getLatestVersion(i));
      }
      const resolved_list = await Promise.all(latest_list);
      for (let item of resolved_list) {
        cmd_map[item[0]] = item[1];
      }
      Object.entries(cmd_map).forEach(
        async([dependecy, version]) => {
          const b=await getImmedteDep(dependecy, version as string)
          Object.entries(b).forEach(
            async([dep, ver])=>{
              const a= await getNestedDep(dep, ver as string)
              console.log(a);
            }
          )
        }
    );
    }
  } else {
    console.error("invalid operation");
  }
};

main();
