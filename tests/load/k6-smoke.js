import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:5000";

export const options = {
  vus: 10,
  duration: "10s",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<800"],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/health`);
  check(res, {
    "status is 200": (r) => r.status === 200,
    "body has ok": (r) => {
      try {
        return r.json().ok === true;
      } catch {
        return false;
      }
    },
  });
  sleep(0.05);
}
