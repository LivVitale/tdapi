'use strict';

var fs = require('fs');
var path = require('path');
var request = require('request-promise');
var jwtDecode = require('jwt-decode');

var User = require('./structures/user');
var Ticket = require('./structures/ticket');
var Account = require('./structures/account');
var Location = require('./structures/location');
var Asset = require('./structures/asset');


/**
 * Base TeamDynamix API class
 * @class
 * @constructor
 * @param {TDAPIOptions} options - The options to configure the TDAPI client with.
 */
function TDAPI(options) {
    this.credentials = options.credentials || { UserName: '', Password: ''};
    this.baseUrl = options.baseUrl || 'https://api.teamdynamix.com/TDWebAPI/api';
    this.bearerToken = '';
}

/**
 * 
 * @typedef  {Object} TDAPIOptions
 * @property {String}            baseUrl     - The base URL of your TeamDynamix API (i.e. https://api.teamdynamix.com/TDWebAPI/api)
 * @property {APIUser|AdminUser} credentials - The API User or Admin User to authenticate as.
 */

/**
 * @typedef {Object} APIUser
 * @property {String} UserName - The username to authenticate as.
 * @property {String} Password - The user's password.
 */

/**
 * @typedef {Object} AdminUser
 * @property {String} BEID            - The BEID.
 * @property {String} WebServicesKey  - The web services key. 
 */

/**
 * Gets a Bearer Token for authenticating other requests.
 * @returns {Promise<String>}
 */
TDAPI.prototype.login = function() {
  return new Promise((resolve, reject) => {
    if(this.bearerToken && !tokenExpired(this.bearerToken)) {
      resolve(this.bearerToken);
    } else {
      var options = {
        method: 'POST',
        url: `${this.baseUrl}/auth` + ('BEID' in this.credentials ? '/loginadmin' : '/login'),
        form: this.credentials
      };

      request(options)
        .then(bearerToken => {
          resolve(bearerToken);
        })
        .catch(err => {
          reject(err);
        });
    }
  });
};

/**
 * Gets a user object.
 * @param {Guid} uid  - The UID of the user.
 * @returns {Promise<User>}
 */
TDAPI.prototype.getUser = function(uid) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'GET',
        url: `${this.baseUrl}/people/${uid}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .then(user => new User(this, user))
    .catch(handleError);
};

/**
 * Gets all user objects matching specified search parameters.
 * @param {UserSearch} searchParams  - The search parameters to use.
 * @returns {Promise<User[]>}
 */
TDAPI.prototype.getUsers = function(searchParams) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.baseUrl}/people/search`,
        auth: { bearer: bearerToken },
        json: true,
        body: searchParams || {}
      });
    })
    .then(users => {
      if(Array.isArray(users)) {
        return users.map(user => new User(this, user));
      } else {
        return users;
      }
    })
    .catch(handleError);
};

/**
 * Creates a user object with specified attributes.
 * @param {User} user  - The user to create.
 * @returns {Promise<User>}
 */
TDAPI.prototype.createUser = function(user) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.baseUrl}/people`,
        auth: { bearer: bearerToken },
        json: true,
        body: user
      });
    })
    .then(user => new User(this, user))
    .catch(handleError);
};

/**
 * Gets a Security Role.
 * @param {Guid} roleId  - The ID of the security role.
 * @returns {Promise<SecurityRole>} securityRole
 */
TDAPI.prototype.getSecurityRole = function(roleId) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'GET',
        url: `${this.baseUrl}/securityroles/${roleId}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Gets Security Roles.
 * @param {SecurityRoleSearch} searchParams  - The search parameters to use.
 * @returns {Promise<SecurityRole[]>} securityRoles
 */
TDAPI.prototype.getSecurityRoles = function(searchParams) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.baseUrl}/securityroles/search`,
        auth: { bearer: bearerToken },
        json: true,
        body: searchParams || {}
      });
    })
    .catch(handleError);
};

/**
 * Gets Groups.
 * @param {GroupSearch} [searchParams={}]  - The search parameters to use.
 * @returns {Promise<Group[]>} groups
 */
TDAPI.prototype.getGroups = function(searchParams) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.baseUrl}/groups/search`,
        auth: { bearer: bearerToken },
        json: true,
        body: searchParams || {}
      });
    })
    .catch(handleError);
};

/**
 * Gets group members for a specified group.
 * @param {Number} groupId  - The ID of the group.
 * @returns {Promise<User[]>} groupMembers
 */
TDAPI.prototype.getGroupMembers = function(groupId) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'GET',
        url: `${this.baseUrl}/groups/${groupId}/members`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .then(users => {
      if(Array.isArray(users)) {
        return users.map(user => new User(this, user));
      } else {
        return users;
      }
    })
    .catch(handleError);
};

/**
 * Gets a Ticket.
 * @param {Number} appId     - The ID of the ticketing application.
 * @param {Number} ticketId  - The ID of the ticket.
 * @returns {Promise<Ticket>} ticket
 */
TDAPI.prototype.getTicket = function(appId, ticketId) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'GET',
        url: `${this.baseUrl}/${appId}/tickets/${ticketId}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .then(ticket => new Ticket(this, ticket))
    .catch(handleError);
};

/**
 * Gets Tickets.
 * @param {Number} appId                    - The ID of the ticketing application.
 * @param {TicketSearch} [searchParams={}]  - The search parameters to use.
 * @returns {Promise<Ticket[]>}
 */
TDAPI.prototype.getTickets = function(appId, searchParams) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.baseUrl}/${appId}/tickets/search`,
        auth: { bearer: bearerToken },
        json: true,
        body: searchParams || {}
      });
    })
    .then(tickets => {
      if(Array.isArray(tickets)) {
        return tickets.map(ticket => new Ticket(this, ticket));
      } else {
        return tickets;
      }
    })
    .catch(handleError);
};

/**
 * Edits a ticket via HTTP PATCH (Edits only specified fields)
 * @param {Number} appId                         - The ID of the ticketing application.
 * @param {Number} ticketId                      - The ID of the ticket to update.
 * @param {any} patch                            - The patch document containing changes to apply to the ticket.
 * @param {Boolean} [false] notifyNewResponsible - If true, will notify the newly-responsible resource(s) if the responsibility is changed as a result of the edit.
 * @returns {Promise<Ticket>} ticket
 */
TDAPI.prototype.patchTicket = function(appId, ticketId, patch, notifyNewResponsible) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'PATCH',
        url: `$this.baseUrl/${appId}/tickets/${ticketId}?notifyNewResponsible=${notifyNewResponsible || false}`,
        auth: { bearer: bearerToken },
        json: true,
        body: patch
      });
    })
    .catch(handleError);
};

/**
 * Updates a ticket / Adds a new feed entry.
 * @param {Number} appId               - The ID of the ticketing application.
 * @param {Number} ticketId            - The ID of the ticket to update.
 * @param {TicketFeedEntry} feedEntry  - The new feed entry to add.
 * @returns {Promise<ItemUpdate>} itemUpdate
 */
TDAPI.prototype.updateTicket = function(appId, ticketId, feedEntry) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.baseUrl}/${appId}/tickets/${ticketId}/feed`,
        auth: { bearer: bearerToken },
        json: true,
        body: feedEntry
      });
    })
    .catch(handleError);
};

/**
 * Gets all active ticket types
 * @param {Number} appId - The ID of the ticketing application.
 * @returns {Promise<TicketType[]>} types
 */
TDAPI.prototype.getTicketTypes = function(appId) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'GET',
        url: `${this.baseUrl}/${appId}/tickets/types`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Get ticket statuses.
 * @param {Number} appId  - The ID of the ticketing application.
 * @returns {Promise<TicketStatus[]>} statuses
 */
TDAPI.prototype.getTicketStatuses = function(appId) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'GET',
        url: `${this.baseUrl}/${appId}/tickets/statuses`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Gets a list of all active accounts/departments.
 * @returns {Promise<Account[]>} accounts
 */
TDAPI.prototype.getAccounts = function() {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'GET',
        url: `${this.baseUrl}/accounts`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .then(accounts => {
      if(Array.isArray(accounts)) {
        return accounts.map(account => new Account(this, account));
      } else {
        return accounts;
      }
    })
    .catch(handleError);
};

/**
 * Creates a new account.
 * @param {Account} account - The account to be created.
 * @returns {Promise<Account>} account
 */
TDAPI.prototype.createAccount = function(account) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.baseUrl}/accounts`,
        json: true,
        body: account || {}
      });
    })
    .then(account => new Account(this, account))
    .catch(handleError);
};

/**
 * Edits the account specified by the account ID.
 * @param {Number}  id      - The account ID.
 * @param {Account} account - The fields that the updated account should hold.
 * @returns {Promise<Object>} body
 */
TDAPI.prototype.editAccount = function(id, account) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'PUT',
        auth: { bearer: bearerToken },
        json: true,
        body: account || {}
      });
    })
    .catch(handleError);
};

/**
 * Gets a list of accounts/departments
 * @param {AccountSearch} searchParams
 * @returns {Promise<Account[]>} accounts
 */
TDAPI.prototype.searchAccounts = function(searchParams) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.baseUrl}/accounts/search`,
        auth: { bearer: bearerToken },
        json: true,
        body: searchParams || {}
      });
    })
    .then(accounts => {
      if(Array.isArray(accounts)) {
        return accounts.map(account => new Account(this, account));
      } else {
        return accounts;
      }
    })
    .catch(handleError);
};

/**
 * Creates a location.
 * @param {Location} location - The location to create.
 * @returns {Promise<Location>} location
 */
TDAPI.prototype.createLocation = function(location) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.baseUrl}/locations`,
        auth: { bearer: bearerToken },
        json: true,
        body: location
      });
    })
    .then(location => new Location(this, location))
    .catch(handleError);
};

/**
 * Gets a location.
 * @param {Number} id - The ID of the location.
 * @returns {Promise<Location>} location
 */
TDAPI.prototype.getLocation = function(id) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'GET',
        url: `${this.baseUrl}/locations/${id}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .then(location => new Location(this, location))
    .catch(handleError);
};

/**
 * Edits the specified location.
 * @param {Number} id         - The ID of the location.
 * @param {Location} location - The location with updated values.
 * @returns {Promise<Location>} location
 */
TDAPI.prototype.editLocation = function(id, location) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'PUT',
        url: `${this.baseUrl}/locations/${id}`,
        auth: { bearer: bearerToken },
        json: true,
        body: location
      });
    })
    .then(location => new Location(this, location))
    .catch(handleError);
};

/**
 * Creates a room in a location.
 * @param {Number}       id   - The containing location ID.
 * @param {LocationRoom} room - The room to create.
 * @returns {Promise<LocationRoom>} room
 */
TDAPI.prototype.createRoom = function(id, room) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.baseUrl}/locations/${id}/rooms`,
        auth: { bearer: bearerToken },
        json: true,
        body: room
      });
    })
    .catch(handleError);
};

/**
 * Deletes a room in a location.
 * @param {Number} id     - The containing location ID.
 * @param {Number} roomId - The room ID.
 * @returns {Promise<Object>} message
 */
TDAPI.prototype.deleteRoom = function(id, roomId) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'DELETE',
        url: `${this.baseUrl}/locations/${id}/rooms/${roomId}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Edits the specified room in a location.
 * @param {Number}       id     - The containing location ID.
 * @param {Number}       roomId - The room ID.
 * @param {LocationRoom} room   - The room with updated values.
 * @returns {Promise<LocationRoom>} room
 */
TDAPI.prototype.editRoom = function(id, roomId, room) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'PUT',
        url: `${this.baseUrl}/locations/${id}/rooms/${roomId}`,
        auth: { bearer: bearerToken },
        json: true,
        body: room
      });
    })
    .catch(handleError);
};

/**
 * Gets a list of locations.
 * @param {LocationSearch} searchParams - The search parameters to use.
 * @returns {Promise<Location[]>} locations
 */
TDAPI.prototype.getLocations = function(searchParams) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.baseUrl}/locations/search`,
        auth: { bearer: bearerToken },
        json: true,
        body: searchParams || {}
      });
    })
    .catch(handleError);
};

/**
 * Accepts a file, stores that file on disk, and places an entry into the databse to indicate to the import file processor to pick up the file and run a People import on it.
 * @param {String} file - The path of the .xlsx file to upload.
 * @returns {Promise<Object>} message
 */
TDAPI.prototype.importPeople = function(file) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.baseUrl}/people/import`,
        auth: { bearer: bearerToken },
        formData: {
          'import.xlsx': fs.createReadStream(file)
        }
      });
    })
    .catch(handleError);
};

/**
 * Gets the custom attributes for the specified component.
 * @param {Number} componentId      - The component ID.
 * @param {Number} associatedTypeId - The associated type ID to get attributes for. For instance, a ticket type ID might be provided here.
 * @param {Number} appId            - The associated application ID to get attributes for.
 * @returns {Promise<CustomAttribute[]>}
 */
TDAPI.prototype.getCustomAttributes = function(componentId, associatedTypeId, appId) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'GET',
        url: `${this.baseUrl}/attributes/custom` +
              `?componentId=${componentId}` +
              `&associatedTypeId=${associatedTypeId}` + 
              `&appId=${appId}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Gets a list of all asset statuses.
 * @returns {Promise<AssetStatus[]>}
 */
TDAPI.prototype.getAssetStatuses = function() {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'GET',
        url: `${this.baseUrl}/assets/statuses`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Creates an asset.
 * @param {Asset} asset
 * @returns {Promise<Asset>}
 */
TDAPI.prototype.createAsset = function(asset) {
  return this.login()
     .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.baseUrl}/assets`,
        auth: { bearer: bearerToken },
        json: true,
        body: asset
      });
    })
    .then(asset => new Asset(this, asset))
    .catch(handleError);
};

/**
 * Removes a resource from an asset.
 * @param {Number} assetId    - The asset ID.
 * @param {Number} resourceId - The resource ID.
 * @returns {Promise<Object>} message
 */
TDAPI.prototype.removeAssetResource = function(assetId, resourceId) {
  return this.login()
     .then(bearerToken => {
      return request({
        method: 'DELETE',
        url: `${this.baseUrl}/assets/${assetId}/users/${resourceId}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Gets an asset.
 * @param {Number} id - The asset ID.
 * @returns {Promise<Asset>}
 */
TDAPI.prototype.getAsset = function(id) {
  return this.login()
     .then(bearerToken => {
      return request({
        method: 'GET',
        url: `${this.baseUrl}/assets/${id}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .then(asset => new Asset(this, asset))
    .catch(handleError);
};

/**
 * Edits an existing asset.
 * @param {Number} id    - The asset ID.
 * @param {Asset}  asset - The asset with updated values.
 * @returns {Promise<Asset>}
 */
TDAPI.prototype.editAsset = function(id, asset) {
  return this.login()
     .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.baseUrl}/assets/${id}`,
        auth: { bearer: bearerToken },
        json: true,
        body: asset
      });
    })
    .then(asset => new Asset(this, asset))
    .catch(handleError);
};

/**
 * Gets the feed entries for an asset.
 * @param {Number} id - The asset ID.
 * @returns {Promise<ItemUpdate[]>}
 */
TDAPI.prototype.getAssetFeedEntries = function(id) {
  return this.login()
     .then(bearerToken => {
      return request({
        method: 'GET',
        url: `${this.baseUrl}/assets/${id}/feed`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Adds a comment to an asset.
 * @param {Number}    id        - The asset ID.
 * @param {FeedEntry} feedEntry - The item update containing the comment.
 * @returns {Promise<ItemUpdate>}
 */
TDAPI.prototype.addAssetFeedEntry = function(id, feedEntry) {
  return this.login()
     .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.baseUrl}/assets/${id}/feed`,
        auth: { bearer: bearerToken },
        json: true,
        body: feedEntry
      });
    })
    .catch(handleError);
};

/**
 * Adds an asset to a ticket.
 * @param {Number} id       - The asset ID.
 * @param {Number} ticketId - The ticket ID. This must belong to an application that the user can access.
 * @returns {Promise<Object>} message
 */
TDAPI.prototype.addAssetToTicket = function(id, ticketId) {
  return this.login()
     .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.baseUrl}/assets/${id}/tickets/${ticketId}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Removes a ticket from an asset.
 * @param {Number} id       - The asset ID.
 * @param {Number} ticketId - The ticket ID. This must belong to an application that the user can access.
 * @returns {Promise<Object>} message
 */
TDAPI.prototype.removeAssetFromTicket = function(id, ticketId) {
  return this.login()
     .then(bearerToken => {
      return request({
        method: '',
        url: `${this.baseUrl}/assets/${id}/tickets/${ticketId}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Gets the asset resources.
 * @param {Number} id - The asset ID.
 * @returns {Promise<ResourceItem>}
 */
TDAPI.prototype.getAssetResources = function(id) {
  return this.login()
     .then(bearerToken => {
      return request({
        method: 'GET',
        url: `${this.baseUrl}/assets/${id}/users`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Adds a resource to an asset.
 * @param {Number} id         - The asset ID.
 * @param {Number} resourceId - The resource ID.
 * @returns {Promise<Object>} message
 */
TDAPI.prototype.addAssetResource = function(id, resourceId) {
  return this.login()
     .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.baseUrl}/assets/${id}/users/${resourceId}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Performs a bulk insert/update of assets in the system.
 * @param {BulkImport<Asset[]>} importData - The collection of items that are being imported and the corresponding import settings.
 * @returns {Promise<ItemResult>}
 */
TDAPI.prototype.importAssets = function(importData) {
  return this.login()
     .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.baseUrl}/assets/import`,
        auth: { bearer: bearerToken },
        json: true,
        body: importData
      });
    })
    .catch(handleError);
};

/**
 * Gets a list of assets.
 * @param {AssetSearch} [searchParams] - The search parameters to use.
 * @returns {Promise<Asset[]>}
 */
TDAPI.prototype.getAssets = function(searchParams) {
  return this.login()
     .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.baseUrl}/assets/search`,
        auth: { bearer: bearerToken },
        json: true,
        body: searchParams || {}
      });
    })
    .then(assets => {
      if(Array.isArray(assets)) {
        return assets.map(asset => new Asset(this, asset));
      } else {
        return assets;
      }
    })
    .catch(handleError);
};


// TDAPI.prototype.addAttachment = function(appId, ticketId, attachment) {
//   return new Promise((resolve, reject) => {
//     this.login()
//       .then(bearerToken => {
//         var opts = {
//           url: `${this.baseUrl}/${appId}/tickets/${ticketId}/attachments`,
//           auth: { bearer: bearerToken },
//           formData: {
//             file: {
//               options: {
//                 filename: 'test.json',
//                 contentType: 'application/json'
//               },
//               value: JSON.stringify({
//                 'item': '2390712939120',
//                 'text': 'dasiodnasiodnsdoanodiasd'
//               })
//             }
//           }
//         };

//         request.post(opts, function(err, response, body) {
//           if(err) {
//             reject(err);
//           } else {
//             resolve(body);
//           }
//         });
//       }, err => {
//         reject(err);
//       });
//   });
// };

// Generic error handling - TODO: Improve error detail
function handleError(err) {
  return Promise.reject(err);
}

// Check if JWT expired
function tokenExpired(bearerToken) {
  var decodedToken = jwtDecode(bearerToken);
  if(decodedToken.exp) {
    var exp = new Date(decodedToken.exp * 1000); // Convert seconds to ms for Date constructor
    var now = new Date();
    
    if(exp > now) {
      return false;
    }
  }

  return true;
}

module.exports = TDAPI;