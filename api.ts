import axios from "axios";
import * as fs from "fs";
import * as decompress from "decompress"

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
      `https://registry.npmjs.org/${dependecy}/${version
        .replaceAll("~", "")
        .replaceAll("^", "")
        .replaceAll("*", "")
        .replaceAll(">", "")
        .replaceAll("=", "")
        .trim()}`
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
): Promise<string[]> => {
  try {
    const { data } = await axios.get(
      `https://registry.npmjs.org/${dependecy}/${version}`
    );
    const download_link = data["dist"]["tarball"];
    const name = data["name"];
    return [download_link, name];
  } catch (err) {
    console.error(err);
  }
};

export const downloadZip = async (link: string[]) => {
  try {
    if (!fs.existsSync("./node_modules")) {
      fs.mkdirSync("node_modules");
    }
    const { data } = await axios.get(link[0], { responseType: "blob" });
    //write blob to file
    fs.writeFile(`./node_modules/${link[1]}`, data, (err) => {
      if (err) console.log(err);
      console.log(`${link[1]} downloaded successfully`);
    });
  } catch (err) {
    console.log(err);
  }
};

export const unZip=async()=>{
  decompress('app.tgz', 'node_modules/express').then(files => {
    console.log('done!', files);
});
}