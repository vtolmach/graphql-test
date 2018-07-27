
### Executed with:
```console
IGDB_API_KEY='my api key' node index.js
```

### Used query:


```graphql
query getGames($Search: String, $Limit: Int!) {
  getGames(search: $Search, limit: $Limit) {
    Name
    slug
    summery
    Id
    url
    coverImageUrl 
  }
}
```

```json
{"Search": "zelda", "Limit":5}
```
