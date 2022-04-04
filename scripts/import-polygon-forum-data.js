const fetch = require('node-fetch');
const fs = require('fs');

const getQuestionsAndUsers = async() => {
    let users = [];
    const questions = [];

    for (let i = 1; i < 11; i++) {
        const response = await (await fetch(`https://forum.matic.network/latest.json?page=${i}`)).json();

        const newUsers = response.users.map(
            ({id, username}) => ({id, name: username})
        );

        const newQuestions = response.topic_list.topics.map(
            ({id, title, category_id, created_at}) => ({
                id,
                title,
                category: category_id,
                postTime: new Date(created_at).getTime()
            })
        );

        newQuestions.forEach(question => questions.push(question));
        newUsers.forEach(user => users.push(user));
    }

    users = users.filter((value, index, self) =>
        index === self.findIndex((t) => (t.id === value.id))
    );

    return [questions, users];
}

const getAnswers = async(questions) => {
    const questionIds = questions.map(question => question.id);
    const urls = [];

    for (const question of questionIds) {
        const topic = await (await fetch(`https://forum.matic.network/t/${question}.json`)).json();
        topic.post_stream.posts.forEach(({id}) => {
          urls.push(`https://forum.matic.network/posts/${id}.json`)
        });
    }

    const answersList = [];

    for (const url of urls) {
        const post = await (await fetch(url)).json();

        const _rating = post.actions_summary[0] === undefined ? 0 : post.actions_summary[0].count;
        const answer = {
            id: post.id,
            content: post.raw,
            user_id: post.user_id,
            questionId: post.topic_id,
            answerTime: new Date(post.created_at).getTime(),
            rating: _rating
        };
        answersList.push(answer);
    }
    return answersList;
}

const writeCategories = () => {
    fetch('https://forum.matic.network/categories.json')
        .then(res => res.json())
        .then(categories => categories.category_list.categories.map(
            ({id, name, description}) => ({id, name, description})
        ))
        .then(categories => writeFile('categories.json', categories));
}

function writeUsers(users) {
    writeFile('users.json', users);
}

const writeQuestions = (questions, users, answers) => {
    const results = [];
    const postsWithoutQuestions = [];
    for (const question of questions)
    {
        const allReplies = answers.filter(answer => answer.questionId === question.id);
        const authorQuestion = allReplies[0];
        const author = users.find(user => user.id === authorQuestion.user_id);
        const replyIds = allReplies.slice(1).map(reply => reply.id);

        allReplies.slice(1).forEach(reply => postsWithoutQuestions.push(reply));

        const result = {
            id: question.id,
            title: question.title,
            author: {name: author.name},
            content: authorQuestion.content,
            categories: { id: question.category },
            postTime: question.postTime,
            postType: 1,
            rating: authorQuestion.rating,
            replies: replyIds
        };

        results.push(result);
    }

    writeFile('discussions.json', results);
    return postsWithoutQuestions;
}

const writeAnswers = (answers, users) => {
    const results = [];
    for (const answer of answers) {
        const author = users.find(user => user.id === answer.user_id);

        if (author) {
          const result = {
            id: answer.id,
            author: {name: author.name},
            content: answer.content,
            answerTime: answer.answerTime,
            rating: answer.rating
          };

          results.push(result);
        }
    }

    writeFile('answers.json', results);
}

const writeFile = (path, data) => {
    fs.writeFileSync(path, JSON.stringify(data, null, '\t'));
}

const writeData = async() => {
    const questionsAndUsers = await getQuestionsAndUsers();
    const questions = questionsAndUsers[0];
    const users = questionsAndUsers[1];
    console.log('Question and user data has been received');

    let answers = await getAnswers(questions);
    console.log('Answer data has been received')

    writeCategories();
    console.log('Category data has been received and stored');

    writeUsers(users.map(({name}) => ({name})));
    console.log('User data has been stored');

    answers = writeQuestions(questions, users, answers);
    console.log('Question data has been stored');

    writeAnswers(answers, users);
    console.log('Answer data has been stored');
}

writeData().then();
