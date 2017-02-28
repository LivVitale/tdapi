# TDAPI - NodeJS TeamDynamix API Wrapper
Work in-progress API wrapper for TeamDynamix.

## Quick-start
    var TDAPI = require('tdapi');
    var TD = new TDAPI({
        baseUrl: 'https://api.teamdynamix.com/TDWebApi/api',
        credentials: {
            BEID:           'xxxxxx',
            WebServicesKey: 'xxxxxx'
        }
    });

    TD.getUsers({ SearchText: 'vitale'})
        .then(users => {
            console.log(users);
        }, err => {
            console.error(err);
        });

## Documentation
[TDAPI documentation](https://livvitale.github.io/tdapi/)