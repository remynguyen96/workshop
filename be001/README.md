# [BE001] NodeJS Restful API

## Presequisites
You will need:
- NodeJS: https://nodejs.org/en/
- Posgresql: https://www.postgresql.org/download/
- Yarn **optional**: https://yarnpkg.com/en/docs/install
- pgAdmin **optional**: https://pgadmin.org

## Getting started
- Fork this repo
- Clone your forked repo
- Install node dependencies
```Bash
cd path/to/your/project/be001
yarn
```
- Setup database
  - Create a new user, for example **be001** / **be001password**
  - Create 2 new databases, **be001dev** and **be001test**
- Config database
```Bash
# copy the config file
cp db/config.example.json db/config.json
# Then, open db/config.json and config it
```
- Run database migrations & seeders
```Bash
yarn sql db:migrate
yarn sql db:seed:all
```
- Start the server
```Bash
yarn dev
```                           

## Handout
https://github.com/grokking-vietnam/workshop/blob/be001/result/be001/handout.md
