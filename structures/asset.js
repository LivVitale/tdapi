var request = require('request-promise');

/**
 * Asset class
 * @constructor
 * @param {TDAPI}  client
 * @param {Object} properties
 * 
 * @property {Number} ID - The asset ID.
 * @property {Number} ProductModelID - The product model ID.
 * @property {String} ProductModelName - The name of the product model.
 * @property {Number} ManufacturerID - The manufacturer ID.
 * @property {String} ManufacturerName - The name of the manufacturer.
 * @property {Number} SupplierID - The supplier ID.
 * @property {String} SupplierName - The name of the supplier.
 * @property {Number} StatusID - The status ID.
 * @property {String} StatusName - The name of the status.
 * @property {Number} LocationID - The ID of the containing location.
 * @property {String} LocationName - The name of the containing location.
 * @property {Number} LocationRoomID - The ID of the containing room.
 * @property {String} LocationRoomName - The name of the containing room.
 * @property {String} Tag - The asset tag.
 * @property {String} SerialNumber - The serial number.
 * @property {Number} PurchaseCost - The purchase cost.
 * @property {Date} AcquisitionDate - The acquisition date.
 * @property {Date} ExpectedReplacementDate - The expected replacement date.
 * @property {Guid} RequestingCustomerID - The requesting customer ID.
 * @property {String} RequestingCustomerName - The name of the requesting customer.
 * @property {Number} RequestingDepartmentID - The requesting department ID.
 * @property {String} RequestingDepartmentName - The name of the requesting department.
 * @property {Guid} OwningCustomerID - The owning customer ID.
 * @property {String} OwningCustomerName - The name of the owning customer.
 * @property {Number} OwningDepartmentID - The owning department ID.
 * @property {String} OwningDepartmentName - The name of the owning department.
 * @property {Number} ParentID - The ID of the parent asset.
 * @property {String} ParentSerialNumber - The serial number of the parent asset.
 * @property {String} ParentTag - The tag of the parent asset.
 * @property {Number} MaintenanceScheduleID - The ID of the associated maintenance schedule.
 * @property {String} MaintenanceScheduleName - The name of the associated maintenance schedule.
 * @property {Number} ConfigurationItemID - The ID of the associated configuration item record.
 * @property {Date} CreatedDate - The created date.
 * @property {Guid} CreatedUid - The UID of the creator.
 * @property {String} CreatedFullName - The full name of the creator.
 * @property {Date} ModifiedDate - The last modified date.
 * @property {Guid} ModifiedUid - The UID of the last person to modify the asset.
 * @property {String} ModifiedFullName - The full name of the last person to modify the asset.
 * @property {String} ExternalID - The external ID. This value is used to map the asset to its representation in external sources such as third-party CMDBs.
 * @property {CustomAttribute[]} Attributes - The custom attributes associated with the asset.
 * @property {Attachment[]} Attachments - The attachments associated with the asset.
 * @property {String} Uri - The URI to retrieve the individual asset.
 */
function Asset(client, properties) {
  this.client = client;
  Object.defineProperty(this, 'client', { enumerable: false, configurable: false});

  if(properties) this.init(properties);
}

Asset.prototype.init = function(properties) {
  for(var property in properties) {
    this[property] = properties[property];
  }
};

/**
 * Removes a resource from the asset.
 * @param {Number} resourceId - The resource ID.
 * @returns {Promise<Object>} message
 */
Asset.prototype.removeResource = function(resourceId) {
  return this.login()
     .then(bearerToken => {
      return request({
        method: 'DELETE',
        url: `${this.client.baseUrl}/assets/${this.ID}/users/${resourceId}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Updates the asset.
 * @returns {Promise<Asset>}
 */
Asset.prototype.update = function() {
  return this.login()
     .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.client.baseUrl}/assets/${this.ID}`,
        auth: { bearer: bearerToken },
        json: true,
        body: this
      });
    })
    .catch(handleError);
};

/**
 * Gets the feed entries for the asset.
 * @returns {Promise<ItemUpdate>}
 */
Asset.prototype.getFeedEntries = function() {
  return this.login()
     .then(bearerToken => {
      return request({
        method: 'GET',
        url: `${this.client.baseUrl}/assets/${this.ID}/feed`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Adds a comment to the asset.
 * @param {FeedEntry} feedEntry - The item update containing the comment.
 * @returns {Promise<ItemUpdate>}
 */
Asset.prototype.addFeedEntry = function(feedEntry) {
  return this.login()
     .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.client.baseUrl}/assets/${this.ID}/feed`,
        auth: { bearer: bearerToken },
        json: true,
        body: feedEntry
      });
    })
    .catch(handleError);
};

/**
 * Adds the asset to a ticket.
 * @param {Number} ticketId - The ticket ID. This must belong to an application that the user can access.
 * @returns {Promise<Object>} message
 */
Asset.prototype.addToTicket = function(ticketId) {
  return this.login()
     .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.client.baseUrl}/assets/${this.ID}/tickets/${ticketId}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Removes the asset from a ticket.
 * @param {Number} ticketId - The ticket ID. This must belong to an application that the user can access.
 * @returns {Promise<Object>} message
 */
Asset.prototype.removeFromTicket = function(ticketId) {
  return this.login()
     .then(bearerToken => {
      return request({
        method: 'DELETE',
        url: `${this.client.baseUrl}/assets/${this.ID}/tickets/${ticketId}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Gets the asset resources.
 * @returns {Promise<ResourceItem>}
 */
Asset.prototype.getResources = function() {
  return this.login()
     .then(bearerToken => {
      return request({
        method: 'GET',
        url: `${this.client.baseUrl}/assets/${this.ID}/users`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Adds a resource to the asset.
 * @param {Number} resourceId - The resource ID.
 * @returns {Promise<Object>} message
 */
Asset.prototype.addResource = function(resourceId) {
  return this.login()
     .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.client.baseUrl}/assets/${this.ID}/users/${resourceId}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

// Generic error handling - TODO: Improve error detail
function handleError(err) {
  return Promise.reject(err);
}

module.exports = Asset;