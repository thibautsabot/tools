const axios = require("axios");
const access_token = process.env.ACCESS_TOKEN;
const API_URL = process.env.API_URL;
const PAGES = 10;

const start = new Date();
const allIds = [];
const reviewsArray = {};

const fetchIdsFromPage = async i => {
  const results = await axios(
    `${API_URL}/pulls?state=all&page=${i}&access_token=${access_token}`
  );
  results.data.map(res => {
    allIds.push(res.number);
  });
};

const fetchReviewerFormPR = async pr => {
  const results = await axios(
    `${API_URL}/pulls/${pr}/reviews?access_token=${access_token}`
  );
  results.data.map(res => {
    if (reviewsArray[res.user.login]) {
      reviewsArray[res.user.login] = reviewsArray[res.user.login] + 1;
    } else {
      reviewsArray[res.user.login] = 1;
    }
  });
};

const getAllPR = async () => {
  const allReq = [];

  try {
    for (i = 0; i != PAGES; i++) {
      allReq.push(fetchIdsFromPage(i));
    }
    await Promise.all(allReq);
    return allIds;
  } catch (e) {
    console.error(e);
  }
};

const getReviewersFromAllPR = async () => {
  const allPR = await getAllPR();

  try {
    await Promise.all(allPR.map(pr => fetchReviewerFormPR(pr)));
    return reviewsArray;
  } catch (e) {
    console.error(e);
  }
};

const sortList = async () => {
  const list = await getReviewersFromAllPR();
  return Object.keys(list)
    .sort(function(a, b) {
      return list[b] - list[a];
    })
    .map(key => ({
      [key]: list[key]
    }));
};

sortList().then(finalList => {
  console.log(`Amount of review / pers on the last ${PAGES * 30} PRs : `);
  console.log(finalList);
  console.info("Execution time: %dms", new Date() - start);
});
