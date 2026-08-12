# CLI Feed Aggregator

This CLI Feed Aggregator (gator) will gather listed feeds, fetch, and log them to the console for a variety of users.

## Setup

Gator expects a config file at `~/.gatorconfig` with the current user and a database url in the format `{"db_url": string, "current_user_name": string}`.

Once your config is set up, running `npm run start generate; npm run start migrate` will build the database schema.

## Some Available Commands:

*Note: These should all be run after `npm run start`*

`register <username>` - adds the given user to the database and logs them in

`login <username>` - logs the given user in

`addfeed <url>` - adds the feed to the database and the current user's feed following

`follow <url>` - adds the feed to the current user's feed following

`unfollow <url>` - removes the feed from the current user's feed following

`agg <interval>` - aggregates the current user's feeds repeatedly on the time interval until forceably closed

`browse <count>?` - shows the first `count` posts from the current user's feed. This defaults to 2 if no amount it set