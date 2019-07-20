# Exercise 3: Implement Categories API
## Step 1: Write tests
- create `test/controllers/categories.test.js`
```javascript
import request from 'supertest';
import app from '../../src/app';

const sampleCategoryData = {
  name: 'Sample Category',
};

describe('Categories controller', () => {
  describe('#create', () => {
    it('creates a category', async () => {
      const response = await request(app).post('/categories').send(sampleCategoryData);
      expect(response.status).toBe(201); // http code 201 -> created
      expect(response.body.name).toEqual(sampleCategoryData.name);
    });
  });

  describe('#index', () => {
    it('shows list of categories', async () => {
      const response = await request(app).get('/categories').send();
      expect(response.statusCode).toBe(200); // http code 200 -> success
      expect(response.body).toBeInstanceOf(Array);
    });
  });

  describe('#show', () => {
    it('shows a category details', async () => {
      const id = 1; // mock it for now
      const response = await request(app).get(`/categories/${id}`).send();
      expect(response.statusCode).toBe(200);
      expect(response.body.id).toEqual(id);
      expect(response.body.name).toEqual('Some name');
    });
  });

  describe('#update', () => {
    it('updates a category', async () => {
      const id = 1; // mock it for now
      const response = await request(app).put(`/categories/${id}`).send({
        name: 'Updated name',
      });
      expect(response.statusCode).toBe(204); // http code 204 -> no content
    });
  });

  describe('#destroy', () => {
    it('deletes a category', async () => {
      const id = 1; // mock it for now
      const response = await request(app).delete(`/categories/${id}`).send();
      expect(response.statusCode).toBe(204);
    });
  });
});
```

- try to run tests (will fail at this step)
```bash
yarn test

yarn run v1.17.3
$ cross-env NODE_ENV=test jest --forceExit
Determining test suites to run...
Syncing test DB...
done!

 PASS  tests/controllers/products.test.js
 FAIL  tests/controllers/categories.test.js
  ● Categories controller › #create › creates a category

    expect(received).toBe(expected) // Object.is equality

    Expected: 201
    Received: 404

      10 |     it('creates a category', async () => {
      11 |       const response = await request(app).post('/categories').send(sampleCategoryData);
    > 12 |       expect(response.status).toBe(201);
         |                               ^
      13 |       expect(response.body.name).toEqual(sampleCategoryData.name);
      14 |     });
      15 |   });

      at Object.toBe (tests/controllers/categories.test.js:12:31)

```

## Step 2: Create the model
- use cli to create the `Category` model
```bash
yarn sql model:generate --name Category --attributes name:string
```
- there will be 2 files created, update them to es6 format (optional)

`db/migrations/{timestamp}-create-category.js`
```javascript
export default {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Categories', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    name: {
      type: Sequelize.STRING,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),
  down: queryInterface => queryInterface.dropTable('Categories'),
};
```

`src/models/category.js`
```javascript
export default (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    name: DataTypes.STRING,
  }, {});
  return Category;
};
```

- run db migration (to create the underlying table)
```bash
yarn sql db:migrate
```

## Step 3: Create controller & routes, update tests
- first, update tests
`tests/controllers/categories.test.js`
```javascript
...
import app from '../../src/app';
// refer to Category model
import models from '../../src/models'; 
const { Category } = models;
...

describe('Categories controller', () => {
  ...
  describe('#show', () => {
    it('shows a category details', async () => {
      // replace mock with real data
      const sample = await Category.create(sampleCategoryData);
      const response = await request(app).get(`/categories/${sample.id}`).send();
      ...
    });
  });
  ...
  describe('#update', () => {
    it('updates a category', async () => {
      // replace mock with real data
      const sample = await Category.create(sampleCategoryData);
      const response = await request(app).put(`/categories/${sample.id}`).send({
        name: 'Updated name',
      });
      ...
    });
  });
  ...
  describe('#destroy', () => {
    it('deletes a category', async () => {
      // replace mock with real data
      const sample = await Category.create(sampleCategoryData);
      const response = await request(app).delete(`/categories/${sample.id}`).send();
      ...
    });
  });
  ...
});

```

- create categories controller
`src/controllers/categories.js`
```javascript
import models from '../models';

const { Product } = models;

export const index = async (req, res, next) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    next(err);
  }
};

export const show = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const product = await Product.findByPk(id);
    if (product) {
      res.json(product);
    } else {
      next(new Error('Product not found'));
    }
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const { name, description, price } = req.body;
    const newProduct = await Product.create({
      name,
      description,
      price,
    });
    res.status(201).json(newProduct);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, description, price } = req.body;
    const [rowsUpdated] = await Product.update({
      name,
      description,
      price,
    }, {
      where: {
        id,
      },
    });
    if (rowsUpdated === 1) {
      res.status(204).end();
    } else {
      next(new Error('No product updated'));
    }
  } catch (err) {
    next(err);
  }
};

export const destroy = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const rowsDestroyed = await Product.destroy({
      where: {
        id,
      },
    });
    if (rowsDestroyed === 1) {
      res.status(204).end();
    } else {
      next(new Error('No product destroyed'));
    }
  } catch (err) {
    next(err);
  }
};

```

- create categories routes
`src/routes/categories.js`
```javascript
import { Router } from 'express';
import {
  index, show, create, update, destroy,
} from '../controllers/categories';

const router = new Router();

router.get('/', index);
router.get('/:id', show);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', destroy);

export default router;
```

- register categories routes
`src/app.js`
```javascript
...
import productsRoutes from './routes/products';
import categoriesRoutes from './routes/categories'; // add this
...
app.use('/products', productsRoutes);
app.use('/categories', categoriesRoutes); // add this
...
```

- try to run tests again (should pass now)
```bash
yarn run v1.17.3
$ cross-env NODE_ENV=test jest --forceExit
Determining test suites to run...
Syncing test DB...
done!

 PASS  tests/controllers/products.test.js
 PASS  tests/controllers/categories.test.js

Test Suites: 2 passed, 2 total
Tests:       10 passed, 10 total
Snapshots:   0 total
Time:        1.832s, estimated 2s
Ran all test suites.
```
## Step 4: Add document
- add `swagger` doc to categories routes
`src/routes/categories.js`
```javascript
...
/**
 * @swagger
 *
 * definitions:
 *  Category:
 *    type: object
 *    properties:
 *      name:
 *        type: string
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     description: Returns categories
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: categories
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Category'
 */
router.get('/', index);

/**
 * @swagger
 * /categories/{id}:
 *  get:
 *    description: Returns a single category
 *    parameters:
 *     - in: path
 *       name: id
 *       schema:
 *         type: string
 *       required: true
 *    produces:
 *     - application/json
 *    responses:
 *      200:
 *        description: category
 *        schema:
 *          $ref: '#/definitions/Category'
 */
router.get('/:id', show);

/**
 * @swagger
 * /categories:
 *   post:
 *     description: Creates a category
 *     parameters:
 *      - name: category
 *        in:  body
 *        type: string
 *        schema:
 *          $ref: '#/definitions/Category'
 *     produces:
 *      - application/json
 *     responses:
 *       201:
 *         description: category
 *         schema:
 *           $ref: '#/definitions/Category'
 */
router.post('/', create);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     description: Update a category
 *     parameters:
 *      - name: id
 *        in: path
 *        schema:
 *          type: string
 *        required: true
 *      - name: product
 *        description: Category object
 *        in:  body
 *        required: true
 *        type: string
 *        schema:
 *          $ref: '#/definitions/Category'
 *     produces:
 *      - application/json
 *     responses:
 *       204:
 *         description: the category was updated
 */
router.put('/:id', update);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     description: Deletes a category
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *     produces:
 *      - application/json
 *     responses:
 *       204:
 *         description: the category was deleted
 */
router.delete('/:id', destroy);
...
```

- go to [document page](http://localhost:3000/api-docs/) to check for the updated docs

# Exercise 4: Include category in product API
## Step 1: Update tests
- edit products tests
`tests/controllers/products.test.js`
```javascript
...
  describe('#show', () => {
    it('shows a product details', async () => {
      ...
      expect(response.body.price).toEqual(sample.price);
      // we are expecting our api result to have this new field
      expect(response.body).toHaveProperty('category');
    });
  });
...
```

- feel free to add more tests if you want!

- try to run tests (will fail)
```bash
yarn test

yarn run v1.17.3
$ cross-env NODE_ENV=test jest --forceExit
Determining test suites to run...
Syncing test DB...
done!

 PASS  tests/controllers/categories.test.js
 FAIL  tests/controllers/products.test.js
  ● Products controller › #show › shows a product details

    expect(received).toHaveProperty(path)

    Expected path: "category"
    Received path: []

    Received value: 9999

      39 |       expect(response.body.description).toEqual(sample.description);
      40 |       expect(response.body.price).toEqual(sample.price);
    > 41 |       expect(response.body).toHaveProperty('category');
         |                                   ^
      42 |     });
      43 |   });
      44 | 

      at Object.toHaveProperty (tests/controllers/products.test.js:41:35)
...
```

## Step 2: Relationship - add foreign key
- use cli to create a new migration
```bash
yarn sql migration:generate --name add-category-id-to-product
```
- edit the migration file
`db/migrations/{timestamp}-add-category-id-to-product.js`
```javascript
export default {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Products', 'categoryId', {
    type: Sequelize.INTEGER,
    references: {
      model: 'Categories',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  }),
  down: queryInterface => queryInterface.removeColumn('Products', 'categoryId'),
};
```

- run the migration
```bash
yarn sql db:migrate
```

- update `Product` model definition to add the new relationship
`src/models/product.js`
```javascript
  ...
  // define the relationship
  Product.associate = (models) => {
    Product.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'category',
    });
  };

  return Product;
```

## Step 3: Update Products controller
- Update `Products` controller to include `category`
`src/controllers/products.js`
```javascript
...
export const index = async (req, res, next) => {
  ...
    // include category from relationship, exclude the native categoryId attribute
    const products = await Product.findAll({
      include: ['category'],
      attributes: { exclude: ['categoryId'] },
    });
  ...
};
...
export const show = async (req, res, next) => {
  ...
    const product = await Product.findByPk(id, {
      include: ['category'],
      attributes: { exclude: ['categoryId'] },
    });
  ...
};
...
export const create = async (req, res, next) => {
  ...
    const {
      name, description, price, categoryId, // handle categoryId parameter
    } = req.body;
    const newProduct = await Product.create({
      name,
      description,
      price,
      categoryId,
    });
  ...
};
...
export const update = async (req, res, next) => {
  ...
    const {
      name, description, price, categoryId, // handle categoryId
    } = req.body;
    const [rowsUpdated] = await Product.update({
      name,
      description,
      price,
      categoryId,
    }, {
      where: {
        id,
      },
    });
  ...
};

```

- rerun the tests (should pass)
```bash
yarn test
```

# Exercise 5: Deploy
## Prepare
- ssh to the server
```bash
ssh user{id}@139.59.221.207
```
Windows users can use [putty](https://www.putty.org/)

we have created 5 users, please use them in turns.
```
- user01/user01
- user02/user02
- user03/user03
- user04/user04
- user05/user05
```

- install `pm2` globally
```bash
yarn global add pm2
```

- create database & database user
```bash
sudo su - postgres psql
# inside postgres shell (you should see postgres=# )
create database your_database; # create database, should be user{id}_db
create user your_user with password your_password; # create the user
grant all privileges on database your_database to your_user; # grant permissions
\q # exit the postgres shell (you should see user{id}@workshop-be001:~$)
```
- clone your repo
```bash
git clone link_to_your_repo your_local_dir # clone your repo
# example: git clone https://github.com/grokking-vietnam/workshop user01_workshop
```
- cd to the server code
```bash
cd your_local_dir/be001
```
- install packages
```bash
yarn
```
- copy database config files and edit it
```bash
cp db/config.example.json db/config.json
vim db/config.job # or use 'nano', fill in the 'production' section with your database & database user
```
- run db migrations, and seeds
```bash
NODE_ENV=production yarn sql db:migrate
NODE_ENV=production yarn sql db:seed:all
```

## Start the server in production mode
- build the source (transpile es6)
```bash
yarn build
```
- start the server in production mode, with a specified port
```bash
NODE_ENV=production PORT=your_port pm2 start dist/index.js --name="API-{id}"
```
the port should be `80{id}`, for example `8001`, and the name should be `API-01`.

you now can access your deployed server through `http://139.59.221.207:your_port`, and use Postman to play with your deployed server

- you can run
```bash
pm2 -h
```
to see list of pm2's command
