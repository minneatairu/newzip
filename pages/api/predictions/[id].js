const API_HOST = process.env.REPLICATE_API_HOST || "https://api.replicate.com";
const token = "r8_eec0uWCeOQcCL91CZGzXjqX4qqo6mhP1OsO31";

console.log({ API_HOST });

export default async function handler(req, res) {
  const response = await fetch(`${API_HOST}/v1/predictions/${req.query.id}`, {
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (response.status !== 200) {
    let error = await response.json();
    res.statusCode = 500;
    res.end(JSON.stringify({ detail: error.detail }));
    return;
  }

  const prediction = await response.json();
  res.end(JSON.stringify(prediction));
}
