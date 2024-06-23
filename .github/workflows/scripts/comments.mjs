const commentMarker = "<!-- preview image -->";

export async function getImageComment({ github, context }, issueNumber) {
  const { issues } = github.rest;

  const comments = await github.pagination(issues.listComments, {
    issue_number: issueNumber,
    owner: context.repo.owner,
    repo: context.repo.repo,
  });

  return comments.find(({ body }) => !!body?.includes(commentMarker));
}

export async function deleteImageComment({ github, context }, issueNumber) {
  const { issues } = github.rest;

  const comment = await getImageComment({ github, context }, issueNumber);

  if (comment) {
    await issues.deleteComment({
      issue_number: issueNumber,
      owner: context.repo.owner,
      repo: context.repo.repo,
      comment_id: comment.id,
    });
  }
}

export async function postImageComment({ github, context }, issue) {
  const { issues } = github.rest;
  const errors = [];

  console.log(issue);

  const parameters = {
    issue_number: issue.number,
    owner: context.repo.owner,
    repo: context.repo.repo,
  };

  try {
    const fileName = await extractFileNameFromComment(issue.title, issue.body);

    let body = `${commentMarker}`;

    if (fileName) {
      body += `<img alt="Image relating to the suggested image description." width="360" src="https://raw.githubusercontent.com/querkmachine/bat-bot/main/images/${fileName}">\n\n🤖 Beep boop! This should be the image you're suggesting a description for. If it's not, make sure that the file name referenced in your issue is correct.`;
    } else {
      body += `🤖 Beep boop! I couldn't find an image related to your suggestion. Please make sure that the file name referenced in your issue is correct.`;
    }

    const comment = await getImageComment({ github, context }, issue.number);

    await (comment?.id
      ? issues.updateComment({ ...parameters, body, comment_id: comment.id })
      : issues.createComment({ ...parameters, body }));
  } catch (error) {
    errors.push(new Error(error));
  }

  if (errors.length) {
    throw new Error("Failed to run Action", { cause: errors });
  }
}

export async function extractFileNameFromComment(issueTitle, issueBody) {
  // This is stupidly basic, default to looking for the filename in the title...
  let fileName = issueTitle.replace("Image description: ", "");

  // And then try to regex it out of the body
  const regex = new RegExp(/\n\n(.+\.jpg)\n\n/);
  if (issueBody.search(regex) !== -1) {
    fileName = issueBody.match(regex);
  }

  console.log(fileName);

  return fileName;
}
