import axios from "axios";
import * as fs from "fs";
import * as https from "https";
import * as decompress from "decompress";
import { getFileName } from "./lib";
import { copySync, remove, removeSync } from "fs-extra";

//get latest dependecy version
export const getLatestVersion = async (
  dependecy: string
): Promise<string[]> => {
  try {
    const { data } = await axios.get(`https://registry.npmjs.org/${dependecy}`);
    return [dependecy, data["dist-tags"]["latest"]];
  } catch (err) {
    throw err;
  }
};

//get dependecies and dev dependencies of packages in our toml comnfig
export const getImmedteDep = async (
  dependecy: string,
  version: string
): Promise<{}> => {
  try {
    const { data } = await axios.get(
      `https://registry.npmjs.org/${dependecy}/${version}`
    );
    //get immediate dependencies of the dependecy
    const related_dep = data["dependencies"];
    return related_dep;
  } catch (err) {
    throw err;
  }
};

export const getNestedDep = async (
  dependecy: string,
  version: string
): Promise<{}> => {
  try {
    const { data } = await axios.get(
      `https://registry.npmjs.org/${dependecy}/${await getVersion(
        dependecy,
        version
      )}`
    );

    let all_dependecies = {};
    const related_dep = data["dependencies"];
    const all_related_dep = { ...related_dep };

    //if there are nested dependecies, recursively call the function
    if (Object.values(all_related_dep).length > 0) {
      //append to the dep map
      Object.entries(all_related_dep).forEach(([dependecy, version]) => {
        all_dependecies[dependecy] = version;
        return getNestedDep(dependecy, version as string);
      });
    }
    return all_dependecies;
  } catch (err) {
    console.error(err);
  }
};

export const getTarballLinkAndName = async (
  dependecy: string,
  version: string
) => {
  try {
    const { data } = await axios.get(
      `https://registry.npmjs.org/${dependecy}/${await getVersion(
        dependecy,
        version
      )}`
    );
    const download_link = data["dist"]["tarball"];
    const name = data["name"];
    await downloadAndunZip([download_link, name]);
  } catch (err) {
    console.error(err);
  }
};

const downloadAndunZip = async (link: string[]) => {
  try {
    if (!fs.existsSync("./node_modules")) {
      fs.mkdirSync("node_modules");
    }
    const fileName = getFileName(link[0]);

    const module_location = `./node_modules/${fileName}`;

    const file = fs.createWriteStream(module_location);
    const request = https.get(link[0], function (response) {
      response.pipe(file);
      file.on("finish", async () => {
        //extract zip and copy to right location
        file.close();
        await unZip(module_location, `./node_modules/${link[1]}`);
      });
    });
  } catch (err) {
    console.log(err);
  }
};

const unZip = async (module_location: string, newWrite: string) => {
  decompress(module_location, newWrite)
    .then((_files) => {
      moveFolder(`${newWrite}/package`, newWrite, module_location);
    })
    .catch((err) => {
      if (err) console.log(err);
    });
};

const moveFolder = (src: string, des: string, original:string) => {
  copySync(src, des);
  //delete everuything on the package folder
  removeSync(src);
  //delete the tarball
  removeSync(original)
};

const getVersion = async (
  dependency: string,
  version: string
): Promise<string> => {
  if (version.includes("*")) {
    const ver = await getLatestVersion(dependency);
    return ver[1];
  } else {
    return version
      .replaceAll("~", "")
      .replaceAll("^", "")
      .replaceAll("*", "")
      .replaceAll(">", "")
      .replaceAll("=", "")
      .trim();
  }
};
