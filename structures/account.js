var request = require('request-promise');

/**
 * Account class
 * @constructor
 * @param    {TDAPI}   client       - The TDAPI client the account belongs to.
 * @param    {Object}  properties   - The properties to be initialized on the Account object (see: Properties).
 * 
 * @property {Number}  ID           - The account/department ID.
 * @property {String}  Name         - The account/department name.
 * @property {Boolean} IsActive     - The active status.
 * @property {String}  Address1     - The first address line.
 * @property {String}  Address2     - The second address line.
 * @property {String}  Address3     - The third address line.
 * @property {String}  Address4     - The fourth address line.
 * @property {String}  City         - The city.
 * @property {String}  StateName    - The name of the state/province.
 * @property {String}  StateAbbr    - The abbreviation of the state/province.
 * @property {String}  PostalCode   - The postal code.
 * @property {String}  Country      - The country.
 * @property {String}  Phone        - The phone number.
 * @property {String}  Fax          - The fax number.
 * @property {String}  Url          - The website URL.
 * @property {String}  Notes        - The account notes.
 * @property {Date}    CreatedDate  - The created date.
 * @property {Date}    ModifiedDate - The last modified date.
 * @property {String}  Code         - The account code.
 * @property {Number}  IndustryID   - The industry ID.
 * @property {String}  IndustryName - The industry name.
 * @property {String}  Domain       - The domain.
 */
function Account(client, properties) {
  this.client = client;
  Object.defineProperty(this, 'client', { enumerable: false, configurable: false});

  if(properties) this.init(properties);
}

Account.prototype.init = function(properties) {
  for(var property in properties) {
    if(validAccountAttributes.indexOf(property) > -1) {
      this[property] = properties[property];
    }
  }
};

/**
 * Edits the account.
 * @returns {Promise<Object>} body
 */
Account.prototype.edit = function() {
  return this.client.login()
    .then(bearerToken => {
      return request({
        method: 'PUT',
        url: `${this.client.baseUrl}/accounts/${this.ID}`,
        auth: { bearer: bearerToken },
        json: true,
        body: this
      });
    })
    .catch(handleError);
};

// Generic error handling - TODO: Improve error detail
function handleError(err) {
  return Promise.reject(err);
}

validAccountAttributes = [
  "ID",
  "Name",
  "IsActive",
  "Address1",
  "Address2",
  "Address3",
  "Address4",
  "City",
  "StateName",
  "StateAbbr",
  "PostalCode",
  "Country",
  "Phone",
  "Fax",
  "Url",
  "Notes",
  "CreatedDate",
  "ModifiedDate",
  "Code",
  "IndustryID",
  "IndustryName",
  "Domain"
];

module.exports = Account;