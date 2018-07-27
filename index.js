
const express = require('express');
const express_graphql = require('express-graphql');
var {buildSchema} =  require('graphql');
const igdb = require('igdb-api-node').default;
const client = igdb();

// GraphQL schema
var schema = buildSchema(`
    type Query {
        course(id:  Int!): Course
        courses(topic: String): [Course]
        getGames(search: String, limit: Int!): [Game]
    },
    type Mutation {
        updateCourseTopic(id: Int!, topic: String!): Course
    },
    type Game {
        Name: String
        slug: String
        summery: String
        Id: Int
        url: String
        coverImageUrl: String            
    },
    type Course {
        id: Int
        title: String
        author: String
        description: String
        topic: String
        url: String
    }
`);

var coursesData = require('./data/courses.json');

var getCourse = function(args) { 
    var id = args.id;
    return coursesData.filter(course => {
        return course.id == id;
    })[0];
}

var getCourses = function(args) {
    if (args.topic) {
        var topic = args.topic;
        return coursesData.filter(course => course.topic === topic);
    } else {
        return coursesData;
    }
}

var updateCourseTopic = function({id, topic}) {
    coursesData.map(course => {
        if (course.id === id) {
            course.topic = topic;
            return course;
        }
    });
    return coursesData.filter(course => course.id === id) [0];
}

var getGames = function ({search, limit}, context, info) { 

    return new Promise((resolve, reject) => {
        client.games({
            fields: [
                'id', 'name', 'slug', 'url', 'summary', 'cover'
            ],
            limit: limit, 
            search: search            
        }).then(response => {                        
            response.body.map(row => {                                
                row.Id = row.id;
                delete row.id;
                row.Name = row.name; 
                delete row.name;
                row.summery = row.summary;
                delete row.summary;
                row.coverImageUrl = row.cover && row.cover.url ? row.cover.url : null ;
                delete row.cover;                                              
                return row;    
            });            
            resolve(response.body)           
            
        }).catch(error => {
            reject(error);
        });
    })
}

// Root resolver
var root = {
    course: getCourse,
    courses: getCourses,
    getGames: getGames,
    updateCourseTopic: updateCourseTopic
};

// Create an express server and a GraphQL endpoint
var app = express();
app.use('/graphql', express_graphql({
    schema: schema,
    rootValue: root,
    graphiql: true
}));

app.listen(4000, () => console.log('Express GraphQL Server Now Running On localhost:4000/graphql'));