const {
  ApolloClient,
  createHttpLink,
  gql,
  InMemoryCache,
} = require('@apollo/client/core');
const fetch = require('node-fetch');
const { setContext } = require('@apollo/client/link/context');
const fs = require('fs');

async function importFilecoinForumData() {
  const httpLink = createHttpLink({
    uri: 'https://api.github.com/graphql',
    fetch: fetch,
  });

  const authLink = setContext((_, { headers }) => {
    const token = process.env.GITHUB_ACCESS_TOKEN;

    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });

  const filecoinDiscussionsCategoriesQuery = `
  query {
    repository(owner: "filecoin-project", name: "community") {
      discussionCategories(first: 10) {
        edges {
          node {
            name
            description
            id
          }
        }
      }
    }
  }
  `;

  const filecoinDiscussionsQuery = `
  query($id: ID!) {
    repository(owner: "filecoin-project", name: "community") {
      discussions(first: 100, categoryId: $id) {
        edges {
          node {
            author {
              login
            }
            category {
              name
              id
            }
            title
            body
            number
            createdAt
            upvoteCount
            comments(first:10) {
              edges {
                node {
                  databaseId
                  author {
                    login
                  }
                  bodyText
                  createdAt
                  upvoteCount
                }
              }
            }
          }
        }
      }
    }
  }
  `;

  const writeDataToFile = (path, data) => {
    fs.writeFile(path, JSON.stringify(data), err => {
      if (err) {
        console.log(err);
      }
    });
  };

  const getDiscussionCategories = async () => {
    const categoriesData = await client.query({
      query: gql(filecoinDiscussionsCategoriesQuery),
    });

    return categoriesData.data.repository.discussionCategories.edges.map(
      DiscussionCategory => ({
        id: DiscussionCategory.node.id,
        name: DiscussionCategory.node.name,
        description: DiscussionCategory.node.description,
      }),
    );
  };

  const saveDiscussionCategories = discussionCategories => {
    writeDataToFile('categories.json', discussionCategories);
  };

  const getDiscussionsByCategory = async categoryId => {
    const forumData = await client.query({
      query: gql(filecoinDiscussionsQuery),
      variables: {
        id: categoryId,
      },
    });

    return forumData.data.repository.discussions.edges;
  };

  const getAllDiscussions = async discussionCategories => {
    const categoriesIds = discussionCategories.map(
      DiscussionCategory => DiscussionCategory.id,
    );
    let discussions = [];

    for (let i = 0; i < categoriesIds.length; i++) {
      const discussionsFromCategory = await getDiscussionsByCategory(
        categoriesIds[i],
      );
      discussions = discussions.concat(discussionsFromCategory);
    }

    return discussions;
  };

  const saveAllDiscussions = discussions => {
    const dataForDiscussionsFile = discussions
      .map(discussion => ({
        id: discussion.node.number,
        author: {
          name: discussion.node.author?.login,
        },
        title: discussion.node.title,
        content: discussion.node.body,
        categories: {
          id: discussion.node.category.id,
        },
        postTime: discussion.node.createdAt,
        postType: 1,
        rating: discussion.node.upvoteCount,
        replies: discussion.node.comments.edges.map(
          comment => comment.node.databaseId,
        ),
      }))
      .filter(discussion => discussion.author.name);

    writeDataToFile('discussions.json', dataForDiscussionsFile);
  };

  const saveAllAnswers = discussions => {
    const dataForAnswersFile = discussions
      .map(discussion =>
        discussion.node.comments.edges.map(comment => ({
          id: comment.node.databaseId,
          author: { name: comment.node.author?.login },
          content: comment.node.bodyText,
          answerTime: comment.node.createdAt,
          rating: comment.node.upvoteCount,
        })),
      )
      .flat(1);

    writeDataToFile('answers.json', dataForAnswersFile);
  };

  const saveAllUsers = discussions => {
    const allUsersFromQuestions = discussions.map(discussion => ({
      name: discussion.node.author?.login,
    }));
    const allUsersFromComments = discussions
      .map(discussion =>
        discussion.node.comments.edges.map(comment => ({
          name: comment.node.author?.login,
        })),
      )
      .flat(1);

    const allUsers = allUsersFromQuestions.concat(allUsersFromComments);

    const allUsersWithoutCopies = allUsers.reduce(function(p, c) {
      if (
        !p.some(function(el) {
          return el.name === c.name;
        })
      )
        p.push(c);
      return p;
    }, []);

    writeDataToFile('users.json', allUsersWithoutCopies);
  };

  const discussionCategories = await getDiscussionCategories();

  saveDiscussionCategories(discussionCategories);

  const allDiscussions = await getAllDiscussions(discussionCategories);

  saveAllDiscussions(allDiscussions);

  saveAllAnswers(allDiscussions);

  saveAllUsers(allDiscussions);
}

importFilecoinForumData();