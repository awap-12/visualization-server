const { DataTypes } = require("sequelize");

/** scope is not require, because we only have two features */

module.exports = sequelize => {
    return sequelize.define("OAuthScope", {
        scope: DataTypes.STRING,
        isDefault: DataTypes.BOOLEAN
    }, {
        tableName: "oauth_scopes",
        timestamps: false,
        underscored: true
    });
}
