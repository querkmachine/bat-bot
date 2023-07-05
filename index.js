import * as dotenv from "dotenv";
import fs from "node:fs";
import mastodonApi from "mastodon";
import random from "random";

dotenv.config();

const datalist = JSON.parse(fs.readFileSync("./data.json"));
const imageMetadata = random.choice(datalist);
const imageAltText =
  imageMetadata.image_description?.trim() || imageMetadata.common_name?.trim();
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
if (!imageMetadata.image_description) {
  status += `\n\n💬 Suggest alt text: https://github.com/querkmachine/bat-bot/issues/new?labels=image+description&template=image-description.yml&title=Image+description%3A+${encodeURI(
    imageMetadata.file
  )}&filename=${encodeURI(imageMetadata.file)}`;
}

M.post("media", {
  file: imageFile,
  description: imageAltText,
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
