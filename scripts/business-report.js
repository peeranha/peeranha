const fetch = require('cross-fetch');
const fs = require('fs');
const { commentTranslation } = require('./common-action');
const { json } = require('stream/consumers');

const GRAPH_QUERY_URL = 'https://api.peeranha.io/graphql';

async function querySubgraph(query, variables) {
  const response = await fetch(GRAPH_QUERY_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  const resultJson = await response.json();
  return resultJson;
}

const registeredUsersQuery = (start, end) => /* GraphQL */ `
{
    usersConnection(
        filter: { creationTime: { lessThanOrEqualTo: ${end}, greaterThanOrEqualTo:  ${start} } }
        condition: { networkId: 3 }
    ) {
        totalCount
    }
}
`;

const newRepliesQuery = (start, end) => /* GraphQL */ `
{
  repliesConnection(
    filter: {
      postTime: { lessThanOrEqualTo: ${end}, greaterThanOrEqualTo:  ${start} }
      postId: { includes: "3-" }
    }
  ) {
    totalCount
  }
}
`;

const newPostsQuery = (start, end) => /* GraphQL */ `
{
  postsConnection(
    filter: {
      postTime: { lessThanOrEqualTo: ${end}, greaterThanOrEqualTo:  ${start} }
      id: { includes: "3-" }
    }
  ) {
    totalCount
  }
}
`;

const activeUsersQuery = (start, end) => /* GraphQL */ `
  query {
    count_history(where: { timeStamp: "${start}..${end}" })
  }
`;

const ratingDifferenceQuery = (start, end) => /* GraphQL */ `
{
    userreputations (
        filter: {
            timestamp: {
                lessThanOrEqualTo: ${end},
                greaterThanOrEqualTo:  ${start}
            }
        }
    ) {
        difference
    }
}
`;

async function getVoteEvents(cursor) {
  const response = await fetch('https://rpc.mainnet.sui.io', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'suix_queryEvents',
      params: [
        {
          MoveEventType:
            '0xafa3e6b3070c5c5683ea78ca5529758dbf46ddeaca8d4045c6185c48577361ab::postLib::VoteItem',
        },
        cursor,
        100,
      ],
    }),
  });
  if (!response.ok) {
    console.error('Error fetching vote events:', response.statusText);
    console.error('Response:', await response.text());
  }

  const responseObject = await response.json();
  return responseObject.result;
}

async function getCreateCommentEvents(cursor) {
  const response = await fetch('https://rpc-mainnet.suiscan.xyz:443', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'suix_queryEvents',
      params: [
        {
          MoveEventType:
            '0xafa3e6b3070c5c5683ea78ca5529758dbf46ddeaca8d4045c6185c48577361ab::postLib::CreateCommentEvent',
        },
        cursor,
        100,
      ],
    }),
  });
  if (!response.ok) {
    console.error('Error fetching vote events:', response.statusText);
    console.error('Response:', await response.text());
  }

  const responseObject = await response.json();
  return responseObject.result;
}


// async function getVoteEvents(cursor) {
//   const response = await fetch('https://rpc-mainnet.suiscan.xyz:443', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       jsonrpc: '2.0',
//       id: 1,
//       method: 'suix_queryEvents',
//       params: [
//         {
//           MoveEventType:
//             '0xafa3e6b3070c5c5683ea78ca5529758dbf46ddeaca8d4045c6185c48577361ab::postLib::VoteItem',
//         },
//         cursor,
//         100,
//       ],
//     }),
//   });
//   if (!response.ok) {
//     console.error('Error fetching vote events:', response.statusText);
//     console.error('Response:', await response.text());
//   }

//   const responseObject = await response.json();
//   return responseObject.result;
// }

const monthsTimestamps = {
  // 'Nov 2024': 1730419200,
  // 'Dec 2024': 1733011200,
  // 'Jan 2025': 1735689600,
  // 'Feb 2025': 1738368000,
  // 'Mar 2025': 1740787200,
  // 'Apr 2025': 1743465600,
  // 'May 2025': 1746057600,
  'June 2025': 1748736000,
  'July 2025': 1751328000,
  'Aug 2025': 1754006400,
  'Sept 2025': 1759276800,
};
const months = Object.keys(monthsTimestamps);

async function getRegisteredUsers() {
  console.log('**Registered users:**');
  let totalCount = 0;
  for (let i = 0; i < months.length - 1; i += 1) {
    const start = monthsTimestamps[months[i]];
    const end = monthsTimestamps[months[i + 1]];

    const response = await querySubgraph(registeredUsersQuery(start, end));
    const users = response.data.usersConnection.totalCount;

    console.log(
      `${users} users registered from ${months[i]} to ${months[i + 1]}`
    );
    totalCount += users;
  }
  console.log(`**Total registered users**: ${totalCount}`);
}

async function getPosts() {
  console.log('\n**Posts:**');
  let totalCount = 0;
  for (let i = 0; i < months.length - 1; i += 1) {
    const start = monthsTimestamps[months[i]];
    const end = monthsTimestamps[months[i + 1]];
    const response = await querySubgraph(newPostsQuery(start, end));
    const posts = response.data.postsConnection.totalCount;
    console.log(
      `${posts} posts were made from ${months[i]} to ${months[i + 1]}`
    );
    totalCount += posts;
  }
  console.log(`**Total posts**: ${totalCount}`);
}

async function getReplies() {
  console.log('\n**Replies:**');
  let totalCount = 0;
  for (let i = 0; i < months.length - 1; i += 1) {
    const start = monthsTimestamps[months[i]];
    const end = monthsTimestamps[months[i + 1]];
    const response = await querySubgraph(newRepliesQuery(start, end));
    const replies = response.data.repliesConnection.totalCount;
    console.log(
      `${replies} replies were made from ${months[i]} to ${months[i + 1]}`
    );
    totalCount += replies;
  }
  console.log(`**Total replies**: ${totalCount}`);
}

/**
 * OUTDATED
 */
async function getActiveUsers() {
  console.log('\n**Transactions:**');
  for (let i = 0; i < months.length - 1; i += 1) {
    const start = monthsTimestamps[months[i]];
    const end = monthsTimestamps[months[i + 1]];
    const response = await querySubgraph(activeUsersQuery(start, end));
    const trxs = response.data.count_history;
    console.log(
      `${trxs} transactions were made from ${months[i]} to ${months[i + 1]}`
    );
  }
}

async function getUpvoteStats() {
  console.log('\n**Upvote stats:**');
  // let totalCount = 0;
  let cursor = null;
  let events = [];
  let hasNextPage = true;

  const first = monthsTimestamps[months[0]];
  const last = monthsTimestamps[months[months.length - 1]];

  do {
    const response = await getVoteEvents(cursor);
    events.push(
      ...response.data.filter(
        (event) =>
          event.parsedJson.voteDirection === 3 &&
          first <= Math.floor(event.timestampMs / 1000) <= last
      )
    );

    cursor = response.nextCursor;
    console.log('New cursor:', cursor);
    // totalCount += events.length;
    hasNextPage = response.hasNextPage;
  } while (hasNextPage);

  fs.writeFileSync('upvoteEvents.json', JSON.stringify(events, null, 2));

  console.log(`**Total upvotes**: ${events.length}`);
}

async function getDownvoteStats() {
  console.log('\n**downvote stats:**');
  // let totalCount = 0;
  let cursor = null;
  let events = [];
  let hasNextPage = true;

  const first = monthsTimestamps[months[0]];
  const last = monthsTimestamps[months[months.length - 1]];

  do {
    const response = await getVoteEvents(cursor);
    events.push(
      ...response.data.filter(
        (event) =>
          event.parsedJson.voteDirection === 4 &&
          first <= Math.floor(event.timestampMs / 1000) <= last
      )
    );

    cursor = response.nextCursor;
    console.log('New cursor:', cursor);
    // totalCount += events.length;
    hasNextPage = response.hasNextPage;
  } while (hasNextPage);

  fs.writeFileSync('downvoteEvents.json', JSON.stringify(events, null, 2));

  console.log(`**Total downvoteEvents**: ${events.length}`);
}

async function getCancelDownVoteStats() {
  console.log('\n**Cancel Down vote stats:**');
  // let totalCount = 0;
  let cursor = null;
  let events = [];
  let hasNextPage = true;

  const first = monthsTimestamps[months[0]];
  const last = monthsTimestamps[months[months.length - 1]];

  do {
    const response = await getVoteEvents(cursor);
    events.push(
      ...response.data.filter(
        (event) =>
          event.parsedJson.voteDirection === 0 &&
          first <= Math.floor(event.timestampMs / 1000) <= last
      )
    );

    cursor = response.nextCursor;
    console.log('New cursor:', cursor);
    // totalCount += events.length;
    hasNextPage = response.hasNextPage;
  } while (hasNextPage);

  fs.writeFileSync('CancelDownVoteEvents.json', JSON.stringify(events, null, 2));

  console.log(`**Total CancelDownVoteEvents**: ${events.length}`);
}

async function getCancelUpVoteStats() {
  console.log('\n**Cancel Up vote stats:**');
  // let totalCount = 0;
  let cursor = null;
  let events = [];
  let hasNextPage = true;

  const first = monthsTimestamps[months[0]];
  const last = monthsTimestamps[months[months.length - 1]];

  do {
    const response = await getVoteEvents(cursor);
    events.push(
      ...response.data.filter(
        (event) =>
          event.parsedJson.voteDirection === 1 &&
          first <= Math.floor(event.timestampMs / 1000) <= last
      )
    );

    cursor = response.nextCursor;
    console.log('New cursor:', cursor);
    // totalCount += events.length;
    hasNextPage = response.hasNextPage;
  } while (hasNextPage);

  fs.writeFileSync('CancelUpVoteEvents.json', JSON.stringify(events, null, 2));

  console.log(`**Total CancelUpVoteEvents**: ${events.length}`);
}

async function getCreateCommentStats() {
  console.log('\n**Create Comment stats:**');
  // let totalCount = 0;
  let cursor = null;
  let events = [];
  let hasNextPage = true;

  const first = monthsTimestamps[months[0]];
  const last = monthsTimestamps[months[months.length - 1]];

  do {
    const response = await getCreateCommentEvents(cursor);
    events.push(
      ...response.data.filter(
        (event) =>
          event.parsedJson.voteDirection === 1 &&
          first <= Math.floor(event.timestampMs / 1000) <= last
      )
    );

    cursor = response.nextCursor;
    console.log('New cursor:', cursor);
    // totalCount += events.length;
    hasNextPage = response.hasNextPage;
  } while (hasNextPage);

  fs.writeFileSync('CreateCommentEvents.json', JSON.stringify(events, null, 2));

  console.log(`**Total CreateCommentEvents**: ${events.length}`);
}

function getVoteStats(eventName) {
  console.log(`\n**${eventName} stats:**`);
  const data = fs.readFileSync(`${eventName}.json`, 'utf8');
  const events = JSON.parse(data);

  // Prepare month ranges
  const monthNames = Object.keys(monthsTimestamps);
  const monthRanges = [];
  for (let i = 0; i < monthNames.length - 1; i++) {
    monthRanges.push({
      start: monthsTimestamps[monthNames[i]],
      end: monthsTimestamps[monthNames[i + 1]],
      label: `${monthNames[i]} to ${monthNames[i + 1]}`,
    });
  }

  const votesByMonth = Array(monthRanges.length).fill(0);
  for (const event of events) {
    const tsSec = Math.floor(Number(event.timestampMs) / 1000);
    for (let i = 0; i < monthRanges.length; i++) {
      if (tsSec >= monthRanges[i].start && tsSec < monthRanges[i].end) {
        votesByMonth[i]++;
        break;
      }
    }
  }

  for (let i = 0; i < monthRanges.length; i++) {
    console.log(
      `${votesByMonth[i]} votes from ${monthNames[i]} to ${monthNames[i + 1]}`
    );
  }
  console.log(`**Total ${eventName}**: ${events.length}`);
}

// getReplies();
// getPosts();


async function getRatingDifferences() {
  const timestamps = [1748736000, 1751328000, 1754006400];
  let totalCount = 0;
  console.log('**Rating differences:**');
  for (let i = 0; i < months.length - 1; i += 1) {
    const start = monthsTimestamps[months[i]];
    const end = monthsTimestamps[months[i + 1]];

    const response = await querySubgraph(ratingDifferenceQuery(start, end));
    const diff = response.data.userreputations.reduce(
      (sum, rating) => sum + rating.difference,
      0
    );

    console.log(
      `${diff} rating difference from ${timestamps[i]} to ${timestamps[i + 1]}`
    );
    totalCount += diff;
  }
  console.log(`**Total rating difference**: ${totalCount}`);
}

// getRatingDifferences();

getUpvoteStats().then(() => getVoteStats("upvoteEvents"));
// getDownvoteStats().then(() => getVoteStats("downvoteEvents"));
// getCancelDownVoteStats().then(() => getVoteStats("CancelDownVoteEvents"));
// getCancelUpVoteStats().then(() => getVoteStats("CancelUpVoteEvents"));
// getCreateCommentStats();


// getRegisteredUsers().then(() => getPosts())
// .then(() => getActiveUsers());



async function getReplyAuthor(
  objectId,
  index
) {
  const [, replyId] = await getPostAuthor(objectId);

  /*
  const postResponse = await fetch("https://rpc.mainnet.sui.io", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'sui_getObject',
      params: [
        objectId,
        {
          showType: false,
          showOwner: true,
          showPreviousTransaction: false,
          showDisplay: false,
          showContent: true,
          showBcs: false,
          showStorageRebate: false,
        },
      ],
    }),
  });

  const postResponseObject = await postResponse.json();

  // return responseObject.result;
  console.log(JSON.stringify(postResponseObject));


    const fields = postResponseObject.result.data?.content?.fields;
    console.log(JSON.stringify(fields));
    if (!fields) {
      throw new Error(
        `Missing 'fields' in response for post meta data ${postId}.`
      );
    }
    const replyTableId = fields.replies?.fields?.id?.id;
        console.log(JSON.stringify(replyTableId));


  */

  const response = await fetch("https://rpc.mainnet.sui.io", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'suix_getDynamicFieldObject',
      params: [
        replyId,
        {
          type: "u64",
          value: index,
        },
        {
          showType: false,
          showOwner: false,
          showPreviousTransaction: false,
          showDisplay: false,
          showContent: true,
          showBcs: false,
          showStorageRebate: false,
        },
      ],
    }),
  });

  const responseObject = await response.json();

  // console.log(JSON.stringify(responseObject));
  const fields =
      responseObject.result.data?.content?.fields?.value?.fields;
  // console.log(JSON.stringify(replyFields));

  const author = fields.author;
  console.log(`reply author: ${JSON.stringify(author)}`);
  
  return author;
}

async function getPostAuthor(
  objectId
) {
  const postResponse = await fetch("https://rpc.mainnet.sui.io", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'sui_getObject',
      params: [
        objectId,
        {
          showType: false,
          showOwner: true,
          showPreviousTransaction: false,
          showDisplay: false,
          showContent: true,
          showBcs: false,
          showStorageRebate: false,
        },
      ],
    }),
  });

  const postResponseObject = await postResponse.json();

  // return responseObject.result;
  // console.log(JSON.stringify(postResponseObject));


  const fields = postResponseObject.result.data?.content?.fields;
  // console.log(JSON.stringify(fields));
  if (!fields) {
    throw new Error(
      `Missing 'fields' in response for post meta data ${postId}.`
    );
  }
  const replyTableId = fields.replies?.fields?.id?.id;
  const author = fields.author;
  console.log(`reply table id: ${JSON.stringify(replyTableId)}`);
  console.log(`post author: ${JSON.stringify(author)}`);
  return [author, replyTableId];

  // return responseObject.result;
}

async function getAllCancelDownVoteEvents() {
  const data = await fs.readFileSync('CancelDownVoteEvents.json', 'utf8');
  const newData = JSON.parse(data);
  // newData.forEach(event => {
  //   console.log(event); // Выводит каждый объект события
  // });
  console.log(newData[0])
}


// getAllCancelDownVoteEvents();

// getPostAuthor("0xef7d2c129fc9751833309eeb3f657dc1562364988347fdcf803f1f1315168401");
// getReplyAuthor("0xef7d2c129fc9751833309eeb3f657dc1562364988347fdcf803f1f1315168401", "3");


// const testAccount1 = new Map<string, { xbckj: any, eventsCont: number, eventsTargetCount: Map<string, number> }>();


const map = new Map();
const map2 = new Map();
const map3 = new Map();

const map4 = new Map();
const map5 = new Map();

// map.set("c", 3);
// map2.set("d", map);

// map.set("0x2", 1);
// map3.set("0x3", 2);
// map4.set("0x4", 1);
// map5.set("0x5", 1);

// let a = map;
// map2.set("0x1", {
//   targetAdresses
// });

// map2.set("0x2", {
//   targetAdresses: map3
// });

// map2.set("0x2", {
//   targetAdresses:  map2.get("0x2")?.targetAdresses ? map2.get("0x2").targetAdresses.push("0.8") : ["0.8"]
// });
/*
map2.set("0x1", {
  totalEvents: ++map2.get("0x1").totalEvents,
  targetAdresses: map2.get("0x1").targetAdresses.set("0x3", 2)
});

let aa= map2.get("0x1").targetAdresses.get("0x3")
map2.set("0x1", {
  totalEvents: ++map2.get("0x1").totalEvents,
  targetAdresses: map2.get("0x1").targetAdresses.set("0x3", ++aa)
});


aa= map2.get("0x2")?.targetAdresses.get("0x4")
map2.set("0x2", {
  totalEvents: map2.get("0x2")?.totalEvents ? ++map2.get("0x2").totalEvents : 1,
  targetAdresses: map2.get("0x2")?.targetAdresses.set("0x4", aa ? ++aa : 1)
});
*/



/*
aa= map2.get("0x2")?.targetAdresses?.get("0x5")
map2.set("0x2", {
  totalEvents: map2.get("0x2")?.totalEvents ? ++map2.get("0x2").totalEvents : 1,
  targetAdresses: map2.get("0x2")?.targetAdresses ? map2.get("0x2")?.targetAdresses.set("0x5", aa ? ++aa : 1) : new Map([["0x5", aa ? ++aa : 1]])
});

aa= map2.get("0x2")?.targetAdresses?.get("0x5")
map2.set("0x2", {
  totalEvents: map2.get("0x2")?.totalEvents ? ++map2.get("0x2").totalEvents : 1,
  targetAdresses: map2.get("0x2")?.targetAdresses ? map2.get("0x2")?.targetAdresses.set("0x5", aa ? ++aa : 1) : new Map([["0x5", aa ? ++aa : 1]])
});

aa= map2.get("0x2")?.targetAdresses?.get("0x6")
map2.set("0x2", {
  totalEvents: map2.get("0x2")?.totalEvents ? ++map2.get("0x2").totalEvents : 1,
  targetAdresses: map2.get("0x2")?.targetAdresses ? map2.get("0x2")?.targetAdresses.set("0x6", aa ? ++aa : 1) : new Map([["0x6", aa ? ++aa : 1]])
});

aa= map2.get("0x2")?.targetAdresses?.get("0x6")
map2.set("0x2", {
  totalEvents: map2.get("0x2")?.totalEvents ? ++map2.get("0x2").totalEvents : 1,
  targetAdresses: map2.get("0x2")?.targetAdresses ? map2.get("0x2")?.targetAdresses.set("0x6", aa ? ++aa : 1) : new Map([["0x6", aa ? ++aa : 1]])
});

aa= map2.get("0x2")?.targetAdresses?.get("0x6")
map2.set("0x2", {
  totalEvents: map2.get("0x2")?.totalEvents ? ++map2.get("0x2").totalEvents : 1,
  targetAdresses: map2.get("0x2")?.targetAdresses ? map2.get("0x2")?.targetAdresses.set("0x6", aa ? ++aa : 1) : new Map([["0x6", aa ? ++aa : 1]])
});

aa= map2.get("0x1")?.targetAdresses?.get("0x6")
map2.set("0x1", {
  totalEvents: map2.get("0x1")?.totalEvents ? ++map2.get("0x1").totalEvents : 1,
  targetAdresses: map2.get("0x1")?.targetAdresses ? map2.get("0x1")?.targetAdresses.set("0x6", aa ? ++aa : 1) : new Map([["0x6", aa ? ++aa : 1]])
});

*/

// map2.set("0x1", {
//   totalEvents: map2.get("0x1").totalEvents++,
//   targetAdresses: map3
// });





// processCancelDownVoteEvents()
async function processCancelDownVoteEvents() {
  const data = fs.readFileSync('upvoteEvents.json', 'utf8');
  const events = JSON.parse(data);

  for (const event of events) {
    // console.log(JSON.stringify(event))
    const { postMetaDataId, replyMetaDataKey, userId } = event.parsedJson;
    const { timestampMs } = event;
    const startTimestamp = 1754006400000;
    if (timestampMs < startTimestamp) {
      continue;
    }
    console.log(`timestampMs: ${timestampMs}`);
    let author;
    let replyTableId;
    if (replyMetaDataKey === '0') {
      const [postAuthor, _] = await getPostAuthor(postMetaDataId);
      author = postAuthor;
    } else {
      author = await getReplyAuthor(postMetaDataId, replyMetaDataKey);
    }
    console.log(`Author: ${author}, Reply Table ID: ${replyTableId}`);


    aa= map2.get(userId)?.targetAdresses?.get(author)
    map2.set(userId, {
      totalEvents: map2.get(userId)?.totalEvents ? ++map2.get(userId).totalEvents : 1,
      targetAdresses: map2.get(userId)?.targetAdresses ? map2.get(userId)?.targetAdresses.set(author, aa ? ++aa : 1) : new Map([[author, aa ? ++aa : 1]])
    });


  }
  saveMap2ToReportJsonFile();

}

function saveMap2ToReportJsonFile() {
  const obj = Object.fromEntries(
    [...map2.entries()].map(([key, value]) => {
      // value — структура { xbckj, eventsCont, eventsTargetCount: Map }
      // Если внутри value есть еще один Map, сериализуем его тоже
      const serializedValue = { ...value };
      for (const prop in serializedValue) {
        if (serializedValue[prop] instanceof Map) {
          serializedValue[prop] = Object.fromEntries(serializedValue[prop].entries());
        }
      }
      return [key, serializedValue];
    })
  );
  fs.writeFileSync('upvoteEventsReport.json', JSON.stringify(obj, null, 2));
}

// function saveMap2ToReportJsonFile() {
//   const obj = Object.fromEntries(
//     [...map2.entries()].map(([key, value]) => {
//       // value — структура { xbckj, eventsCont, eventsTargetCount: Map }
//       // Если внутри value есть еще один Map, сериализуем его тоже
//       const serializedValue = { ...value };
//       for (const prop in serializedValue) {
//         if (serializedValue[prop] instanceof Map) {
//           serializedValue[prop] = Object.fromEntries(serializedValue[prop].entries());
//         }
//       }
//       console.log(`----- ${value.targetAdresses.size}`);
//       const size = serializedValue.size;
//       return [key, {...serializedValue, count: value.targetAdresses.length}]; // Возвращаем ключ и сериализованное значение
//     })
//   );
//   fs.writeFileSync('CancelDownVoteEventsReport.json', JSON.stringify(obj, null, 2));
// }


// Вызов функции
// saveMap2ToReportJsonFile();

//
