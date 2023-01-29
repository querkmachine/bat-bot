import fs from "node:fs";
const data = JSON.parse(fs.readFileSync("./data.json"));

// Ensure that all of the images actually exist
let i = 1;
let failures = 0;
data.forEach((image) => {
  if (!fs.existsSync("./images/" + image.file)) {
    console.error(
      `[${i}/${data.length}] ⚠️ ${image.file}: Image file is missing or misnamed.`
    );
    failures++;
  } else {
    console.log(`[${i}/${data.length}] ${image.file}: Image file OK.`);
  }
  i++;
});

if (failures > 0) {
  throw new Error(`⚠️ ${failures} image(s) could not be verified.`);
} else {
  console.log("✅ All images verified.");
}
