/* jslint node: true */
const insecurity = require('../lib/insecurity')
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges

module.exports = (sequelize, { STRING, INTEGER }) => {
  const Feedback = sequelize.define('Feedback', {
    comment: {
      type: STRING,
      set (comment) {
        const sanitizedComment = insecurity.sanitizeHtml(comment)
        this.setDataValue('comment', sanitizedComment)
        if (utils.notSolved(challenges.persistedXssFeedbackChallenge) && utils.contains(sanitizedComment, '<iframe src="javascript:alert(`xss`)">')) {
          utils.solve(challenges.persistedXssFeedbackChallenge)
        }
      }
    },
    rating: {
      type: INTEGER,
      allowNull: false,
      set (rating) {
        // Ideally I think we would want to throw a 400 but I'm not too familiar with this framework
        // so defaulting the rating to 1 if it's less than 0 and for safe measure, defaulting to 5 if greater than 5
        if (rating < 1) {
          rating = 1;
        }
        if (rating > 5) {
          rating = 5;
        }
        this.setDataValue('rating', rating)
        if (utils.notSolved(challenges.zeroStarsChallenge) && rating === 0) {
          utils.solve(challenges.zeroStarsChallenge)
        }
      }
    }
  })

  Feedback.associate = ({ User }) => {
    Feedback.belongsTo(User) // no FK constraint to allow anonymous feedback posts
  }

  return Feedback
}
