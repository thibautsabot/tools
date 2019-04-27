# Get your team pull request reviews ranking !

## How to use :

- `npm install`

- `ACCESS_TOKEN=XXX REPO=xxx node src/main.js`

With ACCESS_TOKEN your github token and REPO the name of your repository (including your own name) :
Ex : `ACCESS_TOKEN=super_secret REPO=thibautsabot/github-reviews-ranking node src/main.js`

You can also add a "PAGES" environment variable to change the number of Pull requests that need to be fetched.
One page is 30 Pull requests so PAGES=5 will fetch 150 Pull Request. (default value is 10 = 300 PR)

For entreprise accounts you can use the CUSTOM_DOMAIN parameters with the end of github your URL.
Ex: If you go to github.mycompany.io use CUSTOM_DOMAIN=mycompany.io

## The output looks like this :

![output](./output.png)
