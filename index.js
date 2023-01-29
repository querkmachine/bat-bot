import * as dotenv from "dotenv";
import fs from "node:fs";
import mastodonApi from "mastodon";
import random from "random";

dotenv.config();

const datalist = JSON.parse(fs.readFileSync("./data.json"));
const imageMetadata = random.choice(datalist);
const imageFile = fs.createReadStream("./images/" + imageMetadata.file);

console.log({ imageMetadata });

const M = new mastodonApi({
  access_token: process.env.MASTO_ACCESS_TOKEN,
  api_url: process.env.MASTO_API_ENDPOINT,
});

let status = `${imageMetadata.common_name.trim()} `;
if (
  imageMetadata.scientific_name &&
  imageMetadata.common_name !== imageMetadata.scientific_name
) {
  status += `(${imageMetadata.scientific_name.trim()}) `;
}
status += `\n\n📸 ${imageMetadata.attribution.trim()}`;

M.post("media", {
  file: imageFile,
  description: imageMetadata.common_name.trim(),
})
  .then((res) => {
    const id = res.data.id;
    M.post("statuses", {
      status: status,
      media_ids: [id],
    })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        throw new Error(err);
      });
  })
  .catch((err) => {
    throw new Error(err);
  });
