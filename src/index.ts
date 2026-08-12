import { handlerAddFeed, handlerAgg, handlerBrowse, handlerFeeds, handlerFollow, handlerFollowing, handlerLogin, handlerRegister, handlerReset, handlerUnfollow, handlerUsers, middlewareLoggedIn, registerCommand, runCommand, type CommandsRegistry } from "./commands";

async function main() {
  const cr: CommandsRegistry = {};
  registerCommand(cr, "login", handlerLogin);
  registerCommand(cr, "register", handlerRegister);
  registerCommand(cr, "reset", handlerReset);
  registerCommand(cr, "users", handlerUsers);
  registerCommand(cr, "agg", handlerAgg);
  registerCommand(cr, "addfeed", middlewareLoggedIn(handlerAddFeed));
  registerCommand(cr, "feeds", handlerFeeds);
  registerCommand(cr, "follow", middlewareLoggedIn(handlerFollow));
  registerCommand(cr, "following", middlewareLoggedIn(handlerFollowing));
  registerCommand(cr, "unfollow", middlewareLoggedIn(handlerUnfollow));
  registerCommand(cr, "browse", middlewareLoggedIn(handlerBrowse));

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
    await runCommand(cr, command, ...args);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    } else {
      console.log(error);
    }
    process.exit(1);
  }
  process.exit(0);
}

main();
