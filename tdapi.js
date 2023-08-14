'use strict';

var fs = require('fs');
var request = require('request-promise');
var jwtDecode = require('jwt-decode');

var User = require('./structures/user');
var Ticket = require('./structures/ticket');
var Account = require('./structures/account');
var Location = require('./structures/location');
var Asset = require('./structures/asset');
var Article = require('./structures/article');


/**
 * Base TeamDynamix API class
 * @class
 * @constructor
 * @param {TDAPIOptions} options - The options to configure the TDAPI client with.
 */
function TDAPI(options) {
  this.credentials = options.credentials || { UserName: '', Password: '' };
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
TDAPI.prototype.login = function () {
  return new Promise((resolve, reject) => {
    if (this.bearerToken && !tokenExpired(this.bearerToken)) {
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
TDAPI.prototype.getUser = function (uid) {
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
TDAPI.prototype.getUsers = function (searchParams) {
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
      if (Array.isArray(users)) {
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
TDAPI.prototype.createUser = function (user) {
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
TDAPI.prototype.getSecurityRole = function (roleId) {
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
TDAPI.prototype.getSecurityRoles = function (searchParams) {
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
 * Gets a Group.
 * @param {Number} id  - The group ID.
 * @returns {Promise<Group>} The group.
 */
TDAPI.prototype.getGroup = function (id) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'GET',
        url: `${this.baseUrl}/groups/${id}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Creates a new group.
 * @param {Group} group  - The group to be created.
 * @returns {Promise<Group>} The group.
 */
TDAPI.prototype.createGroup = function (group) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.baseUrl}/groups`,
        auth: { bearer: bearerToken },
        json: true,
        body: group || {}
      });
    })
    .catch(handleError);
};

/**
 * Edits an existing group.
 * @param {Number} id  - The group ID.
 * @param {Group} group  - The fields that the updated group should hold.
 * @returns {Promise<Group>} The updated group, if the operation was successful.
 */
TDAPI.prototype.editGroup = function (id, group) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'PUT',
        url: `${this.baseUrl}/groups/${id}`,
        auth: { bearer: bearerToken },
        json: true,
        body: group || {}
      });
    })
    .catch(handleError);
};

/**
 * Removes a collection of users from a group.
 * @param {Number} id  - The group ID.
 * @param {Guid[]} uids  - The search parameters to use.
 * @returns {Promise<Object>} A response message indicating if the operation was successful or not.
 */
TDAPI.prototype.removeFromGroup = function (id, uids) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'DELETE',
        url: `${this.baseUrl}/groups/${id}/members`,
        auth: { bearer: bearerToken },
        json: true,
        body: uids || []
      });
    })
    .catch(handleError);
};

/**
 * Gets Groups.
 * @param {GroupSearch} [searchParams={}]  - The search parameters to use.
 * @returns {Promise<Group[]>} A collection of groups. 
 */
TDAPI.prototype.getGroups = function (searchParams) {
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
TDAPI.prototype.getGroupMembers = function (groupId) {
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
      if (Array.isArray(users)) {
        return users.map(user => new User(this, user));
      } else {
        return users;
      }
    })
    .catch(handleError);
};

/**
 * Bulk-applies a desktop template to a set of users.  
 * @param {Guid} templateDesktopId  - The ID of the desktop template to apply. 
 * @param {Guid[]} uids             -The UIDs of the users to apply the desktop to. 
 * @param {Boolean} [isDefault=false]       - If set to true, each of the specified users will be set to be active. 
 */
TDAPI.prototype.applyDesktop = function (templateDesktopId, uids, isDefault) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.baseUrl}/people/bulk/applydesktop/${templateDesktopId}?isDefault=${isDefault || false}`,
        auth: { bearer: bearerToken },
        json: true,
        body: uids || []
      });
    })
};

/**
 * Bulk-updates the active status of the set of users.  
 * @param {Guid} uids  - The UIDs of the people to update the active status of. 
 * @param {Boolean} isActive        - If set to true, each of the specified users will be set to be active. 
 */
TDAPI.prototype.changeActiveStatus = function (uids, isActive) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.baseUrl}/people/bulk/changeactivestatus?isActive=${isActive || false}`,
        auth: { bearer: bearerToken },
        json: true,
        body: uids || []
      });
    })
};

/**
 * Bulk-adds or removes a set of users to a set of applications. Optionally, supports removing any application associations for users. 
 * @param {Guid[]} userUids            - The UIDs of the people being added to entries in applicationsNames.
 * @param {String[]} applicationNames  - The Applications that will be added to each entry in userUids.
 * @param {Boolean} replaceExistingApplications   - Value indicating whether applications that provided users already belong to should be removed.
 */
TDAPI.prototype.changeApplications = function (userUids, applicationNames, replaceExistingApplications) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.baseUrl}/people/bulk/changeapplications`,
        auth: { bearer: bearerToken },
        json: true,
        body: {
          UserUids: userUids || [],
          ApplicationNames: applicationNames || [],
          ReplaceExistingApplications: replaceExistingApplications || false
        }
      });
    })
};

/**
 * Bulk-adds a set of users to a set of groups. Optionally, supports removing any memberships for those users that are outside of those groups. 
 * @param {Guid[]} userUids  - The UIDs of the people being added to entries in groupIds.
 * @param {Number[]} groupIds - The groups that will be added to each entry in userUids.
 * @param {Boolean} removeOtherGroups   - Value indicating whether groups that provided users already belong to should be removed.
 */
TDAPI.prototype.manageGroups = function (userUids, groupIds, removeOtherGroups) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.baseUrl}/people/bulk/managegroups`,
        auth: { bearer: bearerToken },
        json: true,
        body: {
          UserUIDs: userUids || [],
          GroupIDs: groupIds || [],
          RemoveOtherGroups: removeOtherGroups || false
        }
      });
    })
};

/**
 * Bulk-adds a set of users to a group. Adds a collection of users to a group. 
 * Users that did not exist in the group beforehand will have their settings set to the specified values. 
 * Existing users will not have their settings overwritten. 
 * @param {Boolean} id    - ID of the group 
 * @param {Guid[]}  uids   - The UIDs of the people being added to entries in groupIds.
 * @param {Boolean} [isPrimary=false] - If set to true, new users will have this group set as their primary group. 
 * @param {Boolean} [isNotified=false] - If set to true, new users will be sent notifications for this group. 
 * @param {Boolean} [isManager=false] - If set to true, new users will be set as a manager for this group. 
 */
TDAPI.prototype.addUsersToGroup = function (id, uids, isPrimary, isNotified, isManager) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.baseUrl}/groups/${id}/members?isPrimary=${isPrimary}&isNotified=${isNotified}&isManager=${isManager}`,
        auth: { bearer: bearerToken },
        json: true,
        body: uids || []
      });
    })
};

/**
 * Bulk-adds a set of users to a set of accounts. Optionally, supports removing any accounts for the specified users that are not included in the set of accounts. 
 * @param {Guid[]} userUids      - The user UIDs to add to the accounts provided in AccountIDs 
 * @param {Number[]} accountIds   - The account IDs to add the users provided in userUIDs to. 
 * @param {Boolean} replaceExistingAccounts - Value indicating whether accounts that provided users already belong to should be removed. 
 */
TDAPI.prototype.changeAcctDepts = function (userUids, accountIds, replaceExistingAccounts) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.baseUrl}/people/bulk/changeacctdepts`,
        auth: { bearer: bearerToken },
        json: true,
        body: {
          UserUids: userUids || [],
          AccountIDs: accountIds || [],
          ReplaceExistingAccounts: replaceExistingAccounts || false
        }
      });
    })
};

/**
 * Bulk-changes the security role of a set of users.  
 * @param {Guid} securityRoleId     - The ID of the security role to apply to each user. 
 * @param {Guid[]} uids  - The groups that will be added to each entry in userUids.
 */
TDAPI.prototype.changeSecurityRole = function (securityRoleId, uids) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.baseUrl}/people/bulk/changesecurityrole/${securityRoleId} `,
        auth: { bearer: bearerToken },
        json: true,
        body: uids || []
      });
    })
};

/**
 * Creates a Ticket.
 * @param {Number} appId                - The ID of the ticketing application.
 * @param {any} ticket                  - The ticket body
 * @param {TicketCreateOptions} options - The creation options
 */
TDAPI.prototype.createTicket = function (appId, ticket, options) {
  return this.login()
    .then(bearerToken => {
      if (!options) {
        options = {
          EnableNotifyReviewer: false,
          NotifyRequestor: false,
          NotifyResponsible: false,
          AutoAssignResponsibility: false,
          AllowRequestorCreation: false
        };
      }
      return request({
        method: 'POST',
        url: `${this.baseUrl}/${appId}/tickets?` +
          `EnableNotifyReviewer=${options.EnableNotifyReviewer || false}` +
          `&NotifyRequestor=${options.NotifyRequestor || false}` +
          `&NotifyResponsible=${options.NotifyResponsible || false}` +
          `&AutoAssignResponsibility=${options.AutoAssignResponsibility || false}` +
          `&AllowRequestorCreation=${options.AllowRequestorCreation || false}`,
        auth: { bearer: bearerToken },
        json: true,
        body: ticket || {}
      });
    })
    .then(ticket => new Ticket(this, ticket))
    .catch(handleError);
};

/**
 * Gets a Ticket.
 * @param {Number} appId     - The ID of the ticketing application.
 * @param {Number} ticketId  - The ID of the ticket.
 * @returns {Promise<Ticket>} ticket
 */
TDAPI.prototype.getTicket = function (appId, ticketId) {
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
TDAPI.prototype.getTickets = function (appId, searchParams) {
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
      if (Array.isArray(tickets)) {
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
TDAPI.prototype.patchTicket = function (appId, ticketId, patch, notifyNewResponsible) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'PATCH',
        url: `${this.baseUrl}/${appId}/tickets/${ticketId}?notifyNewResponsible=${notifyNewResponsible || false}`,
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
TDAPI.prototype.updateTicket = function (appId, ticketId, feedEntry) {
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
TDAPI.prototype.getTicketTypes = function (appId) {
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
TDAPI.prototype.getTicketStatuses = function (appId) {
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
TDAPI.prototype.getAccounts = function () {
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
      if (Array.isArray(accounts)) {
        return accounts.map(account => new Account(this, account));
      } else {
        return accounts;
      }
    })
    .catch(handleError);
};

/**
 * Gets the account specified by the account ID.
 * @param {Number} id - The ID of the account.
 * @returns {Promise<Account>} account
 */
TDAPI.prototype.getAccount = function (id) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'GET',
        url: `${this.baseUrl}/accounts/${id}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .then(account => new Account(this, account))
    .catch(handleError);
};

/**
 * Creates a new account.
 * @param {Account} account - The account to be created.
 * @returns {Promise<Account>} account
 */
TDAPI.prototype.createAccount = function (account) {
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
TDAPI.prototype.editAccount = function (id, account) {
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
TDAPI.prototype.searchAccounts = function (searchParams) {
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
      if (Array.isArray(accounts)) {
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
TDAPI.prototype.createLocation = function (location) {
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
TDAPI.prototype.getLocation = function (id) {
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
TDAPI.prototype.editLocation = function (id, location) {
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
TDAPI.prototype.createRoom = function (id, room) {
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
TDAPI.prototype.deleteRoom = function (id, roomId) {
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
TDAPI.prototype.editRoom = function (id, roomId, room) {
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
TDAPI.prototype.getLocations = function (searchParams) {
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
TDAPI.prototype.importPeople = function (file) {
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
TDAPI.prototype.getCustomAttributes = function (componentId, associatedTypeId, appId) {
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
TDAPI.prototype.getAssetStatuses = function () {
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
TDAPI.prototype.createAsset = function (asset) {
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
TDAPI.prototype.removeAssetResource = function (assetId, resourceId) {
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
TDAPI.prototype.getAsset = function (id) {
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
TDAPI.prototype.editAsset = function (id, asset) {
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
TDAPI.prototype.getAssetFeedEntries = function (id) {
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
TDAPI.prototype.addAssetFeedEntry = function (id, feedEntry) {
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
TDAPI.prototype.addAssetToTicket = function (id, ticketId) {
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
 * Get assets associated with a ticket.
 * The endpoint also returns additional configuration items.
 * @param {Number} appId  - The associated application ID to get attributes for.
 * @param {Number} ticketId - The ticket ID. This must belong to an application that the user can access.
 * @returns {Promise<Object>} message
 */
TDAPI.prototype.getAssetsFromTicket = function (appId, ticketId) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'GET',
        url: `${this.baseUrl}/${appId}/tickets/${ticketId}/assets`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
}

/**
 * Removes a ticket from an asset.
 * @param {Number} id       - The asset ID.
 * @param {Number} ticketId - The ticket ID. This must belong to an application that the user can access.
 * @returns {Promise<Object>} message
 */
TDAPI.prototype.removeAssetFromTicket = function (id, ticketId) {
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
TDAPI.prototype.getAssetResources = function (id) {
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
TDAPI.prototype.addAssetResource = function (id, resourceId) {
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
TDAPI.prototype.importAssets = function (importData) {
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
TDAPI.prototype.getAssets = function (searchParams) {
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
      if (Array.isArray(assets)) {
        return assets.map(asset => new Asset(this, asset));
      } else {
        return assets;
      }
    })
    .catch(handleError);
};


/**
 * Gets a list of active vendors.
 * @returns {Promise<Vendor[]>}
 */
TDAPI.prototype.getVendors = function () {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'GET',
        url: `${this.baseUrl}/assets/vendors`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};
/**
 * Gets a list of vendors.
 * @param {VendorSearch} query - The searching parameters to use 
 * @returns {Promise<Vendor[]>}
 */
TDAPI.prototype.searchVendors = function (query) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.baseUrl}/assets/vendors/search`,
        auth: { bearer: bearerToken },
        json: true,
        body: query || {}
      });
    })
    .catch(handleError);
};

/**
 * Gets a vendor.
 * @param {Number} id - The vendor ID.
 * @returns {Promise<Vendor>}
 */
TDAPI.prototype.getVendor = function (id) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'GET',
        url: `${this.baseUrl}/assets/vendors/${id}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Creates a new vendor.
 * @param {Vendor} vendor - The vendor to be created.
 * @returns {Promise<Vendor>}
 */
TDAPI.prototype.createVendor = function (vendor) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.baseUrl}/assets/vendors`,
        auth: { bearer: bearerToken },
        json: true,
        body: vendor || {}
      });
    })
    .catch(handleError);
};

/**
 * Gets a list of active product models.
 * @returns {Promise<ProductModel[]>}
 */
TDAPI.prototype.getProductModels = function () {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'GET',
        url: `${this.baseUrl}/assets/models`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Gets the specified product model. 
 * @param {Number} id
 * @returns {Promise<ProductModel>}
 */
TDAPI.prototype.getProductModel = function (id) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'GET',
        url: `${this.baseUrl}/assets/models/${id}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Creates a new product model.
 * @param {ProductModel} productModel
 * @returns {ProductModel} - The new Product Model.
 */
TDAPI.prototype.createProductModel = function (productModel) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.baseUrl}/assets/models`,
        auth: { bearer: bearerToken },
        json: true,
        body: productModel || {}
      });
    })
    .catch(handleError);
};

/**
 * Edits a product model.
 * @param {ProductModel} productModel - The locally edited product model
 * @returns {Promise<ProductModel>} - The updated Product Model in TDx
 */
TDAPI.prototype.editProductModel = function (productModel) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'PUT',
        url: `${this.baseUrl}/assets/models/${productModel.ID}`,
        auth: { bearer: bearerToken },
        json: true,
        body: productModel || {}
      });
    })
    .catch(handleError);
};

/**
 * Gets the choices for the specified custom attribute.
 * @param {Number} id - The ID of the custom attribute. 
 * @returns {Promise<CustomAttributeChoice[]>}
 */
TDAPI.prototype.getCustomAttributeChoices = function (id) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'GET',
        url: `${this.baseUrl}/attributes/${id}/choices`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Adds a new choice to the specified custom attribute.
 * @param {Number} id                                   - The ID of the custom attribute.
 * @param {CustomAttributeChoice} customAttributeChoice - The choice to add to the custom attribute.
 * @returns {Promise<CustomAttributeChoice>}
 */
TDAPI.prototype.addCustomAttributeChoice = function (id, customAttributeChoice) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.baseUrl}/attributes/${id}/choices`,
        auth: { bearer: bearerToken },
        json: true,
        body: customAttributeChoice || {}
      });
    })
    .catch(handleError);
};

/**
 * Removes the specified choice from the custom attribute.
 * @param {Number} id    - The custom attribute ID.
 * @param {any} choiceId - The choice ID.
 * @returns {Promise<Object>} message
 */
TDAPI.prototype.removeCustomAttributeChoice = function (id, choiceId) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'DELETE',
        url: `${this.baseUrl}/attributes/${id}/choices/${choiceId}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Edits an existing choice associated with the specified custom attribute.
 * @param {Number} id                                   - The custom attribute ID.
 * @param {Number} choiceId                             - The choice ID.
 * @param {CustomAttributeChoice} customAttributeChoice - The choice with updated values. 
 * @returns {Promise<CustomAttributeChoice>}
 */
TDAPI.editCustomAttributeChoice = function (id, choiceId, customAttributeChoice) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'PUT',
        url: `${this.baseUrl}/attributes/${id}/${choiceId}`,
        auth: { bearer: bearerToken },
        json: true,
        body: customAttributeChoice || {}
      });
    })
    .catch(handleError);
};

/**
 * Gets the custom attributes for the specified component.
 * @param {Number} componentId        - The component ID.
 * @param {Number} [associatedTypeId] - The associated type ID to get attributes for. For instance, a ticket type ID might be provided here.
 * @param {Number} [appId]            - The associated application ID to get attributes for.
 * @returns {Promise<CustomAttribute[]>}
 */
TDAPI.getCustomAttributes = function (componentId, associatedTypeId, appId) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'GET',
        url: `${this.baseUrl}/attributes/custom?` +
          `componentId=${componentId}` +
          `&associatedTypeId=${associatedTypeId || 0}` +
          `&appId=${appId || 0}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Gets a list of all Report Builder reports visible to the user.
 * @returns {Promise<ReportInfo[]>}
 */
TDAPI.prototype.getReports = function () {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'GET',
        url: `${this.baseUrl}/reports`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Gets information about a report, optionally including data.
 * @param {Number}  id                   - The report ID.
 * @param {Boolean} [withData]           - If true, will populate the returned report's collection of rows.
 * @param {String}  [dataSortExpression] - The sorting expression to use for the report's data. Only applicable when data is being retrieved. When not provided, will fall back to the default used for the report.
 * @returns {Promise<Report>}
 */
TDAPI.prototype.getReport = function (id, withData, dataSortExpression) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'GET',
        url: `${this.baseUrl}/reports/${id}?` +
          `withData=${withData || false}` +
          `&dataSortExpression=${dataSortExpression || ''}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Gets a list of all Report Builder reports visible to the user that match the provided search criteria.
 * @param {Object} reportSearch - The searching parameters to use.
 * @returns {Promise<ReportInfo>}
 */
TDAPI.prototype.searchReports = function (reportSearch) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.baseUrl}/reports/search`,
        auth: { bearer: bearerToken },
        json: true,
        body: reportSearch || {}
      });
    })
    .catch(handleError);
};

/**
 * Gets an attachment.
 * @param {Guid} id - The attachment ID.
 * @returns {Attachment} - The attachment object, if found.
 */
TDAPI.prototype.getAttachment = function (id) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'GET',
        url: `${this.baseUrl}/attachments/${id}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Gets the contents of an attachment.
 * @param {Guid} id - The attachment ID.
 * @returns {Promise<Object>} - The attachment's file contents, if found.
 */
TDAPI.prototype.getAttachmentContents = function (id) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'GET',
        url: `${this.baseUrl}/attachments/${id}/content`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Deletes an attachment.
 * @param {Guid} id - The attachment ID.
 * @returns {Promise<Object>} - A response message indicating if the operation was successful or not.
 */
TDAPI.prototype.deleteAttachment = function (id) {
  return this.login()
    .then(bearerToken => {
      return request({
        method: 'DELETE',
        url: `${this.baseUrl}/attachments/${id}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Gets an article from Knowledge Base.
 * @param {Number} articleID - The article ID.
 * @returns {Promise<Article>}
 */
TDAPI.prototype.getArticle = async function (articleID) {
  try {
    let bearerToken = await this.login();
    let data = await request({
      method: 'GET',
      url: `${this.baseUrl}/knowledgebase/${articleID}`,
      auth: { bearer: bearerToken },
      json: true,
    });

    return new Article(this, data);
  } catch (err) {
    handleError(err);
  }
};

/** 
 * Searches for articles from Knowledge Base.
 * @param {ArticleSearch} searchParams - the search parameters for an article
 * @returns {Promise<Array<Article>>}
 */
TDAPI.prototype.getArticles = async function (searchParams) {
  try {
    let bearerToken = await this.login();
    return request({
      method: 'POST',
      url: `${this.baseUrl}/knowledgebase/search`,
      auth: { bearer: bearerToken },
      json: true,
      body: searchParams || {}
    });
  } catch (err) {
    handleError(err);
  }
};

/**
 * Get a ticket's task
 * @param appId - the ID of the ticket application
 * @param ticketID - ID of the ticket
 * @param taskID - ID of the task
 * 
 * @returns {Promise<Object>}
 */
TDAPI.prototype.getTicketTask = async function (appId, ticketID, taskID) {
  try {
    let bearerToken = await this.login();
    return request({
      method: 'GET',
      url: `${this.baseUrl}/${appId}/tickets/${ticketID}/tasks/${taskID}`,
      auth: { bearer: bearerToken },
      json: true,
    });
  } catch (err) {
    handleError(err);
  }
}

/**
 * Edit a ticket's task
 * @param appId - the ID of the ticket application
 * @param ticketID - ID of the ticket
 * @param taskID - ID of the task
 * @param taskData - data of the edited task
 *
 * @returns {Promise<Object>}
 */
TDAPI.prototype.editTicketTask = async function (appId, ticketID, taskID, taskData) {
  try {
    let bearerToken = await this.login();
    return request({
      method: 'PUT',
      url: `${this.baseUrl}/${appId}/tickets/${ticketID}/tasks/${taskID}`,
      auth: { bearer: bearerToken },
      body: taskData,
      json: true,
    });
  } catch (err) {
    handleError(err);
  }
}

// Generic error handling - TODO: Improve error detail
function handleError(err) {
  return Promise.reject(err);
}

// Check if JWT expired
function tokenExpired(bearerToken) {
  var decodedToken = jwtDecode(bearerToken);
  if (decodedToken.exp) {
    var exp = new Date(decodedToken.exp * 1000); // Convert seconds to ms for Date constructor
    var now = new Date();

    if (exp > now) {
      return false;
    }
  }

  return true;
}

module.exports = TDAPI;
