export default function handler(req, res) {
  console.log("🛑 /stop called");
  res.status(200).send("Stopped successfully");
}