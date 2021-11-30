# spartacus_rebase_timer

Discord bot for showing spartacus.finance rebase timer.

Retrieves the current block every minute (default) and calculates the remaining time based on the BLOCK_RATE_SECONDS.

## Setup

All you need is a discord token to use the bot.

Add a .env file with the token specified as TOKEN=

## Config (optional)

Can also optionally configure certain parameters using the environment variables:
- UPDATE_INTERVAL_MS: ms Interval to update the timer (default 1 minute)
- EPOCH_INTERVAL: length of one epoch (default 33100)
- BLOCK_RATE_SECONDS: rate of blocks/sec (default 0.87)

## Example
![Screen Shot 2021-11-22 at 12 23 49 PM](https://user-images.githubusercontent.com/9285017/142906887-7ac24a41-3e1e-4b94-968c-51bb0f151e23.png)

## Free bot hosted on heroku

https://discord.com/api/oauth2/authorize?client_id=909643341535281153&permissions=0&scope=bot
