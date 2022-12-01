/** Clone from {@link User} module */

const { DataTypes, Model } = require("sequelize");

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
            beforeCreate(instance) {
                instance.setDataValue("password", crypto.createHash("md5")
                    .update(instance.name + instance.password).digest("hex"));
            },
            beforeBulkCreate(instances, options) {
                for (const instance of instances) {
                    instance.setDataValue("password", crypto.createHash("md5")
                        .update(instance.name + instance.password).digest("hex"));
                }
            },
            beforeUpdate(instance) {
                if (instance.changed("name") || instance.changed("password")) {
                    instance.setDataValue("password", crypto.createHash("md5")
                        .update(instance.name + instance.password).digest("hex"));
                }
            },
        }
    });

    return User;
};
