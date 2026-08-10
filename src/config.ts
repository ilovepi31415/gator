import fs from "fs";
import os from "os";
import path from "path";

type Config = {
  dbUrl: string;
  currentUserName: string;
}

export function setUser(username: string) {
  const cfg = readConfig();
  cfg.currentUserName = username;
  writeConfig(cfg);
}

export function readConfig(): Config {
  const file = fs.readFileSync(getConfigFilePath(), { encoding: "utf-8" });
  const rawcfg = JSON.parse(file);
  return validateConfig(rawcfg);
}

function getConfigFilePath(): string {
  return path.join(os.homedir(), ".gatorconfig.json");
}

function validateConfig(rawConfig: any): Config {
  return {
    dbUrl: rawConfig.db_url,
    currentUserName: rawConfig.current_user_name,
  };
}

function writeConfig(cfg: Config) {
  const snakeCfg = {
    db_url: cfg.dbUrl,
    current_user_name: cfg.currentUserName,
  }
  fs.writeFileSync(
    path.join(getConfigFilePath()),
    JSON.stringify(snakeCfg) + "\n"
  );
}