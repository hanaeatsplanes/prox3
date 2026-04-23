# Prox3
*the next edition of confessing*
> Inspired by [anirudhb/prox3](https://github.com/anirudhb/prox3).

![](https://hackatime.hackclub.com/api/v1/badge/U081C6XT885/hanaeatsplanes/prox3)
![](https://pride-badges.pony.workers.dev/static/v1?label=a%20trans%20person%20made%20this&stripeWidth=6&stripeColors=5BCEFA,F5A9B8,FFFFFF,F5A9B8,5BCEFA)

Prox3 is a Slack Bot for creating anonymous confessions, made using:
* Bun
* ElysiaJS
* Postgres and Redis

## Deploying

I use Coolify to deploy this, although you can set it up yourself locally.

Set up your Slack Bot at https://api.slack.com/apps.

Use the [manifest.json](/manifest.json) to have a template, but be sure to manually change your event URLs.

```bash
git clone https://github.com/hanaeatsplanes/prox3
cd prox3
cp .env.example
```

Fill out your `.env` with the correct values.

You should be able to deploy from the Dockerfile, or by running:

```bash
bun run build
bun run start
```

and test --- go to http://localhost:3000 or whatever URL its on and you should get "Up!"

## Usage

DM Prox3 or use /prox3.