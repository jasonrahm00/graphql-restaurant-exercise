var { graphqlHTTP } = require('express-graphql')
var { buildSchema, assertInputType } = require('graphql')
var express = require('express')

// Construct a schema, using GraphQL schema language
var restaurants = [
  {
    id: 1,
    name: 'WoodsHill ',
    description:
      'American cuisine, farm to table, with fresh produce every day',
    dishes: [
      {
        name: 'Swordfish grill',
        price: 27,
      },
      {
        name: 'Roasted Broccily ',
        price: 11,
      },
    ],
  },
  {
    id: 2,
    name: 'Fiorellas',
    description:
      'Italian-American home cooked food with fresh pasta and sauces',
    dishes: [
      {
        name: 'Flatbread',
        price: 14,
      },
      {
        name: 'Carbonara',
        price: 18,
      },
      {
        name: 'Spaghetti',
        price: 19,
      },
    ],
  },
  {
    id: 3,
    name: 'Karma',
    description:
      'Malaysian-Chinese-Japanese fusion, with great bar and bartenders',
    dishes: [
      {
        name: 'Dragon Roll',
        price: 12,
      },
      {
        name: 'Pancake roll ',
        price: 11,
      },
      {
        name: 'Cod cakes',
        price: 13,
      },
    ],
  },
]
var schema = buildSchema(`
type Query{
  restaurant(id: Int): restaurant
  restaurants: [restaurant]
},
type restaurant {
  id: Int
  name: String
  description: String
  dishes:[Dish]
}
type Dish{
  name: String
  price: Int
}
input restaurantInput{
  name: String
  description: String
}
type DeleteResponse{
  ok: Boolean!
}
type Mutation{
  setrestaurant(input: restaurantInput): restaurant
  deleterestaurant(id: Int!): DeleteResponse
  editrestaurant(id: Int!, name: String!): restaurant
}
`)
// The root provides a resolver function for each API endpoint

var root = {
  // Return restaurant based off of provided id
  restaurant: ({ id }) => {
    return restaurants.find((restaurant) => restaurant.id == id)
  },
  // Return all restaurants
  restaurants: () => {
    return restaurants
  },
  // Creates new restaurant
  setrestaurant: ({ input }) => {
    if (restaurants.find((restaurant) => restaurant.name == input.name)) {
      throw new Error('restaurant with that name already exists')
    }
    let newRestaurant = {
      name: input.name,
      description: input.description,
      id: Math.floor(Math.random() * 1000),
    }
    restaurants.push(newRestaurant)
    return newRestaurant
  },
  // Deletes restaurant with provided id
  deleterestaurant: ({ id }) => {
    const ok = Boolean(restaurants.find((restaurant) => restaurant.id == id))
    if (!ok) {
      throw new Error('restaurant with that ID does not exist')
    }
    restaurants = restaurants.filter((restaurant) => restaurant.id !== id)
    return { ok }
  },
  // Updates restaurant with provided id
  editrestaurant: ({ id, ...restaurant }) => {
    let editIndex = restaurants.findIndex((restaurant) => restaurant.id == id)
    if (editIndex < 0) {
      throw new Error('restaurant with that ID does not exist')
    }
    restaurants[editIndex] = { ...restaurants[editIndex], ...restaurant }
    return restaurants[editIndex]
  },
}
var app = express()
app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
)
var port = 5500
app.listen(5500, () => console.log('Running Graphql on Port:' + port))
