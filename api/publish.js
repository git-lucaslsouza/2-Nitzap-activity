export default function handler(req, res) {
  console.log("🔄 /publish called");
  res.status(200).send("Publish received");
}