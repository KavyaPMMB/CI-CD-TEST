import autocannon from "autocannon";

function runLoad(options) {
  return new Promise((resolve, reject) => {
    autocannon(options, (err, result) => {
      if (err) return reject(err);
      return resolve(result);
    });
  });
}

async function main() {
  const baseUrl = process.env.LOAD_BASE_URL || "http://localhost:5000";

  const health = await runLoad({
    url: `${baseUrl}/health`,
    connections: 10,
    duration: 10,
    method: "GET",
  });

  console.log("Health p95 latency:", health.latency.p95, "ms");
  console.log("Health req/sec average:", health.requests.average);

  if (health.errors > 0 || health.timeouts > 0) {
    throw new Error(`Load test failed: errors=${health.errors} timeouts=${health.timeouts}`);
  }

  if (health.requests.average < 20) {
    throw new Error(`Load test throughput too low: ${health.requests.average} req/sec`);
  }

  console.log("Load test passed");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
