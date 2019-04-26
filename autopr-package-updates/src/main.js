const execSync = require("child_process").execSync;
const nodegit = require("nodegit");
const promiseSeries = require("promise-series-node");
const DIR_PATH = "xxxx";
const UPDATE_PATTERN = "redux";
var repo;
var commit;

const getPackagesToUpdate = () =>
  execSync(`ncu --jsonUpgraded -f '/${UPDATE_PATTERN}(.*)/'`, {
    encoding: "utf8"
  });

const updatePackageJson = dep => execSync(`ncu -f '/${dep}(.*)/' -u`);

const updatePackageLock = async dep => {
  execSync(`npm i ${dep}`);
};

const openRepoAndGetHead = async () => {
  process.chdir(DIR_PATH);

  repo = await nodegit.Repository.open(DIR_PATH);
  commit = await repo.getHeadCommit();
};

const checkoutNewBranchFromMaster = async dep => {
  await repo.checkoutBranch("master");
  await repo.createBranch(`update-${dep}`, commit, 0);
  await repo.checkoutBranch(`update-${dep}`);
};

const addChanges = async () => {
  const index = await repo.refreshIndex();
  await index.addByPath("package.json");
  await index.addByPath("package-lock.json");
};

const commitChanges = async dep => {
  const author = nodegit.Signature.now("osef", "osef@gmail.com");
  await repo.createCommitOnHead(
    ["package.json", "package-lock.json"],
    author,
    author,
    `chore(transverse): update-${dep}`
  );
  console.info(`Commit created for: update-${dep}`);
};

const updatePackage = async dep => {
  try {
    await checkoutNewBranchFromMaster(dep);
    await updatePackageJson(dep);
    await updatePackageLock(dep);
    await addChanges();
    await commitChanges(dep);
    // TODO: Create a pull request
  } catch (e) {
    console.error(e);
  }
};

const run = async () => {
  // TODO: clone / pull
  await openRepoAndGetHead();
  const packages = getPackagesToUpdate();

  promiseSeries(
    Object.keys(JSON.parse(packages)).map(dep => () => updatePackage(dep))
  );
};

run();
