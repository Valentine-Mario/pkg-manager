import axios from "axios";

//get latest dependecy version
export const getLatestVersion = async (dependecy: string): Promise<string> => {
  try {
    const { data } = await axios.get(`https://registry.npmjs.org/${dependecy}`);
    return data["dist-tags"]["latest"];
  } catch (err) {
    throw err;
  }
};
