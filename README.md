# TDAPI - NodeJS TeamDynamix API Wrapper
API wrapper for TeamDynamix.

To read about new features and fixes from a specific version, see the [change log](CHANGELOG.md).

## Quick-start
```javascript
const TDAPI = require('tdapi');

// Authenticate
const TD = new TDAPI({
  baseUrl: 'https://api.teamdynamix.com/TDWebApi/api',
  credentials: {
    UserName: 'xxxxxx',
    Password: 'xxxxxx'
  }
});

// Example: search for users by name
TD.getUsers({ SearchText: 'vitale'})
  .then(users => {
    console.log(users);
  })
  .catch(err => {
    console.error(err);
  });
```

## Documentation
[TDAPI documentation](https://livvitale.github.io/tdapi/)