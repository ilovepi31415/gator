import { setUser, readConfig } from "./config";

function main() {
  console.log("Hello, world!");
  setUser("David");
  console.log(readConfig());
}

main();
