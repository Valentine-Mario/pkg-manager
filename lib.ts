import * as fs from "fs";
import { JsonMap, parse, stringify } from "@iarna/toml";

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
