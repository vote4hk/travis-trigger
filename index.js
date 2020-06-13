require('dotenv').config();
const Promise = require('bluebird');
const request = Promise.promisifyAll(require('request'));


const main = async () => {
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_REPO_BRANCH;
  const token = process.env.TRAVIS_API_KEY;
  const res = await request.postAsync(
    `https://api.travis-ci.com/repo/${repo}/requests`,
    {
      headers: {
        'Authorization': `token ${token}`,
        'Travis-API-Version': '3'
      },
      json: {
        request: {
          branch: branch || 'master'
        }
      }
    }
  );

  if (res.statusCode >= 400) {
    console.error(res.body);
    throw new Error(res.statusMessage);
  }

  if (res.body.remaining_requests === 0){
    console.error('Error! Requests exceed limit.');
    return;
  }

  console.log(`Trigger build on ${decodeURIComponent(repo)} successfully.`)
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
