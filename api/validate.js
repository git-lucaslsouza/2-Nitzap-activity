export default function handler(req, res) {
  console.log("✅ /validate called");
  res.status(200).send("Validation success");
}