import * as fs from "fs";
import { JsonMap, parse, stringify } from "@iarna/toml";
import { parse as urlParser } from "url";
import { basename } from "path";
import * as decompress from "decompress";
import { copySync, removeSync } from "fs-extra";
import { spawn } from "child_process";

export const readFile = (path: string): Promise<string> => {
  return new Promise((res, rej) => {
    fs.readFile(path, "utf8", (err, data) => {
      if (err) rej(err);
      res(data);
    });
  });
};

export const writeFile = (path: string, content: string) => {
  return new Promise((res, rej) => {
    fs.writeFile(path, content, (err) => {
      if (err) rej(err);
      res(true);
    });
  });
};

export const appendDepToObj = (
  key: string,
  value: string,
  payload: JsonMap
): JsonMap => {
  payload["dependencies"][key] = value;
  return payload;
};

export const stringifyObj = (payload: JsonMap): string => {
  const str = stringify(payload);
  return str;
};

export const parseToml = (payload: string): JsonMap => {
  const obj = parse(payload);
  return obj;
};

export const getFileName = (path: string): string => {
  var parsed = urlParser(path);
  return basename(parsed.pathname);
};

export const unZip = async (module_location: string, newWrite: string) => {
  decompress(module_location, newWrite)
    .then((_files) => {
      //delete the tarball
      removeSync(module_location);
      moveFolder(`${newWrite}/package`, newWrite);
    })
    .catch((err) => {
      if (err) console.log(err);
    });
};

const moveFolder = (src: string, des: string): void => {
  try {
    copySync(src, des);
    //delete everything on the package folder
    removeSync(src);
  } catch (e) {
    console.log("error enconutered");
  }
};

export const execScript = (command: string): void => {
  //parse the commad
  let cmd=command.split(" ")
  const child = spawn(cmd[0], cmd.slice(1));
  let ScriptOutput = "";

  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (data) => {
    console.log(data);
    data = data.toString();
    ScriptOutput += data;
  });
  child.on("close", (code) => {
    if (code !== 0) {
      console.log(`exited with status ${code}`);
    }
  });
};
