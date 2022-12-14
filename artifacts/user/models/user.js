const { DataTypes, Model } = require("sequelize");
const crypto = require("node:crypto");

module.exports = sequelize => {
    class User extends Model {}

    User.init({
        name: {
            type: DataTypes.STRING(32),
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING(32),
            allowNull: false
        },
        scope: {
            type: DataTypes.STRING,
            defaultValue: ''
        }
    }, {
        sequelize,
        tableName: "user",
        timestamps: false,
        hooks: {
            beforeCreate: (instance, options) => {
                instance.setDataValue("password", crypto.createHash("md5")
                    .update(instance.name + instance.password).digest("hex"));
            },
            beforeUpdate: (instance, options) => {
                if (instance.changed("name") || instance.changed("password")) {
                    instance.setDataValue("password", crypto.createHash("md5")
                        .update(instance.name + instance.password).digest("hex"));
                }
            },
        }
    });

    return User;
};
