import { XMLParser } from "fast-xml-parser";
import { getNextFeedToFetch, markFeedFetched } from "./lib/db/queries/feeds";

type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
    // Fetch feed
    const response = await fetch(feedURL, {
        method: "GET",
        headers: {
            "User-Agent": "gator"
        }
    });
    const data = await response.text();

    const parser = new XMLParser({
        processEntities: false,
    });
    const obj = parser.parse(data).rss;
    
    // Check for channel
    if (!obj.channel) {
        throw new Error("No channel field");
    }
    const channel = obj.channel;
    
    // Extract metadata
    if (!channel.title || !channel.link || !channel.description) {
        throw new Error("Missing metadata");
    } 
    const output: RSSFeed = {
        channel: {
            title: channel.title,
            link: channel.link,
            description: channel.description,
            item: [],
        }
    };
    
    // Compile information to output feed
    let items;
    if (channel.item) {
        if (Array.isArray(channel.item)) {
            items = channel.item;
        } else {
            items = [channel.item]
        }
    }
    items.forEach((item: RSSItem) => {
        if (item.title && item.link && item.description && item.pubDate) {
            output.channel.item.push({
                title: item.title,
                link: item.link,
                description: item.description,
                pubDate: item.pubDate,
            })
        }
    });
    return output;
}

export async function scrapeFeeds() {
    const nf = await getNextFeedToFetch();
    const data = await fetchFeed(nf.url);
    await markFeedFetched(nf);
    for (const item of data.channel.item) {
        console.log(item.title);
    }
}