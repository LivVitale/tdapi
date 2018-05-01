var request = require('request-promise');
var Ticket = require('./ticket');

/**
 * User class
 * @constructor
 * @param    {TDAPI}    client                   - The TDAPI client the User belongs to.
 * @param    {Object}   properties               - The properties to be initialized on the User object (see: Properties).
 * 
 * @property {Number}   UID                      - The ID of the user.
 * @property {GUID}     BEID                     - The BEID of the user.
 * @property {GUID}     BEIDInt                  - The integer-based BEID of the user.
 * @property {Boolean}  IsActive                 - A value indicating whether the user is active.
 * @property {String}   UserName                 - The username of the user.
 * @property {String}   FullName                 - The full name of the user.
 * @property {String}   FirstName                - The first name of the user.
 * @property {String}   LastName                 - The last name of the user.
 * @property {String}   MiddleName               - The middle name of the user.
 * @property {DateTime} Birthday                 - The user's birthday.
 * @property {String}   Salutation               - The salutation of the user.
 * @property {Number}   DefaultAccountID         - The nickname of the user.
 * @property {String}   DefaultAccountName       - The ID of the default account for the user.
 * @property {String}   PrimaryEmail             - The primary email address for the user.
 * @property {String}   AlternateEmail           - The alternate email address for the user.
 * @property {String}   ExternalID               - The organizational ID for the user.
 * @property {String}   AlternateID              - The alternate ID for the user.
 * @property {Object[]} Applications             - The system-defined (i.e. non-Platform) applications for the user.
 * @property {String}   SecurityRoleName         - The name of the user's global security role.
 * @property {Number}   SecurityRoleID           - The ID of the user's global security role.
 * @property {String[]} Permissions              - The global security role permissions for the user.
 * @property {Object[]} OrgApplications          - The organizationally-defined (i.e. Platform) applications for the user.
 * @property {Number[]} GroupIDs                 - The IDs of the groups to which the user belongs.
 * @property {Number}   ReferenceID              - The interger reference ID for the user.
 * @property {String}   AlertEmail               - The alert email address for the user. System notifications will be sent to this email address.
 * @property {String}   ProfileImageFileName     - The file name of the profile image for the user.
 * @property {String}   Company                  - The name of the user's company.
 * @property {String}   Title                    - The user's title.
 * @property {String}   HomePhone                - The user's home phone number.
 * @property {String}   PrimaryPhone             - The primary phone number for the user. This is a value such as "Work" or "Mobile".
 * @property {String}   WorkPhone                - The user's work phone number.
 * @property {String}   Pager                    - The user's pager number.
 * @property {String}   OtherPhone               - The user's other phone number.
 * @property {String}   MobilePhone              - The user's mobile phone number.
 * @property {String}   Fax                      - The user's fax number.
 * @property {Number}   DefaultPriorityID        - The default priority ID.
 * @property {String}   DefaultPriorityName      - The default priority name.
 * @property {String}   AboutMe                  - The user's "about me".
 * @property {String}   WorkAddress              - The user's work address.
 * @property {String}   WorkCity                 - The work city.
 * @property {String}   WorkState                - The work state.
 * @property {String}   WorkZip                  - The work zip.
 * @property {String}   WorkCountry              - The work country.
 * @property {String}   HomeAddress              - The user's home address.
 * @property {String}   HomeCity                 - The home city.
 * @property {String}   HomeState                - The home state.
 * @property {String}   HomeZip                  - The home zip.
 * @property {String}   HomeCountry              - The home country.
 * @property {Number}   DefaultRate              - The user's default billing rate. This only applies to Users, not Customers. Customers will always have this set to 0.
 * @property {Number}   CostRate                 - The user's cost rate. This only applies to Users, not Customers. Customers will always have this set to 0.
 * @property {Boolean}  IsEmployee               - A value indicating whether or not this user is an employee. This only applies to Users, not Customers. Customers will always have this set to false.
 * @property {Number}   WorkableHours            - The number of workable hours in a work day for the user. This only applies to Users, not Customers. Customers will always have this set to 0.
 * @property {Boolean}  IsCapacityManaged        - A value indicating whether  this user's capacity is managed, meaning they can have capacity and will appear on capacity/availability reports. This only applies to Users, not Customers. Customers will always have this set tp false.
 * @property {DateTime} ReportTimeAfterDate      - The date the user should start reporting time on after. This also governs capacity calaculation. This only applies to Users, not Customers. Customer will always have this set to an empty date.
 * @property {DateTime} EndDate                  - The date the user is no longer available for scheduling and no longer required to log time after. This only applies to Users, not Customers. Customers will always have this set to an empty date.
 * @property {Boolean}  ShouldReportTime         - A value indicating whether the user should report time. This only applies to Users, not Customers. Customers will always have this set to false.
 * @property {String}   ReportsToUID             - The unique identifier of the user this user reports to.
 * @property {String}   ReportsToFullName        - The full name of the user this user reports to.
 * @property {Number}   ResourcePoolID           - The ID of the resource pool this user belongs to. This only applies to Users, not Customers. Customers will always have this set to -1.
 * @property {String}   ResourcePoolName         - The name of the resource pool.
 * @property {Number}   TZID                     - ID of the time zone the user is in.
 * @property {String}   TZName                   - The name of the time zone the user is in.
 * @property {'1'|'2'}  TypeID                   - The type of the user (1 for User, 2 for Customer).
 * @property {String}   AuthenticationUserName   - The authentication username of the user. This username is what will be used when authentication rather than the standard username field. This field only applied to non-TeamDynamix authentication types. This value should be unique across all username and authentication usernames in your organization. If the provided value is not unique, it will be ignored. This only applies to Users, not Customers. Customers will always have this set to an empty string.
 * @property {Number}   AuthenticationProviderID - The authentication provider the user will use to authenticate by its ID. Leave this value blank to specify TeamDynamix or when using SSO authentication. This value can be obtained from the ADmin application Authentication section by one of your organization's administrators who has access to modify authentication settings. If an invalid value is provided, this will use the default authentication provider for the organization. This only applies to Users, not Customers. Customers will always have this set to 0.
 * @property {Object[]} Attributes               - The custom person attributes.
 * @property {Number}   Gender                   - The user's gender.
 * @property {String}   IMProvider               - the instant messenger provider for the user.
 * @property {String}   IMHandle                 - The instant messenger username (or "handle") for the user.
 */
function User(client, properties) {
  this.client = client;
  Object.defineProperty(this, 'client', { enumerable: false, configurable: false });

  if(properties) this.init(properties);
}

User.prototype.init = function(properties) {
  for(var property in properties) {
    this[property] = properties[property];
  }
};

/**
 * Updates the User
 * @returns {Promise<User>} user
 */
User.prototype.update = function() {
  return this.client.login()
    .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.client.baseUrl}/people/${this.UID}`,
        auth: { bearer: bearerToken },
        json: true,
        body: this
      });
    })
    .then(user => new User(this.client, user))
    .catch(handleError);
};

/**
 * Gets the User's functional roles
 * @returns {Promise<Object[]>} functionalRoles
 */
User.prototype.getFunctionalRoles = function() {
  return this.client.login()
    .then(bearerToken => {
      return request({
        method: 'GET',
        url: `${this.client.baseUrl}/people/${this.UID}/functionalroles`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Deletes a functional role from the User account
 * @param {any} roleId
 * @returns {Promise<Object>} message
 */
User.prototype.deleteFunctionalRole = function(roleId) {
  return this.client.login()
    .then(bearerToken => {
      return request({
        method: 'DELETE',
        url: `${this.client.baseUrl}/people/${this.UID}/functionalroles/${roleId}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Gets the User's groups
 * @returns {Promise<Object>} groups
 */
User.prototype.getGroups = function() {
  return this.client.login()
    .then(bearerToken => {
      return request({
        method: 'GET',
        url: `${this.client.baseUrl}/people/${this.UID}/groups`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Adds a group to the User account
 * @param {Boolean} groupId
 * @param {Boolean} [isPrimary=false]
 * @param {Boolean} [isNotified=false]
 * @param {Boolean} [isManager=false]
 * @returns {Promise<Object>} message
 */
User.prototype.addGroup = function(groupId, isPrimary, isNotified, isManager) {
  return this.client.login()
    .then(bearerToken => {
      return request({
        method: 'PUT',
        url: `${this.client.baseUrl}/people/${this.UID}/groups/${groupId}` + 
              `?isPrimary=${isPrimary || false}` +
              `&isNotified=${isNotified || false}` +
              `&isManager=${isManager || false}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Removes a group from the User account
 * @param {any} groupId
 * @returns {Promise<Object>} message
 */
User.prototype.removeGroup = function(groupId) {
  return this.client.login()
    .then(bearerToken => {
      return request({
        method: 'DELETE',
        url: `${this.client.baseUrl}/people/${this.UID}/groups/${groupId}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Sets the User's active status
 * @param {Boolean} status
 * @returns {Promise<Object>} message
 */
User.prototype.setActive = function(status) {
  return this.client.login()
    .then(bearerToken => {
      return request({
        method: 'PUT',
        url: `${this.client.baseUrl}/people/${this.UID}/isactive?status=${status}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Gets Tickets requested by the User
 * @param {any} appId
 * @param {any} searchParams
 * @returns {Promise<Ticket[]>}
 */
User.prototype.getTickets = function(appId, searchParams) {
  return this.client.login()
    .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.client.baseUrl}/${appId}/tickets/search`,
        auth: { bearer: bearerToken },
        json: true,
        body: Object.assign({ RequestorUids: [this.UID] }, searchParams || {})
      });
    })
    .then(tickets => {
      if(Array.isArray(tickets)) {
        return tickets.map(ticket => new Ticket(this.client, ticket));
      }
    })
    .catch(handleError);
};

// Generic error handling - TODO: Improve error detail
function handleError(err) {
  return Promise.reject(err);
}

module.exports = User;