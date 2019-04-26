const axios = require("axios");
const access_token = process.env.ACCESS_TOKEN;
const API_URL = process.env.API_URL;

const PAGES = 10;

const getAllPR = async () => {
  try {
    for (i = 0; i != PAGES; i++) {
      const results = await axios(
        `${API_URL}/pulls?state=all&page=${i}&access_token=${access_token}`
      );
      return results.data.map(res => res.number);
    }
  } catch (e) {
    console.error(e);
  }
};

const getReviewersFromPR = async () => {
  const allPR = await getAllPR();
  const reviewsArray = {};

  return Promise.all(
    allPR.map(async pr => {
      try {
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
