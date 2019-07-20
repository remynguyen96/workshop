export default (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    name: DataTypes.STRING,
    slug: DataTypes.STRING,
    description: DataTypes.TEXT,
  }, {});
  // Category.associate = function(models) {
    // associations can be defined here
  // };
  return Category;
};
