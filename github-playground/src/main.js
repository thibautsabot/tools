const axios = require("axios");
const access_token = process.env.ACCESS_TOKEN;
const REPO_NAME = process.env.REPO_NAME;

const PAGES = 10;
const BASE_URL = "https://github.schibsted.io/api/v3/repos/" + REPO_NAME;

const getAllPR = async () => {
  const allIds = [];
  try {
    for (i = 0; i != PAGES; i++) {
      const results = await axios(
        `${BASE_URL}/pulls?state=all&page=${i}&access_token=${access_token}`
      );
      results.data.map(res => {
        allIds.push(res.number);
      });
    }
  } catch (e) {
    console.error(e);
  }
  return allIds;
};

const getReviewersFromPR = async () => {
  const allPR = await getAllPR();
  const reviewsArray = {};

  return Promise.all(
    allPR.map(async pr => {
      try {
        const results = await axios(
          `${BASE_URL}/pulls/${pr}/reviews?access_token=${access_token}`
        );
        results.data.map(res => {
          if (reviewsArray[res.user.login]) {
            reviewsArray[res.user.login] = reviewsArray[res.user.login] + 1;
          } else {
            reviewsArray[res.user.login] = 1;
          }
        });
      } catch (e) {
        console.error(e);
      }
    })
  ).then(() => reviewsArray);
};

const sortList = () =>
  getReviewersFromPR().then(list => {
    return Object.keys(list)
      .sort(function(a, b) {
        return list[b] - list[a];
      })
      .map(key => ({
        [key]: list[key]
      }));
  });

sortList().then(finalList => {
  console.log(`Amount of review / pers on the last ${PAGES * 30} PRs : `);
  console.log(finalList);
});