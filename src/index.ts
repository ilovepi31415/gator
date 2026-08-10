import { SyncShare } from "node:stream/iter";
import { handlerLogin, registerCommand, runCommand, type CommandsRegistry } from "./commands";

function main() {
  const cr: CommandsRegistry = {};
  registerCommand(cr, "login", handlerLogin);

  // Handle CLI input
  if (process.argv.length < 3) {
    console.log("No command provided");
    process.exit(1);
  }
  const argv = process.argv.slice(2);
  const command = argv[0];
  const args: string[] = argv.slice(1);
  
  // Attempt to run command
  try {
    runCommand(cr, command, ...args);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    } else {
      console.log(error);
    }
    process.exit(1);
  }
}

main();
