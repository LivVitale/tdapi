var request = require('request-promise');

/**
 * Article class
 * @constructor
 * @param {TDAPI}  client
 * @param {Object} properties
 *
 * @property {Number} ID - The ID of the article.
 * @property {Number} CategoryID - The ID of the article's category - editable.
 * @property {String} CategoryName - The name of article's category.
 * @property {String} Subject - The subject of the article - required, editable.
 * @property {String} Body - The body of the article - required, editable.
 * @property {Number} Summary - The summary of the article - editable.
 * @property {Number} Status - The status of the article (see https://api.teamdynamix.com/TDWebApi/Home/type/TeamDynamix.Api.KnowledgeBase.ArticleStatus) - required, editable.
 * @property {Number} Attributes - The custom attributes of the article - editable.
 * @property {DateTime} ReviewDateUtc - Review date of the article - editable, nullable.
 * @property {Double} Order - The order of the article. Articles are ordered first by this value and then by the subject - required, editable.
 * @property {Boolean} isPublished - Indicates whether the article is published, editable.
 * @property {Boolean} isPublic - Indicates whether the article is public, editable.
 * @property {Boolean} WhitelistGroups - Indicates whether groups assigned to the article are whitelisted or blacklisted from accessing the article in the Knowledge Base, editable.
 * @property {Boolean} InheritPermissions - Indicates whether permissions are inherited from the parent category, editable.
 * @property {Boolean} NotifyOwner - Indicates whether the owner should be notified of any feedback, editable.
 * @property {Number} RevisionID - The ID of the article's current revision.
 * @property {Number} RevisionNumber - The number of the article's current revision.
 * @property {DateTime} CreatedDate - The created date of the article.
 * @property {Guid} CreatedUid - The UID of the article's creator.
 * @property {String} CreatedFullName - The full name of the article's creator.
 * @property {DateTime} ModifiedDate - The date the article was last modified.
 * @property {Guid} ModifiedUid - The UID of the last user to modify the article.
 * @property {String} ModifiedFullName - The name of the last user to modify the article.
 * @property {Guid} OwnerUid - The UID of the article's owner, editable.
 * @property {String} OwnerFullName - The full name of the article's owner, editable.
 * @property {Guid} OwningGroupID - The ID of the group that owns the article, editable.
 * @property {String} OwningGroupName - The name of the group that owns the article, editable.
 * @property {Array<String>} Tags - The tags associated with the article. Tags are not returned from the search endpoint, editable.
 * @property {Array} Attachments - The article's attachments (see https://api.teamdynamix.com/TDWebApi/Home/type/TeamDynamix.Api.Attachments.Attachment).
 * @property {String} Uri - The URI to retrieve the article.
 */
function Article(client, properties) {
  this.client = client;
  Object.defineProperty(this, 'client', { enumerable: false, configurable: false });

  if (properties) this.init(properties);
}

Article.prototype.init = function (properties) {
  for (var property in properties) {
    this[property] = properties[property];
  }
};

/**
 * Edits the article in TDx.
 * @returns {Promise<Article>}
 */
Article.prototype.update = async function () {
  // console.log(this.ID);
  return this.client.login()
    .then(bearerToken => {
      return request({
        method: 'PUT',
        url: `${this.client.baseUrl}/knowledgebase/${this.ID}`,
        auth: { bearer: bearerToken },
        json: true,
        body: this
      });
    })
    .catch(handleError);
};

/**
 * Gets related articles in TDx.
 * API endpoint returns related articles with the body omitted.
 * @returns {Promise<Array<Article>>}
 */
Article.prototype.getRelated = async function () {
  try {
    let bearerToken = await this.client.login();
    return request({
      method: 'GET',
      url: `${this.client.baseUrl}/knowledgebase/${this.ID}/related`,
      auth: { bearer: bearerToken },
      json: true
    });
  } catch (err) {
    handleError(err);
  }
}

// Generic error handling - TODO: Improve error detail
function handleError(err) {
  return Promise.reject(err);
}

module.exports = Article;
