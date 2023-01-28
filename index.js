require("dotenv").config();
const fs = require("fs");
const Masto = require("mastodon");

const datalist = require("./data.json");
const image = datalist[Date.now() % datalist.length];

console.log(image);

const M = new Masto({
  access_token: process.env.MASTO_ACCESS_TOKEN,
  api_url: process.env.MASTO_API_ENDPOINT,
});

let status += `${image.common_name.trim()} `;
if (image.scientific_name && image.common_name !== image.scientific_name) {
  status += `(${image.scientific_name.trim()}) `;
}
status += `\n\n📸 ${image.attribution.trim()}`;

M.post("media", {
  file: fs.createReadStream("./images/" + image.file),
	description: image.common_name.trim(),
}).then((res) => {
  const id = res.data.id;
  M.post("statuses", {
    status: status,
    media_ids: [id],
  }).then(res => {
		console.log(res.data)
	}).catch(err => {
		console.log(err)
	});
});
