import { JsonMap } from "@iarna/toml";
import axios from "axios";

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
        .trim()
    }`
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
    console.log(err)
  }
};
